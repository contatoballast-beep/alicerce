export const SWAGGER_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Ballast Architecture API',
    description:
      'API REST e WebSocket da plataforma Ballast Architecture. Autenticação JWT validada no servidor, catálogo público de arquitetos e portfólios, solicitações de proposta e chat em tempo real isolado por participante.',
    version: '2.0.0',
    contact: {
      name: 'Equipe Ballast Architecture',
      url: 'https://ballastarch.com',
    },
  },
  servers: [
    {
      url: 'https://ballastarch.com/api',
      description: 'Produção (Ballast Architecture)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: { summary: 'Status de disponibilidade da API e banco de dados' },
    },
    '/auth/register': {
      post: { summary: 'Cadastro público com validação e consentimento LGPD' },
    },
    '/auth/login': {
      post: { summary: 'Autenticação com e-mail e senha (JWT)' },
    },
    '/auth/me': {
      get: { security: [{ bearerAuth: [] }], summary: 'Validação de sessão ativa no servidor' },
    },
    '/professionals': {
      get: { summary: 'Catálogo público de arquitetos com filtros reais e paginação' },
    },
    '/professionals/{id}': {
      get: { summary: 'Perfil completo compartilhável do profissional e seu portfólio' },
    },
    '/portfolio': {
      post: { security: [{ bearerAuth: [] }], summary: 'Publicação de projeto no portfólio com confirmação do servidor' },
    },
    '/proposal-requests': {
      get: { security: [{ bearerAuth: [] }], summary: 'Solicitações de proposta do usuário autenticado' },
      post: { security: [{ bearerAuth: [] }], summary: 'Enviar solicitação estruturada de proposta vinculada ao chat' },
    },
    '/chat/threads': {
      get: { security: [{ bearerAuth: [] }], summary: 'Listar conversas exclusivas do participante autenticado' },
      post: { security: [{ bearerAuth: [] }], summary: 'Criar ou recuperar conversa privada com contexto de projeto' },
    },
    '/chat/messages/{threadId}': {
      get: { security: [{ bearerAuth: [] }], summary: 'Histórico paginado de mensagens (exclusivo aos participantes)' },
    },
    '/chat/messages': {
      post: { security: [{ bearerAuth: [] }], summary: 'Enviar mensagem com deduplicação e entrega WebSocket isolada' },
    },
    '/user/export': {
      get: { security: [{ bearerAuth: [] }], summary: 'LGPD — Exportação completa dos dados do titular' },
    },
    '/user/account': {
      delete: { security: [{ bearerAuth: [] }], summary: 'LGPD — Exclusão permanente da conta com confirmação de senha' },
    },
  },
};
