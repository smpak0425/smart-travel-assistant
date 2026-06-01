export async function translateText(text, targetLang = 'en') {
  const key = localStorage.getItem('GOOGLE_TRANSLATE_API_KEY');
  if (!key) {
    return { error: 'Google Translate API 키를 설정 화면에서 입력해주세요.' };
  }
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang, format: 'text' }),
      }
    );
    const data = await res.json();
    if (!res.ok) return { error: data.error?.message || '번역 요청 실패' };
    return { result: data.data?.translations?.[0]?.translatedText || '' };
  } catch (e) {
    return { error: '네트워크 오류: ' + e.message };
  }
}
