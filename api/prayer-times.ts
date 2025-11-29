import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { lat, lon, method, date } = req.query;

    if (!lat || !lon || !method || !date) {
        return res.status(400).json({ error: 'Missing required query parameters: lat, lon, method, date' });
    }

    const apiUrl = `http://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=${method}`;

    try {
        const fetchRes = await fetch(apiUrl);
        if (!fetchRes.ok) {
            const errorText = await fetchRes.text();
            return res.status(fetchRes.status).json({ error: `Aladhan API error: ${fetchRes.statusText}`, details: errorText });
        }
        const data = await fetchRes.json();
        res.status(200).json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to fetch prayer times', details: message });
    }
}
