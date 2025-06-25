"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeDragElement, setActiveDragElement] = useState<HTMLElement | null>(null);

  // Set up drag and drop functionality
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[draggable="true"]')) {
        const draggable = target.closest('[draggable="true"]') as HTMLElement;
        setIsDragging(true);
        setActiveDragElement(draggable);
        setDragOffset({
          x: e.clientX - draggable.getBoundingClientRect().left,
          y: e.clientY - draggable.getBoundingClientRect().top
        });
        draggable.style.cursor = 'grabbing';
        draggable.style.position = 'absolute';
        draggable.style.zIndex = '1000';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && activeDragElement) {
        activeDragElement.style.left = `${e.clientX - dragOffset.x}px`;
        activeDragElement.style.top = `${e.clientY - dragOffset.y}px`;
      }
    };

    const handleMouseUp = () => {
      if (isDragging && activeDragElement) {
        activeDragElement.style.cursor = 'grab';
        activeDragElement.style.zIndex = '';
      }
      setIsDragging(false);
      setActiveDragElement(null);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeDragElement, dragOffset]);

  const insertShape = (type: string) => {
    if (!editorRef.current) return;

    const wrapper = document.createElement("div");
    wrapper.contentEditable = "false";
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.margin = "10px";
    wrapper.style.resize = "both";
    wrapper.style.overflow = "auto";
    wrapper.style.width = "100px";
    wrapper.style.height = "100px";
    wrapper.style.cursor = "grab";
    wrapper.setAttribute("draggable", "true");

    const shape = document.createElement("div");
    shape.style.width = "100%";
    shape.style.height = "100%";
    shape.style.border = "2px solid #3b82f6";
    shape.style.backgroundColor = "rgba(59, 130, 246, 0.1)";

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
        shape.style.borderBottom = "100px solid #3b82f6";
        shape.style.border = "none";
        shape.style.backgroundColor = "transparent";
        break;
      case "arrow":
        shape.innerHTML = "➤";
        shape.style.fontSize = "48px";
        shape.style.textAlign = "center";
        shape.style.color = "#3b82f6";
        shape.style.border = "none";
        shape.style.backgroundColor = "transparent";
        break;
      case "star":
        shape.innerHTML = "★";
        shape.style.fontSize = "48px";
        shape.style.textAlign = "center";
        shape.style.color = "#3b82f6";
        shape.style.border = "none";
        shape.style.backgroundColor = "transparent";
        break;
      default:
        break;
    }

    wrapper.appendChild(shape);
    editorRef.current.appendChild(wrapper);
  };

  const [messages, setMessages] = useState([{ role: "bot", text: "👤 Hello, how can I help you with your notes today?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const applyFormat = (command: string, value: string | null = null) => {
    if (command === "custom" && value) {
      insertShape(value);
    } else {
      document.execCommand(command, false, value);
    }
    editorRef.current?.focus();
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
          temperature: 0.7,
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
      return "Sorry, I couldn't process that request. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const botResponse = await fetchCohereResponse(userMessage);
      setMessages([...newMessages, { role: "bot", text: botResponse }]);
    } catch (error) {
      setMessages([...newMessages, { role: "bot", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        chatboxRef.current?.scrollTo({
          top: chatboxRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveNoteToDB = async () => {
    const htmlContent = editorRef.current?.innerHTML || "";
    if (!htmlContent.trim()) {
      alert("Cannot save an empty note!");
      return;
    }

    try {
      await axios.post("/api/note", {
        content: htmlContent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      alert("Note saved successfully!");
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note. Please try again.");
    }
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
      wrapper.style.maxWidth = "100%";
      wrapper.style.cursor = "grab";
      wrapper.setAttribute("draggable", "true");

      const img = document.createElement("img");
      img.src = e.target?.result as string;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.pointerEvents = "none";

      wrapper.appendChild(img);
      editorRef.current?.appendChild(wrapper);
      event.target.value = ""; // Reset file input
    };
    reader.readAsDataURL(file);
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/note");
      setNotes(res.data.map((n: any) => n.content));
    } catch (err) {
      console.error("Failed to fetch notes", err);
      alert("Failed to load notes. Please try again.");
    }
  };

  const downloadStyledPDF = async () => {
    if (!editorRef.current) return;
    
    // Check if editor is empty
    if (!editorRef.current.textContent?.trim()) {
      alert("Cannot export an empty document!");
      return;
    }

    const originalBackground = editorRef.current.style.background;
    editorRef.current.style.background = "white";
    editorRef.current.style.color = "black";

    try {
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
        scale: 2, // Higher quality
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190; // Slightly smaller than A4 width to add margins
      const pageHeight = 277; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Top margin
      
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add new pages if content is taller than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("styled-document.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      editorRef.current.style.background = originalBackground;
      editorRef.current.style.color = "";
    }
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
    { Icon: Paintbrush, cmd: "foreColor", value: "#000000", label: "Text Color" },
    { Icon: Square, cmd: "custom", value: "square", label: "Insert Square" },
    { Icon: Circle, cmd: "custom", value: "circle", label: "Insert Circle" },
    { Icon: ArrowRight, cmd: "custom", value: "arrow", label: "Insert Arrow" },
    { Icon: Asterisk, cmd: "custom", value: "star", label: "Insert Star" },
    { Icon: Triangle, cmd: "custom", value: "triangle", label: "Insert Triangle" },
    { Icon: Minus, cmd: "insertHTML", value: "<hr>", label: "Insert Line" },
    { Icon: TextCursor, cmd: "insertText", value: "✎", label: "Insert Cursor" },
    { Icon: Pencil, cmd: "insertText", value: "✏", label: "Insert Pencil" },
    { Icon: MousePointer2, cmd: "insertText", value: "🖱", label: "Insert Mouse Icon" },
  ];

  return (
    <div className="p-4 bg-background ">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold mt-2 text-foreground">Notes Editor</h1>
        <p className="text-muted-foreground mb-6">
          Create and manage your content. Use the chatbot for help. Export as PDF when done.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
          {/* Editor Section */}
          <div className="lg:h-3/2 flex flex-col border rounded-lg overflow-hidden bg-background shadow-lg">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 bg-muted/50 p-2 border-b">
              {toolbarButtons.map(({ Icon, cmd, value, label }, i) => (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 hover:bg-muted"
                        onClick={() => applyFormat(cmd, value)}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 h-9 hover:bg-muted" onClick={downloadStyledPDF}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Export as PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 h-9 hover:bg-muted" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Insert Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 h-9 hover:bg-muted" onClick={saveNoteToDB}>
                      <span className="text-sm">💾</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Save Note</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                variant="ghost"
                className="h-9 hover:bg-muted"
                onClick={() => {
                  setShowNotes(!showNotes);
                  if (!showNotes) fetchNotes();
                }}
              >
                {showNotes ? "Hide Notes" : "View Notes"}
              </Button>
            </div>

            {/* Editable Area */}
            <div
              ref={editorRef}
              contentEditable
              className="flex-1 p-6 overflow-auto text-foreground focus:outline-none"
              style={{
                minHeight: "300px",
                lineHeight: "1.6",
              }}
              onPaste={(e) => {
                // Handle plain text paste to avoid weird formatting
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
              }}
            />
          </div>

          {/* Chatbot */}
          <div className="max-h-1/4 flex flex-col border rounded-lg overflow-hidden bg-muted/5 shadow-lg">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-foreground">AI Assistant</h2>
              <p className="text-sm text-muted-foreground">Ask for help with formatting, content ideas, or anything else</p>
            </div>
            
            <div
              ref={chatboxRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-background"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg max-w-[85%] text-sm",
                    msg.role === "bot"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-foreground self-start"
                      : "bg-gray-100 dark:bg-gray-800 text-foreground self-end"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="self-start bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg max-w-[85%] flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-muted/20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !input.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Bottom Sheet */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-[70vh] bg-background shadow-2xl rounded-t-3xl border-t border-muted overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-muted bg-muted/20">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mb-2" />
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">📚 Saved Notes</h2>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
      
            <div className="flex-1 overflow-y-auto p-4 grid gap-3 sm:grid-cols-2">
              {notes.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-lg">No saved notes yet.</p>
                  <p className="text-sm">Create a note and click the save button to store it here.</p>
                </div>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-md bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = note;
                        setShowNotes(false);
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: note }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorWithChatbot;