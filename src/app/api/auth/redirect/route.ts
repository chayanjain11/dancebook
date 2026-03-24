import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ORGANIZER") {
    redirect("/organizer/workshops");
  }

  redirect("/workshops");
}
