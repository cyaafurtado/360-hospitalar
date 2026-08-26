-- Confirmação de e-mail no cadastro. DEFAULT TRUE aqui é só pra não trancar
-- fora quem já tem conta (inclusive os admins criados direto por migration);
-- o registro de conta nova (auth.controller.ts) grava email_verificado=FALSE
-- explicitamente e só libera login depois de confirmar o link.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS verificacao_token_hash VARCHAR(64);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS verificacao_expira_em TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_usuarios_verificacao_token ON usuarios (verificacao_token_hash);
