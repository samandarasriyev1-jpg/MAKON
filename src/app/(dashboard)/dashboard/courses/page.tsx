"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { BookOpen, Clock, Star, PlayCircle } from "lucide-react";

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    quality_badge: boolean;
    teacher_id: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCourses() {
            const { data } = await supabase.from("courses").select("*");
            setCourses(data || []);
            setLoading(false);
        }
        fetchCourses();
    }, [supabase]);

    if (loading) {
        return <div className="p-8 text-white">Yuklanmoqda...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white glow-text">Barcha Kurslar</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div key={course.id} className="glass-card group relative overflow-hidden flex flex-col hover:bg-white/10 transition-all duration-300">
                        {/* Thumbnail Placeholder */}
                        <div className="h-48 w-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <BookOpen className="h-12 w-12 text-primary/50" />
                        </div>

                        {course.quality_badge && (
                            <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded-full border border-yellow-500/50 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500" /> PRO
                            </div>
                        )}

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                {course.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-primary font-bold">
                                    {course.price > 0 ? `${course.price.toLocaleString()} UZS` : "Bepul"}
                                </span>
                                <Link
                                    href={`/dashboard/courses/${course.id}`}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-primary hover:text-[#0A192F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    <PlayCircle className="h-4 w-4" />
                                    Ko'rish
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        Hozircha kurslar mavjud emas.
                    </div>
                )}
            </div>
        </div>
    );
}
