# Video Chat Web Application

A real-time video chat application built with WebRTC, Node.js, and vanilla JavaScript.

## Features

- Real-time video and audio streaming
- Room-based connections
- Modern UI with glass effect
- Responsive design
- Easy room sharing
- Connection status indicators
- Mute/unmute and video toggle controls

## Prerequisites

- Node.js (v14 or higher)
- Python 3 (for local development server)
- Modern web browser with WebRTC support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/videochat_web.git
cd videochat_web
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the signaling server (in one terminal):
```bash
node signaling-server.js
```

2. Start the HTTP server (in another terminal):
```bash
cd public
python -m http.server 8000
```

3. Open your browser and visit:
```
http://localhost:8000
```

## Usage

1. Enter a room name on the landing page
2. Click "Join Room"
3. Allow camera and microphone access when prompted
4. Share the room name with others to join your call

## Project Structure

```
videochat_web/
├── public/              # Frontend files
│   ├── index.html      # Landing page
│   ├── room.html       # Video chat room
│   └── js/             # JavaScript files
│       ├── room.js     # Video chat functionality
│       └── signaling.js # WebSocket client
├── signaling-server.js # WebSocket server
├── package.json        # Node.js dependencies
└── README.md           # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
