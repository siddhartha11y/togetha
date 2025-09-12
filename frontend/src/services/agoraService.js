// Agora.io service for simple and reliable audio/video calls
import AgoraRTC from "agora-rtc-sdk-ng";
import socketService from "../socket";

class AgoraService {
  constructor() {
    // Agora client
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = new Map();
    
    // Call state
    this.isCallActive = false;
    this.callType = null; // 'audio' or 'video'
    this.chatId = null;
    this.callTimer = null;
    this.callDuration = 0;
    this.callStartTime = null;
    
    // Callbacks
    this.onCallStatusChange = null;
    this.onRemoteStreamReceived = null;
    
    // Agora App ID - You'll need to get this from Agora.io console
    // For now using a demo app ID - replace with your actual App ID
    this.appId = "0d51f1b43e6143e1bacfcfd98abc5a10";
  }

  // Initialize Agora service with callbacks
  initialize(onCallStatusChange, onRemoteStreamReceived) {
    this.onCallStatusChange = onCallStatusChange;
    this.onRemoteStreamReceived = onRemoteStreamReceived;
    this.setupSocketListeners();
  }

  // Set up socket listeners for call signaling
  setupSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle incoming Agora token and channel info
    socket.on("agora_call_info", async (data) => {
      console.log("📡 Received Agora call info", data);
      await this.joinChannel(data.token, data.channelName, data.uid);
    });
  }

  // Start a call (creates channel and waits for other user)
  async startCall(chatId, callType) {
    try {
      this.chatId = chatId;
      this.callType = callType;
      this.isCallActive = false; // Will be true when other user joins
      
      console.log("🎤 Starting Agora call:", { chatId, callType });
      
      // Create Agora client
      this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      
      // Set up client event listeners
      this.setupClientListeners();
      
      // Create local tracks
      await this.createLocalTracks(callType);
      
      // Generate channel name from chatId
      const channelName = `chat_${chatId}`;
      
      // Request token from backend (you'll need to implement this)
      const token = await this.getAgoraToken(channelName);
      
      // Join channel
      await this.joinChannel(token, channelName);
      
      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: true,
          type: callType,
          status: 'ringing'
        });
      }
      
      return this.localVideoTrack; // Return video track for local preview
    } catch (error) {
      console.error("Error starting Agora call:", error);
      await this.endCall();
      throw error;
    }
  }

  // Accept an incoming call
  async acceptCall(chatId, callType) {
    try {
      this.chatId = chatId;
      this.callType = callType;
      this.isCallActive = true;
      
      console.log("🎤 Accepting Agora call:", { chatId, callType });
      
      // Create Agora client
      this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      
      // Set up client event listeners
      this.setupClientListeners();
      
      // Create local tracks
      await this.createLocalTracks(callType);
      
      // Generate channel name from chatId
      const channelName = `chat_${chatId}`;
      
      // Request token from backend
      const token = await this.getAgoraToken(channelName);
      
      // Join channel
      await this.joinChannel(token, channelName);
      
      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: true,
          type: callType,
          status: 'connecting'
        });
      }
      
      // For receiver, start timer immediately as they're accepting an active call
      if (!this.callTimer) {
        this.startCallTimer();
      }
      
      return this.localVideoTrack; // Return video track for local preview
    } catch (error) {
      console.error("Error accepting Agora call:", error);
      await this.endCall();
      throw error;
    }
  }

  // Create local audio/video tracks with high quality
  async createLocalTracks(callType) {
    try {
      // Create high quality audio track with optimized settings
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: {
          sampleRate: 48000,
          stereo: false, // Use mono for better clarity and less bandwidth
          bitrate: 64, // Reduced bitrate for better stability
        },
        AEC: true, // Acoustic Echo Cancellation
        AGC: true, // Automatic Gain Control
        ANS: true, // Automatic Noise Suppression
        // Add these for better audio stability
        deviceId: 'default',
        microphoneId: 'default'
      });
      
      // Create video track only for video calls
      if (callType === 'video') {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000,
          }
        });
      }
      
      console.log("✅ Created high quality tracks:", { 
        audio: !!this.localAudioTrack, 
        video: !!this.localVideoTrack 
      });
    } catch (error) {
      console.error("Error creating local tracks:", error);
      throw error;
    }
  }

  // Set up Agora client event listeners
  setupClientListeners() {
    if (!this.client) return;

    // User joined
    this.client.on("user-joined", (user) => {
      console.log("👤 User joined:", user.uid);
      this.remoteUsers.set(user.uid, user);
    });

    // User left
    this.client.on("user-left", (user) => {
      console.log("👤 User left:", user.uid);
      this.remoteUsers.delete(user.uid);
    });

    // User published (started sharing audio/video)
    this.client.on("user-published", async (user, mediaType) => {
      console.log("📡 User published:", user.uid, mediaType);
      
      // Subscribe to the user
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === "video" && this.onRemoteStreamReceived) {
        // Convert Agora track to MediaStream for compatibility
        const videoTrack = user.videoTrack;
        if (videoTrack) {
          // Play the video track in a video element
          this.onRemoteStreamReceived(videoTrack);
        }
      }
      
      if (mediaType === "audio") {
        // Play audio automatically
        user.audioTrack?.play();
      }
      
      // Mark call as connected when first user joins
      if (!this.isCallActive) {
        this.isCallActive = true;
        this.startCallTimer();
        
        if (this.onCallStatusChange) {
          this.onCallStatusChange({
            active: true,
            type: this.callType,
            status: 'connected'
          });
        }
        
        // Notify both users that call is now connected via socket
        const socket = socketService.getSocket();
        if (socket) {
          socket.emit("call_connected", {
            chatId: this.chatId,
            callType: this.callType,
            startTime: Date.now() // Send start time for sync
          });
        }
      }
    });

    // User unpublished
    this.client.on("user-unpublished", (user, mediaType) => {
      console.log("📡 User unpublished:", user.uid, mediaType);
    });
  }

  // Join Agora channel
  async joinChannel(token, channelName, uid = null) {
    try {
      if (!this.client) {
        throw new Error("Agora client not initialized");
      }
      
      // Generate UID if not provided
      const userUid = uid || Math.floor(Math.random() * 10000);
      
      console.log("🔗 Joining Agora channel:", { channelName, uid: userUid });
      
      // Join the channel
      await this.client.join(this.appId, channelName, token, userUid);
      
      // Publish local tracks
      const tracks = [];
      if (this.localAudioTrack) tracks.push(this.localAudioTrack);
      if (this.localVideoTrack) tracks.push(this.localVideoTrack);
      
      if (tracks.length > 0) {
        await this.client.publish(tracks);
        console.log("📤 Published local tracks");
      }
      
    } catch (error) {
      console.error("Error joining Agora channel:", error);
      throw error;
    }
  }

  // Get Agora token from backend
  async getAgoraToken(channelName) {
    try {
      // For now, return null (no token) for testing
      // In production, you'll need to implement token generation on your backend
      console.log("🔑 Getting Agora token for channel:", channelName);
      
      // Simplified token request - implement this in your backend
      /*
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName })
      });
      const data = await response.json();
      return data.token;
      */
      
      return null; // For testing without token
    } catch (error) {
      console.error("Error getting Agora token:", error);
      return null;
    }
  }

  // End call
  async endCall() {
    try {
      console.log("🔚 Ending Agora call");
      
      this.isCallActive = false;
      this.stopCallTimer();
      
      // Leave channel
      if (this.client) {
        await this.client.leave();
      }
      
      // Close local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      
      // Clear remote users
      this.remoteUsers.clear();
      
      // Reset client
      this.client = null;
      
      if (this.onCallStatusChange) {
        this.onCallStatusChange({
          active: false,
          type: null,
          status: 'ended'
        });
      }
      
      this.callType = null;
      this.chatId = null;
      
    } catch (error) {
      console.error("Error ending Agora call:", error);
    }
  }

  // Toggle mute
  toggleMute(muted) {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(!muted);
      console.log("🔇 Audio muted:", muted);
    }
  }

  // Toggle video
  toggleVideo(videoOn) {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(videoOn);
      console.log("📹 Video enabled:", videoOn);
    }
  }

  // Start call timer
  startCallTimer(startTime = null) {
    // Use provided start time for sync, or current time
    this.callStartTime = startTime ? new Date(startTime) : new Date();
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

  // Sync timer from external event (for receiver)
  syncTimer(startTime) {
    if (this.callTimer) {
      this.stopCallTimer();
    }
    this.isCallActive = true;
    this.startCallTimer(startTime);
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

  // Get call duration formatted
  getCallDuration() {
    return this.formatCallDuration(this.callDuration);
  }

  // Check if call is active
  getIsCallActive() {
    return this.isCallActive;
  }

  // Get call type
  getCallType() {
    return this.callType;
  }

  // Placeholder for WebRTC compatibility
  async startWebRTCOffer() {
    // Not needed with Agora - it handles signaling automatically
    console.log("📤 Agora handles signaling automatically");
  }
}

const agoraService = new AgoraService();
export default agoraService;
