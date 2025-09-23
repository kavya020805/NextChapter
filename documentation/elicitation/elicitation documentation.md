# Software Engineering Project Documentation

## 2. Identify Stakeholders & Users

### Stakeholders Identified

#### Primary Users – Readers/Students
- **How Identified:** Recognized as the main audience for an online book store and reader system, since students and readers form the majority of book consumers in both academic and casual contexts
- **Role & Needs:** Want easy access to books, personalized suggestions, summaries, and features such as inbuilt dictionaries, bookmarks, and AI-powered assistants. They are the largest and most important user group
- **Elicitation Evidence:**
  - Survey respondents frequently mentioned frustration with fake PDFs, unsafe download links, wrong editions, and distracting ads
  - Student interview highlighted difficulty locating books in RC, long waiting lists, poor physical conditions, and need for one-click reservations

#### Librarians & Academic Staff
- **How Identified:** They are involved in the management of book inventories and circulation in both physical and digital formats, making them critical stakeholders
- **Role & Needs:** Manage catalogues, book metadata, availability, and track circulation. Require a system that reduces manual record-keeping and ensures better accuracy of holdings
- **Elicitation Evidence:**
  - Librarian complained about outdated OPAC, missing books, and manual dependency
  - Requested a digitized catalogue and better reservation systems

#### Administrators / System Managers
- **How Identified:** Responsible for overseeing platform operations, managing users, and ensuring overall system reliability, which makes them central to governance.
- **Role & Needs:** Maintain the system, ensure quality control, manage users, books, authors, and publishers. Require dashboards for analytics and oversight

#### Authors & Publishers
- **How Identified:** Directly connected to content creation and distribution, they ensure the availability of legitimate and high quality books.
- **Role & Needs:** Ensure correct versions are available, manage copyrights, and publish content securely. They will require data analytics from the website to improve their publications.



### Elicitation Techniques Used & How Applied

#### Survey (Questionnaire via Google Forms)
- **Why Used:** To efficiently gather quantitative and qualitative insights from a large and diverse audience. Surveys provide structured data that can reveal common trends, user frustrations, and feature requests.
- **How Applied:**
  - Designed questions covering preferred book formats, reading devices, frequency of reading, frustrations with current book sources, and desired features.
  - Included multiple-choice, Likert scale, and open-ended questions to capture both measurable data and detailed opinions.
  - Distributed online to reach a wider audience beyond the immediate academic community.
- **Outcome:**
  - Identified pain points: unsafe links, lack of free editions, confusing discovery process, excessive ads
  - Identified desired features: inbuilt dictionary, AI summaries, image generation, audiobooks, personalized recommendations
  - Helped prioritize system functionality based on user demand
  - Subclassifcation of Stakeholders Identified: Casual readers, digital book users, audiobook listeners

####  Interviews (Librarian, Author, and Students)
- **Why Used:** To gain deeper qualitative understanding of user needs and operational challenges that surveys alone cannot capture. Interviews provide context, anecdotes, and insights into workflow inefficiencies and content creation concerns.
- **How Applied:**
  - Conducted semi-structured interviews with open-ended questions to encourage detailed responses.
  - Librarian: Focused on day-to-day library operations, cataloguing issues, borrowing challenges, and workflow inefficiencies.
  - Multiple Students: Explored difficulties locating books, waiting times, device preferences, and expectations for digital reading and personalization features. Patterns and common pain points were noted across respondents.
  - Authors: Discussed content accuracy, correct editions, metadata management, and expectations for online publication.
All interviews also explored thoughts on AI, automation, and personalized reading experiences.

- **Outcome:**
  - Librarian revealed systemic issues: inaccurate OPAC, lost books, damaged copies
  - Students shared frustrations about waiting lists, poor physical condition of books, and suggested features like one-click reservations and AI-based recommendations
  - Helped prioritize system functionality based on user demand
  - Some more users Identified: Academic staff and regular student readers
  - Librarian highlighted systemic issues: outdated catalogues, missing books, and manual dependency.

#### Observation (Research of Resources Online)
- **Why Used:** To explore common practices, features, and challenges in existing online bookstores and book readers.
- **How Applied:** Reviewed popular platforms (e.g., Kindle, Scribd, Project Gutenberg) and analyzed articles, user reviews, and community discussions about digital reading experiences.
- **Outcome:**
  - Identified standard features such as catalog browsing, search filters, reviews, and subscription models.
  - Highlighted recurring issues like poor recommendation accuracy, limited offline access, and payment-related frustrations.
  - Revealed emerging expectations around AI features, accessibility (fonts, modes), and multi-device sync.
 
#### Brainstorming (Project Team Collaboration)
- **Why Used:** To collaboratively identify, discuss, and finalize the key features, UI/UX decisions, and technical choices for the NextChapter platform. This allowed the project team to prioritize features based on feasibility and user impact.
- **How Applied:** Conducted multiple brainstorming sessions with developers, designers, and analysts. Ideas were generated, debated, and either finalized, accepted, deferred, or rejected.
  - Session 1 – Platform & Access Model: Subscription model, online book reading platform, and basic user/admin login & profiles were finalized.
  - Session 2 – Feature Exploration: Finalized features include books catalogue, AI recommendations, AI summaries, AI image generation, personalization, AI chatbot, wishlist/mark-as-read, streaks/challenges, admin analytics, and user behavior tracking. AI translation and vocabulary search were deferred; book downloads were rejected.
  - Session 3 – UI/UX & Technical Decisions: Light warm colour theme finalized; Firebase chosen as the database; light/dark/reading mode discussed for refinement later.

- **Outcome:**
  - Adopted Model: Subscription-based, online reading platform
  - Core Features Finalized: User/Admin login & profiles, books catalogue with search/filtering, AI-powered recommendations, summaries, chatbot, personalization, image generation, gamification (streaks/challenges), wishlist & reading tracker, analytics for admin & users, controlled offline access
  - UI/UX & Technical Choices: Light warm colour theme; Firebase database
  - More Subclassifications of Stakeholders Identified: Project team (developers, designers, analysts)
 



## 3. Identify Functional Requirements (FRs) & Non-Functional Requirements (NFRs)

### Functional Requirements (FRs) Identified
*Derived directly from surveys, interviews, and observations*

#### User Authentication & Profile Management
- Secure registration/login, social login options, password recovery, and profile customization
- **Elicitation Source:** Survey respondents expressed concerns about unsafe links → indicates need for strong authentication and safety

#### Catalogue Browsing & Search
- Ability to browse by genre, filter new releases, trending titles, and perform keyword searches
- **Elicitation Source:** Survey complaints about inaccurate discovery and not finding relevant editions

#### Book Access & Reading Tools
- Features such as bookmarking, highlighting, annotation, dictionary lookup, and offline access
- **Elicitation Source:** Survey respondents repeatedly asked for highlight and instant dictionary features

#### Progress Tracking & Sync
- Mark books as read/unfinished, save progress, and sync across devices
- **Elicitation Source:** Observations of students losing track of reading position when switching devices

#### Community & Engagement
- Ratings, reviews, discussion forums, and ability to share recommendations
- **Elicitation Source:** Survey revealed distrust in existing book sources, showing a need for transparent peer reviews

#### AI Features & Personalization
- Smart recommendations based on reading history, AI chatbot for queries, automated summaries, and visual content generation
- **Elicitation Source:** Over 70% of survey responses highlighted AI features like summaries, recommendations, and vocabulary help

#### Payments & Subscription Management
- Secure payments, refunds, order history, and subscription control
- **Elicitation Source:** Survey responses about frustration when buying wrong editions → indicates need for secure, transparent payment system

#### Administration & Content Management
- Admin should be able to add/update/delete books, manage reviews, monitor analytics, and track trends
- **Elicitation Source:** Librarian interview (manual catalogue frustrations)

### Non-Functional Requirements (NFRs) Identified

#### Usability
- Simple, intuitive interface with customization (dark mode, font choice)
- **Elicitation Source:** Survey mention of eye strain and unclean fonts

#### Accessibility
- Multi-device support (mobile, desktop, tablets) and support for audiobooks
- **Elicitation Source:** Device preference data from survey (smartphones, iPads, desktops)

#### Performance
- Fast search, instant summaries, lightweight loading of content
- **Elicitation Source:** Survey complaints about slow downloads and lag

#### Reliability
- High uptime, secure backups, and no disappearance of books
- **Elicitation Source:** Survey where users mentioned books disappearing/removed unexpectedly

#### Security
- Safe environment free of malware, verified book sources, secure payments
- **Elicitation Source:** Multiple survey entries reporting unsafe download links and scam PDFs

#### Scalability
- Ability to handle a growing catalogue and increasing user base
- **Elicitation Source:** Inferred from librarian concerns about expanding collections

#### Maintainability
- Easy updates to catalogue, editions, and metadata
- **Elicitation Source:** Librarian requirement for less manual management

### Artefacts Noted
- **Survey Dataset (Quantitative Evidence)** – Google Form responses
- **Interview Transcripts (Qualitative Evidence)** – Librarian + student interviews
- **Observation Notes** – On-site library walkthrough
- **Requirement List** – FRs and NFRs derived from above
- **Personas** – Student Reader, Casual Digital Reader, Librarian, Administrator
- **User Stories** – Already written, validated against elicitation results



## Data Sources & References

### Interviews Transcription and Audio
- **File:** [Interview Transcription Document](https://docs.google.com/document/d/1mjiYrRuteAumUyz2FEPEEhUJZaq33pdh--r6bB1W0Ho/edit?usp=sharing)


### Survey Responses Dataset
- **File:** [Survey Responses Spreadsheet](https://docs.google.com/spreadsheets/d/1t97h9EEFIMxAgdlXUpb7ohQJUHxxEZC30ZY06N2Nhdg/edit?usp=sharing)

### Brainstorming Report Document
- **File:** 
  https://docs.google.com/document/d/1MJYVDuJ5MjT6kmxLBwk-GQpTeD28-90QEy0y8CwYvqg/edit?usp=sharing

### Elicitaion Research  File
- **File:** https://docs.google.com/document/d/1cdiv76S4NJ5MWUvdIfUBhMkS664w70jJWg4Fk4mIAyU/edit?tab=t.0#heading=h.2tx37yetbfjy
