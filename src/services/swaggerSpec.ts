export const SWAGGER_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "ALICERCE API - B2B2C Construction Ecosystem",
    description: "API RESTful documentada para a plataforma ALICERCE. Suporta autenticação RBAC com chancela de registros CREA/CAU/CNPJ, feed técnico, mensageria em tempo real e gateway de anúncios.",
    version: "1.0.0",
    contact: {
      name: "Equipe de Engenharia ALICERCE",
      email: "api@alicerce.com.br"
    }
  },
  servers: [
    {
      url: "https://api.alicerce.com.br/v1",
      description: "Servidor de Produção (AWS / Kubernetes)"
    },
    {
      url: "https://staging-api.alicerce.com.br/v1",
      description: "Servidor de Staging / Homologação"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string", example: "usr_8829" },
          name: { type: "string", example: "Eng. Roberto Silva" },
          email: { type: "string", example: "roberto@alicerce.com.br" },
          role: { type: "string", enum: ["pessoa_fisica", "profissional_crea", "profissional_cau", "empresa_cnpj", "investidor", "admin"] },
          creaCauNumber: { type: "string", example: "CREA-SP 5069824/D" },
          verified: { type: "boolean", example: true }
        }
      },
      TechnicalStamp: {
        type: "object",
        properties: {
          stampId: { type: "string", example: "ALC-2026-8812" },
          registrationNumber: { type: "string", example: "CREA-SP 5092182/D" },
          hashVerification: { type: "string", example: "e3b0c44298fc1c149afbf4c8996fb..." },
          artRrtCode: { type: "string", example: "ART SP2026/998124" }
        }
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string", example: "post_101" },
          title: { type: "string", example: "Concretagem de Laje Protendida" },
          content: { type: "string" },
          budgetEstimated: { type: "number", example: 1250000 },
          technicalStamp: { $ref: "#/components/schemas/TechnicalStamp" }
        }
      },
      AdCampaign: {
        type: "object",
        properties: {
          id: { type: "string", example: "camp_992" },
          title: { type: "string" },
          totalBudget: { type: "number", example: 500.00 },
          paymentMethod: { type: "string", enum: ["pix", "cartao"] },
          invoiceNfseUrl: { type: "string" }
        }
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Cadastro multi-perfil (CREA/CAU/CNPJ)",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserProfile" }
            }
          }
        },
        responses: {
          201: { description: "Usuário cadastrado com sucesso e credencial pré-validada." }
        }
      }
    },
    "/feed/posts": {
      get: {
        summary: "Listar feed com filtros por especialidade e localização",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Lista de publicações enriquecidas com Carimbo Técnico." }
        }
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: "Criar nova publicação com chancela técnica",
        responses: {
          201: { description: "Publicação criada com hash SHA-256 gerado." }
        }
      }
    },
    "/ads/campaigns": {
      post: {
        security: [{ bearerAuth: [] }],
        summary: "Criar campanha de anúncios self-service e gerar Pix/NFS-e",
        responses: {
          201: { description: "Campanha gerada com QR Code Pix em tempo real." }
        }
      }
    }
  }
};
