# Contributing to Talon

We love contributions! Talon is open source and community-driven. Whether you're fixing bugs, adding features, or improving documentation, your help makes Talon better for everyone.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** with tests
5. **Submit a pull request**

```bash
git clone https://github.com/your-username/talon-private
cd talon-private
git checkout -b feature/amazing-new-feature
# Make changes...
git commit -am "Add amazing new feature"
git push origin feature/amazing-new-feature
# Open PR on GitHub
```

## 🎯 Ways to Contribute

### 🐛 Bug Reports
Found a bug? Help us fix it!

- **Search existing issues** first to avoid duplicates
- **Use the bug report template** with clear reproduction steps
- **Include environment details** (OS, Node version, deployment type)
- **Provide screenshots** for UI issues

[**Report a Bug →**](https://github.com/KaiOpenClaw/talon-private/issues/new?template=bug_report.md)

### ✨ Feature Requests
Have an idea to make Talon better?

- **Check the roadmap** to see if it's already planned
- **Use the feature request template** with clear use cases
- **Explain the problem** you're solving, not just the solution
- **Consider implementation complexity** and maintenance burden

[**Request a Feature →**](https://github.com/KaiOpenClaw/talon-private/issues/new?template=feature_request.md)

### 📚 Documentation
Help others use Talon effectively:

- **Fix typos** and improve clarity
- **Add missing examples** and use cases
- **Create tutorials** for common workflows
- **Translate documentation** to other languages

### 🔧 Code Contributions
Ready to write some code?

**Good first issues:**
- UI improvements and polish
- Additional dashboard widgets
- API endpoint enhancements
- Performance optimizations

**Medium complexity:**
- New dashboard modules
- Advanced filtering options
- Integration with other tools
- Mobile responsiveness improvements

**Advanced features:**
- Real-time WebSocket updates
- Advanced authentication
- Multi-tenant support
- AI-powered insights

---

## 🏗️ Development Setup

### Prerequisites
- **Node.js 18+** with npm
- **Git** for version control
- **OpenClaw Gateway** for testing

### Local Development
```bash
# Clone and setup
git clone https://github.com/KaiOpenClaw/talon-private
cd talon-private
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your OpenClaw gateway details

# Start development server
npm run dev

# Open http://localhost:4000
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- agents.test.ts

# Check test coverage
npm run test:coverage
```

### Building
```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

---

## 📋 Coding Guidelines

### TypeScript
We use TypeScript for type safety and better developer experience:

```typescript
// ✅ Good: Clear types and interfaces
interface Agent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
}

async function getAgent(id: string): Promise<Agent> {
  // Implementation...
}

// ❌ Avoid: Any types and unclear naming
async function getData(x: any): Promise<any> {
  // Implementation...
}
```

### React Components
Follow modern React patterns:

```tsx
// ✅ Good: Functional component with proper typing
interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const handleClick = useCallback(() => {
    onSelect(agent);
  }, [agent, onSelect]);

  return (
    <Card onClick={handleClick} className="cursor-pointer hover:shadow-md">
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
        <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
          {agent.status}
        </Badge>
      </CardHeader>
    </Card>
  );
}
```

### API Routes
Keep API routes simple and focused:

```typescript
// ✅ Good: Clear error handling and consistent responses
export async function GET(request: NextRequest) {
  try {
    const agents = await fetchAgents();
    
    return NextResponse.json({
      agents,
      summary: {
        total: agents.length,
        active: agents.filter(a => a.status === 'online').length
      }
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
```

### Styling
We use Tailwind CSS with consistent patterns:

```tsx
// ✅ Good: Semantic classes and responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
</div>

// ❌ Avoid: Inline styles and arbitrary values
<div style={{ display: 'grid' }} className="grid-cols-[200px_1fr_100px]">
  <div className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
    {/* Content */}
  </div>
</div>
```

---

## 🧪 Testing

### Test Structure
```bash
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── api/            # API route tests
│   └── utils/          # Utility tests
└── components/
    └── agent-card.tsx
```

### Writing Tests
```typescript
// components/__tests__/agent-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from '../agent-card';

describe('AgentCard', () => {
  const mockAgent = {
    id: 'test-agent',
    name: 'Test Agent',
    status: 'online' as const
  };

  it('renders agent name and status', () => {
    render(<AgentCard agent={mockAgent} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<AgentCard agent={mockAgent} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Test Agent'));
    expect(onSelect).toHaveBeenCalledWith(mockAgent);
  });
});
```

---

## 🚢 Pull Request Process

### Before Submitting
- [ ] **Tests pass** locally (`npm test`)
- [ ] **Code builds** without warnings (`npm run build`)
- [ ] **Lint passes** (`npm run lint`)
- [ ] **Documentation updated** if needed
- [ ] **Branch is up to date** with main

### PR Template
```markdown
## Description
Brief description of changes and why they're needed.

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Screenshots included (for UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process
1. **Automated checks** must pass (tests, lint, build)
2. **Code review** by maintainer or contributor
3. **Feedback addressed** and discussion resolved
4. **Final approval** and merge

---

## 🎨 Design System

### Components
We use shadcn/ui as our base component library:

- **Cards** - For content containers
- **Buttons** - Consistent button variants
- **Badges** - Status indicators
- **Forms** - Input components
- **Navigation** - Menus and links

### Colors
```css
/* Primary brand colors */
--primary: 222.2 84% 4.9%;        /* Dark blue */
--primary-foreground: 210 40% 98%; /* Light text */

/* Status colors */  
--success: 142.1 76.2% 36.3%;     /* Green */
--warning: 47.9 95.8% 53.1%;      /* Yellow */
--destructive: 0 84.2% 60.2%;     /* Red */

/* Surface colors */
--background: 0 0% 100%;          /* White */
--surface-0: 0 0% 98%;            /* Light gray */
--border: 214.3 31.8% 91.4%;     /* Border gray */
```

### Typography
- **Headings:** Font weights 600-700, semantic sizing
- **Body text:** Font weight 400, 14-16px base
- **Captions:** Font weight 500, 12-13px, muted color
- **Monospace:** Code, IDs, technical content

---

## 🌟 Recognition

Contributors who help improve Talon get recognition:

### Hall of Fame
Outstanding contributors are featured in our README and documentation.

### Contributor Rewards
- **First PR merged:** Talon sticker pack
- **5+ PRs merged:** OpenClaw t-shirt  
- **Major feature:** Direct line to engineering team
- **Documentation hero:** Special contributor badge

### Maintainer Path
Active contributors may be invited to become maintainers with:
- **Commit access** to the repository
- **Issue triage** permissions
- **Release planning** involvement
- **Architecture decision** input

---

## ❓ Questions?

- **General questions:** [Discord #talon channel](https://discord.gg/openclaw)
- **Bug reports:** [GitHub Issues](https://github.com/KaiOpenClaw/talon-private/issues)
- **Security issues:** [security@openclaw.com](mailto:security@openclaw.com)
- **Partnership inquiries:** [partnerships@openclaw.com](mailto:partnerships@openclaw.com)

---

## 📜 License

By contributing to Talon, you agree that your contributions will be licensed under the MIT License.

**Thank you for helping make Talon better!** 🙏