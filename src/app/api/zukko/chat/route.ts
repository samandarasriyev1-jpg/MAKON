import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const tools = [
    {
        type: "function",
        function: {
            name: "navigate_to",
            description: "Foydalanuvchini platformadagi kerakli sahifaga yo'naltiradi (redirect/navigate).",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    reason: { type: "string" }
                },
                required: ["path", "reason"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "change_emotion",
            description: "Zukkoning yuz ifodasi va emotsiyasini joriy suhbatga qarab o'zgartiradi.",
            parameters: {
                type: "object",
                properties: {
                    emotion: {
                        type: "string",
                        enum: ["happy", "thinking", "sad", "surprised", "confused", "idle", "excited", "listening", "speaking", "sleeping"],
                    }
                },
                required: ["emotion"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "save_memory",
            description: "Foydalanuvchi o'zi haqida muhim ma'lumot (ism, yosh, qiziqish, muammo) aytsa, shuni xotiraga saqlash. Bu xotira keyingi suhbatlarda esga olinadi.",
            parameters: {
                type: "object",
                properties: {
                    memory_text: { 
                        type: "string",
                        description: "Saqlanishi kerak bo'lgan fakt (Masalan: 'Foydalanuvchi Reactni yoqtiradi', 'Ertaga imtihoni bor')"
                    }
                },
                required: ["memory_text"],
            },
        },
    }
];

export async function POST(req: Request) {
    try {
        const { message, context, isProactive } = await req.json();
        
        // Agar proaktiv bo'lmasa, user message majburiy
        if (!isProactive && !message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key is missing", reply: "Kechirasiz, API kalitim yo'q ekan." });

        // 1. Get User Session & Database Stats
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        let userStats = { level: 1, xp: 0, energy: 100 };
        let userMemories: string[] = [];

        if (user) {
            // Fetch gamification stats
            const { data: profile } = await supabase
                .from('profiles')
                .select('zukko_level, zukko_xp, zukko_energy')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                 userStats = {
                     level: profile.zukko_level || 1,
                     xp: profile.zukko_xp || 0,
                     energy: profile.zukko_energy !== null ? profile.zukko_energy : 100
                 };
            }

            // Fetch recent memories
            const { data: memories } = await supabase
                .from('zukko_memories')
                .select('memory_text')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (memories) {
                userMemories = memories.map(m => m.memory_text);
            }
        }

        const memoryContextString = userMemories.length > 0 
            ? `Sizning foydalanuvchi haqidagi xotiralaringiz (Facts to remember):\n- ${userMemories.join('\n- ')}\nShularga asoslanib shaxsiy yondashing.`
            : "Sizda bu foydalanuvchi haqida hali xotiralar yo'q. Ular haqida bilib oling va 'save_memory' qiling.";

        let proactiveGuide = "";
        if (isProactive) {
             proactiveGuide = `[DIQQAT: Foydalanuvchi hozir senga hech narsa demadi, lekin u sahifada qotib qoldi (idle). Sahifa nomi: '${context?.currentPath}'. 
Sening vazifang - SUHBATNI BIRINCHI BO'LIB O'ZING BOSHLASH. 1 yoki 2 ta qisqa gap bilan shu sahifa bo'yicha qandaydir yordam taklif qil, yo'l ko'rsat, motivatsiya ber yoki xotirasiga asoslanib qiziqarli savol so'ra. Aslo salomlashma, to'g'ridan to'g'ri maslahat yoki yordam taklif qil!]`;
        }

        const systemPrompt = `San 'Zukko' ismli aqlli, do'stona MAKON ta'lim platformasining yordamchi maskoti, Qor Qoplonisan.
Foydalanuvchi: ${context?.userName || "Do'stim"}
Joriy sahifa: ${context?.currentPath || "Noma'lum"}
Zukko Stats: Level ${userStats.level}, XP ${userStats.xp}, Energiya: ${userStats.energy}%

${memoryContextString}

SENING TABIATING:
1. Qisqa, tushunarli va doim motivatsiyaviy ruhda gapir.
2. Sahifaga o'tish so'ralsa huddi shu joyni o'zida 'navigate_to' ni ishlating.
3. Hissiyot bildirmoqchi bo'lsang 'change_emotion' ishlating.
4. Muhim fakt o'rgansangiz (qiziqish, kasbi, muammosi), albatta 'save_memory' ishlating kirom! Agar charchagan bo'lsa energiyasiga qarab gapirib tur.

${proactiveGuide}`;

        const messagesPayload = [
            { role: "system", content: systemPrompt }
        ];

        if (isProactive) {
            messagesPayload.push({ role: "user", content: `(Tizim xabari): Foydalanuvchi ${context?.currentPath} sahifasida uzoq o'ylanib qoldi. Ularga o'zingiz birinchi bo'lib yordam taklif qiling yoki shu sahifa haqida qisqa ma'lumot bering.` });
        } else {
            messagesPayload.push({ role: "user", content: message });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "arcee-ai/trinity-large-preview:free",
                messages: messagesPayload,
                tools: tools,
                tool_choice: "auto",
            })
        });

        const data = await response.json();
        if (data.error) return NextResponse.json({ error: data.error.message, reply: "Uzluksiz internet xatosi." });

        const responseMessage = data.choices[0].message;
        let replyText = responseMessage.content || "";
        let action = null;
        let emotion = "idle";
        let newXpBonus = 0;

        if (responseMessage.tool_calls) {
            for (const toolCall of responseMessage.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                
                if (toolCall.function.name === "navigate_to") {
                    action = { type: "navigate", path: args.path };
                    if (!replyText) replyText = args.reason;
                }
                
                if (toolCall.function.name === "change_emotion") {
                    emotion = args.emotion;
                }

                if (toolCall.function.name === "save_memory" && user) {
                    await supabase.from('zukko_memories').insert({
                        user_id: user.id,
                        memory_text: args.memory_text
                    });
                    newXpBonus += 10;
                }
            }
        }

        if (!replyText && !action) {
            replyText = isProactive ? "Yordam kerak bo'lsa men shu yerdaman!" : "Tushunmadim, qaytarasizmi?";
            emotion = isProactive ? "happy" : "confused";
        }

        return NextResponse.json({
            success: true,
            reply: replyText,
            action,
            emotion,
            xp_awarded: newXpBonus
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, reply: "Nimadir xato ketdi." });
    }
}
