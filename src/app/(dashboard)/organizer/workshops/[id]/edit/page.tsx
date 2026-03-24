"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOverlayLoading } from "@/components/loading-overlay";

const DANCE_STYLES = [
  "Salsa", "Hip-Hop", "Bollywood", "Contemporary", "Ballet",
  "Bachata", "Kathak", "Bharatanatyam", "Jazz", "Freestyle", "Other",
];

interface Workshop {
  id: string;
  title: string;
  danceStyle: string;
  artistName: string;
  description: string;
  imageUrl: string | null;
  dateTime: string;
  city: string;
  studioName: string;
  studioAddress: string;
  mapUrl: string | null;
  price: number;
  maxSeats: number;
  bookedSeats: number;
  durationMinutes: number | null;
  ageLimit: number | null;
}

export default function EditWorkshopPage() {
  const router = useRouter();
  const params = useParams();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useOverlayLoading();
  const [selectedStyle, setSelectedStyle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/workshops/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkshop(data);
        if (data.imageUrl) setImageUrl(data.imageUrl);
        setSelectedStyle(DANCE_STYLES.includes(data.danceStyle) ? data.danceStyle : "Other");
      })
      .catch(() => setError("Failed to load workshop"));
  }, [params.id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setImageUrl(data.url);
    else setError(data.error || "Image upload failed");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const styleVal = formData.get("danceStyle") as string;
    const customStyle = formData.get("customDanceStyle") as string;
    const danceStyle = styleVal === "Other" ? customStyle : styleVal;

    if (styleVal === "Other" && (!customStyle || customStyle.length < 2)) {
      setError("Please enter a custom dance style name");
      setLoading(false);
      return;
    }

    const body = {
      title: formData.get("title") as string,
      danceStyle,
      description: formData.get("description") as string,
      dateTime: formData.get("dateTime") as string,
      mapUrl: (formData.get("mapUrl") as string) || "",
      price: Number(formData.get("price")),
      maxSeats: Number(formData.get("maxSeats")),
      durationMinutes: formData.get("durationMinutes") ? Number(formData.get("durationMinutes")) : null,
      ageLimit: formData.get("ageLimit") ? Number(formData.get("ageLimit")) : null,
      imageUrl: imageUrl || undefined,
    };
    const res = await fetch(`/api/workshops/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error);
    else router.push("/organizer/workshops");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this workshop?")) return;
    const res = await fetch(`/api/workshops/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/organizer/workshops");
    else {
      const data = await res.json();
      setError(data.error);
    }
  }

  if (!workshop) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const hasBookings = workshop.bookedSeats > 0;
  const selectClass = "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="flex justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl shadow-primary/5 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Edit Workshop</CardTitle>
            {!hasBookings ? (
              <Button variant="destructive" size="sm" className="rounded-full" onClick={handleDelete}>
                Delete
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground rounded-full bg-muted px-3 py-1.5">
                {workshop.bookedSeats} seat(s) booked — delete disabled
              </span>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
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
                <Input id="title" name="title" defaultValue={workshop.title} required minLength={3} className="h-11 rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label>Artist / Instructor Name</Label>
                <Input value={workshop.artistName} disabled className="h-11 rounded-lg bg-muted/50 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Cannot be changed after creation</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="danceStyle">Dance Style</Label>
                <select
                  id="danceStyle"
                  name="danceStyle"
                  defaultValue={DANCE_STYLES.includes(workshop.danceStyle) ? workshop.danceStyle : "Other"}
                  className={selectClass}
                  required
                  onChange={(e) => setSelectedStyle(e.target.value)}
                >
                  {DANCE_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                </select>
                {selectedStyle === "Other" && (
                  <Input
                    name="customDanceStyle"
                    placeholder="Enter your dance style"
                    defaultValue={!DANCE_STYLES.includes(workshop.danceStyle) ? workshop.danceStyle : ""}
                    required
                    minLength={2}
                    className="h-11 rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" rows={4} defaultValue={workshop.description} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary" required minLength={10} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateTime">Date & Time</Label>
                  <Input id="dateTime" name="dateTime" type="datetime-local" defaultValue={(() => {
                    const d = new Date(workshop.dateTime);
                    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                    return local.toISOString().slice(0, 16);
                  })()} required className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={workshop.city} disabled className="h-11 rounded-lg bg-muted/50 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Studio Name</Label>
                <Input value={workshop.studioName} disabled className="h-11 rounded-lg bg-muted/50 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Studio Address</Label>
                <Input value={workshop.studioAddress} disabled className="h-11 rounded-lg bg-muted/50 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">City, studio name and address cannot be changed after creation</p>
                {hasBookings && (
                  <p className="text-xs text-amber-600">Changing date or time will notify all booked attendees via email</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapUrl">Google Maps Link (optional)</Label>
                <Input id="mapUrl" name="mapUrl" type="url" placeholder="https://maps.google.com/..." defaultValue={workshop.mapUrl ?? ""} className="h-11 rounded-lg" />
                <p className="text-xs text-muted-foreground">Paste the Google Maps link for your studio</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per seat (₹)</Label>
                  <Input id="price" name="price" type="number" min={0} defaultValue={workshop.price} required className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSeats">Max Seats</Label>
                  <Input id="maxSeats" name="maxSeats" type="number" min={Math.max(1, workshop.bookedSeats)} defaultValue={workshop.maxSeats} required className="h-11 rounded-lg" />
                  {hasBookings && (
                    <p className="text-xs text-muted-foreground">Minimum {workshop.bookedSeats} (already booked)</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input id="durationMinutes" name="durationMinutes" type="number" min={15} max={480} placeholder="e.g., 90" defaultValue={workshop.durationMinutes ?? ""} className="h-11 rounded-lg" />
                  <p className="text-xs text-muted-foreground">Optional. 15 min to 8 hours</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageLimit">Minimum Age Limit</Label>
                  <Input id="ageLimit" name="ageLimit" type="number" min={5} max={99} placeholder="e.g., 18" defaultValue={workshop.ageLimit ?? ""} className="h-11 rounded-lg" />
                  <p className="text-xs text-muted-foreground">Optional. Leave empty for all ages</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full rounded-full h-11 text-base shadow-md shadow-primary/20" disabled={loading || uploading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
