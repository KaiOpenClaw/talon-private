# Talon Assets Directory

This directory contains all visual assets for the Talon dashboard.

## Directory Structure

```
docs/images/
├── screenshots/          # High-res dashboard screenshots
├── gifs/                # Feature demonstration GIFs
├── videos/              # Product demo videos
├── graphics/            # Diagrams and infographics
└── README.md            # This file
```

## Required Screenshots (Referenced in README.md)

### High Priority - Referenced in README
- [ ] **dashboard-hero.png** - Main dashboard overview (1920x1080)
- [ ] **dashboard.png** - Dashboard overview for features section
- [ ] **skills.png** - Skills management dashboard 
- [ ] **cron.png** - Cron jobs dashboard
- [ ] **health.png** - System health monitoring

### Additional Screenshots Needed
- [ ] **semantic-search.png** - Search interface with results
- [ ] **agent-workspace.png** - Individual agent workspace view
- [ ] **chat-interface.png** - Agent chat panel
- [ ] **memory-browser.png** - Memory file browser
- [ ] **channels-status.png** - Multi-platform messaging status

## Video Assets Needed

### Product Demos
- [ ] **hero-demo-60s.mp4** - Landing page hero video (60 seconds)
- [ ] **feature-walkthrough.mp4** - Comprehensive demo (3-5 minutes)
- [ ] **setup-guide.mp4** - Deployment walkthrough (5-7 minutes)

### Feature Spotlights (1-2 minutes each)
- [ ] **semantic-search-demo.mp4**
- [ ] **real-time-updates-demo.mp4** 
- [ ] **agent-management-demo.mp4**
- [ ] **cron-jobs-demo.mp4**

## Interactive Assets

### GIFs (< 10MB, optimized for web)
- [ ] **command-palette.gif** - ⌘K interaction
- [ ] **real-time-updates.gif** - Live status changes
- [ ] **search-filtering.gif** - Search with agent filters
- [ ] **memory-editing.gif** - File editing workflow

### Graphics & Diagrams
- [ ] **architecture-diagram.svg** - System architecture
- [ ] **feature-comparison.svg** - Talon vs alternatives
- [ ] **user-journey.svg** - Problem to solution flow

## Quality Standards

### Screenshots
- **Resolution:** 1920x1080 minimum, 2560x1440 preferred  
- **Format:** PNG with transparency where needed
- **Theme:** Dark mode (consistent with product)
- **Browser:** Chrome with clean interface (no bookmarks bar)
- **Content:** Real data, not lorem ipsum
- **Annotations:** Subtle highlights/callouts where helpful

### Videos
- **Resolution:** 1080p minimum, 4K preferred
- **Format:** MP4, H.264 codec
- **Audio:** Clear voiceover, optional background music
- **Duration:** 60s for hero, 3-5min for features, 10min max for tutorials
- **Captions:** Required for accessibility

### GIFs
- **Size:** Under 10MB for fast loading
- **Duration:** 3-10 seconds, looping
- **Quality:** Optimized for web (reduce colors if needed)
- **Focus:** Single feature demonstration

## Current Status

**Missing Assets:** All assets are missing - complete asset creation needed
**Impact:** README.md shows broken image links, no demo materials for marketing
**Priority:** HIGH - Blocking marketing and user onboarding efforts

## Tools & Setup

### Recording Setup
- **Screen Recording:** OBS Studio, QuickTime, or browser dev tools
- **Video Editing:** DaVinci Resolve (free) or Adobe Premiere
- **GIF Creation:** LICEcap, Kap, or ffmpeg
- **Screenshots:** Built-in tools or Lightshot

### Talon Demo Setup
- Local dev server: `npm run dev` (port 4030)
- Sample data: Use real OpenClaw gateway connection
- Clean browser: Incognito mode, proper zoom level
- Multiple agents: Show variety of workspaces

## Production URLs

- **Live Demo:** https://talon-private.vercel.app (current)
- **Render Target:** TBD after deployment
- **Local Dev:** http://localhost:4030

---

**Next Actions:**
1. Set up screen recording environment
2. Create high-priority screenshots first  
3. Generate feature GIFs for immediate value
4. Produce hero demo video for marketing
5. Update README.md links as assets are created