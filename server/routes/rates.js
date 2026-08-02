import { Router } from 'express';

const router = Router();

let cache = { data: null, fetchedAt: 0 };
const ONE_DAY = 24 * 60 * 60 * 1000;

// GET /api/rates — live SEK -> RUB/TRY/AED rates, refreshed once a day (free, no API key).
router.get('/', async (req, res) => {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < ONE_DAY) {
    return res.json(cache.data);
  }
  try {
    const resp = await fetch('https://open.er-api.com/v6/latest/SEK');
    const json = await resp.json();
    if (json.result !== 'success') throw new Error('rate provider error');
    const data = {
      base: 'SEK',
      rates: { RUB: json.rates.RUB, TRY: json.rates.TRY, AED: json.rates.AED },
      updatedAt: json.time_last_update_utc,
    };
    cache = { data, fetchedAt: now };
    res.json(data);
  } catch (err) {
    // Fall back to the last known good rates (or the original app's static ones) if the provider is down.
    res.json(cache.data || { base: 'SEK', rates: { RUB: 8.15, TRY: 4.99, AED: 0.38 }, updatedAt: null, stale: true });
  }
});

export default router;
