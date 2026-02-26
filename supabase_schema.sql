-- 1. Profiles Table (Ro'yxatdan o'tgan foydalanuvchilar va ularning rollari)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('student', 'teacher', 'admin')) default 'student',
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Xavfsizlik qoidalari) Profiles uchun
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Courses Table (Agar mavjud bo'lmasa yoki yangilash kerak bo'lsa)
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price integer default 0,
  thumbnail_url text,
  quality_badge boolean default false,
  teacher_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Courses uchun
alter table public.courses enable row level security;
create policy "Courses are viewable by everyone." on public.courses for select using (true);
create policy "Teachers can insert courses." on public.courses for insert with check (
  exists ( select 1 from public.profiles where id = auth.uid() and role = 'teacher' )
);
create policy "Teachers can update own courses." on public.courses for update using (
  teacher_id = auth.uid()
);

-- 3. Lessons Table (Darslar)
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text, 
  "order" integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Lessons uchun
alter table public.lessons enable row level security;
create policy "Lessons are viewable by everyone." on public.lessons for select using (true);
create policy "Teachers can manage lessons for own courses." on public.lessons for all using (
  exists ( select 1 from public.courses where id = lessons.course_id and teacher_id = auth.uid() )
);

-- 4. Enrollments Table (A'zo bo'lish)
create table if not exists public.enrollments (
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (student_id, course_id)
);

-- RLS Enrollments uchun
alter table public.enrollments enable row level security;
create policy "Users can view own enrollments." on public.enrollments for select using (auth.uid() = student_id);
create policy "Teachers can view enrollments for their courses." on public.enrollments for select using (
  exists ( select 1 from public.courses where id = enrollments.course_id and teacher_id = auth.uid() )
);
create policy "Users can enroll themselves." on public.enrollments for insert with check (auth.uid() = student_id);

-- 5. Grades Table (Baholar)
create table if not exists public.grades (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  score integer check (score >= 0 and score <= 100),
  feedback text,
  graded_at timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id, lesson_id)
);

-- RLS Grades uchun
alter table public.grades enable row level security;
create policy "Students can view own grades." on public.grades for select using (auth.uid() = student_id);
create policy "Teachers can manage grades for their course lessons." on public.grades for all using (
  exists (
    select 1 from public.lessons
    join public.courses on lessons.course_id = courses.id
    where lessons.id = grades.lesson_id and courses.teacher_id = auth.uid()
  )
);

-- Trigger to create profile on signup (Muhim!)
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

-- Trigger to run every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. User Progress Table (Foydalanuvchi dars jarayoni)
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false,
  progress_seconds integer default 0,
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, lesson_id)
);

-- RLS User Progress uchun
alter table public.user_progress enable row level security;
create policy "Users can view own progress." on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress." on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress." on public.user_progress for update using (auth.uid() = user_id);

-- 7. Gamification & Leagues
create table if not exists public.leagues (
  id serial primary key,
  name text not null,
  min_xp integer default 0,
  icon_url text
);

-- Insert default leagues (using DO block to avoid duplicate issues safely, or just ON CONFLICT if we add a unique constraint)
-- We will just insert them manually if they don't exist
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

-- 9. Community
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade, -- null bo'lsa umumiy post
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
  parent_id uuid references public.community_comments(id) on delete cascade, -- for nested comments
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
