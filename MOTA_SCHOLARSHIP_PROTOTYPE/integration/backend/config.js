import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  systemAUrl: (process.env.SYSTEM_A_URL || 'http://127.0.0.1:5001').replace(/\/$/, ''),
  systemBUrl: (process.env.SYSTEM_B_URL || 'http://127.0.0.1:5050').replace(/\/$/, ''),
  uploadDir: path.resolve(__dirname, '../uploads'),
  requestTimeoutMs: 60000
};
