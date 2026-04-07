# Real-Time Chat Backend (Node.js + Socket.IO + MongoDB)

A scalable real-time chat backend built using Node.js, Express, MongoDB, and Socket.IO.  
This project supports real-time messaging, unread message tracking, online/offline user status, JWT authentication, and pagination for efficient performance.

---

## Features

- JWT Authentication (secure login & signup)
- Real-time messaging using Socket.IO
- Online / Offline user status
- Unread message count
- Last message preview in chat list
- Pagination for messages (load older messages)
- Pagination for chat list
- MongoDB aggregation pipelines
- Clean and scalable backend structure
- Environment variables using dotenv
- Ready for Firebase push notifications

---

## Tech Stack

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT (JSON Web Token)
- dotenv

Optional integration:
- Firebase Cloud Messaging (FCM)

---

## API Endpoints

### Authentication

POST /auth/signup  
POST /auth/login  

---

### Chat

POST /createRoom  
Create a chat room between two users

GET /chatlist?page=1&limit=10  
Get chat list with last message and unread count

GET /message/:roomId?page=1&limit=20  
Get paginated messages of a chat room

---

### Real-time Events (Socket.IO)

join_room  
User joins chat room

send_message  
Send message in real time

receive_message  
Receive real-time message

user_online  
User online status update

user_offline  
User offline status update

---
