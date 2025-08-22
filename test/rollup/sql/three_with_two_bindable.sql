-- Three statements, two are bindable
SELECT * FROM Roles WHERE roleId = :roleId;
SELECT * FROM Roles WHERE roleId = 1;
INSERT INTO Roles (roleId, roleName) VALUES (:roleId, :roleName);