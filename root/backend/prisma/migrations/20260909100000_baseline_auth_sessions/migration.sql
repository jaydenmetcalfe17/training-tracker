CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_auth_sessions_expire" ON "auth_sessions" ("expire");