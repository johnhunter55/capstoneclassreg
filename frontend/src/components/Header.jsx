import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export function Header() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
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
