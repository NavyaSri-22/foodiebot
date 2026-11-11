
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  Utensils,
  ChefHat
} from "lucide-react";

function Chatbot() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm FoodieBot, your friendly food assistant. 🍕\n\nAsk me about recipes, ingredients, cooking tips, cuisines or meal ideas. What are you craving today?"
    }
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMessage = (text || input).trim();

    if (!userMessage || loading) return;

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userMessage
      }
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://foodiebot-c61x.onrender.com/api/food-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userMessage
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to get a response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text: data.reply
        }
      ]);

    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text: "Sorry! I'm having trouble connecting right now. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Suggest a healthy breakfast",
    "Give me a paneer recipe",
    "How do I make pasta?",
    "Suggest a quick evening snack"
  ];

  return (
    <div className="chatbot-page">

      <header className="chatbot-header">
        <button
          className="chatbot-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={19} />
          Dashboard
        </button>

        <div className="chatbot-brand">
          <div className="chatbot-brand-icon">
            <Utensils size={22} />
          </div>

          <div>
            <h2>FoodieBot</h2>
            <span>Your AI Food Assistant</span>
          </div>
        </div>

        <span className="chatbot-online">
          <span className="online-dot"></span>
          AI Assistant
        </span>
      </header>

      <main className="chatbot-main">

        <section className="chatbot-welcome">
          <div className="chatbot-welcome-icon">
            <Sparkles size={25} />
          </div>

          <h1>What's cooking today?</h1>

          <p>
            Discover recipes, explore flavours and get
            creative food ideas with your AI companion.
          </p>
        </section>

        <section className="chatbot-conversation">

          <div className="chatbot-messages">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.role === "user"
                    ? "user-message"
                    : "bot-message"
                }`}
              >
                {message.role === "bot" && (
                  <div className="chat-message-avatar">
                    <Bot size={19} />
                  </div>
                )}

                <div className="chat-message-content">
                  <span className="chat-sender">
                    {message.role === "user"
                      ? "You"
                      : "FoodieBot"}
                  </span>

                  <p>{message.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message bot-message">
                <div className="chat-message-avatar">
                  <Bot size={19} />
                </div>

                <div className="chat-message-content">
                  <span className="chat-sender">
                    FoodieBot
                  </span>
                  <p>Preparing something delicious...</p>
                </div>
              </div>
            )}

            <div ref={bottomRef}></div>

          </div>

          {messages.length === 1 && (
            <div className="chatbot-suggestions">
              <h3>
                <ChefHat size={18} />
                Try asking me
              </h3>

              <div className="suggestion-list">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="chatbot-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about food..."
              disabled={loading}
              maxLength={1000}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </form>

          <p className="chatbot-disclaimer">
            FoodieBot is an AI food assistant. Its responses
            may not always be accurate.
          </p>

        </section>

      </main>
    </div>
  );
}

export default Chatbot;
