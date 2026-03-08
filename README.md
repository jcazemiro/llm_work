# Trabalho Final — IA Generativa aplicada a Diagramas Unifilares BESS

Aplicação web para pré-projeto de sistemas BESS com geração de unifilar e camada de análise assistida por LLM (modo determinístico auditável nesta versão).

## 1) Objetivo acadêmico
Melhorar a entrega nos critérios de avaliação:
1. System Prompt e Prompting
2. Ferramentas (Tools)
3. Parâmetros do Modelo
4. Arquitetura e Framework
5. README e Documentação

## 2) O que está implementado hoje
- **Frontend (React + Vite):** construtor de projeto, unifilar preliminar e tela do Assistente IA.
- **Backend (Express):** pipeline tools-first em `POST /api/assistente/analisar`.
- **Prompt estruturado:** `prompts/system_prompt.txt` com XML-tags, regras, few-shot e JSON obrigatório.
- **Contrato de tools/API:** `tools/tool_specs.md`.

## 3) Arquitetura (versão atual)
`Frontend -> Backend -> Tools (validação/cálculo/layout) -> Resposta estruturada -> UI`

Detalhe do fluxo: `agents/fluxo.md`.

## 4) Prompt estruturado (resumo)
O prompt contém:
- papel técnico explícito;
- prioridades de decisão;
- regras de segurança (`DADO INSUFICIENTE`, sem norma sem fonte);
- protocolo de uso das tools;
- formato JSON obrigatório;
- few-shot positivo/negativo.

Arquivo completo: `prompts/system_prompt.txt`.

## 5) Decisões de engenharia do modelo
- `temperature=0.2`: reduz variabilidade para tarefa técnica.
- `top_p=0.9`: mantém cobertura sem perder consistência.
- provider padrão: `deterministic-local` (reprodutível sem chave externa).
- retorno da API inclui os parâmetros para auditoria.

## 6) Pontos fracos atuais (foco da avaliação)
1. **Sem chamada real a provedor LLM externo** (pipeline ainda determinístico).
2. **Validação elétrica ainda básica** (não cobre normas detalhadas).
3. **Sem suíte automatizada de testes de API** (há testes manuais por curl).
4. **Frontend Assistente IA ainda usa lógica local** e pode divergir do backend se não integrado totalmente.

Esses pontos são importantes para explicar transparência na banca: o que já está pronto vs. o que está planejado.

## 7) Exemplo de como está ficando (resultado real da API)
Com backend rodando, execute:

```bash
curl -s http://localhost:8787/api/assistente/exemplo | jq '.resposta'
```

Você verá um JSON estruturado com:
- `diagnostico`
- `acoes_recomendadas`
- `riscos`
- `dados_faltantes`
- `resumo_executivo`
- `justificativa_tecnica`
- `prioridade_execucao`

## 8) Como rodar localmente
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

### Verificações
```bash
npm --prefix frontend run lint
npm --prefix frontend run build
curl -s http://localhost:8787/health
curl -s http://localhost:8787/api/assistente/exemplo | jq '.tools_executadas | length'
```

## 9) Próximos passos recomendados
1. Integrar frontend Assistente IA consumindo `POST /api/assistente/analisar`.
2. Incluir testes automatizados para cenários: válido, alerta e erro.
3. Adicionar comparação entre modelo determinístico e modelo LLM real.
4. Medir métricas: latência, JSON válido, inconsistências detectadas por cenário.

## 10) Aviso técnico
Resultado de pré-projeto para apoio didático. Não substitui validação por profissional habilitado e normas aplicáveis.
