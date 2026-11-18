# PROJECT: LifePilot AI – Personal AI Coding Mentor

## 1. Project Overview

Build a modern, responsive, full-stack MERN application named **LifePilot AI**.

LifePilot AI is an AI-powered personal coding mentor designed for beginners who want to learn programming but don't know where to start.

The platform should act like a personal coding teacher, roadmap planner, coding assistant and progress tracker.

**Tagline:** Your Coding Journey, Guided by AI.

**Main objective:** Help beginners go from zero coding knowledge to building their first real-world projects.

## 2. Technology Stack

Use the MERN stack:

- Frontend: React.js with Vite
- Backend: Node.js
- Backend framework: Express.js
- Database: MongoDB with Mongoose
- AI integration: Google Gemini API
- Authentication: JWT and bcrypt
- Styling: Tailwind CSS
- Icons: Lucide React

Use JavaScript throughout the project.

## 3. Main Features

### A. Authentication
- User registration.
- Login and logout.
- Secure password hashing.
- JWT-based authentication.
- Protected dashboard.
- User profile management.

### B. Onboarding System

After registration, ask users:
- What is your current coding level?
- Are you a complete beginner?
- Which programming language interests you?
- What is your main goal?
- How much time can you study daily?

Allow users to select:
- HTML, CSS and JavaScript
- Python
- Java
- C
- C++
- React.js
- Full Stack Web Development

Save their answers in MongoDB.

### C. AI Roadmap Generator

Use Gemini API to generate a personalized learning roadmap.

The roadmap should contain:
- Learning phases.
- Topics and subtopics.
- Topic explanations.
- Estimated learning time.
- Practical exercises.
- Mini-projects.
- Completion status.

Example:

Beginner Web Development Roadmap:

Phase 1: HTML Basics
Phase 2: CSS Fundamentals
Phase 3: JavaScript Basics
Phase 4: DOM Manipulation
Phase 5: React.js
Phase 6: Backend Development
Phase 7: MongoDB
Phase 8: Build a Full-Stack Project.

Allow users to mark topics as completed.

### D. AI Coding Mentor

Create an interactive AI chatbot.

It should:
- Explain coding concepts in beginner-friendly language.
- Answer programming questions.
- Explain code line by line.
- Provide coding examples.
- Give hints before revealing solutions.
- Support simple English and Hinglish.
- Adapt explanations to the user's selected skill level.

### E. AI Code Debugger

Create a separate debugging page.

Allow users to:
- Paste their code.
- Select a programming language.
- Enter an error message.
- Submit the code for analysis.

AI should return:
1. What is wrong?
2. Why did the error happen?
3. How can it be fixed?
4. Corrected example code.
5. How to avoid this mistake next time?

Do not execute arbitrary user-submitted code on the backend.

### F. Practice Zone

Create a coding practice section.

Include:
- Beginner challenges.
- Intermediate challenges.
- Topic-based questions.
- Hints.
- Answer explanations.
- Difficulty levels.

Save completed challenges and scores.

### G. Progress Dashboard

Display:
- Total completed topics.
- Total pending topics.
- Roadmap completion percentage.
- Coding challenges completed.
- Learning streak.
- Recent learning activity.

Use attractive progress bars and charts.

### H. AI Project Recommendations

Recommend beginner-friendly coding projects based on:
- User's programming language.
- Current skill level.
- Completed roadmap topics.

For each project provide:
- Project title.
- Description.
- Skills required.
- Features to implement.
- Step-by-step development plan.

## 4. AI Agent Behaviour

LifePilot AI should work as a semi-autonomous AI agent.

Its workflow:

1. Understand the user's goal.
2. Analyse their current coding level.
3. Generate a personalized roadmap.
4. Recommend the next learning task.
5. Explain concepts and help with errors.
6. Check the user's progress.
7. Suggest updates to the learning roadmap.

Implement controlled AI tool/function calling where useful.

Start with a small set of tools:
- getUserProgress
- saveRoadmap
- updateTopicStatus
- getNextLearningTask
- recommendProjects

The backend must validate all tool arguments.

Limit agent steps and API usage. Ask the user before making significant changes to their saved roadmap.

## 5. UI/UX Design

Create a professional, premium-looking SaaS dashboard.

Design direction:
- Modern AI startup aesthetic.
- Clean and minimal interface.
- Light theme with white backgrounds.
- Dark navy text.
- Purple and blue accent colours.
- Soft gradients.
- Rounded cards.
- Subtle shadows.
- Smooth animations.
- Responsive layout for desktop, tablet and mobile.

### Main pages

1. Landing Page
2. Register Page
3. Login Page
4. Onboarding Page
5. Dashboard
6. My Roadmap
7. AI Coding Mentor
8. Code Debugger
9. Practice Zone
10. Project Recommendations
11. User Profile and Settings

### Dashboard layout

Sidebar:
- Dashboard
- My Roadmap
- AI Coding Mentor
- Code Debugger
- Practice Zone
- Projects
- Settings

Main dashboard:
- Welcome message.
- Daily learning goal.
- Overall progress.
- Continue Learning card.
- Today's recommended task.
- Recent activities.
- AI Mentor quick access.

## 6. Backend Architecture

Create a clean backend structure:

server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  server.js

Create REST APIs for:
- Authentication.
- User profiles.
- Roadmap generation.
- Roadmap management.
- AI chatbot.
- Code debugging.
- Coding practice.
- Progress tracking.
- Project recommendations.

Use proper error handling, input validation and authentication middleware.

## 7. MongoDB Models

Create suitable Mongoose models:

User:
- name
- email
- password
- skillLevel
- preferredLanguage
- dailyStudyTime
- learningGoal

Roadmap:
- userId
- title
- description
- phases
- topics
- completionStatus
- createdAt

Progress:
- userId
- completedTopics
- completedChallenges
- learningStreak
- lastActiveDate

Chat:
- userId
- messages
- createdAt

## 8. Security and Reliability

- Keep API keys in server-side environment variables.
- Create a .env.example file.
- Never expose API keys to frontend code.
- Add request validation.
- Add rate limiting to AI endpoints.
- Handle Gemini API failures gracefully.
- Show loading indicators.
- Show useful error messages.
- Protect private user data.
- Do not allow one user to access another user's records.

## 9. Important Development Instructions

Build the application in stages.

Stage 1: Project setup and frontend design.

Stage 2: Backend and MongoDB connection.

Stage 3: Authentication.

Stage 4: User onboarding and dashboard.

Stage 5: Gemini API integration.

Stage 6: AI roadmap generator.

Stage 7: AI Coding Mentor and Debugger.

Stage 8: Practice Zone and Progress Tracker.

Stage 9: Testing, bug fixing and deployment preparation.

Do not generate the entire project as one giant code file.

Create separate, organized components and files.

Write beginner-friendly code with clear comments.

Ensure frontend and backend are properly connected.

Do not use fake AI responses or hardcoded dashboard statistics as final functionality. Use real database data and real AI API calls. If an API key is missing, display a clear setup message.

Start by showing the project folder structure, installation commands and setup instructions. Then build Stage 1.

Do not skip stages or claim a feature is complete before testing it.

## 10. Final Goal

Deliver a working, polished and demonstrable AI-powered MERN application suitable for a student AI hackathon.

The application must demonstrate:
- A real AI-powered personalized roadmap.
- A working AI coding mentor.
- AI code error analysis.
- Progress tracking using MongoDB.
- A semi-autonomous agent workflow.
- A responsive and professional user interface.

Prioritize working core features over unnecessary features.

Make the final application easy for a first-time user to understand and use.
## 11. Git and GitHub Version Control – Mandatory

Maintain Git version control throughout the entire development process.

Git must always stay up to date with the latest completed and tested features.

### A. Initial Setup
- Initialize Git if the repository is not already initialized.
- Check the current Git status before making changes.
- Create a `.gitignore` file.
- Ignore `node_modules`, `.env`, build folders, logs and other sensitive files.
- Never commit API keys, passwords, tokens or secrets.
- Connect to the existing GitHub repository if configured.

### B. After Every Feature

Whenever a feature or development stage is completed:

1. Review all modified files.
2. Check for errors and broken functionality.
3. Run relevant tests or build checks.
4. Review the Git diff.
5. Stage only the relevant files.
6. Create a meaningful Git commit.
7. Verify the commit was created successfully.
8. Check Git status again.

Do not wait until the entire application is finished to commit.

### C. Commit Message Convention

Use clear and professional commit messages:

- `feat: add user authentication`
- `feat: implement AI roadmap generator`
- `feat: add AI coding mentor`
- `feat: implement code debugger`
- `feat: add progress tracking dashboard`
- `fix: resolve MongoDB connection issue`
- `fix: handle Gemini API errors`
- `style: improve responsive dashboard UI`
- `refactor: organize backend API structure`
- `docs: update project README`

### D. Git Workflow

Follow this workflow after every completed feature:

```bash
git status
git diff
git add <relevant-files>
git commit -m "feat: describe completed feature"
git status
```

Before creating a commit:
- Never include `.env` or secret files.
- Never commit broken or untested functionality.
- Never stage unrelated user changes.
- Never use `git reset --hard`, force push, or destructive Git commands without explicit permission.

### E. GitHub Synchronization

After successful local commits:
- Check the current branch.
- Check whether the GitHub remote is configured.
- Push completed commits to the existing remote branch when authorized and configured.
- Never overwrite remote work.
- If there are merge conflicts, stop and explain the issue instead of forcing a push.

If GitHub is not connected, continue making local commits and tell the user how to connect the repository.

### F. Final Verification

At the end of each development session, report:

- Features completed.
- Tests performed.
- Latest commit hash.
- Latest commit message.
- Git working tree status.
- GitHub push status.

**STRICT RULE:** Every successfully completed and tested feature must have its own meaningful Git commit. Keep the repository organized and version-controlled throughout the entire project development.