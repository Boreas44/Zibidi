-- Saved posts (bookmarks) per user — run after 001_posts.sql

create table if not exists public.saved_posts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists saved_posts_user_id_idx on public.saved_posts (user_id);
create index if not exists saved_posts_post_id_idx on public.saved_posts (post_id);

alter table public.saved_posts enable row level security;

create policy "Users can view own saved posts"
  on public.saved_posts for select
  using (auth.uid() = user_id);

create policy "Users can save posts"
  on public.saved_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave posts"
  on public.saved_posts for delete
  using (auth.uid() = user_id);
