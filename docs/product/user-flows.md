# End-to-End User Flows — Financial OS

## 1. Zero-Credential Onboarding & Baseline Setup Flow

Financial OS completely avoids asking for banking passwords or Plaid-style credentials. Onboarding is fast, friction-free, and respects privacy from minute one.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Next.js Web/Mobile Client
    participant Auth as Auth & Encryption Service
    participant Engine as Financial Health Engine
    
    User->>App: Launch App & Sign Up (Email / OAuth)
    App->>Auth: Register Account & Generate Master Encryption Key
    Auth-->>App: Session Initialized (JWT + Encrypted Profile)
    
    User->>App: Declare Accounts (e.g., GCash, Maya, BPI, Cash) + Starting Balances
    User->>App: Add Primary Income Frequency (e.g., 15th & 30th) & Monthly Fixed Bills
    
    App->>Engine: Calculate Initial Baseline Financial Health Score
    Engine-->>App: Baseline Score (e.g., 74/100) + Personalized Health Drivers
    App-->>User: Display Interactive Health Dashboard & Safe-to-Spend Limit
```

---

## 2. Universal Ambient Transaction Capture Flow

Eliminates manual entry through automated, on-device parsing of transactional artifacts.

```mermaid
graph TD
    A[Incoming Financial Event] --> B{Source Type}
    
    B -->|SMS Alert| C[Local Regex & NLP Matcher]
    B -->|Wallet Push Notification| D[Notification Listener Service]
    B -->|Physical Receipt| E[Client Vision OCR Engine]
    B -->|Bank CSV File| F[CSV Normalizer & Deduplicator]
    B -->|Manual Quick-Add| G[Floating Speed Modal]
    
    C --> H[Extract Merchant, Amount, Date, Reference #]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Smart Category Classifier<br/>e.g., Jollibee -> Dining]
    I --> J[Deduplication Check against Existing Records]
    J -->|Duplicate Found| K[Flag & Merge or Discard]
    J -->|Unique Transaction| L[Append to Double-Entry Ledger]
    
    L --> M[Trigger Safe-to-Spend & Velocity Recalculation]
    M --> N[Real-Time Dashboard UI Update]
```

---

## 3. Daily Safe-to-Spend & Morning Briefing Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Client UI
    participant SpendEngine as Safe-to-Spend Engine
    participant CIEL as CIEL AI Copilot
    
    Note over App,CIEL: Automated 8:00 AM Daily Execution
    SpendEngine->>SpendEngine: Query Liquid Balances, Cycle Days Remaining, & Bills Due
    SpendEngine->>CIEL: Send Updated Allowance (e.g., ₱428/day) & Velocity Alerts
    CIEL->>CIEL: Synthesize Daily Briefing Card
    
    User->>App: Open Dashboard
    App-->>User: Display Safe-to-Spend Metric ($428 Today) + CIEL Briefing
    
    User->>App: Spends ₱150 on Lunch (Captured via GCash SMS)
    App->>SpendEngine: Deduct ₱150 from Today's Pool
    SpendEngine-->>App: Remaining Safe-to-Spend Today: ₱278
```

---

## 4. "What-If" Purchase & Multi-Scenario Simulator Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Simulator Modal
    participant SimEngine as What-If Simulation Engine
    participant HealthEngine as Financial Health Engine
    participant CIEL as CIEL Advisory Layer
    
    User->>UI: Enter Scenario ("Buy ₱60,000 Laptop")
    UI->>SimEngine: Submit Proposal (Cost: ₱60,000, Category: Tech/Asset)
    
    SimEngine->>HealthEngine: Simulate Scenario A: Outright Cash Depletion
    HealthEngine-->>SimEngine: Health Score drops 82 -> 69, Emergency 3.2mo -> 0.7mo
    
    SimEngine->>HealthEngine: Simulate Scenario B: 0% 12-Month Installment (₱5k/mo)
    HealthEngine-->>SimEngine: Health Score drops 82 -> 79, Emergency 3.2mo -> 3.0mo
    
    SimEngine->>HealthEngine: Simulate Scenario C: Save 3 Months Buffer First
    HealthEngine-->>SimEngine: Health Score remains 82, Zero Liquidity Shock
    
    SimEngine->>CIEL: Generate Contextual Comparative Synthesis
    CIEL-->>UI: Output Side-by-Side Comparison Matrix & Recommendation
    UI-->>User: Visual Impact Display with 1-Click Action Plan
```

---

## 5. CIEL Conversational Ingestion & Decision Advisory Flow

```mermaid
graph TD
    UserQuery[User: 'Can I afford to go to Boracay next month for ₱25k?'] --> Gateway[API Gateway / Chat Router]
    Gateway --> ContextBuilder[Context Synthesizer]
    
    ContextBuilder --> DBQuery[Fetch User Ledger, Balances, Goals, Bills & Velocity]
    DBQuery --> PromptAssembly[Assemble Token-Optimized System Prompt]
    
    PromptAssembly --> LLM[CIEL Core LLM Engine]
    LLM --> ToolCall{Needs Calculation?}
    
    ToolCall -->|Yes: Tool Invocations| EngineCalls[Execute simulate_purchase & get_safe_to_spend]
    EngineCalls --> DeterministicResult[Deterministic Mathematical Output]
    DeterministicResult --> LLM
    
    ToolCall -->|No: Ready to Answer| FinalResponse[Synthesize Grounded Response]
    FinalResponse --> Guardrail[Financial Safety & Sanity Guardrail Layer]
    Guardrail --> Client[Deliver Response to User Interface]
```

---

## 6. Proactive Scam Radar & OLA Harassment Shield Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Security Screen
    participant ScamEngine as AI Scam & Link Detector
    participant LegalShield as OLA Legal Generator
    
    alt Scam Link / SMS Scan
        User->>App: Paste Suspicious SMS ("GCash account restricted, click bit.ly/xxx")
        App->>ScamEngine: Analyze Linguistic Urgency, Domain WHOIS, & Phishing Heuristics
        ScamEngine-->>App: Risk Assessment: 96% High Risk (Spoofed Domain, False Urgency)
        App-->>User: Display Red Threat Alert & "Do Not Click" Warning
    else OLA Harassment Incident
        User->>App: Upload Abusive Collection Message / Threat Screenshot
        App->>LegalShield: Classify Statutory Violations (SEC MC 18 / RA 10173)
        LegalShield-->>App: Flag Violations: Third-Party Shaming, Illegal Calling Hours
        App->>LegalShield: Generate Pre-Formatted BSP BOB / SEC Formal Complaint PDF
        LegalShield-->>User: Deliver Signed Legal Affidavit Ready to Submit
    end
```
