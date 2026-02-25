// ===== HEBREW SPEECH RECOGNITION MODULE =====
// Static client-side JS module (no backend required, works on GitHub Pages).
// Primary: uses the native Web Speech API (SpeechRecognition) when available —
// zero download, low latency, native Hebrew support in Chrome/Edge/Safari.
// Fallback: captures microphone audio via AudioContext at 16 000 Hz and sends
// PCM buffers to a Web Worker running Xenova/whisper-tiny for transcription.
//
// Public API (exposed as window.HebrewSpeech):
//   HebrewSpeech.start(options)   – begin listening
//   HebrewSpeech.stop()           – stop listening (keeps worker alive)
//   HebrewSpeech.terminate()      – stop listening and destroy the worker
//   HebrewSpeech.load(cb)         – pre-load Whisper model (no-op if SpeechRecognition available)
//   HebrewSpeech.ready()          – true when ready to start listening
//   HebrewSpeech.usesSpeechAPI()  – true when native SpeechRecognition is used

var HebrewSpeech = (function () {
    'use strict';

    // ── Detect native Web Speech API ──────────────────────────────────────────
    var SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    var _useSpeechAPI = !!SpeechRecognitionAPI;

    // ── Whisper-only state ────────────────────────────────────────────────────
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

    // ── Web Speech API state ──────────────────────────────────────────────────
    var recognition     = null;

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

    // ── Web Speech API implementation ─────────────────────────────────────────

    function _startSpeechAPI() {
        recognition = new SpeechRecognitionAPI();
        recognition.lang = 'he-IL';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            isListening = true;
            _notify('listening');
        };

        recognition.onresult = function (event) {
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var text = event.results[i][0].transcript;
                if (text && transcriptCb) transcriptCb(text);
                if (event.results[i].isFinal && text && text.indexOf('המן') !== -1 && Math.random() < 0.5) {
                    _notify('haman');
                }
            }
        };

        recognition.onerror = function (event) {
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                AppLogger.error('HebrewSpeech: microphone permission denied');
                _notify('mic-denied');
                isListening = false;
            } else if (event.error === 'aborted' || event.error === 'no-speech') {
                // non-fatal; onend will restart if still listening
            } else {
                AppLogger.error('HebrewSpeech: SpeechRecognition error', event.error);
                _notify('error');
                isListening = false;
            }
        };

        recognition.onend = function () {
            // Auto-restart for continuous listening
            if (isListening) {
                try { recognition.start(); } catch (e) {
                    AppLogger.warn('HebrewSpeech: SpeechRecognition restart failed', e);
                }
            }
        };

        isListening = true;
        try {
            recognition.start();
        } catch (e) {
            AppLogger.error('HebrewSpeech: SpeechRecognition start failed', e);
            _notify('error');
            isListening = false;
        }
    }

    function _stopSpeechAPI() {
        isListening = false;
        if (recognition) {
            try { recognition.stop(); } catch (e) {
                AppLogger.warn('HebrewSpeech: SpeechRecognition stop failed', e);
            }
            recognition = null;
        }
        _notify('stopped');
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Start microphone capture and Hebrew recognition.
     * Uses native SpeechRecognition when available; falls back to Whisper.
     * @param {Object}   [options]
     * @param {Function} [options.onStatusChange]  – called with status strings
     * @param {Function} [options.onTranscript]    – called with each transcript
     */
    async function start(options) {
        if (isListening) return;
        options       = options || {};
        statusCb      = options.onStatusChange || null;
        transcriptCb  = options.onTranscript   || null;

        if (_useSpeechAPI) {
            _startSpeechAPI();
            return;
        }

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
        if (_useSpeechAPI) {
            _stopSpeechAPI();
            return;
        }
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

    /** Pre-load the Whisper model without starting the microphone.
     *  No-op when the native Web Speech API is used. */
    function load(onStatusChange) {
        if (_useSpeechAPI) {
            if (onStatusChange) onStatusChange('ready');
            return;
        }
        statusCb = onStatusChange || null;
        initWorker();
    }

    /** Returns true when ready to start listening. */
    function ready() {
        if (_useSpeechAPI) return true;
        return isReady;
    }

    /** Stop capture and destroy the worker entirely. */
    function terminate() {
        stop();
        if (!_useSpeechAPI && worker) {
            worker.terminate();
            worker   = null;
            isReady  = false;
        }
    }

    /** Returns true when the native Web Speech API (SpeechRecognition) is used. */
    function usesSpeechAPI() {
        return _useSpeechAPI;
    }

    return {
        start:          start,
        stop:           stop,
        terminate:      terminate,
        load:           load,
        ready:          ready,
        usesSpeechAPI:  usesSpeechAPI,
    };
})();
