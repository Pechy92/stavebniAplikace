import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.SQLITE_DB_PATH || './database.sqlite';

export async function getConnection() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export default { getConnection };
