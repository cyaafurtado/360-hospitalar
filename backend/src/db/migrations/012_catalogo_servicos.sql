-- Catálogo de serviços/produtos do fornecedor: existia como tela no portal,
-- mas nunca foi salvo no banco nem exibido no perfil público — a pessoa
-- editava e nada acontecia de verdade. Agora persiste e passa a aparecer
-- na página pública da empresa.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS catalogo JSONB NOT NULL DEFAULT '[]'::jsonb;
