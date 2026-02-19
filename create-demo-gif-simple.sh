#!/bin/bash
# Create Demo GIF for Talon README using ImageMagick

set -e

IMAGES_DIR="docs/images"
OUTPUT_GIF="docs/images/demo.gif"
TEMP_DIR="/tmp/talon-gif"

echo "🎬 Creating Talon Demo GIF..."

# Create temp directory
mkdir -p "$TEMP_DIR"

# Resize all images to consistent dimensions (1200x700 as specified)
echo "📐 Resizing images to 1200x700..."
convert "$IMAGES_DIR/dashboard-hero.png" -resize 1200x700! "$TEMP_DIR/01-dashboard.png"
convert "$IMAGES_DIR/dashboard.png" -resize 1200x700! "$TEMP_DIR/02-agents.png"  
convert "$IMAGES_DIR/skills.png" -resize 1200x700! "$TEMP_DIR/03-skills.png"
convert "$IMAGES_DIR/cron.png" -resize 1200x700! "$TEMP_DIR/04-cron.png"
convert "$IMAGES_DIR/health.png" -resize 1200x700! "$TEMP_DIR/05-health.png"

# Add text overlays to each frame
echo "✍️  Adding text overlays..."
convert "$TEMP_DIR/01-dashboard.png" \
    -pointsize 36 -fill white -stroke black -strokewidth 2 \
    -gravity northwest -annotate +40+40 "Talon Dashboard" \
    -pointsize 24 -fill white -stroke black -strokewidth 1 \
    -gravity northwest -annotate +40+90 "Mission Control for AI Agents" \
    "$TEMP_DIR/frame_01.png"

convert "$TEMP_DIR/02-agents.png" \
    -pointsize 32 -fill white -stroke black -strokewidth 2 \
    -gravity northwest -annotate +40+40 "20+ Active Agents" \
    -pointsize 20 -fill white -stroke black -strokewidth 1 \
    -gravity northwest -annotate +40+80 "Real-time status monitoring" \
    "$TEMP_DIR/frame_02.png"

convert "$TEMP_DIR/03-skills.png" \
    -pointsize 32 -fill white -stroke black -strokewidth 2 \
    -gravity northwest -annotate +40+40 "Skills Management" \
    -pointsize 20 -fill white -stroke black -strokewidth 1 \
    -gravity northwest -annotate +40+80 "49 capability packs available" \
    "$TEMP_DIR/frame_03.png"

convert "$TEMP_DIR/04-cron.png" \
    -pointsize 32 -fill white -stroke black -strokewidth 2 \
    -gravity northwest -annotate +40+40 "Automation Control" \
    -pointsize 20 -fill white -stroke black -strokewidth 1 \
    -gravity northwest -annotate +40+80 "31+ scheduled jobs running" \
    "$TEMP_DIR/frame_04.png"

convert "$TEMP_DIR/05-health.png" \
    -pointsize 32 -fill white -stroke black -strokewidth 2 \
    -gravity northwest -annotate +40+40 "System Monitoring" \
    -pointsize 20 -fill white -stroke black -strokewidth 1 \
    -gravity northwest -annotate +40+80 "Production-grade dashboards" \
    "$TEMP_DIR/frame_05.png"

# Create final frame with call to action
convert -size 1200x700 xc:black \
    -pointsize 48 -fill white -gravity center \
    -annotate +0-50 "🦅 Talon" \
    -pointsize 24 -fill white -gravity center \
    -annotate +0+20 "Stop wrestling with CLI commands" \
    -pointsize 20 -fill white -gravity center \
    -annotate +0+60 "Start managing AI agents like a pro" \
    -pointsize 18 -fill "#0066cc" -gravity center \
    -annotate +0+120 "github.com/KaiOpenClaw/talon-private" \
    "$TEMP_DIR/frame_06.png"

# Create animated GIF using ImageMagick
echo "🎞️  Creating animated GIF..."
convert -delay 300 -loop 0 \
    "$TEMP_DIR/frame_01.png" \
    "$TEMP_DIR/frame_02.png" \
    "$TEMP_DIR/frame_03.png" \
    "$TEMP_DIR/frame_04.png" \
    "$TEMP_DIR/frame_05.png" \
    -delay 200 "$TEMP_DIR/frame_06.png" \
    -colors 256 \
    "$OUTPUT_GIF"

# Check file size
FILE_SIZE=$(du -h "$OUTPUT_GIF" | cut -f1)
echo "✅ Demo GIF created: $OUTPUT_GIF"
echo "📏 File size: $FILE_SIZE"

# Check if it's under 5MB
FILE_SIZE_BYTES=$(du -b "$OUTPUT_GIF" | cut -f1)
if [ "$FILE_SIZE_BYTES" -lt 5000000 ]; then
    echo "✅ File size is under 5MB - perfect for GitHub!"
else
    echo "⚠️  File size is over 5MB - optimizing..."
    convert "$OUTPUT_GIF" -fuzz 2% -layers Optimize "$OUTPUT_GIF"
    NEW_SIZE=$(du -h "$OUTPUT_GIF" | cut -f1)
    echo "📏 Optimized size: $NEW_SIZE"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo "🎉 Demo GIF ready for README hero section!"
echo "📁 Location: $OUTPUT_GIF"