-- "Esqueci a senha": mesmo padrão do token de confirmação de e-mail (opaco,
-- só o hash SHA-256 fica salvo, validade curta — aqui 1h, não 48h, porque
-- reset de senha é mais sensível que confirmar cadastro).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS recuperacao_token_hash VARCHAR(64);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS recuperacao_expira_em TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_usuarios_recuperacao_token ON usuarios (recuperacao_token_hash);
