import type { Metadata } from "next";
import { ProgressView } from "@/components/statistics/ProgressView";

export const metadata: Metadata = { title: "Progress" };

export default function StatisticsPage() {
  return <ProgressView />;
}
