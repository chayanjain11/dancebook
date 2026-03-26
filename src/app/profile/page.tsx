"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOverlayLoading } from "@/components/loading-overlay";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  city: string | null;
  studioName: string | null;
  studioAddress: string | null;
  mapUrl: string | null;
  image: string | null;
  createdAt: string;
  _count: {
    bookings: number;
    workshops: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioAddress, setStudioAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [loading, setLoading] = useOverlayLoading();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || "");
        setCity(data.city || "");
        setStudioName(data.studioName || "");
        setStudioAddress(data.studioAddress || "");
        setMapUrl(data.mapUrl || "");
      });
  }, [session]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading" || !profile) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isOrganizer = profile.role === "ORGANIZER";
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  async function handleSave() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, city, studioName, studioAddress, mapUrl }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      setProfile({ ...profile!, ...data });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Profile Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <Badge variant="secondary" className="rounded-full mt-2">
            {isOrganizer ? "Workshop Host" : "Dance Enthusiast"}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold gradient-text">
              {isOrganizer ? profile._count.workshops : profile._count.bookings}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isOrganizer ? "Workshops Created" : "Workshops Booked"}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold">{memberSince}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Member Since</p>
          </div>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
          >
            Profile updated successfully!
          </motion.div>
        )}

        {/* Profile Details */}
        <Card className="shadow-lg shadow-primary/5 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Profile Details</CardTitle>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Mumbai"
                    className="h-11 rounded-lg"
                  />
                </div>
                {isOrganizer && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="studioName">Studio Name</Label>
                      <Input
                        id="studioName"
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        placeholder="e.g., Dance Studio XYZ"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studioAddress">Studio Address</Label>
                      <Input
                        id="studioAddress"
                        value={studioAddress}
                        onChange={(e) => setStudioAddress(e.target.value)}
                        placeholder="e.g., Andheri West, Mumbai"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mapUrl">Google Maps Link</Label>
                      <Input
                        id="mapUrl"
                        type="url"
                        value={mapUrl}
                        onChange={(e) => setMapUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 rounded-full shadow-md shadow-primary/20"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setEditing(false);
                      setName(profile.name);
                      setPhone(profile.phone || "");
                      setCity(profile.city || "");
                      setStudioName(profile.studioName || "");
                      setStudioAddress(profile.studioAddress || "");
                      setMapUrl(profile.mapUrl || "");
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Name", value: profile.name },
                  { label: "Email", value: profile.email },
                  { label: "Phone", value: profile.phone || "Not set" },
                  { label: "City", value: profile.city || "Not set" },
                  ...(isOrganizer ? [
                    { label: "Studio Name", value: profile.studioName || "Not set" },
                    { label: "Studio Address", value: profile.studioAddress || "Not set" },
                    { label: "Google Maps", value: profile.mapUrl || "Not set" },
                  ] : []),
                  { label: "Account Type", value: isOrganizer ? "Host" : "Customer" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
