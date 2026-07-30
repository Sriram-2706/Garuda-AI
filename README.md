# Garuda AI

> Autonomous Engineering Intelligence Platform

Garuda AI is an independent continuation inspired by concepts explored during the HCLTech x OpenAI Agentic AI Hackathon. The platform analyzes software repositories and assembles engineering intelligence across security, maintainability, performance, and executive reporting while preserving the current application runtime behavior.

## Overview

Garuda AI helps engineering teams review public repositories through the existing repository ingestion, prioritization, and multi-agent analysis pipeline. The product experience is centered on four user-facing intelligence views:

- Engineering Health
- Security Intelligence
- Maintainability Insights
- Performance Intelligence

An Executive Intelligence Report summarizes overall risk, confidence, total findings, and recommended next actions from the same backend outputs already produced by the application.

## User-Facing Agents

- Sentinel: security intelligence
- Architect: maintainability insights
- Velocity: performance intelligence
- Oracle: executive intelligence report

## How It Works

1. A public GitHub repository URL is submitted through the frontend.
2. Existing backend services collect repository metadata and prioritize files for review.
3. Specialized agents analyze the selected files for security, maintainability, and performance signals.
4. The application presents the resulting findings alongside executive intelligence.

## Technology Stack

- Frontend: React, Tailwind CSS, Vite
- Backend: FastAPI, Python
- AI Integration: OpenAI API with multi-agent orchestration

## Project Positioning

Garuda AI is maintained as an independent continuation of the original hackathon work. This repository preserves established backend workflows, prompts, schemas, and core runtime behavior while evolving the brand and user-facing presentation.
