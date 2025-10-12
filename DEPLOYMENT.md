# Deployment Guide

## Privacy Approach

This tool uses **"security by obscurity"** - it's unlisted and not indexed by search engines:
- ✅ **robots.txt** blocks all crawlers
- ✅ **noindex meta tags** prevent SEO indexing  
- ✅ **Unlisted URL** - only people you share it with can find it
- ✅ **No password needed** - easy to use on mobile

## Pre-Deployment Checklist

- [x] robots.txt added
- [x] noindex meta tags in layout
- [x] Environment variable configured
- [x] README documentation complete
- [ ] Test locally
- [ ] Create GitHub repository
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Test production deployment
- [ ] Share URL with trusted friends

## GitHub Setup

```bash
cd ~/Projects/sigblock-parser

# Check git status
git status

# Add all files
git add .
git commit -m "Initial commit: SigBlock Parser web app"

# Create GitHub repo (public is fine - code is open, API key is not)
gh repo create sigblock-parser --public --source=. --remote=origin --push
```

## Vercel Deployment

### 1. Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your `sigblock-parser` repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (default)

### 2. Configure Environment Variable

Add in Vercel Project Settings → Environment Variables:

```
ANTHROPIC_API_KEY=your-api-key-here
```

### 3. Deploy

Click "Deploy" - Vercel will build and deploy to `.vercel.app`

### 4. Configure Custom Domain

1. In Vercel Project Settings → Domains
2. Add domain: `sigblock.jonathonmarsden.com`
3. Vercel will provide DNS records
4. Add to your DNS provider:
   - Type: `CNAME`
   - Name: `sigblock`
   - Value: `cname.vercel-dns.com`

### 5. Test Production

1. Visit `https://sigblock.jonathonmarsden.com`
2. No password prompt - just loads directly
3. Test parsing a signature
4. Verify Download and Share buttons work

## Sharing with Friends

Simply share the URL:
```
https://sigblock.jonathonmarsden.com
```

They can:
- Bookmark it
- Add to home screen on mobile
- Use immediately, no login needed

## Privacy & Security

**How it stays private:**
- Google/Bing/etc won't index it (robots.txt + noindex)
- No links to it from other sites
- Only people you tell will know about it
- Domain name isn't guessable

**If you ever need stricter security:**
- Add Vercel password protection in project settings
- Or add IP allowlist
- Or implement simple PIN code in the app

## Monitoring

- Check Vercel Dashboard for build status
- Monitor API usage in Anthropic Console
- Watch for any errors in Vercel Logs

If you see unexpected API usage, you can:
1. Check Vercel Analytics to see traffic
2. Add rate limiting (10 requests per IP per hour)
3. Add Vercel password protection as backup

## Updates

To deploy updates:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically rebuild and deploy.

---

**Last Updated:** October 12, 2025
