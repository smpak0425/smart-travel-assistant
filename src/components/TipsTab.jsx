import React, { useState, useEffect, useRef } from 'react';
import { generateTravelTips } from '../services/gemini';

function speak(text, lang) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || 'en';
  window.speechSynthesis.speak(utt);
}

function TipsTab({ events }) {
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevContext = useRef('');

  useEffect(() => {
    if (!events.length) return;
    const context = events.map((e) => e.summary).join(', ');
    if (context === prevContext.current) return;
    prevContext.current = context;
    loadTips(context);
  }, [events]);

  const loadTips = async (context) => {
    setLoading(true);
    setError('');
    try {
      const data = await generateTravelTips(context);
      setTips(data);
    } catch (e) {
      setError('AI 팁 생성 실패: ' + e.message);
    }
    setLoading(false);
  };

  const refresh = () => {
    prevContext.current = '';
    const context = events.map((e) => e.summary).join(', ');
    loadTips(context);
  };

  if (!events.length) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <h3>일정을 먼저 입력해주세요</h3>
          <p>일정 탭에서 여행 계획을 입력하면<br />AI가 맞춤 팁을 알려드립니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2 className="section-title">✨ AI 여행 팁</h2>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Gemini AI가 여행지를 분석 중입니다...</p>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {tips && !loading && (
        <>
          <div className="destination-badge">📍 {tips.destination}</div>

          {tips.recommendations?.places?.length > 0 && (
            <div className="tip-card">
              <h3 className="tip-title">🗺 {tips.recommendations.title}</h3>
              <div className="places-list">
                {tips.recommendations.places.map((p, i) => (
                  <button
                    key={i}
                    className="place-item"
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${encodeURIComponent(p.mapQuery)}`,
                        '_blank'
                      )
                    }
                  >
                    <div className="place-name">{p.name}</div>
                    <div className="place-desc">{p.desc}</div>
                    <span className="place-link">지도 보기 →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tips.etiquette?.tips?.length > 0 && (
            <div className="tip-card">
              <h3 className="tip-title">🤝 {tips.etiquette.title}</h3>
              <ul className="etiquette-list">
                {tips.etiquette.tips.map((t, i) => (
                  <li key={i} className="etiquette-item">✓ {t}</li>
                ))}
              </ul>
            </div>
          )}

          {tips.dining && (
            <div className="tip-card">
              <h3 className="tip-title">🍽 {tips.dining.title}</h3>
              {tips.dining.dishes?.length > 0 && (
                <div className="dish-pills">
                  {tips.dining.dishes.map((d, i) => (
                    <span key={i} className="dish-pill">{d}</span>
                  ))}
                </div>
              )}
              {tips.dining.phrase && (
                <div className="phrase-box">
                  <div className="phrase-original">{tips.dining.phrase.text}</div>
                  <div className="phrase-pronunciation">{tips.dining.phrase.pronunciation}</div>
                  <div className="phrase-meaning">{tips.dining.phrase.meaning}</div>
                  <button
                    className="speak-btn"
                    onClick={() => speak(tips.dining.phrase.text, tips.dining.phrase.langCode)}
                  >
                    🔊 발음 듣기
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-ghost btn-full" onClick={refresh}>
            🔄 다시 생성
          </button>
        </>
      )}
    </div>
  );
}

export default TipsTab;
