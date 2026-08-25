-- Segunda conta de administrador do painel de gestão. Mesma lógica da 010:
-- se o e-mail já tiver conta na plataforma, só promove a existente a admin —
-- nunca mexe na senha de uma conta que a pessoa já usa. Se não existir, cria
-- uma nova com senha gerada (hash abaixo, bcrypt custo 12). A senha em texto
-- puro foi entregue fora do banco, na resposta desta tarefa — nunca fica
-- salva em lugar nenhum do repositório.

DO $$
DECLARE
  v_id VARCHAR(60);
BEGIN
  SELECT id INTO v_id FROM usuarios WHERE LOWER(email) = LOWER('alisson580@gmail.com');

  IF v_id IS NULL THEN
    INSERT INTO usuarios (id, nome, email, senha_hash, tipo, organizacao, telefone, ativo)
    VALUES (
      'usr_33b369c1169fca20fa69',
      'Alisson',
      'alisson580@gmail.com',
      '$2a$12$882VCAKGL7ItsIffJrVKxuQVajYAl3/PaRcMUaiLj6AjcHrjYfZMa',
      'admin',
      '360 Hospitalar',
      '',
      TRUE
    );
  ELSE
    UPDATE usuarios SET tipo = 'admin', ativo = TRUE WHERE id = v_id;
  END IF;
END $$;
