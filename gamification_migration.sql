-- gamification_migration.sql
-- Run this in your Supabase SQL Editor to add Gamification & Community features and leagues

-- 7. Gamification & Leagues
create table if not exists public.leagues (
  id serial primary key,
  name text not null,
  min_xp integer default 0,
  icon_url text
);

-- Insert default leagues
insert into public.leagues (id, name, min_xp) values 
  (1, 'Yog''och', 0),
  (2, 'Bronza', 500),
  (3, 'Kumush', 1500),
  (4, 'Oltin', 3000),
  (5, 'Olmos', 5000)
on conflict (id) do update set name = excluded.name, min_xp = excluded.min_xp;

create table if not exists public.gamification_profiles (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  total_xp integer default 0,
  league_id integer references public.leagues(id) default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.gamification_profiles enable row level security;
create policy "Gamification profiles are viewable by everyone." on public.gamification_profiles for select using (true);
create policy "Users can update own gamification profile." on public.gamification_profiles for update using (auth.uid() = user_id);

-- 8. User Streaks
create table if not exists public.user_streaks (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  freeze_count integer default 0
);

alter table public.user_streaks enable row level security;
create policy "Users can view own streaks." on public.user_streaks for select using (auth.uid() = user_id);
create policy "Users can update own streaks." on public.user_streaks for update using (auth.uid() = user_id);

-- Update handle_new_user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce(new.raw_user_meta_data->>'role', 'student'));
  
  insert into public.gamification_profiles (user_id, total_xp, league_id)
  values (new.id, 0, 1)
  on conflict do nothing;
  
  insert into public.user_streaks (user_id, current_streak, longest_streak)
  values (new.id, 0, 0)
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Insert existing users into gamification and streak tables manually
insert into public.gamification_profiles (user_id, total_xp, league_id)
select id, 0, 1 from public.profiles
on conflict do nothing;

insert into public.user_streaks (user_id, current_streak, longest_streak)
select id, 0, 0 from public.profiles
on conflict do nothing;

-- 9. Community
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade,
  title text,
  content text not null,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.community_posts enable row level security;
create policy "Community posts are viewable by everyone." on public.community_posts for select using (true);
create policy "Authenticated users can insert posts." on public.community_posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts." on public.community_posts for update using (auth.uid() = author_id);
create policy "Users can delete own posts." on public.community_posts for delete using (auth.uid() = author_id);

create table if not exists public.community_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.community_comments(id) on delete cascade,
  content text not null,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.community_comments enable row level security;
create policy "Comments are viewable by everyone." on public.community_comments for select using (true);
create policy "Authenticated users can insert comments." on public.community_comments for insert with check (auth.uid() = author_id);
create policy "Users can update own comments." on public.community_comments for update using (auth.uid() = author_id);
create policy "Users can delete own comments." on public.community_comments for delete using (auth.uid() = author_id);

create table if not exists public.post_likes (
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "Likes viewable by everyone" on public.post_likes for select using (true);
create policy "User can like" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "User can unlike" on public.post_likes for delete using (auth.uid() = user_id);

create table if not exists public.comment_likes (
  comment_id uuid references public.community_comments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (comment_id, user_id)
);
alter table public.comment_likes enable row level security;
create policy "Likes viewable by everyone" on public.comment_likes for select using (true);
create policy "User can like" on public.comment_likes for insert with check (auth.uid() = user_id);
create policy "User can unlike" on public.comment_likes for delete using (auth.uid() = user_id);
