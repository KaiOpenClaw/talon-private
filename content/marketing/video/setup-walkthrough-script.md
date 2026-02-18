# Talon Setup Walkthrough Video Script

**Target Resolution:** 1270x760px  
**Duration:** 3-5 minutes  
**File Format:** MP4  
**File Size:** <50MB  
**Purpose:** Reduce support questions and onboard new users

## Scene 1: Introduction (0-30s)
**Visual:** Talon logo and dashboard preview
**Text Overlay:** "Talon Setup: From Zero to Dashboard in 5 Minutes"
**Narration:** "Welcome! This walkthrough will get your Talon dashboard running with your OpenClaw agents in just a few minutes."

### Show:
- Final result: Working dashboard
- Key benefits: Professional UI, real-time monitoring
- Prerequisites overview

---

## Scene 2: Prerequisites Check (30s-1m)
**Visual:** Checklist with checkmarks
**Narration:** "Before we start, make sure you have these ready."

### Prerequisites Checklist:
- ✅ **OpenClaw Gateway running** (show `openclaw status`)
- ✅ **GitHub account** for deployment
- ✅ **Render account** (free tier works)
- ✅ **5 minutes of time**

**Show terminal commands:**
```bash
# Verify OpenClaw is running
openclaw status
openclaw sessions  # Should show some data
```

---

## Scene 3: Deploy to Render (1m-3m)
**Visual:** Screen recording of actual deployment process

### Step 1: Fork Repository (1m-1m30s)
**Narration:** "First, we'll fork the Talon repository to your GitHub account."

**Show:**
1. Navigate to `github.com/TerminalGravity/talon-private`
2. Click "Fork" button
3. Select your GitHub account
4. Repository is forked successfully

### Step 2: Connect to Render (1m30s-2m30s)
**Narration:** "Now we'll connect your fork to Render for automatic deployment."

**Show:**
1. Login to Render.com
2. Click "New +" → "Web Service"
3. Connect GitHub account (if needed)
4. Select your `talon-private` fork
5. Configure deployment settings:
   - **Name:** `talon-dashboard` (or your preference)
   - **Region:** Choose closest to your location
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

### Step 3: Environment Variables (2m30s-3m)
**Narration:** "The crucial step: configuring your environment variables."

**Show adding these variables:**
```
GATEWAY_URL=https://your-tailscale-url:5050
GATEWAY_TOKEN=your-gateway-token
TALON_API_URL=https://your-api-url
TALON_API_TOKEN=your-api-token
OPENAI_API_KEY=your-openai-key
TALON_AUTH_TOKEN=your-secure-auth-token
```

**Explain where to find each:**
- **GATEWAY_URL:** From `~/.openclaw/openclaw.json`
- **GATEWAY_TOKEN:** Same config file
- **OPENAI_API_KEY:** For semantic search (optional)
- **TALON_AUTH_TOKEN:** Generate secure random string

---

## Scene 4: First Launch (3m-4m)
**Visual:** Deployment progress and first login

### Deployment Process (3m-3m30s)
**Narration:** "Render will now build and deploy your dashboard."

**Show:**
1. Deployment logs scrolling
2. Build progress indicators
3. "Deploy succeeded" message
4. Live URL generation

### First Login (3m30s-4m)
**Narration:** "Your dashboard is ready! Let's log in."

**Show:**
1. Click generated URL
2. Login page with token field
3. Enter auth token
4. Dashboard loads with real data

---

## Scene 5: Feature Tour (4m-5m)
**Visual:** Quick tour of main features

**Narration:** "Let's quickly explore what you can do."

### Quick Tour Highlights:
1. **Real-time Sessions** (10s)
   - Live agent activity
   - Session monitoring

2. **Semantic Search** (10s)
   - Press ⌘K
   - Search agent memories

3. **Automation Control** (15s)
   - Cron jobs dashboard
   - Skills management

4. **Professional Interface** (10s)
   - Mobile responsive
   - Dark theme
   - Real-time updates

---

## Scene 6: Troubleshooting Tips (5m-5m30s)
**Visual:** Common issues and solutions
**Text Overlay:** "Common Issues & Solutions"

### Quick Troubleshooting:
- **Build fails:** Check environment variables
- **Gateway connection errors:** Verify Tailscale URL
- **Search not working:** OpenAI API key needed
- **Auth issues:** Regenerate TALON_AUTH_TOKEN

**Show resources:**
- GitHub Issues for support
- Documentation links
- Discord community

---

## Scene 7: Next Steps (5m30s-6m)
**Visual:** Dashboard with call-to-action overlays

**Narration:** "Congratulations! Your Talon dashboard is ready."

### Encourage:
- ⭐ Star the repository
- 🐛 Report issues on GitHub
- 💬 Join the community
- 📚 Explore advanced features

**Final Text Overlay:** "Professional AI Agent Management - Simplified"

---

## Technical Production Notes

### Recording Environment
- Clean macOS/Linux desktop
- Browser in full screen mode
- Stable internet connection
- Real OpenClaw instance running

### Screen Recording
- **Resolution:** 1270x760px (Product Hunt standard)
- **Frame Rate:** 30 FPS
- **Audio:** Clear narration, no background music during technical steps
- **Cursor:** Smooth movement, highlight clicks

### Post-Production
- **Editing:** Cut out waiting time, keep only essential steps
- **Captions:** Full transcript for accessibility
- **Chapters:** Mark timestamps for easy navigation
- **End Cards:** Links to repository and documentation

### Quality Checklist
- [ ] All text is readable at target resolution
- [ ] No personal information visible
- [ ] Real data shows properly (not errors)
- [ ] Audio is clear throughout
- [ ] Video loops smoothly if used as GIF
- [ ] File size under 50MB for easy sharing

## Success Metrics

### User Experience Goals
- **Completion Rate:** >80% of viewers complete setup
- **Support Reduction:** 50% fewer setup-related questions
- **Conversion:** More GitHub stars and Render deployments

### Distribution Strategy
- **Primary:** GitHub README embed
- **Secondary:** Documentation site
- **Social:** Twitter thread with key snippets
- **Community:** Discord #tutorials channel

### Analytics Tracking
- Video view completion rates
- GitHub repository traffic from video
- Render deployment increases
- Support ticket reduction

---
*This script supports Issue #91 - Complete Video Content Gap*
*Estimated production time: 4-6 hours including editing*
*Target: Professional quality that reduces support burden*