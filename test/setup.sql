-- Test User table
CREATE TABLE Users (
  userId INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  isCool BOOLEAN NOT NULL DEFAULT(false)
);

-- Users for testing with
INSERT INTO Users(userId, username)
  VALUES
    (1, "bob"),
    (69, "jim")
;
