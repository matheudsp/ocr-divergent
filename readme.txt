1. Contexto do Microservico
No fluxo de locação da Locaterra, a etapa de "Pendente Documentação" gera um gargalo operacional. Atualmente, o locador humano precisa abrir o arquivo e comparar com os dados cadastrados. O objetivo deste serviço é automatizar a pré-aprovação, utilizando OCR para ler documentos (RG/CNH e Comprovantes de Renda) e comparar com os dados informados pelo usuário (Nome, CPF, Renda Mensal), retornando um "Score".

2. Stack Tecnológica Obrigatória
Runtime: Node.js (v20+) com TypeScript.

Framework Web: Fastify.

Object Storage: MinIO.

Filas/Jobs: BullMQ com Redis.

OCR Engine: Tesseract.js (ou adapter para AWS Textract/Google Vision simulado).

Validação: Zod (integração com Fastify).

Testes: Vitest ou Jest.

3. Arquitetura Proposta: Clean Architecture (Hexagonal)

Estrutura de Pastas 

src/
├── core/                   # Camada de Domínio (Pura, sem frameworks)
│   ├── entities/           # Ex: Document, VerificationRequest
│   ├── errors/             # Erros de domínio
│   ├── repositories/       # Interfaces (Ports) para persistência
│   └── use-cases/          # Regras de negócio (Ex: CompareDocumentData)
├── infra/                  # Camada de Infraestrutura (Adapters)
│   ├── http/               # Fastify controllers, routes, schemas
│   ├── storage/            # Implementação do MinIO Adapter
│   ├── queue/              # Implementação do BullMQ (Producer/Consumer)
│   ├── ocr/                # Implementação do Tesseract Adapter
│   └── database/           # Repositórios concretos (Prisma ou TypeORM)
└── main.ts                 # Entrypoint e Injeção de Dependência
4. Fluxo de Dados e Funcionalidades
A. Upload e Enfileiramento (API Síncrona)
Endpoint: POST /verification

Recebe multipart/form-data contendo:

file: Arquivo de imagem (JPG, PNG, PDF).

metadata: JSON string contendo { userId, documentType, expectedData: { name, cpf, income } }.

Validação: Verifica tamanho (max 5MB) e mimetype.

Storage: Envia o arquivo para um bucket pending-docs no MinIO.

Queue: Publica um job na fila ocr-processing-queue contendo a chave do arquivo no MinIO e os metadados.

Resposta: Retorna 202 Accepted com um verificationId para webhook.

B. Processamento OCR (Worker Assíncrono)
Worker: Consumidor do BullMQ

Baixa o arquivo do MinIO (stream).

Processa a imagem utilizando o OCR Provider (ex: Tesseract.js | AWS Textract).

Extrai o texto bruto.

Não fazer comparação exata de strings (===). OCR falha frequentemente.

Utilizar algoritmo de Distância de Levenshtein para comparar o nome extraído com o nome esperado.

Utilizar Regex robusto para extrair e limpar CPF/CNPJ do texto bruto.

Calcula um confidenceScore (0 a 100) baseado na similaridade dos dados.


5. Requisitos de Avaliação (Critérios Sênior)
1. Design Patterns e Abstração
Dependency Injection: O serviço de OCR e o serviço de Storage devem ser injetados. O código não pode depender diretamente de tesseract.js ou aws-sdk dentro dos Use Cases. Deve haver interfaces IOcrProvider e IStorageProvider.

Repository Pattern: Para salvar o estado da verificação.

2. Resiliência e Escalabilidade
Tratamento de Erros na Fila: Configurar o BullMQ para attempts (retentativas) com backoff exponencial caso o serviço de OCR falhe.

3. Observabilidade
Logs estruturados utilizando pino.

4. Algoritmo de Matching (Regra de Negócio)
Implementar uma lógica inteligente de comparação.

Exemplo: Se o OCR ler "Joao da SiIva" (com 'I' maiúsculo) e o esperado for "João da Silva", o sistema deve aprovar (alta similaridade).

6. Exemplo de Payload de Entrada (Swagger/Zod)
TypeScript

// Exemplo de Zod Schema para o Multipart
const verificationSchema = z.object({
  userId: z.string().uuid(),
  documentType: z.enum(['RG_FRENTE', 'RG_VERSO', 'CNH', 'COMPROVANTE_RENDA']),
  expectedData: z.object({
    name: z.string().min(3),
    cpf: z.string().regex(/^\d{11}$/), // Apenas números
    declaredIncome: z.number().optional(), // Apenas se for comprovante de renda
  })
});


docker-compose.yml subindo: Redis, MinIO.

Projeto cobre I/O bound (upload/storage), CPU bound (OCR/Matching), arquitetura limpa e uso profissional de filas