-- Conta de administrador do painel de gestão. Se o e-mail já tiver conta na
-- plataforma (fornecedor ou contratante), só promove a existente a admin —
-- nunca mexe na senha de uma conta que a pessoa já usa. Se não existir,
-- cria uma nova com senha gerada (hash abaixo, mesma função bcrypt/custo 12
-- do backend). A senha em texto puro foi entregue fora do banco, na resposta
-- desta tarefa — nunca fica salva em lugar nenhum do repositório.

DO $$
DECLARE
  v_id VARCHAR(60);
BEGIN
  SELECT id INTO v_id FROM usuarios WHERE LOWER(email) = LOWER('cyaa.furtado@gmail.com');

  IF v_id IS NULL THEN
    INSERT INTO usuarios (id, nome, email, senha_hash, tipo, organizacao, telefone, ativo)
    VALUES (
      'usr_e9f36c6c28bee1229d',
      'Cyaa Furtado',
      'cyaa.furtado@gmail.com',
      '$2a$12$pNkVtz9RSaZXmPcHcod8VOY4i8VQ7xzUZspjahB2J7xHatiGb.jOS',
      'admin',
      '360 Hospitalar',
      '',
      TRUE
    );
  ELSE
    UPDATE usuarios SET tipo = 'admin', ativo = TRUE WHERE id = v_id;
  END IF;
END $$;
