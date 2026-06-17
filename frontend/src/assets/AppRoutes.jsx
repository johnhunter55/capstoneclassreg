import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "../pages/Layout.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />} />
    </Routes>
  );
}
