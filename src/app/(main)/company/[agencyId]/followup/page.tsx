"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
 
import { Copy, Mail, Sparkles, Clock, Zap, ChevronDown, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/app/(main)/Meeting/components/ui/use-toast";

const followUpSchema = z.object({
  context: z.string().min(20, "Please provide at least 20 characters of context"),
  recipientName: z.string().optional(),
  senderName: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});

type FollowUpFormValues = z.infer<typeof followUpSchema>;

type FollowUpMessage = {
  text: string;
  tone: "friendly" | "professional" | "urgent";
  reasoning: string;
};

export default  function FollowUpWriter() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"friendly" | "professional" | "urgent">("friendly");

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      context: "",
      urgency: "medium",
    },
  });

const generateFollowUps = async (data: FollowUpFormValues) => {
  setIsGenerating(true);
  setMessages([]);
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;
    if (!apiKey) throw new Error("API key not configured");

    // More explicit prompt with JSON examples
    const prompt = `Generate exactly 3 follow-up email messages as a VALID JSON array. Format:
    [
      {
        "text": "email content here",
        "tone": "friendly",
        "reasoning": "explanation here"
      },
      {
        "text": "email content here", 
        "tone": "professional",
        "reasoning": "explanation here"
      },
      {
        "text": "email content here",
        "tone": "urgent",
        "reasoning": "explanation here"
      }
    ]

    Context: ${data.context}
    Recipient: ${data.recipientName || "Not specified"}
    Sender: ${data.senderName || "Not specified"}
    Urgency: ${data.urgency}

    Rules:
    - Return ONLY the JSON array
    - No additional text or explanations
    - All property names must be double-quoted
    - No trailing commas
    - Escape special characters
    - Ensure valid JSON control characters`;

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent JSON
        stop_sequences: ['\n\n```'] // Stop at code blocks
      }),
    });

    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const result = await response.json();
    let rawText = result.generations[0].text.trim();
    console.log("Raw API response:", rawText); // Debugging

    // Enhanced JSON cleaning with multiple strategies
    const extractJson = (text: string): string | null => {
      // Strategy 1: Direct JSON parse
      try {
        JSON.parse(text);
        return text;
      } catch (e) {
        console.log("Direct parse failed");
      }

      // Strategy 2: Extract from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]+?)\n```/);
      if (codeBlockMatch) {
        try {
          JSON.parse(codeBlockMatch[1]);
          return codeBlockMatch[1];
        } catch (e) {
          console.log("Markdown extraction failed");
        }
      }

      // Strategy 3: Find first [ and last ]
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      if (jsonStart >= 0 && jsonEnd > 0) {
        const potentialJson = text.slice(jsonStart, jsonEnd);
        try {
          JSON.parse(potentialJson);
          return potentialJson;
        } catch (e) {
          console.log("Bracket extraction failed");
        }
      }

      // Strategy 4: Aggressive cleaning
      try {
        const cleaned = text
          .replace(/[\u0000-\u001F]/g, '') // Remove control chars
          .replace(/'/g, '"') // Single to double quotes
          .replace(/(\w+)\s*:/g, '"$1":') // Quote property names
          .replace(/:\s*([^"{\[\d][^,}\]]*?)([,}\]])/g, ': "$1"$2') // Quote values
          .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
          .replace(/\\"/g, '"') // Unescape quotes
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\t/g, '\\t'); // Escape tabs
        
        JSON.parse(cleaned);
        return cleaned;
      } catch (e) {
        console.log("Aggressive cleaning failed");
        return null;
      }
    };

    const jsonString = extractJson(rawText);
    if (!jsonString) {
      throw new Error("Could not extract valid JSON from response");
    }

    // Final parse with validation
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error("Response is not an array");
      }
    } catch (e) {
      console.error("Final parse error:", e);
      console.log("Final JSON attempt:", jsonString);
      throw new Error("Could not parse valid message array");
    }

    // Validate and transform messages
    const validatedMessages = parsed.map((msg: any) => ({
      text: String(msg.text || "").replace(/\\n/g, '\n'),
      tone: ["friendly","professional","urgent"].includes(msg.tone?.toLowerCase()) 
        ? msg.tone.toLowerCase() as "friendly" | "professional" | "urgent"
        : "friendly",
      reasoning: String(msg.reasoning || "No reasoning provided").replace(/\\n/g, '\n')
    })).slice(0, 3); // Ensure exactly 3 messages

    setMessages(validatedMessages);
    setActiveTab(validatedMessages[0]?.tone || "friendly");
    
    toast({ title: "Success!", description: "Messages generated" });

  } catch (error) {
    console.error("Generation failed:", error);
    toast({
      title: "Generation Failed",
      description: error instanceof Error ? error.message : "API error occurred",
      variant: "destructive"
    });
  } finally {
    setIsGenerating(false);
  }
};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const getToneBadge = (tone: string) => {
    switch (tone) {
      case "friendly":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Friendly</Badge>;
      case "professional":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Professional</Badge>;
      case "urgent":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge variant="secondary">{tone}</Badge>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI Follow-Up Writer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(generateFollowUps)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Conversation Context*</Label>
                <Textarea
                  placeholder="Paste the previous conversation, email thread, or notes about this lead..."
                  rows={5}
                  {...form.register("context")}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Provide enough context for personalized follow-ups
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Recipient Name (Optional)</Label>
                  <Input
                    placeholder="Client/lead name"
                    {...form.register("recipientName")}
                  />
                </div>
                <div>
                  <Label>Your Name (Optional)</Label>
                  <Input
                    placeholder="Your name"
                    {...form.register("senderName")}
                  />
                </div>
              </div>

              <div>
                <Label>Urgency Level</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="low"
                      {...form.register("urgency")}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Low</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="medium"
                      {...form.register("urgency")}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      defaultChecked
                    />
                    <span>Medium</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="high"
                      {...form.register("urgency")}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span>High</span>
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Follow-Ups
                </>
              )}
            </Button>
          </form>

          {messages.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Suggested Follow-Ups</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Export <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => copyToClipboard(messages.map(m => m.text).join("\n\n---\n\n"))}>
                      Copy All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'follow-ups.json';
                      a.click();
                    }}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="friendly">
                    <Mail className="w-4 h-4 mr-2" />
                    Friendly
                  </TabsTrigger>
                  <TabsTrigger value="professional">
                    <Mail className="w-4 h-4 mr-2" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger value="urgent">
                    <Zap className="w-4 h-4 mr-2" />
                    Urgent
                  </TabsTrigger>
                </TabsList>

                {messages.map((message) => (
                  <TabsContent key={message.tone} value={message.tone} className="mt-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                          {getToneBadge(message.tone)}
                          {message.tone === 'urgent' && <Clock className="w-4 h-4 text-red-500" />}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.text)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.text}
                        </div>
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">AI Reasoning:</p>
                          <p className="text-xs mt-1">{message.reasoning}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <p>Note: Your API key is securely loaded from environment variables and never leaves your browser.</p>
        </CardFooter>
      </Card>
    </div>
  );
}