-- Zera a base de demonstração para começar os testes em produção com clientes
-- reais. Usa o mesmo critério da 007 (usuario_id IS NULL = empresa de seed,
-- nunca uma empresa cadastrada de verdade por um usuário) para nunca atingir
-- dado real.

-- Solicitações de demonstração ligadas às empresas de seed.
DELETE FROM solicitacoes
WHERE prestador_id IN (SELECT id FROM companies WHERE usuario_id IS NULL);

-- Empresas de demonstração restantes do seed original.
DELETE FROM companies
WHERE usuario_id IS NULL;
