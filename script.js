// ================= CONFIGURATION =================
const MODEL_PRIORITY = [
  "gemini-3.1-pro-preview", // The absolute smartest, most current model
  "gemini-2.5-pro",         // The stable Pro version
  "gemini-2.5-flash",       // Super fast fallback just in case
  "gemini-1.5-pro"          // Legacy fallback
];
// ----------------------------------------

let currentMode = "watch";

// --- DOM Elements ---
const modeBtns       = document.querySelectorAll('.mode-btn');
const popupOverlay   = document.getElementById('popupOverlay');
const universalPopup = document.getElementById('universalPopup');
const loadingView    = document.getElementById('loadingView');
const resultView     = document.getElementById('resultView');
const closeBtn       = document.getElementById('closeBtn');

// --- Mode Switching ---
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    });
});

// --- Filter Toggle ---
window.toggleFilters = function () {
    const panel = document.getElementById('filterPanel');
    const arrow = document.getElementById('filterArrow');
    panel.classList.toggle('open');
    arrow.classList.toggle('open');
};

// --- Close Popup ---
window.closePopup = function () {
    popupOverlay.classList.add('hidden');
    setTimeout(() => {
        universalPopup.style.width  = '300px';
        universalPopup.style.height = '300px';
        loadingView.classList.remove('hidden');
        resultView.classList.add('hidden');
        closeBtn.classList.add('hidden');
        resultView.innerHTML = '';
    }, 380);
};

popupOverlay.addEventListener('click', e => {
    if (e.target === popupOverlay) window.closePopup();
});

// --- Main Entry Point ---
window.startCurating = async function () {
    const prompt = document.getElementById('userPrompt').value.trim();
    const genre  = document.getElementById('genreInput').value.trim();
    const mood   = document.getElementById('moodInput').value.trim();
    const tone   = document.getElementById('toneInput').value.trim();

    if (!prompt && !genre && !mood && !tone) {
        return alert("Give me a hint — describe the vibe, genre, or mood.");
    }

    // Show loading popup
    popupOverlay.classList.remove('hidden');
    universalPopup.style.width  = '300px';
    universalPopup.style.height = '300px';
    loadingView.classList.remove('hidden');
    resultView.classList.add('hidden');
    closeBtn.classList.add('hidden');

    try {
        const aiData = await getGeminiRecommendation(prompt, genre, mood, tone, currentMode);

        let finalData;
        if (currentMode === 'both') {
            const watchMeta = await fetchMeta(aiData[0].title, 'watch');
            const readMeta  = await fetchMeta(aiData[1].title, 'read');
            finalData = {
                watch: { ...aiData[0], ...watchMeta },
                read:  { ...aiData[1], ...readMeta  }
            };
        } else {
            const meta = await fetchMeta(aiData.title, currentMode);
            finalData  = { ...aiData, ...meta };
        }

        renderLayout(finalData);

    } catch (err) {
        console.error(err);
        alert("Vibe couldn't find a match. Please try again!");
        window.closePopup();
    }
};

// --- API Calls to Secure Vercel Backend ---

async function getGeminiRecommendation(prompt, genre, mood, tone, mode) {
    let details = [];
    if (genre) details.push(`Genre: ${genre}`);
    if (mood)  details.push(`Mood: ${mood}`);
    if (tone)  details.push(`Tone: ${tone}`);

    const context = `Mode: ${mode}. Preferences: ${details.join(", ") || 'None'}`;
    let instruction = "";

    if (mode === 'both') {
        instruction = `
            Act as an elite media curator. User Request: "${prompt}". Context: ${context}.
            Recommend TWO titles:
            1. A Watchable title (Movie/Series/Anime).
            2. A Readable title (Manga/Book/Comic).
            Both must perfectly fit the vibe.
            Output JSON ONLY (no markdown fences):
            [
                { "title": "Watch Title", "year": "YYYY", "reason": "Short reason.", "type": "watch" },
                { "title": "Read Title",  "year": "YYYY", "reason": "Short reason.", "type": "read"  }
            ]
        `;
    } else {
        instruction = `
            Act as an elite media curator. User Request: "${prompt}". Context: ${context}.
            Recommend ONE title (${mode} category).
            Output JSON ONLY (no markdown fences):
            { "title": "Title", "year": "YYYY", "reason": "Short reason why it fits.", "match_score": "95" }
        `;
    }

    const res = await fetch('/api/gemini', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, modelPriority: MODEL_PRIORITY })
    });

    if (!res.ok) throw new Error("Backend error: " + res.status);

    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const jsonStr = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
}

async function fetchMeta(title, mode) {
    try {
        const res = await fetch('/api/meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, mode })
        });
        
        if (!res.ok) throw new Error("Meta fetch failed");
        return await res.json();
    } catch (e) {
        console.warn("Metadata error:", e);
        return { poster: null, rating: "N/A" };
    }
}

// --- Render Results ---
function renderLayout(data) {
    let html = "";

    if (currentMode === 'watch' || currentMode === 'read') {
        universalPopup.style.width  = '800px';
        universalPopup.style.height = '440px';

        const imgUrl  = currentMode === 'watch' ? (data.backdrop || data.poster) : data.poster;
        const fallback = 'https://via.placeholder.com/400x600/EDE9FE/7B5CF6?text=Vibe';
        const modeLabel = currentMode === 'watch' ? '▶ Watch' : '◉ Read';

        html = `
            <div class="layout-single">
                <div class="poster-area">
                    <img src="${imgUrl || fallback}" alt="${data.title}" onerror="this.src='${fallback}'">
                </div>
                <div class="info-area">
                    <span class="res-badge">${modeLabel}</span>
                    <h2 class="res-title">${data.title}</h2>
                    <span class="res-meta">${data.year}  ·  ★ ${data.rating}</span>
                    <div class="res-divider"></div>
                    <p class="res-desc">${data.reason}</p>
                    <button class="reroll-btn" onclick="startCurating()">Try another →</button>
                </div>
            </div>
        `;

    } else if (currentMode === 'both') {
        universalPopup.style.width  = '880px';
        universalPopup.style.height = '540px';

        const watchFallback = 'https://via.placeholder.com/400x300/EDE9FE/7B5CF6?text=Watch';
        const readFallback  = 'https://via.placeholder.com/300x400/EDE9FE/7B5CF6?text=Read';

        html = `
            <div style="display:flex; flex-direction:column; width:100%; height:100%;">
                <div class="layout-both">
                    <div class="double-card">
                        <img class="double-poster"
                             src="${data.watch.backdrop || data.watch.poster || watchFallback}"
                             alt="${data.watch.title}"
                             onerror="this.src='${watchFallback}'">
                        <div class="double-info">
                            <span class="double-badge">▶ Watch</span>
                            <h3>${data.watch.title}</h3>
                            <span class="double-meta">${data.watch.year}  ·  ★ ${data.watch.rating}</span>
                            <p class="double-desc">${data.watch.reason}</p>
                        </div>
                    </div>

                    <div class="double-card">
                        <img class="double-poster"
                             src="${data.read.poster || readFallback}"
                             alt="${data.read.title}"
                             onerror="this.src='${readFallback}'">
                        <div class="double-info">
                            <span class="double-badge">◉ Read</span>
                            <h3>${data.read.title}</h3>
                            <span class="double-meta">${data.read.year}  ·  ★ ${data.read.rating}</span>
                            <p class="double-desc">${data.read.reason}</p>
                        </div>
                    </div>
                </div>

                <div class="both-footer">
                    <button class="reroll-btn" onclick="startCurating()">Try another set →</button>
                </div>
            </div>
        `;
    }

    resultView.innerHTML = html;

    setTimeout(() => {
        loadingView.classList.add('hidden');
        resultView.classList.remove('hidden');
        closeBtn.classList.remove('hidden');
    }, 160);
}
