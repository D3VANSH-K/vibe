// api/gemini.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { instruction, modelPriority } = req.body;
    
    // Vercel securely pulls this from your Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    for (const modelName of modelPriority) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }] })
            });

            if (response.status === 429 || response.status === 503) continue;
            if (!response.ok) throw new Error("API error: " + response.status);

            const data = await response.json();
            return res.status(200).json(data); // Send the data back to your frontend

        } catch (e) {
            if (modelName === modelPriority[modelPriority.length - 1]) {
                return res.status(500).json({ error: e.message });
            }
        }
    }
}