import React, { useState, useRef, useEffect } from 'react';
import './AIChatWidget.css';

const AIChatWidget = () => {
    const defaultEn = "Hello! I'm your AI guide for Jharkhand. How can I help you plan your trip today?";
    const defaultHi = "नमस्ते! मैं झारखंड के लिए आपका एआई गाइड हूं। आज मैं आपकी यात्रा की योजना बनाने में कैसे मदद कर सकता हूं?";

    const [isOpen, setIsOpen] = useState(false);
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
    }, [messages, isOpen]);

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
        <div className="ai-chat-widget">
            {isOpen && (
                <div className="ai-chat-window glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>

                    {/* Language Toggle Row */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '10px', paddingBottom: '5px' }}>
                        <span
                            onClick={() => handleLanguageToggle('en')}
                            style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: lang === 'en' ? 'bold' : 'normal', color: lang === 'en' ? 'var(--primary-color)' : 'var(--text-light)', borderBottom: lang === 'en' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '2px', transition: 'all 0.2s ease' }}>
                            English
                        </span>
                        <span
                            onClick={() => handleLanguageToggle('hi')}
                            style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: lang === 'hi' ? 'bold' : 'normal', color: lang === 'hi' ? 'var(--primary-color)' : 'var(--text-light)', borderBottom: lang === 'hi' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '2px', transition: 'all 0.2s ease' }}>
                            हिंदी (Hindi)
                        </span>
                    </div>

                    <div className="ai-chat-header" style={{ position: 'relative', paddingBottom: '10px' }}>
                        <h4 style={{ margin: 0, textAlign: 'center', width: '100%' }}>🤖 AI Guide</h4>
                        <button onClick={() => setIsOpen(false)} className="close-btn" style={{ position: 'absolute', top: '-15px', right: '10px' }}>&times;</button>
                    </div>

                    <div className="ai-chat-body" style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-footer" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                        {/* Input Row */}
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                                type="text"
                                placeholder={lang === 'en' ? "Ask me anything..." : "मुझसे पूछें..."}
                                className="ai-chat-input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <button onClick={() => handleSend(input)} className="ai-chat-send btn-primary" style={{ padding: '0 1rem', borderRadius: '8px' }}>
                                {lang === 'en' ? 'Send' : 'भेजें'}
                            </button>
                        </div>

                        {/* Text Link Suggestions */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            {(lang === 'en' ? suggestions : suggestionsHi).map((sugg, idx) => (
                                <span
                                    key={idx}
                                    onClick={() => handleSend(sugg)}
                                    style={{
                                        color: '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'color 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                                >
                                    {sugg}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>
            )}
            <button className="ai-trigger-btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close' : 'Chat with AI ✨'}
            </button>
        </div>
    );
};
export default AIChatWidget;
