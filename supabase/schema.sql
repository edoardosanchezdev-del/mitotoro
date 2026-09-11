-- Ejecutar en el SQL Editor de Supabase

create extension if not exists "pgcrypto";

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 48),
  memory_date date not null,
  description text check (char_length(description) <= 500),
  cover_path text not null,
  song_path text,
  song_title text,
  song_artist text,
  song_preview_url text,
  song_artwork_url text,
  song_start_seconds int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists memories_date_idx on public.memories (memory_date desc);
create index if not exists memory_media_memory_idx on public.memory_media (memory_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists memories_updated_at on public.memories;
create trigger memories_updated_at
before update on public.memories
for each row execute function public.set_updated_at();

alter table public.memories enable row level security;
alter table public.memory_media enable row level security;

drop policy if exists "memories authenticated all" on public.memories;
create policy "memories authenticated all"
on public.memories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "memory_media authenticated all" on public.memory_media;
create policy "memory_media authenticated all"
on public.memory_media
for all
to authenticated
using (true)
with check (true);

-- Bucket: crear "memories" en Storage (Dashboard > Storage)
-- Políticas de storage (ejecutar después de crear el bucket):

-- insert into storage.buckets (id, name, public) values ('memories', 'memories', true);

-- create policy "auth upload memories"
-- on storage.objects for insert to authenticated
-- with check (bucket_id = 'memories');

-- create policy "auth update memories"
-- on storage.objects for update to authenticated
-- using (bucket_id = 'memories');

-- create policy "auth delete memories"
-- on storage.objects for delete to authenticated
-- using (bucket_id = 'memories');

-- create policy "public read memories"
-- on storage.objects for select to public
-- using (bucket_id = 'memories');
