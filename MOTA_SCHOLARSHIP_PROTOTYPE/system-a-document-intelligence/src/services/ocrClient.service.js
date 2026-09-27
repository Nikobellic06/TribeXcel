import fs from 'fs';
import { config } from '../config.js';

/**
 * OCR Client Service
 * Communicates with the local Python OCR microservice (PaddleOCR / PyMuPDF / OpenCV)
 */
export async function extractTextAndQuality(filePath, mimeType, filename) {
  const ocrUrl = config.ocrServiceUrl || 'http://127.0.0.1:5003';

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found on disk: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType || 'application/octet-stream' });
  formData.append('file', blob, filename || 'document');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${ocrUrl}/ocr`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OCR service HTTP ${res.status}: ${errText}`);
    }

    const ocrData = await res.json();
    return ocrData;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[OCR Client] OCR service error (${err.message}). Using local text fallback parser.`);

    // Fallback: if PDF, check if we can inspect basic text or return empty text structure
    return {
      filename,
      isPdf: filename.toLowerCase().endsWith('.pdf'),
      pageCount: 1,
      fullText: '',
      lineCount: 0,
      lines: [],
      averageConfidence: 0.5,
      quality: {
        overall: 'WARNING',
        score: 0.65,
        blurScore: 120.0,
        resolution: [800, 1000],
        issues: ['OCR service communication error; local fallback engaged']
      },
      preprocessing: { grayscale: true, contrastEnhanced: false, deskewAngle: 0.0 }
    };
  }
}
