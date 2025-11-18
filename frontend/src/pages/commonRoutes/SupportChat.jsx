import { useEffect, useState, useRef } from "react";
import { createSocketConnection } from "../../utils/Socket/socket";
import "../../styles/common/supportChat.css";

const SupportChat = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    const socket = createSocketConnection();
    socketRef.current = socket;

    fetchUserChats();

    socketRef.current.on('FE-receive-message-from-support', (sentMessage) => {
      setMessages(prev => [...prev, sentMessage])
    })
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const fetchUserChats = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/chat/userChats", {
        credentials: "include",
      });
      const data = await res.json();

      setChatList(data || []);
    } catch (err) {
      console.error("Fetch user chats failed:", err);
    }
    setLoading(false);
  };


  const openChat = async (chat) => {
    setSelectedChat(chat);
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/chat/getChat/${chat._id}`,
        { credentials: "include" }
      );
      const data = await res.json();

      setMessages(data.messages || []);
      socketRef.current.emit("BE-join-chat", data);
    } catch (err) {
      console.error("Fetch chat failed:", err);
    }
    setLoading(false);
  };

  
  const generateTicket = async () => {
    if (sending) return;
    setSending(true);

    try {
      const res = await fetch(
        "http://localhost:3000/chat/generate-ticket",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (data.success === false) {
        alert("Failed to generate support ticket.");
      } else {
        fetchUserChats();
        openChat(data);
        socketRef.current.emit("BE-generate-ticket", data);
      }
    } catch (err) {
      console.error("Generate ticket failed:", err);
    }

    setSending(false);
  };

  
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedChat) return;

    const msg = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const res = await fetch(
        `http://localhost:3000/chat/sendMessage/${selectedChat.ticketId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        }
      );

      const data = await res.json();

      if (data.success === false) {
        setNewMessage(msg);
      } else {
        // setMessages(data.chat.messages);
        const sentMessage = data.sentMessage
        const dataToSend = {
          sentMessage,
          ticketId: selectedChat.ticketId,
          chatId: selectedChat._id
        }
        socketRef.current.emit("BE-send-message-to-support", dataToSend);
      }
    } catch (err) {
      setNewMessage(msg);
    }

    setSending(false);
  };

  const closeTicket = async () => {
    try {

      const res = await fetch(
        `http://localhost:3000/chat/close-ticket/${selectedChat.ticketId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        alert("Failed to close support ticket.")
        return
      }

      setSelectedChat(null)
      fetchUserChats();

    } catch (error) {

    }
  }

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="sc-container">
      {/* LEFT SIDEBAR */}
      <div className="sc-sidebar">
        <div className="sc-header">
          <h2>Your Support Tickets</h2>
        </div>

        {loading && chatList.length === 0 ? (
          <div className="sc-empty">Loading…</div>
        ) : chatList.length === 0 ? (
          <div className="sc-empty">
            <p>No chats found</p>
            <button className="sc-newticket" onClick={generateTicket}>
              Generate Ticket
            </button>
          </div>
        ) : (
          <div className="sc-chatlist">
            {chatList.map((c) => (
              <div
                key={c._id}
                className={`sc-item ${selectedChat?._id === c._id ? "active" : ""
                  }`}
                onClick={() => openChat(c)}
              >
                <div className="sc-avatar">🎫</div>

                <div className="sc-info">
                  <div className="sc-info-header">
                    <span className="sc-ticket">
                      #{c.ticketId.slice(0, 8)}
                    </span>
                    <span className={`sc-status ${c.status}`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="sc-preview">
                    {c.messages?.length
                      ? c.messages[c.messages.length - 1].content.slice(0, 25) +
                      "..."
                      : "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT CHAT BOX */}
      <div className="sc-chatwindow">
        {!selectedChat ? (
          <div className="sc-placeholder">
            <p>Select a ticket to continue</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="sc-chatheader">
              <h3>#{selectedChat.ticketId.slice(0, 12)}</h3>
              <button onClick={closeTicket}>Close ticket</button>
              <span className={`sc-status-badge ${selectedChat.status}`}>
                {selectedChat.status}
              </span>
            </div>

            {/* MESSAGES */}
            <div className="sc-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`sc-msg ${m.senderRole === "user"
                      ? "sc-msg-user"
                      : "sc-msg-support"
                    }`}
                >
                  <div className="sc-msg-text">{m.content}</div>
                  <div className="sc-msg-time">
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            { selectedChat.status === "open" ? ( <div className="sc-inputbox">

              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message…"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
              >
                ➤
              </button>
            </div>)
            : (<button className="sc-newticket" onClick={generateTicket}>
              Generate Ticket
            </button>)}
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChat;
