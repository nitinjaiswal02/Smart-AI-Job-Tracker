# Smart Job Tracker

An AI-powered job application tracker built for students. Track every application,
get your resume scored against a job description, catch ATS-compatibility issues,
and never miss an interview or follow-up again.

## The problem

Students applying to internships and entry-level roles routinely apply to 100+
positions across a hiring season. Spreadsheets get abandoned, interview dates
get missed, and follow-up emails never get sent.

## Core features

- Application tracker — every application as a record: company, role, status, dates, notes
- AI resume scoring — score a resume against a specific job description
- ATS compatibility checker
- Interview reminders
- Auto follow-up email generator
- Real-time updates — live status changes and recruiter comments

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Caching / Queue | Redis, BullMQ |
| Scheduled jobs | node-cron |
| AI | OpenAI API |
| Email | Gmail API / Nodemailer |
| Real-time | Socket.io |

## Project status

Being built in phases, each with its own commit history.