import { useState, useEffect } from "react";
import { Modal } from "./Modal.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useNavigate, NavLink } from "react-router-dom";

export function Header() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // --- STATE: NEW USER ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "" },
    isAdmin: false,
    fullP: true,
  });

  // --- STATE: NEW COURSE ---
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseId: "",
    courseTitle: "",
    courseDescription: "",
    classroomNumber: "",
    capacity: 30,
    creditHours: 0,
    tuitionCost: "",
  });

  const linkStyles = ({ isActive }) => {
    const baseStyles =
      "p-1 px-4 rounded-2xl text-lg transition-all duration-200 cursor-pointer";
    const activeStyles =
      "bg-rose-600 dark:bg-rose-700 text-white font-bold shadow-md";
    const inactiveStyles =
      "bg-rose-800 dark:bg-rose-950 text-rose-200 hover:bg-rose-700/50 hover:text-white";

    return `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`;
  };

  useEffect(() => {
    const updateUserState = () => {
      const storedUserString = localStorage.getItem("user");
      if (storedUserString && storedUserString !== "undefined") {
        try {
          setUser(JSON.parse(storedUserString));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    updateUserState();

    const handleProfileUpdate = (event) => {
      localStorage.setItem("user", JSON.stringify(event.detail));
      updateUserState();
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    window.addEventListener("storage", updateUserState);
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", updateUserState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- API: CREATE USER ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3002/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setNewUser({
        username: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        address: { street: "", city: "", state: "", zipCode: "" },
        isAdmin: false,
        fullP: true,
      });
      setIsAddModalOpen(false);

      window.dispatchEvent(new CustomEvent("userAdded", { detail: data.user }));
    } catch (err) {
      alert(err.message);
    }
  };

  // --- API: CREATE COURSE ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3002/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCourse),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");

      setNewCourse({
        courseId: "",
        courseTitle: "",
        courseDescription: "",
        classroomNumber: "",
        capacity: 30,
        creditHours: 0,
        tuitionCost: "",
      });
      setIsAddCourseOpen(false);

      // Dispatch event so your Course Table can update instantly
      window.dispatchEvent(
        new CustomEvent("courseAdded", { detail: data.course }),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="relative">
        <header className="flex justify-between items-center bg-white dark:bg-neutral-900 p-3 px-4 transition-colors shadow-sm dark:shadow-none border-b dark:border-neutral-800">
          <h1
            onClick={() => setShowModal(!showModal)}
            className="text-2xl font-bold text-neutral-900 dark:text-white cursor-pointer select-none bg-gray-100 dark:bg-neutral-800 px-6 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {user?.username || "User"}
          </h1>

          <div className="flex items-center gap-3 md:gap-4">
            {/* --- ADMIN ACTION BUTTONS --- */}
            {user?.isAdmin && (
              <div className="flex items-center gap-2 hidden sm:flex">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 cursor-pointer font-semibold shadow-sm transition-all active:scale-95"
                  title="Add New User"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span className="hidden md:inline">User</span>
                </button>

                <button
                  onClick={() => setIsAddCourseOpen(true)}
                  className="flex items-center gap-2 text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 cursor-pointer font-semibold shadow-sm transition-all active:scale-95"
                  title="Add New Course"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="hidden md:inline">Course</span>
                </button>
              </div>
            )}

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="text-white bg-rose-800 px-4 py-2 rounded-xl hover:bg-rose-700 cursor-pointer font-semibold transition-colors"
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
        {user?.isAdmin && (
          <NavLink to="/admin" className={linkStyles}>
            Admin Control
          </NavLink>
        )}
      </div>

      {/* =========================================
          MODALS PORTALS
      ========================================= */}

      {/* 1. ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 transition-colors max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
              Create New User
            </h2>
            <form
              onSubmit={handleCreateUser}
              className="flex flex-col gap-4 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-500 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Basic Info
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Temporary Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Right Column: Address & Role */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-500 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Address & Roles
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Street
                    </label>
                    <input
                      type="text"
                      value={newUser.address.street}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          address: {
                            ...newUser.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        City
                      </label>
                      <input
                        type="text"
                        value={newUser.address.city}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            address: {
                              ...newUser.address,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        State
                      </label>
                      <input
                        type="text"
                        value={newUser.address.state}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            address: {
                              ...newUser.address,
                              state: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={newUser.address.zipCode}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          address: {
                            ...newUser.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={newUser.isAdmin}
                        onChange={(e) =>
                          setNewUser({ ...newUser, isAdmin: e.target.checked })
                        }
                        className="w-5 h-5 accent-emerald-600 cursor-pointer"
                      />
                      <label
                        htmlFor="isAdmin"
                        className="text-sm font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        Grant Admin Privileges
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 font-bold transition-colors shadow-md cursor-pointer"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD COURSE MODAL */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 transition-colors max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
              Create New Course
            </h2>
            <form
              onSubmit={handleCreateCourse}
              className="flex flex-col gap-4 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Basic Course Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Course Identity
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Course ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., WPD-101"
                      value={newCourse.courseId}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, courseId: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Intro to React Apps"
                      value={newCourse.courseTitle}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          courseTitle: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Course objectives and syllabus overview..."
                      value={newCourse.courseDescription}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          courseDescription: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Logistics & Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Logistics & Requirements
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Classroom Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Tech Lab 3"
                      value={newCourse.classroomNumber}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          classroomNumber: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newCourse.capacity}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            capacity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        Credit Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newCourse.creditHours}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            creditHours: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Tuition Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">
                        $
                      </span>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={newCourse.tuitionCost}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            tuitionCost: e.target.value,
                          })
                        }
                        className="w-full pl-8 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-md cursor-pointer"
                >
                  Publish Course
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
