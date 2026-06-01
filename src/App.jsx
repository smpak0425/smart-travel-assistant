import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SetupScreen from './components/SetupScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FloatingAction from './components/FloatingAction';
import TransitCard from './components/cards/TransitCard';
import EtiquetteCard from './components/cards/EtiquetteCard';
import DiningCard from './components/cards/DiningCard';
import RestroomCard from './components/cards/RestroomCard';
import RecommendationCard from './components/cards/RecommendationCard';
import ItineraryManager from './components/ItineraryManager';
import TravelDiary from './components/TravelDiary';
import VirtualTour from './components/VirtualTour';
import { generateSmartTips } from './services/ai';
import './index.css';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(
    !!localStorage.getItem('GEMINI_API_KEY')
  );

  const [activeTab, setActiveTab] = useState('itinerary');
  const [events, setEvents] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isVirtualTourOpen, setIsVirtualTourOpen] = useState(false);

  const mapApiKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
  const clientId = localStorage.getItem('GOOGLE_CLIENT_ID') || 'dummy-client-id';

  const handleAddEvent = (newEvent) => {
    setEvents([...events, newEvent]);
    triggerAIUpdate([...events, newEvent]);
  };

  const triggerAIUpdate = async (currentEvents) => {
    if (currentEvents.length === 0) return;

    setLoadingAI(true);
    // 가장 최근 또는 전체 일정 정보 요약을 AI에게 넘깁니다.
    const contextStr = currentEvents.map(e => e.summary).join(' -> ');
    const tips = await generateSmartTips(contextStr);

    if (tips) {
      setAiData(tips);
    }
    setLoadingAI(false);
  };

  if (!isSetupComplete) {
    return <SetupScreen
      onComplete={() => {
        setIsSetupComplete(true);
        setActiveTab('itinerary');
      }}
      isEditing={false}
    />;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="app-container">
        <div className="content-scroll pb-24">
          {/* 헤더 부분 */}
          {activeTab !== 'profile' && (
            <Header onOpenSettings={() => setActiveTab('profile')} />
          )}

          {/* 탭: 프로필 / 환경설정 */}
          {activeTab === 'profile' && (
            <div className="padding-md">
              <SetupScreen
                onComplete={() => setActiveTab('itinerary')}
                isEditing={true}
              />
            </div>
          )}

          {/* 탭: 탐색 (추후 구글맵 + AI 복합 화면 연동) */}
          {activeTab === 'explore' && (
            <div className="padding-md flex-center" style={{ minHeight: '60vh', flexDirection: 'column', color: '#888', textAlign: 'center', gap: '24px' }}>
              <span className="material-symbols-outlined mb-2" style={{ fontSize: '48px', color: 'var(--primary-light)' }}>explore</span>
              <h3>주변 지역 완전 정복</h3>
              <p>현재 내 위치 기반의 통합 지도/맛집/번역기가 일체화된<br />통합 탐색 화면입니다.</p>
              <div style={{ width: '100%', textAlign: 'left' }}>
                <RestroomCard />
              </div>
              <button className="action-button outline-button text-primary mt-3" onClick={() => setActiveTab('itinerary')}>
                일정 화면으로 가기
              </button>
            </div>
          )}

          {/* 탭: 저장됨 (여행 일기 & 사진) */}
          {activeTab === 'saved' && (
            <TravelDiary />
          )}

          {/* 탭: 일정 (Itinerary) - 메인 화면 */}
          {activeTab === 'itinerary' && (
            <>
              <div className="padding-md">
                <ItineraryManager onAddEvent={handleAddEvent} />

                {events.length > 0 && (
                  <div className="fade-in mb-3">
                    <div className="flex-between mb-1" style={{ marginLeft: '8px' }}>
                      <h3 className="section-title text-gray mb-0" style={{ fontSize: '14px' }}>나의 일정 타임라인</h3>
                      <button
                        className="action-button primary-bg shadow-glow pulse"
                        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                        onClick={() => setIsVirtualTourOpen(true)}
                      >
                        <span className="material-symbols-outlined mr-1" style={{ fontSize: '14px' }}>360</span>
                        가상 체험 시작
                      </button>
                    </div>
                    {events.map((ev, idx) => (
                      <div key={idx} className="card bg-card-light padding-md mb-2 flex-between border-medium hover-scale" style={{ borderRadius: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12px', color: 'var(--primary-light)', fontWeight: '600' }}>{ev.time}</span>
                          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{ev.summary}</span>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: '#666' }}>location_on</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {events.length > 0 && (
                <div className="timeline-layout">
                  <div className="timeline-track-col">
                    <div className="timeline-dot"></div>
                    <div className="timeline-line"></div>
                  </div>

                  <div className="timeline-items">
                    <TransitCard apiKey={mapApiKey} />

                    {loadingAI ? (
                      <div className="timeline-item timeline-branch-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', flexDirection: 'column', gap: '8px', color: '#888' }}>
                        <div className="timeline-branch"></div>
                        <span className="material-symbols-outlined pulse" style={{ fontSize: '32px' }}>auto_awesome</span>
                        <p>Gemini AI가 내 일정을 분석하여<br />맞춤 정보를 실시간 생성 중입니다...</p>
                      </div>
                    ) : aiData ? (
                      <>
                        {aiData.recommendations && <RecommendationCard data={aiData.recommendations} />}
                        {aiData.etiquette && <EtiquetteCard data={aiData.etiquette} />}
                        {aiData.dining && <DiningCard data={aiData.dining} />}
                      </>
                    ) : null}

                    <div className="bottom-spacer"></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {events.length > 0 && activeTab === 'itinerary' && <FloatingAction />}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {isVirtualTourOpen && (
          <VirtualTour events={events} onClose={() => setIsVirtualTourOpen(false)} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
