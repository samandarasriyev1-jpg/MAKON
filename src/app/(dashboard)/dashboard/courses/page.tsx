"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BookOpen, Clock, Star, PlayCircle, Search, Filter } from "lucide-react";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [filterFree, setFilterFree] = useState(false);
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

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterFree ? course.price === 0 : true;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white glow-text">Barcha Kurslar</h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Kurslarni qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setFilterFree(!filterFree)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filterFree ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black/20 border-white/10 text-muted-foreground hover:text-white hover:border-white/20'}`}
                    >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Faqat Bepul</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
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
                                    Ko&apos;rish
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCourses.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-white mb-1">Hech narsa topilmadi</h3>
                        <p className="text-sm text-muted-foreground">
                            Boshqa so&apos;z bilan qidirib ko&apos;ring yoki filterni o&apos;chiring.
                        </p>
                        {(searchQuery || filterFree) && (
                            <button
                                onClick={() => { setSearchQuery(""); setFilterFree(false); }}
                                className="mt-4 text-sm text-primary hover:underline font-medium"
                            >
                                Filterni tozalash
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
