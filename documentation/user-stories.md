# User Stories  

---

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
As a registered user, I want to log in securely with my credentials so that I can access my personal account.  

**Back of the card:**  
- User can log in with a valid email and password.  
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
As a user who has forgotten my password, I want to reset it via email verification so that I can regain access to my account.  

**Back of the card:**  
- Password reset request triggers the reset password link sent through email.  
- User enters and confirms new password.  
- User can now log in with a new password.  
- Old password becomes invalid after reset.  
- Reset link expires after a limited time.  

---

### User Story 5: Secure SignOut  
**Front of the card:**  
As a logged-in user, I want to sign out of the system so that I can ensure no one else accesses my account.  

**Back of the card:**  
- User session ends immediately on sign out.  
- Tokens/cookies invalidated on the server.  
- User redirected to login page after logout.  
- Logout option available on all screens.  

---

### User Story 6: View Profile  
**Front of the card:**  
As a user, I want to view my profile information so that I can see my account details clearly.  

**Back of the card:**  
- Profile displays name, email, subscriptions, and activity.  
- Data retrieved securely from the database.  
- Profile page accessible only to authenticated users.  
- Unauthorized access blocked with error/redirect.  

---

### User Story 7: Update Profile  
**Front of the card:**  
As a user, I want to edit my profile details so that I can keep my information up to date.  

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
- The user can review device activity from account settings.  
- Option to block or sign out suspicious sessions.  

---

### User Story 9: Admin Authentication  
**Front of the card:**  
As an admin, I want to log in with secure admin credentials so that I can manage books, authors, and users safely.  

**Back of the card:**  
- Admin login page is the same as the user login.  
- Only accounts with the admin role can access the dashboard.  
- Failed login attempts logged for security monitoring.  
- Admin sessions end securely on logout.  
- Admin password policies are stricter than regular users.  

---

### User Story 10: Manage Books  
**Front of the card:**  
As an Admin, I want to add, update, or remove books, so that the bookstore’s catalog always stays relevant and accurate.  

**Back of the card:**  
- Admin can upload book details (title, author, publisher, genre, price, cover image, description).  
- Admin can edit existing book details.  
- Admin can remove books from the catalog.  
- Changes should be reflected instantly in the user-facing store.  
- System validates data before saving.  

---

### User Story 11: Manage Reviews  
**Front of the card:**  
As an Admin, I want to monitor and remove inappropriate reviews so that the platform maintains quality and credibility.  

**Back of the card:**  
- Admin can view all user reviews.  
- Admin can flag/remove reviews containing offensive or irrelevant content.  
- Admin can restore mistakenly deleted reviews (soft delete).  
- Admin can filter reviews by book, rating, or date.  
- Notifications are sent to users if their review is removed.  

---

### User Story 12: Manage Authors & Publishers  
**Front of the card:**  
As an Admin, I want to add and manage author and publisher information, so that books are accurately categorized and linked to their creators.  

**Back of the card:**  
- Admin can add author details (name, bio, photo, nationality, genre).  
- Admin can add publisher details (name, logo, description, location).  
- Admin can edit/update author and publisher information.  
- Books can be linked to the respective author and publisher.  
- Admin can deactivate authors/publishers if no longer active.  

---

### User Story 13: Analytics & Trends  
**Front of the card:**  
As a Manager, I want to view analytics on current trends and user preferences so that I can make data-driven business decisions.  

**Back of the card:**  
- System displays most purchased, most viewed, and top-rated books.  
- The manager can see user demographics.  
- Graphs/charts showing trends over time.  
- AI-driven insights on upcoming popular genres.  
- Data export option (CSV/PDF) for reports.  

--- 

### User Story 14: Reading Books  
**Front of the card:**  
As a user, I want to open and read a book in the app so that I can enjoy the content directly within the platform.  

**Back of the card:**  
- Clicking a book opens the reader interface.  
- The system loads book content (EPUB/PDF).  
- User can navigate between chapters/pages.  
- Book content is formatted for readability.  
- Reading progress is tracked automatically.  

---

### User Story 15: Automatic Marking a Book as Read  
**Front of the card:**  
As a user, I want the system to automatically mark a book as "Read" when I finish reading.  

**Back of the card:**  
- When the user reaches the last page of the book, its status is auto-updated to "Read" in Firestore.  
- The book immediately appears in the “Books Read” section of the profile.  
- The user can manually revert the status if marked incorrectly.  
- A confirmation toast/notification is shown to inform the user.  

---

### User Story 16: Adding a Book to Wishlist 
**Front of the card:**  
As a user, I want to add a book to my wishlist so that I can keep track of books I want to read in the future.  

**Back of the card:**  
- A “Add to Wishlist” button is available on the book detail page.  
- Clicking saves the book to the user’s “Wishlist/To-Read” list in Firestore.  
- The wishlist is accessible from the user’s profile/dashboard.  
- User can remove or move a book from wishlist to "Currently Reading" or "Read" anytime.   

---

### User Story 17: Viewing Books Read  
**Front of the card:**  
As a user, I want to view a list of all books I’ve read so that I can see my completed reading history.  

**Back of the card:**  
- Accessible from the user profile.  
- Displays a list/grid of all completed books.  
- Shows cover, title, author, and date completed.  
- User can revisit book details.  
- Updates in real time.  

---

### User Story 18: Cross-Device Sync  
**Front of the card:**  
As a user, I want my reading progress, bookmarks, and highlights to sync across devices so that I can continue reading seamlessly.  

**Back of the card:**  
- Progress/bookmarks/highlights stored in Firestore.  
- Auto-synced every few seconds or on chapter change.  
- Last saved progress loads on another device.  
- Most recent update overrides old data.  
- Bookmarks/notes synced in real time.  

---

### User Story 19: Rating the Book  
**Front of the card:**  
As a user, I want to give a star rating to a book I’ve read, so that I can express my overall opinion and help other readers decide if they want to read it.  

**Back of the card:**  
- User can select a rating (1–5 stars).  
- Rating saved to the book.  
- Average rating updates automatically.  
- User can update/change their rating.  

---

### User Story 20: Uploading Reviews  
**Front of the card:**  
As an end user, I want to write and upload detailed reviews of books I read, so that I can share my thoughts and recommendations.  

**Back of the card:**  
- The user can type and submit a text review.  
- Displayed below the correct book.  
- Reviews are public.  
- The user can edit or delete their own review.  

---

### User Story 21: Discussing About the Book  
**Front of the card:**  
As an end user, I want to participate in discussions and comment on books I read, so that I can exchange perspectives.  

**Back of the card:**  
- The user can comment on books or reviews.  
- Discussion threads ordered correctly.  
- Replies to comments supported.  
- Notifications sent for replies.  

---

### User Story 22: Bookmarking & Notes  
**Front of the card:**  
As an end user, I want to bookmark pages and add notes, so that I can revisit important sections later.  

**Back of the card:**  
- The user can bookmark a page.  
- Notes can be attached to bookmarks.  
- Saved persistently.  
- User can edit/delete bookmarks & notes.  

---

### User Story 23: Highlighting  
**Front of the card:**  
As an end user, I want to highlight passages or words, so that I can mark meaningful content for later reference.  

**Back of the card:**  
- Select text and apply highlights.  
- Highlights saved and shown on revisit.  
- User can remove or change highlight color.  
- Stored per book and per user.  

--- 

### User Story 24: Browse Catalogue by Genre  
**Front of the Card:**  
As a reader, I want to browse books by specific genres, so that I can discover new books when I'm in the mood for a certain type of story.  

**Back of the Card:**  
- Genres displayed on homepage.  
- Clicking a genre shows only relevant books.  
- Genre page has clear title.  

---

### User Story 25: Basic Search  
**Front of the Card:**  
As a reader, I want to search for books by title or author’s name, so that I can find exactly what I'm looking for.  

**Back of the Card:**  
- Search bar available on header.  
- Searching returns matching results.  
- “No results found” message for empty results.  

---

### User Story 26: View Trending Books  
**Front of the Card:**  
As a reader, I want to see what’s currently trending, so that I can stay up-to-date with popular books.  

**Back of the Card:**  
- "Trending Now" section on homepage.  
- Displays trending books.  
- Clicking navigates to book details.  

---

### User Story 27: Find New Releases  
**Front of the Card:**  
As a reader, I want a section for "New Releases," so that I can keep up with the latest books.  

**Back of the Card:**  
- "New Releases" link on homepage.  
- Sorted by newest first.  
- Only books from last 30 days included.  

---

### User Story 28: Subscribing to a Plan  
**Front of the card:**  
As a user, I want to subscribe to a plan so that I can access premium features.  

**Back of the card:**  
- Subscription page shows available plans.  
- Details like duration, benefits, and price are visible.  
- Payment completion activates the subscription.  
- Confirmation email sent.  

---

### User Story 29: Managing Subscription Plans  
**Front of the card:**  
As an admin, I want to manage subscription details so that plans and pricing remain accurate.  

**Back of the card:**  
- Admin can create, edit, or delete plans.  
- Update plan details.  
- Validated changes apply immediately.  
- Changes recorded for reference.  

---

### User Story 30: Completing Secure Payments  
**Front of the card:**  
As a user, I want to complete my payment securely so that my financial details remain safe.  

**Back of the card:**  
- Payment through a secure gateway.  
- Confirmation shown instantly.  
- Receipt sent by email.  
- Subscription/order status updates.  

---

### User Story 31: Monitoring Secure Payments  
**Front of the card:**  
As an admin, I want to monitor and verify payments so that all transactions remain trustworthy.  

**Back of the card:**  
- Dashboard shows payment logs.  
- Verify gateway responses.  
- Generate financial reports.  
- Records stored securely.  

---

### User Story 32: Viewing Order History  
**Front of the card:**  
As a user, I want to check my previous subscription orders so that I can track my payments and renewals.  

**Back of the card:**  
- Profile shows order history.  
- Displays details of past subscriptions.  
- Sorted by most recent.  
- Cancelled orders clearly labeled.  

---

### User Story 33: Maintaining Order History  
**Front of the card:**  
As an admin, I want to maintain accurate order history so that users always see correct records.  

**Back of the card:**  
- Admin can access/verify order histories.  
- Filter records by user, date, or plan.  
- Records kept consistent with payments.  
- Backups maintained.  

---

### User Story 34: Analyzing Retention Data  
**Front of the card:**  
As an admin, I want to analyze retention data so that I can improve subscription renewals and reduce churn.  

**Back of the card:**  
- Retention data available in analytics module.  
- Metrics like renewal and churn rate shown.  
- Reports filterable by time, plan, or user.  
- Visual graphs for trends.  

---

### User Story 35 – Selecting Favourite Authors & Genres  
**Front of the card:**  
As a user, I want to select my favourite authors and genres so that I can receive personalized recommendations.  

**Back of the card:**  
- Users can choose during signup or later.  
- Choices can be updated anytime.  
- Suggestions update automatically.  
- Default shows popular books.  

---

### User Story 36 – AI Smart Suggestions  
**Front of the card:**  
As a user, I want AI to suggest books based on my reading so that I can easily find new books I’ll enjoy.  

**Back of the card:**  
- AI looks at history, ratings, and activity.  
- Suggestions appear on home screen.  
- Users can mark “Not Interested.”  
- For new users, AI suggests books liked by similar readers.  

---

### User Story 37 – AI Summary Generation  
**Front of the card:**  
As a user, I want short AI-made summaries of books so that I can quickly decide whether to read or skip.  

**Back of the card:**  
- Admin-approved books only.  
- AI generates summaries.  
- User clicks “Generate Summary.”  
- Fiction avoids spoilers unless requested.  

---

### User Story 38 – AI Scene Generation  
**Front of the card:**  
As a user, I want AI to create pictures of book scenes so that I can imagine the story better.  

**Back of the card:**  
- User highlights passage to request.  
- AI generates an image.  
- User can pick styles (sketch, realistic, etc.).  

---

### User Story 39 – Genre Reading Visualization  
**Front of the card:**  
As a user, I want to see which genres I read most so that I can track my habits.  

**Back of the card:**  
- System tags each book.  
- Chart shows how many books read per genre.  
- Filter by time.  
- Clicking genre shows books in that category.  

---

### User Story 40 – Personalized Notifications & Alerts  
**Front of the card:**  
As a user, I want personalized notifications about new releases and suggestions so that I always have fresh options.  

**Back of the card:**  
- Alerts for new releases/suggestions.  
- Links to book details.  
- Users can enable/disable alerts.  

---

### User Story 41 – AI-Curated Reading Digest  
**Front of the card:**  
As a user, I want a daily or weekly list of suggested books so that I always have fresh options to read.  

**Back of the card:**  
- AI generates 3–5 book digest.  
- Shown in-app or via email.  
- List updates with reading evolution.  

---

### User Story 42 – Reading Streaks & Personalized Challenges  
**Front of the card:**  
As a user, I want streaks and challenges so that I stay motivated to read more.  

**Back of the card:**  
- System tracks daily reading streaks.  
- Challenges created by genre.  
- Progress shown on dashboard.  
- Badges for completing milestones.  

---

### User Story 43 – Adaptive Learning Recommendations  
**Front of the card:**  
As a user, I want AI to suggest books outside my usual genres so that I can try new topics.  

**Back of the card:**  
- AI detects gaps in reading behaviour.  
- Suggestions in “Explore” section.  
- Users can accept/skip.  
- AI adapts future recommendations.  

---

### User Story 44 – Session Persistence  
**Front of the card:**  
As a user, I want a "Remember me" option so that I don’t need to log in every time I return to the app.  

**Back of the card:**  
- Checkbox option on the login screen for session persistence.  
- Secure token saved in encrypted storage.  
- Session lasts until manually logged out.  
- Expired or invalid tokens force re-login.  

---

### User Story 45 – Bulk Operations for Book Upload  
**Front of the card:**  
As an admin, I want to upload multiple books at once so that I can save time when updating the catalog.  

**Back of the card:**  
- Support for bulk CSV/Excel uploads.  
- Support batch cover image uploads.  
- Validation for all entries before saving.  
- Summary report of successful and failed uploads.  

---

### User Story 46 – AI-Powered Content Moderation  
**Front of the card:**  
As an admin, I want AI to pre-flag inappropriate reviews so that moderation is faster and more efficient.  

**Back of the card:**  
- AI scans new reviews before publishing.  
- Flags reviews with offensive/irrelevant content.  
- Admin receives notifications for flagged content.  
- Users are informed if their review is held for moderation.  

---

### User Story 47 – Like/Upvote Reviews  
**Front of the card:**  
As a reader, I want to like or upvote helpful reviews so that the best reviews surface to the top.  

**Back of the card:**  
- Each review has a like/upvote button.  
- Count of likes shown beside reviews.  
- Users can like only once per review.  
- Most liked reviews appear first by default.  

---

### User Story 48 – Thread Moderation Tools  
**Front of the card:**  
As an admin, I want moderation tools for discussions so that I can maintain a safe community environment.  

**Back of the card:**  
- Ability to delete or lock threads.  
- Auto-censor flagged keywords.  
- Option for auto-deleting abusive comments.  
- Notification sent to users if their comment is removed.  

---

### User Story 49 – Advanced Search Filters  
**Front of the card:**  
As a reader, I want advanced filters in search so that I can refine my results more precisely.  

**Back of the card:**  
- Filters for year, language, publisher, and price.  
- Multiple filters can be applied at once.  
- Search results update dynamically.  
- Option to clear filters with one click.  

---

### User Story 50 – Trial/Free Plans  
**Front of the card:**  
As a user, I want the option of a trial or free plan so that I can explore premium features before committing.  

**Back of the card:**  
- Free trial available for 1month.  
- “Cancel anytime before charge” policy enforced.  
- System shows trial expiry date.  
- Notifications sent before the trial ends.  

---

### User Story 51 – Reporting Inappropriate Content  
**Front of the card:**  
As a user, I want to report inappropriate reviews or comments so that the admin can take quick action against them.  

**Back of the card:**  
- Each review/comment has a “Report” option.  
- Report details are logged with the username and reason.  
- Admin dashboard shows reported content.  
- Admin can mark reports as resolved.  

---

### User Story 52 – Continue Reading Shortcut  
**Front of the card:**  
As a user, I want a “Continue Reading” option on my homepage so that I can quickly resume my last-read book.  

**Back of the card:**  
- Homepage shows the last-read book with a progress bar.  
- Clicking resumes exactly where the user left off.  
- Updates automatically when reading progress changes.  
- Supports syncing across devices.  

---

### User Story 53 – Offline Reading Access  
**Front of the card:**  
As a user, I want to access recently opened books offline so that I can continue reading without internet connectivity.  

**Back of the card:**  
- Last 1–2 books cached locally.  
- Offline mode is clearly indicated.  
- Progress syncs when back online.  
- Cached content automatically expires after a set time.  

---

### User Story 54 – Admin Broadcast Notifications  
**Front of the card:**  
As an admin, I want to send notifications about new releases, offers, or updates so that all users stay informed.  

**Back of the card:**  
- Admin dashboard has “Create Notification” option.  
- Notifications can be text + link (e.g., new release).  
- Broadcast sent to all users.  
- Users receive in-app and/or email notifications.  
- Admin can schedule or cancel notifications.  

---

---

### User Story 55 – Dark Mode & Font Customization  
**Front of the card:**  
As a user, I want to switch between dark/light mode and adjust font style/size so that reading is comfortable for my eyes. 

**Back of the card:**  
- Users can switch between light and dark themes anytime.
- Font style (serif/sans-serif) and font size can be adjusted.
- Settings are remembered across devices.
- The default theme is light if no preference is set.  

---

---

### User Story 56 – Audio Book Support
**Front of the card:**  
As a user, I want to listen to audiobooks so that I can enjoy books while multitasking or when reading isn’t possible. 

**Back of the card:**  
-Users can switch between reading and listening modes.
-Audiobooks support play, pause, rewind, and speed control.
-Progress syncs between audiobook and ebook (resume where you left off).
-Available only if the book has an audiobook version.  

---
