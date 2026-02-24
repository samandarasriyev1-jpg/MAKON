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
