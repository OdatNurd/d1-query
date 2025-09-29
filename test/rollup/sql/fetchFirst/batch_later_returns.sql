-- Batch where a later statement returns a result
INSERT INTO Roles (roleId, roleName) VALUES(:roleId, :roleName);
SELECT * FROM Roles WHERE roleName = :roleName;