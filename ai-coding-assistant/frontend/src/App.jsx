import { useEffect, useMemo, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import ChatWindow from './components/ChatWindow.jsx';

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APi_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : 'https://dev-buddy-1.onrender.com');

function App() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Connecting to server...');
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const socket = useMemo(() => {
    return io(socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });
  }, []);

  const retryConnect = useCallback(() => {
    setIsConnecting(true);
    setStatus('Retrying connection (waking up cloud server)...');
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  }, [socket]);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      setIsConnecting(false);
      setStatus('Connected to backend');
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      setIsConnecting(false);
      setStatus(`Disconnected (${reason})`);
    });

    socket.on('connect_error', (error) => {
      setConnected(false);
      setIsConnecting(true);
      setStatus('Connecting... (Render backend waking up, takes ~40-60s on free tier)');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      setIsConnecting(true);
      setStatus(`Reconnecting attempt #${attemptNumber}...`);
    });

    socket.on('reconnect', () => {
      setConnected(true);
      setIsConnecting(false);
      setStatus('Reconnected to backend');
    });

    socket.on('assistant_message', (message) => {
      setMessages((current) => [...current, { role: 'assistant', text: message }]);
      setStatus('Assistant replied');
    });

    socket.on('assistant_error', (error) => {
      setMessages((current) => [...current, { role: 'assistant', text: `Error: ${error.message}` }]);
      setStatus('Assistant error');
    });

    socket.on('assistant_status', (payload) => {
      setStatus(payload.message || 'Processing...');
    });

    socket.on('tool_result', (result) => {
      setMessages((current) => [...current, { role: 'tool', text: JSON.stringify(result, null, 2) }]);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = (message) => {
    if (!message) return;

    setMessages((current) => [...current, { role: 'user', text: message }]);
    setStatus('Sending prompt to assistant...');
    socket.emit('user_message', { message, conversation: messages });
  };

  return (
    <div className="app-shell">
      <header>
        <h1>AI Coding Assistant</h1>
        <p className="status-text">{status}</p>
      </header>
      <ChatWindow
        messages={messages}
        onSend={sendMessage}
        connected={connected}
        isConnecting={isConnecting}
        onRetry={retryConnect}
        socketUrl={socketUrl}
      />
    </div>
  );
}

export default App;
