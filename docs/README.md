# Financial OS — Documentation Master Index

Welcome to the comprehensive technical and product documentation repository for **Financial OS** (Prescriptive Financial Decision Operating System).

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       DOCUMENTATION SUITE SITEMAP                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📁 docs/research/ ──► Academic, Macroeconomic & Behavioral Research    │
│  📁 docs/product/  ──► PRD, Personas, User Journeys & Release Roadmap   │
│  📁 docs/architecture/ ──► Multi-Tier Systems, AI, DB, & Engine Models  │
│  📄 docs/Proposed_Features.md ──► Feature Matrix & Product Philosophy   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 1. Research & Market Intelligence (`docs/research/`)

* [Research.pdf](file:///d:/RealFinanceProject/docs/research/Research.pdf) — Complete 15-page foundational research blueprint detailing Philippine macroeconomic trends, BSP CFIS data, and behavioral economics.
* [research.md](file:///d:/RealFinanceProject/docs/research/research.md) — Comprehensive synthesis of macroeconomic indicators, behavioral biases (present bias, expense tracking fatigue), Bank Secrecy Law, and quantitative problem rankings.
* [competitors.md](file:///d:/RealFinanceProject/docs/research/competitors.md) — Granular teardowns of GCash, Maya, GoTyme, CIMB, traditional banks, YNAB/Monarch, and Cleo, plus the competitive moat matrix.
* [interviews.md](file:///d:/RealFinanceProject/docs/research/interviews.md) — Qualitative user interview findings (N=24) and ground-truth complaint mining from `r/phinvest`, `r/adultingph`, and `r/ola_harassment`.

---

## 🎯 2. Product Strategy & Specifications (`docs/product/`)

* [PRD.md](file:///d:/RealFinanceProject/docs/product/PRD.md) — Production-grade Product Requirement Document detailing the 8 major systems, mathematical formulas, functional specifications, and success KPIs.
* [user-personas.md](file:///d:/RealFinanceProject/docs/product/user-personas.md) — Empathetic, detailed user personas (Alex the Young Pro, Maya the Freelancer, Jordan & Camille the Family Planners, Joshua the Gen Z Earner).
* [user-flows.md](file:///d:/RealFinanceProject/docs/product/user-flows.md) — End-to-end user journeys with sequence diagrams (Zero-Credential Onboarding, Ambient Capture, Daily Safe-to-Spend, What-If Sandbox, CIEL Advisory, Scam/OLA Shield).
* [roadmap.md](file:///d:/RealFinanceProject/docs/product/roadmap.md) — 8-phase research-to-execution framework, 3-tier feature releases (Tier 1 Core, Tier 2 Differentiators, Tier 3 Advanced), and engineering Gantt milestones.

---

## 🏗️ 3. Technical & Engineering Architecture (`docs/architecture/`)

* [system-architecture.md](file:///d:/RealFinanceProject/docs/architecture/system-architecture.md) — End-to-end distributed system architecture (Next.js 14, FastAPI Gateway, Deterministic Engines, Celery Workers, Redis, PostgreSQL 16).
* [ai-architecture.md](file:///d:/RealFinanceProject/docs/architecture/ai-architecture.md) — CIEL Copilot dual-core architecture, prompt assembler, deterministic tool execution catalog, `pgvector` memory bank, and safety guardrails.
* [database-architecture.md](file:///d:/RealFinanceProject/docs/architecture/database-architecture.md) — Complete PostgreSQL 16 DDL schemas, monthly partitioned transaction ledger, double-entry design, and Row-Level Security (RLS) tenant isolation policies.
* [engines-specification.md](file:///d:/RealFinanceProject/docs/architecture/engines-specification.md) — Pure mathematical models, scaling curves, Python reference code, and pseudo-algorithms for Financial Health, Safe-to-Spend, Velocity Burn Rate, and Adaptive Savings.
* [security-and-privacy.md](file:///d:/RealFinanceProject/docs/architecture/security-and-privacy.md) — Zero-credential privacy blueprint, RA 10173 & RA 1405 compliance, AI Scam Radar heuristics, and OLA Harassment Shield legal complaint automation.
