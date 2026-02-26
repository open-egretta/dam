import Database from 'better-sqlite3'

export const db = new Database('database.sqlite')

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS category (
    id        TEXT NOT NULL PRIMARY KEY,
    name      TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS media (
    id          TEXT    NOT NULL PRIMARY KEY,
    filename    TEXT    NOT NULL,
    originalName TEXT   NOT NULL,
    mimeType    TEXT    NOT NULL,
    size        INTEGER NOT NULL,
    width       INTEGER NOT NULL,
    height      INTEGER NOT NULL,
    category    TEXT    NOT NULL,
    uploadedBy  TEXT    NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    createdAt   TEXT    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS media_category_idx ON media (category);
  CREATE INDEX IF NOT EXISTS media_uploadedBy_idx ON media (uploadedBy);
  CREATE INDEX IF NOT EXISTS media_createdAt_idx ON media (createdAt);
`)
