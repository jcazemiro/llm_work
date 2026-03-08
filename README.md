# Trabalho Final — IA Generativa aplicada a Diagramas Unifilares BESS

Este repositório contém uma aplicação web para geração de **diagramas unifilares preliminares** de sistemas BESS (Battery Energy Storage System), com foco em evoluir para um **copiloto com IA generativa** para apoio de pré-projeto elétrico.

## 1) Problema e solução

### Problema
Na etapa de pré-projeto, o unifilar costuma ser feito manualmente e iterado várias vezes. Isso gera retrabalho e aumenta o risco de inconsistências entre:
- quantidades de PCS/BESS,
- potência/energia total,
- distribuição em grupos funcionais (MT, transformação, BT),
- legibilidade do diagrama para revisão técnica.

### Solução proposta
A aplicação permite:
1. configurar parâmetros do projeto (trafo, PCS, BESS),
2. gerar o unifilar preliminar automaticamente em SVG,
3. executar análise assistida (pipeline tools-first) para recomendar ajustes técnicos e de legibilidade.

---

## 2) Estado atual do projeto (implementado)

- Front-end React + Vite para edição de parâmetros e visualização.
- Geração de unifilar em SVG com grupos principais:
  - Grupo 1: Cabine MT / Rede
  - Grupo 2: Transformação
  - Grupo 3: Distribuição BT / PCS / BESS
- Renderização escalável para múltiplos PCS/BESS.
- Página de Assistente IA com diagnóstico estruturado.
- Backend Express com endpoint de análise:
  - `GET /health`
  - `GET /api/assistente/exemplo`
  - `POST /api/assistente/analisar`

---

## 3) Arquitetura de LLM:

Fluxo implementado:

`Entrada do usuário -> Backend -> Tools -> Resposta estruturada (JSON) -> Frontend`

### Componentes
- **Front-end**: coleta dados, mostra recomendações e exibe diagrama.
- **Camada de orquestração (backend)**:
  - executa validações e cálculos (tools),
  - monta resposta técnica estruturada,
  - valida schema antes de responder.
- **Gerador SVG**: converte parâmetros do projeto em diagrama visual.

### Tools do pipeline
1. `validar_consistencia_projeto`
2. `calcular_totais_instalados`
3. `sugerir_layout_diagramas`

Referência: `tools/tool_specs.md`.

---

## 3.1) Mapa rápido de análise e reflexão:

- **System prompt e prompting:** prompt estruturado com regras, few-shot e JSON obrigatório em `prompts/system_prompt.txt`.
- **Tools e integração:** contrato em `tools/tool_specs.md` e execução real no backend.
- **Parâmetros/modelo:** parâmetros retornados na API (`temperature`, `top_p`, `provider`, `model`) e justificados na documentação.
- **Arquitetura/framework:** fluxo em `agents/fluxo.md` + endpoints e validação de schema no backend.
- **README/documentação:** este README, contratos e plano de melhoria.
- **Apresentação:** apresentação oral não é mais possível, entretando a ideia é deixar a aplicação rodando para facilitar a avaliação do professor. Utilizar o endpoint `/api/assistente/exemplo` para demonstrar saída estruturada.

---

## 4) Decisões de engenharia de LLM

## 4.1 Modelo
- Versão atual: `deterministic-local` (reprodutível, sem chave externa).
- Evolução planejada: integrar provedor LLM real (OpenAI/Ollama/vLLM) com mesmo contrato de saída.

**Justificativa:**
- Reprodutibilidade e estabilidade para avaliação acadêmica inicial.
- Facilidade de auditoria das decisões e das saídas.

## 4.2 Framework / Orquestração
- Estratégia atual: backend direto com pipeline explícito de tools (simples e auditável).
- Evolução opcional: migrar para framework de agentes se fluxo ficar mais complexo.

**Trade-off:** menor complexidade agora para maximizar confiabilidade e explicabilidade na banca.

## 4.3 Parâmetros atuais
- `temperature = 0.2` para consistência técnica.
- `top_p = 0.9` para manter cobertura sem excesso de aleatoriedade.
- Estes parâmetros são retornados na API para rastreabilidade.

## 4.4 Estratégia de prompting
- Prompt com papel técnico explícito.
- Formato estruturado em tags + regras de segurança.
- Saída JSON obrigatória (schema fixo).
- Few-shot com cenário consistente e inconsistente.

---

## 5) Estrutura do repositório

```text
.
├── README.md
├── prompts/
│   └── system_prompt.txt
├── tools/
│   └── tool_specs.md
├── agents/
│   └── fluxo.md
├── docs/
│   └── plano_melhoria.md
├── frontend/
└── backend/
```

---

## 6) O que funcionou até agora

- Geração automática de unifilar preliminar baseada em parâmetros do projeto.
- Organização visual em grupos com melhor legibilidade para revisão.
- Pipeline backend com tools e resposta estruturada.
- Endpoint de exemplo para demonstração (`/api/assistente/exemplo`).
- Validação de schema da resposta antes do retorno no endpoint de análise.

## 7) O que ainda é ponto fraco / limitações

- Ainda não há integração com provedor LLM externo (pipeline atual determinístico).
- Validação elétrica ainda básica (não substitui análise normativa detalhada).
- Frontend e backend ainda podem evoluir para integração 100% online em todos os fluxos da UI.
- Falta suíte automatizada de testes de API (atualmente validação principal via comandos manuais).

---

## 8) Próximos passos recomendados

1. Integrar chamada real a LLM mantendo o mesmo schema de saída.
2. Automatizar testes para cenários: válido, alerta e erro.
3. Conectar totalmente a tela Assistente IA ao endpoint backend de análise.
4. Incluir métricas: latência, taxa de JSON válido e inconsistências detectadas.
5. Preparar apresentação.

---

## 9) Como rodar

### Backend
```bash
npm --prefix backend install
npm --prefix backend start
```

### Build front
```bash
npm --prefix frontend run build
```

### Checks rápidos
```bash
curl -s http://localhost:8787/health
curl -s http://localhost:8787/api/assistente/exemplo | jq '.resposta'
```

---

## 10) Aviso técnico

Este projeto gera **diagrama preliminar** para apoio de engenharia e avaliação acadêmica. Qualquer dimensionamento final deve ser validado por profissional habilitado e normas aplicáveis.
