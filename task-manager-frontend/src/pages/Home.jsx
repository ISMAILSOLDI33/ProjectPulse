import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import "./Home.css";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  return (
    <div className="home-container">
      <div className="home-card-container">
        <div className="home-card-title">
          {!isAuthenticated ? (
            <h1>Welcome to Your Task Manager Web App</h1>
          ) : (
            <h1>
              Welcome <span>{user?.username}</span> to Your Task Manager Web App
            </h1>
          )}
        </div>
        <div className="home-card-button">
          {!isAuthenticated ? (
            <Link to="/login" className="link" aria-label="Go to login page">Login</Link>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </div>
    </div>
  );
}