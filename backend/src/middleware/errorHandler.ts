import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Chyba validace',
      details: err.message
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Záznam s touto hodnotou již existuje'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Interní chyba serveru'
  });
};
