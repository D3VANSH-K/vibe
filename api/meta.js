// api/meta.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, mode } = req.body;
    
    // Vercel securely pulls this from your Environment Variables
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    
    const TMDB_BASE_URL = "https://api.themoviedb.org/3";
    const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/original";
    const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

    let meta = { poster: null, rating: "N/A", backdrop: null };

    try {
        if (mode === 'watch') {
            // Fetch from TMDB securely
            const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
            const data = await response.json();
            
            if (data.results?.length) {
                const item = data.results[0];
                meta.poster = item.poster_path ? TMDB_IMAGE_URL + item.poster_path : null;
                meta.backdrop = item.backdrop_path ? TMDB_IMAGE_URL + item.backdrop_path : meta.poster;
                meta.rating = item.vote_average ? item.vote_average.toFixed(1) + "/10" : "N/A";
            }
        } else {
            // Fetch from Jikan (doesn't need a key, but keeps our frontend clean!)
            const response = await fetch(`${JIKAN_BASE_URL}/manga?q=${encodeURIComponent(title)}&limit=1`);
            const data = await response.json();
            
            if (data.data?.length) {
                const item = data.data[0];
                meta.poster = item.images.jpg.large_image_url;
                meta.rating = item.score ? item.score + "/10" : "N/A";
            }
        }
        
        return res.status(200).json(meta);
        
    } catch (error) {
        console.error("Meta fetch error:", error);
        return res.status(500).json({ error: 'Failed to fetch metadata' });
    }
}