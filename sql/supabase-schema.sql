create extension if not exists "pgcrypto";

-- remove old tables (if present) to avoid conflicts when re-running this schema
drop table if exists inventory_history cascade;
drop table if exists products cascade;
drop table if exists profiles cascade;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('admin','customer')),
  email text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  variant text not null,
  price numeric not null default 0,
  stock integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists inventory_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  action text not null,
  quantity integer not null default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table inventory_history enable row level security;

create policy "Users can view their own profile" on profiles
for select using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on profiles
for update using (auth.uid() = id);

create policy "Authenticated users can read products" on products
for select using (auth.role() = 'authenticated');

create policy "Admins can manage products" on products
for all using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Authenticated users can read history" on inventory_history
for select using (auth.role() = 'authenticated');

create policy "Admins can manage history" on inventory_history
for all using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
