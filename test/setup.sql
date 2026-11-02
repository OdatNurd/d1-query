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

-- Table for testing the conversion of integer fields into booleans; the
-- isEnabled field is nullable so that we can verify that NULL survives, and
-- isCount is named like a boolean but holds a number.
CREATE TABLE Flags (
  id INTEGER PRIMARY KEY,
  isActive BOOLEAN NOT NULL DEFAULT(false),
  is_visible BOOLEAN NOT NULL DEFAULT(false),
  isEnabled BOOLEAN,
  isCount INTEGER NOT NULL DEFAULT(0)
);

INSERT INTO Flags(id, isActive, is_visible, isEnabled, isCount)
  VALUES
    (1, 1, 0, NULL, 2),
    (2, 0, 1, NULL, 5)
;
