import React from "react";
import { Home } from "./Home.jsx";
import { Header } from "../components/Header.jsx";

export function Layout() {
  return (
    <div>
      <Header />
      <Home />
    </div>
  );
}
