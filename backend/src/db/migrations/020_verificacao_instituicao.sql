-- CNPJ/CNES da instituição vão pra análise do admin assim que o cadastro é
-- finalizado — mas isso nunca bloqueia o uso da conta, é só um selo de
-- confiança. Diferente dos documentos do fornecedor, aqui não existe
-- 'rascunho': a linha já nasce em análise (criada só no fim do assistente).
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'em_analise';
ALTER TABLE instituicoes DROP CONSTRAINT IF EXISTS instituicoes_status_check;
ALTER TABLE instituicoes ADD CONSTRAINT instituicoes_status_check
  CHECK (status IN ('em_analise', 'aprovado', 'rejeitado'));

ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS revisado_em TIMESTAMP;
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS motivo_rejeicao VARCHAR(255) NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_instituicoes_status ON instituicoes (status);
