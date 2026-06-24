import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowDropDown } from "react-icons/md";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);

  // 1. State to hold the form inputs
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // 2. Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Send the data to your backend
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Decide which URL to hit based on the toggle
    const endpoint = isLogin
      ? "http://localhost:3002/api/auth/login"
      : "http://localhost:3002/api/auth/signup";

    // Basic validation for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setErrorMsg("Passwords do not match!");
    }

    // FIXED: Construct a clean body depending on if we are logging in or signing up
    const payload = isLogin
      ? {
          username: formData.username,
          password: formData.password,
        }
      : {
          username: formData.username, // Passes username into the required database 'name' field
          email: formData.email,
          password: formData.password,
          adminCode: formData.adminCode,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- FIXED: Tells browser to capture secure cookie payload
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch (error) {
      setErrorMsg("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-neutral-900">
      <form
        onSubmit={handleAuthSubmit}
        className="sm:max-w-lg sm:px-15 sm:h-auto sm:py-34 sm:rounded-2xl bg-rose-900 text-amber-50 flex flex-col p-10 w-full h-full pt-20"
      >
        <h2 className="text-2xl/tight font-bold text-olive-300">
          {isLogin ? "Welcome Back!" : "Join Us!"}
        </h2>
        <p className="text-lg mb-10 text-olive-300/80">
          {isLogin ? "Log back into your account:" : "Create your account:"}
        </p>

        {/* Only show email field if signing up */}
        {!isLogin && (
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none"
            type="email"
            placeholder="email"
            required={!isLogin}
          />
        )}

        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none"
          type="text"
          placeholder="username"
          required
        />

        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none"
          type="password"
          placeholder="Password"
          required
        />

        {/* Only show confirm password field if signing up */}
        {!isLogin && (
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none"
            type="password"
            placeholder="Confirm Password"
            required={!isLogin}
          />
        )}
        {!isLogin && (
          <div className="flex flex-col mt-2 mb-1">
            {/* The Clickable Toggle */}
            <div
              className="flex items-center text-sm text-olive-300/80 hover:text-olive-300 cursor-pointer transition-colors duration-200 w-fit select-none"
              onClick={() => setClicked(!clicked)}
            >
              <span className="pr-1 font-medium">
                {clicked ? "Cancel admin code" : "Have an admin code?"}
              </span>
              <MdArrowDropDown
                className={`text-lg transition-transform duration-300 ${clicked ? "rotate-180" : ""}`}
              />
            </div>

            {/* The Input Field */}
            {clicked && (
              <input
                name="adminCode"
                value={formData.adminCode} // Fixed: matches your state
                onChange={handleChange}
                className="bg-rose-950 p-2 pl-4 rounded-2xl mt-2 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 outline-none transition-all"
                type="password"
                placeholder="Enter secret admin code"
                // Note: No 'required' attribute here so normal users can still sign up!
              />
            )}
          </div>
        )}

        {/* Display dynamic error message */}
        {errorMsg && (
          <p className="text-red-400 text-sm mt-2 mb-4">{errorMsg}</p>
        )}

        <button
          className="p-4 bg-rose-500 font rounded-2xl my-5 text-xl hover:bg-rose-700/50 hover:shadow-2xl cursor-pointer transition-all duration-200"
          type="submit"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className={isLogin ? "text-orange-500 pl-1" : "text-amber-500 pl-1"}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(""); // Clear errors when switching modes
            }}
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
}
