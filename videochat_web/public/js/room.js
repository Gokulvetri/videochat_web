// Get video element references
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Get control buttons
const muteButton = document.getElementById('muteButton');
const videoToggleButton = document.getElementById('videoToggleButton');
const endCallButton = document.getElementById('endCallButton');

// Get status elements
const remoteStatus = document.getElementById('remoteStatus');
const localStatus = document.getElementById('localStatus');
const connectionStatus = document.getElementById('connectionStatus');

// State
let localStream = null;
let isMuted = false;
let isVideoOn = true;
let peerConnection = null;
let signalingServer = null;

// WebRTC Configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Function: Start local camera and mic
async function startLocalStream() {
    try {
        // Ask for permission to use camera and mic
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }, 
            audio: true 
        });

        // Show the video stream in the local video element
        localVideo.srcObject = localStream;
        localStatus.textContent = 'Connected';
        localStatus.classList.add('text-green-400');

        // Initialize signaling and peer connection
        initializeConnection();
    } catch (err) {
        console.error('Could not access media devices:', err);
        localStatus.textContent = 'Camera/Microphone access denied';
        localStatus.classList.add('text-red-400');
        alert('Camera/Microphone access denied or not found!');
    }
}

// Initialize WebRTC connection
function initializeConnection() {
    // Get room ID from URL
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');

    // Initialize signaling server
    signalingServer = new SignalingServer();
    signalingServer.connect(roomId);

    // Create peer connection
    peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
        remoteStatus.textContent = 'Connected';
        remoteStatus.classList.add('text-green-400');
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            signalingServer.send({
                type: 'candidate',
                candidate: event.candidate
            });
        }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        connectionStatus.querySelector('span').textContent = state.charAt(0).toUpperCase() + state.slice(1);
        
        switch (state) {
            case 'connected':
                connectionStatus.classList.remove('text-yellow-400');
                connectionStatus.classList.add('text-green-400');
                break;
            case 'disconnected':
            case 'failed':
                connectionStatus.classList.remove('text-yellow-400');
                connectionStatus.classList.add('text-red-400');
                break;
        }
    };

    // Handle signaling messages
    signalingServer.onMessage = async (message) => {
        try {
            switch (message.type) {
                case 'offer':
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    signalingServer.send({
                        type: 'answer',
                        sdp: answer
                    });
                    break;
                case 'answer':
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                    break;
                case 'candidate':
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                    break;
            }
        } catch (error) {
            console.error('Error handling signaling message:', error);
        }
    };

    // If we're the first peer in the room, create an offer
    if (roomId) {
        createOffer();
    }
}

// Create and send offer
async function createOffer() {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingServer.send({
            type: 'offer',
            sdp: offer
        });
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// Mute/Unmute
muteButton.addEventListener('click', () => {
    if (!localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => (track.enabled = !isMuted));
    muteButton.innerHTML = isMuted ? 
        '<i class="fas fa-microphone-slash"></i><span>Unmute</span>' : 
        '<i class="fas fa-microphone"></i><span>Mute</span>';
});

// Toggle Video
videoToggleButton.addEventListener('click', () => {
    if (!localStream) return;
    isVideoOn = !isVideoOn;
    localStream.getVideoTracks().forEach(track => (track.enabled = isVideoOn));
    videoToggleButton.innerHTML = isVideoOn ? 
        '<i class="fas fa-video-slash"></i><span>Turn Off Video</span>' : 
        '<i class="fas fa-video"></i><span>Turn On Video</span>';
});

// End Call
endCallButton.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }

    if (remoteVideo && remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
    }

    if (peerConnection) {
        peerConnection.close();
    }

    if (signalingServer) {
        signalingServer.disconnect();
    }

    window.location.href = 'index.html';
});

// Start stream on page load
window.addEventListener('load', startLocalStream);


