import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { city, country, method, lat, lon, directUrl } = req.query;

    let apiUrl = '';
    
    if (directUrl && typeof directUrl === 'string') {
        try {
            // Basic validation to ensure it's a somewhat valid URL
            new URL(directUrl);
            apiUrl = directUrl;
        } catch (e) {
             return res.status(400).json({ error: 'Invalid directUrl parameter.' });
        }
    } else if (lat && lon) {
        const date = new Date().toISOString().split('T')[0];
        apiUrl = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=${method || 5}`;
    } else if (city && country) {
        apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${String(city)}&country=${String(country)}&method=${method || 5}`;
    } else {
        return res.status(400).json({ 
            error: 'Missing required query parameters.',
            details: 'Either lat/lon, city/country, or a directUrl are required.' 
        });
    }

    try {
        const apiResponse = await fetch(apiUrl);
        const responseText = await apiResponse.text();

        if (!responseText) {
             return res.status(502).json({ error: 'Bad Gateway: Empty response from provider.' });
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response from API. URL:', apiUrl, 'Response:', responseText);
            return res.status(502).json({ error: 'Bad Gateway: Invalid JSON response from provider.' });
        }
        
        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({ error: 'Failed to fetch from provider.', details: data });
        }

        if (data.code !== 200 || typeof data.data?.timings !== 'object') {
             return res.status(502).json({ error: 'Bad Gateway: Unexpected data structure from provider.' });
        }

        res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error proxying request to API:', error);
        return res.status(500).json({ error: 'Internal Server Error while contacting the provider.' });
    }
}