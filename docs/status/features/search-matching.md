## Feature: Search & Matching

Last updated: 2025-08-08 — Status: Amber

### Scope
Tutor search with curriculum-aware filters (UK Key Stages, exam boards; IB programmes) and ranking.

### Code Map
- Backend: `backend/src/controllers/search.controller.ts`, `backend/src/routes/search.routes.ts`, `backend/src/services/search.service.ts`, `backend/src/types/search.types.ts`
- Frontend: `frontend/src/pages/TutorSearchPage.tsx`, `frontend/src/services/searchService.ts`, `frontend/src/types/search.ts`

### Completed
- Basic tutor search endpoints; pagination and validation

### In Progress
- Filter expansion for UK/IB; ranking heuristics; caching hot queries

### Next Milestones
- [ ] Add UK/IB filter params and validation
- [ ] Implement ranking (availability, reviews, expertise)
- [ ] Cache top queries in Redis; add index coverage in DB

### Risks & Mitigations
- N+1 queries — pre-joins/aggregations; indexes; cache

### Metrics & Targets
- P95 search < 200ms; relevant top-3 click rate ≥ 60%
