
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  MapPin,
  ChefHat,
  Users,
  Sparkles,
  Utensils,
  Heart,
  Star
} from "lucide-react";

import Navbar from "../components/Navbar";

function Landing() {
  const features = [
    {
      icon: <MessageCircle />,
      title: "Chat with Friends",
      description:
        "Connect with friends, discuss food and share your favourite restaurant discoveries."
    },
    {
      icon: <Sparkles />,
      title: "AI Foodie Assistant",
      description:
        "Get smart food suggestions and discover recipes based on ingredients you have."
    },
    {
      icon: <MapPin />,
      title: "Nearby Restaurants",
      description:
        "Explore restaurants around you and discover amazing places recommended by friends."
    },
    {
      icon: <ChefHat />,
      title: "Smart Recipes",
      description:
        "Find delicious recipes, explore new cuisines and save your favourite dishes."
    },
    {
      icon: <Users />,
      title: "Food Community",
      description:
        "Join food-loving communities, share experiences and exchange recommendations."
    },
    {
      icon: <Heart />,
      title: "Save Your Favourites",
      description:
        "Keep your favourite restaurants, recipes and food discoveries together."
    }
  ];

  const categories = [
    {
      name: "Biryani",
      image: "photo-1563379091339-03246963d96c"
    },
    {
      name: "Pizza",
      image: "photo-1513104890138-7c749659a591"
    },
    {
      name: "Desserts",
      image: "photo-1488477181946-6428a0291777"
    },
    {
      name: "Healthy Food",
      image: "photo-1512621776951-a57141f2eefd"
    }
  ];

  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={16} />
            YOUR NEW FOOD DISCOVERY PARTNER
          </div>

          <h1>
            Good Food.
            <br />
            Great Friends.
            <br />
            <span>Better Discoveries.</span>
          </h1>

          <p className="hero-description">
            Discover delicious recipes, chat with your food-loving
            friends, explore nearby restaurants and let AI help
            you decide what to eat next.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Explore FoodieBot <ArrowRight size={19} />
            </Link>

            <Link to="/login" className="secondary-btn">
              Already a member?
            </Link>
          </div>

          <div className="hero-trust">
            <div className="avatar-stack">
              <span>🍕</span>
              <span>🍔</span>
              <span>🍜</span>
            </div>
            <p>
              Made for people who <strong>love food!</strong>
            </p>
          </div>
        </div>

        <div className="hero-image-area">
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=85"
              alt="Delicious fresh food bowl"
            />
          </div>

          <div className="floating-card floating-top">
            <span className="floating-icon">🤖</span>
            <div>
              <strong>AI Foodie</strong>
              <small>What's cooking today?</small>
            </div>
          </div>

          <div className="floating-card floating-bottom">
            <span className="floating-icon">📍</span>
            <div>
              <strong>Discover Nearby</strong>
              <small>Find your next favourite place</small>
            </div>
          </div>

          <div className="hero-decoration">✳</div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-label">WHAT MAKES US SPECIAL</span>
          <h2>Everything Foodies Need</h2>
          <p>
            More than a food app. It's a place to discover,
            connect and share your love for food.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section" id="categories">
        <div className="section-heading">
          <span className="section-label">EXPLORE YOUR CRAVINGS</span>
          <h2>What Are You Craving?</h2>
          <p>Discover something delicious today.</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div className="category-card" key={category.name}>
              <img
                src={`https://images.unsplash.com/${category.image}?w=600&q=80`}
                alt={category.name}
                loading="lazy"
              />
              <div className="category-overlay">
                <h3>{category.name}</h3>
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI section */}
      <section className="ai-section" id="about">
        <div className="ai-content">
          <span className="section-label">MEET YOUR FOOD COMPANION</span>
          <h2>Can't Decide What to Eat?</h2>
          <p>
            Meet your AI Foodie assistant! Tell it what ingredients
            you have, what you love to eat or what you are craving.
            Get delicious suggestions instantly.
          </p>

          <Link to="/register" className="primary-btn">
            Meet Your AI Foodie <ArrowRight size={19} />
          </Link>
        </div>

        <div className="ai-visual">
          <div className="ai-circle">
            <span>🤖</span>
          </div>
          <div className="ai-message">
            <Sparkles size={17} />
            Hey foodie! What shall we cook today?
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <Star size={25} fill="currentColor" />
        <h2>Your Next Food Adventure Starts Here!</h2>
        <p>Join FoodieBot and make every food discovery memorable.</p>
        <Link to="/register" className="cta-btn">
          Join FoodieBot <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <Utensils size={21} />
          <strong>Foodie<span>Bot</span></strong>
        </div>
        <p>Discover Food. Chat with Friends. Eat Happy.</p>
        <small>© 2026 FoodieBot. Made with ❤️ for food lovers.</small>
      </footer>
    </div>
  );
}

export default Landing;
