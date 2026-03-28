/**
 * Browser Web Speech API helpers (no API keys — uses device speech engines).
 */

export function getSpeechRecognitionCtor() {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function speakText(text, langKey) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text?.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = langKey === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}
