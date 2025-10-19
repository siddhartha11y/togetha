import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, PhoneOff, User } from "lucide-react";
import socketService from "../socket";
import useUserStore from "../store/userStore";
import { toast } from "react-toastify";
import agoraService from "../services/agoraService";

export default function CallNotification({ onCallAccepted }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [ringtone, setRingtone] = useState(null);
  const { user } = useUserStore();
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleIncomingCall = (callData) => {
      console.log("📞 Incoming call:", callData);
      // Force set incoming call to ensure UI updates
      setIncomingCall(null);
      setTimeout(() => setIncomingCall(callData), 10);
      
      // Play ringtone
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.volume = 0.7;
      audio.play().catch(err => {
        console.error("Failed to play ringtone:", err);
        // Silently handle ringtone play failure
      });
      
      ringtoneRef.current = audio;
      setRingtone(audio);
      
      // Stop ringtone after 30 seconds if not answered
      setTimeout(() => {
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
          ringtoneRef.current = null;
          setRingtone(null);
        }
        setIncomingCall(null);
      }, 30000);
    };

    const handleCallEnded = () => {
      console.log("📞 Call ended");
      stopRingtone();
      setIncomingCall(null);
    };

    const handleCallRejected = () => {
      console.log("📞 Call rejected");
      stopRingtone();
      setIncomingCall(null);
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_rejected", handleCallRejected);

    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_rejected", handleCallRejected);
      stopRingtone();
    };
  }, [user]);

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
      setRingtone(null);
    }
  };

  const acceptCall = async () => {
    try {
      stopRingtone();
      
      const socket = socketService.getSocket();
      if (socket && incomingCall) {
        socket.emit("accept_call", {
          callId: incomingCall.callId,
          chatId: incomingCall.chatId,
          accepter: user
        });
        

        
        // Use the global call interface to handle the call
        if (window.globalCallInterface && window.globalCallInterface.handleIncomingCall) {
          await window.globalCallInterface.handleIncomingCall(incomingCall);
                  } else {
            // Fallback: Initialize Agora call directly - much more reliable!
            await agoraService.acceptCall(incomingCall.chatId, incomingCall.callType);
          }
        
        // Notify parent component that call was accepted
        if (onCallAccepted) {
          onCallAccepted(incomingCall);
        }
        
        setIncomingCall(null);
      }
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to start call");
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    stopRingtone();
    
    const socket = socketService.getSocket();
    if (socket && incomingCall) {
      socket.emit("reject_call", {
        callId: incomingCall.callId,
        chatId: incomingCall.chatId,
        rejector: user
      });
      
      toast.info("Call rejected");
      setIncomingCall(null);
    }
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
          />
          
          {/* Call notification */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl z-[9999] min-w-[400px] border-4 border-white/30"
          >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              {incomingCall.caller?.profilePicture && 
               incomingCall.caller.profilePicture !== "/images/default-avatar.png" ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${incomingCall.caller.profilePicture}`}
                  alt={incomingCall.caller.fullName || incomingCall.caller.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {(incomingCall.caller?.fullName || incomingCall.caller?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl mb-2">
                {incomingCall.caller?.fullName || incomingCall.caller?.username || 'Unknown User'}
              </h3>
              <p className="text-purple-100 text-base font-medium flex items-center gap-2">
                {incomingCall.callType === 'video' ? (
                  <>
                    <Video size={18} />
                    Incoming video call
                  </>
                ) : (
                  <>
                    <Phone size={18} />
                    Incoming audio call
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={rejectCall}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
              title="Reject Call"
            >
              <PhoneOff size={24} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={acceptCall}
              className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg"
              title="Accept Call"
            >
              {incomingCall.callType === 'video' ? (
                <Video size={24} />
              ) : (
                <Phone size={24} />
              )}
            </motion.button>
          </div>

          {/* Subtle glow effect instead of blinking */}
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 pointer-events-none"
          />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

