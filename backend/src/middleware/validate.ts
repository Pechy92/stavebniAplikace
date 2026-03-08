import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware pro zpracování chyb validace
 * Musí být použit PO validačních pravidlech
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));
    
    return res.status(400).json({
      error: 'Validační chyba',
      errors: formattedErrors
    });
  }
  
  next();
};
