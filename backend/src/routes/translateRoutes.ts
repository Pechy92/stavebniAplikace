import { Router, Request, Response } from 'express';

const router = Router();

router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, from = 'uk', to = 'cs' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('🌐 Translating:', text.substring(0, 50));

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Translation API failed');
    }
    
    const data = await response.json();
    
    let translatedText = '';
    if (data && data[0]) {
      translatedText = data[0].map((item: any) => item[0]).join('');
    }

    console.log('✅ Translated to:', translatedText.substring(0, 50));
    
    res.json({ translatedText });
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;
