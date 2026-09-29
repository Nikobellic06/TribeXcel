/*
 * Simple in-memory limit for admin login attempts: 5 failed attempts per
 * email + IP in 15 minutes. Enough for a single-server prototype; use a shared
 * store (Redis) behind a load balancer.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map();

const keyOf = (req) => `${req.ip}|${String(req.body?.email || '').toLowerCase().trim()}`;

function loginRateLimit(req, res, next) {
  const key = keyOf(req);
  const entry = failures.get(key);
  if (entry && Date.now() - entry.first < WINDOW_MS && entry.count >= MAX_FAILURES) {
    const minutes = Math.ceil((WINDOW_MS - (Date.now() - entry.first)) / 60000);
    return res.status(429).json({ message: `Too many failed attempts. Try again in ${minutes} minute(s).` });
  }
  res.on('finish', () => {
    if (res.statusCode === 401) {
      const e = failures.get(key);
      if (!e || Date.now() - e.first > WINDOW_MS) failures.set(key, { first: Date.now(), count: 1 });
      else e.count += 1;
    } else if (res.statusCode === 200) {
      failures.delete(key);
    }
  });
  return next();
}

module.exports = { loginRateLimit };
