-- O cadastro de fornecedor agora é em duas etapas: o pré-cadastro (CNPJ, nome,
-- segmento, UF, cidade) já grava a empresa no banco, mas ela só fica visível no
-- diretório e elegível para receber pedidos de orçamento quando o fornecedor
-- termina o restante do formulário (área de atuação, contato, plano).

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'completo';

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_status_check;
ALTER TABLE companies
  ADD CONSTRAINT companies_status_check CHECK (status IN ('pre_cadastro', 'completo'));

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies (status);
