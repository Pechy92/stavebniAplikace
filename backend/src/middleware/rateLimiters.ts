import rateLimit from 'express-rate-limit';

// Globální rate limiter pro všechny API endpointy
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // max 100 požadavků na IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Příliš mnoho požadavků z této IP adresy, zkuste to později.'
});

// Přísný rate limiter pro login - ochrana proti brute-force útokům
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // max 5 pokusů o přihlášení
  skipSuccessfulRequests: true, // nepočítat úspěšné přihlášení
  message: 'Příliš mnoho pokusů o přihlášení. Zkuste to za 15 minut.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pro registraci
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: 3, // max 3 registrace za hodinu z jedné IP
  message: 'Příliš mnoho registrací z této IP adresy.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pro upload souborů
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 10, // max 10 uploadů za minutu
  message: 'Příliš mnoho uploadů. Zkuste to za chvíli.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pro změnu hesla
export const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: 3, // max 3 změny hesla za hodinu
  message: 'Příliš mnoho pokusů o změnu hesla.',
  standardHeaders: true,
  legacyHeaders: false,
});
