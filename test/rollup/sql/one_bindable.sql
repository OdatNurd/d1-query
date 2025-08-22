-- Two statements, only one is bindable
SELECT * FROM Roles WHERE roleId = 1;
SELECT * FROM Roles WHERE roleName = :roleName;