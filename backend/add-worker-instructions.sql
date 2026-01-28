-- Přidání sloupce pro instrukce pracovníkům
ALTER TABLE shifts ADD COLUMN worker_instructions TEXT AFTER description;

-- Ověření
DESCRIBE shifts;
