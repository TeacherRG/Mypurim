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
    var CHUNK_SECONDS  = 5;              // seconds of audio per inference call
    var CHUNK_SAMPLES  = SAMPLE_RATE * CHUNK_SECONDS;
    var PROCESSOR_SIZE = 4096;           // ScriptProcessorNode buffer size
    var NOISE_THRESHOLD = 0.4;           // RMS threshold above which audio is considered noise

    var worker          = null;
    var audioContext    = null;
    var mediaStream     = null;
    var scriptProcessor = null;
    var pcmBuffer       = new Float32Array(0);
    var isReady         = false;
    var isListening     = false;
    var statusCb        = null;
    var transcriptCb    = null;
    var hamanPauseUntil = 0;             // timestamp (ms) until which processing is paused for Haman

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
                if (data.text && data.text.indexOf('המן') !== -1 && Math.random() < 0.5) {
                    hamanPauseUntil = Date.now() + 5000;
                    _notify('haman');
                }
                if (transcriptCb) transcriptCb(data.text);
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

        // Silent gain node — required so ScriptProcessorNode fires without echo
        var silentGain       = audioContext.createGain();
        silentGain.gain.value = 0;

        // ScriptProcessorNode collects raw PCM samples
        scriptProcessor = audioContext.createScriptProcessor(PROCESSOR_SIZE, 1, 1);
        pcmBuffer       = new Float32Array(0);

        scriptProcessor.onaudioprocess = function (e) {
            if (!isListening) return;

            var input  = e.inputBuffer.getChannelData(0);

            // RMS noise detection — block sending to worker when too loud
            var sum = 0;
            for (var k = 0; k < input.length; k++) { sum += input[k] * input[k]; }
            var rms = Math.sqrt(sum / input.length);
            if (rms > NOISE_THRESHOLD) {
                _notify('ШУМ');
                return;
            }

            // Haman pause — wait for rattles before resuming processing
            if (Date.now() < hamanPauseUntil) {
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
