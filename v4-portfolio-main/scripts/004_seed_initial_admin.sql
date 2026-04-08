-- Insert initial admin
-- Password: SamCloud2024 (hashed with SHA-256)
INSERT INTO admins (email, password)
VALUES ('graphstats.pro@gmail.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918')
ON CONFLICT (email) DO NOTHING;
