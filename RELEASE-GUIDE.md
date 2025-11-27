# Guia de Versionamento e Deploy (CI/CD)

Este projeto utiliza **GitHub Actions** para automatizar a publicação de imagens Docker. O fluxo é dividido em dois tipos de entrega:

1. **Desenvolvimento (Snapshot):** Acontece a cada push na `main`. Gera uma imagem rastreável pelo hash do commit (ex: `:sha-abc1234`).
2. **Produção (Release):** Acontece ao criar uma **Git Tag**. Gera imagens semânticas (ex: `:1.0.0`, `:1.0`, `:latest`).

---

## 1\. Fluxo Diário (Desenvolvimento)

Para salvar seu progresso e gerar uma build de teste (CI), utilize commits semânticos na branch `main`.

### Passo a Passo

1. **Adicione as alterações:**  
   Bash

```
git add .
```

2. Realize o Commit Semântico:  
   Siga o padrão Conventional Commits:
   - `feat:` para novas funcionalidades.
   - `fix:` para correção de bugs.
   - `docs:` para documentação.
   - `chore:` para ajustes de configuração/infra.
   - `refactor:` para melhorias de código sem alterar funcionalidade.  
     Bash

```
git commit -m "feat(ocr): implementa retry logic na conexão com o banco"
```

3. **Envie para o GitHub:**  
   Bash

```
git push origin main
```

> **Resultado:** O GitHub Actions irá rodar e gerar uma imagem Docker com a tag `:sha-<hash-do-commit>`. Isso é útil para debugging ou deploy em ambiente de staging.

---

## 2\. Fluxo de Release (Produção)

Quando o código na `main` estiver estável e pronto para ir para produção, siga estes passos para gerar uma versão oficial (ex: `v1.0.0`).

### Passo 1: Atualizar a Versão do Projeto

O `package.json` deve ser a fonte da verdade sobre a versão atual. O comando abaixo atualiza o arquivo automaticamente sem criar a tag git (ainda).

Escolha o tipo de atualização:

- **Patch** (1.0.0 -> 1.0.1): Correções de bugs.
- **Minor** (1.0.0 -> 1.1.0): Novas features compatíveis.
- **Major** (1.0.0 -> 2.0.0): Mudanças que quebram compatibilidade.

Bash

```
# Exemplo para Patch
npm version patch --no-git-tag-version

```

### Passo 2: Commitar a Mudança de Versão

Oficialize a mudança de versão no histórico.

Bash

```
git add package.json
git commit -m "chore: release v1.0.1"
git push origin main

```

### Passo 3: Criar e Enviar a Tag

É **este passo** que aciona o deploy de produção no GitHub Actions.

Bash

```
# Crie a tag (deve começar com 'v')
git tag v1.0.1

# Envie a tag para o repositório remoto
git push origin v1.0.1

```

---

## 3\. O que acontece depois?

Vá para a aba **Actions** no seu repositório GitHub. Você verá o workflow `Build and Push Docker Image` rodando.

Ao finalizar, os seguintes artefatos estarão disponíveis no **GitHub Container Registry (GHCR)**:

| **Tag Docker** | **Finalidade** | **Comportamento**                                    |
| -------------- | -------------- | ---------------------------------------------------- |
| :1.0.1         | **Imutável**   | Versão exata para usar no Kubernetes/Docker Compose. |
| :1.0           | **Flutuante**  | Sempre aponta para a versão 1.0.x mais recente.      |
| :1             | **Flutuante**  | Sempre aponta para a versão 1.x.x mais recente.      |
| :latest        | **Instável**   | Aponta para a última tag criada.                     |

---

## Resumo de Comandos Rápidos

Bash

```
# 1. Desenvolvimento
git add .
git commit -m "fix: corrige erro de conexão redis"
git push origin main

# 2. Lançar Release (ex: v1.1.0)
npm version minor --no-git-tag-version
git add package.json
git commit -m "chore: release v1.1.0"
git push origin main
git tag v1.1.0
git push origin v1.1.0
```
