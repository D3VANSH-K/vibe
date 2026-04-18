# ✦ Vibe — Find Your Match

An AI-powered media curation app that recommends movies, series, anime, manga, and books based on your exact "vibe." Describe your mood, select a genre or tone, and let Gemini 1.5 Pro find your next obsession.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

## Features
* **AI-Powered Curation:** Uses Google's Gemini 1.5 Pro model to understand abstract prompts and complex moods.
* **Dual Modes:** Get recommendations for things to **Watch** (Movies/TV/Anime), things to **Read** (Books/Manga/Comics), or **Both** side-by-side.
* **Live Metadata:** Fetches real-time posters, backdrop images, and ratings using the TMDB and Jikan (Anime/Manga) APIs.
* **Modern UI:** Features a sleek, glassmorphic design with animated CSS background blobs and smooth popup transitions.
* **Secure Backend:** API keys are hidden safely inside Vercel Serverless Functions (`/api`), protecting them from public exposure.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Vercel Serverless Functions (Node.js)
* **APIs:** * [Gemini API](https://aistudio.google.com/) (AI Recommendations)
  * [TMDB API](https://developer.themoviedb.org/docs) (Movie/TV Data & Images)
  * [Jikan API](https://jikan.moe/) (Manga Data & Images)

## Local Development Setup

Because this project uses Vercel Serverless Functions to hide API keys, you cannot just open the `index.html` file in your browser to test it locally. You need to use the Vercel CLI.
