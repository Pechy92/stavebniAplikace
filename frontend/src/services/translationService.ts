// Služba pro překlad textu pomocí Google Translate API
// Pro produkční použití doporučuji použít oficiální Google Cloud Translation API s API klíčem

interface TranslationCache {
  [key: string]: string;
}

const cache: TranslationCache = {};

export const translationService = {
  /**
   * Přeložit text z ukrajinštiny do češtiny
   * @param text Text k překladu
   * @returns Přeložený text
   */
  async translateToCzech(text: string): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    // Kontrola cache
    const cacheKey = `uk-cs:${text}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    try {
      // Použit backend API pro překlad
      const apiUrl = import.meta.env.MODE === 'production' 
        ? 'https://stavebniaplikacebackend-production.up.railway.app/api/translate'
        : 'http://localhost:3001/api/translate';
      
      console.log('🌐 Translation API URL:', apiUrl);
      console.log('📝 Translating text:', text);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          from: 'uk',
          to: 'cs'
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Translation failed:', errorText);
        throw new Error('Translation failed');
      }

      const data = await response.json();
      console.log('✅ Translation response:', data);
      const translatedText = data.translatedText;

      // Uložit do cache
      cache[cacheKey] = translatedText;
      
      return translatedText;
    } catch (error) {
      console.error('❌ Translation error:', error);
      return `[Překlad se nezdařil] ${text}`;
    }
  },

  /**
   * Detekovat jazyk textu
   * @param text Text k analýze
   * @returns Kód jazyka (uk, cs, en, atd.)
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text || text.trim() === '') {
      return 'unknown';
    }

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.substring(0, 200))}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Language detection failed');
      }

      const data = await response.json();
      
      // Detekovaný jazyk je v data[2]
      if (data && data[2]) {
        return data[2];
      }

      return 'unknown';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'unknown';
    }
  },

  /**
   * Zkontrolovat, zda je text v ukrajinštině
   * @param text Text k analýze
   * @returns True pokud je text v ukrajinštině
   */
  async isUkrainian(text: string): Promise<boolean> {
    const detectedLang = await this.detectLanguage(text);
    return detectedLang === 'uk';
  },

  /**
   * Vymazat cache překladů
   */
  clearCache() {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};
