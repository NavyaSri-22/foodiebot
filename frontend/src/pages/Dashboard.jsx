
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Utensils, MessageCircle, ChefHat, MapPin, LogOut } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fffaf3",
      padding: "35px 7%",
      fontFamily: "DM Sans, sans-serif"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h2 style={{ color: "#e98238" }}>
          <Utensils size={23} /> FoodieBot
        </h2>

        <button className="signup-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <section style={{ marginTop: "65px" }}>
        <span className="section-label">YOUR FOOD JOURNEY STARTS HERE</span>

        <h1 style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "42px",
          margin: "15px 0"
        }}>
          Welcome, {user?.displayName || "Foodie"}! 🍕
        </h1>

        <p style={{ color: "#81766a" }}>
          Discover new flavours, connect with friends and explore food.
        </p>
      </section>

      <div className="features-grid" style={{ marginTop: "45px" }}>
          <Link to="/chat" className="feature-card">
          <MessageCircle color="#e98238" size={30} />
          <h3>Chat with Friends</h3>
          <p>Share your favourite food discoveries.</p>
        </Link>

        <Link to="/chatbot" className="feature-card">
          <Utensils color="#e98238" size={30} />
          <h3>AI Foodie Assistant</h3>
          <p>Get smart food and recipe suggestions.</p>
        </Link>

        <Link to="/restaurants" className="feature-card">
          <MapPin color="#e98238" size={30} />
          <h3>Nearby Restaurants</h3>
          <p>Discover amazing places to eat.</p>
        </Link>

        <Link to="/recipes" className="feature-card">
          <ChefHat color="#e98238" size={30} />
          <h3>Smart Recipes</h3>
          <p>Find delicious recipes for every meal.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
