-- Batch where the first potential result is empty, but the second is not.
SELECT * FROM Roles WHERE roleId = :roleId1;
SELECT * FROM Roles WHERE roleId = :roleId2;