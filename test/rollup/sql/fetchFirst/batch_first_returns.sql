-- Batch where the first statement returns a result
SELECT * FROM Roles WHERE roleId IN (:roleId1, :roleId2) ORDER BY roleId ASC;
INSERT INTO Roles (roleId, roleName) VALUES(:roleId3, :roleName);