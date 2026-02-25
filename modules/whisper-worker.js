// ===== WHISPER WEB WORKER =====
// Loads Xenova/whisper-tiny via @xenova/transformers CDN and transcribes
// Float32Array audio buffers (16 000 Hz, mono) into Hebrew text.
// Runs inside a Web Worker (type: 'module') to avoid blocking the Main Thread.

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Only use remote (Hugging Face Hub) models — no local files needed.
env.allowLocalModels  = false;
env.allowRemoteModels = true;

let transcriber = null;

async function loadModel() {
    self.postMessage({ type: 'status', status: 'loading' });
    try {
        transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-tiny',
            { language: 'hebrew', task: 'transcribe' }
        );
        self.postMessage({ type: 'status', status: 'ready' });
    } catch (e) {
        self.postMessage({ type: 'error', message: e.message });
    }
}

self.onmessage = async function (event) {
    const { type, audio } = event.data;

    if (type === 'load') {
        await loadModel();
        return;
    }

    if (type === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ type: 'error', message: 'Model not loaded yet' });
            return;
        }
        try {
            const result = await transcriber(audio, {
                language: 'hebrew',
                task: 'transcribe',
            });
            self.postMessage({ type: 'transcript', text: result.text });
        } catch (e) {
            self.postMessage({ type: 'error', message: e.message });
        }
    }
};

// Begin downloading the model as soon as the worker starts.
loadModel();
