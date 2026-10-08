-- "Desde {ano}" nunca veio de informação real: o front nunca mandava founded
-- no pré-cadastro, então todo fornecedor recebia o ano do próprio cadastro
-- como se fosse o ano de fundação (CompaniesController.create tinha um
-- fallback pra new Date().getFullYear()). Limpa os valores fabricados —
-- eles coincidem exatamente com o ano em que a empresa foi criada, o que só
-- acontece por causa desse fallback — e deixa o campo opcional de verdade.
ALTER TABLE companies ALTER COLUMN founded DROP NOT NULL;
ALTER TABLE companies ALTER COLUMN founded DROP DEFAULT;

UPDATE companies
   SET founded = NULL
 WHERE founded IS NOT NULL
   AND founded = EXTRACT(YEAR FROM created_at)::int;
