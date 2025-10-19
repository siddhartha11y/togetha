import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, PhoneOff, VolumeX, Volume2, User } from "lucide-react";
import socketService from "../socket";
import useUserStore from "../store/userStore";
import { toast } from "react-toastify";
import agoraService from "../services/agoraService";

export default function GlobalCallInterface() {
  const [callStatus, setCallStatus] = useState({
    active: false,
    type: null,
    status: null,
    duration: "00:00"
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callerInfo, setCallerInfo] = useState(null);
  const [calleeInfo, setCalleeInfo] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { user } = useUserStore();

  // Initialize WebRTC service
  useEffect(() => {
    if (!user) return;

    // Set up Agora service callbacks - much simpler and more reliable!
    agoraService.initialize(
      // Call status change callback
      (status) => {
        console.log("📞 Call status changed:", status);
        setCallStatus({
          active: status.active,
          type: status.type,
          status: status.status,
          duration: status.duration ? agoraService.formatCallDuration(status.duration) : "00:00"
        });
      },
      // Remote stream received callback (Agora track)
      (videoTrack) => {
        if (remoteVideoRef.current && videoTrack) {
          // Agora provides video track directly - much easier!
          videoTrack.play(remoteVideoRef.current);
        }
      }
    );

    // Listen for call events
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleCallAccepted = async (callData) => {
      console.log("✅ Call accepted:", callData);
      
      // Agora handles connection automatically - no manual offer/answer needed!
      console.log("✅ Agora will handle the connection automatically");
      
      // Update call status to show connected state
      setCallStatus(prev => ({
        ...prev,
        status: 'connecting'
      }));
    };

    const handleCallRejected = (callData) => {
      console.log("❌ Call rejected:", callData);
      // Force end call and reset all states
      agoraService.endCall();
      setCallStatus({
        active: false,
        type: null,
        status: null,
        duration: "00:00"
      });
      setCallerInfo(null);
      setCalleeInfo(null);
      setIsMuted(false);
      setIsVideoOn(true);
    };

    const handleCallEnded = (callData) => {
      console.log("📞 Call ended by other user:", callData);
      // Force end call and reset all states
      agoraService.endCall();
      setCallStatus({
        active: false,
        type: null,
        status: null,
        duration: "00:00"
      });
      setCallerInfo(null);
      setCalleeInfo(null);
      setIsMuted(false);
      setIsVideoOn(true);
    };

    const handleCallConnected = (callData) => {
      console.log("🔗 Call connected for both users:", callData);
      // Sync timer for both users
      if (callData.startTime) {
        agoraService.syncTimer(callData.startTime);
      }
      // Sync call status for both users
      setCallStatus(prev => ({
        ...prev,
        status: 'connected'
      }));
    };

    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_connected", handleCallConnected);

    return () => {
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_connected", handleCallConnected);
    };
  }, [user]);

  // Start outgoing call
  const startCall = async (chatId, callType, recipient) => {
    try {
      console.log("📞 Starting outgoing call - setting caller/callee info:", { caller: user, callee: recipient });
      setCallerInfo(user);
      setCalleeInfo(recipient);
      
      // Get local video track from Agora
      const localVideoTrack = await agoraService.startCall(chatId, callType);
      
      // Set local video - Agora makes this super easy!
      if (localVideoRef.current && callType === 'video' && localVideoTrack) {
        localVideoTrack.play(localVideoRef.current);
      }
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // Expose methods for other components (CallNotification and ChatBox)
  window.globalCallInterface = {
    handleIncomingCall: async (callData) => {
      try {
        console.log("📞 Setting caller/callee info:", { caller: callData.caller, callee: user });
        setCallerInfo(callData.caller);
        setCalleeInfo(user);
        
        // Get local video track from Agora
        const localVideoTrack = await agoraService.acceptCall(
          callData.chatId,
          callData.callType
        );
        
        // Set local video - Agora makes this super easy!
        if (localVideoRef.current && callData.callType === 'video' && localVideoTrack) {
          localVideoTrack.play(localVideoRef.current);
        }
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    },
    startCall: startCall
  };

  // End call
  const endCall = async () => {
    agoraService.endCall();
    setCallerInfo(null);
    setCalleeInfo(null);
    setIsMuted(false);
    setIsVideoOn(true);
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    // Emit call end to other user via socket
    const socket = socketService.getSocket();
    if (socket && callStatus.active) {
      socket.emit("end_call", {
        chatId: agoraService.chatId,
        user: user
      });
      
      // Add call history to chat via API
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${agoraService.chatId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: `${callStatus.type === 'video' ? '📹' : '📞'} Call ended • Duration: ${callStatus.duration}`,
            messageType: 'call_history',
            callInfo: {
              type: callStatus.type,
              duration: callStatus.duration,
              status: 'ended'
            }
          })
        });

        if (response.ok) {
          const callMessage = await response.json();
          // Emit the saved message to other participants  
          socket.emit("send_message", callMessage);
          
          // Also add to local state if we can access it
          if (window.addMessageToCurrentChat) {
            window.addMessageToCurrentChat(callMessage);
          }
        }
      } catch (error) {
        console.error("Error saving call history:", error);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    agoraService.toggleMute(newMutedState);
  };

  // Toggle video
  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    agoraService.toggleVideo(newVideoState);
  };

  // Show call interface when there's an active call (only show one instance)
  const shouldShowInterface = callStatus.active && user;
  
  return (
    <AnimatePresence>
      {shouldShowInterface && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-800 to-pink-700 rounded-lg shadow-lg overflow-hidden"
          style={{ width: callStatus.type === 'video' ? '320px' : '280px' }}
        >
          {/* Call header */}
          <div className="p-3 flex items-center justify-between bg-black bg-opacity-30">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center">
                {/* Show the other person's profile picture */}
                {(() => {
                  const otherPerson = callerInfo?._id === user?._id ? calleeInfo : callerInfo;
                  console.log("📸 Profile picture debug:", { 
                    otherPerson, 
                    profilePicture: otherPerson?.profilePicture,
                    callerInfo,
                    calleeInfo,
                    currentUser: user
                  });
                  const profilePicUrl = otherPerson?.profilePicture || otherPerson?.profilePic || otherPerson?.avatar;
                  return profilePicUrl ? (
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL}${profilePicUrl}`} 
                      alt={otherPerson.fullName || otherPerson.username} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("❌ Failed to load profile picture:", profilePicUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User size={20} className="text-white" />
                  );
                })()}
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {callerInfo?._id === user?._id ? (calleeInfo?.fullName || calleeInfo?.username) : (callerInfo?.fullName || callerInfo?.username)}
                </h3>
                <p className="text-purple-100 text-sm flex items-center gap-1">
                  {callStatus.type === 'video' ? 'Video Call' : 'Audio Call'} • 
                  {callStatus.status === 'ringing' ? ' Ringing...' : ` ${callStatus.duration}`}
                </p>
              </div>
            </div>
          </div>

          {/* Video container (only for video calls) */}
          {callStatus.type === 'video' && (
            <div className="relative w-full h-40 bg-gray-900">
              {/* Remote video (full size) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-2 right-2 w-20 h-28 rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Call controls */}
          <div className="p-3 flex items-center justify-center gap-4">
            {/* Mute Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`p-3 rounded-full shadow-lg transition-colors ${
                isMuted 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>

            {/* Video Toggle (only for video calls) */}
            {callStatus.type === 'video' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  !isVideoOn ? 'bg-red-500 text-white' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
                title={isVideoOn ? "Turn off video" : "Turn on video"}
              >
                <Video size={20} />
              </motion.button>
            )}

            {/* End Call Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="End Call"
            >
              <PhoneOff size={20} />
            </motion.button>
          </div>

          {/* Pulsing animation for connecting state */}
          {callStatus.status === 'connecting' && (
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 pointer-events-none"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}