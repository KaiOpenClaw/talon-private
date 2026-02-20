#!/bin/bash

# Talon Demo Asset Creation Script
# Creates updated screenshots and demo GIF showcasing WebSocket real-time features

set -e

echo "🎬 Talon Demo Asset Creation"
echo "================================"

# Configuration
APP_URL="http://localhost:4000"
OUTPUT_DIR="docs/images"
TEMP_DIR="temp_assets"

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "📋 Checking prerequisites..."

# Check if app is running
if ! curl -s "$APP_URL" > /dev/null; then
    echo "❌ Talon app is not running at $APP_URL"
    echo "Please start with: npm run dev"
    exit 1
fi

echo "✅ Talon app is running at $APP_URL"

# Check for screenshot tools
if command -v gnome-screenshot &> /dev/null; then
    SCREENSHOT_TOOL="gnome-screenshot"
elif command -v import &> /dev/null; then
    SCREENSHOT_TOOL="import"  # ImageMagick
elif command -v scrot &> /dev/null; then
    SCREENSHOT_TOOL="scrot"
else
    echo "❌ No screenshot tool found. Please install gnome-screenshot, ImageMagick, or scrot"
    exit 1
fi

echo "✅ Using screenshot tool: $SCREENSHOT_TOOL"

# Function to take screenshot
take_screenshot() {
    local filename="$1"
    local delay="${2:-0}"
    
    echo "📸 Taking screenshot: $filename (${delay}s delay)"
    
    if [ "$delay" -gt 0 ]; then
        echo "⏰ Waiting ${delay} seconds..."
        sleep "$delay"
    fi
    
    case "$SCREENSHOT_TOOL" in
        "gnome-screenshot")
            gnome-screenshot -w -f "$TEMP_DIR/$filename" --delay="$delay"
            ;;
        "import")
            import -window root "$TEMP_DIR/$filename"
            ;;
        "scrot")
            scrot "$TEMP_DIR/$filename" --delay="$delay"
            ;;
    esac
    
    if [ -f "$TEMP_DIR/$filename" ]; then
        echo "✅ Screenshot saved: $filename"
    else
        echo "❌ Failed to create screenshot: $filename"
        return 1
    fi
}

# Function to optimize image
optimize_image() {
    local filename="$1"
    
    if command -v pngquant &> /dev/null; then
        echo "🔧 Optimizing $filename..."
        pngquant --quality=65-90 --output "$OUTPUT_DIR/$filename" "$TEMP_DIR/$filename"
    else
        echo "⚠️  pngquant not found, copying without optimization"
        cp "$TEMP_DIR/$filename" "$OUTPUT_DIR/$filename"
    fi
}

echo ""
echo "🚀 Creating Demo Assets"
echo "======================"

# Create demo screenshots workflow
echo ""
echo "📋 Demo Asset Creation Workflow:"
echo "1. Load main dashboard (showcase agent grid + WebSocket indicators)"
echo "2. Navigate to skills page (show management interface)"  
echo "3. Visit cron dashboard (display job monitoring)"
echo "4. Check system health (real-time metrics)"
echo "5. Return to dashboard for final hero shot"
echo ""
echo "🎯 Focus on NEW FEATURES:"
echo "   - WebSocket connection indicators"
echo "   - Real-time status updates"
echo "   - Live data refresh"
echo "   - Professional dark theme"
echo ""

# Guide user through manual screenshot process
echo "📝 MANUAL CAPTURE INSTRUCTIONS:"
echo ""
echo "Please open your browser and navigate through these pages while I prepare to capture:"
echo ""
echo "1. 📊 Dashboard Page: $APP_URL"
echo "   - Wait for all agents to load"
echo "   - Look for WebSocket connection indicators"
echo "   - Ensure real-time status is working"
echo ""
echo "2. 🛠️  Skills Page: $APP_URL/skills"
echo "   - Show skill management interface"
echo "   - Display install/enable status"
echo ""
echo "3. ⏰ Cron Page: $APP_URL/schedule"
echo "   - Show job list and status"
echo "   - Display automation overview"
echo ""
echo "4. 💚 Health Page: $APP_URL/health" 
echo "   - Show system monitoring"
echo "   - Display real-time metrics"
echo ""

read -p "Press Enter when you have the pages ready in your browser..."

echo ""
echo "📸 Starting screenshot capture..."

# Take screenshots with user guidance
echo ""
echo "1️⃣  Dashboard Screenshot:"
echo "   Navigate to $APP_URL and ensure all agents are visible"
read -p "   Press Enter when ready..."
take_screenshot "dashboard-hero-new.png" 2

echo ""
echo "2️⃣  Skills Screenshot:"  
echo "   Navigate to $APP_URL/skills"
read -p "   Press Enter when ready..."
take_screenshot "skills-new.png" 2

echo ""
echo "3️⃣  Cron Screenshot:"
echo "   Navigate to $APP_URL/schedule"  
read -p "   Press Enter when ready..."
take_screenshot "cron-new.png" 2

echo ""
echo "4️⃣  Health Screenshot:"
echo "   Navigate to $APP_URL/health"
read -p "   Press Enter when ready..."
take_screenshot "health-new.png" 2

# Optimize all screenshots
echo ""
echo "🔧 Optimizing screenshots..."
for img in dashboard-hero-new.png skills-new.png cron-new.png health-new.png; do
    if [ -f "$TEMP_DIR/$img" ]; then
        optimize_image "$img"
    fi
done

# Create backup of old assets
echo ""
echo "💾 Backing up old assets..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="$OUTPUT_DIR/backup_$timestamp"
mkdir -p "$backup_dir"

for old_asset in dashboard-hero.png dashboard.png skills.png cron.png health.png demo.gif; do
    if [ -f "$OUTPUT_DIR/$old_asset" ]; then
        cp "$OUTPUT_DIR/$old_asset" "$backup_dir/"
        echo "   Backed up: $old_asset"
    fi
done

# Update main assets with new versions
echo ""
echo "🔄 Updating main assets..."
if [ -f "$OUTPUT_DIR/dashboard-hero-new.png" ]; then
    mv "$OUTPUT_DIR/dashboard-hero-new.png" "$OUTPUT_DIR/dashboard-hero.png"
    echo "✅ Updated dashboard-hero.png"
fi

if [ -f "$OUTPUT_DIR/skills-new.png" ]; then
    mv "$OUTPUT_DIR/skills-new.png" "$OUTPUT_DIR/skills.png" 
    echo "✅ Updated skills.png"
fi

if [ -f "$OUTPUT_DIR/cron-new.png" ]; then
    mv "$OUTPUT_DIR/cron-new.png" "$OUTPUT_DIR/cron.png"
    echo "✅ Updated cron.png"
fi

if [ -f "$OUTPUT_DIR/health-new.png" ]; then
    mv "$OUTPUT_DIR/health-new.png" "$OUTPUT_DIR/health.png"
    echo "✅ Updated health.png"
fi

# Copy dashboard-hero as general dashboard view
if [ -f "$OUTPUT_DIR/dashboard-hero.png" ]; then
    cp "$OUTPUT_DIR/dashboard-hero.png" "$OUTPUT_DIR/dashboard.png"
    echo "✅ Updated dashboard.png"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Demo Asset Creation Complete!"
echo "================================"
echo ""
echo "📊 Updated Assets:"
ls -la "$OUTPUT_DIR"/*.png | tail -6
echo ""
echo "💾 Backup Location: $backup_dir"
echo ""
echo "🔍 File Sizes:"
du -h "$OUTPUT_DIR"/*.png | tail -6
echo ""
echo "🎯 Next Steps:"
echo "1. Review updated screenshots for quality"
echo "2. Create demo.gif from screen recording"  
echo "3. Update GitHub issue with results"
echo "4. Test images in README display"
echo ""
echo "📝 For GIF creation, consider using:"
echo "   - OBS Studio for screen recording"  
echo "   - ffmpeg for video-to-GIF conversion"
echo "   - Focus on WebSocket real-time features"
echo ""