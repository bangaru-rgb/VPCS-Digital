// src/agent/VPCSAgent.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAgent } from './useAgent';
import './VPCSAgent.css';

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const lines = msg.content.split('\n');

  return (
    <div className={`vpcs-agent-bubble ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <span className="vpcs-agent-avatar">🤖</span>}
      <div className="vpcs-agent-text">
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </div>
      {isUser && <span className="vpcs-agent-avatar user-avatar">👤</span>}
    </div>
  );
}

export default function VPCSAgent({ currentModule = 'default' }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage, clearMessages } = useAgent(currentModule);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Summary this month",
    "Show inflows this month",
    "List all materials",
  ];

  return (
    <>
      <button
        className={`vpcs-agent-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="VPCS Assistant"
      >
        {open ? '✕' : <span style={{fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.2, textAlign: 'center'}}>VP<br/>CS</span>}
      </button>

      {open && (
        <div className="vpcs-agent-panel">
          <div className="vpcs-agent-header">
            <span>VPCS Assistant</span>
            <button className="vpcs-agent-clear" onClick={clearMessages} title="Clear chat">
              🗑
            </button>
          </div>

          <div className="vpcs-agent-messages">
            {messages.length === 0 && (
              <div className="vpcs-agent-empty">
                <p>Hi! Ask me anything about your business data.</p>
                <div className="vpcs-agent-suggestions">
                  {suggestions.map((s, i) => (
                    <button key={i} className="vpcs-agent-suggestion" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="vpcs-agent-bubble assistant">
                <span className="vpcs-agent-avatar">🤖</span>
                <div className="vpcs-agent-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="vpcs-agent-input-row">
            <input
              ref={inputRef}
              className="vpcs-agent-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about cash flow, materials..."
              disabled={loading}
            />
            <button
              className="vpcs-agent-send"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
