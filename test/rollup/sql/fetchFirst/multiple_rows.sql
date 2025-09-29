-- A query that returns multiple rows
SELECT * FROM Roles WHERE roleId IN (:roleId1, :roleId2) ORDER BY roleId ASC;