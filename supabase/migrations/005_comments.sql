-- Post comments (run after 003_auth_profiles.sql)

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (
    char_length(trim(content)) > 0
    and char_length(content) <= 2000
  ),
  author_name text not null,
  author_avatar text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_created_at_idx
  on public.comments (post_id, created_at asc);

create index if not exists comments_user_id_idx on public.comments (user_id);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Keep posts.comments_count in sync
create or replace function public.sync_post_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set comments_count = comments_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts
    set comments_count = greatest(0, comments_count - 1)
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_changed on public.comments;
create trigger on_comment_changed
  after insert or delete on public.comments
  for each row execute function public.sync_post_comments_count();

-- Backfill counts for existing posts
update public.posts p
set comments_count = (
  select count(*)::integer from public.comments c where c.post_id = p.id
);
