import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContexts";
import ProtectedRoute from "./contexts/ProtectedRoutes";

import Navbar from "./componenets/NavBar";
import Login from "./auth/login";
import Register from "./auth/register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard";
import MemberCard from "./componenets/MemberCard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/membercard" element = {<MemberCard/>}/>
          <Route path="/home" element={<Home />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admindashboard/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/memberdashboard"
            element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
