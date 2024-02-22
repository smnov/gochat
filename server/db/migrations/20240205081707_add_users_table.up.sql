CREATE TABLE IF NOT EXISTS "users" (
  "id" bigserial PRIMARY KEY,
  "username" varchar NOT NULL,
  "email" varchar NOT NULL,
  "password" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "rooms" (
  "id" bigserial PRIMARY KEY,
  "owner_id" bigserial NOT NULL
);
