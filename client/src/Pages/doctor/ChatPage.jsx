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
    const [debugLog, setDebugLog] = useState([]);

    const addLog = (msg) => {
      setDebugLog(prev => [...prev.slice(-5), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const connect = () => {
      const token = localStorage.getItem("token");
      if (!token) return addLog("No token found");
      if (!conversationId) return addLog("No convo ID");

      let base = api.defaults.baseURL || "";
      // Clean up base URL
      base = base.trim().replace(/\/+$/, "");
      
      // Force WSS if on HTTPS
      let wsBase = base.replace(/^http/, 'ws');
      if (window.location.protocol === "https:") {
        wsBase = wsBase.replace(/^ws:/, 'wss:');
      }

      const wsUrl = `${wsBase}/chat/ws/${conversationId}?token=${encodeURIComponent(token)}`;
      
      addLog(`Connecting...`);
      
      try {
        socket = new WebSocket(wsUrl);
        io.current = socket;

        socket.onopen = () => {
          addLog("Connected ✅");
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
              setMessages(prev => {
                const exists = prev.some(m => m.id === incomingMsg.id || (m.tempId && m.tempId === incomingMsg.tempId));
                if (exists) return prev.map(m => (m.tempId === incomingMsg.tempId ? incomingMsg : m));
                return [...prev, incomingMsg];
              });
            }
          } catch (err) {
            console.error("Error processing message:", err);
          }
        };

        socket.onclose = (event) => {
          addLog(`Closed ❌ (Code: ${event.code})`);
          setConnected(false);
          reconnectTimeout = setTimeout(connect, 4000);
        };

        socket.onerror = (error) => {
          addLog("Connection Error ⚠️");
        };
      } catch (err) {
        addLog(`Crashed: ${err.message}`);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      cleanupCall();
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (text.trim()) {
      const tempMsg = {
        id: Date.now(),
        tempId: Date.now(),
        message: text,
        sender_role: "ME",
        created_at: new Date().toISOString(),
        type: "chat"
      };

      setMessages(prev => [...prev, tempMsg]);

      if (connected && io.current && io.current.readyState === WebSocket.OPEN) {
        io.current.send(JSON.stringify({ message: text, tempId: tempMsg.tempId }));
        setText("");
      } else {
        pendingMessages.current.push(text);
        setText("");
        addLog("Msg queued (offline)");
      }
    }
  };

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
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      send(e);
    }
  };

  return (
    <div className="page-container" style={{display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden'}}>
      
      {/* Header */}
      <div className="glass-panel" style={{
        borderRadius: 0, 
        padding: 'clamp(0.75rem, 3vw, 1.25rem) clamp(1rem, 5vw, 2rem)', 
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
        <div style={{display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flex: 1}}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn-secondary"
            style={{padding: '0.4rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.85rem'}}
          >
            ←
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{
              width: 'clamp(30px, 8vw, 40px)', height: 'clamp(30px, 8vw, 40px)', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold'
            }}>
              +
            </div>
            <div>
              <h2 style={{fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: '800', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2}}>
                Consultation
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                <div style={{
                  backgroundColor: connected ? '#10b981' : '#ef4444',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                }}></div>
                <span style={{fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)'}}>
                  {connected ? 'Online' : 'Reconnecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Call Controls */}
        <div style={{display: 'flex', gap: '0.5rem'}}>
          {!isVideoActive ? (
            <button 
              onClick={startVideoCall} 
              className="btn-primary" 
              style={{ 
                padding: '0.6rem', 
                borderRadius: '50%', 
                width: '45px', 
                height: '45px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
              title="Start Video Call"
            >
              📹
            </button>
          ) : (
            <button 
              onClick={endVideoCall} 
              style={{ 
                backgroundColor: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50%', 
                width: '45px', 
                height: '45px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
              title="End Call"
            >
              📵
            </button>
          )}
        </div>
      </div>

      {/* Diagnostic Log (Small overlay) */}
      {debugLog.length > 0 && !connected && (
        <div style={{
          position: 'fixed', top: '70px', left: '10px', right: '10px', 
          fontSize: '0.65rem', color: '#666', zIndex: 100,
          fontFamily: 'monospace', background: 'rgba(245, 245, 245, 0.9)', 
          padding: '5px', borderRadius: '4px', pointerEvents: 'none'
        }}>
          {debugLog.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}

      {/* Incoming Call Prompt Overlay */}
      {incomingCall && !isVideoActive && (
        <div style={{
          position: 'fixed', top: '10px', left: '10px', right: '10px', zIndex: 1000,
          backgroundColor: '#3b82f6', color: 'white', padding: '1rem',
          borderRadius: '1rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📞</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Incoming Call</h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.8rem' }}>Patient Calling...</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={rejectCall} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.85rem' }}>Reject</button>
            <button onClick={acceptCall} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.85rem' }}>Accept</button>
          </div>
        </div>
      )}

      {/* Video Call UI Overlay */}
      {isVideoActive && (
        <div style={{
          backgroundColor: '#000',
          height: '40vh',
          display: 'flex',
          position: 'relative'
        }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <video ref={localVideoRef} autoPlay playsInline muted style={{ 
            width: 'clamp(100px, 30vw, 180px)', height: 'clamp(75px, 22vw, 135px)', 
            backgroundColor: '#222', borderRadius: '0.75rem', overflow: 'hidden', 
            position: 'absolute', bottom: '1rem', right: '1rem', 
            border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' 
          }} />
        </div>
      )}

      {/* Chat Area */}
      <div style={{
        flex: 1, 
        overflowY: 'auto', 
        padding: 'clamp(1rem, 4vw, 2rem)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {messages.map(m => {
          const isMe = m.sender_role === "ME" || (m.sender_role === (window.location.pathname.includes('/doctor') ? "DOCTOR" : "PATIENT"));
          
          return (
            <div key={m.id} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%'
            }}>
              <div style={{
                maxWidth: '85%', padding: '0.75rem 1rem', fontSize: '0.95rem',
                backgroundColor: isMe ? 'var(--accent-blue)' : 'var(--white-glass)',
                color: isMe ? '#ffffff' : 'var(--text-primary)',
                borderRadius: '1.25rem',
                borderBottomRightRadius: isMe ? '0.2rem' : '1.25rem',
                borderBottomLeftRadius: isMe ? '1.25rem' : '0.2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                {m.message}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: 'clamp(0.75rem, 3vw, 1.25rem)', 
        background: 'rgba(255, 255, 255, 0.9)', 
        borderTop: '1px solid var(--border-glass)',
        paddingBottom: 'calc(clamp(0.75rem, 3vw, 1.25rem) + env(safe-area-inset-bottom))'
      }}>
        <form onSubmit={send} style={{maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', gap: '0.75rem'}}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="form-input"
            style={{flex: 1, padding: '0.8rem 1.2rem', borderRadius: '2rem', fontSize: '0.95rem'}}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="btn-primary"
            style={{width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}
            disabled={!text.trim()}
          >
            →
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
