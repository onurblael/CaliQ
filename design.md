# TruthCalories - Design Document

## Visão Geral

Aplicação móvel MVP para sugestão de refeições personalizadas baseada em foto do frigorífico. Utiliza IA para detetar alimentos e recomendar receitas alinhadas com os objetivos do utilizador.

---

## Screen List

### 1. Onboarding Screen
- **Propósito**: Configuração inicial do perfil do utilizador
- **Conteúdo**: 
  - Seleção de objetivo (perda/manutenção/ganho de peso)
  - Restrições alimentares (vegetariano, vegan, sem glúten, sem lactose, etc.)
  - Tempo médio disponível para cozinhar

### 2. Home Screen (Ecrã Principal)
- **Propósito**: Ponto de entrada para captura de foto
- **Conteúdo**:
  - Mensagem de boas-vindas: "O que vais comer hoje? 📸"
  - Subtítulo: "Mostra-me o que tens."
  - Botão grande de câmara (área de toque principal)
  - Indicador de objetivo atual (pequeno, discreto)

### 3. Camera Screen
- **Propósito**: Captura de foto do frigorífico/alimentos
- **Conteúdo**:
  - Visualização da câmara em ecrã cheio
  - Botão de captura
  - Botão de galeria (selecionar foto existente)
  - Guia visual suave para enquadramento

### 4. Analysis Screen (Loading)
- **Propósito**: Feedback durante análise da IA
- **Conteúdo**:
  - Animação de loading suave
  - Mensagem: "A analisar o que tens disponível..."
  - Preview da foto capturada (miniatura)

### 5. Suggestion Screen (Ecrã de Sugestão)
- **Propósito**: Apresentar sugestão de refeição
- **Conteúdo**:
  - Título: "Sugestão perfeita para agora 🍽️"
  - Card de receita:
    - Nome da receita
    - Intervalo calórico (±15%)
    - Alinhamento com objetivo (%)
    - Tempo de preparo
    - Lista de ingredientes detetados
  - Botões de ação:
    - "Vou comer isto" (primário, verde)
    - "Mostra alternativa" (secundário)
    - "Não gosto disto" (terciário, discreto)

### 6. Alternative Screen
- **Propósito**: Mostrar alternativa quando solicitado
- **Conteúdo**:
  - Título: "Aqui vai outra opção 👇"
  - Card de receita (mesmo formato)
  - Contador de alternativas restantes (máx. 3)
  - Mesmos botões de ação

### 7. Confirmation Screen
- **Propósito**: Feedback positivo após seleção
- **Conteúdo**:
  - Mensagem: "Boa escolha! 🎉"
  - Subtítulo: "Se mantiveres decisões assim hoje, estás dentro do plano."
  - Botão: "Voltar ao início"

### 8. Settings Screen
- **Propósito**: Ajustar preferências
- **Conteúdo**:
  - Objetivo atual (editável)
  - Restrições alimentares (editável)
  - Histórico de refeições recentes
  - Ingredientes que não gosta (aprendidos)

---

## Primary Content and Functionality

### Deteção de Alimentos (IA)
- Análise de imagem via LLM multimodal
- Retorna lista de alimentos com confiança ≥60%
- Formato: `{ nome, confiança, categoria }`

### Sistema de Sugestão
- **Inputs**:
  - Alimentos detetados
  - Objetivo do utilizador
  - Restrições alimentares
  - Histórico de refeições
  - Hora do dia
- **Filtros**:
  - Máx. 2 ingredientes faltando
  - Tempo ≤ 20 min
  - Compatível com restrições
- **Pesos de seleção**:
  - Objetivo: 30%
  - Simplicidade: 25%
  - Histórico: 20%
  - Variedade: 15%
  - Confiança: 10%

### Feedback e Aprendizado
- "Vou comer isto" → Regista preferência positiva
- "Não gosto disto" → Regista preferência negativa
- Opções rápidas: "Não gosto do ingrediente", "Demora muito", "Não combina com objetivo"

---

## Key User Flows

### Flow 1: Primeira Utilização
1. Abre app → Onboarding
2. Seleciona objetivo → Seleciona restrições
3. Confirma → Home Screen

### Flow 2: Obter Sugestão de Refeição
1. Home Screen → Toca botão câmara
2. Camera Screen → Captura foto
3. Analysis Screen → Aguarda análise
4. Suggestion Screen → Vê sugestão
5. Toca "Vou comer isto" → Confirmation Screen
6. Volta ao Home Screen

### Flow 3: Pedir Alternativa
1. Suggestion Screen → Toca "Mostra alternativa"
2. Alternative Screen → Vê nova opção
3. Repete até 3x ou seleciona

### Flow 4: Rejeitar Sugestão
1. Suggestion Screen → Toca "Não gosto disto"
2. Modal de feedback rápido aparece
3. Seleciona motivo → Próxima alternativa

---

## Color Choices

### Paleta Principal
- **Primary (Verde Saúde)**: `#22C55E` - Ações positivas, confirmações
- **Background Light**: `#FAFAFA` - Fundo principal claro
- **Background Dark**: `#0F172A` - Fundo principal escuro
- **Surface Light**: `#FFFFFF` - Cards e superfícies
- **Surface Dark**: `#1E293B` - Cards em modo escuro
- **Foreground Light**: `#1E293B` - Texto principal claro
- **Foreground Dark**: `#F1F5F9` - Texto principal escuro
- **Muted Light**: `#64748B` - Texto secundário
- **Muted Dark**: `#94A3B8` - Texto secundário escuro
- **Border Light**: `#E2E8F0` - Bordas
- **Border Dark**: `#334155` - Bordas escuro
- **Warning (Laranja)**: `#F59E0B` - Alertas suaves
- **Error (Vermelho suave)**: `#EF4444` - Apenas para erros técnicos

### Semântica de Cores
- Verde: Ações positivas, alinhamento com objetivo
- Tons neutros: Interface principal
- Sem vermelho para feedback alimentar (tom positivo, sem culpa)

---

## UX Copy Guidelines

### Tom de Voz
- Positivo e encorajador
- Sem julgamento ou culpa
- Direto e prático
- Usa emojis com moderação

### Mensagens Chave
- Tela inicial: "O que vais comer hoje? 📸 Mostra-me o que tens."
- Sugestão: "Sugestão perfeita para agora 🍽️"
- Alternativa: "Aqui vai outra opção 👇"
- Confirmação: "Boa escolha! 🎉 Se mantiveres decisões assim hoje, estás dentro do plano."
- Loading: "A analisar o que tens disponível..."

---

## Technical Notes

### Armazenamento Local (AsyncStorage)
- Perfil do utilizador (objetivo, restrições)
- Histórico de refeições (últimas 20)
- Preferências aprendidas (ingredientes que não gosta)

### Backend (Server-side)
- Análise de imagem via LLM multimodal
- Geração de sugestões de receita
- Upload de imagem para S3 (temporário)

### Não Implementar (MVP)
- Autenticação de utilizador
- Sincronização entre dispositivos
- Base de dados de receitas externa
- Contagem calórica precisa
