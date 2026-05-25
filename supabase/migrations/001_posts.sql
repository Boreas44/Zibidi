-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "uuid-ossp";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  excerpt text not null,
  category text not null,
  author_name text not null default 'You',
  author_avatar text not null default 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  cover_image text not null default 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop',
  read_time text not null,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Anyone can create posts"
  on public.posts for insert
  with check (true);

-- Optional: tighten update/delete when you add Supabase Auth
