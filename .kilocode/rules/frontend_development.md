# Frontend Development Guidelines - HIGH PRIORITY

Standards for React/TypeScript applications, covering component architecture, performance optimization, state management, and accessibility requirements.

## TypeScript and Code Quality
When working with frontend code:
- Use TypeScript for all new frontend code with `strict` mode enabled in `tsconfig.json`
- Define interfaces or types for all API responses, props, and complex data structures
- Use proper type annotations and actively avoid the `any` type
- Implement proper error boundaries in React components to gracefully handle runtime errors
- Use ESLint and Prettier with consistent configuration

## Performance and Scalability
For all frontend development:
- Implement caching strategies with React Query or Zustand for frequently accessed data to minimize API calls
- Use lazy loading for React components and routes where appropriate (`React.lazy`, dynamic `import()`)
- Implement proper image optimization (compression, responsive images using `<picture>` or `srcset`)
- Use `React.memo()` for expensive component re-renders when props are unlikely to change frequently
- Implement virtual scrolling (virtualization) for large lists to improve rendering performance

## Real-time Communication
When implementing WebSocket or Socket.io on the client-side:
- Implement proper connection handling (connect, disconnect, error events)
- Include robust reconnection logic with backoff strategies
- Handle real-time events idempotently where possible
- Ensure authentication tokens are securely transmitted and handled for socket connections

## Video Conferencing Specific Rules
For WebRTC and video conferencing features:
- Always handle camera/microphone permission requests gracefully with clear user feedback
- Implement proper WebRTC error handling (connection failures, stream issues) and fallbacks
- Use STUN/TURN servers for NAT traversal and ensure proper configuration
- Consider bandwidth optimization techniques (adjusting video quality based on connection speed)
- Add proper cleanup for media streams (stopping tracks, releasing resources) when components unmount or calls end

## Project Structure Standards
Organize frontend code following this structure:
```
frontend/src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Input, Card)
│   └── features/        # Feature-specific components
├── pages/               # Page components, mapped to routes
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # Global TypeScript type definitions
├── services/            # API call definitions, client-side service layers
├── stores/              # State management (Zustand, Redux Toolkit)
├── constants/           # Application-wide constants
└── assets/              # Static assets
```

## Naming Conventions
- Use PascalCase for React components and TypeScript interfaces/types
- Use camelCase for functions, variables, methods, and hook names
- Use kebab-case for file names and CSS class names (if not using utility-first CSS)
- Prefix custom hooks with `use` (e.g., `useStudentProfile`, `useDebounce`)

## Component Development Standards
When creating React components:
- Ensure all components are properly typed with React props and state interfaces
- Include proper cleanup for effects, subscriptions, and media streams
- Implement responsive design patterns and mobile-first approaches
- Include proper form validation and user feedback mechanisms
- Consider performance implications (memoization, lazy loading, virtualization)
- Include accessibility best practices (ARIA labels, keyboard navigation, focus management)

## Code Generation Requirements
When generating frontend code for this Tutoring CRM Platform, always include:
- Comprehensive error handling for all async operations and external service calls
- Loading states and error states in components that involve data fetching
- Proper form validation and user feedback mechanisms
- Accessibility considerations (ARIA labels, keyboard navigation) for educational accessibility
- Performance optimizations (memoization where appropriate)
- Responsive design patterns for mobile tutoring sessions
- Privacy-conscious UI patterns for student data display
- Clear user consent flows for data collection