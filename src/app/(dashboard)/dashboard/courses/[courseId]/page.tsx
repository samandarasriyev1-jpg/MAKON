"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Lock } from "lucide-react";
import { useParams } from "next/navigation";

interface Lesson {
    id: string;
    title: string; // We might need to extract title from content or add title to schema. 
    // Schema says: content TEXT. We'll use a snippet of content or just "Lesson {order}" if no title column.
    // Wait, schema has 'content' but no 'title' for lessons? 
    // Schema: id, course_id, video_url, content, order.
    // Let's assume content has title or we just use "Dars {order}"
    content: string;
    order: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
}

export default function CourseDetailPage() {
    const params = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            if (!params.courseId) return;

            // Fetch Course
            const { data: courseData } = await supabase
                .from("courses")
                .select("*")
                .eq("id", params.courseId)
                .single();

            setCourse(courseData);

            // Fetch Lessons
            const { data: lessonsData } = await supabase
                .from("lessons")
                .select("*")
                .eq("course_id", params.courseId)
                .order("order", { ascending: true });

            setLessons(lessonsData || []);
            setLoading(false);
        }
        fetchData();
    }, [params.courseId, supabase]);

    if (loading) return <div className="p-8 text-white">Yuklanmoqda...</div>;
    if (!course) return <div className="p-8 text-white">Kurs topilmadi.</div>;

    return (
        <div className="space-y-8">
            <Link href="/dashboard/courses" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Barcha Kurslar
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
                <p className="text-muted-foreground">{course.description}</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Darslar</h2>
                <div className="grid gap-4">
                    {lessons.map((lesson) => (
                        <Link
                            key={lesson.id}
                            href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                            className="glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-[#0A192F] transition-colors">
                                    {lesson.order}
                                </div>
                                <div>
                                    {/* Extract title from content (first line) or fallback */}
                                    <h3 className="font-medium text-white">
                                        {lesson.content.split('\n')[0].replace('# ', '') || `Dars ${lesson.order}`}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">Video Dars</span>
                                </div>
                            </div>
                            <PlayCircle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                    ))}

                    {lessons.length === 0 && (
                        <div className="text-muted-foreground">Hozircha darslar yuklanmagan.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
