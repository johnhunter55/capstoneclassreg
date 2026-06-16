import React from "react";

export function Login() {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-olive-950">
      <form
        id="login-form"
        className="sm:max-w-lg sm:px-15 sm:h-auto sm:py-34 sm:rounded-2xl bg-olive-900 text-amber-50 flex flex-col p-10 w-full h-full pt-20"
      >
        <h2 className="text-2xl/tight font-bold text-olive-300">
          Welcome Back!
        </h2>
        <p className="text-lg mb-10 text-olive-300/80">
          Log back into to your account:
        </p>
        <input
          className="bg-olive-950/50 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-olive-950/80 focus-within:border-olive-950 focus-within:bg-olive-950 focus-within:hover:bg-olive-950 outline-none"
          type="text"
          id="login-name"
          placeholder="name"
          required
        />
        <input
          className="bg-olive-950/50 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-olive-950/80 focus-within:border-olive-950 focus-within:bg-olive-950 focus-within:hover:bg-olive-950 outline-none"
          type="password"
          id="login-password"
          placeholder="Password"
          required
        />
        <p id="login-error" className="text-red-400 text-sm mb-4 hidden">
          Invalid name or password. Please try again.
        </p>
        <button
          className="p-4 bg-olive-800 font rounded-2xl my-5 text-xl hover:bg-olive-700 hover:shadow-2xl cursor-pointer"
          type="submit"
        >
          Login
        </button>
        <p>
          Don't have an account?
          <a className="text-amber-500" href="#" id="show-signup">
            Sign up
          </a>
        </p>
      </form>

      <form
        id="signup-form"
        className="sm:max-w-lg sm:px-15 sm:h-auto sm:py-34 sm:rounded-2xl bg-olive-900 text-amber-50 flex flex-col p-10 w-full h-full pt-20"
        style={{ display: "none" }}
      >
        <h2 className="text-2xl/tight font-bold text-olive-300">Join Us!</h2>
        <p className="text-lg mb-10 text-olive-300/80">
          Create your finance account:
        </p>

        <input
          className="bg-olive-950/50 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-olive-950/80 focus-within:border-olive-950 focus-within:bg-olive-950 focus-within:hover:bg-olive-950 outline-none"
          type="text"
          id="signup-name"
          placeholder="name"
          required
        />
        <input
          className="bg-olive-950/50 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-olive-950/80 focus-within:border-olive-950 focus-within:bg-olive-950 focus-within:hover:bg-olive-950 outline-none"
          type="password"
          id="signup-password"
          placeholder="Password"
          required
        />
        <input
          className="bg-olive-950/50 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-olive-950/80 focus-within:border-olive-950 focus-within:bg-olive-950 focus-within:hover:bg-olive-950 outline-none"
          type="password"
          id="signup-confirm"
          placeholder="Confirm Password"
          required
        />
        <p id="signup-error" className="text-red-400 text-sm mb-4 hidden"></p>

        <button
          className="p-4 bg-olive-800 font rounded-2xl my-5 text-xl hover:bg-olive-700 hover:shadow-2xl cursor-pointer transition-all duration-200"
          type="submit"
        >
          Create Account
        </button>

        <p>
          Already have an account?
          <a className="text-amber-500" href="#" id="show-login">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
