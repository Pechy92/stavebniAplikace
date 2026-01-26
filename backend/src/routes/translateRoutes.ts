import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, from = 'uk', to = 'cs' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('🌐 Translating:', text.substring(0, 50));

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await axios.get(url);
    
    let translatedText = '';
    if (response.data && response.data[0]) {
      translatedText = response.data[0].map((item: any) => item[0]).join('');
    }

    console.log('✅ Translated to:', translatedText.substring(0, 50));
    
    res.json({ translatedText });
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;
