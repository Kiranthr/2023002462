# Stage 1

## Notification System API Design



http/api/notifications




### 1. Get All Notifications

httpGET /api/notifications


Response json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Amazon Hiring",
      "isRead": false,
      "createdAt": "2026-04-22T10:00:00Z"
    }
  ]
}


### 2. Get Notification By ID

http/GET /api/notifications/{id}


Response json
{
  "id": "uuid",
  "type": "Placement",
  "message": "Amazon Hiring",
  "isRead": false
}


### 3. Create Notification

http/POST /api/notifications


Request

json
{
  "type": "Placement",
  "message": "Amazon Hiring"
}


Response

json
{
  "id": "uuid",
  "message": "Notification Created"
}


### 4. Mark Notification As Read

http/PATCH /api/notifications/{id}/read


Response

json
{
  "message": "Notification marked as read"
}




### 5. Delete Notification

http/DELETE /api/notifications/{id}


Response

json
{
  "message": "Notification deleted"
}




## Real-Time Notification Mechanism

Technology Used: WebSocket

Flow:

1. User logs in
2. Client establishes WebSocket connection
3. Server generates notification
4. Notification pushed instantly
5. Client receives without page refresh

Benefits:

* Real-time updates
* Reduced polling
* Better user experience
* Scalable communication

# Stage 2

## Database Choice

I recommend PostgreSQL as the persistent storage database.

### Reasons

* ACID compliant
* Reliable and consistent
* Supports indexing
* Supports large datasets efficiently
* Easy integration with Node.js and MERN applications


## Database Schema

### Students Table

 Column     | Type      
 ---------- | --------- 
 student_id | UUID      
 name       | VARCHAR   
 email      | VARCHAR   
 created_at | TIMESTAMP 



### Notifications Table

 Column            | Type      
 ----------------- | --------- 
 id                | UUID      
 student_id        | UUID      
 notification_type | VARCHAR   
 message           | TEXT      
 is_read           | BOOLEAN   
 created_at        | TIMESTAMP 

# Stage 3

## Query Optimization

Given Query

sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;



## Why This Query Becomes Slow

When the notifications table grows to millions of rows:

1. Full Table Scan

   * Database scans all rows.

2. Sorting Cost

   * ORDER BY createdAt requires sorting.

3. Large Dataset

   * More rows mean longer execution time.


## Recommended Index

sql
CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt);




## Why This Index Helps

The database can directly locate:

* studentID
* unread notifications
* createdAt ordering

without scanning the entire table.


## Time Complexity

Before Index:
text
O(N)

After Index:

text
O(log N)


## Why Not Index Every Column?

Problems:

1. Increased Storage
2. Slower INSERT operations
3. Slower UPDATE operations
4. Index maintenance overhead

Therefore indexes should be created only for frequently queried columns.



## Placement Notification Query


SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

### Recommended Index


CREATE INDEX idx_placement_notifications
ON notifications(notificationType, createdAt);


This improves filtering and date-range queries.

 # Stage 4

## Improving Notification Dashboard Performance

### Problem

The notification dashboard loads all notifications whenever a student opens the application.

With millions of notifications:

* Database load increases
* Response time becomes slower
* User experience degrades


## Solution 1: Pagination

Instead of loading all notifications:

text
Page 1 → 20 notifications
Page 2 → Next 20 notifications


### Advantages

* Faster response
* Less memory usage
* Reduced network traffic

### Disadvantages

* Multiple requests required


## Solution 2: Redis Caching

Store frequently accessed notifications in Redis.

Flow:

User → Redis Cache → Database (only if cache miss)

### Advantages

* Very fast access
* Reduces database load

### Disadvantages

* Additional infrastructure
* Cache invalidation complexity


## Solution 3: Lazy Loading

Load notifications only when needed.

### Advantages

* Better user experience
* Smaller initial payload

### Disadvantages

* More frontend logic



## Solution 4: WebSockets

Push new notifications in real time.

### Advantages

* Instant updates
* No constant polling

### Disadvantages

* Persistent connections
* More server resources

---

## Solution 5: Read Replicas

Use separate databases for reads.

Primary Database:

* Writes

Replica Database:

* Reads

### Advantages

* Scales large systems

### Disadvantages

* Replication lag



## Recommended Architecture

1. Pagination
2. Redis Cache
3. WebSocket Updates
4. Read Replicas

This combination provides the best balance between performance and scalability.

# Stage 5

## High Volume Notification Delivery System

### Existing Problem

Current Flow:


HR Uploads Results
        |
        v
Application
        |
        v
For Each Student
        |
        v
Send Notification


Problems:

1. Sequential processing
2. Slow delivery
3. Failure stops entire process
4. Not scalable



## Improved Design

### Architecture


HR Uploads Results
        |
        v
Notification Service
        |
        v
Message Queue
        |
        +----------------+
        |                |
        v                v
Notification Worker   Email Worker
        |                |
        v                v
Students Receive Updates

## Components

### Notification Service

Responsibilities:

* Validate uploaded data
* Create notification records
* Publish messages to queue


### Message Queue

Examples:

* RabbitMQ
* Kafka
* AWS SQS

Responsibilities:

* Buffer messages
* Prevent overload
* Enable asynchronous processing



### Notification Worker

Responsibilities:

* Read messages from queue
* Push notifications to users
* Retry failed deliveries



### Email Worker

Responsibilities:

* Send email notifications
* Handle retries
* Track delivery status



## Why This Design Is Better

### Scalability

Multiple workers can process messages simultaneously.

### Reliability

Failures do not stop the system.

### Performance

Parallel processing significantly reduces delivery time.

### Fault Tolerance

Messages remain in queue until successfully processed.


## Pseudocode


HR uploads result

Create notification

Publish message to queue

Worker receives message

Send notification

If failed:
    Retry

Mark success


## Benefits

* Fast delivery
* High throughput
* Better reliability
* Easy scaling
* Production-ready architecture

# Stage 6

## Priority Calculation

Weights:

- Placement = 3
- Result = 2
- Event = 1

Priority Score:

score = weight * 100 - age_in_minutes

Recent notifications receive higher priority.
Placement notifications are always prioritized over Result and Event notifications of similar age.

## Efficient Top N Maintenance

Instead of sorting the entire dataset repeatedly, a Min Heap of size N can be maintained.

Benefits:
- O(log N) insertion
- O(N log K) processing
- Suitable for continuous notification streams

The implementation fetches notifications from the provided API and computes the Top 10 notifications based on priority score.