import { useState } from "react";
import { Modal } from "./Modal.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useNavigate, NavLink } from "react-router-dom";

export function Header() {
  const linkStyles = ({ isActive }) => {
    const baseStyles =
      "p-1 px-4 rounded-2xl text-lg transition-all duration-200 cursor-pointer";

    const activeStyles =
      "bg-rose-600 dark:bg-rose-700 text-white font-bold shadow-md";

    const inactiveStyles =
      "bg-rose-800 dark:bg-rose-950 text-rose-200 hover:bg-rose-700/50 hover:text-white";

    return `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`;
  };

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // 1. Safely grab the full user object and parse out the username
  const getUsername = () => {
    const storedUserString = localStorage.getItem("user");

    // Protect against empty storage or the literal "undefined" string
    if (!storedUserString || storedUserString === "undefined") {
      return "User";
    }

    try {
      const parsedUser = JSON.parse(storedUserString);
      return parsedUser.username || "User"; // Returns the username
    } catch (error) {
      return "User";
    }
  };

  const userName = getUsername();

  const handleLogout = () => {
    // 2. FIXED: Clear the "user" object from storage instead of "userName"
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <div className="relative">
        <header className="flex justify-between items-center bg-white dark:bg-neutral-900 p-3 px-4 transition-colors shadow-sm dark:shadow-none border-b dark:border-neutral-800">
          <h1
            onClick={() => setShowModal(!showModal)}
            className="text-2xl font-bold text-neutral-900 dark:text-white cursor-pointer select-none bg-gray-100 dark:bg-neutral-800 px-6 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {userName}
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-white bg-rose-800 px-4 py-2 rounded-xl hover:bg-rose-700 cursor-pointer font-semibold"
            >
              Logout
            </button>
          </div>
        </header>
        {showModal && <Modal onClose={() => setShowModal(false)} />}
      </div>
      <div className="p-3 flex gap-2">
        <NavLink to="/" className={linkStyles} end>
          Dashboard
        </NavLink>
        <NavLink to="/signup" className={linkStyles}>
          Sign Up
        </NavLink>
        <NavLink to="/admin" className={linkStyles}>
          Admin Control
        </NavLink>
      </div>
    </div>
  );
}
