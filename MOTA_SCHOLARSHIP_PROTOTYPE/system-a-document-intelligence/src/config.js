import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  uploadDir: path.resolve(__dirname, '../uploads'),
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ],
  documentTypes: [
    'ST_CERTIFICATE',
    'PVTG_CERTIFICATE',
    'INCOME_CERTIFICATE',
    'DOMICILE_CERTIFICATE',
    'AADHAAR',
    'MARKSHEET',
    'DEGREE_CERTIFICATE',
    'ADMISSION_LETTER',
    'OFFER_LETTER',
    'BANK_PASSBOOK',
    'DISABILITY_CERTIFICATE',
    'BONAFIDE_CERTIFICATE',
    'FEE_RECEIPT',
    'OTHER',
    'UNKNOWN'
  ]
};
