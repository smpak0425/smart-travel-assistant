import React, { useState } from 'react';
import { translateText } from '../services/translate';

const LANGUAGES = [
  { code: 'fr', label: '🇫🇷 프랑스어' },
  { code: 'de', label: '🇩🇪 독일어' },
  { code: 'it', label: '🇮🇹 이탈리아어' },
  { code: 'es', label: '🇪🇸 스페인어' },
  { code: 'en', label: '🇬🇧 영어' },
  { code: 'ja', label: '🇯🇵 일본어' },
  { code: 'zh', label: '🇨🇳 중국어' },
  { code: 'th', label: '🇹🇭 태국어' },
  { code: 'ar', label: '🇦🇪 아랍어' },
  { code: 'pt', label: '🇵🇹 포르투갈어' },
];

function speak(text, lang) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  window.speechSynthesis.speak(utt);
}

function TranslateTab({ events }) {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('fr');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapsKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
  const firstLocation = events[0]?.location;

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    const res = await translateText(inputText, targetLang);
    if (res.error) setError(res.error);
    else setResult(res.result);
    setLoading(false);
  };

  return (
    <div className="tab-content">
      <div className="translate-section">
        <h2 className="section-title">🌐 실시간 번역</h2>

        <div className="lang-row">
          <span className="lang-from">한국어 →</span>
          <select
            className="lang-select"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <textarea
          className="translate-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="번역할 내용을 입력하세요"
          rows={4}
        />

        <button
          className="btn btn-primary btn-full"
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
        >
          {loading ? '번역 중...' : '번역하기'}
        </button>

        {error && <p className="error-msg">{error}</p>}

        {result && (
          <div className="translate-result">
            <p className="result-text">{result}</p>
            <button className="speak-btn" onClick={() => speak(result, targetLang)}>
              🔊 발음 듣기
            </button>
          </div>
        )}
      </div>

      <div className="map-section">
        <h2 className="section-title">🗺 지도</h2>
        {mapsKey && firstLocation ? (
          <>
            <div className="map-container">
              <iframe
                title="지도"
                src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(firstLocation)}&language=ko`}
                allowFullScreen
              />
            </div>
            <p className="map-hint">일정 탭에서 📍 장소를 클릭하면 Google Maps로 바로 연결됩니다.</p>
          </>
        ) : (
          <div className="map-placeholder">
            <span className="placeholder-icon">🗺</span>
            {!mapsKey && (
              <>
                <p>Google Maps API 키를 설정하면<br />지도가 여기에 표시됩니다.</p>
                <p className="text-muted">우측 상단 ⚙️ → Google Maps API 키 입력</p>
              </>
            )}
            {mapsKey && !firstLocation && (
              <p>일정을 먼저 입력하면<br />첫 번째 장소 지도가 표시됩니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TranslateTab;
