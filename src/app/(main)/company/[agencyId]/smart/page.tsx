"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/app/(main)/Meeting/components/ui/use-toast";
import { Copy, Loader2, MoreVertical, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const personaSchema = z.object({
  customerData: z.string().min(10, "Please enter at least 10 characters"),
  industry: z.string().optional(),
  personaCount: z.number().min(1).max(10).default(3),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

type Persona = {
  name: string;
  jobTitle: string;
  age: number;
  location: string;
  bio: string;
  painPoints: string[];
  goals: string[];
  personalityTraits: string[];
  preferredChannels: string[];
  buyerStage: "awareness" | "consideration" | "decision";
  outreachTone: string;
  idealOffer: string;
  tags: string[];
  avatarSeed: string;
};

export default function PersonaBuilder() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<number | null>(null);

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      customerData: "",
      industry: "",
      personaCount: 3,
    },
  });

  const generatePersonas = async (data: PersonaFormValues) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setPersonas([]);

    try {
      setGenerationProgress(20);

      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Generate ${data.personaCount} detailed customer personas in STRICT JSON format based on:
          
Customer Data: ${data.customerData}
${data.industry ? `Industry: ${data.industry}` : ''}

Return ONLY a valid JSON array where each object contains:
- name: string
- jobTitle: string
- age: number (25-65)
- location: string
- bio: string
- painPoints: string[] (3 items)
- goals: string[] (3 items)
- personalityTraits: string[] (3 items)
- preferredChannels: string[] (2 items)
- buyerStage: "awareness"|"consideration"|"decision"
- outreachTone: string
- idealOffer: string
- tags: string[] (3 items)
- avatarSeed: string

IMPORTANT: Only return the raw JSON array with no additional text, explanations, or markdown formatting.`,
          max_tokens: 2000,
          temperature: 0.5,
          stop_sequences: ['\n\n'],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      setGenerationProgress(60);

      try {
        let generatedText = result.generations[0]?.text?.trim() || '';
        let jsonString = generatedText;

        // Clean up the JSON string
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        else if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```/g, '').trim();
        }

        const jsonStart = jsonString.indexOf('[');
        const jsonEnd = jsonString.lastIndexOf(']') + 1;

        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("No JSON array found in response");
        }

        jsonString = jsonString.slice(jsonStart, jsonEnd)
          .replace(/(\w)\s*:\s*/g, '"$1": ')
          .replace(/'/g, '"')
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/(\w)\s*:\s*([^"\s{[])/g, '"$1": "$2"')
          .replace(/:\s*"([^"]*?)"\s*([,}])/g, (match, p1, p2) => {
            return `: "${p1.replace(/"/g, '\\"')}"${p2}`;
          });

        const parsedPersonas = JSON.parse(jsonString);

        const validatedPersonas = parsedPersonas.map((persona: any) => ({
          name: String(persona.name || "Unknown"),
          jobTitle: String(persona.jobTitle || "Unknown"),
          age: Number(persona.age) || 30,
          location: String(persona.location || "Unknown"),
          bio: String(persona.bio || ""),
          painPoints: Array.isArray(persona.painPoints)
            ? persona.painPoints.map(String)
            : [],
          goals: Array.isArray(persona.goals)
            ? persona.goals.map(String)
            : [],
          personalityTraits: Array.isArray(persona.personalityTraits)
            ? persona.personalityTraits.map(String)
            : [],
          preferredChannels: Array.isArray(persona.preferredChannels)
            ? persona.preferredChannels.map(String)
            : [],
          buyerStage: ["awareness", "consideration", "decision"].includes(
            String(persona.buyerStage).toLowerCase()
          )
            ? String(persona.buyerStage).toLowerCase() as "awareness" | "consideration" | "decision"
            : "awareness",
          outreachTone: String(persona.outreachTone || "Professional"),
          idealOffer: String(persona.idealOffer || ""),
          tags: Array.isArray(persona.tags)
            ? persona.tags.map(String)
            : [],
          avatarSeed: String(persona.avatarSeed || persona.name || "default"),
        }));

        setPersonas(validatedPersonas);
        setActivePersona(0);

        toast({
          title: "Success!",
          description: `${validatedPersonas.length} personas generated`,
        });
      } catch (e) {
        console.error("Failed to parse personas:", e);
        toast({
          title: "Parsing Error",
          description: "Couldn't parse the AI response. Please try again.",
          variant: "destructive",
        });
      }

      setGenerationProgress(100);
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "API request failed",
        variant: "destructive",
      });
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPersonaToClipboard = (persona: Persona) => {
    const text = `**${persona.name}** - ${persona.jobTitle}
**Location:** ${persona.location}
**Age:** ${persona.age}
**Bio:** ${persona.bio}

**Pain Points:**
- ${persona.painPoints.join("\n- ")}

**Goals:**
- ${persona.goals.join("\n- ")}

**Personality:** ${persona.personalityTraits.join(", ")}
**Preferred Channels:** ${persona.preferredChannels.join(", ")}
**Buyer Stage:** ${persona.buyerStage}
**Recommended Tone:** ${persona.outreachTone}
**Ideal Offer:** ${persona.idealOffer}`;

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Persona copied to clipboard",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-purple-500/10 p-2 rounded-lg">
              <User className="w-5 h-5 text-purple-500" />
            </span>
            AI Smart Persona Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(generatePersonas)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerData">Customer Data *</Label>
                  <Textarea
                    id="customerData"
                    placeholder="Paste customer names, emails, companies, or any relevant data..."
                    rows={5}
                    {...form.register("customerData")}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The more details you provide, the better the personas will be
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. SaaS, E-commerce, Healthcare"
                    {...form.register("industry")}
                  />
                </div>

                <div>
                  <Label htmlFor="personaCount">Number of Personas</Label>
                  <Input
                    id="personaCount"
                    type="number"
                    min="1"
                    max="10"
                    {...form.register("personaCount", { valueAsNumber: true })}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Generate Personas
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {isGenerating && (
            <div className="mt-6 space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                AI is analyzing your data and creating detailed personas...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {personas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Generated Personas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {personas.map((persona, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${activePersona === index ? "bg-accent" : "hover:bg-muted/50"}`}
                  onClick={() => setActivePersona(index)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${persona.avatarSeed}`} />
                      <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{persona.name}</p>
                      <p className="text-sm text-muted-foreground">{persona.jobTitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {activePersona !== null && (
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{personas[activePersona].name}</CardTitle>
                      <p className="text-muted-foreground">{personas[activePersona].jobTitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPersonaToClipboard(personas[activePersona])}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Add to CRM</DropdownMenuItem>
                          <DropdownMenuItem>Save as Template</DropdownMenuItem>
                          <DropdownMenuItem>Export as JSON</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p>{personas[activePersona].age}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p>{personas[activePersona].location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Buyer Stage</p>
                      <Badge variant="outline" className="capitalize">
                        {personas[activePersona].buyerStage}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p>{personas[activePersona].bio}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-medium">Pain Points</p>
                        <div className="space-y-2">
                          {personas[activePersona].painPoints.map((point, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-destructive mt-0.5">•</span>
                              <p>{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">Personality Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {personas[activePersona].personalityTraits.map((trait, i) => (
                            <Badge key={i} variant="secondary">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-medium">Goals</p>
                        <div className="space-y-2">
                          {personas[activePersona].goals.map((goal, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <p>{goal}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">Preferred Channels</p>
                        <div className="flex flex-wrap gap-2">
                          {personas[activePersona].preferredChannels.map((channel, i) => (
                            <Badge key={i} variant="outline">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="font-medium">Recommended Outreach Tone</p>
                      <Badge variant="secondary" className="text-sm font-normal">
                        {personas[activePersona].outreachTone}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Ideal Offer</p>
                      <p>{personas[activePersona].idealOffer}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">CRM Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {personas[activePersona].tags.map((tag, i) => (
                        <Badge key={i} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outreach Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium">Email Template</p>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">Subject: {`How we can help with ${personas[activePersona].painPoints[0]?.toLowerCase()}`}</p>
                      <p className="mt-2">Hi {personas[activePersona].name.split(" ")[0]},</p>
                      <p className="mt-2">
                        I noticed youre {personas[activePersona].bio.toLowerCase().split(" ").slice(0, 10).join(" ")}... 
                        Our solution helps professionals like you {personas[activePersona].goals[0]?.toLowerCase()} by addressing {personas[activePersona].painPoints[0]?.toLowerCase()}.
                      </p>
                      <p className="mt-2">
                        Would you be open to a quick chat about how we can help you {personas[activePersona].goals[1]?.toLowerCase()}?
                      </p>
                      <p className="mt-2">Best regards,<br />[Your Name]</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Call Script</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <p><strong>Opening:</strong> &quot;Hi {personas[activePersona].name.split(" ")[0]}, this is [Your Name] from [Your Company]. How are you today?&quot;</p>
                      <p><strong>Value Prop:</strong> &quot;We specialize in helping {personas[activePersona].jobTitle.toLowerCase()}s like yourself {personas[activePersona].goals[2]?.toLowerCase()} by addressing {personas[activePersona].painPoints[1]?.toLowerCase()}.&quot;</p>
                      <p><strong>Question:</strong> &quot;Does this sound like something you&apos;ve been looking for?&quot;</p>
                      <p><strong>Next Steps:</strong> &quot;I&apos;d love to show you how we&apos;ve helped similar {personas[activePersona].jobTitle.toLowerCase()}s - would now be a good time or should we schedule something?&quot;</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}