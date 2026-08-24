-- Reduz a lista de empresas de demonstração pela metade (12 -> 6), para o
-- diretório público não parecer inflado de exemplos. Guardado por usuario_id
-- IS NULL para nunca atingir uma empresa cadastrada de verdade por um usuário.

DELETE FROM companies
WHERE id IN ('tecvida', 'higitec', 'telesaude', 'vestmed', 'nutricare', 'farmadistribui')
  AND usuario_id IS NULL;
