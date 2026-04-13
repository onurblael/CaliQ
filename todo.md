# Project TODO

- [x] Gerar logo da aplicação e configurar branding
- [x] Configurar tema de cores (verde saúde como primário)
- [x] Criar estrutura de navegação (tabs e stacks)
- [x] Implementar ecrã de onboarding (objetivo, restrições)
- [x] Implementar Home Screen com botão de câmara
- [x] Implementar Camera Screen com captura de foto
- [x] Criar API backend para análise de imagem com LLM
- [x] Implementar Analysis Screen (loading)
- [x] Implementar Suggestion Screen com card de receita
- [x] Implementar botões de ação (Vou comer, Alternativa, Não gosto)
- [x] Implementar Alternative Screen com contador
- [x] Implementar Confirmation Screen
- [x] Criar sistema de feedback rápido
- [x] Implementar Settings Screen
- [x] Configurar AsyncStorage para persistência local
- [x] Testar fluxo completo da aplicação
- [x] BUG: Sugestão não carrega ou está muito lenta após upload de foto
- [x] BUG: App bloqueia durante carregamento de sugestão - não avança do loading
- [x] BUG: IA não deteta alimentos corretamente nas fotos
- [x] BUG CRÍTICO: App usa sempre fallback - não analisa fotos realmente, mostra mesmos ingredientes/receitas
- [x] BUG: Erro "A IA não conseguiu identificar alimentos na imagem" - análise falha sem resultados
- [x] BUG CRÍTICO: App usa sempre fallback (fruta, iogurte, cereais) - não analisa imagem real
- [x] Cruzamento completo com perfil (objetivo, preferências, restrições, histórico)
- [x] Gerar 3-7 receitas por análise em vez de 2-3
- [x] Mostrar lista de receitas com intervalo calórico, tempo e alinhamento
- [x] Sistema de avaliação: Gostei/Não gostei, Volto a fazer/Nunca mais
- [x] Aprendizagem contínua baseada nas avaliações do utilizador
- [x] Criar sistema de planos (Free/Pro/Pro+) com gestão de subscrição
- [x] Implementar análise de refeições com calorias e alinhamento (função principal)
- [x] Free: Scan de refeições + tracking com intervalos (sem sugestões)
- [x] Pro: Scan frigorífico 1x/dia + sugestões básicas + ajuste objetivo calórico
- [x] Pro+: Scan ilimitado + planeamento semanal + receitas otimizadas + lista compras
- [x] Criar ecrã de upgrade com comparação de planos
- [x] Implementar paywall para funcionalidades premium
- [x] BUG: Plano Pro não consegue aceder ao scan de frigorífico
- [x] BUG: Não é possível voltar ao plano grátis após escolher plano pago
- [x] BUG: Scan frigorífico esgotado no Pro mostra badge PRO em vez de PRO+ e redireciona para plano errado
- [x] Implementar sistema de i18n com inglês como padrão
- [x] Criar traduções para português e espanhol
- [x] Adicionar seletor de idioma nas definições
- [x] Adicionar informações nutricionais detalhadas às receitas (açúcares, gordura saturada, fibra, proteínas)
- [x] Traduzir receitas sugeridas para o idioma selecionado pelo utilizador
- [x] Atualizar ecrã de sugestões para mostrar informações nutricionais
- [x] BUG: Sugestões de receitas em espanhol não estão traduzidas
- [x] Aplicar tradução multilingue à análise de refeições (meal scan)
- [x] Adicionar campo de peso do utilizador no onboarding
- [x] Implementar modo escuro (dark mode) na interface
- [x] Traduzir mensagens de carregamento e identificação de alimentos durante análise
- [x] Atualizar tema de cores para paleta premium
- [x] Criar componentes de visualização de dados (progress rings, bar charts)
- [x] Redesenhar Home Screen com dashboard premium
- [x] Redesenhar ecrãs de análise e resultados
- [x] Redesenhar ecrã de sugestões de receitas
- [x] Redesenhar ecrãs de definições e upgrade

- [x] Traduzir "refeições recentes" na Home Screen e outros textos em inglês

- [x] Traduzir hint de hora da refeição (Breakfast time, Lunch time, etc.)
- [x] Adicionar seletor de idioma no onboarding
- [x] Traduzir badge de streak (3 days -> 3 dias)

- [x] Implementar nome CaliQ e ícone Cérebro Tech + Natureza

- [x] Trocar ícone para versão Lâmpada Inteligente (garfo e colher)

- [x] Traduzir restrições alimentares no onboarding (todas as 7 restrições em PT/EN/ES)

- [x] Adicionar restrição alimentar "Sem Soja" ao onboarding

- [x] Permitir editar restrições alimentares nas Definições

- [x] Corrigir erro de build Android: converter imagens WebP para PNG

- [x] Implementar encriptação de dados sensíveis no servidor (AES-256-GCM)
- [x] Criar política de privacidade (Privacy Policy)
- [x] Adicionar ecrã de Política de Privacidade no onboarding

- [x] Traduzir Política de Privacidade para inglês
- [x] Traduzir Política de Privacidade para espanhol

- [x] Adicionar link para solicitar exclusão de conta nas Definições
- [x] Adicionar URL para política de privacidade nas Definições

- [x] Hospedar Política de Privacidade em caliq.app/privacy (página HTML com 3 idiomas)

- [x] Otimizar ícone para Google Play (512×512px PNG, até 1 MB)

- [x] Criar 2 recursos gráficos promocionais (1024×500px PNG/JPEG)

- [x] Criar página web oficial da CaliQ (minimalista, profissional, responsiva)

- [x] Traduzir página web oficial para inglês (index-en.html)

- [x] Corrigir pré-visualização da página web oficial (adicionado express.static)

- [x] Alterar nome da aplicação de FoodIQ para CaliQ em todos os ficheiros

- [ ] Gerar 5 conceitos de ícones para CaliQ mantendo identidade visual

- [x] Gerar recurso gráfico promocional em inglês (1024×500px)

- [x] Gerar recurso gráfico promocional em português (1024×500px) com branding CaliQ

- [x] Criar página HTML com downloads diretos dos recursos gráficos

- [x] Gerar 4 capturas de ecrã para smartphone (9:16, 1080×1920px)
- [x] Gerar 4 capturas de ecrã para tablet 7" (9:16, 1200×2133px)
- [x] Gerar 4 capturas de ecrã para tablet 10" (9:16, 1600×2844px)

- [x] Atualizar ícone do splash screen (loading) da aplicação

- [x] Configurar EAS Build para gerar ficheiros .aab para Google Play Store

- [x] Corrigir configurações do expo-audio para remover serviços em primeiro plano restritos
- [x] Gerar novo ficheiro .aab sem avisos da Google Play Console

- [x] Criar ecrã de novidades (What's New) para versão 1.0.1
- [x] Implementar lógica de exibição única por versão com AsyncStorage
- [x] Traduzir novidades para PT/EN/ES

## Novas Funcionalidades v1.1.0

### Perfil Expandido
- [x] Adicionar campo de nome no onboarding e perfil
- [x] Adicionar campo de idade no onboarding e perfil
- [x] Adicionar campo de altura no onboarding e perfil
- [ ] Atualizar cálculos de calorias com idade e altura (fórmula Harris-Benedict)

### Tipos de Dieta Adicionais
- [x] Adicionar dieta Keto às opções
- [x] Adicionar dieta Paleo às opções
- [x] Adicionar dieta Low Carb às opções
- [x] Adicionar dieta Mediterrânea às opções
- [ ] Atualizar filtros de receitas para considerar novos tipos de dieta

### Edição de Alimentos e Auto-Aprendizagem
- [x] Criar interface de edição de alimentos analisados
- [x] Implementar sistema de correções manuais
- [x] Criar sistema de auto-aprendizagem com correções
- [ ] Armazenar correções no backend para melhorar análises futuras

### Lista de Compras
- [x] Criar ecrã de lista de compras
- [ ] Permitir adicionar ingredientes de receitas à lista
- [x] Implementar funcionalidade de marcar itens como comprados
- [x] Adicionar opção de exportar lista como PDF
- [x] Adicionar opção de imprimir lista
- [ ] Integrar com plano Pro+ (feature premium)

## Novas Funcionalidades v1.2.0

### Integração Lista de Compras com Receitas
- [x] Adicionar botão "Adicionar à Lista" em cada receita sugerida
- [x] Implementar função para extrair ingredientes da receita
- [x] Adicionar ingredientes à lista de compras com um toque
- [x] Mostrar confirmação visual quando ingredientes forem adicionados

### Cálculo de Calorias com Harris-Benedict
- [x] Implementar fórmula Harris-Benedict (homens e mulheres)
- [x] Adicionar campo de sexo no perfil do utilizador
- [x] Adicionar campo de nível de atividade física no perfil
- [x] Calcular TMB (Taxa Metabólica Basal) com idade, altura, peso
- [x] Calcular TDEE (Total Daily Energy Expenditure) com nível de atividade
- [x] Mostrar calorias diárias recomendadas no dashboard (Home)
- [x] Usar TDEE para ajustar recomendações calóricas personalizadas

## Novas Funcionalidades v1.3.0

### Integração de TDEE na Análise de Refeições
- [x] Enviar dados de TDEE (idade, peso, altura, sexo, atividade) na chamada da API de análise
- [x] Atualizar prompt LLM para considerar objetivo calórico personalizado do utilizador
- [x] Ajustar sugestões de receitas com base no TDEE calculado
- [x] Mostrar feedback contextualizado no prompt LLM
- [x] Testar fluxo completo de análise com TDEE personalizado

## Novas Funcionalidades v1.4.0

### Ajuste Manual de Objetivo Calórico Diário
- [x] Adicionar campo `useManualCalories` (boolean) no contexto
- [x] Adicionar campo `manualCalorieGoal` (number) no contexto
- [x] Criar função `setManualCalorieGoal` para atualizar objetivo manual
- [x] Criar toggle "Automático/Manual" no ecrã de Definições
- [x] Adicionar input numérico para definir calorias manuais (1200-4000 kcal)
- [x] Atualizar função `calculateDailyCalories` para considerar modo manual
- [x] Atualizar card do dashboard para mostrar se é automático ou manual
- [x] Adicionar traduções PT/EN/ES para novos campos
- [x] Testar fluxo completo de ajuste manual

## Correções v1.4.1

### Compatibilidade Android 15+
- [x] Resolver aviso da Google Play Console sobre BOOT_COMPLETED broadcast receivers
- [x] Desabilitar serviços de áudio em primeiro plano (expo-audio)
- [x] Adicionar blockedPermissions para RECEIVE_BOOT_COMPLETED
- [x] Configurar targetSdkVersion: 35 para Android 15+ compliance
- [x] Adicionar regras Proguard para proteção de classes de áudio

## Correções v1.4.2

### Compatibilidade Android 15+ - APIs Descontinuadas
- [x] Atualizar react-native-screens de 4.16.0 para 4.23.0 (suporte WindowInsetsController)
- [x] Atualizar expo de 54.0.29 para 54.0.33 (patches de compatibilidade)
- [x] Atualizar expo-image-picker para versão com Android 15 compliance
- [x] Remover uso de APIs descontinuadas (getStatusBarColor, setStatusBarColor, etc.)
- [x] Usar novas APIs do Android 15 (WindowCompat, WindowInsetsController)

## Correções v1.4.3

### Compatibilidade Android 16+ - Orientação e Telas Grandes
- [x] Remover restrição android:screenOrientation="PORTRAIT" do app.config.ts
- [x] Permitir sistema operativo gerir orientação automaticamente
- [x] Validar responsividade em orientação paisagem
- [x] Suportar dispositivos dobráveis e tablets sem restrições

## Correções v1.4.4

### Resolução Definitiva de APIs Descontinuadas Android 15
- [x] Adicionar compileSdkVersion: 35 para Android 15 compliance
- [x] Ativar enableProguardRules para otimização de build
- [x] Adicionar Proguard rules para desabilitar warnings de APIs antigas
- [x] Atualizar @react-navigation/native, @react-navigation/bottom-tabs
- [x] Atualizar react-native-gesture-handler, react-native-reanimated
- [x] Forçar uso de WindowInsetsController em vez de setStatusBarColor/setNavigationBarColor

## Bugs

### Expo Go não abre a app via QR code
- [x] Diagnosticar erro "Something went wrong" no Expo Go
- [x] Verificar compatibilidade Expo SDK vs Expo Go (expo-doctor)
- [x] Instalar dependência peer em falta (expo-asset)
- [x] Deduplicar dependências (expo-constants, expo-font)
- [x] Corrigir versões incompatíveis (react-native-screens, expo-router, etc.)
- [x] Remover flag --web do Metro para suportar dispositivos nativos
- [x] Corrigir problema de conexão

## Preparação para Publicação v1.4.6

### Google Play Store - Version Code
- [x] Atualizar versionCode para 10004 (superior ao anterior 10003 no Play Console)
- [x] Confirmar version: "1.4.6" no app.config.ts
- [x] Confirmar appVersionSource: "local" no eas.json
- [x] Criar checkpoint final para publicação na Play Store

## Correção versionCode para Google Play Store

- [x] Confirmar versionCode: 10004 no app.config.ts (superior ao anterior 10003)
- [x] Adicionar autoIncrement: true no eas.json (perfil production/android)
- [x] Confirmar appVersionSource: "local" no eas.json para EAS respeitar valor local

## Ecrã de Política de Privacidade no Onboarding

- [x] Criar ecrã de Política de Privacidade com conteúdo completo (PT/EN/ES)
- [x] Adicionar checkbox de aceitação obrigatória ("Li e aceito a Política de Privacidade")
- [x] Integrar ecrã no fluxo de onboarding (último passo, após restrições)
- [x] Guardar aceitação no AsyncStorage para não mostrar novamente (via completeOnboarding)
- [x] Adicionar link para versão web completa (caliq.app/privacy)

## Gestão Automática de versionCode

- [x] Remover versionCode: 10004 fixo do app.config.ts
- [x] Confirmar autoIncrement: true no eas.json (perfil production/android)

## Desofuscação R8/ProGuard para Play Store

- [x] Ativar R8 enableMinifyInReleaseBuilds e enableShrinkResourcesInReleaseBuilds no app.config.ts
- [x] Configurar geração automática de mapping.txt para upload no Play Console

## Regras ProGuard Completas

- [x] Adicionar regras ProGuard para todas as dependências nativas do projeto (RN core, Hermes, Expo modules, Reanimated, Worklets, Gesture Handler, Screens, SVG, Safe Area, AsyncStorage, Glide, OkHttp)

## Regra ProGuard para Câmara

- [x] Adicionar regra ProGuard para expo-image-picker (câmara): expo.modules.imagepicker.** e com.imagepicker.**

## Regra ProGuard para expo-print

- [x] Adicionar regra ProGuard para expo-print (exportação de PDF): expo.modules.print.**

## Script de Automação Play Store

- [x] Criar script Node.js para upload do AAB e mapping.txt para Play Console (scripts/upload-to-play-store.mjs)

## Bug: Invalid URL no tRPC em dispositivos físicos

- [x] Corrigir "Invalid URL: /api/trpc/meals.analyzeMeal?batch=1" em Samsung — EXPO_PUBLIC_API_BASE_URL definido e getApiBaseUrl() melhorado com aviso explícito

## Bug: Links "Comprar na Amazon" não correspondem ao produto

- [ ] Corrigir botão "Comprar na Amazon" para que os produtos correspondam ao item selecionado

## Bug: Pré-visualização mostra página oficial do Expo

- [x] Corrigir pré-visualização que mostra landing page do CaliQ em vez do app — pasta public/ renomeada para website/

## Bug: Não é possível adicionar produtos à lista de compras

- [x] Diagnosticar e corrigir o problema de adição de itens à lista de compras — lista restrita ao Pro+ sem feedback visual

- [x] Mostrar ecrã de bloqueio com botão de upgrade quando utilizador sem Pro+ tenta usar lista de compras
