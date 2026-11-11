
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Utensils, Mail, Lock, ArrowRight } from "lucide-react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&q=85"
          alt="Delicious food"
        />

        <div className="auth-image-text">
          <h1>Good food brings people together.</h1>
          <p>Your food-loving community is waiting for you!</p>
        </div>
      </div>

      <div className="auth-form-area">
        <Link to="/" className="auth-brand">
          <Utensils /> Foodie<span>Bot</span>
        </Link>

        <div className="auth-form">
          <span className="section-label">WELCOME BACK</span>

          <h2>Let's get you hungry!</h2>
          <p>Log in to continue your food journey.</p>

          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <div className="input-wrap">
              <Mail size={19} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <Lock size={19} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p role="alert" style={{
                color: "#c0392b",
                fontSize: "13px",
                marginTop: "15px"
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>

          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
