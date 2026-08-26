import { Resend } from 'resend';
import { config } from '../config/env';

let cliente: Resend | null = null;

function resend(): Resend | null {
  if (!config.resendApiKey) return null;
  if (!cliente) cliente = new Resend(config.resendApiKey);
  return cliente;
}

// Sem RESEND_API_KEY configurada (ex: ambiente local), só loga o link no
// console em vez de falhar o cadastro — dá pra testar o fluxo sem enviar e-mail de verdade.
export async function enviarEmailConfirmacao(destino: string, nome: string, token: string): Promise<void> {
  const link = `${config.frontendUrl}/confirmar-email?token=${token}`;
  const r = resend();

  if (!r) {
    console.warn(`[email] RESEND_API_KEY não configurada. Link de confirmação para ${destino}: ${link}`);
    return;
  }

  const { error } = await r.emails.send({
    from: config.emailFrom,
    to: destino,
    subject: 'Confirme seu e-mail — 360 Hospitalar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #1e5fa8;">360 Hospitalar</h2>
        <p>Olá, ${nome || 'tudo bem'}!</p>
        <p>Confirme seu e-mail para ativar sua conta na 360 Hospitalar:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${link}"
             style="background: #1e5fa8; color: #fff; padding: 12px 28px; border-radius: 8px;
                    text-decoration: none; font-weight: bold; display: inline-block;">
            Confirmar e-mail
          </a>
        </p>
        <p style="font-size: 13px; color: #666;">
          Se o botão não funcionar, copie e cole este link no navegador:<br />
          <a href="${link}">${link}</a>
        </p>
        <p style="font-size: 13px; color: #666;">Este link expira em 48 horas. Se você não criou esta conta, ignore este e-mail.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Falha ao enviar confirmação via Resend:', error);
    throw new Error('Não foi possível enviar o e-mail de confirmação.');
  }
}
