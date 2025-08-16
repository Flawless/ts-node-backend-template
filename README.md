# Node Backend Template

Production-grade Node.js backend/frontend template with extreme strictness, Testing Trophy philosophy, and comprehensive observability.

## Features

- **Fastify v5.1.0**: High-performance web framework (72K RPS capability)
- **TypeScript**: Extreme strict mode with all safety flags enabled
- **Testing Trophy Philosophy**:
  - Integration Tests: 45-50%
  - Unit Tests: 25-30%
  - Contract Tests: 10-15%
  - E2E Tests: 10-15%
- **Observability**: OpenTelemetry + Pino structured logging (10K+ logs/sec)
- **Security**: Helmet, CORS, rate limiting, CSP, security headers
- **Code Quality**: ESLint v9 with extreme strictness, Prettier, Husky
- **Performance**: 72K RPS with Fastify, compression, efficient serialization
- **Development**: Hot reload with tsx, comprehensive scripts
- **Generic Template**: Supports both backend and frontend projects

## Extreme Strictness

This template enforces zero-tolerance quality standards:
- TypeScript strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- ESLint security rules preventing `eval`, `console.log`, `any` types
- Pre-commit hooks requiring 80%+ test coverage
- Automated license checking and code duplication detection
- Cognitive complexity limits (max 10)
- No warnings tolerance in linting

## Project Structure

```
node-backend-template/
├── src/
│   ├── server/              # Backend-specific code
│   │   ├── routes/          # API routes
│   │   ├── plugins/         # Fastify plugins
│   │   ├── middleware/      # Request middleware
│   │   └── handlers/        # Request handlers
│   ├── client/              # Frontend-specific code
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   └── utils/           # Client utilities
│   ├── shared/              # Shared code (backend/frontend)
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Shared utilities
│   │   ├── constants/       # Constants
│   │   └── config/          # Configuration
│   ├── telemetry/           # OpenTelemetry setup
│   └── index.ts             # Application entry point
├── tests/
│   ├── unit/                # Unit tests (25-30%)
│   ├── integration/         # Integration tests (45-50%)
│   ├── contract/            # Contract tests (10-15%)
│   └── e2e/                 # End-to-end tests (10-15%)
├── config/                  # Configuration files
├── scripts/                 # Utility scripts
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

1. Clone the repository:
```bash
git clone https://github.com/example/node-backend-template.git
cd node-backend-template
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with appropriate values

### Development

Run the development server with hot reload:
```bash
npm run dev
```

Run with debugging:
```bash
npm run dev:debug
```

## Testing

### Test Commands

```bash
npm test                  # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:contract    # Contract tests only
npm run test:e2e         # E2E tests only
npm run test:coverage    # Run with coverage (must be >80%)
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI
```

### Coverage Requirements

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Code Quality

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint        # Check for issues (zero warnings tolerance)
npm run lint:fix    # Auto-fix issues
```

### Formatting
```bash
npm run format       # Format all files
npm run format:check # Check formatting
```

### Security Checks
```bash
npm run security:audit    # Security audit
npm run security:licenses # License checking
npm run security:secrets  # Secret detection
```

### Quality Validation
```bash
npm run quality:duplication  # Code duplication (max 3%)
npm run quality:complexity   # Circular dependencies
npm run quality:dependencies # Unused dependencies
npm run validate:all         # Run all validations
```

## API Documentation

Swagger UI available at:
```
http://localhost:3000/documentation
```

## Observability

### OpenTelemetry
- Automatic HTTP instrumentation
- Fastify route tracing
- Pino log correlation
- Prometheus metrics endpoint (port 9090)

### Structured Logging
- Pino with 10K+ logs/sec capability
- Request/response logging
- Correlation IDs
- Sensitive data redaction

## Performance

- 72K RPS capability with Fastify
- Compression enabled
- Efficient JSON serialization
- Connection pooling
- Graceful shutdown

## Scripts Reference

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run dev:debug        # Start with debugger

# Production
npm run build            # Build TypeScript
npm start                # Start production server
npm run start:prod       # Start with NODE_ENV=production

# Testing
npm test                 # Run tests
npm run test:coverage    # With coverage
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI

# Code Quality
npm run type-check       # TypeScript checking
npm run lint             # ESLint
npm run format           # Prettier

# Security & Quality
npm run validate:all     # All validations
npm run pre-commit       # Pre-commit checks

# Docker
npm run docker:build     # Build image
npm run docker:run       # Run container

# Utilities
npm run clean            # Clean build artifacts
npm run telemetry:test   # Test telemetry
```

## Environment Variables

See `.env.example` for all configuration options:
- Server configuration (HOST, PORT)
- Logging levels
- OpenTelemetry endpoints
- Rate limiting
- CORS settings
- Swagger documentation

## Docker Support

```bash
# Build production image
docker build -t node-backend-template .

# Run container
docker run -p 3000:3000 --env-file .env node-backend-template
```

## Pre-commit Hooks

Automatic validation on commit:
1. TypeScript type checking
2. ESLint (zero warnings)
3. Prettier formatting
4. Test coverage (>80%)
5. Security audit
6. License checking
7. Code duplication detection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit changes (will trigger pre-commit hooks)
4. Push to branch
5. Open Pull Request

## License

MIT