# 🚀 Talon Setup Walkthrough Video Script (5 minutes)

**Purpose**: Reduce user onboarding friction and support tickets  
**Duration**: 5 minutes  
**Format**: Screen recording with voice narration  
**Target**: First-time users deploying Talon  

## Video Structure & Timing

### Introduction (0-30 seconds)
**VISUAL**: Talon GitHub repository page  
**NARRATION**: "Ready to transform your AI agent management? This 5-minute guide will have Talon running in production. Let's deploy to Render - the easiest way to get started."

### Prerequisites Check (30s-1min)
**VISUAL**: Split screen showing requirements  
**NARRATION**: "Before we start, you'll need three things:"

**ON-SCREEN CHECKLIST**:
- [ ] OpenClaw Gateway URL (your agent server)  
- [ ] OpenClaw Gateway Token (from ~/.openclaw/openclaw.json)
- [ ] OpenAI API Key (optional, for semantic search)

**VISUAL**: Show where to find each item with actual file paths  
**NARRATION**: "Don't worry - I'll show you exactly where to find these."

### Step 1: Deploy to Render (1min-2min 30s)
**VISUAL**: Browser showing Talon repository  
**NARRATION**: "First, click 'Deploy to Render' - this magic button does all the heavy lifting."

**Recording Sequence**:
1. **Click Deploy Button (1:00-1:10)**: GitHub → Render connection flow
2. **Account Setup (1:10-1:30)**: Render account creation (if needed) or login  
3. **Repository Selection (1:30-1:40)**: Authorize GitHub access, select repository
4. **Service Configuration (1:40-2:00)**: 
   - Service name: "talon-dashboard"  
   - Environment: "Node"
   - Build command: "npm run build"  
   - Start command: "npm start"
5. **Environment Variables Setup (2:00-2:30)**: Add the three required variables

**VISUAL HIGHLIGHTS**:
- Render's clean deployment interface
- Environment variable form with actual values  
- Build process initiation

### Step 2: Configure Environment Variables (2min 30s-3min 45s)
**VISUAL**: Render environment variables page with real examples  
**NARRATION**: "Now the important part - connecting Talon to your OpenClaw gateway."

**Variable Configuration**:
1. **GATEWAY_URL (2:30-2:50)**:
   ```
   GATEWAY_URL=https://your-gateway.example.com:5050
   ```
   **VISUAL**: Show how to get this from OpenClaw status command
   **NARRATION**: "This is your OpenClaw server URL - usually your server IP with port 5050."

2. **GATEWAY_TOKEN (2:50-3:20)**:
   ```
   GATEWAY_TOKEN=your_actual_token_here
   ```  
   **VISUAL**: Screen recording of `cat ~/.openclaw/openclaw.json | jq .gateway.auth.token`
   **NARRATION**: "Your gateway token is in the OpenClaw config file. Copy the entire token."

3. **OPENAI_API_KEY (3:20-3:45)**:
   ```  
   OPENAI_API_KEY=sk-your_key_here
   ```
   **VISUAL**: OpenAI API keys page  
   **NARRATION**: "This enables semantic search - optional but highly recommended for finding information across all your agents."

### Step 3: Deploy & Verify (3min 45s-4min 30s)
**VISUAL**: Render deployment dashboard  
**NARRATION**: "Hit deploy and watch the magic happen."

**Recording Sequence**:
1. **Build Process (3:45-4:00)**: Live build logs, successful compilation
2. **Deployment Status (4:00-4:15)**: "Live" status indicator, generated URL  
3. **First Visit (4:15-4:30)**: Open the deployed Talon URL, login screen appears

### Step 4: First Login & Verification (4min 30s-5min)
**VISUAL**: Fresh Talon dashboard loading for the first time  
**NARRATION**: "Almost there! Let's verify everything works."

**Verification Steps**:
1. **Authentication (4:30-4:40)**: Enter auth token, successful login
2. **Dashboard Load (4:40-4:50)**: Agents appear, system status shows "Connected"  
3. **Quick Test (4:50-5:00)**: Click an agent, verify chat works, semantic search responds

**CLOSING (5:00)**:
**VISUAL**: Full dashboard with all features working  
**NARRATION**: "That's it! You now have a production-ready AI agent command center. Explore the features and join our Discord for support."

## Technical Production Notes

### Screen Recording Setup
- **Resolution**: 1920x1080 (will be 1080p on YouTube)
- **Framerate**: 30fps (smooth for tutorials)
- **Audio**: Clear narration with subtle background music
- **Cursor**: Highlight clicks with gentle animation

### Visual Requirements
- **Real Data**: Use actual OpenClaw gateway, not mock data
- **Clean Environment**: Fresh browser, no personal bookmarks/history visible  
- **Consistent Pacing**: Allow time for viewers to follow along
- **Error Handling**: Show what to do if something fails

### Multiple Versions Needed
1. **Full Version (5min)**: Complete walkthrough with explanations
2. **Quick Version (2min)**: Fast-paced for experienced developers  
3. **GIF Summary (30s)**: Key steps only for README embedding

## Common Issues to Address

### Troubleshooting Segments (Optional B-Roll)
- **Gateway Connection Failed**: Check URL and token  
- **Build Failed**: Environment variable formatting  
- **Authentication Issues**: Token format and permissions
- **Render Deployment Stuck**: Build logs interpretation

## Success Metrics
- **Support Reduction**: 50% fewer "how to deploy" questions
- **Conversion**: 80% deployment success rate for video viewers
- **Engagement**: >70% watch completion rate  
- **Satisfaction**: 95% thumbs up ratio

## Distribution Strategy
- **Primary**: YouTube with SEO optimization
- **Documentation**: Embed in installation guide  
- **Social**: Twitter/LinkedIn with key timestamps
- **Community**: Discord announcement with direct link
- **GitHub**: README section with video thumbnail

## Call-to-Action
**End Screen Elements**:
- Subscribe button for more Talon content  
- Link to Discord community support
- GitHub repository link
- Related video: "Advanced Talon Features"

This walkthrough should eliminate the most common deployment barriers and create confidence in new users that Talon works reliably in production.