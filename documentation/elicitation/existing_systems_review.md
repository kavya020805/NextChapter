
# Existing Systems Review

Research information has been gathered and formatted from multiple sources, including:

- Related **existing online bookstores and content platforms**
- Feature-specific systems such as **Blinkist**, **Inkitt**, etc.
- Articles and research papers relevant to online book/e-commerce systems

For detailed notes and observations, please refer to the following document:

[View the full research document](https://docs.google.com/document/d/1cdiv76S4NJ5MWUvdIfUBhMkS664w70jJWg4Fk4mIAyU/edit?usp=sharing)

# **NextChapter: Stakeholders, Users, and Requirements Documentation** from research documents

## **Section 2: Stakeholders & Users**

### **2.1 Introduction**

* **Stakeholders:** Individuals or groups affected by, with an interest in, or able to influence the system.

* **Users:** Subset of stakeholders who directly interact with the system, e.g., reading, publishing, or managing books.

  ### **2.2 Elicitation Techniques Used**

To identify stakeholders and users, the following techniques were used:

1. **Analysis of Existing Systems:**  
    Studied platforms including Amazon Kindle, Audible, Scribd, Goodreads, Google Play Books, Apple Books, and Kobo to benchmark roles, responsibilities, and features.

2. **Reviewing Documentation:**  
    Examined help guides, FAQs, publishing contracts (e.g., Kindle Direct Publishing), and research papers to validate stakeholder roles.

3. **Observation & Review Mining:**  
    Explored apps, workflows, and user reviews on App Store and Play Store to understand practical usage roles, user expectations, and pain points.

**Rationale:** Combining these approaches ensures alignment of system requirements with proven practices, user demands, and real-world usage patterns.

---

### **2.3 Identified Stakeholders**

| Stakeholder | How Identified (Elicitation) | Role / Interest |
| ----- | ----- | ----- |
| Readers (End Users) | Observed in Kindle, Goodreads usage; FAQs | Buy/read books, seek good UX, personalization, recommendations |
| Authors (Content Creators) | KDP docs & Wattpad | Publish books, earn royalties, gain visibility, engage with readers |
| Publishers | Scribd & KDP contracts | Manage large-scale book distribution, copyrights, royalties |
| Administrators (Platform Staff) | Inferred from workflows & moderation needs | Manage content, monitor compliance, provide user support |
| Platform Owners / Developers | Documentation & logical inference | Build, maintain, and scale system infrastructure |
| Institutions (Schools, Libraries) | OverDrive/Libby integration | Provide institutional subscriptions and book lending |
| Regulators / Legal Bodies | Copyright & licensing documentation | Ensure compliance with publishing laws and DRM |

---

### **2.4 Identified Users**

| User Type | How Identified | Usage |
| ----- | ----- | ----- |
| General Readers | Observed on Kindle & Goodreads | Browse, purchase, read, and review books |
| Students / Academics | App reviews & usage patterns | Use platform for textbooks, research material, and study notes |
| Authors | KDP & Wattpad documentation | Upload manuscripts, track royalties, interact with readers |
| Publishers | Analysis of Scribd & KDP contracts | Distribute books at scale, manage copyrights |
| Professionals | Observed on Google Play Books | Access business/professional content |
| Visually Impaired Users | Accessibility features in Kindle | Use text-to-speech, adjustable fonts, dark/light modes |

---

## **Section 3: Functional & Non-Functional Requirements**

### **3.1 Introduction**

* **Functional Requirements (FRs):** Services or functions the system must provide (e.g., login, recommendations, reviews).

* **Non-Functional Requirements (NFRs):** System quality attributes such as scalability, security, usability, and performance.

  ### **3.2 Elicitation Techniques Used**

1. **Analysis of Existing Systems:** Kindle, Scribd, Goodreads, Kobo, Apple Books, Wattpad.

2. **Reviewing Documentation:** FAQs, publishing terms, help guides.

3. **Observation & Review Mining:** User reviews highlighting performance issues, crashes, and personalization gaps.

**Derivation:**

* FRs: Authentication, catalog, search, reviews, subscriptions, recommendations, AI-driven innovations.

* NFRs: Performance, usability, cross-platform compatibility, scalability, security.

  ---

  ### 

  ### 

  ### **3.3 Functional Requirements (FRs)**

| FR ID | Functional Requirement | How Identified |
| ----- | ----- | ----- |
| FR1 | User login & registration | Observed in Kindle & Scribd |
| FR2 | Book search, filter, and categorization | Documentation & workflows |
| FR3 | eBook reading tools (highlight, notes, bookmarks) | Kindle features & user reviews |
| FR4 | AI-based smart recommendations | Gap analysis → proposed innovation |
| FR5 | Hybrid Recommendation Engine (CBF \+ CF \+ Semantic) | Research (Wayesa et al., 2023\) |
| FR6 | Upload & publish books | KDP & Wattpad documentation |
| FR7 | Subscription model (unlimited reading) | Kindle Unlimited & Scribd |
| FR8 | Rating & review system | Goodreads & Scribd observation |
| FR9 | AI-generated summaries & book descriptions | Gap in existing systems → proposed innovation |
| FR10 | Community discussion forums | Goodreads & Wattpad observation |
| FR11 | Admin dashboards & trend analysis | Ajayi et al., 2025 → analytics need |
| FR12 | AI cover generation & visualization tools | Gap in Kumar et al., 2025 \+ brainstorming |

  ---

  ### **3.4 Non-Functional Requirements (NFRs)**

| NFR ID | Non-Functional Requirement | How Identified |
| ----- | ----- | ----- |
| NFR1 | Scalability → handle large user base & catalog | Observed from global platforms |
| NFR2 | Security → payment safety, copyright & DRM | Documentation & publishing terms |
| NFR3 | Performance & reliability | User complaints about app lag |
| NFR4 | Usability & Accessibility (UI/UX, text-to-speech) | Observed accessibility features & reviews |
| NFR5 | Cross-device compatibility (mobile, web, tablet) | Documentation \+ platform analysis |
| NFR6 | Maintainability & frequent updates | Agile practices & continuous deployment |
| NFR7 | High precision/recall (\>70%) in recommendations | Research (Wayesa et al., 2023\) |

  ---

  ### 

  ### 

  ### 

  ### **3.5 Gap Analysis Table**

| System | Strengths Identified | Gaps Identified | How NextChapter Improves |
| ----- | ----- | ----- | ----- |
| Kindle / Kindle Unlimited | Huge catalogue, subscriptions | Weak community, poor personalization | AI chatbots, forums, immersive reading |
| Goodreads | Reviews, ratings, discussions | Weak UI/UX, poor recommendations | Hybrid AI recommendations & summaries |
| Scribd | Unlimited subscription, wide variety | Limited personalization, no community | Interactive AI \+ forums |
| Apple Books / Kobo | Cross-device sync, polished UI | Minimal community, limited AI | Expanded personalization & AI features |
| Wattpad | Strong community engagement | Weak professional publishing features | Balances author \+ reader ecosystem |
| Kumar et al., 2025 | AI-powered recommendation, inventory mgmt | Reader engagement missing | Immersive reading journey |
| Ajayi et al., 2025 | Real-time inventory, order processing | No AI personalization/community | GenAI summaries, engagement channels |
| Wayesa et al., 2023 | Hybrid \+ semantic recommendations | CF-only systems face cold start | Hybrid \+ semantic AI |
| Cho & Han, 2019 | Multiple recommenders | Small dataset, no UI, limited personalization | Hybrid semantic AI recommender, scalable infra, interactive UI \+ AI chatbots |
| Blinkist | AI/non-fiction summaries, cross-device | Limited to non-fiction, no interactivity/community | AI-generated summaries, supports all genres, chatbots & forums |
| Inkitt | Free publishing, contests, analytics | Limited to fiction, no immersive AI for readers | AI summaries, cross-genre publishing, interactive chatbots, AI dashboards |

  ---

  ### **3.6 Traceability of Requirements**

| Requirement | Source of Elicitation |
| ----- | ----- |
| Subscription Model | Kindle Unlimited, Scribd (system analysis) |
| AI Summaries | Gap in Kumar et al., 2025 \+ user demand |
| Discussion Channels | Goodreads, Wattpad (observation) |
| AI Character Chatbot | Brainstormed innovation (gap in all systems, supported by reviews) |
| Author Dashboard | Ajayi et al., 2025, KDP docs |
| Hybrid Recommendations | Wayesa et al., 2023 \+ user complaints on CF |
| Admin Dashboards & Analytics | Ajayi et al., 2025 validation |

  ---

  ### **3.7 User Needs from Reviews & Observations**

* **Slow app performance →** NFR: Performance & Reliability

* **Requests for offline access & sync →** NFR: Cross-device compatibility

* **Complaints about poor recommendations →** FR: Hybrid Recommendation System

* **Desire for interactivity →** FR: Discussion Channels, AI Character Chatbot

**Observation:** Reviews confirmed real-world needs such as speed, personalization, and interactivity.

---

### **3.8 Summary & Reflection**

* **FRs:** Login, catalog search, recommendations, reviews, subscriptions, AI-driven innovations.

* **NFRs:** Scalability, security, performance, usability, accessibility.

**Reflection:** Existing platforms excel in catalogues, subscriptions, and publishing but fail in personalization, interactivity, and inclusivity. Research confirms hybrid AI systems outperform traditional recommenders, and user reviews emphasize faster, smarter, engaging systems.

**NextChapter emerges as an intelligent reading companion**, integrating AI summaries, discussion forums, and immersive reading experiences.

---

## **Section 4: How Industry Insights & Literature Support Elicitation**

**Stakeholder Validation**

* 1.8B global users by 2030, rising subscription adoption → validates Readers & Subscribers as primary stakeholders.

* Growth in audiobooks → validates Authors, Publishers, Platform Owners as critical stakeholders.

**Functional Requirements Justification**

* Subscription models growing → FRs: Subscription model, Audiobook integration, Personalized recommendations.

* Localization trends → FR: Multi-language support, localized catalogs.

**Non-Functional Requirements Justification**

* Accessibility & convenience → NFRs: Cross-device compatibility, Usability (text-to-speech).

* Global adoption → NFR: Scalability & high availability.

**Gap Analysis Insight**

* Current platforms are US-centric → NextChapter focuses on emerging markets like India with localized content and pricing.

**User Needs from Trends**

* Younger audiences → prefer subscription & personalization

* Older demographics → need accessibility (audio formats, easy UI)

  ---

  ## **Section 5: Literature Review Contributions to Elicitation**

| Source | Key Contribution | How It Supports NextChapter |
| ----- | ----- | ----- |
| Cho & Han, 2019 | Multiple recommenders (popularity, CF, CBF, Lexile) | Validates hybrid recommender, personalization, AI summaries, community interactivity |
| Wayesa et al., 2023 | Hybrid \+ semantic recommendations | Supports FR5 Hybrid Recommendation Engine |
| Kumar et al., 2025 | AI-powered recommendation & inventory management | Highlights engagement gaps, motivates AI chatbots, scene visualization |
| Ajayi et al., 2025 | Real-time inventory & analytics | Supports FR11 Admin Dashboards & Analytics |
| Blinkist | AI/non-fiction summaries, 39M downloads | Validates FR9 AI summaries & NFRs (performance, cross-device) |
| Inkitt | Author analytics & community | Validates FRs for author dashboards, publishing, engagement tools |

  ---

  ## **Section 6: Industry Reports & Market Insights**

* **Statista (2025):** Audiobook market revenue projected from $9.84B in 2025 → $13.30B by 2030; 1.8B global users.

* **Publishing Industry in India (Statista, 2024):** Sharp rise in eBook & audiobook purchases, multilingual demand, print → digital transition.

* **Deloitte & PwC Reports:** Subscription trends, digital adoption, cross-platform usage.

**Justification:** Supports FRs/NFRs for subscriptions, accessibility, cross-device compatibility, and AI summarization.

---

## **Section 7: Analysis of Existing Systems (Practical Approach)**

1. **Identify Comparable Systems:** Kindle, Audible, Goodreads, Scribd, Google Play Books.

2. **Collect Data on Features:** Subscription models, search/filter, ratings, reviews.

3. **Compare Usage vs Expectations:** Gaps in interactivity, AI features, personalization.

4. **Document Improvements for NextChapter:** AI summaries, chatbots, AI cover generation, gamification.

5. **Identify Legacy Features to Keep/Drop:** Keep catalog browsing & reviews; improve recommendations; drop rigid subscription models.

   ---

   ## **Section 8: References & Sources**

* Wayesa, F. (2023). Pattern-based hybrid book recommendation system using data mining rules. *Nature*.

* Avi Rana & K. Deeba (2019). Online Book Recommendation System using Collaborative Filtering with Jaccard Similarity. *ResearchGate*.

* Shengli Hu, Zhili Song et al. (2025). Improved Online Book Recommender System using SVD \+ SDAE. *ResearchGate*.

* JY Ang (2021). Comparative Analysis of Techniques Used in Book-based Recommender Systems. *ACM Digital Library*.

* IJAEM (2025). Design and Implementation of a Bookstore Management Web Application.

* D Kumar (2025). Online Bookstore and Management System. IJScientific Research & Technology.

* D Paraschakis (2015). A Comparative Evaluation of Top-N Recommenders in E-commerce Settings. *DIVA Portal*.

* Cho, H. & Han, K. (2019). AI Powered Book Recommendation System. IEEE/ACM Digital Library.

* Blinkist Official App & Website (2025)

* Inkitt Official Platform & AI Analytics Documentation (2025)

* Statista Market Insights (2024, 2025\)

* Amazon Kindle, Audible, Scribd, Goodreads, Google Play Books official websites and user guides

* WCAG Web Content Accessibility Guidelines, W3C


