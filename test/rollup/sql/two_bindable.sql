-- Two statements, both bindable
SELECT * FROM Roles WHERE roleId = :roleId;
INSERT INTO Roles (roleId, roleName) VALUES (:roleId, :roleName);