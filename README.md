# Trabalho Final — IA Generativa aplicada a Diagramas Unifilares BESS

Este repositório contém uma aplicação web para geração de diagramas unifilares preliminares de sistemas BESS e uma camada inicial de orquestração LLM para análise técnica com rastreabilidade.

## 1) Problema
No pré-projeto de BESS, o unifilar é iterado várias vezes e pode gerar inconsistências entre potência, energia, quantidade de equipamentos e legibilidade do arranjo.

## 2) Solução da entrega atual
- **Frontend (React/Vite):** construtor de projeto, geração de unifilar e tela do Assistente IA.
- **Backend (Express):** endpoint `/api/assistente/analisar` com pipeline de tools + resposta estruturada.
- **Prompting versionado:** `prompts/system_prompt.txt` com formato em tags + few-shot + JSON obrigatório.
- **Especificação de tools:** `tools/tool_specs.md` com contrato de integração.

## 3) Arquitetura resumida
`Frontend -> Backend (/api/assistente/analisar) -> Tools -> Contexto técnico -> Resposta JSON -> UI`

Fluxo detalhado: `agents/fluxo.md`.

## 4) Decisões de engenharia de LLM
### 4.1 Prompting
- Estrutura com tags para reduzir ambiguidade.
- Saída JSON obrigatória para consumo de UI.
- Few-shot com cenário consistente e inconsistente.

### 4.2 Tools-first
- O backend executa validações e cálculos **antes** da resposta textual.
- Objetivo: reduzir alucinação e elevar rastreabilidade.

### 4.3 Parâmetros de modelo (versionados)
- `temperature = 0.2` (consistência técnica > criatividade).
- `top_p = 0.9`.
- Nesta entrega, provider padrão é `deterministic-local` para reprodutibilidade sem dependência de chave externa.

## 5) Mapeamento para critérios de avaliação
- **System Prompt e Prompting:** `prompts/system_prompt.txt`
- **Ferramentas (Tools):** `tools/tool_specs.md` + execução no backend (`backend/index.js`)
- **Parâmetros do Modelo:** retorno da API em `modelo`
- **Arquitetura e Framework:** `agents/fluxo.md` + endpoint Express implementado
- **README e documentação:** este arquivo + `docs/plano_melhoria_nota_minima.md`

## 6) Como rodar
### Backend
```bash
npm --prefix backend install
npm --prefix backend start
```

### Frontend
```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

### Build frontend
```bash
npm --prefix frontend run build
```

## 7) Limitações atuais
- A resposta LLM está em modo determinístico local (sem API externa conectada por padrão).
- Não substitui validação normativa de projeto executivo.

## 8) Próximos passos
1. Conectar frontend diretamente ao endpoint backend.
2. Adicionar testes automatizados da rota `/api/assistente/analisar`.
3. Incluir benchmark rápido por cenário (válido/alerta/erro).
4. Registrar evidências para apresentação final.
