-- Ejecutar esto una sola vez en Postgres para crear la base de datos.
-- Las TABLAS las crea Hibernate automaticamente (ddl-auto: update) al levantar la app.

CREATE DATABASE ferreteria_db;

-- (opcional) crear un usuario especifico en vez de usar "postgres"
-- CREATE USER ferreteria_user WITH PASSWORD 'una_password_segura';
-- GRANT ALL PRIVILEGES ON DATABASE ferreteria_db TO ferreteria_user;
