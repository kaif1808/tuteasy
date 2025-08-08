## Security Status

### Completed (Dec 2024)
- **Rate Limiting**: Per-auth-endpoint limits; skip successful logins; structured retry info
- **HttpOnly Cookies**: Refresh token in secure, SameSite=strict cookies; rotation and cleanup
- **Enumeration Safety**: Generic error messages; consistent timing; reduced leakage
- **Security Logging**: Structured JSON events across auth flows with alerts
- **Standards**: Strong passwords, JWT expiry, input validation, CORS/helmet

### Next
- Staging hardening + monitoring
- MFA, behavioral analysis (Phase 5)
- Regular audits and dependency updates
