-- Batch with two statements that can return results, but neither do.
SELECT * FROM Roles WHERE roleId = :roleId1;
SELECT * FROM Roles WHERE roleId = :roleId2;