const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido. Verifique e tente de novo.",
  "auth/user-not-found": "Não encontramos esta conta. Crie uma conta ou verifique o e-mail.",
  "auth/wrong-password": "Senha incorreta. Tente novamente.",
  "auth/invalid-credential": "E-mail ou senha incorretos. Tente novamente.",
  "auth/email-already-in-use": "Este e-mail já está em uso. Tente entrar.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/popup-closed-by-user": "Login com Google cancelado.",
  "auth/popup-blocked":
    "O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente de novo.",
  "auth/cancelled-popup-request":
    "Aguarde o login anterior terminar ou tente de novo em instantes.",
  "auth/unauthorized-domain":
    "Este domínio não está autorizado no Firebase. Adicione a URL da Vercel em Authentication → Settings → Authorized domains.",
  "auth/operation-not-allowed":
    "Login com Google não está ativado no Firebase. Ative em Authentication → Sign-in method → Google.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um momento e tente de novo.",
};

export function getAuthErrorCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return null;
}

export function mapAuthError(error: unknown): string {
  const code = getAuthErrorCode(error);
  if (code) {
    const message = AUTH_ERROR_MESSAGES[code];
    if (message) return message;
  }

  return "Não foi possível entrar. Tente de novo em instantes.";
}
