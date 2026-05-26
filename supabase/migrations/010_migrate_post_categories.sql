-- Replace removed category slugs with the six publication pillars.
-- Run once after deploying the new category set.

UPDATE public.posts
SET category = CASE lower(trim(category))
  WHEN 'technology' THEN 'humor'
  WHEN 'design' THEN 'ladies'
  WHEN 'development' THEN 'war'
  WHEN 'lifestyle' THEN 'turkey'
  WHEN 'business' THEN 'eu'
  WHEN 'travel' THEN 'usa'
  ELSE category
END
WHERE lower(trim(category)) IN (
  'technology',
  'design',
  'development',
  'lifestyle',
  'business',
  'travel'
);
