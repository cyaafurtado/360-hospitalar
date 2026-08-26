import { Request, Response } from 'express';
import { config } from '../config/env';
import { UsuariosRepo, RefreshTokensRepo } from '../db/repos/usuarios.repo';
import { Usuario, UsuarioTipo } from '../models/types';
import {
  assinarAccessToken,
  conferirSenha,
  expiracaoRefresh,
  expiracaoVerificacao,
  gerarRefreshToken,
  gerarTokenVerificacao,
  hashRefreshToken,
  hashSenha,
  hashTokenVerificacao,
  novoId,
  REFRESH_TTL_DIAS,
} from '../services/auth.service';
import { enviarEmailConfirmacao } from '../services/email.service';

const COOKIE = 'rt';
const TIPOS: UsuarioTipo[] = ['fornecedor', 'contratante'];

// O front fica em 360hospitalar.com.br e a API em api.360hospitalar.com.br (mesmo site),
// mas os previews da Vercel são cross-site — daí SameSite=None em produção.
function cookieOpts() {
  const prod = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? ('none' as const) : ('lax' as const),
    path: '/api/auth',
    maxAge: REFRESH_TTL_DIAS * 24 * 60 * 60 * 1000,
  };
}

async function abrirSessao(req: Request, res: Response, usuario: Usuario, status = 200): Promise<void> {
  const refresh = gerarRefreshToken();
  await RefreshTokensRepo.save({
    id: novoId('rt'),
    usuarioId: usuario.id,
    tokenHash: hashRefreshToken(refresh),
    expiraEm: expiracaoRefresh(),
    userAgent: String(req.headers['user-agent'] ?? ''),
  });

  const token = assinarAccessToken({
    sub: usuario.id,
    email: usuario.email,
    tipo: usuario.tipo,
    companyId: usuario.companyId,
  });

  res.cookie(COOKIE, refresh, cookieOpts());
  res.status(status).json({ token, usuario });
}

// Gera um token novo, salva o hash com validade e dispara o e-mail. Usado no
// cadastro e no reenvio — nunca deixa o e-mail de confirmação sem token salvo.
async function dispararConfirmacao(usuario: Usuario): Promise<void> {
  const token = gerarTokenVerificacao();
  await UsuariosRepo.setVerificacaoToken(usuario.id, hashTokenVerificacao(token), expiracaoVerificacao());
  await enviarEmailConfirmacao(usuario.email, usuario.nome, token);
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const b = req.body ?? {};
    const nome = String(b.nome ?? '').trim();
    const email = String(b.email ?? '').trim();
    const senha = String(b.senha ?? '');
    const tipo: UsuarioTipo = TIPOS.includes(b.tipo) ? b.tipo : 'fornecedor';

    if (!nome || !email || !senha) {
      res.status(400).json({ error: 'Informe nome, e-mail e senha.' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ error: 'E-mail inválido.' });
      return;
    }
    if (senha.length < 8) {
      res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres.' });
      return;
    }
    if (await UsuariosRepo.findByEmail(email)) {
      res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
      return;
    }

    const usuario = await UsuariosRepo.create({
      id: novoId('usr'),
      nome,
      email,
      senhaHash: await hashSenha(senha),
      tipo,
      organizacao: String(b.organizacao ?? '').trim(),
      telefone: String(b.telefone ?? '').trim(),
      companyId: b.companyId ? String(b.companyId) : null,
    });

    // Conta fica criada mas não abre sessão: só entra depois de confirmar o
    // link recebido por e-mail (verifyEmail é quem chama abrirSessao).
    try {
      await dispararConfirmacao(usuario);
    } catch (err) {
      // Não falha o cadastro por causa disso — a pessoa ainda pode pedir
      // reenvio depois. Mas precisa aparecer no log do Railway.
      console.error('[auth] Falha ao enviar e-mail de confirmação no cadastro:', err);
    }

    res.status(201).json({ pendingVerification: true, email: usuario.email });
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    const token = String(req.body?.token ?? '').trim();
    if (!token) {
      res.status(400).json({ error: 'Link de confirmação inválido.' });
      return;
    }

    const usuarioId = await UsuariosRepo.idPorTokenVerificacao(hashTokenVerificacao(token));
    if (!usuarioId) {
      res.status(400).json({ error: 'Link de confirmação inválido ou expirado. Peça um novo e-mail de confirmação.' });
      return;
    }

    await UsuariosRepo.marcarEmailVerificado(usuarioId);
    const usuario = await UsuariosRepo.findById(usuarioId);
    if (!usuario) {
      res.status(404).json({ error: 'Conta indisponível.' });
      return;
    }

    await abrirSessao(req, res, usuario);
  }

  static async resendVerification(req: Request, res: Response): Promise<void> {
    const email = String(req.body?.email ?? '').trim();
    if (!email) {
      res.status(400).json({ error: 'Informe o e-mail da conta.' });
      return;
    }

    const encontrado = await UsuariosRepo.findByEmail(email);
    // Resposta igual, exista a conta ou não, e já esteja verificada ou não:
    // não é este endpoint que revela quem tem cadastro na plataforma.
    if (encontrado && encontrado.ativo && !encontrado.emailVerificado) {
      try {
        await dispararConfirmacao(encontrado);
      } catch (err) {
        console.error('[auth] Falha ao reenviar e-mail de confirmação:', err);
      }
    }

    res.json({ ok: true });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const email = String(req.body?.email ?? '').trim();
    const senha = String(req.body?.senha ?? '');

    if (!email || !senha) {
      res.status(400).json({ error: 'Informe e-mail e senha.' });
      return;
    }

    const encontrado = await UsuariosRepo.findByEmail(email);
    // Mesma resposta para e-mail inexistente e senha errada: não entregamos
    // a lista de quem tem conta no site.
    const ok = encontrado ? await conferirSenha(senha, encontrado.senhaHash) : false;
    if (!encontrado || !ok || !encontrado.ativo) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }
    if (!encontrado.emailVerificado) {
      res.status(403).json({
        error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
        code: 'EMAIL_NAO_VERIFICADO',
      });
      return;
    }

    await UsuariosRepo.touchLogin(encontrado.id);
    const { senhaHash: _s, ativo: _a, emailVerificado: _e, ...usuario } = encontrado;
    await abrirSessao(req, res, usuario);
  }

  // Rotativo: o refresh usado é queimado e um novo cookie é emitido.
  static async refresh(req: Request, res: Response): Promise<void> {
    const enviado = req.cookies?.[COOKIE];
    if (!enviado) {
      res.status(401).json({ error: 'Sessão não encontrada.' });
      return;
    }

    const hash = hashRefreshToken(String(enviado));
    const registro = await RefreshTokensRepo.findPorHash(hash);

    if (registro?.revogadoEm) {
      const idadeMs = Date.now() - new Date(registro.revogadoEm).getTime();

      // Duas abas renovando ao mesmo tempo apresentam o mesmo token: dentro da
      // janela de tolerância isso é corrida, não roubo. Só vale para token morto
      // por rotação — logout e revogação por segurança encerram na hora.
      if (registro.motivo === 'rotacao' && idadeMs <= config.rotacaoGracaMs) {
        const usuarioDaCorrida = await UsuariosRepo.findById(registro.usuarioId);
        if (usuarioDaCorrida) {
          await abrirSessao(req, res, usuarioDaCorrida);
          return;
        }
      }

      // Token queimado há tempo sendo reapresentado = indício de roubo.
      await RefreshTokensRepo.revogarTodosDoUsuario(registro.usuarioId, 'seguranca');
      res.clearCookie(COOKIE, cookieOpts());
      res.status(401).json({ error: 'Sessão encerrada por segurança. Entre novamente.' });
      return;
    }

    const valido = await RefreshTokensRepo.findValido(hash);
    if (!valido) {
      res.clearCookie(COOKIE, cookieOpts());
      res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
      return;
    }

    const usuario = await UsuariosRepo.findById(valido.usuarioId);
    if (!usuario) {
      res.clearCookie(COOKIE, cookieOpts());
      res.status(401).json({ error: 'Conta indisponível.' });
      return;
    }

    await RefreshTokensRepo.revogar(valido.id, 'rotacao');
    await abrirSessao(req, res, usuario);
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const enviado = req.cookies?.[COOKIE];
    if (enviado) await RefreshTokensRepo.revogarPorHash(hashRefreshToken(String(enviado)), 'logout');
    res.clearCookie(COOKIE, cookieOpts());
    res.json({ ok: true });
  }

  static async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente.' });
      return;
    }
    const usuario = await UsuariosRepo.findById(req.user.sub);
    if (!usuario) {
      res.status(401).json({ error: 'Conta indisponível.' });
      return;
    }
    res.json({ usuario });
  }
}
