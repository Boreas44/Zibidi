-- Post media: image, video, YouTube, or Instagram embed (stored as JSONB)

alter table public.posts
  add column if not exists media jsonb default null;

comment on column public.posts.media is
  'Optional post media: { type, sourceUrl, videoId?, shortcode? }';
