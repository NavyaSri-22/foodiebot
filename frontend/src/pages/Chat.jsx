
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

import {
  Send,
  MessageCircle,
  Utensils
} from "lucide-react";

function Chat() {
  const { user } = useAuth();

  const [friends, setFriends] = useState([]);
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Load accepted friends
  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      try {
        const q = query(
          collection(db, "friendships"),
          where("members", "array-contains", user.uid)
        );

        const snapshot = await getDocs(q);

        const friendList = snapshot.docs.map((item) => {
          const data = item.data();

          const otherUid = data.members.find(
            (member) => member !== user.uid
          );

          const details = data.memberProfiles?.[otherUid] || {};

          return {
            uid: otherUid,
            username: details.username || "foodie",
            fullName: details.fullName || "Foodie Friend"
          };
        }).filter((item) => item.uid);

        setFriends(friendList);
      } catch (err) {
        console.error("Friend loading error:", err);
        setError("Unable to load your friends.");
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();
  }, [user]);

  // Listen to selected friend's messages
  useEffect(() => {
    if (!user || !friend) {
      setMessages([]);
      return;
    }

    const conversationId = [user.uid, friend.uid].sort().join("_");

    const messagesQuery = query(
      collection(db, "chats", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );
        setError("");
      },
      (err) => {
        console.error("Chat loading error:", err);
        setError("Unable to load messages.");
      }
    );

    return () => unsubscribe();
  }, [user, friend]);

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !user || !friend || sending) return;

    const conversationId = [user.uid, friend.uid].sort().join("_");

    setSending(true);
    setError("");

    try {
      await addDoc(
        collection(db, "chats", conversationId, "messages"),
        {
          text: message.trim(),
          senderId: user.uid,
          senderName: user.displayName || "Foodie Friend",
          createdAt: serverTimestamp()
        }
      );

      setMessage("");
    } catch (err) {
      console.error("Message sending error:", err);
      setError("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "Sending...";

    return timestamp.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="foodie-chat-page">

      <div className="chat-heading">
        <span>FOODIE COMMUNITY</span>
        <h1>FoodieTalk 🍕</h1>
        <p>Good food, great conversations and lovely friends.</p>
      </div>

      <div className="chat-layout">

        {/* Friends sidebar */}
        <aside className="chat-friends">

          <h2>
            <MessageCircle size={20} />
            My Friends
          </h2>

          {loadingFriends ? (
            <p>Loading friends...</p>
          ) : friends.length === 0 ? (
            <p>Add friends before starting a conversation.</p>
          ) : (
            friends.map((item) => (
              <button
                key={item.uid}
                className={`chat-friend-item ${
                  friend?.uid === item.uid ? "selected" : ""
                }`}
                onClick={() => {
                  setFriend(item);
                  setError("");
                }}
              >
                <span className="chat-avatar">
                  {item.fullName.charAt(0).toUpperCase()}
                </span>

                <span className="chat-friend-info">
                  <strong>{item.fullName}</strong>
                  <small>@{item.username}</small>
                </span>
              </button>
            ))
          )}

        </aside>

        {/* Conversation */}
        <section className="chat-window">

          {!friend ? (
            <div className="chat-empty">
              <Utensils size={45} />
              <h2>Welcome to FoodieTalk!</h2>
              <p>Select a friend to start discussing food.</p>
            </div>
          ) : (
            <>
              <div className="chat-topbar">
                <div className="chat-avatar">
                  {friend.fullName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{friend.fullName}</strong>
                  <span>@{friend.username}</span>
                </div>
              </div>

              <div className="chat-messages">

                {messages.length === 0 ? (
                  <div className="chat-welcome">
                    <Utensils size={35} />
                    <h3>Start a food conversation!</h3>
                    <p>
                      Share restaurant recommendations, ratings,
                      favourite dishes and food experiences.
                    </p>
                  </div>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item.id}
                      className={
                        item.senderId === user.uid
                          ? "chat-message sent"
                          : "chat-message received"
                      }
                    >
                      <p>{item.text}</p>
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                  ))
                )}

              </div>

              <form
                className="chat-input-area"
                onSubmit={sendMessage}
              >
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Talk about your favourite food..."
                  maxLength={1000}
                />

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                >
                  <Send size={19} />
                </button>
              </form>
            </>
          )}

          {error && <p className="chat-error">{error}</p>}

        </section>
      </div>
    </div>
  );
}

export default Chat;
