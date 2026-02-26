// ===== HEBREW SPEECH RECOGNITION MODULE =====
// Static client-side JS module (no backend required, works on GitHub Pages).
// Uses the browser's built-in Web Speech API for real-time Hebrew transcription.
//
// Public API (exposed as window.HebrewSpeech):
//   HebrewSpeech.start(options)   – begin listening
//   HebrewSpeech.stop()           – stop listening
//   HebrewSpeech.terminate()      – stop listening (alias for stop)

var HebrewSpeech = (function () {
    'use strict';

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    var recognition  = null;
    var isListening  = false;
    var statusCb     = null;
    var transcriptCb = null;

    function _notify(status) {
        if (statusCb) statusCb(status);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Start Hebrew speech recognition.
     * @param {Object}   [options]
     * @param {Function} [options.onStatusChange]  – called with status strings
     * @param {Function} [options.onTranscript]    – called with { text } on each result
     */
    function start(options) {
        if (isListening) return;
        options      = options || {};
        statusCb     = options.onStatusChange || null;
        transcriptCb = options.onTranscript   || null;

        if (!SpeechRecognition) {
            _notify('not-supported');
            return;
        }

        recognition              = new SpeechRecognition();
        recognition.lang         = 'he-IL';
        recognition.continuous   = true;
        recognition.interimResults = true;

        recognition.onstart = function () {
            isListening = true;
            _notify('listening');
        };

        recognition.onresult = function (e) {
            // Process only the newest result (interim or final) for instant highlighting
            var idx = e.results.length - 1;
            var transcript = e.results[idx][0].transcript;
            if (transcript.trim() && transcriptCb) {
                transcriptCb({ text: transcript });
            }
        };

        recognition.onerror = function (e) {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                _notify('mic-denied');
            } else if (e.error === 'no-speech') {
                // Ignore no-speech: recognition will auto-restart via onend
            } else {
                AppLogger.error('HebrewSpeech error:', e.error);
                _notify('error');
            }
        };

        recognition.onend = function () {
            // Auto-restart so continuous listening survives short pauses
            if (isListening) {
                try { recognition.start(); } catch (err) {
                    // 'start' can throw if recognition is already active; safe to ignore
                    AppLogger.error('HebrewSpeech: restart failed', err);
                }
            } else {
                _notify('stopped');
            }
        };

        try {
            recognition.start();
        } catch (e) {
            AppLogger.error('HebrewSpeech: start failed', e);
            _notify('error');
        }
    }

    /** Stop speech recognition. */
    function stop() {
        isListening = false;
        if (recognition) {
            try { recognition.stop(); } catch (e) {
                // 'stop' can throw if recognition has already ended; safe to ignore
            }
            recognition = null;
        }
        _notify('stopped');
    }

    /** Stop speech recognition (alias for stop). */
    function terminate() {
        stop();
    }

    /** No-op: Web Speech API needs no pre-loading. Calls back with 'ready'. */
    function load(onStatusChange) {
        if (onStatusChange) onStatusChange('ready');
    }

    /** Returns true if the Web Speech API is available in this browser. */
    function ready() {
        return !!SpeechRecognition;
    }

    return {
        start:     start,
        stop:      stop,
        terminate: terminate,
        load:      load,
        ready:     ready,
    };
})();
