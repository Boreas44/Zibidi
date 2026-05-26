-- Persistent like / dislike per user (run after 001_posts.sql)

alter table public.posts
  add column if not exists dislikes_count integer not null default 0;

create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists post_reactions_post_id_idx on public.post_reactions (post_id);
create index if not exists post_reactions_user_id_idx on public.post_reactions (user_id);

alter table public.post_reactions enable row level security;

create policy "Reactions are viewable by everyone"
  on public.post_reactions for select
  using (true);

create policy "Users can insert own reactions"
  on public.post_reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reactions"
  on public.post_reactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.post_reactions for delete
  using (auth.uid() = user_id);

create or replace function public.sync_post_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.reaction = 'like' then
      update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    else
      update public.posts set dislikes_count = dislikes_count + 1 where id = new.post_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.reaction = 'like' then
      update public.posts
      set likes_count = greatest(0, likes_count - 1)
      where id = old.post_id;
    else
      update public.posts
      set dislikes_count = greatest(0, dislikes_count - 1)
      where id = old.post_id;
    end if;
    return old;
  elsif tg_op = 'UPDATE' then
    if old.reaction is distinct from new.reaction then
      if old.reaction = 'like' then
        update public.posts
        set
          likes_count = greatest(0, likes_count - 1),
          dislikes_count = dislikes_count + 1
        where id = new.post_id;
      else
        update public.posts
        set
          dislikes_count = greatest(0, dislikes_count - 1),
          likes_count = likes_count + 1
        where id = new.post_id;
      end if;
    end if;
    return new;
  end if;
  return null;
end;
$$;

drop trigger if exists on_post_reaction_changed on public.post_reactions;
create trigger on_post_reaction_changed
  after insert or update or delete on public.post_reactions
  for each row execute function public.sync_post_reaction_counts();

-- Backfill counts from existing reactions (if any)
update public.posts p
set
  likes_count = coalesce((
    select count(*)::integer
    from public.post_reactions r
    where r.post_id = p.id and r.reaction = 'like'
  ), 0),
  dislikes_count = coalesce((
    select count(*)::integer
    from public.post_reactions r
    where r.post_id = p.id and r.reaction = 'dislike'
  ), 0);
