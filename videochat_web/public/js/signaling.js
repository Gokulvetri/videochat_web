class SignalingServer {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.onMessage = null;
    }

    connect(roomId) {
        this.roomId = roomId;
        this.socket = new WebSocket(`ws://localhost:8001?room=${roomId}`);

        this.socket.onopen = () => {
            console.log('Connected to signaling server');
            document.getElementById('connectionStatus').textContent = 'Connected';
            document.getElementById('connectionStatus').classList.remove('text-yellow-400');
            document.getElementById('connectionStatus').classList.add('text-green-400');
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (this.onMessage) {
                    this.onMessage(message);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            document.getElementById('connectionStatus').textContent = 'Connection Error';
            document.getElementById('connectionStatus').classList.remove('text-yellow-400');
            document.getElementById('connectionStatus').classList.add('text-red-400');
        };

        this.socket.onclose = () => {
            console.log('Disconnected from signaling server');
            document.getElementById('connectionStatus').textContent = 'Disconnected';
            document.getElementById('connectionStatus').classList.remove('text-yellow-400');
            document.getElementById('connectionStatus').classList.add('text-red-400');
        };
    }

    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
} 