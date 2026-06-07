# Notification System — Design & Architecture

## Stage 1: API Design & Real-Time Delivery

For the notification system, I went with a standard REST API structure. It covers the core operations you'd expect — fetching all notifications, getting a specific one by ID, creating new ones, marking them as read, and deleting them.

The base endpoint is `/api/notifications`, and each notification carries an ID, a type (like "Placement"), the message content, a read/unread flag, and a timestamp.

For real-time delivery, I chose WebSockets over polling. The reasoning is simple: once a user logs in, their client opens a persistent WebSocket connection with the server. Whenever a new notification arrives, the server pushes it directly through the WebSocket, eliminating latency and reducing server load compared to constant polling.


## Stage 2: Database Design

I went with PostgreSQL as the primary database. It's ACID-compliant, handles large datasets well, supports indexing properly, and integrates cleanly with Node.js-based stacks.

The schema has two main tables. The `students` table stores the student's ID, name, email, and creation timestamp. The `notifications` table links back to students via a foreign key and stores the notification type, message, read status, and timestamp.


## Stage 3: Query Optimization

The query we need to run frequently looks like this:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

When the table is small, this runs fine. But once you're dealing with millions of rows, it starts doing a full table scan on every request — which is expensive, especially with the sort on top.

The fix is a composite index:

```sql
CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt);
```

This lets the database jump directly to the rows matching a specific student and read status, and since `createdAt` is also in the index, the ordering comes for free. Query complexity drops from O(N) to O(log N).

One thing worth noting: I didn't just index every column. More indexes means more storage, and every INSERT or UPDATE now has to maintain those indexes too. The overhead adds up. So I kept indexing targeted to the actual query patterns.

For placement-specific queries — like finding all students who received a placement notification in the last 7 days — a separate index on `(notificationType, createdAt)` makes sense:

```sql
CREATE INDEX idx_placement_notifications
ON notifications(notificationType, createdAt);
```


## Stage 4: Dashboard Performance

The default behavior of loading all notifications every time a student opens the app doesn't scale. With millions of records, it hammers the database and slows down the UI.

Here's the approach I'd layer in:

**Pagination** is the most immediate fix. Instead of returning everything, we return 20 notifications at a time. Faster response, less memory, reduced network load — the tradeoff is just that users need to click "Load More" for older notifications.

**Redis caching** sits in front of the database for frequently accessed data. If a student reopens the app, we serve from cache instead of hitting Postgres again. The complexity is in cache invalidation — when new notifications arrive, we need to flush stale entries.

**Lazy loading** means we only fetch notifications when a user actually scrolls to them or opens that section. It keeps the initial page load light, though it does add more logic on the frontend.

**WebSocket updates** (already covered in Stage 1) handle real-time pushes so the dashboard stays current without polling.

**Read replicas** become relevant at scale. Write operations go to the primary database, and read-heavy queries (like the dashboard) hit a replica. The only catch is replication lag — the replica might be a few seconds behind.

In practice, I'd combine all of these: pagination for the initial load, Redis to avoid redundant database hits, WebSockets for live updates, and read replicas when the system grows large enough.


## Stage 5: High-Volume Notification Delivery

The naive approach — looping through every student and sending a notification synchronously — breaks down fast. If HR uploads placement results for 5,000 students, that's 5,000 sequential operations. The user waits forever, and any failure partway through leaves the system in an inconsistent state.

The better design introduces a message queue between the notification service and the workers that actually deliver notifications.

When HR uploads results, the notification service validates the data, creates the notification records, and publishes messages to a queue (RabbitMQ, Kafka, or AWS SQS all work here). From there, separate worker processes consume messages and push notifications to students in parallel.

This design gives you parallel processing (multiple workers handling messages simultaneously), fault tolerance (a failed delivery doesn't stop others), and easy scaling (just spin up more workers under load).


## Stage 6: Priority Scoring & Top-N Retrieval

Not all notifications are equal. A placement alert matters more than an event reminder. To reflect this, I assigned weights by type:

- Placement → 3
- Result → 2
- Event → 1

The priority score is calculated as:

```
score = weight × 100 − age_in_minutes
```

So a fresh placement notification scores higher than an older one, and placement always outranks result or event notifications of similar age. It's a simple formula, but it captures the right behavior.

For maintaining the top 10 notifications efficiently, I use a min-heap of size 10. As new notifications come in, we compare against the heap's minimum — if the new one scores higher, we pop the minimum and insert the new one. This keeps memory usage O(10) instead of O(N) for all notifications.


---

That's the full system — from the API layer and real-time delivery, through the database design, query optimization, dashboard performance, bulk delivery architecture, and priority handling. Each stage builds on the last to create a notification system that scales.


## Stage 7 — Frontend Implementation

### Overview

For the frontend, I developed a React-based notification dashboard that consumes data from the notification service and presents it in a user-friendly format.

The objective was to provide students with a clean interface to view, filter, and prioritize notifications efficiently.

---

### Features Implemented

#### 1. Notification Dashboard

The dashboard displays all notifications received from the backend service.

Each notification card shows:

* Notification Type
* Message Content
* Timestamp
* Status Indicator

---

#### 2. Notification Filtering

Users can filter notifications based on their category.

Supported filters:

* All Notifications
* Placement Notifications
* Result Notifications
* Event Notifications

This helps users quickly find relevant information without scrolling through the entire list.

---

#### 3. Priority Notification Section

A dedicated section displays the highest-priority notifications.

Priority levels are calculated using the following order:

| Type      | Priority |
| --------- | -------- |
| Placement | High     |
| Result    | Medium   |
| Event     | Low      |

This ensures important placement updates appear before less critical notifications.

---

#### 4. Viewed / Unread Tracking

Notifications are marked as:

* New
* Viewed

The status is maintained using browser local storage so that users can easily identify unread notifications.

---

#### 5. Responsive Design

The interface is designed to work on:

* Desktop Devices
* Tablets
* Mobile Phones

Responsive layouts ensure a consistent user experience across different screen sizes.

---

### Frontend Architecture

```text
React Application
       │
       ▼
Notification Dashboard
       │
 ┌─────┴─────┐
 ▼           ▼
Filters   Priority View
       │
       ▼
Notification Cards
```

---

### Backend Integration

The frontend communicates with the backend proxy service using REST APIs.

Flow:

```text
React Frontend
      │
      ▼
Node.js Backend Proxy
      │
      ▼
AffordMed Notification API
```

This architecture avoids browser CORS restrictions and provides a cleaner separation between frontend and backend responsibilities.

---

### Benefits

* Easy to use interface
* Fast notification access
* Real-time ready architecture
* Mobile friendly design
* Clear notification prioritization
* Improved user experience

---

### Conclusion

The frontend successfully integrates with the notification service and provides an intuitive dashboard for managing notifications. Features such as filtering, prioritization, viewed status tracking, and responsive design improve usability while maintaining a scalable architecture.
