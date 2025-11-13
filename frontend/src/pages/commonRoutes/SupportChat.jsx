import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'

const SupportChat = () => {
  const user = useSelector((store) => store.user)
  const [initialChat, setInitialChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    getInitialChat()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getInitialChat = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/chat/initialChat', {
        credentials: 'include'
      })

      const data = await res.json()
      
      if (data.success === false) {
        setInitialChat(null)
      } else {
        setInitialChat(data)
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTicketHandler = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/chat/generate-ticket', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        alert('Ticket not generated. Try again!!')
        return
      }
      
      const data = await res.json()
      setInitialChat(data)
      setMessages(data.messages || [])
      setIsOpen(true)
    } catch (error) {
      console.error('Error generating ticket:', error)
      alert('Failed to generate ticket')
    } finally {
      setLoading(false)
    }
  }

  const sendMessageHandler = async () => {
    if (!newMessage.trim() || !initialChat || sending) return
    
    setSending(true)
    const messageToSend = newMessage.trim()
    setNewMessage('')

    try {
      const res = await fetch(`http://localhost:3000/chat/sendMessage/${initialChat.ticketId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageToSend })
      })

      const data = await res.json()
      
      if (data.success === false) {
        alert('Failed to send message')
        setNewMessage(messageToSend)
        return
      }

      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
      setNewMessage(messageToSend)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen && !initialChat) {
    return (
      <div style={styles.fabContainer}>
        <button style={styles.fab} onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Chat Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.supportAvatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a10 10 0 0 0-10 10v3a4 4 0 0 0 4 4h1v-6H6a1 1 0 0 1-1-1v-1a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1h-1v6h1a4 4 0 0 0 4-4v-3A10 10 0 0 0 12 1z" />
            </svg>
          </div>
          <div>
            <h3 style={styles.headerTitle}>RideEase Support</h3>
            <div style={styles.statusIndicator}>
              <span style={styles.statusDot}></span>
              <span style={styles.statusText}>Available 24/7</span>
            </div>
          </div>
        </div>
        <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Chat Body */}
      <div style={styles.body}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading...</p>
          </div>
        ) : !initialChat ? (
          <div style={styles.welcomeScreen}>
            <div style={styles.welcomeIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 style={styles.welcomeTitle}>Welcome to RideEase Support</h2>
            <p style={styles.welcomeText}>
              Our support team is here to help you 24/7. Click below to start a conversation.
            </p>
            <button style={styles.startButton} onClick={generateTicketHandler}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Start Conversation
            </button>
            <div style={styles.features}>
              <div style={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Quick Response</span>
              </div>
              <div style={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M12 1a10 10 0 0 0-10 10v3a4 4 0 0 0 4 4h1v-6H6a1 1 0 0 1-1-1v-1a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1h-1v6h1a4 4 0 0 0 4-4v-3A10 10 0 0 0 12 1z" />
                </svg>
                <span>Expert Support</span>
              </div>
              <div style={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Problem Solved</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {initialChat && (
              <div style={styles.ticketInfo}>
                <span style={styles.ticketLabel}>Ticket ID:</span>
                <span style={styles.ticketId}>#{initialChat.ticketId?.slice(0, 13)}</span>
              </div>
            )}
            
            <div style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div style={styles.emptyMessages}>
                  <p style={styles.emptyText}>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: msg.senderRole === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {msg.senderRole !== 'user' && (
                      <div style={styles.messageAvatar}>S</div>
                    )}
                    <div
                      style={{
                        ...styles.message,
                        ...(msg.senderRole === 'user' ? styles.userMessage : styles.supportMessage)
                      }}
                    >
                      <p style={styles.messageContent}>{msg.content}</p>
                      <span style={styles.messageTime}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* Chat Input */}
      {initialChat && (
        <div style={styles.footer}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler()}
            style={styles.input}
            disabled={sending}
          />
          <button
            onClick={sendMessageHandler}
            style={{
              ...styles.sendButton,
              ...((!newMessage.trim() || sending) ? styles.sendButtonDisabled : {})
            }}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  fabContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000,
  },
  fab: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '400px',
    height: '600px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
  },
  header: {
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  supportAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: '12px',
    opacity: 0.9,
  },
  closeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f9fafb',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  welcomeScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px 32px',
    textAlign: 'center',
  },
  welcomeIcon: {
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  welcomeText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '32px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '500',
  },
  ticketInfo: {
    padding: '12px 24px',
    backgroundColor: '#eef2ff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  ticketLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  ticketId: {
    color: '#6366f1',
    fontWeight: '600',
  },
  messagesContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyMessages: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  messageWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  messageAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  message: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  userMessage: {
    backgroundColor: '#6366f1',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  supportMessage: {
    backgroundColor: 'white',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}

// Add keyframes for spinner animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

export default SupportChat