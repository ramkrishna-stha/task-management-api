# Task Management API

A production-ready Task Management Backend built with Node.js, Express, MongoDB, and Redis.

## Features

- User Registration & Login with Redis Sessions
- JWT-less Token based Authentication
- Redis Rate Limiting (20 req/min)
- Task CRUD with Cache Invalidation
- Failed Login Attempt Protection
- Real-time Activity Analytics
- Centralized Error Handling & Logging

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Cache & Session**: Redis
- **Security**: bcrypt, helmet, rate limiting

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
