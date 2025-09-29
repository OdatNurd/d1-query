-- Batch where a later statement could return a result but doesn't
INSERT INTO Roles (roleId, roleName) VALUES(:roleId, :roleName);
SELECT * FROM Roles WHERE roleName = :roleName;