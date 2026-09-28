import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    if ((session.user as any).role === "member") {
      redirect("/portal");
    } else {
      redirect("/dashboard");
    }
  }

  return <HomeClient />;
}
