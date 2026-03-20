"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DANCE_STYLES = [
  "Salsa", "Hip-Hop", "Bollywood", "Contemporary", "Ballet",
  "Bachata", "Kathak", "Bharatanatyam", "Jazz", "Freestyle", "Other",
];

interface WorkshopData {
  title: string;
  artistName: string;
  danceStyle: string;
  description: string;
  dateTime: string;
  city: string;
  venue: string;
  mapUrl?: string;
  price: number;
  maxSeats: number;
  durationMinutes?: number;
  ageLimit?: number;
}

export default function NewWorkshopPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [formData, setFormData] = useState<WorkshopData | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setImageUrl(data.url);
    else setError(data.error || "Image upload failed");
  }

  function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    setFormData({
      title: fd.get("title") as string,
      danceStyle: fd.get("danceStyle") as string,
      artistName: fd.get("artistName") as string,
      description: fd.get("description") as string,
      dateTime: fd.get("dateTime") as string,
      city: fd.get("city") as string,
      venue: fd.get("venue") as string,
      mapUrl: (fd.get("mapUrl") as string) || undefined,
      price: Number(fd.get("price")),
      maxSeats: Number(fd.get("maxSeats")),
      durationMinutes: fd.get("durationMinutes") ? Number(fd.get("durationMinutes")) : undefined,
      ageLimit: fd.get("ageLimit") ? Number(fd.get("ageLimit")) : undefined,
    });
    setStep("preview");
  }

  async function handleSubmit() {
    if (!formData) return;
    setError("");
    setLoading(true);
    const body = { ...formData, imageUrl: imageUrl || undefined };
    const res = await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); setStep("form"); }
    else router.push("/organizer/workshops");
  }

  const selectClass = "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="flex justify-center py-8">
      <AnimatePresence mode="wait">
        {step === "preview" && formData ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="shadow-xl shadow-primary/5 border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Preview Workshop</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review the details before publishing
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
                )}
                {imageUrl && (
                  <div className="relative h-56 w-full overflow-hidden rounded-2xl shadow-md">
                    <Image src={imageUrl} alt="Workshop preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div>
                  <Badge variant="secondary" className="rounded-full">{formData.danceStyle}</Badge>
                  <h2 className="mt-2 text-2xl font-extrabold">{formData.title}</h2>
                  <p className="text-muted-foreground">by {formData.artistName}</p>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Date & Time", value: new Date(formData.dateTime).toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                    { label: "Location", value: `${formData.venue}, ${formData.city}` },
                    { label: "Price", value: formData.price === 0 ? "Free" : `₹${formData.price} / seat` },
                    { label: "Max Seats", value: formData.maxSeats },
                    ...(formData.durationMinutes ? [{ label: "Duration", value: `${Math.floor(formData.durationMinutes / 60) > 0 ? Math.floor(formData.durationMinutes / 60) + "h " : ""}${formData.durationMinutes % 60 > 0 ? (formData.durationMinutes % 60) + "m" : ""}`.trim() }] : []),
                    ...(formData.ageLimit ? [{ label: "Age Limit", value: `${formData.ageLimit}+ only` }] : []),
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
                      <p className="font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Description</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{formData.description}</p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep("form")}>
                  Edit
                </Button>
                <Button className="flex-1 rounded-full shadow-md shadow-primary/20" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Publishing..." : "Publish Workshop"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="shadow-xl shadow-primary/5 border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">
                  Create <span className="gradient-text">New Workshop</span>
                </CardTitle>
              </CardHeader>
              <form onSubmit={handlePreview}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="image">Workshop Image</Label>
                    <Input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploading} className="rounded-lg" />
                    {uploading && <p className="text-sm text-primary animate-pulse">Uploading...</p>}
                    {imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden rounded-xl shadow-sm">
                        <Image src={imageUrl} alt="Workshop preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Workshop Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Beginner Salsa Workshop" defaultValue={formData?.title} required minLength={3} className="h-11 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Artist / Instructor Name</Label>
                    <Input id="artistName" name="artistName" placeholder="e.g., DJ Snake, Remo D'Souza" defaultValue={formData?.artistName} required minLength={2} className="h-11 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="danceStyle">Dance Style</Label>
                    <select id="danceStyle" name="danceStyle" defaultValue={formData?.danceStyle || ""} className={selectClass} required>
                      <option value="">Select a style</option>
                      {DANCE_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" name="description" rows={4} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Describe your workshop..." defaultValue={formData?.description} required minLength={10} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateTime">Date & Time</Label>
                      <Input id="dateTime" name="dateTime" type="datetime-local" defaultValue={formData?.dateTime} required className="h-11 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="e.g., Mumbai" defaultValue={formData?.city} required className="h-11 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input id="venue" name="venue" placeholder="e.g., Dance Studio XYZ, Andheri West" defaultValue={formData?.venue} required className="h-11 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mapUrl">Google Maps Link (optional)</Label>
                    <Input id="mapUrl" name="mapUrl" type="url" placeholder="https://maps.google.com/..." defaultValue={formData?.mapUrl} className="h-11 rounded-lg" />
                    <p className="text-xs text-muted-foreground">Paste the Google Maps link for your venue so attendees can find it easily</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per seat (₹)</Label>
                      <Input id="price" name="price" type="number" min={0} placeholder="0 for free" defaultValue={formData?.price} required className="h-11 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxSeats">Max Seats</Label>
                      <Input id="maxSeats" name="maxSeats" type="number" min={1} placeholder="e.g., 30" defaultValue={formData?.maxSeats} required className="h-11 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                      <Input id="durationMinutes" name="durationMinutes" type="number" min={15} max={480} placeholder="e.g., 90" defaultValue={formData?.durationMinutes} className="h-11 rounded-lg" />
                      <p className="text-xs text-muted-foreground">Optional. 15 min to 8 hours</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ageLimit">Minimum Age Limit</Label>
                      <Input id="ageLimit" name="ageLimit" type="number" min={5} max={99} placeholder="e.g., 18" defaultValue={formData?.ageLimit} className="h-11 rounded-lg" />
                      <p className="text-xs text-muted-foreground">Optional. Leave empty for all ages</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full rounded-full h-11 text-base shadow-md shadow-primary/20" disabled={uploading}>
                    Preview Workshop
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
