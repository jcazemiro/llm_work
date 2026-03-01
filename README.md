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
3. (próxima etapa) integrar LLM para recomendar topologia, validar consistência e sugerir melhorias técnicas.

---

## 2) Estado atual do projeto (já implementado)

- Front-end React + Vite para edição de parâmetros.
- Geração de unifilar em SVG com grupos principais:
  - Grupo 1: Cabine MT / Rede
  - Grupo 2: Transformação
  - Grupo 3: Distribuição BT / PCS / BESS
- Renderização escalável para múltiplos PCS/BESS.
- Download do diagrama em SVG.

---

## 3) Arquitetura de LLM (planejada para a avaliação final)

Fluxo planejado:

`Entrada do usuário -> Prompt estruturado -> Modelo LLM -> Tools -> Saída estruturada -> Atualização do unifilar`

### Componentes
- **Front-end**: coleta dados e exibe recomendações + diagrama.
- **Camada LLM (backend)**:
  - monta contexto técnico,
  - chama modelo com `system prompt` especializado,
  - executa ferramentas (cálculo/validação),
  - retorna resposta estruturada.
- **Gerador SVG**: converte parâmetros e recomendações em diagrama visual.

---


## 3.1) Mapa rápido para critérios do professor

- **System prompt e prompting (18 pts):** arquivo versionado em `prompts/system_prompt.txt` com regras, saída JSON obrigatória e foco em rastreabilidade.
- **Tools e integração (14 pts):** especificações em `tools/tool_specs.md` + implementação no front em `frontend/src/tools/engineTools.ts`.
- **Parâmetros/modelo (10 pts):** seção de decisões no README com justificativas e plano de experimento.
- **Arquitetura/framework (10 pts):** fluxo em `agents/fluxo.md` e descrição da orquestração LLM.
- **README/documentação (10 pts):** estrutura orientada a problema, decisões, limites e próximos passos.
- **Apresentação oral (8 pts):** use o resumo executivo da página `Assistente IA` como base do pitch.

## 4) Decisões de engenharia de LLM (proposta inicial)

## 4.1 Modelo
- Opção inicial: API de modelo com bom suporte a instruções e tool calling.
- Alternativa local: Ollama/vLLM para redução de custo e maior privacidade.

**Justificativa:**
- APIs pagas tendem a melhor qualidade de raciocínio e tool calling.
- Modelos locais ajudam em custo/privacidade, com possível perda de robustez.

## 4.2 Framework
- Estratégia inicial: **SDK/API direta** (simples e controlável).
- Evolução opcional: LangChain/LangGraph se o fluxo multiagente ficar necessário.

**Trade-off:** reduzir complexidade no início para maximizar confiabilidade e explicabilidade na apresentação.

## 4.3 Parâmetros sugeridos
- `temperature = 0.2` para validação técnica e consistência.
- `top_p = 0.9` (ou padrão do provedor).
- Ajustes experimentais documentados no histórico de testes.

## 4.4 Estratégia de prompting
- Prompt com papel técnico explícito (engenheiro de pré-projeto).
- Resposta em formato estruturado com seções fixas.
- Regras de segurança: não inventar normas e declarar incerteza quando faltar dado.

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
├── frontend/
└── backend/
```

---

## 6) O que funcionou até agora

- Geração automática de unifilar preliminar baseada em parâmetros do projeto.
- Melhor organização visual por grupos e distribuição mais legível para cenários com muitos equipamentos.
- Interface para ajuste de quantidade de PCS/BESS e potências associadas.

## 7) O que ainda não funcionou / limitações

- Ainda não há validação elétrica normativa automatizada.
- Ainda não há backend de IA conectado ao fluxo de geração.
- A versão atual é de pré-projeto e não substitui projeto executivo.

---

## 8) Próximos passos (execução do trabalho final)

1. Implementar endpoint de orquestração LLM no backend.
2. Conectar tools para:
   - checagem de consistência (kW/kWh/quantidades),
   - sugestões de organização topológica,
   - geração de observações técnicas para carimbo/notas.
3. Salvar prompts versionados e exemplos de entradas/saídas.
4. Medir diferenças de comportamento por parâmetro/modelo e documentar no README.
5. Preparar pitch de 3 minutos focado em decisões de engenharia de LLM.

---

## 9) Como rodar

### Front-end
```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

### Build
```bash
npm --prefix frontend run build
```

---

## 10) Aviso técnico

Este projeto gera **diagrama preliminar** para apoio de engenharia. Qualquer dimensionamento final deve ser validado por profissional habilitado e normas aplicáveis.
