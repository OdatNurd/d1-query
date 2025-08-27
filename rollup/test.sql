-- A simple query to get a user; uses anonymous bind.
SELECT * FROM Users WHERE userId = ?;

-- A second query, this one is named.
SELECT * FROM Users WHERE userId = :userId;

-- A third query, this one has no binds at all.
SELECT * FROM Users;