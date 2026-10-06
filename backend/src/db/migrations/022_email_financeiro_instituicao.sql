-- E-mail separado pra nota fiscal / financeiro — nem sempre é a mesma
-- pessoa/caixa que o contato principal da instituição.
ALTER TABLE instituicoes ADD COLUMN IF NOT EXISTS email_financeiro VARCHAR(160) NOT NULL DEFAULT '';
