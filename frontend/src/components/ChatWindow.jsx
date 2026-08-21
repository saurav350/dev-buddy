import { useState } from 'react';

function ChatWindow({ messages, onSend, connected }) {
  const [input, setInput] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Status:</span>
        <strong>{connected ? 'Online' : 'Offline'}</strong>
      </div>
      <div className="chat-log">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message chat-${message.role}`}>
            <div className="chat-label">{message.role}</div>
            <pre>{message.text}</pre>
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the assistant to inspect or modify the target project..."
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
