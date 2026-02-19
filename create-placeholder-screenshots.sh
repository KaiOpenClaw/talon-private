#!/bin/bash
# Create placeholder screenshots for missing Talon marketing assets

set -e

IMAGES_DIR="docs/images"
TEMP_DIR="/tmp/talon-placeholders"

echo "📸 Creating placeholder screenshots for missing assets..."

# Create temp directory
mkdir -p "$TEMP_DIR"

# Create agent workspace placeholder
convert -size 1600x900 xc:"#1a1a1a" \
    -pointsize 28 -fill white -gravity northwest \
    -annotate +40+40 "Agent Workspace" \
    -pointsize 18 -fill "#888" -gravity northwest \
    -annotate +40+80 "Memory browser • Chat interface • Real-time status" \
    -fill "#333" -draw "rectangle 40,120 760,850" \
    -fill "#555" -draw "rectangle 780,120 1560,850" \
    -pointsize 16 -fill white -gravity northwest \
    -annotate +60+150 "📁 MEMORY.md" \
    -annotate +60+180 "📁 SOUL.md" \
    -annotate +60+210 "📁 TOOLS.md" \
    -annotate +60+240 "📁 memory/" \
    -annotate +800+150 "💬 Chat Interface" \
    -annotate +800+180 "Real-time agent communication" \
    "$IMAGES_DIR/agent-workspace.png"

# Create semantic search placeholder  
convert -size 1600x900 xc:"#1a1a1a" \
    -pointsize 28 -fill white -gravity northwest \
    -annotate +40+40 "Semantic Search" \
    -pointsize 18 -fill "#888" -gravity northwest \
    -annotate +40+80 "Vector search • Multiple agents • Instant results" \
    -fill "#333" -draw "rectangle 40,120 1560,200" \
    -pointsize 16 -fill white -gravity northwest \
    -annotate +60+160 "🔍 Search: \"deployment issues\"" \
    -fill "#2a2a2a" -draw "rectangle 40,220 1560,320" \
    -fill "#2a2a2a" -draw "rectangle 40,340 1560,440" \
    -fill "#2a2a2a" -draw "rectangle 40,460 1560,560" \
    -pointsize 14 -fill white -gravity northwest \
    -annotate +60+250 "Agent: duplex | Score: 0.89 | Fixed deployment configuration issue..." \
    -annotate +60+370 "Agent: talon | Score: 0.76 | Render deployment troubleshooting guide..." \
    -annotate +60+490 "Agent: coach | Score: 0.63 | DevOps best practices for deployments..." \
    "$IMAGES_DIR/semantic-search.png"

# Create session monitoring placeholder
convert -size 1600x900 xc:"#1a1a1a" \
    -pointsize 28 -fill white -gravity northwest \
    -annotate +40+40 "Session Monitoring" \
    -pointsize 18 -fill "#888" -gravity northwest \
    -annotate +40+80 "Active sessions • Performance metrics • Real-time updates" \
    -fill "#2a2a2a" -draw "rectangle 40,120 780,280" \
    -fill "#2a2a2a" -draw "rectangle 800,120 1560,280" \
    -fill "#2a2a2a" -draw "rectangle 40,300 780,460" \
    -fill "#2a2a2a" -draw "rectangle 800,300 1560,460" \
    -pointsize 14 -fill "#00ff00" -gravity northwest \
    -annotate +60,150 "🟢 duplex: Active (5 messages)" \
    -annotate +60,180 "🟢 talon: Active (12 messages)" \
    -annotate +60,210 "🟡 coach: Idle (2 min ago)" \
    -fill white \
    -annotate +820,150 "📊 Performance Metrics" \
    -annotate +820,180 "Avg Response Time: 1.2s" \
    -annotate +820,210 "Success Rate: 98.5%" \
    "$IMAGES_DIR/session-monitoring.png"

# Create command palette placeholder
convert -size 1600x900 xc:"#1a1a1a" \
    -fill "rgba(0,0,0,0.8)" -draw "rectangle 0,0 1600,900" \
    -fill "#333" -draw "rectangle 400,250 1200,650" \
    -pointsize 24 -fill white -gravity northwest \
    -annotate +450+300 "⌘K Command Palette" \
    -fill "#555" -draw "rectangle 420,350 1180,390" \
    -pointsize 16 -fill white -gravity northwest \
    -annotate +440+375 "🔍 Type to search..." \
    -fill "#2a2a2a" -draw "rectangle 420,410 1180,450" \
    -fill "#2a2a2a" -draw "rectangle 420,460 1180,500" \
    -fill "#2a2a2a" -draw "rectangle 420,510 1180,550" \
    -pointsize 14 -fill white -gravity northwest \
    -annotate +440+435 "📊 Go to Dashboard" \
    -annotate +440,485 "🤖 Switch to Agent: duplex" \
    -annotate +440,535 "⚙️  Open Cron Jobs" \
    "$IMAGES_DIR/command-palette.png"

# Create performance metrics placeholder
convert -size 1600x900 xc:"#1a1a1a" \
    -pointsize 28 -fill white -gravity northwest \
    -annotate +40+40 "Performance Metrics" \
    -pointsize 18 -fill "#888" -gravity northwest \
    -annotate +40+80 "System health • Resource usage • Connection status" \
    -fill "#2a2a2a" -draw "rectangle 40,120 520,350" \
    -fill "#2a2a2a" -draw "rectangle 540,120 1020,350" \
    -fill "#2a2a2a" -draw "rectangle 1040,120 1560,350" \
    -pointsize 16 -fill white -gravity northwest \
    -annotate +60,150 "🖥️  System Health" \
    -annotate +560,150 "📊 Resource Usage" \
    -annotate +1060,150 "🌐 Connections" \
    -pointsize 14 -fill "#00ff00" -gravity northwest \
    -annotate +60,180 "✅ Gateway: Healthy" \
    -annotate +60,200 "✅ Database: Connected" \
    -annotate +60,220 "✅ WebSocket: Active" \
    -fill "#888" \
    -annotate +560,180 "CPU: 12%" \
    -annotate +560,200 "Memory: 340MB" \
    -annotate +560,220 "Disk: 2.1GB" \
    -fill "#00ff00" \
    -annotate +1060,180 "✅ 20 Agents Online" \
    -annotate +1060,200 "✅ 31 Cron Jobs" \
    -annotate +1060,220 "✅ 5 Active Sessions" \
    "$IMAGES_DIR/performance-metrics.png"

echo "✅ Placeholder screenshots created:"
echo "  📁 agent-workspace.png (1600x900)"
echo "  🔍 semantic-search.png (1600x900)" 
echo "  📊 session-monitoring.png (1600x900)"
echo "  ⌘K command-palette.png (1600x900)"
echo "  📈 performance-metrics.png (1600x900)"
echo ""
echo "🎯 These placeholders maintain visual consistency and can be replaced"
echo "   with actual screenshots when live application access is available."

# Cleanup
rm -rf "$TEMP_DIR"

echo "🎉 Marketing screenshots ready for blog post and documentation!"