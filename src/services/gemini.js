import { GoogleGenerativeAI } from '@google/generative-ai';

function getModel(jsonMode = false) {
  const key = localStorage.getItem('GEMINI_API_KEY');
  if (!key) throw new Error('Gemini API 키가 설정되지 않았습니다.');
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: localStorage.getItem('GEMINI_MODEL') || 'gemini-2.0-flash-lite',
    ...(jsonMode && { generationConfig: { responseMimeType: 'application/json' } }),
  });
}

function stripCodeBlock(text) {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
}

export async function parseFreeformItinerary(rawText) {
  const model = getModel(true);
  const prompt = `
여행 일정 텍스트를 분석하여 JSON 배열로 반환하세요.
각 항목 형식: { "summary": "일정 제목", "location": "장소명, 도시", "time": "HH:MM", "startTimeIso": "ISO8601", "endTimeIso": "ISO8601" }

규칙:
- 날짜가 없으면 가까운 미래 날짜로 추론
- 시간이 없으면 맥락에서 추론
- 소요 시간은 장소 유형에 따라 추정
- 모든 일정 항목을 누락 없이 추출
- JSON 배열만 반환, 마크다운 없이

입력 텍스트:
${rawText}
`;
  const result = await model.generateContent(prompt);
  const text = stripCodeBlock(result.response.text());
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray) || [];
}

export async function generateTravelTips(locationContext) {
  const model = getModel(true);
  const userName = localStorage.getItem('USER_NAME') || '여행자';
  const prompt = `
스마트 여행 비서입니다. "${userName}"님의 여행 일정: "${locationContext}"

여행지(국가/도시)를 파악하여 해당 지역에 맞는 여행 팁을 JSON으로 반환하세요.
JSON만 반환, 마크다운 없이.

{
  "destination": "도시, 국가",
  "recommendations": {
    "title": "숨은 명소 추천",
    "places": [
      { "name": "장소명", "desc": "한 줄 설명", "mapQuery": "Google Maps 영문 검색어" },
      { "name": "장소명", "desc": "한 줄 설명", "mapQuery": "Google Maps 영문 검색어" }
    ]
  },
  "etiquette": {
    "title": "현지 에티켓 & 팁",
    "tips": ["팁 1", "팁 2", "팁 3"]
  },
  "dining": {
    "title": "현지 음식 가이드",
    "dishes": ["추천 메뉴 1", "추천 메뉴 2", "추천 메뉴 3"],
    "phrase": {
      "text": "현지어 표현 (주문 또는 감사 인사)",
      "pronunciation": "한글 발음 표기",
      "meaning": "한국어 뜻",
      "langCode": "BCP-47 언어 코드 (fr, it, de, es, en, ja, zh 등)"
    }
  }
}
`;
  const result = await model.generateContent(prompt);
  const text = stripCodeBlock(result.response.text());
  return JSON.parse(text);
}
