import { Router } from 'express';

const router = Router();

function extractPlaylistId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('list');
  } catch {
    return null;
  }
}

// Parses ISO-8601 durations like "PT1H2M10S" into total seconds.
function parseISODuration(iso) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!match) return 0;
  const [, h, m, s] = match;
  return (parseInt(h || '0', 10) * 3600) + (parseInt(m || '0', 10) * 60) + parseInt(s || '0', 10);
}

// GET /api/youtube/playlist-info?url=...
router.get('/playlist-info', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'YOUTUBE_API_KEY не настроен на сервере (Render → Environment)' });

  const playlistId = extractPlaylistId(url);
  if (!playlistId) return res.status(400).json({ error: 'Не нашла ID плейлиста в этой ссылке — это точно ссылка на плейлист YouTube?' });

  try {
    const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
    const plData = await plRes.json();
    if (plData.error) return res.status(502).json({ error: plData.error.message });
    if (!plData.items?.length) return res.status(404).json({ error: 'Плейлист не найден (возможно, он приватный)' });
    const title = plData.items[0].snippet.title;

    const videoIds = [];
    let pageToken = '';
    do {
      const itemsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&pageToken=${pageToken}&key=${apiKey}`
      );
      const itemsData = await itemsRes.json();
      if (itemsData.error) return res.status(502).json({ error: itemsData.error.message });
      videoIds.push(...(itemsData.items || []).map(i => i.contentDetails.videoId));
      pageToken = itemsData.nextPageToken || '';
    } while (pageToken);

    let totalSeconds = 0;
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch.join(',')}&key=${apiKey}`);
      const vidData = await vidRes.json();
      if (vidData.error) return res.status(502).json({ error: vidData.error.message });
      (vidData.items || []).forEach(v => { totalSeconds += parseISODuration(v.contentDetails.duration); });
    }

    const hours = Math.round((totalSeconds / 3600) * 10) / 10;
    res.json({ title, hours, videoCount: videoIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
