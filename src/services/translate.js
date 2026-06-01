import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function translateText(text, targetLang = 'ko') {
    const googleApiKey = localStorage.getItem('GOOGLE_TRANSLATE_API_KEY');

    // Google Translate API 키가 있으면 우선 사용
    if (googleApiKey) {
        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
                { q: text, target: targetLang }
            );
            return response.data.data.translations[0].translatedText;
        } catch (error) {
            console.error("Google Translate error, falling back to Gemini", error);
        }
    }

    // Google Translate 키 없거나 실패 시 Gemini로 번역
    const geminiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!geminiKey) {
        return "번역 기능을 사용하려면 설정에서 Gemini API 키를 입력해주세요.";
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const langNames = {
            fr: '프랑스어', de: '독일어', it: '이탈리아어', es: '스페인어',
            en: '영어', ja: '일본어', zh: '중국어', ko: '한국어',
            pt: '포르투갈어', nl: '네덜란드어',
        };
        const targetName = langNames[targetLang] || targetLang;
        const result = await model.generateContent(
            `다음 텍스트를 ${targetName}로 번역해줘. 번역 결과만 반환하고 다른 설명은 쓰지 마: "${text}"`
        );
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini translation error", error);
        return "번역 오류 발생";
    }
}
