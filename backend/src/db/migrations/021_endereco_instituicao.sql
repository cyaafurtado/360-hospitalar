-- Endereço da instituição — só existia cidade/estado, sem rua/número.
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS endereco VARCHAR(255) NOT NULL DEFAULT '';
