
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Chat from "./pages/Chat";
import Recipes from "./pages/Recipes";
import Restaurants from "./pages/Restaurants";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FriendManagement from "./pages/FriendManagement";
import Chatbot from "./pages/Chatbot";


import ProtectedRoute from "./Routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
        path="/restaurants"
        element={
        <ProtectedRoute>
          <Restaurants />
          </ProtectedRoute>
        }
        />
        <Route
        path="/recipes"
        element={
        <ProtectedRoute>
            <Recipes />
        </ProtectedRoute>
      }
      />
      <Route
      path="/chat"
      element={
      <ProtectedRoute>
        <Chat />
        </ProtectedRoute>
      }
      />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
