# SigBlock Parser

Mobile-optimized web app to parse email signature blocks using Claude AI and export as vCard contacts.

**Private Tool:** Unlisted URL for personal use
**Live URL:** https://sigblock.jonathonmarsden.com

> **Note:** This is the web app version. For the macOS Shortcut version (right-click integration), see [sigblock-parser-shortcut](../sigblock-parser-shortcut)

## Features

- **Mobile-First Design** - Optimised for phones and tablets
- **AI-Powered Parsing** - Uses Claude 3.5 Sonnet for intelligent extraction
- **Download vCards** - Save contacts directly to your device
- **Native Sharing** - Share via Messages, Mail, AirDrop, or any app
- **Privacy-Focused** - No data storage, ephemeral processing
- **Unlisted** - Not indexed by search engines (robots.txt + noindex)
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Fast** - Next.js with API routes for secure processing

## Development

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` (copy from `.env.example`):
   ```bash
   ANTHROPIC_API_KEY=your-api-key-here
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:
1. Push to GitHub (can be public or private repo)
2. Import to Vercel
3. Add environment variable:
   - `ANTHROPIC_API_KEY` - Your Claude API key
4. Configure custom domain: `sigblock.jonathonmarsden.com`

**Privacy Note:** The site is unlisted (robots.txt + noindex meta tags) so search engines won't find it. Share the URL only with trusted friends.

## Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Anthropic Claude API
- Lucide React Icons

Created by Jonathon Marsden • October 2025
