import React from 'react';

const TaskIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V8.41421C21 8.149 20.8946 7.89464 20.7071 7.70711L16.2929 3.29289C16.1054 3.10536 15.851 3 15.5858 3H4Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      <path
        d="M14 3V7C14 7.55228 14.4477 8 15 8H19"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M8 12H16M8 16H12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default TaskIcon;
