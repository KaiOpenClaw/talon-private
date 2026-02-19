# Social Media Code Snippet Cards

## Card 1: Agent Management
```typescript
// From scattered CLI commands...
cd /agents/marketing
openclaw agent -m "write newsletter"
cd ../development  
openclaw agent -m "review PR #142"

// To unified dashboard
const response = await sendMessage({
  agent: 'marketing',
  message: 'write newsletter'
});
```
**Caption**: "Stop juggling 20+ terminal windows. Manage all agents from one dashboard. 🚀"

## Card 2: Semantic Search
```typescript
// Vector search across ALL agent memories
const results = await searchWorkspace({
  query: "rate limiting best practices",
  agents: ["backend", "api", "infra"],
  minScore: 0.8
});

// Returns: relevant chunks from 780+ indexed docs
// Search time: <100ms
```
**Caption**: "Find any conversation instantly. Vector-powered search across 20+ agents. 🔍"

## Card 3: Real-time Monitoring
```typescript
// Live dashboard updates
const { jobs, health } = useRealTimeData();

// Monitor 31+ cron jobs
jobs.map(job => ({
  name: job.name,
  status: job.lastRun.success ? '✅' : '❌',
  nextRun: formatTime(job.nextRun)
}));
```
**Caption**: "Never wonder if your automation is working. Real-time status for everything. 📊"

## Card 4: Session Orchestration  
```typescript
// Spawn sub-agents with one click
const research = await spawnAgent({
  task: "Research competitor pricing strategies",
  agent: "market-research",
  timeout: "30m"
});

// Monitor, steer, or kill anytime
await steeredAgent(research.id, "focus on SaaS pricing");
```
**Caption**: "Coordinate complex workflows visually. Multi-agent orchestration made simple. 🎛️"

## Card 5: Skills Management
```typescript
// Visual skill installation
const skills = await listSkills();
// 49 capability packs available

await installSkill('github-integration');
await enableSkill('openai-image-gen'); 
await configureSkill('notion', { token: '...' });

// No more CLI dependency hell
```
**Caption**: "49 capability packs. Visual install/enable/configure. Zero dependency hell. 🛠️"

## Card 6: Production Architecture
```typescript
// Built for scale from day one
export const config = {
  runtime: 'Next.js 14',
  database: 'LanceDB vector store',
  search: 'OpenAI embeddings',
  realtime: 'WebSocket updates',
  auth: 'JWT tokens',
  deploy: 'One-click Render'
};
```
**Caption**: "Production-ready architecture. Scale from 1 to 100+ agents seamlessly. ⚡"

## Social Media Templates

### Twitter Thread Template
```
🔥 Thread: [Hook statement about agent management]

[Code snippet card image]

Here's how we [solved specific problem]:

[Technical explanation in 2-3 tweets]

Full tutorial: [link]
GitHub: [link]

RT if this helps your workflow! 🚀
```

### LinkedIn Post Template
```
Managing multiple AI agents is harder than it looks.

[Code snippet image]

What started as "a few helpful bots" quickly becomes:
• 20+ terminal windows
• Scattered conversation histories  
• Manual status checking
• Zero coordination between agents

We built Talon to solve this exact problem.

[Technical details and benefits]

Full guide in comments 👇
```

### Instagram Story Template
```
Story 1: "POV: You're managing 20 AI agents" [chaos image]
Story 2: [Code snippet card] "There's a better way..."
Story 3: [Dashboard screenshot] "One interface. All agents."  
Story 4: "Link in bio for tutorial 👆"
```

## Code Snippet Styling (CSS)

```css
.code-snippet-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  font-family: 'JetBrains Mono', monospace;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 600px;
}

.code-block {
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 24px;
  margin: 16px 0;
  font-size: 14px;
  line-height: 1.5;
}

.caption {
  font-size: 18px;
  font-weight: 600;
  margin-top: 20px;
  text-align: center;
}

.logo {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
}
```

## Platform-Specific Formats

### Twitter/X Cards (1200x675px)
- White text on gradient background
- Large, readable code snippets
- Talon logo in corner
- Strong caption at bottom

### LinkedIn Cards (1200x627px)  
- Professional blue/purple gradient
- Clean typography
- Business-focused captions
- Subtle branding

### Instagram Posts (1080x1080px)
- Square format
- Bright, engaging colors
- Shorter code snippets
- Mobile-optimized text sizes

### Dev.to Article Images (1000x420px)
- Developer-friendly styling
- Dark theme code blocks  
- Technical accuracy emphasis
- Community-focused messaging

## Gif Creation Scripts

### Quick Demo GIF
```bash
# Create 30-second demo showing:
# 1. Agent selection (3s)
# 2. Message send (5s)  
# 3. Response received (7s)
# 4. Search across agents (10s)
# 5. Real-time status (5s)

ffmpeg -f x11grab -s 1920x1080 -i :0.0 -t 30 \
  -vf "scale=800:600,fps=15" \
  -pix_fmt yuv420p demo.gif
```

### Feature Highlights GIF  
```bash
# Show key features in 45 seconds:
# 1. Dashboard overview (8s)
# 2. Semantic search (12s)
# 3. Session orchestration (10s)
# 4. Monitoring dashboards (10s) 
# 5. Skills management (5s)

ffmpeg -f x11grab -s 1920x1080 -i :0.0 -t 45 \
  -vf "scale=1000:750,fps=12" \
  -pix_fmt yuv420p features.gif
```

## Performance Metrics

### Social Media KPIs
- **Engagement Rate**: Target 3-5% (industry average: 1.5%)
- **Click-through Rate**: Target 2-3% (industry average: 1%)
- **Share Rate**: Target 1-2% for technical content
- **Save Rate**: Target 3-5% for tutorial content

### Content Performance Tracking
```typescript
// Track social media performance
const metrics = {
  twitter: {
    impressions: 0,
    engagements: 0,
    clicks: 0,
    retweets: 0,
    likes: 0
  },
  linkedin: {
    impressions: 0,
    clicks: 0,
    shares: 0,
    comments: 0
  },
  github: {
    stars: 0,
    forks: 0,
    visits: 0
  }
};
```

## Campaign Timeline

### Week 1: Asset Creation
- [x] Code snippet cards designed (6 cards)
- [x] Social media templates created
- [ ] Demo GIFs recorded  
- [ ] Screenshots optimized
- [ ] Meta tags implemented

### Week 2: Content Distribution
- [ ] Twitter thread series (3 threads)
- [ ] LinkedIn article publication
- [ ] Dev.to cross-publication
- [ ] Reddit community posts
- [ ] HackerNews submission

### Week 3: Engagement & Optimization
- [ ] Community response management
- [ ] Performance analysis
- [ ] Content optimization
- [ ] Follow-up content creation

### Week 4: Results & Planning
- [ ] Campaign metrics analysis
- [ ] ROI assessment  
- [ ] Next campaign planning
- [ ] Community feedback integration

---

**Target Results**:
- 1,000+ social media impressions
- 50+ GitHub repository stars
- 20+ developer questions/discussions
- 10+ tutorial completions tracked via analytics