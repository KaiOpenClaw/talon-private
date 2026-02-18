# 🎬 Talon Video Production Guide

**Complete guide for creating Product Hunt launch videos**

## Required Deliverables

### 1. 30-Second Demo GIF (CRITICAL)
- **Specs**: 1270x760px, <5MB, 30 seconds max
- **Purpose**: Product Hunt listing requirement
- **Priority**: CRITICAL for PH submission

### 2. 90-Second Launch Trailer
- **Purpose**: PH video embed and social media
- **Quality**: Professional with voiceover
- **Priority**: HIGH for maximum impact

---

## Equipment & Software Setup

### Screen Recording Setup
```bash
# Recommended software options:
# macOS: QuickTime Player or ScreenSearch
# Windows: OBS Studio (free)
# Linux: OBS Studio or SimpleScreenRecorder

# OBS Studio Settings:
Resolution: 1280x800 (crops to 1270x760)
FPS: 30 (for recording), 15 (for final GIF)
Bitrate: 2500-5000 kbps
Format: MP4 H.264
```

### Browser Configuration
```json
{
  "resolution": "1280x800",
  "zoom": "100%",
  "theme": "dark",
  "extensions": "disabled",
  "profile": "clean_demo_profile"
}
```

### Demo Environment Setup
```bash
# 1. Start Talon locally with real data
cd /root/clawd/talon-private
npm run dev

# 2. Ensure services are running
systemctl status talon-api
openclaw gateway status

# 3. Pre-populate with demo data
# - Create test agents with varied statuses
# - Set up realistic cron jobs
# - Add sample memory content for search
```

---

## Recording Environment Preparation

### Desktop Setup Checklist
- [ ] **Clean Desktop**: Remove personal files, set neutral wallpaper
- [ ] **Disable Notifications**: Turn off system notifications, Slack, email
- [ ] **Close Applications**: Only browser and recording software open
- [ ] **Set Resolution**: 1280x800 for proper framing
- [ ] **Test Audio**: If recording voiceover, check microphone levels

### Browser Preparation
- [ ] **New Profile**: Create clean browser profile for recording
- [ ] **Disable Extensions**: No ad blockers, dev tools extensions, etc.
- [ ] **Clear Cache**: Fresh browser state
- [ ] **Set Zoom**: 100% zoom level (no browser zoom)
- [ ] **Bookmark URLs**: Quick access to demo pages

### Demo Data Preparation
- [ ] **Realistic Agents**: 15-20 agents with varied names and statuses
- [ ] **Active Sessions**: 5-10 realistic session entries
- [ ] **Cron Jobs**: 25+ jobs with realistic names and schedules
- [ ] **Search Content**: Meaningful memory files for search demos
- [ ] **System Health**: All services showing healthy status

---

## Scene-by-Scene Recording Instructions

### Scene 1: Dashboard Overview (5 seconds)
**URL**: `http://localhost:4000/`

**Actions**:
1. Start with clean dashboard view
2. Show agent sidebar with multiple agents
3. Highlight status indicators (green dots)
4. Display stats in header
5. Hold for 3 seconds to show stability

**Camera Focus**:
- Full dashboard in frame
- Ensure agent list is visible
- Stats clearly readable
- Professional, clean appearance

### Scene 2: Semantic Search (7 seconds)
**URL**: `http://localhost:4000/search`

**Actions**:
1. Navigate to search page (smooth transition)
2. Type query: "vector embeddings" (realistic, relevant)
3. Show results appearing in real-time
4. Hover over agent filter dropdown
5. Click on one result to show navigation

**Camera Focus**:
- Search interface prominently featured
- Results with context snippets visible
- Agent filtering functionality clear
- Smooth typing animation

### Scene 3: Agent Navigation (5 seconds)
**URL**: `http://localhost:4000/`

**Actions**:
1. Return to dashboard
2. Click on different agents in sidebar
3. Show workspace transitions
4. Use keyboard shortcuts (Alt+1, Alt+2)
5. Demonstrate chat interface briefly

**Camera Focus**:
- Sidebar agent selection
- Smooth transitions between agents
- Keyboard navigation visible
- Chat interface preview

### Scene 4: Cron Management (8 seconds)
**URL**: `http://localhost:4000/cron`

**Actions**:
1. Navigate to cron dashboard
2. Show grid of scheduled jobs
3. Hover over job details
4. Show status indicators (✅ running, ⏰ scheduled)
5. Maybe click "Run Now" on one job

**Camera Focus**:
- Full cron dashboard visible
- Job cards with clear status
- Interactive elements highlighted
- Professional operations feel

### Scene 5: Quick Overview (5 seconds)
**URLs**: Multiple quick views

**Actions**:
1. Quick montage of other features:
   - `/skills` - Skills dashboard
   - `/channels` - Channel status
   - `/system` - System health
2. Return to main dashboard
3. End with stable view

**Camera Focus**:
- Quick, smooth transitions
- Each dashboard briefly but clearly shown
- End on main dashboard for stability

---

## Post-Production Workflow

### Video Editing (OBS/DaVinci Resolve/Final Cut)
```bash
# Timeline setup
Duration: Exactly 30 seconds
Frame Rate: 30fps → 15fps conversion
Resolution: 1280x800 → 1270x760 crop
Quality: High compression but <5MB

# Text Overlay Timing
0-3s: "Your OpenClaw Command Center"
7-10s: "Search 1000+ memories instantly" 
14-17s: "Switch between 20+ agents effortlessly"
20-23s: "31 automated tasks running 24/7"
26-28s: "Complete AI Agent Operations Center"
28-30s: "Deploy Your Own → talon.render.com"
```

### GIF Optimization
```bash
# Using FFMPEG (recommended)
ffmpeg -i demo_recording.mp4 -vf "fps=15,scale=1270:760" \
  -c:v gif -f gif demo.gif

# Using Gifski (highest quality)
gifski --fps 15 --width 1270 --height 760 \
  --quality 80 frames/*.png -o demo.gif

# Compression check
ls -lh demo.gif  # Should be <5MB
```

### Quality Checklist
- [ ] **Duration**: Exactly 30 seconds
- [ ] **Size**: File size <5MB
- [ ] **Resolution**: 1270x760px exactly
- [ ] **Frame Rate**: 15fps for smooth playback
- [ ] **Text Readable**: All overlays clear on mobile
- [ ] **No Stuttering**: Smooth playback tested
- [ ] **Professional Feel**: Clean, polished appearance

---

## 90-Second Trailer Production

### Additional Requirements
- **Voiceover**: Professional recording with script
- **Music**: Background track (royalty-free)
- **Quality**: 1080p MP4 for Product Hunt embed

### Voiceover Recording
```bash
# Recording specs
Sample Rate: 48kHz
Bit Depth: 24-bit
Format: WAV (uncompressed)
Environment: Quiet room, good microphone
Delivery: Clear, confident, technical but accessible tone
```

### Music Selection
- **Style**: Modern, subtle tech/productivity
- **Volume**: -20dB to -15dB (background level)
- **Length**: 90 seconds or longer for easy editing
- **License**: Royalty-free or Creative Commons
- **Sources**: Epidemic Sound, AudioJungle, YouTube Audio Library

---

## Distribution Formats

### Product Hunt Requirements
- **Demo GIF**: 1270x760px, <5MB, silent
- **Video Embed**: MP4, up to 1080p, any length
- **Thumbnail**: High-quality still from video

### Social Media Optimizations
```bash
# Twitter/X: Square version
ffmpeg -i trailer.mp4 -vf "scale=1080:1080,pad=1080:1080:(ow-iw)/2:(oh-ih)/2" twitter.mp4

# LinkedIn: Horizontal optimized
ffmpeg -i trailer.mp4 -vf "scale=1200:628" linkedin.mp4

# Instagram: Square + Stories versions
ffmpeg -i trailer.mp4 -vf "scale=1080:1080" instagram_square.mp4
ffmpeg -i trailer.mp4 -vf "scale=1080:1920" instagram_stories.mp4
```

---

## Quality Assurance Testing

### Cross-Platform Testing
- [ ] **Desktop browsers**: Chrome, Firefox, Safari, Edge
- [ ] **Mobile devices**: iOS Safari, Android Chrome
- [ ] **Slow connections**: Test loading on 3G simulation
- [ ] **Different screen sizes**: Tablet and mobile viewing

### Content Validation
- [ ] **All features shown work**: No broken functionality in demo
- [ ] **Realistic data**: No placeholder or test data visible
- [ ] **Professional appearance**: Clean, polished, bug-free
- [ ] **Clear value prop**: Benefits obvious within first 10 seconds

### File Optimization
- [ ] **Compression balance**: Quality vs file size
- [ ] **Loading speed**: <3 seconds on average connection
- [ ] **Compatibility**: Plays on all major platforms
- [ ] **Accessibility**: Captions available if needed

---

## Emergency Backup Plans

### If GIF Size Too Large
1. **Reduce FPS**: 15fps → 12fps → 10fps
2. **Crop Further**: Focus on most important UI elements
3. **Reduce Duration**: 30s → 25s (keep core features)
4. **Lower Quality**: Reduce colors/compression slightly

### If Recording Quality Poor
1. **Re-record segments**: Don't accept poor quality
2. **Screen scaling**: Use higher resolution, scale down
3. **Lighting**: Ensure proper screen brightness/contrast
4. **Stability**: Use tripod or stable setup for consistency

### If Demo Data Insufficient
1. **Pre-populate**: Create realistic agent data
2. **Mock services**: Use JSON fixtures if APIs unavailable  
3. **Staging environment**: Set up dedicated demo instance
4. **Fallback screens**: Static high-quality screenshots as backup

---

## Timeline & Milestones

### Phase 1: Preparation (Day 1)
- [ ] Set up recording environment
- [ ] Prepare demo data and services
- [ ] Practice run-through of demo flow
- [ ] Test all equipment and software

### Phase 2: Recording (Day 1-2)
- [ ] Record 30-second demo GIF
- [ ] Record 90-second trailer footage
- [ ] Capture B-roll and additional shots
- [ ] Record voiceover with proper equipment

### Phase 3: Post-Production (Day 2-3)
- [ ] Edit and optimize demo GIF
- [ ] Create 90-second trailer with music/VO
- [ ] Generate social media variants
- [ ] Quality test across platforms

### Phase 4: Delivery (Day 3)
- [ ] Upload to Product Hunt requirements
- [ ] Prepare social media distribution
- [ ] Create backup versions and formats
- [ ] Document assets for future use

---

**Professional video assets ready for launch!** 🎬