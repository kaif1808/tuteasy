## UK / IB Integration Status

Last updated: 2025-08-08

### Summary
- **State**: Green — Types, validation, UI complete; matching next

### Completed
- Backend schema: UKYearGroup, UKKeyStage, IBProgramme; qualification levels
- Services/validation: UK/IB-aware constraints and queries
- Frontend: forms, types, and validation covering UK/IB structures
- Documentation: PRDs updated for UK/IB flows and terminology

### In Progress
- Tutor matching using academic-level filters and exam boards

### Next Milestones (2-3 weeks)
- [ ] Add search filters for UK key stage, exam board, IB programme
- [ ] Validation for cross-curriculum mappings and edge cases
- [ ] Assessment and results tracking model proposal

### Risks & Mitigations
- **Terminology drift**: Centralize constants; cross-check with PRDs
- **Search complexity**: Precompute facets and indexes; cache hot sets

### Metrics & Targets
- Successful matches using UK/IB filters ≥ 90%; zero invalid mappings
