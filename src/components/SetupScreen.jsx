import React, { useState } from 'react';

function SetupScreen({ isEditing, onComplete }) {
  const [form, setForm] = useState({
    appName: localStorage.getItem('APP_NAME') || '나의 여행 비서',
    geminiKey: localStorage.getItem('GEMINI_API_KEY') || '',
    mapsKey: localStorage.getItem('GOOGLE_MAPS_API_KEY') || '',
    translateKey: localStorage.getItem('GOOGLE_TRANSLATE_API_KEY') || '',
  });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.geminiKey.trim()) {
      setError('Gemini API 키는 필수입니다.');
      return;
    }
    localStorage.setItem('APP_NAME', form.appName.trim() || '나의 여행 비서');
    localStorage.setItem('GEMINI_API_KEY', form.geminiKey.trim());
    localStorage.setItem('GOOGLE_MAPS_API_KEY', form.mapsKey.trim());
    localStorage.setItem('GOOGLE_TRANSLATE_API_KEY', form.translateKey.trim());
    onComplete();
  };

  return (
    <div className="setup-screen">
      <div className="setup-card">
        {!isEditing && (
          <div className="setup-hero">
            <div className="setup-icon">✈️</div>
            <h1>스마트 여행 비서</h1>
            <p>AI가 여행 일정을 분석하고<br />현지 맞춤 정보를 알려드려요</p>
          </div>
        )}
        {isEditing && <h2 className="settings-title">⚙️ 설정</h2>}

        <div className="form-group">
          <label>앱 이름</label>
          <input type="text" value={form.appName} onChange={set('appName')} placeholder="나의 유럽 여행" />
        </div>

        <div className="form-group">
          <label>Gemini API 키 <span className="tag-required">필수</span></label>
          <input type="password" value={form.geminiKey} onChange={set('geminiKey')} placeholder="AIza..." />
          <a className="help-link" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
            🔑 무료 발급받기 →
          </a>
        </div>

        <div className="form-group">
          <label>Google Maps API 키 <span className="tag-optional">선택</span></label>
          <input type="password" value={form.mapsKey} onChange={set('mapsKey')} placeholder="입력 시 지도 기능 활성화" />
        </div>

        <div className="form-group">
          <label>Google Translate API 키 <span className="tag-optional">선택</span></label>
          <input type="password" value={form.translateKey} onChange={set('translateKey')} placeholder="입력 시 번역 기능 활성화" />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn btn-primary btn-full" onClick={handleSave}>
          {isEditing ? '저장하기' : '시작하기 →'}
        </button>

        {isEditing && (
          <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={onComplete}>
            취소
          </button>
        )}

        <p className="privacy-note">
          🔒 입력한 키는 이 기기의 브라우저에만 저장됩니다.<br />서버로 전송되지 않아요.
        </p>
      </div>
    </div>
  );
}

export default SetupScreen;
