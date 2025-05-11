"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ComingSoon() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black transition-all duration-300">
      <div className="text-center p-6">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full transition-all duration-300"
        >
          {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-800" />}
        </button>

        <p className="text-lg font-medium text-gray-800 dark:text-gray-300">STAY TUNED</p>

        <h1 className="text-6xl font-bold mt-4 text-black dark:text-white">
          <span className="relative inline-block">
            C<span className="bg-black dark:bg-white text-white dark:text-black px-2 rounded-md">OMI</span>NG
          </span>
          <br />
          <span className="relative inline-block">
            S<span className="bg-black dark:bg-white text-white dark:text-black px-2 rounded-md">OO</span>N
          </span>
        </h1>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Prepare to witness greatness in the making.
        </p>

        <p className="mt-4 text-gray-500 dark:text-gray-400">
          www.workeloo.com
        </p>
      </div>
    </div>
  );
}
