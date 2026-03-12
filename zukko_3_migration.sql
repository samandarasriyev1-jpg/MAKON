-- ZUKKO 3.0 MIGRATION SCRIPT (FIXED & SAFE VERSION)
-- Bu kodni Supabase SQL Editorga tashlab RUN qiling. Barcha xatoliklarni aylanib o'tish uchun yozilgan.

-- 1. Avval Profiles jadvali bor yo'qligini tekshiramiz va agar yo'q bo'lsa yaratamiz! (Sizdagi xatolik shundan edi)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('student', 'teacher', 'admin')) default 'student',
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Endi Zukko Gamification (Tamagotchi) ustunlarini qo'shamiz (Agar oldin qo'shilmagan bo'lsa)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS zukko_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS zukko_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS zukko_energy INTEGER DEFAULT 100;

-- 3. Zukko uchun Xotira (Memory) jadvalidan oldingisini o'chirib yangidan yaratamiz (policy xatolarini oldini olish uchun)
DROP TABLE IF EXISTS public.zukko_memories;

CREATE TABLE public.zukko_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    memory_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Xavfsizlik qoidalari (RLS Policies)
ALTER TABLE public.zukko_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memories" 
    ON public.zukko_memories FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" 
    ON public.zukko_memories FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
    ON public.zukko_memories FOR DELETE 
    USING (auth.uid() = user_id);

COMMENT ON TABLE public.zukko_memories IS 'Stores long-term memories collected by the Zukko AI companion for personalized user interactions.';
