-- Batch with no result-producing statements
INSERT INTO Roles (roleId, roleName) VALUES(:roleId, :roleName);
UPDATE Roles SET roleName = :roleName WHERE roleId = :roleId;