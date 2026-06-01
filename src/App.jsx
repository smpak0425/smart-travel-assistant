import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import ItineraryTab from './components/ItineraryTab';
import TranslateTab from './components/TranslateTab';
import TipsTab from './components/TipsTab';
import './index.css';

function App() {
  const [isSetup, setIsSetup] = useState(!!localStorage.getItem('GEMINI_API_KEY'));
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState('itinerary');
  const [events, setEvents] = useState([]);

  if (!isSetup || showSettings) {
    return (
      <SetupScreen
        isEditing={showSettings}
        onComplete={() => {
          setIsSetup(true);
          setShowSettings(false);
        }}
      />
    );
  }

  const appName = localStorage.getItem('APP_NAME') || '나의 여행 비서';

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">{appName}</h1>
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="설정">
          ⚙️
        </button>
      </header>

      <main className="app-content">
        {tab === 'itinerary' && (
          <ItineraryTab events={events} onEventsChange={setEvents} />
        )}
        {tab === 'translate' && <TranslateTab events={events} />}
        {tab === 'tips' && <TipsTab events={events} />}
      </main>

      <nav className="bottom-nav">
        {[
          { id: 'itinerary', icon: '📋', label: '일정' },
          { id: 'translate', icon: '🌐', label: '번역/지도' },
          { id: 'tips', icon: '✨', label: 'AI 팁' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            className={`nav-btn${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
