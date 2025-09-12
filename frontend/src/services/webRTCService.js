// WebRTC service for handling audio/video calls
import socketService from "../socket";

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.chatId = null;
    this.callType = null; // 'audio' or 'video'
    this.isCallActive = false;
    this.callTimer = null;
    this.callDuration = 0;
    this.onCallStatusChange = null;
    this.onRemoteStreamReceived = null;
    this.callStartTime = null;
  }

  // Initialize WebRTC with callbacks
  initialize(onCallStatusChange, onRemoteStreamReceived) {
    this.onCallStatusChange = onCallStatusChange;
    this.onRemoteStreamReceived = onRemoteStreamReceived;
    this.setupSocketListeners();
  }

  // Set up socket listeners for WebRTC signaling
  setupSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle incoming WebRTC offer
    socket.on("offer", async (data) => {
      console.log("📡 Received WebRTC offer", data);
      if (!this.peerConnection) {
        await this.createPeerConnection();
      }
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      socket.emit("answer", {
        chatId: data.chatId,
        answer: answer
      });
    });

    // Handle incoming WebRTC answer
    socket.on("answer", async (data) => {
      console.log("📡 Received WebRTC answer", data);
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Handle incoming ICE candidates
    socket.on("ice-candidate", async (data) => {
      console.log("📡 Received ICE candidate", data);
      if (this.peerConnection) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    });
  }

  // Create WebRTC peer connection
  async createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { 
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          }
        ]
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = socketService.getSocket();
          if (socket) {
            socket.emit("ice-candidate", {
              chatId: this.chatId,
              candidate: event.candidate
            });
          }
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === 'connected') {
          console.log("🎉 Peers connected!");
          this.startCallTimer();
        }
      };

      // Handle receiving remote stream
      this.peerConnection.ontrack = (event) => {
        console.log("🎥 Received remote track", event.streams[0]);
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamReceived) {
          this.onRemoteStreamReceived(this.remoteStream);
        }
      };

      // Note: Local tracks will be added when starting/accepting calls

      return this.peerConnection;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      throw error;
    }
  }

  // Start a call
  async startCall(chatId, callType) {
    try {
      this.chatId = chatId;
      this.callType = callType;
      this.isCallActive = false; // Don't set to true until call is accepted
      
      // Get user media based on call type
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      console.log("🎤 Getting user media with constraints:", constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("🎤 Got local stream:", this.localStream);
      
      // Create peer connection and add tracks
      await this.createPeerConnection();
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        console.log("➕ Adding track to peer connection:", track.kind);
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: true,
          type: callType,
          status: 'ringing' // Show ringing instead of connecting
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error("Error starting call:", error);
      this.endCall();
      throw error;
    }
  }

  // Accept an incoming call
  async acceptCall(chatId, callType) {
    try {
      this.chatId = chatId;
      this.callType = callType;
      this.isCallActive = true;
      
      // Get user media based on call type
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      console.log("🎤 Getting user media for incoming call:", constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("🎤 Got local stream for incoming call:", this.localStream);
      
      // Create peer connection if it doesn't exist
      if (!this.peerConnection) {
        await this.createPeerConnection();
      }
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        console.log("➕ Adding track to peer connection (incoming):", track.kind);
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: true,
          type: callType,
          status: 'connecting'
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error("Error accepting call:", error);
      this.endCall();
      throw error;
    }
  }

  // Start WebRTC offer when call is accepted (called by caller)
  async startWebRTCOffer() {
    try {
      if (!this.peerConnection || !this.localStream) {
        throw new Error("Peer connection or local stream not ready");
      }

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      const socket = socketService.getSocket();
      if (socket) {
        console.log("📤 Sending WebRTC offer after call acceptance");
        socket.emit("offer", {
          chatId: this.chatId,
          offer: offer
        });
      }

      // Set call as active and start timer
      this.isCallActive = true;
      this.startCallTimer();

      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: true,
          type: this.callType,
          status: 'connecting'
        });
      }
    } catch (error) {
      console.error("Error starting WebRTC offer:", error);
      throw error;
    }
  }

  // End the current call
  endCall() {
    // Stop all tracks in local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Reset call state
    this.isCallActive = false;
    this.stopCallTimer();
    
    if (this.onCallStatusChange) {
      this.onCallStatusChange({
        active: false,
        type: null,
        status: 'ended'
      });
    }
    
    this.callType = null;
    this.chatId = null;
    this.remoteStream = null;
  }

  // Toggle mute state
  toggleMute(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  // Toggle video state
  toggleVideo(videoOn) {
    if (this.localStream && this.callType === 'video') {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = videoOn;
      });
    }
  }

  // Start call timer
  startCallTimer() {
    this.callStartTime = new Date();
    this.callDuration = 0;
    this.callTimer = setInterval(() => {
      const now = new Date();
      this.callDuration = Math.floor((now - this.callStartTime) / 1000);
      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: true,
          type: this.callType,
          status: 'connected',
          duration: this.callDuration
        });
      }
    }, 1000);
  }

  // Stop call timer
  stopCallTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
      this.callDuration = 0;
      this.callStartTime = null;
    }
  }

  // Format call duration as MM:SS
  formatCallDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Check if call is active
  getIsCallActive() {
    return this.isCallActive;
  }

  // Get call type
  getCallType() {
    return this.callType;
  }

  // Get call duration
  getCallDuration() {
    return this.formatCallDuration(this.callDuration);
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;