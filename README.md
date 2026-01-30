# Vibe Check 🔵

> Instant trust & reputation analysis for any wallet on Base

![Base](https://img.shields.io/badge/Base-0052FF?style=for-the-badge&logo=base&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Overview

Vibe Check is a sleek, single-purpose web application that provides instant trust and reputation analysis for any wallet address on the Base network. Think of it as a "credit score" for the decentralized world.

### Key Features

- 🎯 **Address Input** - Enter any Base wallet address or ENS name
- 📊 **Visual Score Display** - Animated gauge showing Ethos reputation score (0-2800)
- 📈 **Key Metrics** - Reviews, vouches, XP, and attestation badges
- 🤖 **AI-Powered Analysis** - Human-readable insights powered by Claude AI
- 🌙 **Dark Theme** - Modern, premium FinTech aesthetic
- 📱 **Responsive** - Works perfectly on desktop and mobile

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **APIs:** 
  - [Ethos Network API](https://developers.ethos.network/) - On-chain reputation data
  - [Anthropic Claude API](https://docs.anthropic.com/) - AI analysis
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibe-check.git
cd vibe-check
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vibe-check/
├── app/
│   ├── api/
│   │   └── check-vibe/
│   │       └── route.ts      # API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── badge.tsx
│   │   ├── base-logo.tsx
│   │   ├── icons.tsx
│   │   └── skeleton.tsx
│   ├── MetricCard.tsx        # Stats display
│   ├── ScoreGauge.tsx        # Animated gauge
│   ├── VibeAnalysis.tsx      # AI analysis display
│   └── index.ts              # Component exports
├── lib/
│   ├── claude.ts             # Claude AI client
│   ├── ethos.ts              # Ethos API client
│   └── utils.ts              # Utilities
├── types/
│   └── index.ts              # TypeScript types
└── public/                   # Static assets
```

## API Reference

### POST /api/check-vibe

Analyzes a wallet address and returns reputation data with AI analysis.

**Request:**
```json
{
  "address": "0x..."
}
```

**Response:**
```json
{
  "ethosData": {
    "score": 1847,
    "displayName": "username.eth",
    "stats": { ... }
  },
  "aiAnalysis": {
    "oneWordSummary": "Good",
    "analysis": "...",
    "recommendation": "..."
  },
  "timestamp": "2024-01-15T..."
}
```

## Score Levels

| Score Range | Level | Color |
|-------------|-------|-------|
| 2000-2800 | Excellent | Green |
| 1600-1999 | Good | Blue |
| 1200-1599 | Neutral | Yellow |
| 800-1199 | Questionable | Orange |
| 0-799 | Risky | Red |

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `ANTHROPIC_API_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vibe-check)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Claude API key |
| `NEXT_PUBLIC_APP_URL` | No | App URL (defaults to localhost) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Ethos Network](https://ethos.network) - On-chain reputation protocol
- [Base](https://base.org) - L2 blockchain
- [Anthropic](https://anthropic.com) - Claude AI

---

Built with 💙 for the Base ecosystem
