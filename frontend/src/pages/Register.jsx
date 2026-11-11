
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Utensils, User, Mail, Lock, ArrowRight
} from "lucide-react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser
} from "firebase/auth";

import {
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim().toLowerCase();
    const fullName = form.fullName.trim();

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError(
        "Username must contain 3–20 characters (letters, numbers or underscores)."
      );
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    let newUser = null;

    try {
      // Create Firebase Authentication account
      const credential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      newUser = credential.user;

      await updateProfile(newUser, {
        displayName: fullName
      });

      // Save username and user profile atomically
      await runTransaction(db, async (transaction) => {
        const usernameRef = doc(db, "usernames", username);
        const userRef = doc(db, "users", newUser.uid);

        const usernameSnapshot = await transaction.get(usernameRef);

        if (usernameSnapshot.exists()) {
          throw new Error("USERNAME_ALREADY_EXISTS");
        }

        transaction.set(usernameRef, {
          uid: newUser.uid,
          username: username
        });

        transaction.set(userRef, {
          uid: newUser.uid,
          fullName: fullName,
          username: username,
          email: newUser.email,
          bio: "",
          photoURL: "",
          favouriteCuisines: [],
          createdAt: serverTimestamp()
        });
      });

      navigate("/dashboard");
    } catch (err) {
      // Remove the newly created auth account if profile creation fails
      if (newUser) {
        try {
          await deleteUser(newUser);
        } catch (cleanupError) {
          console.error("Account cleanup error:", cleanupError);
        }
      }

      console.error("Registration error:", err);

      if (err.message === "USERNAME_ALREADY_EXISTS") {
        setError("This username is already taken. Choose another.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Check your internet connection.");
      } else {
        setError(
          err.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image register-image">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=85"
          alt="Delicious food"
        />

        <div className="auth-image-text">
          <h1>Every foodie belongs here.</h1>
          <p>Discover, share, chat and celebrate great food together.</p>
        </div>
      </div>

      <div className="auth-form-area">
        <Link to="/" className="auth-brand">
          <Utensils /> Foodie<span>Bot</span>
        </Link>

        <div className="auth-form">
          <span className="section-label">
            JOIN OUR FOOD COMMUNITY
          </span>

          <h2>Create your account!</h2>
          <p>Start your delicious journey with FoodieBot.</p>

          <form onSubmit={handleRegister}>
            <label>Full Name</label>
            <div className="input-wrap">
              <User size={19} />
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <label>Username</label>
            <div className="input-wrap">
              <User size={19} />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                minLength={3}
                maxLength={20}
                required
              />
            </div>

            <label>Email Address</label>
            <div className="input-wrap">
              <Mail size={19} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <Lock size={19} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                minLength={6}
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
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Already a member? <Link to="/login">Log In</Link>
          </p>

          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
