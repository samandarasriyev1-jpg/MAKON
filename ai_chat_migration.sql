-- ai_chat_migration.sql
-- Run this in your Supabase SQL Editor to add AI Mentor chat history

create table if not exists public.ai_chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'ai', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.ai_chat_history enable row level security;

-- Policies
create policy "Users can view own chat history." 
  on public.ai_chat_history for select 
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages." 
  on public.ai_chat_history for insert 
  with check (auth.uid() = user_id);

-- Optional: Create index for faster querying
create index if not exists ai_chat_history_user_id_idx on public.ai_chat_history(user_id);
create index if not exists ai_chat_history_created_at_idx on public.ai_chat_history(created_at);
