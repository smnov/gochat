# Chat Project Readme

## Overview

This project is a chat application with a backend written in Go and a frontend using Next.js. The application supports JWT token-based authentication, allows users to create chat rooms, join them, and engage in real-time communication through WebSockets.

## Features

- Authentication: Secure user authentication using JWT tokens.
- Chat Rooms: Users can create and join chat rooms for focused discussions.
- WebSocket Communication: Real-time communication facilitated through WebSockets for a seamless chat experience.

## Tech Stack

- Backend: Go
- Frontend: Next.js
- Authentication: JWT tokens
- Communication: WebSockets

## Setup Instructions

Backend

Clone the repository.
Navigate to the backend directory.
Install dependencies using go mod tidy.
Set up your database configurations.
Run the backend server using go run main.go.

Frontend
Navigate to the frontend directory.
Install dependencies using npm install or yarn install.
Configure the API endpoint in the frontend (if necessary).
Run the frontend application using npm run dev or yarn dev.

## Configuration

Backend configuration can be found in backend/config directory.
Frontend configuration can be done in the respective configuration files.

## Usage

- Register or log in to the application.
- Create or join chat rooms.
- Enjoy real-time communication with WebSocket-enabled chat.

## Contributing

Feel free to contribute by submitting bug reports, feature requests, or pull requests. Please follow the project's coding standards.

License

This project is licensed under the MIT License.


