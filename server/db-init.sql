PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        screen_name TEXT,
        rebrickable_api_key TEXT,
        rebrickable_user_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
-- INSERT INTO users VALUES('3c854ea3-a213-4d20-9f36-646ec4b6d9b6','dcvezzani@gmail.com','David Vezzani','Dave',null, null,'2025-06-12 15:37:24','2025-06-12 15:45:13');
COMMIT;