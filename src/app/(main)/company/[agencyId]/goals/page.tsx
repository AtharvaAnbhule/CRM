"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CopyIcon, CalculatorIcon, MailIcon, ClockIcon, 
  PercentIcon, DollarSignIcon, HashIcon, 
  CalendarIcon, LinkIcon, TextIcon, 
  ClipboardCheckIcon, PhoneIcon, ImageIcon,
  PlusIcon, MinusIcon, DivideIcon, XIcon,
  ChevronDownIcon, ChevronUpIcon
} from "lucide-react";
import { useToast } from "@/app/(main)/Meeting/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BusinessToolsPanel() {
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState("calculator");
  
  // Calculator state
  const [calculation, setCalculation] = useState("");
  const [result, setResult] = useState("");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  
  // Email Formatter state
  const [emailInput, setEmailInput] = useState("");
  const [formattedEmails, setFormattedEmails] = useState<string[]>([]);
  const [emailFormat, setEmailFormat] = useState("semicolon");
  
  // Timezone state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [compareTimezone, setCompareTimezone] = useState("UTC");
  const [timeFormat24h, setTimeFormat24h] = useState(false);
  const [showTimezoneDetails, setShowTimezoneDetails] = useState(false);
  
  // Tip Calculator state
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState("15");
  const [splitCount, setSplitCount] = useState("1");
  const [roundTip, setRoundTip] = useState(false);
  const [tipResults, setTipResults] = useState({
    tipAmount: 0,
    totalAmount: 0,
    perPerson: 0
  });
  
  // Discount Calculator state
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("10");
  const [taxRate, setTaxRate] = useState("0");
  const [discountResults, setDiscountResults] = useState({
    discountAmount: 0,
    finalPrice: 0,
    taxAmount: 0,
    totalAfterTax: 0
  });
  
  // URL Shortener state
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [urlHistory, setUrlHistory] = useState<{long: string, short: string}[]>([]);
  
  // Word Counter state
  const [textToCount, setTextToCount] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);
  
  // Phone Formatter state
  const [phoneInput, setPhoneInput] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [phoneFormat, setPhoneFormat] = useState("us");

  // Timezone data
  const timezones = () => {
    try {
      return Intl.supportedValuesOf?.("timeZone") || [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Australia/Sydney",
      ];
    } catch {
      return [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Australia/Sydney",
      ];
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculator functions
  const handleCalculatorInput = (value: string) => {
    if (value === "=") {
      try {
        // eslint-disable-next-line no-eval
        const calculatedResult = eval(calculation).toString();
        setResult(calculatedResult);
        setCalcHistory(prev => [...prev.slice(-4), `${calculation} = ${calculatedResult}`]);
      } catch {
        setResult("Error");
      }
    } else if (value === "C") {
      setCalculation("");
      setResult("");
    } else if (value === "⌫") {
      setCalculation(calculation.slice(0, -1));
    } else {
      setCalculation(calculation + value);
    }
  };

  // Email formatting functions
  const formatEmails = () => {
    if (!emailInput.trim()) return;

    const emails = emailInput
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes("@"));

    const formatted = emails.map(email => {
      const [name, domain] = email.split("@");
      return `${name}@${domain.toLowerCase()}`;
    });

    setFormattedEmails(formatted);
  };

  const copyEmails = () => {
    if (formattedEmails.length === 0) return;
    
    let separator = "; ";
    if (emailFormat === "comma") separator = ", ";
    if (emailFormat === "newline") separator = "\n";
    
    navigator.clipboard.writeText(formattedEmails.join(separator));
    toast({
      title: "Copied!",
      description: `Email list copied to clipboard (${formattedEmails.length} emails)`,
    });
  };

  // Timezone conversion functions
  const formatTime = (date: Date, timezone: string) => {
    return date.toLocaleTimeString([], {
      timeZone: timezone,
      hour12: !timeFormat24h,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date, timezone: string) => {
    return date.toLocaleDateString([], {
      timeZone: timezone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimezoneOffset = (timezone: string) => {
    try {
      const date = new Date();
      const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
      const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
      return (utcDate.getTime() - tzDate.getTime()) / 3600000;
    } catch {
      return 0;
    }
  };

  // Tip Calculator functions
  const calculateTip = () => {
    const amount = parseFloat(billAmount);
    const tip = parseFloat(tipPercentage);
    const split = parseInt(splitCount);

    if (isNaN(amount) || amount <= 0) return;

    let tipAmount = amount * (tip / 100);
    if (roundTip) {
      tipAmount = Math.ceil(tipAmount);
    }
    const totalAmount = amount + tipAmount;
    const perPerson = totalAmount / split;

    setTipResults({
      tipAmount,
      totalAmount,
      perPerson
    });
  };

  // Discount Calculator functions
  const calculateDiscount = () => {
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercentage);
    const tax = parseFloat(taxRate);

    if (isNaN(price) || price <= 0) return;

    const discountAmount = price * (discount / 100);
    const finalPrice = price - discountAmount;
    const taxAmount = finalPrice * (tax / 100);
    const totalAfterTax = finalPrice + taxAmount;

    setDiscountResults({
      discountAmount,
      finalPrice,
      taxAmount,
      totalAfterTax
    });
  };

  // URL Shortener functions (mock implementation)
  const shortenUrl = () => {
    if (!longUrl.trim()) return;
    
    // In a real app, this would call a URL shortening API
    const mockShortUrl = `short.ly/${Math.random().toString(36).substring(2, 8)}`;
    setShortUrl(mockShortUrl);
    setUrlHistory(prev => [...prev.slice(-4), { long: longUrl, short: mockShortUrl }]);
  };

  const copyShortUrl = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

  // Word Counter functions
  const countWords = () => {
    const words = textToCount.trim() ? textToCount.trim().split(/\s+/) : [];
    const sentences = textToCount.trim() ? textToCount.split(/[.!?]+/) : [];
    const paragraphs = textToCount.trim() ? textToCount.split(/\n\s*\n/) : [];
    
    setWordCount(words.length);
    setCharacterCount(textToCount.length);
    setSentenceCount(sentences.filter(s => s.trim().length > 0).length);
    setParagraphCount(paragraphs.filter(p => p.trim().length > 0).length);
  };

  // Phone Formatter functions
  const formatPhoneNumber = () => {
    const cleaned = phoneInput.replace(/\D/g, '');
    let formatted = phoneInput;
    
    if (phoneFormat === "us") {
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
      } else if (cleaned.length <= 10) {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
      } else {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)} x${cleaned.substring(10)}`;
      }
    } else if (phoneFormat === "international") {
      if (cleaned.length > 0) {
        formatted = `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
      }
    } else if (phoneFormat === "dashes") {
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 6) {
        formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
      } else if (cleaned.length <= 10) {
        formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
      } else {
        formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)} x${cleaned.substring(10)}`;
      }
    }
    
    setFormattedPhone(formatted);
  };

  const copyPhoneNumber = () => {
    if (!formattedPhone) return;
    navigator.clipboard.writeText(formattedPhone);
    toast({
      title: "Copied!",
      description: "Phone number copied to clipboard",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-3">
          <span className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
            <CalculatorIcon className="w-5 h-5 text-primary" />
          </span>
          <span className="text-lg font-semibold">Business Tools</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTool} onValueChange={setActiveTool} className="h-full">
          <TabsList className="grid w-full bg-background grid-cols-4 gap-1 p-2 border-b rounded-none">
            <TabsTrigger 
              value="calculator" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <CalculatorIcon className="w-4 h-4" />
              <span>Calculator</span>
            </TabsTrigger>
            <TabsTrigger 
              value="email" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <MailIcon className="w-4 h-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger 
              value="timezone" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <ClockIcon className="w-4 h-4" />
              <span>Timezone</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tip" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <PercentIcon className="w-4 h-4" />
              <span>Tip Calc</span>
            </TabsTrigger>
            <TabsTrigger 
              value="discount" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <DollarSignIcon className="w-4 h-4" />
              <span>Discount</span>
            </TabsTrigger>
            <TabsTrigger 
              value="url" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <LinkIcon className="w-4 h-4" />
              <span>URL</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wordcount" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <TextIcon className="w-4 h-4" />
              <span>Word Count</span>
            </TabsTrigger>
            <TabsTrigger 
              value="phone" 
              className="text-xs py-2 h-auto flex-col gap-1 data-[state=active]:bg-muted/50"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Phone</span>
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {calcHistory.length > 0 && (
                <div className="p-2 bg-muted/50 dark:bg-muted/30 rounded-lg text-sm text-muted-foreground">
                  {calcHistory.map((item, i) => (
                    <div key={i} className="text-right py-1">{item}</div>
                  ))}
                </div>
              )}
              
              <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                <div className="text-right text-sm text-muted-foreground h-6 overflow-hidden">
                  {calculation || "0"}
                </div>
                <div className="text-right text-2xl font-mono font-bold h-8 overflow-hidden">
                  {result || "0"}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["C", "⌫", "%", "/"].map((op) => (
                  <Button
                    key={op}
                    variant="outline"
                    className="h-14 text-lg dark:bg-muted/30"
                    onClick={() => handleCalculatorInput(op)}
                  >
                    {op === "/" ? <DivideIcon className="w-5 h-5" /> : op}
                  </Button>
                ))}
                {[7, 8, 9, "*"].map((num) => (
                  <Button
                    key={num}
                    variant={typeof num === "number" ? "secondary" : "outline"}
                    className="h-14 text-lg dark:bg-muted/30"
                    onClick={() => handleCalculatorInput(num.toString())}
                  >
                    {num === "*" ? <XIcon className="w-5 h-5" /> : num}
                  </Button>
                ))}
                {[4, 5, 6, "-"].map((num) => (
                  <Button
                    key={num}
                    variant={typeof num === "number" ? "secondary" : "outline"}
                    className="h-14 text-lg dark:bg-muted/30"
                    onClick={() => handleCalculatorInput(num.toString())}
                  >
                    {num === "-" ? <MinusIcon className="w-5 h-5" /> : num}
                  </Button>
                ))}
                {[1, 2, 3, "+"].map((num) => (
                  <Button
                    key={num}
                    variant={typeof num === "number" ? "secondary" : "outline"}
                    className="h-14 text-lg dark:bg-muted/30"
                    onClick={() => handleCalculatorInput(num.toString())}
                  >
                    {num === "+" ? <PlusIcon className="w-5 h-5" /> : num}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  className="h-14 text-lg col-span-2 dark:bg-muted/30"
                  onClick={() => handleCalculatorInput("0")}
                >
                  0
                </Button>
                <Button
                  variant="secondary"
                  className="h-14 text-lg dark:bg-muted/30"
                  onClick={() => handleCalculatorInput(".")}
                >
                  .
                </Button>
                <Button
                  className="h-14 text-lg bg-primary hover:bg-primary/90"
                  onClick={() => handleCalculatorInput("=")}
                >
                  =
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Email Formatter Tab */}
          <TabsContent value="email" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-input">Paste email addresses (comma, semicolon or newline separated)</Label>
                <Textarea
                  id="email-input"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="min-h-[120px] mt-2"
                  placeholder="john@example.com, mary@test.com; bob@sample.com"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={formatEmails} className="flex-1">
                  Format Emails
                </Button>
                <Select value={emailFormat} onValueChange={setEmailFormat}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semicolon">Semicolon</SelectItem>
                    <SelectItem value="comma">Comma</SelectItem>
                    <SelectItem value="newline">Newline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formattedEmails.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Formatted Emails ({formattedEmails.length})</Label>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        Valid: {formattedEmails.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)).length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyEmails}
                      >
                        <CopyIcon className="w-4 h-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
                    {formattedEmails.map((email, i) => (
                      <div key={i} className="py-1 font-mono text-sm flex items-center">
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                          <span className="text-green-500 mr-2">✓</span>
                        ) : (
                          <span className="text-red-500 mr-2">✗</span>
                        )}
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Timezone Converter Tab */}
          <TabsContent value="timezone" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                <Label className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  24-hour format
                </Label>
                <Switch
                  checked={timeFormat24h}
                  onCheckedChange={setTimeFormat24h}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Timezone</Label>
                  <Select
                    value={selectedTimezone}
                    onValueChange={setSelectedTimezone}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {timezones().map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatTime(currentTime, selectedTimezone)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(currentTime, selectedTimezone)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Compare With</Label>
                  <Select
                    value={compareTimezone}
                    onValueChange={setCompareTimezone}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {timezones().map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatTime(currentTime, compareTimezone)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(currentTime, compareTimezone)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                <div className="text-sm font-medium mb-2">
                  Time Difference
                </div>
                <div>
                  {(() => {
                    try {
                      const selectedOffset = getTimezoneOffset(selectedTimezone);
                      const compareOffset = getTimezoneOffset(compareTimezone);
                      const diffHours = compareOffset - selectedOffset;
                      const absDiff = Math.abs(diffHours);
                      const aheadBehind = diffHours < 0 ? "ahead" : "behind";

                      return `${compareTimezone.replace(/_/g, " ")} is ${absDiff} hour${absDiff !== 1 ? "s" : ""} ${aheadBehind} ${selectedTimezone.replace(/_/g, " ")}`;
                    } catch {
                      return "Could not calculate time difference";
                    }
                  })()}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full flex items-center gap-2"
                onClick={() => setShowTimezoneDetails(!showTimezoneDetails)}
              >
                {showTimezoneDetails ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    Hide Timezone Details
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    Show Timezone Details
                  </>
                )}
              </Button>

              {showTimezoneDetails && (
                <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Your Timezone Offset</div>
                      <div className="font-medium">
                        UTC{getTimezoneOffset(selectedTimezone) >= 0 ? "+" : ""}{getTimezoneOffset(selectedTimezone)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Compared Timezone Offset</div>
                      <div className="font-medium">
                        UTC{getTimezoneOffset(compareTimezone) >= 0 ? "+" : ""}{getTimezoneOffset(compareTimezone)}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-sm text-muted-foreground">
                    Current time in {selectedTimezone.replace(/_/g, " ")}: {currentTime.toLocaleString("en-US", { timeZone: selectedTimezone })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tip Calculator Tab */}
          <TabsContent value="tip" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Bill Amount</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  onBlur={calculateTip}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-percentage">Tip Percentage</Label>
                <div className="flex gap-2">
                  <Select
                    value={tipPercentage}
                    onValueChange={(value) => {
                      setTipPercentage(value);
                      calculateTip();
                    }}
                    //@ts-ignore
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tip percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={roundTip ? "default" : "outline"}
                    onClick={() => {
                      setRoundTip(!roundTip);
                      calculateTip();
                    }}
                    className="w-auto"
                  >
                    Round Up
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="split-count">Split Between</Label>
                <Input
                  id="split-count"
                  type="number"
                  min="1"
                  value={splitCount}
                  onChange={(e) => setSplitCount(e.target.value)}
                  onBlur={calculateTip}
                />
              </div>

              {tipResults.totalAmount > 0 && (
                <div className="space-y-3 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tip Amount:</span>
                    <span className="font-medium">${tipResults.tipAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">${tipResults.totalAmount.toFixed(2)}</span>
                  </div>
                  {parseInt(splitCount) > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Per Person:</span>
                      <span className="font-medium">${tipResults.perPerson.toFixed(2)}</span>
                    </div>
                  )}
                  {roundTip && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Tip has been rounded up to the nearest dollar
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Discount Calculator Tab */}
          <TabsContent value="discount" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="original-price">Original Price</Label>
                <Input
                  id="original-price"
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0.00"
                  onBlur={calculateDiscount}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-percentage">Discount Percentage</Label>
                <Input
                  id="discount-percentage"
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="10"
                  onBlur={calculateDiscount}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                  onBlur={calculateDiscount}
                />
              </div>

              {discountResults.finalPrice > 0 && (
                <div className="space-y-3 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount Amount:</span>
                    <span className="font-medium">${discountResults.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price Before Tax:</span>
                    <span className="font-medium">${discountResults.finalPrice.toFixed(2)}</span>
                  </div>
                  {parseFloat(taxRate) > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tax Amount ({taxRate}%):</span>
                        <span className="font-medium">${discountResults.taxAmount.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center font-bold">
                        <span>Total After Tax:</span>
                        <span className="text-primary">${discountResults.totalAfterTax.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-muted-foreground">You Save:</span>
                    <span className="font-medium">${discountResults.discountAmount.toFixed(2)} ({discountPercentage}%)</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* URL Shortener Tab */}
          <TabsContent value="url" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="long-url">Long URL</Label>
                <Input
                  id="long-url"
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url"
                />
              </div>

              <Button onClick={shortenUrl} className="w-full">
                Shorten URL
              </Button>

              {shortUrl && (
                <div className="space-y-2">
                  <Label>Short URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shortUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={copyShortUrl}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {urlHistory.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Recent URLs</Label>
                  <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                    {urlHistory.map((item, i) => (
                      <div key={i} className="py-2 border-b last:border-b-0">
                        <div className="text-sm font-medium truncate">{item.short}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.long}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Note: This is a mock implementation. In a real app, this would call a URL shortening API.
              </div>
            </div>
          </TabsContent>

          {/* Word Counter Tab */}
          <TabsContent value="wordcount" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-to-count">Text to Analyze</Label>
                <Textarea
                  id="text-to-count"
                  value={textToCount}
                  onChange={(e) => {
                    setTextToCount(e.target.value);
                    countWords();
                  }}
                  className="min-h-[200px]"
                  placeholder="Paste or type your text here..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Words</div>
                  <div className="text-2xl font-bold">{wordCount}</div>
                </div>
                <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Characters</div>
                  <div className="text-2xl font-bold">{characterCount}</div>
                </div>
                <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Sentences</div>
                  <div className="text-2xl font-bold">{sentenceCount}</div>
                </div>
                <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Paragraphs</div>
                  <div className="text-2xl font-bold">{paragraphCount}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Phone Formatter Tab */}
          <TabsContent value="phone" className="p-15 mt-[100px] h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-input">Phone Number</Label>
                <Input
                  id="phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="1234567890"
                  onBlur={formatPhoneNumber}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={formatPhoneNumber} className="flex-1">
                  Format Phone Number
                </Button>
                <Select 
                  value={phoneFormat} 
                  onValueChange={(value) => {
                    setPhoneFormat(value);
                    formatPhoneNumber();
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">US Format</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="dashes">Dashes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formattedPhone && (
                <div className="space-y-2">
                  <Label>Formatted Phone</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formattedPhone}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={copyPhoneNumber}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}