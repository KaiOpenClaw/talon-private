# Visual Asset Guidelines for Talon Marketing

*Created: February 21, 2026*
*Purpose: Comprehensive guidelines for creating professional marketing visuals*

---

## 📸 Screenshot Standards

### Technical Specifications

#### Resolution & Quality
- **Primary Resolution**: 2560x1440 (retina quality for crisp display)
- **Secondary Resolution**: 1920x1080 (standard HD for broader compatibility)
- **Format**: PNG with transparency support where needed
- **Compression**: Optimized for web (<500KB per image)
- **Color Space**: sRGB for consistent web display

#### Browser & Device Setup
- **Browser**: Chrome or Firefox with developer tools hidden
- **Zoom Level**: 100% (no browser zoom applied)
- **Window State**: Maximized window for consistent framing
- **UI State**: Clean, organized data - no debugging or test content
- **Screen Recording**: 60fps for smooth motion capture

### Content Guidelines

#### Dashboard Screenshots
```yaml
Required Elements:
  - 15-20 agents visible in grid layout
  - Mix of status indicators (green/yellow/red)
  - Realistic agent names (no "test-agent-123")
  - Professional workspace organization
  - Clean, uncluttered interface
  - Current timestamp visible where appropriate
```

#### Agent Conversation Screenshots
```yaml
Required Elements:
  - Professional code highlighting
  - Multi-turn conversation flow
  - Realistic technical discussion
  - Proper markdown rendering
  - Mobile responsive design demonstration
  - Clear typography and spacing
```

#### Search Interface Screenshots  
```yaml
Required Elements:
  - Meaningful search query visible
  - Similarity scores displayed (80%+)
  - Multiple result types shown
  - Source attribution clear
  - Filter options demonstrated
  - Professional result formatting
```

### Brand Consistency

#### Color Palette
```css
/* Primary Talon Colors */
--talon-primary: #1a365d;      /* Deep blue */
--talon-secondary: #2d3748;    /* Dark gray */
--talon-accent: #4299e1;       /* Bright blue */
--talon-success: #38a169;      /* Green */
--talon-warning: #ed8936;      /* Orange */
--talon-error: #e53e3e;        /* Red */

/* Background Colors */
--background-dark: #1a202c;    /* Main dark background */
--background-light: #f7fafc;   /* Light mode background */
--surface: #2d3748;            /* Card/surface color */
```

#### Typography
- **Primary Font**: Inter (clean, professional)
- **Monospace Font**: JetBrains Mono (code blocks)
- **Font Sizes**: Consistent scaling across all screenshots
- **Line Heights**: Generous spacing for readability

#### Logo & Branding
- **Logo Placement**: Subtle, non-intrusive positioning
- **Brand Elements**: Consistent iconography and visual elements
- **Professional Polish**: Enterprise-ready visual quality

---

## 🎬 Demo GIF Standards

### Technical Specifications

#### File Requirements
- **Resolution**: 1920x1080 for high-quality demos
- **Duration**: 10-20 seconds for optimal engagement
- **Frame Rate**: 30fps for smooth interactions
- **File Size**: <2MB for fast loading
- **Format**: GIF for universal compatibility, MP4 for higher quality

#### Recording Guidelines
- **Cursor Movement**: Smooth, deliberate interactions
- **Timing**: Natural pace with brief pauses for comprehension
- **Focus Areas**: Clear visual emphasis on key features
- **Transitions**: Smooth cuts without jarring jumps
- **Quality**: High enough to show UI details clearly

### Content Scenarios

#### Hero Demo (15 seconds)
```
Scene 1 (3s): Terminal window with complex SSH commands
Scene 2 (2s): Transition animation or cut to Talon
Scene 3 (8s): Talon dashboard overview with key features
Scene 4 (2s): Call-to-action or deploy button
```

#### Semantic Search Demo (20 seconds)
```  
Scene 1 (3s): Search query being typed
Scene 2 (5s): Results appearing with similarity scores
Scene 3 (7s): Click through to detailed result
Scene 4 (3s): Success moment - finding the solution
Scene 5 (2s): Return to dashboard or next action
```

#### Mobile Navigation Demo (15 seconds)
```
Scene 1 (3s): Mobile device showing agent list
Scene 2 (4s): Touch navigation and gesture interactions  
Scene 3 (5s): Key mobile features demonstration
Scene 4 (3s): Professional mobile experience conclusion
```

### Post-Production Standards
- **Smooth Loops**: Seamless looping for continuous play
- **Annotations**: Clean callouts and highlights where needed
- **Compression**: Optimized file sizes without quality loss
- **Testing**: Verified playback across all target platforms

---

## 📱 Social Media Assets

### Platform-Specific Formats

#### Twitter/X Optimized
- **Size**: 1200x628 pixels (Twitter card format)
- **Aspect Ratio**: 1.91:1 for optimal timeline display
- **Text Overlay**: Large, readable fonts (min 24px)
- **Visual Hierarchy**: Clear information organization
- **Brand Elements**: Subtle Talon branding

#### LinkedIn Professional
- **Size**: 1200x627 pixels (LinkedIn native format)
- **Content Style**: Business-focused messaging
- **Professional Design**: Clean, corporate aesthetic
- **Value Proposition**: Clear benefit statements
- **Call-to-Action**: Professional CTAs

#### Reddit Community
- **Size**: 1200x630 pixels (standard sharing format)  
- **Content Style**: Community-friendly, educational
- **Authentic Approach**: Less polished, more authentic
- **Value-First**: Educational rather than promotional
- **Discussion Starters**: Encourage community engagement

### Content Categories

#### Feature Comparison Graphics
```yaml
Layout:
  - Split-screen comparisons (Talon vs alternatives)
  - Clear feature matrices with checkmarks/X marks
  - Professional typography and spacing
  - Consistent visual hierarchy

Content:
  - Discord vs Talon interface comparison
  - CLI vs Dashboard workflow comparison  
  - Mobile vs desktop experience comparison
  - Feature availability across platforms
```

#### ROI & Statistics Infographics
```yaml
Design Elements:
  - Large, prominent statistics (178x ROI, 95% time savings)
  - Visual charts and graphs where appropriate
  - Professional color scheme and branding
  - Clear data source attribution

Content Focus:
  - Time savings quantification
  - Cost reduction analysis  
  - Productivity improvement metrics
  - Enterprise success stories
```

#### Quote Cards & Testimonials
```yaml
Layout:
  - Professional quote formatting with attribution
  - Customer logo inclusion where possible
  - Clean typography and visual hierarchy
  - Brand-consistent design elements

Content:
  - Customer testimonials and success quotes
  - Key insights from blog post series
  - Industry analyst perspectives
  - Community feedback and praise
```

---

## 🎯 Asset Organization Structure

### File Naming Convention
```
Format: [category]_[platform]_[description]_[version].ext

Examples:
- screenshot_dashboard_hero_v2.png
- demo_semantic-search_main_v1.gif  
- social_twitter_feature-comparison_v3.png
- infographic_roi_analysis_v1.png
```

### Directory Structure
```
content/assets/
├── screenshots/
│   ├── dashboard/
│   ├── mobile/
│   ├── search/
│   └── features/
├── demos/
│   ├── gifs/
│   ├── videos/
│   └── interactive/
├── social/
│   ├── twitter/
│   ├── linkedin/
│   └── reddit/
├── infographics/
│   ├── comparisons/
│   ├── statistics/
│   └── workflows/
└── brand/
    ├── logos/
    ├── templates/
    └── guidelines/
```

### Version Control
- **Master Files**: High-resolution originals kept for future editing
- **Web Optimized**: Compressed versions for actual use
- **Platform Variants**: Size/format optimized for each platform
- **Archive System**: Historical versions maintained for reference

---

## 📊 Quality Assurance Checklist

### Technical Review
- [ ] **Resolution meets standards** (2560x1440 or specified)
- [ ] **File size optimized** (<500KB for images, <2MB for GIFs)
- [ ] **Format appropriate** (PNG/GIF/MP4 as specified)
- [ ] **Color accuracy** (consistent across devices)
- [ ] **Text readability** (legible at all intended sizes)

### Content Review  
- [ ] **Information accuracy** (no outdated UI or incorrect data)
- [ ] **Professional presentation** (clean, organized interface)
- [ ] **Brand consistency** (colors, fonts, style)
- [ ] **Message clarity** (clear value proposition)
- [ ] **Call-to-action visible** (where appropriate)

### Cross-Platform Testing
- [ ] **Desktop display** (Windows, Mac, Linux)
- [ ] **Mobile compatibility** (iOS, Android browsers)
- [ ] **Social media preview** (Twitter, LinkedIn, Reddit)
- [ ] **Email rendering** (Gmail, Outlook, Apple Mail)
- [ ] **Loading performance** (fast load times verified)

### Legal & Compliance
- [ ] **No sensitive data** (customer information obscured)
- [ ] **Trademark compliance** (proper logo usage)
- [ ] **Copyright clearance** (all elements properly licensed)
- [ ] **Privacy considerations** (no personal information visible)
- [ ] **Brand guidelines** (consistent with company standards)

---

## 🚀 Production Workflow

### Phase 1: Planning & Setup
1. **Asset Requirements Review** - Determine specific needs and priorities
2. **Environment Preparation** - Clean Talon instance with professional data
3. **Technical Setup** - Recording tools, browser configuration, lighting
4. **Content Planning** - Scenarios, messaging, and shot lists

### Phase 2: Content Creation
1. **Screenshot Sessions** - Systematic capture of all required screens
2. **Demo Recording** - High-quality interaction demonstrations  
3. **Social Asset Design** - Platform-specific graphic creation
4. **Initial Review** - Technical quality and content accuracy check

### Phase 3: Post-Production
1. **Optimization** - File size reduction and format conversion
2. **Enhancement** - Color correction, annotation addition
3. **Brand Application** - Logo placement and brand consistency
4. **Platform Variants** - Size and format adaptation for each channel

### Phase 4: Quality Assurance
1. **Technical Testing** - Cross-device and cross-platform verification
2. **Content Review** - Accuracy, messaging, and brand compliance
3. **Performance Testing** - Loading speed and compatibility checks
4. **Final Approval** - Stakeholder review and approval process

### Phase 5: Implementation
1. **Asset Delivery** - Upload to appropriate storage and CDN
2. **Documentation** - Usage guidelines and implementation notes
3. **Distribution** - Integration into marketing campaigns and materials
4. **Performance Monitoring** - Track engagement and effectiveness

---

## 📈 Success Metrics

### Engagement Improvements
- **Blog Post Performance**: +40% time on page with visual content
- **Social Media Engagement**: +60% interaction rate with graphics
- **Website Conversion**: +25% demo signup rate from visual landing pages
- **Brand Recognition**: Consistent professional identity across channels

### Quality Indicators
- **Professional Appearance**: Enterprise-ready visual standards
- **Brand Consistency**: Unified visual identity across all touchpoints
- **Technical Excellence**: High-quality, optimized assets
- **Community Response**: Positive feedback on visual presentation

### Business Impact
- **Lead Generation**: Visual content driving qualified inquiries
- **Sales Enablement**: Professional assets supporting sales process
- **Competitive Differentiation**: Superior visual presentation vs alternatives
- **Market Position**: Established as premium, professional solution

---

*This document serves as the comprehensive guide for all visual asset creation for Talon marketing campaigns. Regular updates ensure consistency with evolving brand guidelines and platform requirements.*