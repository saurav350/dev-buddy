import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import ChatWindow from './components/ChatWindow.jsx';

const socketUrl = import.meta.env.VITE_API_URL;

function App() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Ready');
  const [connected, setConnected] = useState(false);

  const socket = useMemo(() => io(socketUrl, { autoConnect: false }), []);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
      setStatus('Connected to backend');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setStatus('Disconnected');
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
      setStatus(payload.message);
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
    setStatus('Sending...');
    socket.emit('user_message', { message, conversation: messages });
  };

  return (
    <div className="app-shell">
      <header>
        <h1>AI Coding Assistant</h1>
        <p>{status}</p>
      </header>
      <ChatWindow messages={messages} onSend={sendMessage} connected={connected} />
    </div>
  );
}

export default App;
