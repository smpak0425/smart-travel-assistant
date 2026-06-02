import React, { useState } from 'react';
import { parseFreeformItinerary } from '../services/gemini';

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function ItineraryTab({ events, onEventsChange }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(events.length === 0);
  const mapsKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const parsed = await parseFreeformItinerary(inputText);
      if (!parsed.length) throw new Error('일정을 찾을 수 없습니다. 텍스트를 다시 확인해주세요.');
      onEventsChange(parsed);
      setShowInput(false);
    } catch (e) {
      setError(e.message.includes('429') ? '⚠️ API 쿼터 초과 — 새 API 키를 발급하거나 내일 다시 시도해주세요.' : '분석 실패: ' + e.message);
    }
    setLoading(false);
  };

  const openMap = (location) => {
    const q = encodeURIComponent(location);
    const url = mapsKey
      ? `https://www.google.com/maps/search/?api=1&query=${q}`
      : `https://maps.google.com/?q=${q}`;
    window.open(url, '_blank');
  };

  const reset = () => {
    onEventsChange([]);
    setInputText('');
    setError('');
    setShowInput(true);
  };

  if (showInput) {
    return (
      <div className="tab-content">
        <div className="input-section">
          <h2 className="section-title">📋 여행 일정 입력</h2>
          <p className="section-desc">
            노션, 카톡, 메모장 등에서 복사한 여행 계획을 그대로 붙여넣으세요.
            AI가 날짜/시간 순서로 정리해드립니다.
          </p>
          <textarea
            className="itinerary-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`예시:\n6/15 파리 도착 CDG 14:00\n숙소 체크인 마레지구 호텔 15:00\n에펠탑 야경 저녁 8시\n\n6/16 루브르 박물관 오전 10시...`}
            rows={11}
          />
          {error && <p className="error-msg">{error}</p>}
          <button
            className="btn btn-primary btn-full"
            onClick={handleParse}
            disabled={loading || !inputText.trim()}
          >
            {loading ? '⏳ AI 분석 중...' : '✨ AI로 일정 정리하기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="timeline-header">
        <h2 className="section-title">📋 내 여행 일정</h2>
        <button className="btn btn-ghost btn-sm" onClick={reset}>새 일정</button>
      </div>
      <div className="timeline">
        {events.map((ev, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-track">
              <div className="timeline-dot" />
              {i < events.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="event-card">
              <div className="event-time">{ev.time || formatTime(ev.startTimeIso)}</div>
              <div className="event-summary">{ev.summary}</div>
              {ev.location && (
                <button className="event-location" onClick={() => openMap(ev.location)}>
                  📍 {ev.location}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItineraryTab;
