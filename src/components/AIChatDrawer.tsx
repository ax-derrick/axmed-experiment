import { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Tooltip, message } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  LoadingOutlined,
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../context/ChatContext';

const { TextArea } = Input;

// User name can be passed as prop or configured here
const USER_NAME = 'there';

export function AIChatDrawer() {
  const { messages, isOpen, isLoading, closeChat, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filter out the welcome message for display
  const displayMessages = messages.filter((m) => m.id !== 'welcome');
  const hasMessages = displayMessages.length > 0;

  // Scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, hasMessages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue;
      setInputValue('');
      await sendMessage(userMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('Copied to clipboard');
  };

  return (
    <Drawer
      title={
        <div className="chat-drawer-title">
          <div className="chat-drawer-logo">
            <RobotOutlined />
          </div>
          <span>Axmed AI</span>
        </div>
      }
      placement="right"
      width={480}
      onClose={closeChat}
      open={isOpen}
      className="chat-drawer chat-drawer-v2"
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: '#fff',
        },
      }}
    >
      {!hasMessages ? (
        /* Initial state - centered input with greeting */
        <div className="chat-initial-state">
          <div className="chat-initial-content">
            <div className="chat-initial-greeting">
              <h2>Hi {USER_NAME}</h2>
              <p>How can I help you today?</p>
            </div>
            <div className="chat-initial-input-wrapper">
              <TextArea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="chat-input-v2"
                disabled={isLoading}
              />
              <Button
                type="text"
                icon={isLoading ? <LoadingOutlined spin /> : <SendOutlined />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="chat-send-btn-v2"
              />
            </div>
            <div className="chat-initial-disclaimer">
              Axmed AI can make mistakes. Verify important info.
            </div>
          </div>
        </div>
      ) : (
        /* Conversation state - messages with input at bottom */
        <>
          <div className="chat-messages-v2">
            {displayMessages.map((msg) => (
              <div key={msg.id} className={`chat-msg chat-msg-${msg.sender}`}>
                {msg.sender === 'user' ? (
                  <div className="chat-msg-user-bubble">{msg.content}</div>
                ) : (
                  <div className="chat-msg-ai-container">
                    <div className="chat-msg-ai-header">
                      <div className="chat-msg-ai-avatar">
                        <RobotOutlined />
                      </div>
                    </div>
                    <div className="chat-msg-ai-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div className="chat-msg-ai-actions">
                      <Tooltip title="Copy">
                        <button
                          className="chat-action-btn"
                          onClick={() => handleCopy(msg.content)}
                        >
                          <CopyOutlined />
                        </button>
                      </Tooltip>
                      <Tooltip title="Regenerate">
                        <button className="chat-action-btn">
                          <ReloadOutlined />
                        </button>
                      </Tooltip>
                      <div className="chat-action-divider" />
                      <Tooltip title="Good response">
                        <button className="chat-action-btn">
                          <LikeOutlined />
                        </button>
                      </Tooltip>
                      <Tooltip title="Bad response">
                        <button className="chat-action-btn">
                          <DislikeOutlined />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="chat-msg chat-msg-ai">
                <div className="chat-msg-ai-container">
                  <div className="chat-msg-ai-header">
                    <div className="chat-msg-ai-avatar">
                      <RobotOutlined />
                    </div>
                  </div>
                  <div className="chat-msg-ai-content chat-msg-loading">
                    <LoadingOutlined spin style={{ marginRight: 8 }} />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area-v2">
            <div className="chat-input-wrapper">
              <TextArea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tell AI what to do next"
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="chat-input-v2"
                disabled={isLoading}
              />
              <Button
                type="text"
                icon={isLoading ? <LoadingOutlined spin /> : <SendOutlined />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="chat-send-btn-v2"
              />
            </div>
            <div className="chat-input-footer">
              <span className="chat-disclaimer-v2">
                Axmed AI can make mistakes. Verify important info.
              </span>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
