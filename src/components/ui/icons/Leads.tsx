import React from "react";

const Lead = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Shape (Modified for Lead Representation) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 6.5C3 5.3 3.8 4.2 5 3.8L11 1.8C11.6 1.6 12.4 1.6 13 1.8L19 3.8C20.2 4.2 21 5.3 21 6.5V12C21 17.5 15.4 20.8 13 22C12.4 22.3 11.6 22.3 11 22C8.6 20.8 3 17.5 3 12V6.5Z"
        fill="#C8CDD8"
        className="transition-all"
      />
      {/* User Icon Inside the Shield (Symbolizing Lead) */}
      <circle cx="12" cy="10" r="3" fill="#70799A" />
      <path
        d="M8 17C8 15 10 14 12 14C14 14 16 15 16 17"
        stroke="#70799A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Lead;
