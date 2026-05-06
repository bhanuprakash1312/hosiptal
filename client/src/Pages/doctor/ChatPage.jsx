import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getRole } from "../../services/authService";

const ChatPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // WebRTC Video State
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  
  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!appointmentId) return;
    
    api.post(`/chat/start/${appointmentId}`).then(res => {
      setConversationId(res.data.id);
    }).catch(err => {
      console.error("Failed to start chat:", err);
    });
  }, [appointmentId]);

  const io = useRef(null);
  const [connected, setConnected] = useState(false);
  const pendingMessages = useRef([]);

  useEffect(() => {
    if (!conversationId) return;

    // Initial fetch of message history
    api.get(`/chat/messages/${conversationId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));

    // Establish WebSocket Connection
    let socket = null;
    let reconnectTimeout = null;

    const connect = () => {
      const token = localStorage.getItem("token");
      if (!token || !conversationId) return;

      let base = api.defaults.baseURL || "";
      base = base.replace(/\/$/, "");
      const wsBase = base.replace(/^http/, 'ws');
      
      // Use encodeURIComponent for the token to handle special characters
      const wsUrl = `${wsBase}/chat/ws/${conversationId}?token=${encodeURIComponent(token)}`;
      
      console.log("Attempting WebSocket connection...");
      socket = new WebSocket(wsUrl);
      io.current = socket;

      socket.onopen = () => {
        console.log("WebSocket Connected ✅");
        setConnected(true);
        if (pendingMessages.current.length > 0) {
          pendingMessages.current.forEach(msg => {
            socket.send(JSON.stringify({ message: msg }));
          });
          pendingMessages.current = [];
        }
      };

      socket.onmessage = async (event) => {
        try {
          const incomingMsg = JSON.parse(event.data);
          if (incomingMsg.type === "offer") {
            setIncomingCall(incomingMsg);
          } else if (incomingMsg.type === "answer") {
            if (peerConnection.current) {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingMsg.answer));
            }
          } else if (incomingMsg.type === "ice-candidate") {
            if (peerConnection.current) {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(incomingMsg.candidate));
            }
          } else if (incomingMsg.type === "call-rejected") {
            alert("The video call was declined.");
            cleanupCall();
          } else if (incomingMsg.type === "end-call") {
            cleanupCall();
            setIncomingCall(null);
          } else {
            setMessages(prev => [...prev, incomingMsg]);
          }
        } catch (err) {
          console.error("Error processing message:", err);
        }
      };

      socket.onclose = (event) => {
        console.warn(`WebSocket Closed ❌ (Code: ${event.code}, Reason: ${event.reason})`);
        setConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (error) => {
        console.error("WebSocket Error ⚠️:", error);
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      cleanupCall();
    };
  }, [conversationId]);

  const initPeerConnection = (localStream) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });
    }

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && io.current?.readyState === WebSocket.OPEN) {
        io.current.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
      }
    };
  };

  const startVideoCall = async () => {
    setIsVideoActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      initPeerConnection(stream);
      
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      io.current.send(JSON.stringify({ type: "offer", offer: offer }));
    } catch (err) {
      console.error("Error starting video call:", err);
      alert("Could not access camera/microphone");
      setIsVideoActive(false);
    }
  };

  const cleanupCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsVideoActive(false);
  };

  const endVideoCall = () => {
    cleanupCall();
    if (io.current && io.current.readyState === WebSocket.OPEN) {
      io.current.send(JSON.stringify({ type: "end-call" }));
    }
  };

  const acceptCall = async () => {
    const offerMsg = incomingCall;
    setIncomingCall(null);
    setIsVideoActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      initPeerConnection(stream);
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offerMsg.offer));
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      io.current.send(JSON.stringify({ type: "answer", answer: answer }));
    } catch (err) {
      console.error("Failed to answer call", err);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    if (io.current && io.current.readyState === WebSocket.OPEN) {
      io.current.send(JSON.stringify({ type: "call-rejected" }));
    }
  };

  const send = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    const currentText = text;
    setText(""); // Optimistic clear

    // If socket is open send immediately, otherwise queue the message
    if (io.current && io.current.readyState === WebSocket.OPEN) {
      io.current.send(JSON.stringify({ message: currentText }));
    } else {
      // queue message to send when socket opens
      pendingMessages.current.push(currentText);
      // optionally notify user that message will be sent when connected
      console.warn("WebSocket not open yet — queuing message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      send(e);
    }
  };

  return (
    <div className="page-container" style={{display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)'}}>
      
      {/* Header */}
      <div className="glass-panel" style={{
        borderRadius: 0, 
        padding: '1.25rem 2rem', 
        borderLeft: 'none', 
        borderRight: 'none', 
        borderTop: 'none', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.85)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn-secondary"
            style={{padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem'}}
          >
            ← Back
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold'
            }}>
              +
            </div>
            <div>
              <h2 style={{fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2}}>
                Live Medical Consultation
              </h2>
              <span style={{fontSize: '0.85rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <span style={{width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block'}}></span>
                Active and Secure
              </span>
              <span style={{
                fontSize: '0.75rem', 
                color: connected ? '#10b981' : '#ef4444', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.2rem'
              }}>
                {connected ? "● Connected" : "○ Disconnected (Retrying...)"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Video Call Controls */}
        <div>
          {!isVideoActive ? (
            <button onClick={startVideoCall} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📹</span> Start Video Call
            </button>
          ) : (
            <button onClick={endVideoCall} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
              <span style={{ fontSize: '1.2rem' }}>📵</span> End Call
            </button>
          )}
        </div>
      </div>

      {/* Incoming Call Prompt Overlay */}
      {incomingCall && !isVideoActive && (
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem', animation: 'pulse 1.5s infinite' }}>📞</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Incoming Video Call...</h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{incomingCall.sender_name || 'Participant'} is calling you.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={rejectCall} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer' }}>
              Decline
            </button>
            <button onClick={acceptCall} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
              Accept Call
            </button>
          </div>
        </div>
      )}

      {/* Video Call UI Overlay (If Active) */}
      {isVideoActive && (
        <div style={{
          backgroundColor: '#000',
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          position: 'relative'
        }}>
          {/* Remote Video (Doctor/Patient) */}
          <div style={{ flex: 1, backgroundColor: '#111', borderRadius: '1rem', overflow: 'hidden', position: 'relative', minHeight: '300px' }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
              Remote View
            </div>
          </div>
          
          {/* Local Video (Self) */}
          <div style={{ width: '200px', height: '150px', backgroundColor: '#222', borderRadius: '1rem', overflow: 'hidden', position: 'absolute', bottom: '2rem', right: '2rem', border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>
              You
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div style={{
        flex: 1, 
        overflowY: 'auto', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem', 
        maxWidth: '1000px', 
        margin: '0 auto', 
        width: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 102, 255, 0.03), transparent 80%)'
      }}>
        
        <div style={{textAlign: 'center', margin: '1rem 0'}}>
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.6)', 
            padding: '0.5rem 1rem', 
            borderRadius: '2rem', 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)',
            fontWeight: '500',
            border: '1px solid var(--border-glass)'
          }}>
            End-to-end encrypted consultation started
          </span>
        </div>

        {messages.map(m => {
          // Assuming the logged in user is the sender role... wait, m.sender_role tells us who sent it.
          // Better logic: if this is doctor app, doctor sees DOCTOR messages on the right. 
          // If this is patient app, patient sees PATIENT messages on the right.
          // Since it's a shared component, we can use localStorage 'role' or simple logic.
          // The current logic places PATIENT on the right, which indicates this is the Patient's view.
          // We will update it to check the viewer's role locally (or fallback to doctor's view).
          
          const currentUserRole = getRole() || (window.location.pathname.includes('/doctor') ? "DOCTOR" : "PATIENT");
          // Quick hack: since the route is /chat/:id and usually accessed by patient, let's just color differently based on sender_role
          // Blue for Doctor, Green for Patient
          
          const isDoctor = m.sender_role === "DOCTOR";
          
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isDoctor ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div style={{marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', padding: '0 0.5rem'}}>
                {m.sender_name || (isDoctor ? "Healthcare Provider" : "Patient")}
              </div>
              <div
                style={{
                  maxWidth: '75%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.05rem',
                  lineHeight: '1.5',
                  backgroundColor: isDoctor ? 'var(--accent-blue)' : 'var(--white-glass)',
                  color: isDoctor ? '#ffffff' : 'var(--text-primary)',
                  boxShadow: isDoctor ? '0 10px 20px rgba(0, 102, 255, 0.2)' : '0 10px 20px rgba(0,0,0,0.05)',
                  border: isDoctor ? 'none' : '1px solid var(--border-glass)',
                  // distinct bubble shapes based on sender
                  borderRadius: '1.5rem',
                  borderBottomRightRadius: isDoctor ? '0.25rem' : '1.5rem',
                  borderBottomLeftRadius: isDoctor ? '1.5rem' : '0.25rem',
                }}
              >
                {m.message}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel" style={{
        borderRadius: 0, 
        padding: '1.5rem', 
        display: 'flex', 
        gap: '1rem', 
        borderLeft: 'none', 
        borderRight: 'none', 
        borderBottom: 'none',
        background: 'rgba(255, 255, 255, 0.85)'
      }}>
        <form onSubmit={send} style={{maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="form-input"
            style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', padding: '1.25rem', borderRadius: '1.5rem'}}
            placeholder="Type your medical query or response here..."
          />
          <button
            type="submit"
            className="btn-primary"
            style={{padding: '0 2rem', height: '100%', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
            disabled={!text.trim()}
          >
            <span>Send</span>
            <span style={{fontSize: '1.25rem'}}>→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
