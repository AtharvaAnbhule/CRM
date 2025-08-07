"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "../Meeting/components/ui/use-toast";

export default function AgencyPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.target);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: data,
    });

    setLoading(false);

    if (res.ok) {
      toast({ title: "Message sent successfully." });
      e.target.reset();
    } else {
      toast({ variant: "destructive", title: "Failed to send message." });
    }
  };

  const services = [
    {
      title: "Web Development",
      desc: "Modern websites, SaaS apps, eCommerce platforms, and custom APIs.",
    },
    {
      title: "Graphic Design",
      desc: "Branding, logo design, banners, and more.",
    },
    {
      title: "Video Shoot",
      desc: "Product videos, brand storytelling, event coverage, and promotional reels.",
    },
    {
      title: "Marketing",
      desc: "SEO, ads, content strategy, email campaigns, and lead generation.",
    },
    {
      title: "UI/UX Design",
      desc: "Clean, user-first interfaces with smooth experiences.",
    },
    {
      title: "Social Media",
      desc: "Content strategy, publishing, analytics, and optimization.",
    },
  ];

  return (
    <div className="min-h-screen px-4 md:px-16 py-8 bg-background text-foreground space-y-20">
      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push("/")}>
          <ArrowLeft size={16} /> Back to Home
        </Button>
      </div>

      {/* Hero Section */}
      <motion.section
        className="grid lg:grid-cols-2 gap-12 items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-violet-600 leading-tight">
            We help businesses grow with digital innovation
          </h1>
          <p className="text-muted-foreground max-w-xl">
            A full-service creative agency delivering custom web, design,
            marketing, and video solutions built for results.
          </p>
        </div>
        <div className="rounded-xl overflow-hidden shadow-xl bg-violet-600 p-10 text-white text-center">
          <h3 className="text-3xl font-semibold">Let&rsquo;s Talk!</h3>
          <p>Reach out to us and start your project today.</p>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.1 }}>
        <motion.h2
          className="text-2xl font-semibold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          What We Offer
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="w-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}>
              <Card className="hover:shadow-lg border border-muted transition duration-300">
                <CardHeader>
                  <CardTitle className="text-violet-600">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <h2 className="text-2xl font-semibold">What Our Clients Say</h2>
        <div className="space-y-6">
          <div className="border p-4 shadow-sm">
            <p>
              &quot;This agency helped us scale our business by providing
              innovative digital solutions. The team was fantastic!&quot;
            </p>
            <div className="mt-4 font-semibold">
              &ndash; Jane Doe, CEO of CompanyX
            </div>
          </div>
          <div className="border p-4 shadow-sm">
            <p>
              &quot;Our website traffic and conversions increased after working
              with this amazing agency. Highly recommended!&quot;
            </p>
            <div className="mt-4 font-semibold">
              &ndash; John Smith, Marketing Director at CompanyY
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trusted Brands Section */}
      <motion.section
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <h2 className="text-2xl font-semibold">Trusted by over 100+ Brands</h2>
        <p className="text-muted-foreground">
          We&apos;re proud to have worked with some amazing companies. Join them
          today and elevate your brand.
        </p>
      </motion.section>

      {/* Contact Form Section */}
      <motion.section
        className="max-w-xl mx-auto text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <p className="text-muted-foreground text-sm">
              Send us a message and we&rsquo;ll respond within 24 hours.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Your Name" required />
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                required
              />
              <Textarea
                name="message"
                placeholder="Your Message..."
                required
                rows={5}
              />
              <Button type="submit" disabled={loading} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
