# User Stories  

---

## Authentication & Profile Management  
**Actor:** End User / Admin  

### User Story 1: User Registration  
**Front of the card:**  
As a new user, I want to sign up using my email and password, so that I can create an account and access the system.  

**Back of the card:**  
- User can provide a unique email and password.  
- Password must meet security rules (min length, special characters).  
- Account gets created only if details are valid.  
- Error shown if email already exists.  

---

### User Story 2: User Login  
**Front of the card:**  
As a registered user, I want to log in securely with my credentials, so that I can access my personal account.  

**Back of the card:**  
- User can log in with valid email and password.  
- Invalid credentials are rejected with an error message.  
- Successful login starts a new session.  
- Login attempts are rate-limited to prevent brute force attacks.  

---

### User Story 3: Social Login  
**Front of the card:**  
As a user, I want to sign in using my social media accounts, so that I can log in quickly without creating a new password.  

**Back of the card:**  
- Support Google and Apple login via OAuth.  
- Successful authentication creates or links to an account.  
- Login failures handled gracefully with appropriate messages.  

---

### User Story 4: Password Recovery  
**Front of the card:**  
As a user who forgot my password, I want to reset it via email verification, so that I can regain access to my account.  

**Back of the card:**  
- Password reset request triggers reset password link sent through email.  
- User enters and confirms new password.  
- User can now login with new password.  
- Old password becomes invalid after reset.  
- Reset link expires after a limited time.  

---

### User Story 5: Secure SignOut  
**Front of the card:**  
As a logged-in user, I want to sign out from the system, so that I can ensure no one else accesses my account.  

**Back of the card:**  
- User session ends immediately on sign out.  
- Tokens/cookies invalidated on the server.  
- User redirected to login page after logout.  
- Logout option available on all screens.  

---

### User Story 6: View Profile  
**Front of the card:**  
As a user, I want to view my profile information, so that I can see my account details clearly.  

**Back of the card:**  
- Profile displays name, email, subscriptions, and activity.  
- Data retrieved securely from the database.  
- Profile page accessible only to authenticated users.  
- Unauthorized access blocked with error/redirect.  

---

### User Story 7: Update Profile  
**Front of the card:**  
As a user, I want to edit my profile details, so that I can keep my information up to date.  

**Back of the card:**  
- User can update username, password, and profile picture.  
- Changes saved to the database and confirmed with a message.  
- Updates validated before saving (e.g., strong password rules).  
- System prevents updating with duplicate email/username.  

---

### User Story 8: Security Notifications  
**Front of the card:**  
As a user, I want to get notified when my account is accessed from a new device, so that I can protect my account against unauthorized access.  

**Back of the card:**  
- System detects and logs new device/browser logins.  
- Notification sent via email for new device access.  
- User can review device activity from account settings.  
- Option to block or sign out suspicious sessions.  

---

### User Story 9: Admin Authentication  
**Front of the card:**  
As an admin, I want to log in with secure admin credentials, so that I can manage books, authors, and users safely.  

**Back of the card:**  
- Admin login page is same as user login.  
- Only accounts with admin role can access the dashboard.  
- Failed login attempts logged for security monitoring.  
- Admin sessions end securely on logout.  
- Admin password policies stricter than regular users.  

---

## Admin & Analytics  
**Actor:** Admin / Manager  

### User Story 1: Manage Books  
**Front of the card:**  
As an Admin, I want to add, update, or remove books, so that the bookstore’s catalog always stays relevant and accurate.  

**Back of the card:**  
- Admin can upload book details (title, author, publisher, genre, price, cover image, description).  
- Admin can edit existing book details.  
- Admin can remove books from the catalog.  
- Changes should be reflected instantly in the user-facing store.  
- System validates data before saving.  

---

### User Story 2: Manage Reviews  
**Front of the card:**  
As an Admin, I want to monitor and remove inappropriate reviews, so that the platform maintains quality and credibility.  

**Back of the card:**  
- Admin can view all user reviews.  
- Admin can flag/remove reviews containing offensive or irrelevant content.  
- Admin can restore mistakenly deleted reviews (soft delete).  
- Admin can filter reviews by book, rating, or date.  
- Notifications sent to users if their review is removed.  

---

### User Story 3: Manage Authors & Publishers  
**Front of the card:**  
As an Admin, I want to add and manage author and publisher information, so that books are accurately categorized and linked to their creators.  

**Back of the card:**  
- Admin can add author details (name, bio, photo, nationality, genre).  
- Admin can add publisher details (name, logo, description, location).  
- Admin can edit/update author and publisher information.  
- Books can be linked to the respective author and publisher.  
- Admin can deactivate authors/publishers if no longer active.  

---

### User Story 4: Analytics & Trends  
**Front of the card:**  
As a Manager, I want to view analytics on current trends and user preferences, so that I can make data-driven business decisions.  

**Back of the card:**  
- System displays most purchased, most viewed, and top-rated books.  
- Manager can see user demographics.  
- Graphs/charts showing trends over time.  
- AI-driven insights on upcoming popular genres.  
- Data export option (CSV/PDF) for reports.  

---

## Reading & Progress Tracking  
**Actor:** End User  

### User Story 1: Reading Books  
**Front of the card:**  
As a user, I want to open and read a book in the app so that I can enjoy the content directly within the platform.  

**Back of the card:**  
- Clicking a book opens the reader interface.  
- The system loads book content (EPUB/PDF).  
- User can navigate between chapters/pages.  
- Book content is formatted for readability.  
- Reading progress is tracked automatically.  

---

### User Story 2: Marking a Book as Read  
**Front of the card:**  
As a user, I want to mark a book as "Read" so that I can keep track of books I have completed.  

**Back of the card:**  
- A “Mark as Read” button must be visible on book details.  
- Clicking updates library status in Firestore.  
- Appears in the “Books Read” section of the profile.  
- Status can be changed back if needed.  

---

### User Story 3: Marking a Book to Read in the Future  
**Front of the card:**  
As a user, I want to add a book to my "To Read" list so that I can plan future reading.  

**Back of the card:**  
- A “Save to To-Read List” button on book detail page.  
- Clicking saves to user’s Firestore library.  
- Accessible from user profile/dashboard.  
- User can remove or update status anytime.  

---

### User Story 4: Viewing Books Read  
**Front of the card:**  
As a user, I want to view a list of all books I’ve read so that I can see my completed reading history.  

**Back of the card:**  
- Accessible from the user profile.  
- Displays list/grid of all completed books.  
- Shows cover, title, author, and date completed.  
- User can revisit book details.  
- Updates in real time.  

---

### User Story 5: Cross-Device Sync  
**Front of the card:**  
As a user, I want my reading progress, bookmarks, and highlights to sync across devices so that I can continue reading seamlessly.  

**Back of the card:**  
- Progress/bookmarks/highlights stored in Firestore.  
- Auto-synced every few seconds or on chapter change.  
- Last saved progress loads on another device.  
- Most recent update overrides old data.  
- Bookmarks/notes synced in real time.  

---

## Engagement & Community  
**Actor:** End User  

### User Story 1: Rating the Book  
**Front of the card:**  
As a user, I want to give a star rating to a book I’ve read, so that I can express my overall opinion and help other readers decide if they want to read it.  

**Back of the card:**  
- User can select a rating (1–5 stars).  
- Rating saved to the book.  
- Average rating updates automatically.  
- User can update/change their rating.  

---

### User Story 2: Uploading Reviews  
**Front of the card:**  
As an end user, I want to write and upload detailed reviews of books I read, so that I can share my thoughts and recommendations.  

**Back of the card:**  
- User can type and submit text review.  
- Displayed below the correct book.  
- Reviews are public.  
- User can edit or delete own review.  

---

### User Story 3: Discussing About the Book  
**Front of the card:**  
As an end user, I want to participate in discussions and comment on books I read, so that I can exchange perspectives.  

**Back of the card:**  
- User can comment on books or reviews.  
- Discussion threads ordered correctly.  
- Replies to comments supported.  
- Notifications sent for replies.  

---

### User Story 4: Bookmarking & Notes  
**Front of the card:**  
As an end user, I want to bookmark pages and add notes, so that I can revisit important sections later.  

**Back of the card:**  
- User can bookmark a page.  
- Notes can be attached to bookmarks.  
- Saved persistently.  
- User can edit/delete bookmarks & notes.  

---

### User Story 5: Highlighting  
**Front of the card:**  
As an end user, I want to highlight passages or words, so that I can mark meaningful content for later reference.  

**Back of the card:**  
- Select text and apply highlights.  
- Highlights saved and shown on revisit.  
- User can remove or change highlight color.  
- Stored per book and per user.  

---

## Catalogue & Discovery  
**Actor:** End User  

### User Story 1: Browse Catalogue by Genre  
**Front of the Card:**  
As a reader, I want to browse books by specific genres, so that I can discover new books when I'm in the mood for a certain type of story.  

**Back of the Card:**  
- Genres displayed on homepage.  
- Clicking a genre shows only relevant books.  
- Genre page has clear title.  

---

### User Story 2: Basic Search  
**Front of the Card:**  
As a reader, I want to search for books by title or author’s name, so that I can find exactly what I'm looking for.  

**Back of the Card:**  
- Search bar available on header.  
- Searching returns matching results.  
- “No results found” message for empty results.  

---

### User Story 3: View Trending Books  
**Front of the Card:**  
As a reader, I want to see what’s currently trending, so that I can stay up-to-date with popular books.  

**Back of the Card:**  
- "Trending Now" section on homepage.  
- Displays trending books.  
- Clicking navigates to book details.  

---

### User Story 4: Find New Releases  
**Front of the Card:**  
As a reader, I want a section for "New Releases," so that I can keep up with the latest books.  

**Back of the Card:**  
- "New Releases" link on homepage.  
- Sorted by newest first.  
- Only books from last 30 days included.  

---

## Payments & Subscriptions  
**Actor:** End User + Admin  

### User Story 1: Subscribing to a Plan  
**Front of the card:**  
As a user, I want to subscribe to a plan so that I can access premium features.  

**Back of the card:**  
- Subscription page shows available plans.  
- Details like duration, benefits, and price visible.  
- Payment completion activates subscription.  
- Confirmation email sent.  

---

### User Story 2: Managing Subscription Plans  
**Front of the card:**  
As an admin, I want to manage subscription details so that plans and pricing remain accurate.  

**Back of the card:**  
- Admin can create, edit, or delete plans.  
- Update plan details.  
- Validated changes apply immediately.  
- Changes recorded for reference.  

---

### User Story 3: Completing Secure Payments  
**Front of the card:**  
As a user, I want to complete my payment securely so that my financial details remain safe.  

**Back of the card:**  
- Payment through secure gateway.  
- Confirmation shown instantly.  
- Receipt sent by email.  
- Subscription/order status updates.  

---

### User Story 4: Monitoring Secure Payments  
**Front of the card:**  
As an admin, I want to monitor and verify payments so that all transactions remain trustworthy.  

**Back of the card:**  
- Dashboard shows payment logs.  
- Verify gateway responses.  
- Generate financial reports.  
- Records stored securely.  

---

### User Story 5: Viewing Order History  
**Front of the card:**  
As a user, I want to check my previous subscription orders so that I can track my payments and renewals.  

**Back of the card:**  
- Profile shows order history.  
- Displays details of past subscriptions.  
- Sorted by most recent.  
- Cancelled orders clearly labeled.  

---

### User Story 6: Maintaining Order History  
**Front of the card:**  
As an admin, I want to maintain accurate order history so that users always see correct records.  

**Back of the card:**  
- Admin can access/verify order histories.  
- Filter records by user, date, or plan.  
- Records kept consistent with payments.  
- Backups maintained.  

---

### User Story 7: Analyzing Retention Data  
**Front of the card:**  
As an admin, I want to analyze retention data so that I can improve subscription renewals and reduce churn.  

**Back of the card:**  
- Retention data available in analytics module.  
- Metrics like renewal and churn rate shown.  
- Reports filterable by time, plan, or user.  
- Visual graphs for trends.  

---

## Personalization & Recommendations  
**Actors:** End User + System (AI)  

### User Story 1 – Selecting Favourite Authors & Genres  
**Front of the card:**  
As a user, I want to select my favourite authors and genres so that I can receive personalized recommendations.  

**Back of the card:**  
- Users can choose during signup or later.  
- Choices can be updated anytime.  
- Suggestions update automatically.  
- Default shows popular books.  

---

### User Story 2 – AI Smart Suggestions  
**Front of the card:**  
As a user, I want AI to suggest books based on my reading so that I can easily find new books I’ll enjoy.  

**Back of the card:**  
- AI looks at history, ratings, and activity.  
- Suggestions appear on home screen.  
- Users can mark “Not Interested.”  
- For new users, AI suggests books liked by similar readers.  

---

### User Story 3 – AI Summary Generation  
**Front of the card:**  
As a user, I want short AI-made summaries of books so that I can quickly decide whether to read or skip.  

**Back of the card:**  
- Admin-approved books only.  
- AI generates summaries.  
- User clicks “Generate Summary.”  
- Fiction avoids spoilers unless requested.  

---

### User Story 4 – AI Scene Generation  
**Front of the card:**  
As a user, I want AI to create pictures of book scenes so that I can imagine the story better.  

**Back of the card:**  
- User highlights passage to request.  
- AI generates an image.  
- User can pick styles (sketch, realistic, etc.).  

---

### User Story 5 – Genre Reading Visualization  
**Front of the card:**  
As a user, I want to see which genres I read most so that I can track my habits.  

**Back of the card:**  
- System tags each book.  
- Chart shows how many books read per genre.  
- Filter by time.  
- Clicking genre shows books in that category.  

---

### User Story 6 – Personalized Notifications & Alerts  
**Front of the card:**  
As a user, I want personalized notifications about new releases and suggestions so that I always have fresh options.  

**Back of the card:**  
- Alerts for new releases/suggestions.  
- Links to book details.  
- Users can enable/disable alerts.  

---

### User Story 7 – AI-Curated Reading Digest  
**Front of the card:**  
As a user, I want a daily or weekly list of suggested books so that I always have fresh options to read.  

**Back of the card:**  
- AI generates 3–5 book digest.  
- Shown in-app or via email.  
- List updates with reading evolution.  

---

### User Story 8 – Reading Streaks & Personalized Challenges  
**Front of the card:**  
As a user, I want streaks and challenges so that I stay motivated to read more.  

**Back of the card:**  
- System tracks daily reading streaks.  
- Challenges created by genre.  
- Progress shown on dashboard.  
- Badges for completing milestones.  

---

### User Story 9 – Adaptive Learning Recommendations  
**Front of the card:**  
As a user, I want AI to suggest books outside my usual genres so that I can try new topics.  

**Back of the card:**  
- AI detects gaps in reading behaviour.  
- Suggestions in “Explore” section.  
- Users can accept/skip.  
- AI adapts future recommendations.  

---
