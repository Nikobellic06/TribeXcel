import { config } from '../config.js';

/**
 * Client for communicating with System B (Scholarship Verification Engine)
 */

export async function checkSystemBHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${config.systemBUrl}/api/health`, {
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

export async function verifyWithSystemB(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const res = await fetch(`${config.systemBUrl}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`System B responded with HTTP ${res.status}: ${errBody}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Scholarship Verification Engine timed out while evaluating rules.');
    }
    throw new Error(`Verification Engine unavailable: ${err.message}`);
  }
}

export async function fetchSystemBDemo(scenario = 'DEMO_1_ELIGIBLE') {
  try {
    const res = await fetch(`${config.systemBUrl}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[System B Client] Could not fetch live demo from System B: ${err.message}`);
    return null;
  }
}
