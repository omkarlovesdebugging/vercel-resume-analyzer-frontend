Resume Analyzer – Frontend (Next.js)

This is the frontend of the Resume Analyzer application, built using Next.js.
It provides the UI for uploading resumes, scoring them, and generating summaries.
The frontend communicates with the FastAPI backend using REST APIs.

Tech Stack

Next.js

React

JavaScript

CSS Modules

REST API Integration

Project Structure
frontend/
  pages/
    index.js
    api/
      score-resume.js
      summarize.js
  styles/
    Home.module.css
  public/
  package.json
  next.config.js

Setup Instructions
1. Install Dependencies
npm install

2. Add Environment Variable

Create .env.local file:

NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

3. Run Development Server
npm run dev


App runs at:

http://localhost:3000

Build for Production
npm run build
npm start

Deployment

You can deploy the frontend on:

✅ Vercel (recommended)

Push repo to GitHub

Import into Vercel

Add environment variable

Deploy

✅ Render (Docker)

Use the included Dockerfile:

docker build -t resume-frontend .
docker run -p 3000:3000 resume-frontend

Environment Variables
Variable	Description
NEXT_PUBLIC_API_URL	URL of FastAPI backend
License

This project is for educational and personal use.