# Software Engineering Project Documentation

## 2. Identify Stakeholders & Users

### Stakeholders Identified

#### Primary Users – Readers/Students
- **How Identified:** From surveys (Google Forms) and student interview
- **Role & Needs:** Want easy access to books, personalized suggestions, summaries, and features such as inbuilt dictionaries, bookmarks, and AI-powered assistants. They are the largest and most important user group
- **Elicitation Evidence:**
  - Survey respondents frequently mentioned frustration with fake PDFs, unsafe download links, wrong editions, and distracting ads
  - Student interview highlighted difficulty locating books in RC, long waiting lists, poor physical conditions, and need for one-click reservations

#### Librarians & Academic Staff
- **How Identified:** Through direct interview with the RC librarian
- **Role & Needs:** Manage catalogues, book metadata, availability, and track circulation. Require a system that reduces manual record-keeping and ensures better accuracy of holdings
- **Elicitation Evidence:**
  - Librarian complained about outdated OPAC, missing books, and manual dependency
  - Requested a digitized catalogue and better reservation systems

#### Administrators / System Managers
- **How Identified:** Derived from both librarian interview and survey responses requiring management of reviews, editions, subscriptions, payments, and analytics
- **Role & Needs:** Maintain the system, ensure quality control, manage users, books, authors, and publishers. Require dashboards for analytics and oversight

#### Authors & Publishers
- **How Identified:** Inferred from survey feedback on wrong editions, incomplete books, and poor formatting
- **Role & Needs:** Ensure correct versions are available, manage copyrights, and publish content securely



### Elicitation Techniques Used & How Applied

#### Survey (Questionnaire via Google Forms)
- **Why Used:** To capture diverse opinions from a wide audience quickly and with minimal resource.
- **How Applied:** Questions targeted book formats, device preferences, frustrations, desired features, and opinions on AI support
- **Outcome:**
  - Identified pain points: unsafe links, lack of free editions, confusing discovery process, excessive ads
  - Identified desired features: inbuilt dictionary, AI summaries, image generation, audiobooks, personalized recommendations
  - Stakeholders Identified: Casual readers, digital book users, audiobook listeners

####  Interviews (Librarian & Student)
- **Why Used:** To gain in-depth qualitative insights and context behind survey responses
- **How Applied:** Used open-ended questions about borrowing issues, frustrations with physical libraries, expectations from online systems, and thoughts on AI features
- **Outcome:**
  - Librarian revealed systemic issues: inaccurate OPAC, lost books, damaged copies
  - Student shared frustrations about waiting lists, poor physical condition of books, and suggested features like one-click reservations and AI-based recommendations
  - Stakeholders Identified: Academic staff and regular student readers

#### Observation (Research of Resources Online)
- **Why Used:** To explore common practices, features, and challenges in existing online bookstores and book readers.
- **How Applied:** Reviewed popular platforms (e.g., Kindle, Scribd, Project Gutenberg) and analyzed articles, user reviews, and community discussions about digital reading experiences.
- **Outcome:**
  - Identified standard features such as catalog browsing, search filters, reviews, and subscription models.
  - Highlighted recurring issues like poor recommendation accuracy, limited offline access, and payment-related frustrations.
  - Revealed emerging expectations around AI features, accessibility (fonts, modes), and multi-device sync.


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

### Artefacts Produced
- **Survey Dataset (Quantitative Evidence)** – Google Form responses
- **Interview Transcripts (Qualitative Evidence)** – Librarian + student interviews
- **Observation Notes** – On-site library walkthrough
- **Requirement List** – FRs and NFRs derived from above
- **Personas** – Student Reader, Casual Digital Reader, Librarian, Administrator
- **User Stories** – Already written, validated against elicitation results

## Differences & Gaps Between Elicitation Data and User Stories

### Search & Discovery


### Reading Features
- Elicitation included offline reading and continue reading shortcut, which are present in the stories
- Some users wanted read-aloud / audio features (conversion to audiobook-like reading), which isn't in the stories
- Highlighting, bookmarking, notes, and syncing are well-covered

### Community & Social
- Elicitation mentioned discussion forums, commenting, and sharing experiences → reflected in "discussions," "comments," and "reporting content"
- But elicitation also suggested friend/follower features or book clubs, which don't appear in the stories

### AI Features
- Stories cover AI suggestions, summaries, image generation, adaptive learning recommendations, and digests
- But elicitation also hinted at AI automating repetitive admin tasks (e.g., cataloging, metadata entry, or recommending purchase decisions for physical libraries), which isn't included in the user stories

### Subscription & Payments
- User stories include subscriptions, trials, payments, retention, and order history
- From elicitation: some users mentioned frustration with hidden costs / pricing transparency → this isn't directly addressed in stories (maybe needs a user story for "clear plan transparency")

### Notifications & Alerts
- User stories have personalized notifications and admin broadcast notifications
- Elicitation also mentioned wanting reminders to finish books (like nudges for inactive readers), which isn't included

### Accessibility & UI Preferences
- Some elicitation feedback asked for customizable reading modes (dark mode, fonts, dyslexia-friendly features). This is missing from the user stories

## Data Sources & References

### Interview Transcription
- **File:** [Interview Transcription Document](https://docs.google.com/document/d/1mjiYrRuteAumUyz2FEPEEhUJZaq33pdh--r6bB1W0Ho/edit?usp=sharing)


### Survey Responses Dataset
- **File:** [Survey Responses Spreadsheet](https://docs.google.com/spreadsheets/d/1t97h9EEFIMxAgdlXUpb7ohQJUHxxEZC30ZY06N2Nhdg/edit?usp=sharing)

### Elicitaion Research  File
- **File:** https://docs.google.com/document/d/1cdiv76S4NJ5MWUvdIfUBhMkS664w70jJWg4Fk4mIAyU/edit?tab=t.0#heading=h.2tx37yetbfjy