import React, { useState, useEffect } from "react";

export function Admincontrols() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null); // Tracks the open row
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // --- STATE FOR CREATING A USER ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "" },
    isAdmin: false,
  });

  const API_BASE_URL = "http://localhost:3002/api/admin";

  const fetchOptions = {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        ...fetchOptions,
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Listen for the Header telling us a new user was created
  useEffect(() => {
    const handleNewUserAdded = (event) => {
      const brandNewUser = event.detail;
      // Add the user to the top of the table instantly
      setUsers((prevUsers) => [brandNewUser, ...prevUsers]);
    };

    window.addEventListener("userAdded", handleNewUserAdded);

    return () => {
      window.removeEventListener("userAdded", handleNewUserAdded);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Expands the row and fetches deep details (to get the populated schedule)
  const toggleExpand = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null); // Close it if it's already open
      return;
    }

    setExpandedUserId(userId);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        ...fetchOptions,
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch deeper user details");
      const detailedUser = await res.json();

      // Update this specific user in our state so we have their populated schedule
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === userId ? detailedUser : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Opens the edit modal
  const handleEditClick = async (user) => {
    // Check if the schedule is just an array of strings (IDs).
    // If so, we need to fetch the populated version first.
    const isSchedulePopulated =
      user.schedule.length === 0 || typeof user.schedule[0] === "object";

    let userToEdit = user;

    if (!isSchedulePopulated) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${user._id}`, {
          ...fetchOptions,
        });
        if (!res.ok) throw new Error("Failed to fetch user details for modal");
        userToEdit = await res.json();

        // Also update the main users state to prevent re-fetching later
        setUsers((prev) =>
          prev.map((u) => (u._id === userToEdit._id ? userToEdit : u)),
        );
      } catch (err) {
        setError(err.message);
        return; // Don't open the modal if the fetch fails
      }
    }

    // Now, open the modal with the fully populated user data
    setSelectedUser({
      ...userToEdit,
      address: userToEdit.address || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
      },
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser._id}`, {
        ...fetchOptions,
        method: "PUT",
        body: JSON.stringify({
          username: selectedUser.username,
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phoneNumber, // Corrected from 'phone'
          address: selectedUser.address, // Now passing full address object!
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Instead of re-fetching all users, just update the one we edited
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === selectedUser._id ? data.user : u)),
      );
      setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        ...fetchOptions,
        method: "PATCH",
        body: JSON.stringify({ isAdmin: !currentRole }),
      });
      if (!res.ok) throw new Error("Failed to change role");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDropCourse = async (userId, courseId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/${userId}/schedule/${courseId}`,
        {
          ...fetchOptions,
          method: "DELETE",
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to drop course");

      // Update the user in the state with the new schedule from the backend response
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === userId ? data.user : u)),
      );
    } catch (err) {
      alert(err.message);
    }
  };
  if (loading)
    return (
      <div className="p-8 text-center text-neutral-600 dark:text-neutral-400 font-semibold text-lg">
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-rose-500 text-center font-bold text-lg">
        {error}
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full transition-colors duration-200">
      <h1 className="text-3xl flex justify-center font-bold mb-6 text-neutral-900 dark:text-white">
        Admin Control Panel
      </h1>
      {/* Users Table Card */}
      <div className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 transition-colors">
                <th className="p-4 w-12"></th>
                {/* Column for the drop-down arrow */}
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">
                  Name
                </th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">
                  Email
                </th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">
                  Role
                </th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300 text-right pr-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <React.Fragment key={user._id}>
                  {/* MAIN ROW */}
                  <tr
                    className={`border-b border-neutral-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors ${expandedUserId === user._id ? "bg-gray-50 dark:bg-neutral-800/50" : ""}`}
                  >
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleExpand(user._id)}
                        className="p-2 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-all"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${expandedUserId === user._id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-neutral-900 dark:text-neutral-100 font-medium">
                      {user.name || user.username}
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-400">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase ${
                          user.isAdmin
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRoleToggle(user._id, user.isAdmin)}
                        className={`${
                          user.isAdmin
                            ? "bg-neutral-800 text-white hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200"
                            : "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                        } px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer`}
                      >
                        {user.isAdmin ? "Revoke" : "Make Admin"}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS ROW */}
                  {expandedUserId === user._id && (
                    <tr className="bg-gray-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                      <td colSpan="5" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column: Contact & Address */}
                          <div>
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                              Profile Details
                            </h3>
                            <div className="space-y-2 text-neutral-700 dark:text-neutral-300 text-sm">
                              <p>
                                <strong className="text-neutral-900 dark:text-white">
                                  Phone:
                                </strong>{" "}
                                {user.phoneNumber || "N/A"}
                              </p>
                              {user.address ? (
                                <p>
                                  <strong className="text-neutral-900 dark:text-white">
                                    Address:
                                  </strong>
                                  <br />
                                  {user.address.street}
                                  <br />
                                  {user.address.city}, {user.address.state}{" "}
                                  {user.address.zipCode}
                                </p>
                              ) : (
                                <p className="italic text-neutral-500">
                                  No address provided
                                </p>
                              )}
                              <p className="mt-2 text-xs">
                                Profile Complete:{" "}
                                {user.fullP ? "✅ Yes" : "❌ No"}
                              </p>
                            </div>
                          </div>

                          {/* Right Column: Schedule */}
                          <div>
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                              Current Schedule
                            </h3>
                            {user.schedule && user.schedule.length > 0 ? (
                              <ul className="space-y-2">
                                {user.schedule.map((course) => (
                                  <li
                                    key={course._id}
                                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-xl flex justify-between items-center shadow-sm"
                                  >
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                      {course["Course Title"]}
                                    </span>
                                    <span
                                      onClick={() =>
                                        handleDropCourse(user._id, course._id)
                                      }
                                      title="Drop course for user"
                                      className="text-xs text-rose-500 font-bold cursor-pointer hover:text-rose-700 transition"
                                    >
                                      Drop
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm italic text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                This user is not registered for any classes.
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 transition-colors max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
              Edit Account Settings
            </h2>

            <form
              onSubmit={handleProfileUpdate}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Basic Info
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Username
                    </label>
                    <input
                      type="text"
                      value={selectedUser.username || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          username: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={selectedUser.name || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          name: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={selectedUser.email || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={selectedUser.phoneNumber || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    Address
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Street
                    </label>
                    <input
                      type="text"
                      value={selectedUser.address?.street || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          address: {
                            ...selectedUser.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        City
                      </label>
                      <input
                        type="text"
                        value={selectedUser.address?.city || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            address: {
                              ...selectedUser.address,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        State
                      </label>
                      <input
                        type="text"
                        value={selectedUser.address?.state || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            address: {
                              ...selectedUser.address,
                              state: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={selectedUser.address?.zipCode || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          address: {
                            ...selectedUser.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Schedule in Modal */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-3">
                    Current Schedule
                  </h3>
                  {selectedUser.schedule && selectedUser.schedule.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedUser.schedule.map((course) => (
                        <li
                          key={course._id}
                          className="text-sm text-neutral-700 dark:text-neutral-300 p-2 bg-gray-50 dark:bg-neutral-800/50 rounded-lg"
                        >
                          {course.title ||
                            course["Course Title"] ||
                            "Unknown Course"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-neutral-500">
                      No classes.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 text-white px-4 py-3 rounded-xl hover:bg-rose-700 font-bold transition-colors shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
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
