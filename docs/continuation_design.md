sequenceDiagram
    participant User
    participant UI
    participant API
    participant OpenAI
    
    User->>UI: Enter prompt in textarea
    User->>UI: Click "Continue Discussion"
    UI->>API: POST /api/discussions/continue
    Note over API: Create USER turn
    API->>OpenAI: Generate 6 turns with full context
    API-->>UI: Stream progress updates
    API-->>UI: Return new turns
    UI->>UI: Append to transcript
    UI->>UI: Clear input, ready for next prompt