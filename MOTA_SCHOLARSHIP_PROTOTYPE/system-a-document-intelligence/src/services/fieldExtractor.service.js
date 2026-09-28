/**
 * Document-Specific Field Extraction Service
 * 
 * Re-exports unified extraction engine using modular schemas, patterns,
 * normalizers, proximity matching, and validators.
 */
import { extractDocumentSpecificFields } from '../extraction/extractors/index.js';

export function extractDocumentFields(docType, fullText = '', lines = [], avgOcrConf = 0.90) {
  return extractDocumentSpecificFields(docType, fullText, lines, avgOcrConf);
}
