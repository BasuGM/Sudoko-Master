import type { Metadata } from "next";
import { LearnList } from "@/components/learning/LearnViews";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return <LearnList />;
}
