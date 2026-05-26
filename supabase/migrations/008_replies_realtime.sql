-- Nested replies + realtime (run after 005_comments.sql)

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  comment_id uuid not null references public.comments (id) on delete cascade,
  parent_reply_id uuid references public.replies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (
    char_length(trim(content)) > 0
    and char_length(content) <= 2000
  ),
  author_name text not null,
  author_avatar text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists replies_post_id_idx on public.replies (post_id);
create index if not exists replies_comment_id_created_at_idx
  on public.replies (comment_id, created_at asc);
create index if not exists replies_parent_reply_id_idx on public.replies (parent_reply_id);

alter table public.replies enable row level security;

create policy "Replies are viewable by everyone"
  on public.replies for select
  using (true);

create policy "Authenticated users can create replies"
  on public.replies for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own replies"
  on public.replies for delete
  using (auth.uid() = user_id);

-- Replies count toward post comment total (same as top-level comments)
create or replace function public.sync_post_reply_count()
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

drop trigger if exists on_reply_changed on public.replies;
create trigger on_reply_changed
  after insert or delete on public.replies
  for each row execute function public.sync_post_reply_count();

-- Realtime needs full row payload on INSERT
alter table public.replies replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.replies;
exception
  when duplicate_object then null;
end $$;
