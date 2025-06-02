"use client";

import React, { useState } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const questions = [
  "What is your company name?",
  "What industry is your company in?",
  "How many employees do you have?",
  "What challenges are you facing in managing your customer relationships?",
  "What features are you looking for in a CRM platform?",
  "What is your budget for a CRM solution?",
  "How soon are you planning to implement a CRM?",
  "What is your email address? (So we can follow up)", // Added email question
];

const Chatbot = () => {
  const [chat, setChat] = useState([{ sender: 'bot', text: questions[0] }]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isEmailCollected, setIsEmailCollected] = useState(false);

  const handleSend = () => {
    if (userInput.trim() === '') return;

    const newChat = [...chat, { sender: 'user', text: userInput }];
    setUserInput('');

    // Check if this is the email question (last question)
    if (currentQuestionIndex === questions.length - 2) {
      setIsEmailCollected(true);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      newChat.push({ sender: 'bot', text: questions[nextQuestionIndex] });
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      newChat.push({ sender: 'bot', text: "Thank you for the information. We'll get back to you soon!" });

      // Collect all answers
      const userAnswers = questions.map((question, index) => ({
        question,
        response: newChat.filter(msg => msg.sender === 'user')[index]?.text || "No response",
      }));
      //@ts-ignore
      setAnswers(userAnswers);

      // Send email with answers to backend
      sendEmail(userAnswers);
    }

    setChat(newChat);
  };

  const sendEmail = async (userAnswers: any) => {
    try {
      // Extract email from answers (it will be the last answer)
      const emailAnswer = userAnswers.find(
        (answer: any) => answer.question === "What is your email address? (So we can follow up)"
      );
      const userEmail = emailAnswer?.response || "No email provided";

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers,
          userEmail,
        }),
      });

      const data = await response.json();
      if (data.message) {
        console.log('Email sent successfully');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-2 right-4 bg-purple-500 p-3 rounded-lg shadow-lg dark:bg-black text-white"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>

      {isOpen && (
        <div className="z-[200] fixed bottom-16 right-4 w-80 h-96 bg-white dark:bg-black p-4 shadow-xl rounded-lg overflow-hidden">
          <div className="flex items-center mb-4">
            <Image src="/../../assets/chatbot.avif" alt="Bot Avatar" width={40} height={40} className="rounded-full" />
            <h3 className="ml-2 text-lg font-semibold">LeadBot</h3>
          </div>

          <div className="flex-1 overflow-y-auto mb-4" style={{ height: '70%' }}>
            {chat.map((item, index) => (
              <div key={index} className={`mb-2 ${item.sender === 'bot' ? 'text-left' : 'text-right'}`}>
                <p className={`inline-block px-4 py-2 rounded-lg ${item.sender === 'bot' ? 'dark:bg-black-200' : 'bg-purple-500 text-white'}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center border-t">
            <input
              type={isEmailCollected ? "email" : "text"}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isEmailCollected ? "Type your email..." : "Type your answer..."}
              className="flex-1 border-none focus:ring-0 focus:outline-none"
            />
            <Button onClick={handleSend} className="bg-purple-500 text-white ml-2 p-2 rounded-full">
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;