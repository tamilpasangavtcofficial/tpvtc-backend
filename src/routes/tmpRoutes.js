const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMP_BASE_URL = 'https://api.truckersmp.com/v2';
const VTC_ID = process.env.VTC_ID || '73933';

// MOCK DATA FALLBACK (Based on your VTC data)
const MOCK_DATA = {
    profile: {
        error: false,
        response: {
            id: 73933,
            name: "Tamil Pasanga VTC",
            tag: "TAMIL PASANGA",
            created: "2024-01-01 00:00:00",
            members_count: 50,
            description: "Welcome to Tamil Pasanga VTC. A community of professional drivers.",
            logo: "https://static.truckersmp.com/images/vtc/logo/73933.1704067200.png",
            cover: "https://static.truckersmp.com/images/vtc/cover/73933.1704067200.png"
        }
    },
    events: {
        error: false,
        response: [
            {
                id: 25841,
                event_type: { key: "convoy", name: "Convoy" },
                name: "TAMIL PASANGA VTC APRIL 2026 #1 PUBLIC EVENT",
                slug: "25841-tamil-pasanga-vtc-april2026#1-public-event",
                game: "ETS2",
                server: { name: "Event Server" },
                language: "English",
                departure: { location: "Hamburg (Slot)", city: "Hamburg" },
                arrive: { location: "TruckersMP HQ", city: "TruckersMP HQ" },
                meetup_at: "2026-04-02 12:00:00",
                start_at: "2026-04-02 13:00:00",
                banner: "https://static.truckersmp.com/images/event/cover/25841.1728185527.jpg",
                map: "https://static.truckersmp.com/images/event/map/25841.1728185381.png",
                description: "Join us for our monthly public event! We will be driving from Hamburg to TruckersMP HQ."
            }
        ]
    },
    members: {
        error: false,
        response: {
            members: [
                { id: 1, user_id: 1, username: "skbavi", joinDate: "2024-01-01", role: "Developer" }
            ]
        }
    }
};

// Helper for TMP Requests with Proxy Rotation using Axios
const fetchTMP = async (endpoint, mockKey) => {
    const targetUrl = `https://api.truckersmp.com/v2${endpoint}`;
    console.log(`[TMP] Fetching target: ${targetUrl}`);
    
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' };

    // First try direct fetch using Axios
    try {
        console.log(`[TMP] Attempting direct fetch via Axios...`);
        const response = await axios.get(targetUrl, { headers, timeout: 8000 });
        console.log(`[TMP] Direct fetch status: ${response.status}`);
        
        if (response.data && !response.data.error) {
            console.info(`[TMP] ✓ Successfully fetched directly`);
            return response.data;
        }
    } catch (e) {
        console.warn(`[TMP] Direct fetch error:`, e.message);
        if (e.response && e.response.data) {
            console.warn(`[TMP] Cloudflare/Server response preview:`, String(e.response.data).substring(0, 150));
        }
    }

    // List of proxies to try as fallback
    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    ];

    for (const proxyUrl of proxies) {
        try {
            const host = new URL(proxyUrl).hostname;
            console.log(`[TMP] Trying proxy: ${host}...`);
            const response = await axios.get(proxyUrl, { headers, timeout: 8000 });
            console.log(`[TMP] Proxy ${host} status: ${response.status}`);
            
            if (response.data && !response.data.error) {
                console.info(`[TMP] ✓ Successfully fetched via proxy`);
                return response.data;
            }
        } catch (e) {
            console.warn(`[TMP] Proxy error:`, e.message);
        }
    }

    // Final Fallback: Mock Data
    console.info(`[TMP] Using MOCK DATA for ${endpoint}`);
    return MOCK_DATA[mockKey] || { error: true, message: "No data available" };
};



// Get VTC Members
router.get('/vtc/members', async (req, res) => {
    try {
        const data = await fetchTMP(`/vtc/${VTC_ID}/members`, 'members');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed', details: err.message });
    }
});

// Get VTC Profile
router.get('/vtc/profile', async (req, res) => {
    try {
        const data = await fetchTMP(`/vtc/${VTC_ID}`, 'profile');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed', details: err.message });
    }
});

// Get VTC Events
router.get('/vtc/events', async (req, res) => {
    try {
        const data = await fetchTMP(`/vtc/${VTC_ID}/events`, 'events');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed', details: err.message });
    }
});

// Get VTC Attending Events
router.get('/vtc/events/attending', async (req, res) => {
    try {
        const data = await fetchTMP(`/vtc/${VTC_ID}/events/attending`, 'events');
        // Filter mock if needed, or just return mock events
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed', details: err.message });
    }
});

// Get Event Details
router.get('/events/:event_id', async (req, res) => {
    try {
        const { event_id } = req.params;
        const data = await fetchTMP(`/events/${event_id}`, 'events');
        // Return first event from mock if specific ID fails
        if (data.response && Array.isArray(data.response)) {
            const found = data.response.find(e => e.id == event_id);
            res.json({ error: false, response: found || data.response[0] });
        } else {
            res.json(data);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed', details: err.message });
    }
});

module.exports = router;
