import React, { useState } from 'react';
import MiniMap from '../MiniMap';

function TransitCard({ apiKey, events }) {
    const [expanded, setExpanded] = useState(false);

    const origin = events && events.length > 0 ? events[0] : null;
    const destination = events && events.length > 1 ? events[1] : null;

    return (
        <div className="timeline-item">
            <div className="timeline-branch"></div>
            <div className="item-header">
                <span className="time-label">{origin ? origin.time : '--:--'}</span>
            </div>

            <div className="card timeline-card border-orange">
                <div className="card-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
                    <div>
                        <h3 className="card-title">
                            {destination ? `${destination.summary}으로 이동` : '이동 경로'}
                        </h3>
                        <p className="card-subtitle">
                            {origin && destination
                                ? `${origin.summary} → ${destination.summary}`
                                : '일정을 등록하면 경로가 표시됩니다'}
                        </p>
                    </div>
                </div>

                {origin && destination && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress-fill highlight-bg" style={{ width: '30%' }}></div>
                            <div className="progress-node active" style={{ left: '0' }}>
                                <div className="node-label">{origin.summary}</div>
                            </div>
                            <div className="progress-node" style={{ left: '100%' }}>
                                <div className="node-label">{destination.summary}</div>
                            </div>
                        </div>
                    </div>
                )}

                {expanded && apiKey && origin && destination ? (
                    <div className="border-top" style={{ borderColor: 'var(--border-light)' }}>
                        <MiniMap
                            apiKey={apiKey}
                            origin={origin.location || origin.summary}
                            destination={destination.location || destination.summary}
                        />
                    </div>
                ) : expanded && !apiKey ? (
                    <div className="padding-md flex-center" style={{ color: '#888' }}>
                        지도 기능은 API Key 입력 후 활성화됩니다.
                    </div>
                ) : expanded && (!origin || !destination) ? (
                    <div className="padding-md flex-center" style={{ color: '#888' }}>
                        일정을 2개 이상 등록하면 지도가 표시됩니다.
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default TransitCard;
