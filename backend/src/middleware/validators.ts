import { body, param, ValidationChain } from 'express-validator';

// Email validace
export const emailValidation = (): ValidationChain =>
  body('email')
    .trim()
    .isEmail()
    .withMessage('Neplatný formát emailu')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email je příliš dlouhý');

// Heslo validace
export const passwordValidation = (fieldName: string = 'password'): ValidationChain =>
  body(fieldName)
    .trim()
    .isLength({ min: 6 })
    .withMessage('Heslo musí mít alespoň 6 znaků')
    .isLength({ max: 100 })
    .withMessage('Heslo je příliš dlouhé');

// Silné heslo validace (pro registraci)
export const strongPasswordValidation = (): ValidationChain =>
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Heslo musí mít alespoň 8 znaků')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Heslo musí obsahovat velké písmeno, malé písmeno a číslo')
    .isLength({ max: 100 })
    .withMessage('Heslo je příliš dlouhé');

// Běžná textová pole
export const textFieldValidation = (fieldName: string, minLength: number = 2, maxLength: number = 100): ValidationChain =>
  body(fieldName)
    .trim()
    .escape()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} musí mít ${minLength}-${maxLength} znaků`);

// Telefonní číslo
export const phoneValidation = (): ValidationChain =>
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+420)?[0-9]{9}$/)
    .withMessage('Neplatné telefonní číslo');

// Role validace
export const roleValidation = (): ValidationChain =>
  body('role')
    .isIn(['admin', 'manager', 'foreman', 'worker'])
    .withMessage('Neplatná role');

// ID validace v parametrech
export const idParamValidation = (paramName: string = 'id'): ValidationChain =>
  param(paramName)
    .isInt({ min: 1 })
    .withMessage('Neplatné ID');

// Popis/text area validace
export const textareaValidation = (fieldName: string, maxLength: number = 2000): ValidationChain =>
  body(fieldName)
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${fieldName} je příliš dlouhý`);

// Číslo validace
export const numberValidation = (fieldName: string, min: number = 0, max: number = 999999): ValidationChain =>
  body(fieldName)
    .optional()
    .isFloat({ min, max })
    .withMessage(`${fieldName} musí být číslo mezi ${min} a ${max}`);

// Datum validace
export const dateValidation = (fieldName: string): ValidationChain =>
  body(fieldName)
    .optional()
    .isISO8601()
    .withMessage('Neplatný formát data');

// Registrace validace
export const registerValidation = [
  emailValidation(),
  strongPasswordValidation(),
  textFieldValidation('first_name', 2, 50),
  textFieldValidation('last_name', 2, 50),
  phoneValidation(),
  roleValidation()
];

// Login validace
export const loginValidation = [
  emailValidation(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Heslo je povinné')
];

// Změna hesla validace
export const changePasswordValidation = [
  passwordValidation('oldPassword'),
  strongPasswordValidation()
    .withMessage('Nové heslo musí mít alespoň 8 znaků a obsahovat velké písmeno, malé písmeno a číslo')
];

// Profil update validace
export const updateProfileValidation = [
  textFieldValidation('first_name', 2, 50),
  textFieldValidation('last_name', 2, 50),
  phoneValidation()
];

// Projekt validace
export const createProjectValidation = [
  textFieldValidation('name', 3, 200),
  textFieldValidation('location', 3, 200),
  textFieldValidation('custom_id', 3, 50).optional(),
  textareaValidation('description', 2000)
];

// Materiál validace
export const createMaterialValidation = [
  textFieldValidation('name', 2, 200),
  textareaValidation('description', 500).optional(),
  numberValidation('unitPrice', 0, 999999).optional(),
  body('unit').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 50 }).withMessage('Jednotka musí mít 1-50 znaků'),
  textFieldValidation('category', 1, 100).optional(),
  body('sku').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }).withMessage('SKU musí mít 1-100 znaků'),
  body('projectId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Project ID musí být platné číslo')
];

// Vícepráce validace
export const createExtraWorkValidation = [
  idParamValidation('project_id'),
  textFieldValidation('name', 3, 200),
  textareaValidation('description', 2000),
  numberValidation('hours_worked', 0, 999)
];

// Směna validace
export const createShiftValidation = [
  idParamValidation('project_id'),
  dateValidation('date'),
  textFieldValidation('shift_type', 2, 50),
  textareaValidation('notes', 2000)
];
