import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
