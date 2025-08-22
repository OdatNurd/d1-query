-- Insert a role and then select it
INSERT INTO Roles (roleId, roleName) VALUES (:roleId, :roleName);
SELECT * FROM Roles WHERE roleId = :roleId;