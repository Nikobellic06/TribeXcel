import fs from 'fs';
import { config } from '../config.js';

/**
 * Client for communicating with System A (Document Intelligence Engine)
 */

export async function checkSystemAHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${config.systemAUrl}/api/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { status: 'UP', details: data };
    }
    return { status: 'DOWN', error: `HTTP ${res.status}` };
  } catch (err) {
    return { status: 'DOWN', error: err.message };
  }
}

export async function analyzeDocumentsWithSystemA(files = [], applicationId) {
  const formData = new FormData();
  
  if (applicationId) {
    formData.append('applicationId', applicationId);
  }

  for (const file of files) {
    const buffer = fs.readFileSync(file.path);
    const blob = new Blob([buffer], { type: file.mimetype || 'application/octet-stream' });
    formData.append('documents', blob, file.originalname);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const res = await fetch(`${config.systemAUrl}/api/analyze-documents`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`System A responded with HTTP ${res.status}: ${errBody}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Document Intelligence Engine timed out while processing documents.');
    }
    throw new Error(`Document Intelligence Engine unavailable: ${err.message}`);
  }
}

export async function fetchSystemADemo(scenario = 'clean') {
  try {
    const res = await fetch(`${config.systemAUrl}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[System A Client] Could not fetch live demo from System A: ${err.message}`);
    return null;
  }
}
