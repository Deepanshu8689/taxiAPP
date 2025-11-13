import { useEffect, useState, useRef } from 'react'

const AdminSupportDashboard = () => {
  const [activeChats, setActiveChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchActiveChats()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchActiveChats = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/chat/getAllChats', {
        credentials: 'include',
      })
      const data = await res.json()
      setActiveChats(data)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const openChat = async (chat) => {
    setSelectedChat(chat)
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/chat/getChat/${chat._id}`, {
        credentials: 'include',
      })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return
    
    setSending(true)
    const messageToSend = newMessage.trim()
    setNewMessage('')

    try {
      const res = await fetch(`http://localhost:3000/chat/replyToUser/${selectedChat._id}`, {
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Support Chats</h2>
          <span style={styles.chatCount}>{activeChats.length}</span>
        </div>

        <div style={styles.chatList}>
          {loading && activeChats.length === 0 ? (
            <div style={styles.loadingState}>Loading chats...</div>
          ) : activeChats.length === 0 ? (
            <div style={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p style={styles.emptyText}>No active chats</p>
            </div>
          ) : (
            activeChats.map((chat) => (
              <div
                key={chat._id}
                style={{
                  ...styles.chatItem,
                  ...(selectedChat?._id === chat._id ? styles.chatItemActive : {})
                }}
                onClick={() => openChat(chat)}
              >
                <div style={styles.chatAvatar}>
                  {chat.name?.charAt(0) || 'U'}
                </div>
                <div style={styles.chatInfo}>
                  <div style={styles.chatHeader}>
                    <span style={styles.chatName}>#{chat.ticketId?.slice(0, 13)}</span>
                    {chat.messages?.length > 0 && (
                      <span style={styles.chatTime}>
                        {formatTime(chat.messages[chat.messages.length - 1]?.createdAt)}
                      </span>
                    )}
                  </div>
                  <p style={styles.chatPreview}>
                    {chat.messages?.length > 0 
                      ? chat.messages[chat.messages.length - 1]?.content.slice(0, 30) + '...'
                      : 'No messages yet'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span style={styles.unreadBadge}>{chat.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatContainer}>
        {selectedChat ? (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                <div style={styles.chatHeaderAvatar}>
                  {selectedChat.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 style={styles.chatHeaderTitle}>
                    #{selectedChat.ticketId?.slice(0, 13)}
                  </h3>
                  <span style={styles.chatHeaderSubtitle}>
                    {selectedChat.name || 'User'}
                  </span>
                </div>
              </div>
              <span style={styles.statusBadge}>
                <span style={styles.statusDot}></span>
                Active
              </span>
            </div>

            <div style={styles.messagesContainer}>
              {loading ? (
                <div style={styles.loadingMessages}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={styles.noMessages}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p style={styles.noMessagesText}>No messages yet</p>
                  <p style={styles.noMessagesSubtext}>Start the conversation by sending a message</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const showDate = index === 0 || 
                      formatDate(messages[index - 1]?.createdAt) !== formatDate(msg.createdAt)
                    
                    return (
                      <div key={index}>
                        {showDate && (
                          <div style={styles.dateDivider}>
                            <span style={styles.dateText}>{formatDate(msg.createdAt)}</span>
                          </div>
                        )}
                        <div
                          style={{
                            ...styles.messageWrapper,
                            justifyContent: msg.senderRole === 'support' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div
                            style={{
                              ...styles.message,
                              ...(msg.senderRole === 'support' ? styles.messageSent : styles.messageReceived)
                            }}
                          >
                            <p style={styles.messageContent}>{msg.content}</p>
                            <span style={styles.messageTime}>
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div style={styles.inputContainer}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={styles.input}
                disabled={sending}
              />
              <button 
                onClick={sendMessage} 
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
                <span style={styles.sendButtonText}>Send</span>
              </button>
            </div>
          </>
        ) : (
          <div style={styles.placeholder}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p style={styles.placeholderText}>Select a chat to start messaging</p>
            <p style={styles.placeholderSubtext}>Choose a conversation from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    backgroundColor: '#f9fafb',
  },
  sidebar: {
    width: '360px',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  chatCount: {
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
  },
  loadingState: {
    padding: '40px 24px',
    textAlign: 'center',
    color: '#6b7280',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '16px',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '15px',
    margin: 0,
  },
  chatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '1px solid #f3f4f6',
    position: 'relative',
  },
  chatItemActive: {
    backgroundColor: '#eef2ff',
    borderLeft: '3px solid #6366f1',
  },
  chatAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  chatName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
  },
  chatTime: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  chatPreview: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    position: 'absolute',
    right: '24px',
    top: '16px',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'white',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatHeaderAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
  },
  chatHeaderTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  chatHeaderSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#f9fafb',
  },
  loadingMessages: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
  noMessages: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px',
  },
  noMessagesText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    margin: 0,
  },
  noMessagesSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  dateDivider: {
    display: 'flex',
    justifyContent: 'center',
    margin: '24px 0 16px 0',
  },
  dateText: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: '500',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '12px',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    position: 'relative',
  },
  messageSent: {
    backgroundColor: '#6366f1',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  messageReceived: {
    backgroundColor: 'white',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    margin: '0 0 6px 0',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white',
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  sendButtonText: {
    fontSize: '14px',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
  },
  placeholderText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6b7280',
    margin: 0,
  },
  placeholderSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
}

export default AdminSupportDashboard