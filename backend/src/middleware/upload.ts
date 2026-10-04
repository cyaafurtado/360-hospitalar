import multer from 'multer';

// Mantém o arquivo em memória (vira um Buffer) — vai direto pra coluna bytea
// no Postgres, sem passar por disco.
export const TAMANHO_MAX_ARQUIVO = 8 * 1024 * 1024; // 8MB cobre um PDF de certificado com folga.

const MIME_ACEITOS = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const uploadDocumento = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAX_ARQUIVO },
  fileFilter: (_req, file, cb) => {
    if (!MIME_ACEITOS.has(file.mimetype)) {
      const err = new Error('Formato não aceito. Envie PDF, JPG, PNG, DOC ou DOCX.');
      err.name = 'ValidationError';
      cb(err);
      return;
    }
    cb(null, true);
  },
});
