import React, { useState, useRef, useEffect } from 'react';
import { getSpeechRecognitionCtor, speakText, stopSpeaking } from '../utils/voiceWeb';
import './ChatPage.css';

const ChatPage = () => {
    const defaultEn = "Hello! I'm your AI guide for Jharkhand. How can I help you plan your trip today?";
    const defaultHi = "नमस्ते! मैं झारखंड के लिए आपका एआई गाइड हूं। आज मैं आपकी यात्रा की योजना बनाने में कैसे मदद कर सकता हूं?";

    const [lang, setLang] = useState('en');
    const [messages, setMessages] = useState([
        { text: defaultEn, sender: 'ai', speakable: false }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceRepliesOn, setVoiceRepliesOn] = useState(true);
    const [autoSendVoice, setAutoSendVoice] = useState(true);
    const messagesEndRef = useRef(null);
    const messageCountRef = useRef(0);
    const recognitionRef = useRef(null);

    const suggestions = [
        "Best time to visit", "Top waterfalls", "Wildlife sanctuaries", "Local cuisine"
    ];

    const suggestionsHi = [
        "घूमने का सबसे अच्छा समय", "शीर्ष झरने", "वन्यजीव अभयारण्य", "स्थानीय भोजन"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        window.scrollTo(0, 0);
    }, [messages]);

    useEffect(() => {
        if (!voiceRepliesOn) {
            messageCountRef.current = messages.length;
            return;
        }
        if (messages.length <= messageCountRef.current) {
            messageCountRef.current = messages.length;
            return;
        }
        const last = messages[messages.length - 1];
        messageCountRef.current = messages.length;
        if (last?.sender === 'ai' && last.speakable !== false) {
            speakText(last.text, lang);
        }
    }, [messages, voiceRepliesOn, lang]);

    useEffect(() => {
        return () => {
            stopSpeaking();
            try {
                recognitionRef.current?.abort();
            } catch (_) { /* noop */ }
        };
    }, []);

    const handleLanguageToggle = (selectedLang) => {
        if (lang === selectedLang) return;
        setLang(selectedLang);
        setMessages(prev => [...prev, { text: selectedLang === 'en' ? "Language switched to English." : "भाषा बदलकर हिंदी कर दी गई है।", sender: 'ai', speakable: false }]);
    };

    const handleSend = async (userMsg = input) => {
        if (!userMsg.trim() || isTyping) return;
        setMessages(prev => [...prev, { text: userMsg.trim(), sender: 'user', speakable: false }]);
        setInput('');
        setIsTyping(true);

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setMessages(prev => [...prev, {
                text: lang === 'en'
                    ? "You're offline, so live AI chat needs the internet. You can still use Destinations, Itinerary, Marketplace, and Feedback with saved data."
                    : "आप ऑफ़लाइन हैं, लाइव AI चैट के लिए इंटरनेट चाहिए। डेस्टिनेशन, इटिनररी, मार्केटप्लेस और फ़ीडबैक सेव डेटा के साथ इस्तेमाल कर सकते हैं।",
                sender: 'ai',
                speakable: true
            }]);
            setIsTyping(false);
            return;
        }

        const prompt = `You are a highly helpful and concise AI Travel Guide for Jharkhand Tourism.
You help travelers get all the information they need about Jharkhand (India), including destinations, weather, culture, how to reach, foods, etc.
The user is speaking to you in ${lang === 'en' ? 'English' : 'Hindi'}. 
Answer warmly, naturally, and concisely. Keep it to a few simple sentences. Exclusively talk in ${lang === 'en' ? 'English' : 'Hindi'}. Do NOT use markdown.
User says: "${userMsg.trim()}"`;

        try {
            if (!window.puter) {
                throw new Error("Puter.js not loaded.");
            }
            const resp = await window.puter.ai.chat(prompt);
            const aiReply = resp?.message?.content || (lang === 'en' ? "I'm having trouble thinking right now." : "मुझे सोचने में परेशानी हो रही है।");
            const safeReply = typeof aiReply === 'string' ? aiReply : (aiReply?.text || JSON.stringify(aiReply) || "Error");
            setMessages(prev => [...prev, { text: safeReply.replace(/\*\*/g, '').replace(/\*/g, ''), sender: 'ai', speakable: true }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { text: lang === 'en' ? "Oops! The AI service is not available right now. Please check your connection." : "उफ़! AI सेवा अभी उपलब्ध नहीं है। कृपया अपना कनेक्शन जांचें।", sender: 'ai', speakable: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleVoiceInput = () => {
        stopSpeaking();
        const SpeechRecognition = getSpeechRecognitionCtor();
        if (!SpeechRecognition) {
            alert(lang === 'en' ? "Your browser does not support voice recognition. Try Chrome or Edge." : "आपका ब्राउज़र वॉयस रिकग्निशन का समर्थन नहीं करता। क्रोम या एज आज़माएं।");
            return;
        }

        try {
            recognitionRef.current?.abort();
        } catch (_) { /* noop */ }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = lang === 'en' ? 'en-US' : 'hi-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = (event.results[0][0].transcript || '').trim();
            if (!transcript) return;
            if (autoSendVoice) {
                handleSend(transcript);
            } else {
                setInput(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="chat-page-wrapper">
            <div className="chat-container glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Language Toggle Options Row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', paddingTop: '1rem' }}>
                    <span
                        onClick={() => handleLanguageToggle('en')}
                        style={{ cursor: 'pointer', fontWeight: lang === 'en' ? 'bold' : 'normal', color: lang === 'en' ? 'var(--primary-color)' : 'var(--text-light)', borderBottom: lang === 'en' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '4px', transition: 'all 0.2s ease' }}>
                        English
                    </span>
                    <span
                        onClick={() => handleLanguageToggle('hi')}
                        style={{ cursor: 'pointer', fontWeight: lang === 'hi' ? 'bold' : 'normal', color: lang === 'hi' ? 'var(--primary-color)' : 'var(--text-light)', borderBottom: lang === 'hi' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '4px', transition: 'all 0.2s ease' }}>
                        हिंदी (Hindi)
                    </span>
                </div>

                <div className="chat-header text-center">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.1rem' }}>🤖 AI Travel Guide</h2>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', margin: 0 }}>
                        {lang === 'en' ? "Your personal AI-powered travel assistant for Jharkhand." : "झारखंड के लिए आपका व्यक्तिगत AI यात्रा सहायक।"}
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '1rem',
                            marginTop: '0.75rem',
                            fontSize: '0.78rem',
                            color: 'var(--text-light)'
                        }}
                    >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={voiceRepliesOn}
                                onChange={(e) => {
                                    setVoiceRepliesOn(e.target.checked);
                                    if (!e.target.checked) stopSpeaking();
                                }}
                            />
                            {lang === 'en' ? 'Read replies aloud' : 'जवाब ज़ोर से पढ़ें'}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={autoSendVoice}
                                onChange={(e) => setAutoSendVoice(e.target.checked)}
                            />
                            {lang === 'en' ? 'Send after voice' : 'बोलने के बाद भेजें'}
                        </label>
                    </div>
                </div>

                <div className="chat-body scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`} style={msg.sender === 'ai' ? { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' } : undefined}>
                            <span style={{ flex: 1 }}>{msg.text}</span>
                            {msg.sender === 'ai' && msg.speakable !== false && (
                                <button
                                    type="button"
                                    title={lang === 'en' ? 'Play aloud — Free (device voice)' : 'सुनें'}
                                    onClick={() => speakText(msg.text, lang)}
                                    style={{
                                        flexShrink: 0,
                                        background: 'rgba(255,255,255,0.35)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        lineHeight: 1
                                    }}
                                    aria-label={lang === 'en' ? 'Read message aloud' : 'मैसेज सुनें'}
                                >
                                    🔊
                                </button>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chat-message ai-message" style={{ opacity: 0.7, fontStyle: 'italic' }}>
                            {lang === 'en' ? "Typing..." : "टाइप कर रहा है..."}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>

                    {/* Input Field Row */}
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <button 
                            onClick={handleVoiceInput} 
                            disabled={isTyping || isListening}
                            style={{ 
                                background: isListening ? '#ef4444' : '#f1f5f9', 
                                color: isListening ? 'white' : '#475569', 
                                border: 'none', 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease',
                                boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none'
                            }}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                            </svg>
                        </button>
                        <input
                            type="text"
                            placeholder={isListening ? (lang === 'en' ? "Listening..." : "सुन रहा हूँ...") : (lang === 'en' ? "Ask me anything..." : "मुझसे कुछ भी पूछें...")}
                            className="chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                            style={{ flex: 1, padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                            disabled={isListening}
                        />
                        <button onClick={() => handleSend(input)} disabled={isTyping || isListening} className="btn btn-primary" style={{ padding: '0 1.5rem', borderRadius: '12px', fontSize: '1.1rem', height: '50px' }}>
                            {lang === 'en' ? 'Send' : 'भेजें'}
                        </button>
                    </div>

                    {/* Centered Suggestion Text Links below input */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        marginTop: '0.5rem'
                    }}>
                        {(lang === 'en' ? suggestions : suggestionsHi).map((sugg, idx) => (
                            <span
                                key={idx}
                                onClick={() => handleSend(sugg)}
                                style={{
                                    color: '#555',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#555'}
                            >
                                {sugg}
                            </span>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};
export default ChatPage;
