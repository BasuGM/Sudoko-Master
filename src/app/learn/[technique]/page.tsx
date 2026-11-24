import { Suspense } from "react";
import type { Metadata } from "next";
import { LessonView } from "@/components/learning/LearnViews";
import { LESSONS, lessonById } from "@/content/lessons";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ technique: lesson.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ technique: string }>;
}): Promise<Metadata> {
  const { technique } = await params;
  const lesson = lessonById(technique);
  return { title: lesson?.name ?? "Learn" };
}

export default function LessonPage({ params }: { params: Promise<{ technique: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto h-16" />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: Promise<{ technique: string }> }) {
  const { technique } = await params;
  return <LessonView id={technique} />;
}
