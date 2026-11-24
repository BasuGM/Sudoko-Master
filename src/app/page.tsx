import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";

export const metadata: Metadata = { title: "Play" };

export default function HomePage() {
  return <HomeView />;
}
