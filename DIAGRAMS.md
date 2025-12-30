# Explainable - Visual Diagrams

This document contains visual diagrams to help understand how `explainable` works.

## Decision Resolution Flow

<div align="center">
  <img src="svg-images/Decision Resolution Flow.svg" alt="Decision Resolution Flow"/>
</div>

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
flowchart TD
    Start([Start: Multiple Config Sources])
    
    subgraph Sources[Configuration Sources]
        S1[Defaults<br/>port: 8080<br/>precedence: 0]
        S2[Config File<br/>port: 3000<br/>precedence: 5]
        S3[Environment<br/>port: 4000<br/>precedence: 10]
        S4[CLI Args<br/>port: 5000<br/>precedence: 20]
    end
    
    Start --> S1
    Start --> S2
    Start --> S3
    Start --> S4
    
    S1 --> Collect[Collect All Sources]
    S2 --> Collect
    S3 --> Collect
    S4 --> Collect
    
    Collect --> Sort[Sort by Precedence<br/>0 → 5 → 10 → 20]
    
    Sort --> Decide{For Each Field<br/>Compare Values}
    
    Decide --> Track[Track Decision:<br/>✓ port=5000 from CLI won<br/>✗ port=4000 from env lost<br/>✗ port=3000 from file lost<br/>✗ port=8080 from defaults lost]
    
    Track --> Build[Build Explained Config]
    
    Build --> Final{User Access}
    
    Final -->|.value| V[Get Final Value:<br/>port = 5000]
    Final -->|.explain| E[Get Decision Chain:<br/>Why CLI won]
    Final -->|.explainText| T[Get Formatted Text:<br/>Human-readable output]
    
    style S4 fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style Track fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style V fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style E fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style T fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style Collect fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style Build fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
```

</details>

---

## Type System & Data Flow

<div align="center">
  <img src="svg-images/Type System & Data Flow.svg" alt="Type System and Data Flow"/>
</div>

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
graph TB
    subgraph Input[Input Types]
        ConfigData[Config Data<br/>T extends Record]
        SourceMeta[Source Metadata<br/>name, precedence, reason]
    end
    
    subgraph Processing[Processing Layer]
        Builder[ConfigBuilder T<br/>Fluent API]
        Resolver[ConfigResolver T<br/>Merging Logic]
    end
    
    subgraph Core[Core Types]
        Explained[Explained T<br/>Generic Wrapper]
        Explanation[Explanation<br/>Decision Record]
    end
    
    subgraph Output[Output Types]
        Value[T<br/>Final Config Value]
        ExplanationArray[Explanation Array<br/>Decision History]
        JSON[ExplanationResult T<br/>JSON Serializable]
    end
    
    ConfigData --> Builder
    SourceMeta --> Builder
    Builder --> Resolver
    
    Resolver --> Explained
    Resolver --> Explanation
    
    Explained --> Value
    Explained --> ExplanationArray
    Explained --> JSON
    
    Explanation --> ExplanationArray
    
    style Explained fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style Value fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style ExplanationArray fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style JSON fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style Builder fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style Resolver fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
```

</details>

---

## Environment Adapter Flow

<div align="center">
  <img src="svg-images/Environment Adapter Flow.svg" alt="Environment Adapter Flow"/>
</div>

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
flowchart LR
    subgraph Input[Input]
        Schema[Schema Definition<br/>PORT: number, default 3000<br/>DEBUG: boolean, default false]
        Env[process.env<br/>PORT=8080<br/>DEBUG=true]
    end
    
    Input --> Parse[Parse & Validate]
    
    Parse --> TypeCheck{Type Check<br/>Each Field}
    
    TypeCheck -->|Valid| Success[Create Explanation:<br/>env var wins]
    TypeCheck -->|Invalid| Fallback[Use Default:<br/>default wins]
    
    Success --> Build[Build Explained Config]
    Fallback --> Build
    
    Build --> Output{Output}
    
    Output --> TypedValue[Typed Value:<br/>PORT: number = 8080<br/>DEBUG: boolean = true]
    Output --> Explanations[Explanations:<br/>PORT from env<br/>DEBUG from env]
    
    style Success fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style Fallback fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style TypedValue fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style Explanations fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style Parse fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style Build fill:#60A5FA,stroke:#3B82F6,stroke-width:2px,color:#fff
```

</details>

---

## Precedence Resolution

<div align="center">
  <img src="svg-images/Precedence Resolution.svg" alt="Precedence Resolution"/>
</div>

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
graph LR
    subgraph Precedence[Precedence Levels]
        P0[Defaults<br/>Precedence: 0]
        P5[File<br/>Precedence: 5]
        P10[Environment<br/>Precedence: 10]
        P20[CLI<br/>Precedence: 20]
        P25[Custom<br/>Precedence: 25+]
    end
    
    P0 -->|Lower| P5
    P5 -->|Lower| P10
    P10 -->|Lower| P20
    P20 -->|Lower| P25
    
    P25 --> Winner[Highest Precedence Wins]
    
    Winner --> Result[Final Value:<br/>From highest precedence<br/>All others tracked as lost]
    
    style P20 fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style P25 fill:#10B981,stroke:#059669,stroke-width:3px,color:#fff
    style Winner fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style Result fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
```

</details>

---

## Use Case: Next.js Configuration

<div align="center">
  <img src="svg-images/Use Case Nextjs Configuration.svg" alt="Next.js Use Case"/>
</div>

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
flowchart TD
    Start([Next.js App Startup])
    
    Start --> LoadDefaults[Load defaults<br/>from constants]
    LoadDefaults --> LoadEnvLocal[Load .env.local<br/>precedence: 5]
    LoadEnvLocal --> LoadEnv[Load .env<br/>precedence: 3]
    LoadEnv --> LoadVercel[Load Vercel env<br/>precedence: 10]
    LoadVercel --> Build[Build with explainable]
    
    Build --> Config[Explained Config]
    
    Config --> Dev{Development Mode?}
    
    Dev -->|Yes| Debug[Log Explanations<br/>console.log explain]
    Dev -->|No| Use[Use Config]
    
    Debug --> Use
    
    Use --> App[Next.js App]
    
    App --> Question[User asks:<br/>Why is API_URL X?]
    Question --> CheckLog[Check logs:<br/>See decision chain]
    
    style Build fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style Debug fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style CheckLog fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style Config fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style App fill:#60A5FA,stroke:#3B82F6,stroke-width:2px,color:#fff
```

</details>

---

## Adapter Pattern for Ecosystem

<div align="center">
  <img src="svg-images/Adapter Pattern for Ecosystem.svg" alt="Adapter Pattern for Ecosystem"/>
</div>

<details>
<summary>View Mermaid Source Code</summary>

```mermaid
graph TB
    subgraph CoreAPI[Core API]
        Explained[Explained T<br/>Core abstraction]
    end
    
    subgraph BuiltInAdapters[Built-in Adapters]
        EnvAdapter[explainEnv<br/>Environment variables]
        TSConfigAdapter[explainTSConfig<br/>TypeScript config]
        ConfigBuilder[explainable<br/>Multi-source builder]
    end
    
    subgraph FutureAdapters[Future Adapters]
        ESLint[explainESLint<br/>ESLint rules]
        Vite[explainVite<br/>Vite config]
        Dotenv[explainDotenv<br/>.env files]
        Webpack[explainWebpack<br/>Webpack config]
    end
    
    Explained --> EnvAdapter
    Explained --> TSConfigAdapter
    Explained --> ConfigBuilder
    Explained -.-> ESLint
    Explained -.-> Vite
    Explained -.-> Dotenv
    Explained -.-> Webpack
    
    EnvAdapter --> UserCode1[User Code]
    TSConfigAdapter --> UserCode1
    ConfigBuilder --> UserCode1
    ESLint -.-> UserCode2[Future User Code]
    Vite -.-> UserCode2
    
    style Explained fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style EnvAdapter fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style TSConfigAdapter fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style ConfigBuilder fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style ESLint fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style Vite fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style Dotenv fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style Webpack fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
```

</details>

---

## Legend - Color Scheme

- 🔵 **Blue (#3B82F6)**: Core components (Explained, processing, config objects)
- 🟢 **Green (#10B981)**: Successful/winning values, built-in features, highest precedence
- 🟠 **Orange (#F59E0B)**: Output, results, explanations, final values
- 🟣 **Purple (#8B5CF6)**: Resolvers, processing engines, transformations
- 🌸 **Pink (#EC4899)**: Adapters, future features, fallbacks
- 🔷 **Light Blue (#60A5FA)**: Secondary components, helpers
- ➡️ **Solid lines**: Implemented functionality
- ⋯➡️ **Dashed lines**: Future/planned features

## How to Read These Diagrams

1. **Flow Direction**: Follow arrows from left to right or top to bottom
2. **Colors**: Indicate component type or status (see legend)
3. **Precedence**: Higher numbers win over lower numbers
4. **Shapes**:
   - Rectangles: Processes or components
   - Diamonds: Decision points
   - Rounded rectangles: Start/end points
   - Grouped boxes: Related components

## Understanding Precedence

```
Defaults (0) < File (5) < Environment (10) < CLI (20) < Custom (25+)

When the same field appears in multiple sources:
- The source with HIGHER precedence wins
- All other sources are tracked as "lost"
- You can see the complete decision chain
```

## Real-World Example

```
Your port is 5000 because:
✓ CLI argument provided it (precedence: 20) ← WINNER
✗ Environment variable had 4000 (precedence: 10)
✗ Config file had 3000 (precedence: 5)
✗ Default was 8080 (precedence: 0)

Without explainable: You see 5000, no idea why
With explainable: You see exactly why and what was overridden
```

