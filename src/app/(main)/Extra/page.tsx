"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Subscript, Superscript,
  Undo, Redo, Eraser, Download, Copy, ClipboardPaste, Scissors,
  Highlighter, Paintbrush, Square, Circle, Minus, ArrowRight, Asterisk,
  TextCursor, Pencil, Move, MousePointer2, ImageIcon, Send, ArrowLeft,
  Triangle
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import axios from "axios";



const EditorWithChatbot = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<string[]>([]);
const [showNotes, setShowNotes] = useState(false);

const insertShape = (type: string) => {
  const wrapper = document.createElement("div");
  wrapper.contentEditable = "false";
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.margin = "10px";
  wrapper.style.resize = "both";
  wrapper.style.overflow = "auto";
  wrapper.style.width = "100px";
  wrapper.style.height = "100px";
  wrapper.setAttribute("draggable", "true");

  const shape = document.createElement("div");
  shape.style.width = "100%";
  shape.style.height = "100%";
  shape.style.border = "2px solid #ddd"; // Light gray border
  shape.style.backgroundColor = "rgba(255, 255, 255, 0.1)"; // Light transparent bg
  shape.style.backdropFilter = "blur(4px)"; // Optional: subtle style for dark mode

  switch (type) {
    case "square":
      break;
    case "circle":
      shape.style.borderRadius = "50%";
      break;
    case "triangle":
      shape.style.width = "0";
      shape.style.height = "0";
      shape.style.borderLeft = "50px solid transparent";
      shape.style.borderRight = "50px solid transparent";
      shape.style.borderBottom = "100px solid #ddd";
      shape.style.border = "none"; // Override border for triangle
      break;
    case "arrow":
      shape.innerHTML = "➤";
      shape.style.fontSize = "48px";
      shape.style.textAlign = "center";
      shape.style.color = "#ddd"; // Light text for visibility
      shape.style.border = "none";
      break;
    case "star":
      shape.innerHTML = "★";
      shape.style.fontSize = "48px";
      shape.style.textAlign = "center";
      shape.style.color = "#ddd"; // Light color
      shape.style.border = "none";
      break;
    default:
      break;
  }

  wrapper.appendChild(shape);
  editorRef.current?.appendChild(wrapper);
};



  const [messages, setMessages] = useState([{ role: "bot", text: "👤 Hello, how can I help?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const applyFormat = (command: string, value: string | null = null) => {
    if (command === "custom" && value) {
      insertShape(value);
    } else {
      //@ts-ignore
      document.execCommand(command, false, value);
    }
  };
  
  const COHERE_API_KEY = "rI8PURz0a6JliOwgrLiILRJNHdNgXlFQzZfrShhi";

  const fetchCohereResponse = async (userMessage: string) => {
    try {
      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          model: "command",
          prompt: userMessage,
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.generations[0].text.trim();
    } catch (error) {
      console.error("Cohere API error:", error);
      return "Sorry, I couldn't process that.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    const botResponse = await fetchCohereResponse(input);
    setIsTyping(false);
    setMessages([...newMessages, { role: "bot", text: botResponse }]);
  };

  const saveNoteToDB = async () => {
    const htmlContent = editorRef.current?.innerHTML || "";

  await fetch("/api/note", {
    method: "POST",
    body: JSON.stringify({
      content: htmlContent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // example: 7 days from now
    }),
  });
  };
  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editorRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const wrapper = document.createElement("div");
      wrapper.contentEditable = "false";
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.style.margin = "10px";
      wrapper.style.resize = "both";
      wrapper.style.overflow = "auto";
      wrapper.style.width = "200px";
      wrapper.style.height = "auto";
      wrapper.setAttribute("draggable", "true");

      const img = document.createElement("img");
      img.src = e.target?.result as string;
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.pointerEvents = "none";

      wrapper.appendChild(img);
      editorRef.current?.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/note");
      setNotes(res.data.map((n: any) => n.content));
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

 

  const downloadStyledPDF = async () => {
    if (!editorRef.current) return;

    const images = Array.from(editorRef.current.getElementsByTagName("img"));
    await Promise.all(images.map(img => {
      return new Promise(resolve => {
        if (img.complete) resolve(true);
        else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        }
      });
    }));


   
    
    const canvas = await html2canvas(editorRef.current, {
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
    pdf.save("styled-document.pdf");
  };

  const toolbarButtons = [
    { Icon: Bold, cmd: "bold", label: "Bold" },
    { Icon: Italic, cmd: "italic", label: "Italic" },
    { Icon: Underline, cmd: "underline", label: "Underline" },
    { Icon: Strikethrough, cmd: "strikethrough", label: "Strikethrough" },
    { Icon: Subscript, cmd: "subscript", label: "Subscript" },
    { Icon: Superscript, cmd: "superscript", label: "Superscript" },
    { Icon: AlignLeft, cmd: "justifyLeft", label: "Align Left" },
    { Icon: AlignCenter, cmd: "justifyCenter", label: "Align Center" },
    { Icon: AlignRight, cmd: "justifyRight", label: "Align Right" },
    { Icon: AlignJustify, cmd: "justifyFull", label: "Justify Text" },
    { Icon: List, cmd: "insertUnorderedList", label: "Bullet List" },
    { Icon: ListOrdered, cmd: "insertOrderedList", label: "Numbered List" },
    { Icon: Undo, cmd: "undo", label: "Undo" },
    { Icon: Redo, cmd: "redo", label: "Redo" },
    { Icon: Eraser, cmd: "removeFormat", label: "Clear Formatting" },
    { Icon: Copy, cmd: "copy", label: "Copy" },
    { Icon: ClipboardPaste, cmd: "paste", label: "Paste" },
    { Icon: Scissors, cmd: "cut", label: "Cut" },
    { Icon: Highlighter, cmd: "backColor", value: "yellow", label: "Highlight" },
    { Icon: Paintbrush, cmd: "foreColor", value: "black", label: "Text Color" },
    { Icon: Square, cmd: "custom", value: "square", label: "Insert Square" },
    { Icon: Circle, cmd: "custom", value: "circle", label: "Insert Circle" },
    { Icon: ArrowRight, cmd: "custom", value: "arrow", label: "Insert Arrow" },
    { Icon: Asterisk, cmd: "custom", value: "star", label: "Insert Star" },
    { Icon: Triangle, cmd: "custom", value: "triangle", label: "Insert Triangle" }, // You may need to import `Triangle` icon from lucide
    
    
    { Icon: Minus, cmd: "insertHTML", value: "<hr>", label: "Insert Line" },
    { Icon: ArrowRight, cmd: "insertText", value: "→", label: "Insert Arrow" },
    { Icon: Asterisk, cmd: "insertText", value: "★", label: "Insert Star" },
    { Icon: TextCursor, cmd: "insertText", value: "✎", label: "Insert Cursor" },
    { Icon: Pencil, cmd: "insertText", value: "✏", label: "Insert Pencil" },
    { Icon: Move, cmd: "insertText", value: "↔", label: "Insert Move Symbol" },
    { Icon: MousePointer2, cmd: "insertText", value: "🖱", label: "Insert Mouse Icon" },
  ];

  return (
    <>
    <div className="p-4">
      <Link href="/" className="inline-flex items-center gap-2 text-violet-700">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-bold mt-2">Notes</h1>
      <p className="text-muted-foreground mb-6">
        Create and manage your content. Use the chatbot for help. Export as PDF when done.
      </p>
  
      <div className="flex flex-col lg:flex-row dark:text-white h-screen gap-4">
        {/* Editor Section */}
        <div className="lg:w-1/2 dark:text-white flex flex-col border border-muted rounded-lg p-4 bg-background shadow">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 bg-muted p-3 rounded-md">
            {toolbarButtons.map(({ Icon, cmd, value, label }, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (cmd === "custom" && value === "square") insertShape("square");
                      else if (cmd === "custom" && value === "circle") insertShape("circle");
                      else applyFormat(cmd, value);
                    }}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            <Button variant="ghost" size="icon" onClick={downloadStyledPDF}>
              <Download className="w-4 h-4" />
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={saveNoteToDB}>
              💾
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNotes(!showNotes);
                if (!showNotes) fetchNotes();
              }}
            >
              📝 View Notes
            </Button>
          </div>
  
          {/* Editable Area */}
          <div
            ref={editorRef}
            contentEditable
            className="flex-1 mt-4 p-4 border border-muted rounded-lg bg-background min-h-[300px] dark:text-white overflow-auto text-foreground"
          />
        </div>
  
        {/* Chatbot */}
        <div className="lg:w-1/2 flex flex-col border border-muted rounded-lg p-4 bg-muted/30 shadow">
          <h2 className="text-xl font-bold mb-2">Chatbot</h2>
          <div
            ref={chatboxRef}
            className="flex-1 overflow-y-auto border rounded-lg p-4 bg-background flex flex-col gap-2"
          >

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md max-w-[70%] ${
                  msg.role === "bot"
                    ? "bg-blue-100 dark:bg-blue-900 text-foreground self-start"
                    : "bg-gray-200 dark:bg-gray-700 text-foreground self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="self-start bg-blue-100 dark:bg-blue-900 p-2 rounded-md max-w-[70%] text-foreground flex items-center">
                <span className="animate-pulse">• • •</span>
              </div>
            )}
          </div>
  
          {/* Input */}
          <div className="flex items-center mt-2 mb-6">
            <input
              type="text"
              className="flex-1 p-2 border rounded-lg bg-background text-foreground"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="ghost" onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
  
      {/* Bottom Sheet for Notes */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/30 backdrop-blur-sm">
          <div className="w-full sm:max-w-4xl h-[65%] bg-background shadow-2xl rounded-t-3xl border-t border-muted overflow-hidden flex flex-col">
            
            {/* Header with drag-handle style */}
            <div className="px-4 py-3 border-b border-muted bg-muted/40">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground mx-auto mb-2" />
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">📚 Saved Notes</h2>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-xl text-muted-foreground hover:text-red-500 transition-colors"
                >
                  ❌
                </button>
              </div>
            </div>
      
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
              {notes.length === 0 ? (
                <p className="text-muted-foreground mt-2">No saved notes.</p>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={index}
                    className="p-4 border border-muted rounded-md bg-muted/30 text-sm text-foreground shadow-sm"
                    dangerouslySetInnerHTML={{ __html: note }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  </>
  
  );
};

export default EditorWithChatbot;
