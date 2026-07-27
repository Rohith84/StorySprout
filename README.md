# 🌱 StorySprout
### **Intergenerational Knowledge Transfer Through AI Storytelling — Turned Into a Book for Every Child**
> *"Sowing Yesterday's Wisdom, Growing Tomorrow's Minds."*

[![IBM Granite](https://img.shields.io/badge/AI_Engine-IBM_Granite_4-blue.svg)](https://www.ibm.com/granite)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent_Pipeline-emerald.svg)](#-the-six-agent-ai-pipeline-ibm-granite--watsonx)
[![Framework](https://img.shields.io/badge/Frontend-Next.js_16-black.svg)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-green.svg)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

![StorySprout Architecture Banner](storysprout_architecture_diagram.png)

---

## 📖 StorySprout Submission Overview

> *A grandmother in Chennai has a memory — the day she cooked **Pongal for the first time** as a newlywed. She wants her 6-year-old grandson in London to know that story, feel that warmth, and understand why it matters. But she can't write a children's book.*
>
> *A biology teacher knows that children remember **how the heart pumps blood** far better when it's told as a story about a brave little red cell on a journey — not from a diagram in a textbook.*
>
> **StorySprout turns both of these into a personalised, illustrated storybook — in the child's language, at the child's reading level — in under 60 seconds. The knowledge travels. The child learns. The story lives on.**

---

## 🚨 The Issue vs. Our Magic Solution

| ❌ The Issue | ✨ Our Magic Solution |
| :--- | :--- |
| **Knowledge dies with the generation holding it.** Every generation carries knowledge the next one is losing — a grandmother's recipe, a teacher's anatomy metaphor, a cultural festival that only elders truly understand, an unwritten family history. | **StorySprout is an AI platform built on IBM Granite (WatsonX)** that transforms any piece of human knowledge — a family memory, a cultural tradition, a historical event, or a classroom lesson — into a personalized, illustrated, educationally layered children's storybook in seconds. |
| Existing tools are either generic AI writing assistants with no educational structure, or complex creative platforms requiring writing and illustration skills most people don't have. | Powered by a **Six-Agent AI Pipeline**: a `SafetyAgent` guards child safety, a `NarrativeAgent` writes age-calibrated stories natively in the child's language, a `FactCheckAgent` verifies cultural & historical truth, and `PedagogyAgent`, `QuizAgent`, & `VisualAgent` run in parallel to generate vocabulary cards, quizzes, and illustrations. |

---

## 👵 Who Uses StorySprout & How Knowledge Travels

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     👵 THE GRANDPARENT    │      │       🧬 THE TEACHER      │      │       🌍 THE PARENT       │
│                           │      │                           │      │                           │
│ "I want my grandson to    │      │ "I want my Year 4 class to│      │ "My child was born here   │
│ know about the Pongal we  │      │ understand how the        │      │ but I want them to        │
│ cooked the first year the │      │ circulatory system works  │      │ understand the Partition  │
│ harvest failed."          │      │ using a red cell hero."   │      │ of India with empathy."   │
└─────────────┬─────────────┘      └─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │                                  │
              ▼                                  ▼                                  ▼
 🌾 Family Memory Story             🔬 Educational Custom Story            📜 Historical Domain Story
 • Tamil native language            • Red Blood Cell Hero                  • Child's point of view
 • Age-calibrated for 6-year-old    • Vocab: "artery", "oxygen"            • FactCheckAgent verified
 • Vocab: "harvest", "gratitude"    • Comprehension quiz at end            • Lived experience history
```

### 🔄 How Knowledge Travels — From Holder to Child

```
[👵 Knowledge Holder] ──► [📋 Domain Wizard] ──► [🤖 6-Agent Pipeline] ──► [📖 Child Reads & Learns] ──► [🌱 Knowledge Planted]
 (Grandparent, Teacher   (Guided questions       (IBM Granite writes,       (Flipbook, audio, vocab,     (Memory & lesson
  or Parent)              capture memory/lesson)  fact-checks, illustrates)  quizzes & PDF book)         understood forever)
```

---

## 🏛️ The Three Domain Modes

StorySprout features **three guided creation wizards**, each tailored to a specific type of knowledge transfer:

```mermaid
graph TD
    A[Create Mode] --> B[👨‍👩‍👧 Family Memory]
    A --> C[🌍 Cultural & Heritage]
    A --> D[📜 Historical]

    B --> B1["Personal & Emotional<br/>Grandparent memories, family events, childhood stories."]
    C --> C1["Roots & Identity<br/>Traditions, festivals, folk tales, food meanings."]
    D --> D1["History as Lived Experience<br/>Historical eras, events, real figures from a child's POV."]
```

1. 👨‍👩‍👧 **Family Memory**: Captures personal stories, family events, and childhood memories. *(Preserves personal history — not fact-checked as memories are personal).*
2. 🌍 **Cultural & Heritage**: Passes on traditions, festivals, food origins, folk tales, and family values. *(Verified by `FactCheckAgent` for cultural authenticity).*
3. 📜 **Historical**: Brings real historical eras, events, and real figures to life through the eyes of a child living then. *(Verified by `FactCheckAgent` for historical accuracy).*

---

## 🤖 The Six-Agent AI Pipeline (IBM Granite / WatsonX)

All story generation is orchestrated by the **`RootOrchestratorAgent`** ([backend/agents/orchestrator.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/orchestrator.py)), delegating to 6 specialized AI sub-agents powered by **`ibm/granite-4-h-small`**:

```mermaid
flowchart TD
    User["👤 User / React Wizard UI"] -->|"StoryRequest JSON"| Gateway["⚡ FastAPI Backend Gateway (/generate-story)"]
    Gateway --> Orchestrator["👑 Root Orchestrator Agent"]

    subgraph SequentialAgents["Core Sequential Sub-Agents"]
        Orchestrator -->|"1. Sanitize & Audit"| Safety["🛡️ Safety Agent (IBM Granite + Guardrails)"]
        Orchestrator -->|"2. Generate Narrative"| Storyteller["✍️ Master Storyteller Agent (ibm/granite-4-h-small)"]
        Orchestrator -->|"3. Fact Check"| FactCheck["🔍 Fact Check Agent (ibm/granite-4-h-small)"]
    end

    subgraph ParallelAgents["⚡ Parallel Sub-Agent Pool (Concurrent Threads)"]
        Orchestrator -->|"Parallel Call"| Pedagogy["📖 Pedagogy Agent (ibm/granite-4-h-small)<br/>Extracts 4 Vocab Words & Definitions"]
        Orchestrator -->|"Parallel Call"| Quiz["🧩 Quiz Agent (ibm/granite-4-h-small)<br/>Builds 3 Comprehension Questions"]
        Orchestrator -->|"Parallel Call"| Visual["🎨 Visual Director Agent (ibm/granite-4-h-small)<br/>Crafts Illustration Scene Prompts"]
    end

    Safety --> FinalJSON["📦 Assembled Final Story JSON"]
    Storyteller --> FinalJSON
    FactCheck --> FinalJSON
    Pedagogy --> FinalJSON
    Quiz --> FinalJSON
    Visual --> FinalJSON

    FinalJSON --> ImageGen["🖼️ Image Gen Engine (Pollinations.ai / FLUX Model)"]
    FinalJSON --> PDFBook["📄 Printable PDF Book Exporter (@react-pdf/renderer)"]
    FinalJSON --> Mongo["🍃 MongoDB Database (Atlas / PyMongo)"]
```

| Agent Name | File Location | What It Does | Educational Role | Execution Phase |
| :--- | :--- | :--- | :--- | :--- |
| **🛡️ SafetyAgent** | [safety_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/safety_agent.py) | Sanitizes free-text inputs and audits every page for child safety. Auto-retries in strict mode if flagged. | Ensures every classroom or family story is 100% child-safe before the child reads it. | Before & After generation |
| **✍️ NarrativeAgent** | [narrative_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/narrative_agent.py) | Writes full story via IBM Granite — age-calibrated, language-native, structured multi-page output. | Matches reading level to age group (`3-5`, `6-8`, `9-12`) so the story teaches at the right level. | Sequential |
| **🔍 FactCheckAgent** | [fact_check_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/fact_check_agent.py) | Verifies cultural and historical accuracy. Feeds corrections back to `NarrativeAgent` if inaccurate. | Prevents children from learning incorrect history or cultural facts from AI content. | Sequential *(Domain mode)* |
| **📖 PedagogyAgent** | [pedagogy_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/pedagogy_agent.py) | Extracts 4 age-appropriate vocabulary words with simple child-friendly definitions. | Turns every story into a vocabulary lesson — words chosen directly from the story. | **Parallel** |
| **🧩 QuizAgent** | [quiz_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/quiz_agent.py) | Generates 3 story-specific multiple-choice comprehension questions with correct answers. | Reinforces reading comprehension — the child proves they understood what they read. | **Parallel** |
| **🎨 VisualAgent** | [visual_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/visual_agent.py) | Produces a vivid scene prompt (12-18 words) describing the story's climax for AI illustration. | Visual learning — children understand and retain stories better with matched illustrations. | **Parallel** |

---

## 📊 Market Comparison — What the Market Has vs. What StorySprout Built

| Capability | Market Today (Book Creator, Canva, ChatGPT) | The Gap | StorySprout |
| :--- | :--- | :--- | :--- |
| **Generational knowledge input** | ❌ No concept of family memory or cultural heritage as input | A grandmother cannot feed her own story into any existing tool | **✓ Domain Mode** — Family Memory, Cultural Heritage, Historical guided wizards with zero writing skill required. |
| **Education through story** | ❌ No structured subject-to-story mapping | A teacher can't turn a science lesson into a personalized story with a quiz | **✓ Custom Build Mode** — Configurable hero, incident, lesson, moral + auto-generated quiz & vocabulary per story. |
| **Age-calibrated output** | ⚠️ Partial — Generic text, no age structure | A story for a 4-year-old reads the same as one for a 12-year-old | **✓ NarrativeAgent** calibrates vocabulary, sentence length, & page count by age (`3-5`, `6-8`, `9-12`). |
| **Native multilingual composition** | ⚠️ Partial — Translation only | Translated Tamil or Arabic loses the cultural voice and nuance | **✓ IBM Granite** composes natively in Tamil, Hindi, Arabic, Mandarin, English, Spanish, French, Indonesian. |
| **Cultural & historical fact verification** | ❌ No fact checking | A story about Diwali or WW2 can teach children wrong facts | **✓ FactCheckAgent** verifies every cultural and historical story; triggers automatic regeneration with corrections. |
| **Child safety guardrails** | ❌ No child-specific filtering | Raw AI output is unguarded — unsafe content can reach children | **✓ SafetyAgent** audits input AND every generated page; auto-retries in strict mode if flagged. |
| **Built-in educational learning layer** | ❌ Story ends at the last page | No comprehension reinforcement — knowledge doesn't stick | **✓ Auto-generated vocabulary flashcards** (with audio pronunciation) + 3-question comprehension quiz. |
| **Immersive reading experience** | ⚠️ Partial — Basic PDF or scroll view | No book-like, engaging reading experience for children | **✓ Animated flipbook reader** with narration, dark mode, zoom, and bookmarks. |

---

## 🔌 API Workflow & Endpoint Specification

```mermaid
sequenceDiagram
    autonumber
    actor Client as 🌐 Next.js Frontend App
    participant Gateway as ⚡ FastAPI Backend (main.py)
    participant Orchestrator as 👑 Root Orchestrator Agent
    participant IBM as 🤖 IBM WatsonX (Granite LLM)
    participant ImageGen as 🖼️ Image Gen Engine (Pollinations/Flux)
    participant DB as 🍃 MongoDB Atlas

    Client->>Gateway: POST /generate-story (StoryRequest JSON)
    Gateway->>Orchestrator: RootOrchestratorAgent.run(req)
    Orchestrator->>IBM: Prompt: Generate narrative, quiz, vocab & scene prompt
    IBM-->>Orchestrator: Multi-Agent Story JSON
    Orchestrator-->>Gateway: Assembled Story Response
    Gateway-->>Client: 200 OK (Title, Pages, Quiz, Vocabulary, ImagePrompt)

    Client->>Gateway: POST /generate-story-image (StoryImageRequest JSON)
    Gateway->>ImageGen: generate_story_image(title, prompt, hero, style)
    ImageGen-->>Gateway: Saved Image Path (/images/story_id/cover.jpg)
    Gateway-->>Client: 200 OK ({ imageUrl: "/images/story_id/cover.jpg" })

    Client->>Gateway: POST /api/stories (SavedStory JSON)
    Gateway->>DB: save_story(story)
    DB-->>Gateway: Success Confirmation
    Gateway-->>Client: 201 Created ({ status: "success", storyId })
```

---

## ⚙️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router, Turbopack, TailwindCSS, Framer Motion, Lucide Icons, `@react-pdf/renderer`).
- **Backend**: Python 3.12, FastAPI, Uvicorn, PyMongo, Pydantic.
- **AI Core**: IBM WatsonX Foundation Models (`ibm/granite-4-h-small` / `ibm_watsonx_ai` SDK).
- **Image Generation**: Pollinations.ai (FLUX.1-schnell model).
- **Database**: MongoDB Atlas Cloud (`storysprout.cppplyk.mongodb.net`).

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- IBM WatsonX API Key & Project ID
- MongoDB Atlas Connection URI

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/.env`:
```ini
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-4-h-small
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=StorySprout
```

Start the FastAPI backend server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser!

---

## 🏷️ Technical & Innovation Badges

`IBM Granite / WatsonX` • `Multi-Agent Architecture` • `Generational Knowledge Transfer` • `Education Through Story` • `Parallel Execution` • `Dual Safety Audit` • `Fact Verification Loop` • `Native Multilingual (8 languages)` • `COPPA-aligned`

---

## 📜 License & Credits

Built for the **IBM AI Challenge**. Powered by **IBM WatsonX & Granite Models**.
Distributed under the **MIT License**.
