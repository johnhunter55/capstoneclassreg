import React, { useState, useEffect } from "react";
// NEW: Import your icons here!
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";

export function Signup() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState([]);
  // NEW: Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all available courses
        const coursesRes = await fetch("http://localhost:3002/api/courses", {
          method: "GET",
          credentials: "include",
        });

        // 2. Fetch the user's current schedule
        const scheduleRes = await fetch(
          "http://localhost:3002/api/auth/my-schedule",
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!coursesRes.ok || !scheduleRes.ok) {
          throw new Error("Failed to fetch data. Are you logged in?");
        }

        const coursesData = await coursesRes.json();
        const scheduleData = await scheduleRes.json();

        // 3. Extract just the IDs of the courses the user is enrolled in
        const myIds = scheduleData.map((course) => course._id);

        setCourses(coursesData);
        setEnrolledIds(myIds); // <-- Save them to state!
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // NEW: Function to toggle the details dropdown
  const toggleRow = (id) => {
    // If clicking the row that's already open, close it. Otherwise, open the new one.
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleAddCourse = async (courseId) => {
    try {
      const response = await fetch(
        "http://localhost:3002/api/auth/add-course",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ courseId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add course.");
      }

      // NEW: Add the ID to the local state so the button vanishes instantly!
      setEnrolledIds((prevIds) => [...prevIds, courseId]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 w-full bg-gray-50 dark:bg-neutral-950/90 px-8 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white my-2 transition-colors duration-300">
        Select the classes u want to take!
      </h1>

      <input
        type="text"
        value={searchQuery} // Tie input to state
        onChange={(e) => setSearchQuery(e.target.value)} // Update state on type
        className="p-2 pl-4 mb-4 rounded-2xl my-1 border border-transparent bg-neutral-700/50 hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none transition-all w-1/2 text-white"
        placeholder="Search by ID or Name..."
      />

      {isLoading && <p className="text-white mb-4">Loading courses...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isLoading && !error && (
        <div className="w-full max-w-5xl overflow-x-auto rounded-xl shadow-lg">
          {/* 1. Add 'table-fixed' to the main table class */}
          <table className="w-full table-fixed text-left text-gray-700 dark:text-neutral-300 border-collapse transition-colors duration-300">
            <thead className="bg-gray-200 dark:bg-neutral-900 text-gray-800 dark:text-neutral-100 uppercase text-sm transition-colors duration-300">
              <tr>
                {/* 2. Add specific widths to each column so they stay exactly this size */}
                <th className="px-6 py-4 w-[15%]">ID</th>
                <th className="px-6 py-4 w-[25%]">Name</th>
                <th className="px-6 py-4 w-[15%]">Classroom</th>
                <th className="px-6 py-4 w-[15%]">Credits</th>
                <th className="px-6 py-4 w-[15%]">Cost</th>
                <th className="px-6 py-4 w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            {/* ... keep your tbody exactly the same! */}
            <tbody className="bg-white dark:bg-neutral-800/50 divide-y divide-gray-200 dark:divide-neutral-700/50 transition-colors duration-300">
              {courses
                .filter((cls) => {
                  const search = searchQuery.toLowerCase();
                  const name = cls["Course Title"]?.toLowerCase() || "";
                  const id = cls["Course ID"]?.toLowerCase() || "";
                  return name.includes(search) || id.includes(search);
                })
                .map((cls) => (
                  <React.Fragment key={cls._id}>
                    {/* MAIN ROW */}
                    <tr className="hover:bg-gray-100 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {cls["Course ID"]}
                      </td>
                      <td className="px-6 py-4">{cls["Course Title"]}</td>
                      <td className="px-6 py-4">{cls["Classroom Number"]}</td>
                      <td className="px-6 py-4">{cls["Credit Hours"]}</td>
                      <td className="px-6 py-4">{cls["Tuition Cost"]}</td>

                      {/* NEW: Action Buttons with React Icons */}
                      <td className="px-6 py-4 flex gap-3 justify-center items-center">
                        {/* Details Toggle Button */}
                        <button
                          onClick={() => toggleRow(cls._id)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full transition-all outline-none"
                          title={
                            expandedRow === cls._id
                              ? "Hide Details"
                              : "Show Details"
                          }
                        >
                          {/* If the row is open, show UP arrow. If closed, show DOWN arrow */}
                          {expandedRow === cls._id ? (
                            <FaChevronUp size={18} />
                          ) : (
                            <FaChevronDown size={18} />
                          )}
                        </button>

                        {/* Add Course Button OR Enrolled Badge */}
                        {enrolledIds.includes(cls._id) ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-xs font-bold tracking-wide shadow-sm">
                            Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddCourse(cls._id)}
                            className="p-2 bg-rose-900 hover:bg-rose-800 text-white rounded-full transition-all outline-none shadow-md hover:shadow-lg hover:scale-105"
                            title="Add Course"
                          >
                            <FaPlus size={16} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* DETAILS ROW (Only shows if this specific row's ID matches the expandedRow state) */}
                    {expandedRow === cls._id && (
                      <tr className="bg-gray-100 dark:bg-neutral-900/60 transition-all">
                        {/* colSpan="6" makes this cell stretch across the entire table width */}
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-sm border-t border-gray-200 dark:border-neutral-700/50"
                        >
                          <div className="flex flex-col gap-2">
                            <p>
                              <span className="font-bold text-gray-900 dark:text-white">
                                Course Description:{" "}
                              </span>
                              {cls["Course Description"] ||
                                "No description provided."}
                            </p>
                            <p>
                              <span className="font-bold text-gray-900 dark:text-white">
                                Capacity:{" "}
                              </span>
                              {cls["Capacity"] || "N/A"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
