import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export function Header() {
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
    <div className="relative">
      <header className="flex justify-between items-center bg-white dark:bg-neutral-900 p-4 transition-colors shadow-sm dark:shadow-none border-b dark:border-neutral-800">
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
  );
}
