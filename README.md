# 🏛️ Relic AI — Real-Time AI Heritage Scanner

Relic AI is a cinematic AI-powered heritage and monument scanner built with Next.js 16, React 19, Tailwind CSS 4, and Gemini AI.

Users can:

* Scan monuments using live camera
* Upload heritage images
* Get instant AI analysis
* Hear AI voice narration
* Experience cinematic scanning UI

---

# ✨ Features

## 📷 Live Camera Scanner

* Real-time camera access
* Mobile rear-camera support
* AI scanning HUD overlay
* Auto capture + scan workflow
* Camera switching support

## 🖼️ Image Upload

* Upload monument images
* Preview before scanning
* AI-powered analysis

## 🤖 Gemini AI Analysis

AI returns:

* Monument name
* Country
* Historical period
* Architecture style
* Civilization/Culture
* Interesting facts
* Tourism tips
* Historical significance

## 🎙️ Voice Narration

* AI voice explanation
* Mute/unmute controls
* Auto narration on scan result

## 🎨 Cinematic UI

* Animated particles
* Glassmorphism effects
* Green AI glow effects
* Scanning animations
* Futuristic HUD interface

---

# 🛠️ Tech Stack

* Next.js 16
* React 19
* Tailwind CSS 4
* Gemini 2.5 Flash Lite
* TypeScript
* Web Speech API
* MediaDevices Camera API

---

# 📂 Project Structure

```bash id="w67j8o"
app/
├── page.tsx
├── globals.css
├── api/
│   └── scan/
│       └── route.ts
├── components/
│   ├── CameraScanner.tsx
│   ├── ImageUploader.tsx
│   ├── ResultCard.tsx
│   ├── VoiceNarration.tsx
│   ├── ScanningOverlay.tsx
│   ├── Particles.tsx
│   └── StatusBadge.tsx
├── hooks/
│   ├── useCamera.ts
│   └── useSpeechSynthesis.ts
└── lib/
    └── parseAIResponse.ts
```

---

# ⚙️ Environment Setup

Create `.env.local`

```env id="2mylpc"
GEMINI_API_KEY=your_gemini_api_key_here
```

---

# 🚀 Installation

```bash id="ifwsvk"
git clone https://github.com/yourusername/relic-ai.git

cd relic-ai

npm install

npm run dev
```

---

# 🔥 Workflow

## Create New Feature Branch

```bash id="f70n3q"
git checkout -b new-ui-update
```

## Commit Changes

```bash id="e0n6eh"
git add .
git commit -m "updated cinematic ui"
```

## Push Changes

```bash id="g91s1j"
git push origin new-ui-update
```

---

# 🌍 Vision

Relic AI transforms monument exploration into a futuristic cinematic AI experience by combining:

* Artificial Intelligence
* Real-time scanning
* Interactive storytelling
* Heritage education
* Cinematic design

---

# 📸 Future Features

* AR monument overlay
* Multi-language narration
* 3D monument reconstruction
* Offline AI scanning
* Global heritage database
* AI travel assistant

---

# 🧠 Powered By

* Google Gemini AI
* Next.js
* Tailwind CSS
* React

---

# 📄 License

MIT License
