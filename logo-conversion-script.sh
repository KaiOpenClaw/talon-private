#!/bin/bash

# Product Hunt Logo Package Creation Script
# Converts SVG logo to required PNG formats

echo "🎨 Creating Product Hunt logo package..."

# Create directories
mkdir -p content/marketing/product-hunt/logos
mkdir -p content/marketing/product-hunt/screenshots

# Convert SVG to PNG formats using convert (ImageMagick)
# If ImageMagick is not available, we'll need to use an alternative method

# Product Hunt required: 240x240px PNG
convert /root/clawd/talon-private/public/icon.svg -resize 240x240 content/marketing/product-hunt/logos/talon-logo-240x240.png

# Additional useful formats
convert /root/clawd/talon-private/public/icon.svg -resize 512x512 content/marketing/product-hunt/logos/talon-icon-512x512.png
convert /root/clawd/talon-private/public/icon.svg -resize 128x128 content/marketing/product-hunt/logos/talon-icon-128x128.png
convert /root/clawd/talon-private/public/icon.svg -resize 64x64 content/marketing/product-hunt/logos/talon-icon-64x64.png
convert /root/clawd/talon-private/public/icon.svg -resize 32x32 content/marketing/product-hunt/logos/talon-icon-32x32.png

# Create favicon ICO file
convert /root/clawd/talon-private/public/icon.svg -resize 32x32 content/marketing/product-hunt/logos/favicon-32x32.ico

echo "✅ Logo package created!"

# Resize screenshots for Product Hunt (1270x760px)
echo "📸 Resizing screenshots for Product Hunt..."

convert /root/clawd/talon-private/docs/images/dashboard-hero.png -resize 1270x760! content/marketing/product-hunt/screenshots/ph-hero-1270x760.png
convert /root/clawd/talon-private/docs/images/dashboard.png -resize 1270x760! content/marketing/product-hunt/screenshots/ph-search-1270x760.png
convert /root/clawd/talon-private/docs/images/health.png -resize 1270x760! content/marketing/product-hunt/screenshots/ph-monitoring-1270x760.png
convert /root/clawd/talon-private/docs/images/skills.png -resize 1270x760! content/marketing/product-hunt/screenshots/ph-skills-1270x760.png
convert /root/clawd/talon-private/docs/images/cron.png -resize 1270x760! content/marketing/product-hunt/screenshots/ph-cron-1270x760.png

echo "✅ Screenshots resized for Product Hunt!"

echo "🚀 Product Hunt assets ready!"
echo ""
echo "📁 Files created:"
echo "  - Logo: content/marketing/product-hunt/logos/talon-logo-240x240.png"
echo "  - Screenshots: content/marketing/product-hunt/screenshots/*.png"
echo ""
echo "Next steps:"
echo "1. Review assets for quality"  
echo "2. Create 30-second demo GIF"
echo "3. Schedule Product Hunt launch"