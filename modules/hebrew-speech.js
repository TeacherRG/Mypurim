// ===== HEBREW SPEECH RECOGNITION MODULE =====
// Static client-side JS module (no backend required, works on GitHub Pages).
// Captures microphone audio via AudioContext at 16 000 Hz, sends PCM buffers
// to a Web Worker that runs Xenova/whisper-tiny for real-time Hebrew transcription.
//
// Public API (exposed as window.HebrewSpeech):
//   HebrewSpeech.start(options)   – begin listening
//   HebrewSpeech.stop()           – stop listening (keeps worker alive)
//   HebrewSpeech.terminate()      – stop listening and destroy the worker

var HebrewSpeech = (function () {
    'use strict';

    var SAMPLE_RATE    = 16000;          // Hz required by Whisper
    var CHUNK_SECONDS  = 1;              // seconds of audio per inference call
    var CHUNK_SAMPLES  = SAMPLE_RATE * CHUNK_SECONDS;
    var PROCESSOR_SIZE = 4096;           // ScriptProcessorNode buffer size

    var RMS_THRESHOLD  = 0.15;          // soft volume gate (below = silence, skip)
    var FFT_SIZE       = 1024;          // AnalyserNode FFT size
    // First bin index whose centre frequency is ≥ 4 kHz  (formula: freq * FFT_SIZE / sampleRate)
    var HF_BIN_START   = Math.round(4000 * FFT_SIZE / SAMPLE_RATE);
    var HF_RATIO_LIMIT = 0.75;          // if >75 % of spectral energy is above 4 kHz → noise

    var worker                = null;
    var audioContext          = null;
    var mediaStream           = null;
    var scriptProcessor       = null;
    var analyserNode          = null;
    var frequencyData         = null;
    var pcmBuffer             = new Float32Array(0);
    var isReady               = false;
    var isListening           = false;
    var statusCb              = null;
    var transcriptCb          = null;
    var lastAudioChunkSentTime = 0;

    // ── Noise helpers ─────────────────────────────────────────────────────────

    /** Root-mean-square loudness of a Float32Array sample buffer. */
    function calcRms(samples) {
        var sum = 0;
        for (var i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        return Math.sqrt(sum / samples.length);
    }

    /**
     * Returns true when the current AnalyserNode spectrum is dominated by
     * high-frequency content (≥ 4 kHz), which is the fingerprint of
     * squeakers and rattles rather than human speech.
     */
    function isHighFreqNoise() {
        if (!analyserNode) return false;
        analyserNode.getByteFrequencyData(frequencyData);
        var total = 0, hf = 0;
        for (var i = 0; i < frequencyData.length; i++) {
            total += frequencyData[i];
            if (i >= HF_BIN_START) hf += frequencyData[i];
        }
        return total > 0 && (hf / total) > HF_RATIO_LIMIT;
    }

    // ── Worker ────────────────────────────────────────────────────────────────

    function initWorker() {
        if (worker) return;
        worker = new Worker('modules/whisper-worker.js', { type: 'module' });

        worker.onmessage = function (e) {
            var data = e.data;
            if (data.type === 'status') {
                isReady = (data.status === 'ready');
                _notify(data.status);
            } else if (data.type === 'transcript') {
                if (transcriptCb) transcriptCb({ text: data.text, chunks: data.chunks || [], audioChunkSentTime: lastAudioChunkSentTime });
            } else if (data.type === 'error') {
                AppLogger.error('whisper-worker error:', data.message);
                _notify('error');
            }
        };

        worker.onerror = function (e) {
            AppLogger.error('whisper-worker crashed:', e.message);
            isReady = false;
            _notify('error');
        };
    }

    function _notify(status) {
        if (statusCb) statusCb(status);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Start microphone capture and Hebrew recognition.
     * @param {Object}   [options]
     * @param {Function} [options.onStatusChange]  – called with status strings
     * @param {Function} [options.onTranscript]    – called with each transcript
     */
    async function start(options) {
        if (isListening) return;
        options       = options || {};
        statusCb      = options.onStatusChange || null;
        transcriptCb  = options.onTranscript   || null;

        initWorker();

        // Check microphone permission before requesting it
        if (navigator.permissions) {
            try {
                var permStatus = await navigator.permissions.query({ name: 'microphone' });
                if (permStatus.state === 'denied') {
                    AppLogger.error('HebrewSpeech: microphone permission denied');
                    _notify('mic-denied');
                    return;
                }
            } catch (e) {
                // Permissions API query failed – fall through to getUserMedia
            }
        }

        // Request microphone
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (e) {
            AppLogger.error('HebrewSpeech: microphone access denied', e);
            _notify('mic-denied');
            return;
        }

        // AudioContext at exactly 16 000 Hz
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
        var source   = audioContext.createMediaStreamSource(mediaStream);

        // AnalyserNode for real-time spectral noise detection (analysis only, not in audio routing chain)
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = FFT_SIZE;
        frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
        source.connect(analyserNode);

        // Silent gain node — required so ScriptProcessorNode fires without echo
        var silentGain       = audioContext.createGain();
        silentGain.gain.value = 0;

        // ScriptProcessorNode collects raw PCM samples
        scriptProcessor = audioContext.createScriptProcessor(PROCESSOR_SIZE, 1, 1);
        pcmBuffer       = new Float32Array(0);

        scriptProcessor.onaudioprocess = function (e) {
            if (!isListening) return;

            var input  = e.inputBuffer.getChannelData(0);

            // 1. Skip near-silence (soft RMS gate)
            if (calcRms(input) < RMS_THRESHOLD) return;

            // 2. Skip high-frequency noise bursts (squeakers, rattles ≥ 4 kHz)
            //    Flush the accumulation buffer so no noise leaks into the next chunk.
            if (isHighFreqNoise()) {
                pcmBuffer = new Float32Array(0);
                return;
            }

            var merged = new Float32Array(pcmBuffer.length + input.length);
            merged.set(pcmBuffer);
            merged.set(input, pcmBuffer.length);
            pcmBuffer = merged;

            // Send a chunk to the worker once enough audio has accumulated
            if (pcmBuffer.length >= CHUNK_SAMPLES) {
                var chunk = pcmBuffer.slice(0, CHUNK_SAMPLES);
                pcmBuffer = pcmBuffer.slice(CHUNK_SAMPLES);
                if (isReady) {
                    // Transfer the underlying buffer for zero-copy delivery
                    lastAudioChunkSentTime = performance.now();
                    worker.postMessage({ type: 'transcribe', audio: chunk }, [chunk.buffer]);
                }
            }
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(silentGain);
        silentGain.connect(audioContext.destination);

        isListening = true;
        _notify(isReady ? 'listening' : 'loading');
    }

    /** Stop microphone capture (worker and model remain loaded). */
    function stop() {
        isListening = false;
        if (scriptProcessor) {
            scriptProcessor.disconnect();
            scriptProcessor = null;
        }
        if (analyserNode) {
            analyserNode.disconnect();
            analyserNode  = null;
            frequencyData = null;
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(function (t) { t.stop(); });
            mediaStream = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        pcmBuffer = new Float32Array(0);
        _notify('stopped');
    }

    /** Pre-load the Whisper model without starting the microphone. */
    function load(onStatusChange) {
        statusCb = onStatusChange || null;
        initWorker();
    }

    /** Returns true if the Whisper model is loaded and ready. */
    function ready() {
        return isReady;
    }

    /** Stop capture and destroy the worker entirely. */
    function terminate() {
        stop();
        if (worker) {
            worker.terminate();
            worker   = null;
            isReady  = false;
        }
    }

    return {
        start:        start,
        stop:         stop,
        terminate:    terminate,
        load:         load,
        ready:        ready,
    };
})();
