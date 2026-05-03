# TeamSync - Team Task Manager

A full-stack team task management application built with Node.js, React, and MongoDB.

## Live Demo
- Frontend: https://just-victory-production.up.railway.app
- Backend API: https://accomplished-caring-production.up.railway.app

## Features
- User authentication (register/login with JWT)
- Create and manage projects
- Create tasks with priority, due date, and assignee
- Kanban board with To Do, In Progress, In Review, and Done columns
- Dashboard with task statistics and overdue alerts
- Add team members to projects
- Role-based access (only project owners can delete)

## Tech Stack
- **Frontend:** React, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (hosted on Railway)
- **Deployment:** Railway

## Setup Instructions

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm start

## Environment Variables
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000

