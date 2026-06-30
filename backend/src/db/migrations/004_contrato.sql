-- Adiciona coluna contrato (JSONB) e campos de serviço às solicitações
ALTER TABLE solicitacoes
  ADD COLUMN IF NOT EXISTS servico    VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS prazo      VARCHAR(80)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS contrato   JSONB        DEFAULT NULL;

-- Popula campos de contrato para registros fechados existentes
UPDATE solicitacoes SET
  contrato = jsonb_build_object(
    'assinado',    true,
    'numero',      CONCAT('CTR-', SUBSTRING(id FROM 5)),
    'valor',       'R$ 28.000,00 / ano',
    'aprovadoEm',  '15/06/2025',
    'inicio',      '01/07/2025',
    'validade',    '30/06/2026'
  )
WHERE id = 'SOL-2022' AND status = 'fechada';

UPDATE solicitacoes SET
  contrato = jsonb_build_object(
    'assinado',    true,
    'numero',      CONCAT('CTR-', SUBSTRING(id FROM 5)),
    'valor',       'R$ 9.600,00 / ano',
    'aprovadoEm',  '08/06/2025',
    'inicio',      '16/06/2025',
    'validade',    '15/06/2026'
  )
WHERE id = 'SOL-2019' AND status = 'fechada';
