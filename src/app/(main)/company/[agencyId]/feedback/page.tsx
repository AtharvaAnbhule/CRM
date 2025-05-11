// feedbackForm.js
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function FeedbackForm() {
    const router = useRouter() ; 
  const [rating, setRating] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [email, setEmail] = useState("");
 //@ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, suggestion, email }),
    });

    if (response.ok) {
      setRating(null);
      setSuggestion("");
      setEmail(""); 
      toast.success("Feedback submitted successfully!!!")
      router.push("/company") ; 
    } else {
      alert("Failed to submit feedback.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="dark:bg-black p-8 rounded shadow-lg w-120">
        <h1 className="text-xl font-bold mb-4">How likely are you to recommend our service?</h1>
        <div className="flex justify-between gap-2 mb-4">
          {[...Array(11).keys()].map((num) => (
            <button
              key={num}
              type="button"
              className={`w-8 h-8 rounded-full ${rating === num ? 'bg-purple-600 text-white' : 'dark:bg-black-200'}`}
              onClick={() => setRating(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <p className="mb-4">0 - Extremely Unlikely | 10 - Extremely Likely</p>
        <label className="block mb-2">What feature can we add to improve?</label>
        <textarea
          className="w-full p-2 border rounded mb-4"
          placeholder="We'd love to hear your suggestions"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
        />
        <label className="block mb-2">Email (optional)</label>
        <input
          className="w-full p-2 border rounded mb-4"
          type="email"
          placeholder="Someone@something.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-purple-600 text-white px-4 py-2 rounded w-full">SEND FEEDBACK</button>
      </form>
    </div>
  );
}
