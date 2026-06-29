import React, { useState, useEffect } from "react";

export function Home() {
  const [mySchedule, setMySchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMySchedule = async () => {
      try {
        // 🚨 FIXED URL: changed 'add-course' to 'my-schedule'
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

  return (
    <div className="flex flex-col items-center flex-1 w-full bg-gray-50 dark:bg-neutral-950/90 p-8 pt-12 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">
        My Class Schedule
      </h1>

      {isLoading && <p className="text-white mb-4">Loading your schedule...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isLoading && !error && (
        <div className="w-full max-w-5xl overflow-x-auto rounded-xl shadow-lg">
          {/* Re-using the table-fixed class from Signup to prevent jumping */}
          <table className="w-full table-fixed text-left text-gray-700 dark:text-neutral-300 border-collapse transition-colors duration-300">
            <thead className="bg-gray-200 dark:bg-neutral-900 text-gray-800 dark:text-neutral-100 uppercase text-sm transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 w-[20%]">ID</th>
                <th className="px-6 py-4 w-[40%]">Name</th>
                <th className="px-6 py-4 w-[20%]">Classroom</th>
                <th className="px-6 py-4 w-[20%]">Credits</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800/50 divide-y divide-gray-200 dark:divide-neutral-700/50 transition-colors duration-300">
              {mySchedule.map((cls) => (
                <tr
                  key={cls._id}
                  className="hover:bg-gray-100 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {cls["Course ID"]}
                  </td>
                  <td className="px-6 py-4">{cls["Course Title"]}</td>
                  <td className="px-6 py-4">{cls["Classroom Number"]}</td>
                  <td className="px-6 py-4">{cls["Credit Hours"]}</td>
                </tr>
              ))}

              {/* Show a friendly message if their schedule is empty */}
              {mySchedule.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center italic text-gray-500"
                  >
                    You haven't signed up for any classes yet! Go to the Signup
                    page to add some.
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
