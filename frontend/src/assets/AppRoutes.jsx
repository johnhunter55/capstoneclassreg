import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Layout } from "../pages/Layout.jsx";
import { Login } from "../pages/Login.jsx";
import { Home } from "../pages/Home.jsx";
import { Signup } from "../pages/Signup.jsx";
import { Admincontrols } from "../pages/Admincontrols.jsx";

// Checks localStorage to see if user is "logged in"
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  const navigate = useNavigate(); // <-- ADDED: Lets us force a redirect if they fail the check

  useEffect(() => {
    const verifyUserSession = async () => {
      // Only hit the database if localStorage thinks the user is already logged in
      if (localStorage.getItem("isAuthenticated") === "true") {
        try {
          const response = await fetch("http://localhost:3002/api/auth/me", {
            method: "GET",
            credentials: "include", // <-- Crucial! Sends the secure httpOnly cookie
          });

          const data = await response.json();

          if (response.ok) {
            // 1. Force localStorage to match the absolute truth of MongoDB
            localStorage.setItem("user", JSON.stringify(data.user));

            // 2. Dispatch event to let Header/Sidebar re-render instantly
            window.dispatchEvent(new Event("storage"));
          } else {
            // 3. Token is expired or missing. Wipe the fake UI state completely.
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("storage"));

            // 4. Kick them back to the login screen
            navigate("/login");
          }
        } catch (error) {
          console.error("Failed to sync session with backend server:", error);
        }
      }
    };

    verifyUserSession();
  }, [navigate]); // Added navigate to the dependency array

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="admin" element={<Admincontrols />} />
      </Route>
    </Routes>
  );
}
