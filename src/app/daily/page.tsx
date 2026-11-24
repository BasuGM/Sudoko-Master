import type { Metadata } from "next";
import { DailyView } from "@/components/game/DailyView";

export const metadata: Metadata = { title: "Daily" };

export default function DailyPage() {
  return <DailyView />;
}
