-- Pedido de cancelamento de solicitação, com motivo. Enquanto o fornecedor
-- ainda não respondeu (status nova/andamento), qualquer lado cancela direto.
-- Depois de respondida ou fechada, o cancelamento fica pendente até a outra
-- parte aceitar ou recusar — ver CancelamentoInfo em models/types.ts.
ALTER TABLE solicitacoes
  ADD COLUMN IF NOT EXISTS cancelamento JSONB DEFAULT NULL;
