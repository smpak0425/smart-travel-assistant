import React, { useState } from 'react';
import { translateText } from '../../services/translate';

function DiningCard({ data }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [loadingTranslate, setLoadingTranslate] = useState(false);

    if (!data) return null;

    const langCode = data.phrase?.langCode || 'en';
    const bcp47 = langCode.includes('-') ? langCode : `${langCode}-${langCode.toUpperCase()}`;

    const speakPhrase = (text) => {
        if ('speechSynthesis' in window) {
            setIsPlaying(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = bcp47;
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('이 브라우저는 음성 스피커 기능을 지원하지 않습니다.');
        }
    };

    const handleTranslate = async () => {
        if (!inputText) return;
        setLoadingTranslate(true);
        const result = await translateText(inputText, langCode);
        setTranslatedText(result);
        setLoadingTranslate(false);
    };

    return (
        <div className="timeline-item">
            <div className="timeline-branch"></div>
            <div className="item-header">
                <span className="time-label highlight-orange">주변 식당 추천</span>
            </div>

            <div className="card timeline-card overflow-hidden border-medium no-padding pb-4">
                <div className="card-hero bg-img-ramen">
                    <div className="gradient-overlay" />
                    <div className="rating-badge cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.title)}`, '_blank')}>
                        <span className="material-symbols-outlined star-icon">star</span> AI 평점
                    </div>
                    <div className="hero-text-container">
                        <h3 className="hero-title">{data.title}</h3>
                        <p className="hero-subtitle">
                            <span className="material-symbols-outlined icon-small">restaurant</span> Gemini 추천 식당
                        </p>
                    </div>
                </div>

                <div className="card-pad mt-2 space-y-md">
                    <div>
                        <p className="section-label">AI 추천 옵션 (Gemini 분석)</p>
                        <div className="pill-row wrap">
                            {data.items && data.items.map((item, idx) => (
                                <span key={idx} className={idx === 0 ? "pill pill-primary" : "pill pill-gray"}>{item}</span>
                            ))}
                        </div>
                    </div>

                    {data.phrase && (
                        <div className="sub-card flex-between padding-md mb-2">
                            <div className="phrase-box">
                                <span className="phrase-label">상황별 추천 현지어 (AI)</span>
                                <span className="phrase-text">"{data.phrase.local || data.phrase.original}"</span>
                                <span className="phrase-desc">{data.phrase.meaning}</span>
                            </div>
                            <button
                                className={`fab-button primary-shadow ${isPlaying ? 'pulse' : ''}`}
                                onClick={() => speakPhrase(data.phrase.original)}
                            >
                                <span className="material-symbols-outlined">volume_up</span>
                            </button>
                        </div>
                    )}

                    <div className="sub-card padding-md">
                        <span className="phrase-label mb-2" style={{ display: 'block' }}>실시간 통역기 (Google Translate)</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder="한국어로 입력하세요"
                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff' }}
                            />
                            <button
                                className="action-button outline-button text-primary"
                                onClick={handleTranslate}
                                disabled={loadingTranslate}
                                style={{ padding: '8px 16px', minWidth: '60px' }}
                            >
                                {loadingTranslate ? "..." : "번역"}
                            </button>
                        </div>
                        {translatedText && (
                            <div className="mt-2" style={{ padding: '8px', background: 'rgba(75, 130, 243, 0.1)', borderRadius: '6px', fontSize: '14px', border: '1px solid rgba(75, 130, 243, 0.3)' }}>
                                결과: {translatedText}
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', float: 'right', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => speakPhrase(translatedText)}>volume_up</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DiningCard;
