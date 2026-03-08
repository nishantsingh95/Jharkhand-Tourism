import React, { useState, useRef, useEffect } from 'react';
import './ChatPage.css';

const ChatPage = () => {
    const defaultEn = "Hello! I'm your AI guide for Jharkhand. How can I help you plan your trip today?";
    const defaultHi = "नमस्ते! मैं झारखंड के लिए आपका एआई गाइड हूं। आज मैं आपकी यात्रा की योजना बनाने में कैसे मदद कर सकता हूं?";

    const [lang, setLang] = useState('en');
    const [messages, setMessages] = useState([
        { text: defaultEn, sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

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

    const handleLanguageToggle = (selectedLang) => {
        if (lang === selectedLang) return;
        setLang(selectedLang);
        setMessages(prev => [...prev, { text: selectedLang === 'en' ? "Language switched to English." : "भाषा बदलकर हिंदी कर दी गई है।", sender: 'ai' }]);
    };

    const handleSend = (userMsg = input) => {
        if (!userMsg.trim()) return;
        setMessages(prev => [...prev, { text: userMsg.trim(), sender: 'user' }]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            let aiTextEn = "That sounds exciting! I can help you with that. Would you like me to suggest some popular destinations or a specific itinerary based on your interests?";
            let aiTextHi = "यह रोमांचक लग रहा है! मैं इसमें आपकी मदद कर सकता हूं। क्या आप चाहेंगे कि मैं आपकी रुचियों के आधार पर कुछ लोकप्रिय गंतव्यों या एक विशिष्ट यात्रा कार्यक्रम का सुझाव दूं?";

            const lower = userMsg.toLowerCase();

            if (lower.includes('time to visit') || lower.includes('समय')) {
                aiTextEn = "The best time to visit Jharkhand is between October and March when the weather is pleasant and comfortable for sightseeing!";
                aiTextHi = "झारखंड घूमने का सबसे अच्छा समय अक्टूबर से मार्च के बीच है जब मौसम सुहावना और दर्शनीय स्थलों की यात्रा के लिए आरामदायक होता है!";
            } else if (lower.includes('waterfall') || lower.includes('झरने')) {
                aiTextEn = "Jharkhand is the land of waterfalls! You must visit Hundru Falls, Dassam Falls, Jonha Falls, and Lodh Falls.";
                aiTextHi = "झारखंड झरनों की भूमि है! आपको हुंडरू जलप्रपात, दशम जलप्रपात, जोन्हा जलप्रपात और लोध जलप्रपात अवश्य देखना चाहिए।";
            } else if (lower.includes('wildlife') || lower.includes('अभयारण्य')) {
                aiTextEn = "For wildlife, Betla National Park and Dalma Wildlife Sanctuary are excellent choices to see elephants, tigers, and exotic birds.";
                aiTextHi = "वन्यजीवों के लिए, हाथियों, बाघों और विदेशी पक्षियों को देखने के लिए बेतला राष्ट्रीय उद्यान और दलमा वन्यजीव अभयारण्य बेहतरीन विकल्प हैं।";
            } else if (lower.includes('cuisine') || lower.includes('भोजन') || lower.includes('food')) {
                aiTextEn = "You must try local delicacies like Litti Chokha, Chilka Roti, Dhuska, and Handia. They are an essential part of the Jharkhand experience!";
                aiTextHi = "आपको लिट्टी चोखा, छिलका रोटी, धुस्का और हंडिया जैसे स्थानीय व्यंजनों का स्वाद अवश्य लेना चाहिए। वे झारखंड अनुभव का एक अनिवार्य हिस्सा हैं!";
            } else if (lower.includes('itinerary') || lower.includes('plan')) {
                aiTextEn = "To build a custom itinerary, head over to our 'Itinerary' page! You can select your days, budget, and interests.";
                aiTextHi = "एक कस्टम यात्रा कार्यक्रम बनाने के लिए, हमारे 'Itinerary' पेज पर जाएं! आप अपने दिन, बजट और रुचियों का चयन कर सकते हैं।";
            } else if (lower.includes('hotel') || lower.includes('stay')) {
                aiTextEn = "You can book premium hotels and authentic homestays directly from our 'Marketplace' page.";
                aiTextHi = "आप हमारे 'Marketplace' पेज से प्रीमियम होटल और प्रामाणिक होमस्टे सीधे बुक कर सकते हैं।";
            }

            const finalResponse = lang === 'en' ? aiTextEn : aiTextHi;
            setMessages(prev => [...prev, { text: finalResponse, sender: 'ai' }]);
        }, 1000);
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
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>🤖 AI Travel Guide</h2>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', margin: 0 }}>
                        {lang === 'en' ? "Your personal assistant for exploring Jharkhand." : "झारखंड की खोज के लिए आपका निजी सहायक।"}
                    </p>
                </div>

                <div className="chat-body scrollbar-hide" style={{ height: '55vh', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                            {msg.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>

                    {/* Input Field Row */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder={lang === 'en' ? "Ask me anything..." : "मुझसे कुछ भी पूछें..."}
                            className="chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                            style={{ flex: 1 }}
                        />
                        <button onClick={() => handleSend(input)} className="btn btn-primary" style={{ padding: '0 2rem', borderRadius: '12px', fontSize: '1.1rem' }}>
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
