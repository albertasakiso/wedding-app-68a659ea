alter table public.events
  add column if not exists icon text not null default 'Calendar',
  add column if not exists highlight_color text;