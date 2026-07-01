# VAD Keyword Detector

A real-time **Voice Activity Detection (VAD)** web app that uses the browser's microphone to detect speech, extract keywords using the **Gemini AI API**, and read them back using Text-to-Speech.

---

## Features

- 🎙️ **Real-time VAD** — detects when you start and stop speaking using RMS amplitude analysis
- 🔊 **Live waveform visualizer** — animated sine-wave canvas that reacts to your voice
- 🤖 **Gemini AI keyword extraction** — audio is sent to Gemini 2.5 Flash to extract 3–5 key terms
- 🗣️ **Text-to-Speech playback** — detected keywords are read aloud by a browser speech synthesizer
- 💬 **Talking Avatar** — animated SVG face that lip-syncs with both listening and speaking states
- 📋 **Keyword history** — timestamped list of all detected keywords with active highlight during playback
- ⚙️ **Configurable settings** — adjustable VAD threshold and silence timeout slider controls

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Vanilla CSS (glassmorphism dark theme) |
| Audio | Web Audio API (`AudioContext`, `AnalyserNode`, `MediaRecorder`) |
| AI | Google Gemini 2.5 Flash (`generateContent` REST API) |
| TTS | Browser `SpeechSynthesis` API |
| Icons | Lucide React |

---

## Project Structure

```
vad-keyword-detector/
├── src/
│   ├── components/
│   │   ├── TalkingAvatar.jsx   # Animated SVG avatar with lip-sync
│   │   └── KeywordCards.jsx    # Keyword history list component
│   ├── App.jsx                 # Main app logic (VAD, Gemini API, TTS)
│   ├── index.css               # Global styles & design system
│   └── main.jsx                # React entry point
├── index.html                  # HTML shell
├── config.json                 # API key configuration
├── package.json                # Project dependencies
└── vite.config.js              # Vite build configuration
```

---

## Setup & Run

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Gemini API Key

Edit `config.json` in the project root:

```json
{
  "GEMINI_API_KEY": "your-api-key-here"
}
```

Get a free key at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How It Works

1. Click **Start Detector Session** — microphone access is requested
2. The app continuously analyzes audio using `getFloatTimeDomainData` to compute **RMS amplitude**
3. When volume exceeds the **VAD threshold**, recording begins via `MediaRecorder`
4. After a configurable **silence timeout**, the recording is stopped and sent to **Gemini API** as base64 audio
5. Gemini extracts 3–5 keywords and returns them as a JSON array
6. Keywords are displayed as cards with timestamps and **read aloud** via `SpeechSynthesis`

---

## Configuration

| Setting | Default | Description |
|---|---|---|
| VAD Threshold | 15 | RMS amplitude level (0–60) that triggers speech detection |
| Silence Timeout | 1500ms | How long silence must last before ending a recording |

---

## Browser Requirements

- Modern Chromium browser (Chrome, Edge) recommended
- Microphone permission required
- `MediaRecorder`, `AudioContext`, and `SpeechSynthesis` APIs must be supported
