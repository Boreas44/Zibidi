-- Unique display names (case-insensitive) + sync author fields when profile changes.
-- Run after 003_auth_profiles.sql and 005_comments.sql.

-- Trim/normalize display_name on write
create or replace function public.normalize_profile_display_name()
returns trigger
language plpgsql
as $$
begin
  new.display_name := trim(regexp_replace(new.display_name, '\s+', ' ', 'g'));
  return new;
end;
$$;

drop trigger if exists profiles_normalize_display_name on public.profiles;
create trigger profiles_normalize_display_name
  before insert or update of display_name on public.profiles
  for each row execute function public.normalize_profile_display_name();

-- Case-insensitive unique nicknames (fails if duplicates already exist — rename them first)
create unique index if not exists profiles_display_name_lower_unique_idx
  on public.profiles (lower(display_name));

create or replace function public.is_display_name_available(
  p_name text,
  p_exclude_user_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where lower(display_name) = lower(trim(regexp_replace(p_name, '\s+', ' ', 'g')))
      and (p_exclude_user_id is null or id <> p_exclude_user_id)
  );
$$;

grant execute on function public.is_display_name_available(text, uuid) to anon, authenticated;

-- Keep denormalized author_name / author_avatar on posts and comments in sync
create or replace function public.sync_profile_author_on_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.display_name is distinct from old.display_name
     or new.avatar_url is distinct from old.avatar_url then
    update public.posts
    set
      author_name = new.display_name,
      author_avatar = coalesce(new.avatar_url, '')
    where user_id = new.id;

    update public.comments
    set
      author_name = new.display_name,
      author_avatar = coalesce(new.avatar_url, '')
    where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_author_on_content on public.profiles;
create trigger profiles_sync_author_on_content
  after update on public.profiles
  for each row execute function public.sync_profile_author_on_content();

-- One-time backfill: align existing posts/comments with current profile names
update public.posts p
set
  author_name = pr.display_name,
  author_avatar = coalesce(pr.avatar_url, '')
from public.profiles pr
where p.user_id = pr.id
  and (
    p.author_name is distinct from pr.display_name
    or p.author_avatar is distinct from coalesce(pr.avatar_url, '')
  );

update public.comments c
set
  author_name = pr.display_name,
  author_avatar = coalesce(pr.avatar_url, '')
from public.profiles pr
where c.user_id = pr.id
  and (
    c.author_name is distinct from pr.display_name
    or c.author_avatar is distinct from coalesce(pr.avatar_url, '')
  );
