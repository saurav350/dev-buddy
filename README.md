# AI Coding Assistant

A full-stack local AI coding assistant built with Node.js, Express, Socket.io, and React/Vite.

## Features

- Real-time chat UI with Socket.io
- Google Gemini API integration with function calling
- Safe file and command access scoped to a target project folder
- `read_file`, `write_file`, `list_files`, and `run_command` tools

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `GEMINI_API_KEY`, `MODEL`, and `TARGET_PROJECT_ROOT`.
3. Install dependencies:
   - `npm install`
4. Start the application:
   - `npm run dev`

The frontend runs on `http://localhost:5173` by default and the backend runs on `http://localhost:4000`.

## Notes

- The backend will only operate inside the folder configured by `TARGET_PROJECT_ROOT`.
- Use the frontend chat UI to send instructions and watch the assistant call tools safely.
