-- A tela de orçamento passou a permitir marcar vários serviços de interesse
-- (antes era um só); eles chegam aqui juntos, separados por vírgula.
-- VARCHAR(255) corria risco de truncar quando a lista fosse longa.
ALTER TABLE solicitacoes ALTER COLUMN servico TYPE TEXT;
