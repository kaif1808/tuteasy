## Feature: Authentication

Last updated: 2025-08-08 — Status: Green

### Scope
Registration, login, logout, password reset, email verification, JWT access/refresh, RBAC, session handling.

### Code Map
- Backend: `backend/src/controllers/authController.ts`, `backend/src/routes/authRoutes.ts`, `backend/src/services/authService.ts`, `backend/src/middleware/auth.ts`, `backend/src/middleware/rateLimit.ts`, `backend/src/utils/cookieUtils.ts`, `backend/src/utils/securityLogger.ts`, `backend/src/types/auth.ts`
- Backend tests: `backend/src/tests/security/authentication.test.ts`, `backend/src/tests/security/rateLimiting.test.ts`
- Frontend: `frontend/src/pages/Login.tsx`, `frontend/src/pages/Register.tsx`, `frontend/src/pages/ForgotPassword.tsx`, `frontend/src/pages/ResetPassword.tsx`, `frontend/src/pages/VerifyEmail.tsx`, `frontend/src/pages/VerifyEmailNotice.tsx`, `frontend/src/components/ProtectedRoute.tsx`, `frontend/src/hooks/useAuth.ts`, `frontend/src/stores/authStore.ts`, `frontend/src/services/authService.ts`

### Completed
- JWT with rotation and expiry; refresh via HttpOnly SameSite=strict cookie
- RBAC (tutor, student, parent, admin) checks in middleware and routes
- Secure error responses and enumeration safety
- Rate limiting on auth endpoints

### In Progress
- Session timeout UX messaging and auto-logout
- Device/session management listing and revocation

### Next Milestones
- [ ] Implement device-based refresh token revocation endpoint
- [ ] Idle timeout banner and grace period handling on FE
- [ ] Add TOTP MFA scaffold (opt-in) with backup codes (Phase 5)

### Risks & Mitigations
- Token theft — short-lived access tokens + rotate refresh; revoke by device
- Brute force — per-IP and per-username rate limits; delay responses progressively

### Metrics & Targets
- Login P95 < 150ms; password reset email < 60s end-to-end
- <0.5% auth error rate sustained; zero account enumeration leaks

### References
- Security Standards: `SECURITY.md`, repo security rules
