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
  ClipboardCheckIcon, PhoneIcon, ImageIcon
} from "lucide-react";
import { useToast } from "@/app/(main)/Meeting/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function BusinessToolsPanel() {
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState("calculator");
  
  // Calculator state
  const [calculation, setCalculation] = useState("");
  const [result, setResult] = useState("");
  
  // Email Formatter state
  const [emailInput, setEmailInput] = useState("");
  const [formattedEmails, setFormattedEmails] = useState<string[]>([]);
  
  // Timezone state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [compareTimezone, setCompareTimezone] = useState("UTC");
  const [timeFormat24h, setTimeFormat24h] = useState(false);
  
  // Tip Calculator state
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState("15");
  const [splitCount, setSplitCount] = useState("1");
  const [tipResults, setTipResults] = useState({
    tipAmount: 0,
    totalAmount: 0,
    perPerson: 0
  });
  
  // Discount Calculator state
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("10");
  const [discountResults, setDiscountResults] = useState({
    discountAmount: 0,
    finalPrice: 0
  });
  
  // URL Shortener state
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  
  // Word Counter state
  const [textToCount, setTextToCount] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  
  // Phone Formatter state
  const [phoneInput, setPhoneInput] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");

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
        setResult(eval(calculation).toString());
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
      .filter(e => e.length > 0);

    const formatted = emails.map(email => {
      if (!email.includes("@")) return email;
      const [name, domain] = email.split("@");
      return `${name}@${domain.toLowerCase()}`;
    });

    setFormattedEmails(formatted);
  };

  const copyEmails = () => {
    if (formattedEmails.length === 0) return;
    navigator.clipboard.writeText(formattedEmails.join("; "));
    toast({
      title: "Copied!",
      description: "Email list copied to clipboard",
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

  // Tip Calculator functions
  const calculateTip = () => {
    const amount = parseFloat(billAmount);
    const tip = parseFloat(tipPercentage);
    const split = parseInt(splitCount);

    if (isNaN(amount) || amount <= 0) return;

    const tipAmount = amount * (tip / 100);
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

    if (isNaN(price) || price <= 0) return;

    const discountAmount = price * (discount / 100);
    const finalPrice = price - discountAmount;

    setDiscountResults({
      discountAmount,
      finalPrice
    });
  };

  // URL Shortener functions (mock implementation)
  const shortenUrl = () => {
    if (!longUrl.trim()) return;
    
    // In a real app, this would call a URL shortening API
    const mockShortUrl = `short.ly/${Math.random().toString(36).substring(2, 8)}`;
    setShortUrl(mockShortUrl);
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
    setWordCount(words.length);
    setCharacterCount(textToCount.length);
  };

  // Phone Formatter functions
  const formatPhoneNumber = () => {
    const cleaned = phoneInput.replace(/\D/g, '');
    let formatted = phoneInput;
    
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else if (cleaned.length <= 10) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    } else {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)} x${cleaned.substring(10)}`;
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary/10 p-2 rounded-lg">
            <CalculatorIcon className="w-5 h-5 text-primary" />
          </span>
          Business Tools
        </CardTitle>
      </CardHeader>
      <CardContent >
        <Tabs value={activeTool} onValueChange={setActiveTool}>
          <TabsList className="grid w-full bg-slate-100 grid-cols-4 gap-1">
            <TabsTrigger value="calculator" className="text-xs py-1 h-auto">
              <CalculatorIcon className="w-3 h-3 mr-1" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs py-1 h-auto">
              <MailIcon className="w-3 h-3 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="timezone" className="text-xs py-1 h-auto">
              <ClockIcon className="w-3 h-3 mr-1" />
              Timezone
            </TabsTrigger>
            <TabsTrigger value="tip" className="text-xs py-1 h-auto">
              <PercentIcon className="w-3 h-3 mr-1" />
              Tip Calc
            </TabsTrigger>
            <TabsTrigger value="discount" className="text-xs py-1 h-auto">
              <DollarSignIcon className="w-3 h-3 mr-1" />
              Discount
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs py-1 h-auto">
              <LinkIcon className="w-3 h-3 mr-1" />
              URL Shortener
            </TabsTrigger>
            <TabsTrigger value="wordcount" className="text-xs py-1 h-auto">
              <TextIcon className="w-3 h-3 mr-1" />
              Word Counter
            </TabsTrigger>
            <TabsTrigger value="phone" className="text-xs py-1 h-auto">
              <PhoneIcon className="w-3 h-3 mr-1" />
              Phone Format
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
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
                    className="h-14 text-lg"
                    onClick={() => handleCalculatorInput(op)}
                  >
                    {op}
                  </Button>
                ))}
                {[7, 8, 9, "*"].map((num) => (
                  <Button
                    key={num}
                    variant={typeof num === "number" ? "secondary" : "outline"}
                    className="h-14 text-lg"
                    onClick={() => handleCalculatorInput(num.toString())}
                  >
                    {num}
                  </Button>
                ))}
                {[4, 5, 6, "-"].map((num) => (
                  <Button
                    key={num}
                    variant={typeof num === "number" ? "secondary" : "outline"}
                    className="h-14 text-lg"
                    onClick={() => handleCalculatorInput(num.toString())}
                  >
                    {num}
                  </Button>
                ))}
                {[1, 2, 3, "+"].map((num) => (
                  <Button
                    key={num}
                    variant={typeof num === "number" ? "secondary" : "outline"}
                    className="h-14 text-lg"
                    onClick={() => handleCalculatorInput(num.toString())}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  className="h-14 text-lg col-span-2"
                  onClick={() => handleCalculatorInput("0")}
                >
                  0
                </Button>
                <Button
                  variant="secondary"
                  className="h-14 text-lg"
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
          <TabsContent value="email" className="mt-4">
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

              <Button onClick={formatEmails} className="w-full">
                Format Emails
              </Button>

              {formattedEmails.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Formatted Emails ({formattedEmails.length})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyEmails}
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg max-h-60 overflow-y-auto">
                    {formattedEmails.map((email, i) => (
                      <div key={i} className="py-1 font-mono text-sm">
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Timezone Converter Tab */}
          <TabsContent value="timezone" className="mt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>24-hour format</Label>
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
                  <div className="p-4 bg-muted/50 rounded-lg">
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
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatTime(currentTime, compareTimezone)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(currentTime, compareTimezone)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-2">
                  Time Difference
                </div>
                <div>
                  {(() => {
                    try {
                      const localOffset = new Date().getTimezoneOffset();
                      const selectedOffset = new Date(
                        new Date().toLocaleString("en-US", { timeZone: selectedTimezone })
                      ).getTimezoneOffset();
                      const compareOffset = new Date(
                        new Date().toLocaleString("en-US", { timeZone: compareTimezone })
                      ).getTimezoneOffset();

                      const diffHours = (compareOffset - selectedOffset) / 60;
                      const absDiff = Math.abs(diffHours);
                      const aheadBehind = diffHours < 0 ? "ahead" : "behind";

                      return `${compareTimezone.replace(/_/g, " ")} is ${absDiff} hour${absDiff !== 1 ? "s" : ""} ${aheadBehind} ${selectedTimezone.replace(/_/g, " ")}`;
                    } catch {
                      return "Could not calculate time difference";
                    }
                  })()}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tip Calculator Tab */}
          <TabsContent value="tip" className="mt-4">
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
                <Select
                  value={tipPercentage}
                  onValueChange={(value) => {
                    setTipPercentage(value);
                    calculateTip();
                  }}
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
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Tip Amount:</span>
                    <span>${tipResults.tipAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>${tipResults.totalAmount.toFixed(2)}</span>
                  </div>
                  {parseInt(splitCount) > 1 && (
                    <div className="flex justify-between">
                      <span>Per Person:</span>
                      <span>${tipResults.perPerson.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Discount Calculator Tab */}
          <TabsContent value="discount" className="mt-4">
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

              {discountResults.finalPrice > 0 && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Discount Amount:</span>
                    <span>${discountResults.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Final Price:</span>
                    <span>${discountResults.finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>You Save:</span>
                    <span>${discountResults.discountAmount.toFixed(2)} ({discountPercentage}%)</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* URL Shortener Tab */}
          <TabsContent value="url" className="mt-4">
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
                  <div className="text-xs text-muted-foreground">
                    Note: This is a mock implementation. In a real app, this would call a URL shortening API.
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Word Counter Tab */}
          <TabsContent value="wordcount" className="mt-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Words</div>
                  <div className="text-2xl font-bold">{wordCount}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Characters</div>
                  <div className="text-2xl font-bold">{characterCount}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Phone Formatter Tab */}
          <TabsContent value="phone" className="mt-4">
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

              <Button onClick={formatPhoneNumber} className="w-full">
                Format Phone Number
              </Button>

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