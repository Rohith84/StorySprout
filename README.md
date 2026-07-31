# StorySprout
### Intergenerational Knowledge Transfer Through AI Storytelling — Turned Into a Book for Every Child
> *"Sowing yesterday's wisdom, growing tomorrow's minds."*

[![IBM Granite](https://img.shields.io/badge/AI_Engine-IBM_Granite_4-blue.svg)](https://www.ibm.com/granite)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent_Pipeline-emerald.svg)](#the-six-agent-ai-pipeline-ibm-granite--watsonx)
[![Authentication](https://img.shields.io/badge/Auth-Google_OAuth-red.svg)](#secure-authentication--user-safety)
[![Framework](https://img.shields.io/badge/Frontend-Next.js_16-black.svg)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-green.svg)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

![StorySprout Architecture Banner](storysprout_architecture_diagram.png)

---

## Project Overview

Every family and every classroom holds knowledge worth passing on — but that knowledge is easily lost, and few people have the writing or illustration skills to preserve it in a form a child will engage with.

> A father and grandfather want to share a treasured family memory: building a stargazing treehouse together on a clear summer night. They want their six-year-old to feel that same wonder and curiosity — but neither of them is a children's book author.
>
> A science teacher knows that children understand how the heart pumps blood far more readily when it is told as an adventure about a brave red blood cell than when it is presented as a textbook diagram.

StorySprout turns both of these into a personalized, illustrated storybook — in the child's native language, at the child's reading level, and secured through Google authentication — in under 60 seconds. The knowledge is transferred, the child learns, and the memory endures.

---

## The Problem and Our Solution

| The Problem | The StorySprout Solution |
| :--- | :--- |
| **Knowledge is lost with the generation that holds it.** Every generation carries knowledge the next is losing — a family tradition, a teacher's scientific analogy, a cultural festival understood only by elders, or an unrecorded family milestone. | **An AI platform built on IBM Granite (watsonx)** that transforms any piece of human knowledge — a family memory, a cultural tradition, a historical event, or a classroom lesson — into a personalized, illustrated, educationally structured children's storybook in seconds. |
| **Existing tools do not fit the need.** They are either generic AI writing assistants with no educational structure, or creative platforms that demand writing and illustration skills most people do not have. | **A six-agent AI pipeline** in which a `SafetyAgent` enforces child safety, a `NarrativeAgent` writes age-calibrated stories natively in the child's language, a `FactCheckAgent` verifies cultural and historical accuracy, and the `PedagogyAgent`, `QuizAgent`, and `VisualAgent` run in parallel to produce vocabulary, comprehension questions, and illustrations. |
| **No parental controls or identity safeguards.** Unauthenticated, public creation tools allow unrestricted access, data loss, and unmonitored AI use by children. | **Google OAuth authentication** verifies user identity, protects family story privacy, attributes story ownership, and enforces safety controls before any story is created. |

---

## Who Uses StorySprout: User Personas and Knowledge Transfer

StorySprout is designed for anyone who holds knowledge or memories and wants to pass them to children:

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│        THE PARENT       │        │      THE GRANDPARENT      │      │          THE TEACHER      │      │       MENTORS & GUARDIANS │
│                           │      │                           │      │                           │      │                           │
│ "I want my daughter to    │      │ "I want my grandchild to  │      │ "I want my Year 4 class to│      │ "I want young kids to     │
│ remember our family       │      │ know the happy stories of │      │ understand how the        │      │ understand traditional    │
│ stargazing camping trip." │      │ our ancestral festival."  │      │ circulatory system works."│      │ heritage with empathy."   │
└─────────────┬─────────────┘      └─────────────┬─────────────┘      └─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │                                  │                                  │
              ▼                                  ▼                                  ▼                                  ▼
   Happy Family Memory               Heritage & Tradition                   Educational Custom Story               Historical & Cultural
 • Personalized family story        • Native language option               • Red Blood Cell Hero                  • Child's point of view
 • Age-calibrated (6-8 yrs)         • Age-calibrated (3-5 yrs)             • Vocab: "artery", "oxygen"            • FactCheckAgent verified
 • Vocab: "constellation"           • Vocab: "harmony", "gratitude"        • Comprehension quiz at end            • Lived experience history
```

### How Knowledge Travels — From Holder to Child

```
[  Gmail Auth Login] ──► [  Knowledge Holder] ──► [  Domain Wizard] ──► [  6-Agent Pipeline] ──► [  Child Reads & Learns] ──► [  Knowledge Planted]
(Secures profile &        (Parents, Teachers,       (Guided questions       (IBM Granite writes,       (Flipbook, audio, vocab,     (Memory & lesson
 user story privacy)       Grandparents, Mentors)    capture memory/lesson)  fact-checks, illustrates)  quizzes & PDF book)         understood forever)
```

---

## Secure Authentication and User Safety

StorySprout uses Google OAuth 2.0 authentication to provide a layered security and personalization framework:

* **Identity verification and access control**: Ensures that only authenticated parents, teachers, and guardians can create, edit, or publish stories.
* **Privacy and story storage**: Saves generated stories securely under the user's verified account profile in MongoDB Atlas.
* **Parental safety and audit traceability**: Combines authentication credentials with the AI `SafetyAgent` to prevent the generation of unsafe content and to maintain audit logs.
* **Single-click login**: Provides instant access across devices without password management.

---

## The Three Domain Modes

StorySprout provides three guided creation wizards, each tailored to a specific type of knowledge transfer:

```mermaid
graph TD
    A[Create Mode] --> B[  Family Memory]
    A --> C[  Cultural & Heritage]
    A --> D[  Historical]

    B --> B1["Personal & Emotional<br/>Happy family moments, camping trips, childhood milestones."]
    C --> C1["Roots & Identity<br/>Traditions, festivals, folk tales, food origins."]
    D --> D1["History as Lived Experience<br/>Historical eras, events, real figures from a child's POV."]
```

1. **Family Memory**: Captures personal stories, family moments, and childhood milestones, preserving family history for a specific child.
2. **Cultural and Heritage**: Passes on traditions, festivals, food origins, folk tales, and family values, verified by the `FactCheckAgent` for cultural authenticity.
3. **Historical**: Brings historical eras, events, and figures to life through the eyes of a child living in that time, verified by the `FactCheckAgent` for historical accuracy.

---

## The Six-Agent AI Pipeline (IBM Granite / watsonx)

All story generation is orchestrated by the `RootOrchestratorAgent` ([backend/agents/orchestrator.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/orchestrator.py)), which delegates to six specialized AI sub-agents powered by `ibm/granite-4-h-small`:

```mermaid
flowchart TD
    User["  User (Authenticated via Gmail Auth)"] -->|"Verified Bearer Token / Session"| Gateway["  FastAPI Backend Gateway (/generate-story)"]
    Gateway --> Orchestrator["  Root Orchestrator Agent"]

    subgraph SequentialAgents["Core Sequential Sub-Agents"]
        Orchestrator -->|"1. Sanitize & Audit"| Safety["  Safety Agent (IBM Granite + Guardrails)"]
        Orchestrator -->|"2. Generate Narrative"| Storyteller["  Master Storyteller Agent (ibm/granite-4-h-small)"]
        Orchestrator -->|"3. Fact Check"| FactCheck["  Fact Check Agent (ibm/granite-4-h-small)"]
    end

    subgraph ParallelAgents["  Parallel Sub-Agent Pool (Concurrent Threads)"]
        Orchestrator -->|"Parallel Call"| Pedagogy["  Pedagogy Agent (ibm/granite-4-h-small)<br/>Extracts 4 Vocab Words & Definitions"]
        Orchestrator -->|"Parallel Call"| Quiz["  Quiz Agent (ibm/granite-4-h-small)<br/>Builds 3 Comprehension Questions"]
        Orchestrator -->|"Parallel Call"| Visual["  Visual Director Agent (ibm/granite-4-h-small)<br/>Crafts Illustration Scene Prompts"]
    end

    Safety --> FinalJSON["  Assembled Final Story JSON"]
    Storyteller --> FinalJSON
    FactCheck --> FinalJSON
    Pedagogy --> FinalJSON
    Quiz --> FinalJSON
    Visual --> FinalJSON

    FinalJSON --> ImageGen["  Image Gen Engine (Pollinations.ai / FLUX Model)"]
    FinalJSON --> PDFBook["  Printable PDF Book Exporter (@react-pdf/renderer)"]
    FinalJSON --> Mongo["  MongoDB Database (Atlas / User Vault)"]
```

| Agent | File Location | Function | Educational Role | Execution Phase |
| :--- | :--- | :--- | :--- | :--- |
| **SafetyAgent** | [safety_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/safety_agent.py) | Sanitizes free-text input and audits every page for child safety, retrying in strict mode if content is flagged. | Ensures every family or classroom story is verified safe before the child reads it. | Before and after generation |
| **NarrativeAgent** | [narrative_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/narrative_agent.py) | Writes the full story with IBM Granite: age-calibrated, composed natively in the selected language, and structured across multiple pages. | Matches reading level to age group (`3-5`, `6-8`, `9-12`) so the story teaches at the appropriate level. | Sequential |
| **FactCheckAgent** | [fact_check_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/fact_check_agent.py) | Verifies cultural and historical accuracy and returns corrections to the `NarrativeAgent` when inaccuracies are found. | Prevents children from learning incorrect historical or cultural information from AI content. | Sequential (Domain mode) |
| **PedagogyAgent** | [pedagogy_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/pedagogy_agent.py) | Extracts four age-appropriate vocabulary words with child-friendly definitions. | Turns every story into a vocabulary lesson, with words drawn directly from the narrative. | Parallel |
| **QuizAgent** | [quiz_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/quiz_agent.py) | Generates three story-specific multiple-choice comprehension questions with correct answers. | Reinforces reading comprehension by prompting the child to demonstrate understanding. | Parallel |
| **VisualAgent** | [visual_agent.py](file:///c:/Users/jothi/Downloads/IBM_Projects/StorySprout/backend/agents/visual_agent.py) | Produces a concise scene prompt (12-18 words) describing the story's climax for AI illustration. | Supports visual learning, as children retain stories more effectively with matched illustrations. | Parallel |

---

## Existing Solutions Compared with StorySprout

| Feature / Capability | Existing Tools (Book Creator, Canva, ChatGPT) | Unmet Need | StorySprout Solution |
| :--- | :--- | :--- | :--- |
| **User identity and safety** | Generic or absent child-safety controls | Unauthenticated tools expose children to unsafe content and unmonitored sessions | Secure Google OAuth login protects user profiles, attributes story ownership, and enforces safety bounds. |
| **Generational knowledge input** | No concept of family memory or cultural heritage as input | Parents and grandparents cannot easily turn personal memories into a child's book | Domain modes — Family Memory, Cultural Heritage, and Historical — guide creation with no writing skill required. |
| **Education through story** | No structured mapping of subject to story | Teachers cannot convert curriculum topics into interactive, personalized stories | Custom Build mode offers configurable hero, incident, lesson, and moral, with an auto-generated quiz and vocabulary. |
| **Age-calibrated output** | Partial; generic text with no age structure | Stories for a four-year-old read identically to stories for a twelve-year-old | The `NarrativeAgent` calibrates vocabulary, sentence complexity, and page count by age group (`3-5`, `6-8`, `9-12`). |
| **Native multilingual composition** | Partial; basic machine translation | Machine translation loses cultural voice, idiom, and natural tone | IBM Granite composes natively in Tamil, Hindi, Arabic, Mandarin, English, Spanish, French, and Indonesian. |
| **Cultural and historical accuracy** | No fact-checking mechanism | Stories about history or heritage can teach inaccurate details | The `FactCheckAgent` verifies cultural and historical accuracy and corrects narrative errors. |
| **Child-safety guardrails** | No child-specific filtering | Raw model output is unguarded against sensitive themes | A dual safety architecture combines authenticated access control with the `SafetyAgent` pre- and post-generation audit. |
| **Educational learning layer** | Story ends at the final page | No comprehension reinforcement or active learning tools | Auto-generated vocabulary flashcards with audio pronunciation and a three-question comprehension quiz. |
| **Reading experience** | Basic PDF or scrolling view | No book-like, engaging experience for young readers | An animated flipbook reader with narration, dark mode, zoom, audio, and PDF export. |

---

## API Workflow and Endpoint Specification

```mermaid
sequenceDiagram
    autonumber
    actor User as   User (Gmail Authenticated)
    participant Client as   Next.js Frontend App
    participant Gateway as   FastAPI Backend (main.py)
    participant Orchestrator as   Root Orchestrator Agent
    participant IBM as   IBM WatsonX (Granite LLM)
    participant ImageGen as   Image Gen Engine (Pollinations/Flux)
    participant DB as   MongoDB Atlas

    User->>Client: Login via Gmail (Google OAuth)
    Client->>Gateway: POST /generate-story (StoryRequest + Auth Token)
    Gateway->>Orchestrator: RootOrchestratorAgent.run(req)
    Orchestrator->>IBM: Prompt: Generate narrative, quiz, vocab & scene prompt
    IBM-->>Orchestrator: Multi-Agent Story JSON
    Orchestrator-->>Gateway: Assembled Story Response
    Gateway-->>Client: 200 OK (Title, Pages, Quiz, Vocabulary, ImagePrompt)

    Client->>Gateway: POST /generate-story-image (StoryImageRequest JSON)
    Gateway->>ImageGen: generate_story_image(title, prompt, hero, style)
    ImageGen-->>Gateway: Saved Image Path (/images/story_id/cover.jpg)
    Gateway-->>Client: 200 OK ({ imageUrl: "/images/story_id/cover.jpg" })

    Client->>Gateway: POST /api/stories (SavedStory JSON + Gmail User ID)
    Gateway->>DB: save_story(story, userId)
    DB-->>Gateway: Success Confirmation
    Gateway-->>Client: 201 Created ({ status: "success", storyId })
```

---

## Tech Stack and Architecture

- **Authentication**: Google OAuth 2.0 / NextAuth for identity protection and per-profile story storage.
- **Frontend**: Next.js 16 (App Router, Turbopack, TailwindCSS, Framer Motion, Lucide Icons, `@react-pdf/renderer`).
- **Backend**: Python 3.12, FastAPI, Uvicorn, PyMongo, Pydantic.
- **AI Core**: IBM watsonx Foundation Models (`ibm/granite-4-h-small` via the `ibm_watsonx_ai` SDK).
- **Image Generation**: Pollinations.ai (FLUX.1-schnell model).
- **Database**: MongoDB Atlas Cloud (`storysprout.cppplyk.mongodb.net`).

---

## Quickstart and Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- IBM watsonx API Key & Project ID
- MongoDB Atlas Connection URI
- Google OAuth Client ID & Secret

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
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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

Open `http://localhost:3000` in your browser.

---

## Technical and Innovation Highlights

`IBM Granite / watsonx` • `Multi-Agent Architecture` • `Generational Knowledge Transfer` • `Education Through Story` • `Parallel Execution` • `Dual Safety Audit` • `Fact Verification Loop` • `Native Multilingual (8 languages)` • `COPPA-aligned`

---

## License and Credits

Built for the IBM AI Challenge. Powered by IBM watsonx and Granite models.
Distributed under the MIT License.

---

## 👥 Contributors

Special thanks to all the team members and contributors building StorySprout:

<a href="https://github.com/Rohith84/StorySprout/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Rohith84/StorySprout" alt="StorySprout Contributors" />
</a>

| Contributor | Details | GitHub Profile |
| :--- | :--- | :--- |
| **Rohith M** | B.Tech Artificial Intelligence and Data Science, Dr. N.G.P Institute of Technology, Coimbatore, India | [@Rohith84](https://github.com/Rohith84) | 
| **Karthika Ramasamy** |  | [@ka234388](https://github.com/ka234388) |
| **Naveen Kumar Jeevanantham** | M.S. Cybersecurity and Trusted Systems, Purdue University, West Lafayette, United States of America | [@naveenkumarj2004](https://github.com/naveenkumarj2004) |
| **Danar** |  | [@DanarGdg](https://github.com/DanarGdg) |

Want to contribute? Check out our repository guidelines and feel free to submit a pull request!

