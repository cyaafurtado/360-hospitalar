-- Plano comercial da empresa (etapa 4 do cadastro já coleta a escolha na tela,
-- mas até aqui ela era só visual e nunca chegava no banco). Ainda não há
-- cobrança real integrada — é o registro de qual plano cada fornecedor está,
-- editável manualmente pelo admin até existir um gateway de pagamento.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS plano VARCHAR(20) NOT NULL DEFAULT 'free';

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_plano_check;
ALTER TABLE companies
  ADD CONSTRAINT companies_plano_check CHECK (plano IN ('free', 'verified', 'premium'));

CREATE INDEX IF NOT EXISTS idx_companies_plano ON companies (plano);
