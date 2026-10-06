-- Razão social, nome fantasia, natureza jurídica e os dois responsáveis
-- (cadastro e técnico), cada um com contato próprio.
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS razao_social VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS natureza_juridica VARCHAR(120) NOT NULL DEFAULT '';

ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS resp_cadastro_nome VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS resp_cadastro_email VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS resp_cadastro_telefone VARCHAR(40) NOT NULL DEFAULT '';

ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS resp_tecnico_nome VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS resp_tecnico_email VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS resp_tecnico_telefone VARCHAR(40) NOT NULL DEFAULT '';
