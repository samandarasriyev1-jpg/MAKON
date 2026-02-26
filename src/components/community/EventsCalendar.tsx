"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Users, Video } from "lucide-react";

interface Event {
    id: string;
    title: string;
    date: Date;
    durationMinutes: number;
    participantsCount: number;
    isLive: boolean;
    description: string;
}

export function EventsCalendar() {
    // Mock events for now
    const [events] = useState<Event[]>([
        {
            id: "1",
            title: "Qishgi ta'til uchun Maxsus Savol-Javob",
            date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
            durationMinutes: 60,
            participantsCount: 142,
            isLive: false,
            description: "Matematika fanidan tayyorgarlik bo'yicha onlayn uchrashuv."
        },
        {
            id: "2",
            title: "11-Sinf: Oliy ta'limga kirish sirlari",
            date: new Date(Date.now() + 1000 * 60 * 30), // In 30 mins
            durationMinutes: 90,
            participantsCount: 89,
            isLive: true,
            description: "Ekspertlar bilan bepul jonli dars."
        }
    ]);

    return (
        <div className="glass-card p-6 rounded-3xl sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Taqvim & Efirlar
                </h3>
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 relative overflow-hidden group">

                        {event.isLive && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/90 text-white text-[10px] font-bold uppercase rounded-bl-lg flex items-center gap-1 animate-pulse">
                                <Video className="h-3 w-3" /> Jonli
                            </div>
                        )}

                        <h4 className="font-bold text-white mb-2 pr-12">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1 text-primary">
                                <Clock className="h-3.5 w-3.5" />
                                {event.date.toLocaleDateString("uz-UZ", { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {event.participantsCount} kishi
                            </div>
                        </div>

                        <button className={`w-full mt-4 py-2 rounded-lg text-sm font-bold transition-all ${event.isLive ? 'bg-primary text-[#0A192F] hover:bg-primary/90' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                            {event.isLive ? "Qo'shilish" : "Eslatma o'rnatish"}
                        </button>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        Yaqin orada tadbirlar yo&apos;q
                    </div>
                )}
            </div>
        </div>
    );
}
