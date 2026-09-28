/**
 * Label + Proximity & Bounding Box Spatial Extractor
 */
import { cleanText } from '../normalizers/fieldNormalizers.js';
import { validateField } from '../validators/fieldValidators.js';

export function extractByLabelAndProximity({
  labelRegexes = [],
  valueRegexes = [],
  lines = [],
  fullText = '',
  fieldKey = '',
  avgOcrConf = 0.90,
  normalizer = cleanText
}) {
  let bestCandidate = null;
  let matchedLabelStr = null;
  let sourceMethod = 'OCR_REGEX';
  let matchedPage = 1;

  // 1. First attempt: Line-by-line label detection & spatial search
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineText = line.text || '';
    const lineBox = line.box || null;
    const page = line.page || 1;

    for (const labelRegex of labelRegexes) {
      const match = lineText.match(labelRegex);
      if (match) {
        // Skip document title headers like "CERTIFICATE OF ..." when seeking field labels
        if (/^\s*(?:certificate\s+of|statement\s+of|government\s+of)\b/i.test(lineText) && !/(?:number|no\.?|id|code)\b/i.test(lineText)) {
          continue;
        }

        matchedLabelStr = match[0].trim();
        matchedPage = page;

        // A. Same-line search (text following the label)
        const afterLabel = lineText.slice(match.index + match[0].length).trim();
        if (afterLabel) {
          for (const valRegex of valueRegexes) {
            const vMatch = afterLabel.match(valRegex);
            if (vMatch) {
              const val = vMatch[1] !== undefined ? vMatch[1] : vMatch[0];
              bestCandidate = {
                rawValue: val,
                page,
                method: 'SAME_LINE_LABEL',
                ocrConf: line.confidence || avgOcrConf
              };
              break;
            }
          }
          if (bestCandidate) break;

          // If no specific valueRegex matched, but there is non-trivial text remaining
          if (valueRegexes.length === 0 && afterLabel.length > 1) {
            bestCandidate = {
              rawValue: afterLabel,
              page,
              method: 'SAME_LINE_REMAINDER',
              ocrConf: line.confidence || avgOcrConf
            };
            break;
          }
        }

        // B. Spatial Bounding Box search (Right-side or line directly below)
        if (!bestCandidate && lineBox && Array.isArray(lineBox) && lineBox.length === 4) {
          const [lx0, ly0, lx1, ly1] = lineBox;
          const lHeight = Math.max(15, ly1 - ly0);

          // Find nearby tokens on right side or directly below
          for (let j = 0; j < lines.length; j++) {
            if (i === j) continue;
            const target = lines[j];
            if (!target.box || target.page !== page) continue;
            const [tx0, ty0, tx1, ty1] = target.box;

            const isRightSide = tx0 >= (lx1 - 10) && Math.abs((ty0 + ty1) / 2 - (ly0 + ly1) / 2) <= (lHeight * 0.9);
            const isBelow = ty0 >= ly1 && (ty0 - ly1) <= (lHeight * 1.8) && Math.abs(tx0 - lx0) <= 120;

            if (isRightSide || isBelow) {
              const targetText = target.text || '';
              for (const valRegex of valueRegexes) {
                const vMatch = targetText.match(valRegex);
                if (vMatch) {
                  const val = vMatch[1] !== undefined ? vMatch[1] : vMatch[0];
                  bestCandidate = {
                    rawValue: val,
                    page,
                    method: isRightSide ? 'SPATIAL_RIGHT_BOX' : 'SPATIAL_BELOW_BOX',
                    ocrConf: target.confidence || avgOcrConf
                  };
                  break;
                }
              }
              if (bestCandidate) break;
            }
          }
        }

        // C. Next line fallback (when boxes are not available)
        if (!bestCandidate && (i + 1) < lines.length && (lines[i + 1].page || 1) === page) {
          const nextText = lines[i + 1].text || '';
          for (const valRegex of valueRegexes) {
            const vMatch = nextText.match(valRegex);
            if (vMatch) {
              const val = vMatch[1] !== undefined ? vMatch[1] : vMatch[0];
              bestCandidate = {
                rawValue: val,
                page,
                method: 'NEXT_LINE_FALLBACK',
                ocrConf: lines[i + 1].confidence || avgOcrConf
              };
              break;
            }
          }
        }

        if (bestCandidate) break;
      }
    }
    if (bestCandidate) break;
  }

  // 2. Second attempt: Document-wide regex matching if proximity did not yield a candidate
  if (!bestCandidate) {
    for (const valRegex of valueRegexes) {
      const vMatch = fullText.match(valRegex);
      if (vMatch) {
        const val = vMatch[1] !== undefined ? vMatch[1] : vMatch[0];
        bestCandidate = {
          rawValue: val,
          page: 1,
          method: 'DOCUMENT_WIDE_REGEX',
          ocrConf: avgOcrConf
        };
        break;
      }
    }
  }

  if (!bestCandidate || bestCandidate.rawValue === null || bestCandidate.rawValue === undefined) {
    return {
      value: null,
      confidence: 0.0,
      source: 'NOT_FOUND',
      page: null,
      matchedLabel: matchedLabelStr,
      validation: 'NOT_FOUND'
    };
  }

  // 3. Normalization and Validation
  const rawVal = bestCandidate.rawValue;
  const normFn = typeof normalizer === 'function' ? normalizer : cleanText;
  const normalizedValue = normFn(rawVal);
  const validationRes = validateField(fieldKey, normalizedValue);

  // 4. Calculate evidence-based confidence
  let conf = bestCandidate.ocrConf || avgOcrConf;
  if (bestCandidate.method.startsWith('SPATIAL') || bestCandidate.method.startsWith('SAME_LINE')) {
    conf += 0.04;
  }
  if (validationRes.status === 'VALID') {
    conf += 0.03;
  } else if (validationRes.status === 'INVALID') {
    conf -= 0.25;
  } else if (validationRes.status === 'LOW_CONFIDENCE') {
    conf -= 0.15;
  }

  const finalConf = Number(Math.min(0.99, Math.max(0.40, conf)).toFixed(2));

  return {
    value: normalizedValue,
    confidence: finalConf,
    source: bestCandidate.method,
    page: bestCandidate.page,
    matchedLabel: matchedLabelStr,
    validation: validationRes.status
  };
}
