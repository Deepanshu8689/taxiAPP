import { useEffect, useState, useRef } from 'react'
import '../../styles/admin/adminSupportDashboard.css'
import { createSocketConnection } from '../../utils/Socket/socket'

const AdminSupportDashboard = () => {
  const [activeChats, setActiveChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = createSocketConnection();
    socketRef.current = socket;

    fetchActiveChats()

    socketRef.current.on('FE-generate-ticket', () => {
      // setActiveChats(prev => [...prev, data])
      fetchActiveChats()
    })

    socketRef.current.on('FE-receive-message-from-support', (sentMessage) => {
      setMessages(prev => [...prev, sentMessage])
    })

  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchActiveChats = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/chat/getAllChats', {
        credentials: 'include',
      })
      const data = await res.json()
      setActiveChats(data)
    } catch (err) {
      console.error('Fetch chats failed:', err)
    }
    setLoading(false)
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
      socketRef.current.emit('BE-join-chat', data)
    } catch (err) {
      console.error('Fetch chat failed:', err)
    }
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedChat) return

    const msg = newMessage
    setNewMessage('')
    setSending(true)

    try {
      const res = await fetch(
        `http://localhost:3000/chat/replyToUser/${selectedChat._id}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg })
        }
      )
      const data = await res.json()

      if (data.success === false) {
        setNewMessage(msg)
      } else {
        // setMessages(data.chat.messages || [])
        const sentMessage = data.sentMessage
        const dataToSend = {
          sentMessage,
          ticketId: selectedChat.ticketId,
          chatId: selectedChat._id
        }
        socketRef.current.emit('BE-reply-to-user', dataToSend);
      }
    } catch (err) {
      console.error('Send message failed:', err)
      setNewMessage(msg)
    }

    setSending(false)
  }

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const formatDate = (t) => {
    const d = new Date(t)
    const today = new Date()
    const yest = new Date(today)
    yest.setDate(today.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yest.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="asd-container">
      {/* LEFT SIDEBAR */}
      <div className="asd-sidebar">
        <div className="asd-sidebar-header">
          <h2>Support Chats</h2>
          <span className="asd-count">{activeChats.length}</span>
        </div>

        <div className="asd-chatlist">
          {loading && activeChats.length === 0 ? (
            <div className="asd-empty">Loading chats...</div>
          ) : activeChats.length === 0 ? (
            <div className="asd-empty">
              <p>No active chats</p>
            </div>
          ) : (
            activeChats.map((c) => (
              <div
                key={c._id}
                className={`asd-chatitem ${
                  selectedChat?._id === c._id ? 'active' : ''
                }`}
                onClick={() => openChat(c)}
              >
                <div className="asd-avatar">{c.name?.[0] || 'U'}</div>

                <div className="asd-chatinfo">
                  <div className="asd-chatinfo-header">
                    <span className="asd-ticket">#{c.ticketId?.slice(0, 13)}</span>
                    {c.messages?.length > 0 && (
                      <span className="asd-time">
                        {formatTime(c.messages[c.messages.length - 1].createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="asd-preview">
                    {c.messages?.length
                      ? c.messages[c.messages.length - 1].content.slice(0, 30) + '...'
                      : 'No messages yet'}
                  </p>
                </div>

                {c.unreadCount > 0 && (
                  <span className="asd-unread">{c.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div className="asd-chatwindow">
        {!selectedChat ? (
          <div className="asd-placeholder">
            <p>Select a chat</p>
          </div>
        ) : (
          <>
            <div className="asd-chatheader">
              <div className="asd-chatheader-left">
                <div className="asd-avatar small">
                  {selectedChat.name?.[0] || 'U'}
                </div>
                <div>
                  <h3>#{selectedChat.ticketId.slice(0, 13)}</h3>
                  <span>{selectedChat.name}</span>
                </div>
              </div>
            </div>

            <div className="asd-messages">
              {messages.map((m, i) => {
                const showDate =
                  i === 0 ||
                  formatDate(messages[i - 1].createdAt) !==
                    formatDate(m.createdAt)

                return (
                  <div key={i}>
                    {showDate && (
                      <div className="asd-date">
                        <span>{formatDate(m.createdAt)}</span>
                      </div>
                    )}

                    <div
                      className={`asd-message-wrapper ${
                        m.senderRole === 'support' ? 'sent' : 'received'
                      }`}
                    >
                      <div className="asd-message">
                        <p>{m.content}</p>
                        <span>{formatTime(m.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div ref={messagesEndRef} />
            </div>

            <div className="asd-inputbox">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} disabled={!newMessage.trim() || sending}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminSupportDashboard
