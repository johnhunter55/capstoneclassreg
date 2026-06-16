import React from "react";
import { Home } from "./Home.jsx";
import { Header } from "../components/Header.jsx";
import { Login } from "./Login.jsx";

export function Layout() {
  return (
    <div>
      <Login />
      {/* <Header />
      <Home /> */}
    </div>
  );
}
