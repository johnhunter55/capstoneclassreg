import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";

export function Home() {
  const [mySchedule, setMySchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchMySchedule = async () => {
      try {
        const response = await fetch(
          "http://localhost:3002/api/auth/my-schedule",
          {
            method: "GET",
            credentials: "include", // Send the cookie!
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule. Are you logged in?");
        }

        const data = await response.json();
        setMySchedule(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySchedule();
  }, []);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Inside your handleDropCourse function...

  const handleDropCourse = async (courseId) => {
    try {
      // 1. Make the request to the backend
      const response = await fetch(
        `http://localhost:3002/api/students/schedule/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      // 2. Check for errors (Our new resilient check!)
      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to drop course.");
        } else {
          throw new Error(
            `Server Error: ${response.status} ${response.statusText}. Check the backend route!`,
          );
        }
      }

      // 3. If successful, remove the course from the local state
      setMySchedule((prevSchedule) =>
        prevSchedule.filter((course) => course._id !== courseId),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Calculate total tuition and credits
  const { totalTuition, totalCredits } = mySchedule.reduce(
    (acc, course) => {
      // The Tuition Cost is a string like "$2,500.00", so we need to parse it.
      const cost = parseFloat(course["Tuition Cost"].replace(/[$,]/g, ""));
      acc.totalTuition += isNaN(cost) ? 0 : cost;
      acc.totalCredits += course["Credit Hours"] || 0;
      return acc;
    },
    { totalTuition: 0, totalCredits: 0 },
  );

  return (
    <div className="flex flex-col items-center flex-1 w-full bg-gray-50 dark:bg-neutral-950/90 p-4 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">
        My Class Schedule
      </h1>

      {isLoading && (
        <p className="text-gray-600 dark:text-gray-400">
          Loading your schedule...
        </p>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="w-full max-w-5xl mb-6 p-4 bg-white dark:bg-neutral-900 rounded-xl shadow-md flex justify-around text-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Total Tuition
              </p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-500">
                ${totalTuition.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Total Credits
              </p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-500">
                {totalCredits}
              </p>
            </div>
          </div>
        </>
      )}
      {!isLoading && !error && mySchedule.length > 0 && (
        <div className="w-full max-w-5xl overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full table-fixed text-left text-gray-700 dark:text-neutral-300 border-collapse transition-colors duration-300">
            <thead className="bg-gray-200 dark:bg-neutral-900 text-gray-800 dark:text-neutral-100 uppercase text-sm transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 w-[15%]">ID</th>
                <th className="px-6 py-4 w-[25%]">Name</th>
                <th className="px-6 py-4 w-[15%]">Classroom</th>
                <th className="px-6 py-4 w-[15%]">Credits</th>
                <th className="px-6 py-4 w-[15%]">Cost</th>
                <th className="px-6 py-4 w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800/50 divide-y divide-gray-200 dark:divide-neutral-700/50 transition-colors duration-300">
              {mySchedule.map((cls) => (
                <React.Fragment key={cls._id}>
                  <tr className="hover:bg-gray-100 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {cls["Course ID"]}
                    </td>
                    <td className="px-6 py-4">{cls["Course Title"]}</td>
                    <td className="px-6 py-4">{cls["Classroom Number"]}</td>
                    <td className="px-6 py-4">{cls["Credit Hours"]}</td>
                    <td className="px-6 py-4">{cls["Tuition Cost"]}</td>
                    <td className="px-6 py-4 flex gap-3 justify-center items-center">
                      <button
                        onClick={() => toggleRow(cls._id)}
                        className="p-2 cursor-pointer text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full transition-all outline-none"
                        title={
                          expandedRow === cls._id
                            ? "Hide Details"
                            : "Show Details"
                        }
                      >
                        {expandedRow === cls._id ? (
                          <FaChevronUp size={18} />
                        ) : (
                          <FaChevronDown size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDropCourse(cls._id)}
                        className="p-2 cursor-pointer bg-rose-900 hover:bg-rose-800 text-white rounded-full transition-all outline-none shadow-md hover:shadow-lg hover:scale-105"
                        title="Drop Course"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === cls._id && (
                    <tr className="bg-gray-100 dark:bg-neutral-900/60 transition-all">
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
                              cls.courseDescription ||
                              "No description provided."}
                          </p>
                          <p>
                            <span className="font-bold text-gray-900 dark:text-white">
                              Capacity:{" "}
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                              {cls.enrolledStudents
                                ? cls.enrolledStudents.length
                                : 0}
                            </span>{" "}
                            / {cls.capacity || cls["Capacity"] || 30}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {mySchedule.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center italic text-gray-500"
                  >
                    You haven't signed up for any classes yet!
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
