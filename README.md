# CodeGuardian AI

> Agentic Engineering Quality Analyzer

CodeGuardian AI is an AI-powered engineering assistant designed to analyze software repositories and provide intelligent insights into security, maintainability, and performance. The platform leverages multiple specialized AI agents to review source code, prioritize engineering risks, and generate executive-level recommendations.

Developed as part of the **HCLTech × OpenAI Agentic AI Hackathon 2026**.

---

## Features

- Repository Analysis
- Intelligent File Prioritization
- Multi-Agent Code Review
- Security Analysis
- Code Quality Assessment
- Performance Analysis
- Executive Risk Summary
- Interactive Engineering Dashboard

---

## Architecture

```
GitHub Repository
        │
        ▼
Repository Discovery
        │
        ▼
Risk-Based File Prioritization
        │
        ▼
 ┌──────────────┬──────────────┬──────────────┐
 │              │              │
 ▼              ▼              ▼
Sentinel     Craft         Velocity
(Security)  (Quality)   (Performance)
 │              │              │
 └──────────────┴──────────────┘
               │
               ▼
          Advisor Agent
               │
               ▼
      Executive Dashboard
```

---

## Technology Stack

### Frontend

- React
- Tailwind CSS
- JavaScript

### Backend

- FastAPI
- Python

### AI

- OpenAI API
- Multi-Agent Architecture

---

## AI Agents

### Sentinel Agent

Identifies security vulnerabilities and potential risks within the repository.

### Craft Agent

Evaluates maintainability, coding practices, architecture, and code quality.

### Velocity Agent

Analyzes performance bottlenecks and optimization opportunities.

### Advisor Agent

Aggregates findings from all agents and generates an executive engineering summary.

---

## Project Status

This repository represents the **official hackathon submission** for the HCLTech × OpenAI Agentic AI Hackathon 2026.

The project was developed within the hackathon timeline as a proof-of-concept demonstrating the application of agentic AI to software engineering workflows.

---

## License

This repository is maintained as the official hackathon submission.