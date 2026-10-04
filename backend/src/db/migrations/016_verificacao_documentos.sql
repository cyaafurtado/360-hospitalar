-- Fluxo de aprovação: o fornecedor anexa o arquivo e manda pra análise;
-- só depois que um admin aprova é que o documento passa a aparecer na
-- página pública da empresa (ver DocumentosRepo.listAprovadosPorEmpresas).
ALTER TABLE documentos_fornecedor ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'rascunho';
ALTER TABLE documentos_fornecedor DROP CONSTRAINT IF EXISTS documentos_fornecedor_status_check;
ALTER TABLE documentos_fornecedor ADD CONSTRAINT documentos_fornecedor_status_check
  CHECK (status IN ('rascunho', 'em_analise', 'aprovado', 'rejeitado'));

ALTER TABLE documentos_fornecedor ADD COLUMN IF NOT EXISTS enviado_em TIMESTAMP;
ALTER TABLE documentos_fornecedor ADD COLUMN IF NOT EXISTS revisado_em TIMESTAMP;
ALTER TABLE documentos_fornecedor ADD COLUMN IF NOT EXISTS motivo_rejeicao VARCHAR(255) NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_documentos_fornecedor_status ON documentos_fornecedor (status);
