# Próximos Passos & Registro de Implementação (SBPS)

## 📌 Checklist Geral de Tarefas

1. **Chatbot** ✓
2. **Tela de Cadastro Associado** ✓ (Estrutura visual e fluxo integrados)
3. **Refinar tela de login** ✓
4. **Refinar layout e páginas em geral**
   - **4.1. Área do Associado** ✓
     - a) Deixar mais profissional ✓
     - b) Tirar mensagem após login ✓
     - c) Arrumar confirmação para sair da conta ✓
     - d) Deixar só o texto "Portal do Associado SBPS" ao entrar na Área do Associado ✓
     - e) Responsividade do menu superior vs drawer mobile ✓
     - f) Lógica de "voltar" ao painel inicial ✓
     - g) Correção de refinamentos visuais ✓
     - h) Ajuste em cada aba da Área do Associado ✓
     - i) **Fluxo Completo de Cadastro, Validação, Pagamento e Login** (Ver detalhamento abaixo)
   - **4.2. Área de Eventos**
     - a) Deixar aba "Perfil" completa ✓
     - b) Refinar visualização de eventos, inscrições e participações ao clicar nos cards ✓
     - c) Conexão para emissão de certificado na aba "Participações" ✓
     - d) Refinar formulário e envio de "Sugestões" ✓   
     - e) Refinar tela de "Ajuda" ✓
     - f) Formulário do fluxo de Sugestões ✓
     - g) Construir aba de "Comunidade" ✓
     - h) Construir funcionamento do cadastro de Eventos
5. **Links Externos em Nova Aba (`target="_blank" rel="noopener noreferrer"`)** ✓ (80 links atualizados em todas as páginas)
6. **Colocar arquivos das atas e documentos de apoio na aba "9. Outros" da Área do Associado** ✓
7. **Implementar sistema de pagamento da taxa de associação (R$ 100 via Asaas)** (Em andamento - Fase 3)
8. **Implementar sistema de pagamento para Área de Eventos**
   - 8.1. Participante: por evento/curso
   - 8.2. Palestrante: mensalidade (até 4 eventos)
9. **Templates jurídicos e previdenciários na aba "Templates"**
   - a) Modelos de petições e cálculos previdenciários

---

## 🚀 Arquitetura de Cadastro, Validação, Pagamento e Login (4 Fases)

### ✅ FASE 1: Banco de Dados & Segurança Supabase (CONCLUÍDA)
- **Tabelas criadas no schema `sbps`:**
  - `sbps.auth_codigos`: Códigos OTP numéricos de 6 dígitos com expiração (15 min) e limite de 5 tentativas anti-força bruta.
  - `sbps.dispositivos_confiaveis`: Registro de dispositivos por token/navegador para a regra dos 7 dias.
  - `sbps.pagamentos_associacao`: Histórico de pagamentos Asaas, status, PIX copia-e-cola e webhooks.
  - Colunas adicionadas em `sbps.associados`: `email_verificado`, `dois_fatores_sempre`, `pagamento_status`, `termo_lgpd_aceito_em`, `tipo_associado`, `pessoa_tipo`.
- **Funções RPC seguras (`SECURITY DEFINER`):**
  - `sbps.gerar_codigo_otp`, `sbps.validar_codigo_otp`, `sbps.verificar_dispositivo_confiavel`, `sbps.registrar_ou_renovar_dispositivo`, `sbps.simular_aprovacao_pagamento`, `sbps.processar_webhook_asaas`.
  - Aliases criados no schema `public` para compatibilidade total com `.rpc()`.

### ✅ FASE 2: Validações Estritas & Modal OTP de E-mail (CONCLUÍDA)
- **Validações estritas em tempo real:**
  - **CPF Oficial**: Máscara `000.000.000-00`, algoritmo oficial Módulo 11 (2 dígitos verificadores) e bloqueio de CPFs já cadastrados via consulta assíncrona no Supabase (`isCpfAvailable`).
  - **RG**: Validação de formato e dígito verificador estadual (`isValidRG`).
  - **Data de Nascimento**: Trava dinâmica obrigatória de maioridade (+18 anos).
  - **Celular / WhatsApp**: Máscara `(00) 90000-0000` com validação de DDDs reais de todos os estados do Brasil.
  - **E-mail Principal**: Validação regex, filtro bloqueando e-mails temporários/descartáveis e consulta de unicidade no Supabase (`isEmailAvailable`).
  - **Confirmação de E-mail**: Comparação estrita garantindo equivalência.
  - **Endereço ViaCEP**: Auto-preenchimento de logradouro, bairro, cidade e UF.
  - **Login / Usuário**: Verificação de disponibilidade única com debounce no Supabase.
  - **Senha Forte**: Checklist dinâmico (8+ dígitos, maiúscula, número e especial).
  - **Termo e LGPD**: Checkbox obrigatório do Estatuto Social e LGPD (Lei nº 13.709/2018) com registro de timestamp.
- **Modal de Código OTP (6 dígitos):**
  - 6 inputs quadrados com foco automático, avanço rápido e suporte a colar código.
  - Contador regressivo de 60 segundos com botão de reenvio.
  - Card de Ambiente de Testes com botão "Preencher Código" para validação imediata.
  - Ao validar: atualiza `email_verificado = true` no Supabase e persiste a sessão.

### ⏳ FASE 3: Módulo de Pagamento Asaas - Taxa de R$ 100 (PRÓXIMA FASE)
- **Modal de Pagamento da Anuidade/Taxa:**
  - Exibição da taxa de associação SBPS: **R$ 100,00**.
  - **Aba 1: PIX Dinâmico** (QR Code visual + Chave Copia e Cola).
  - **Aba 2: Cartão de Crédito** (Formulário completo com bandeiras e tokenização Asaas).
  - **Modo de Simulação para Testes**: Botão `[Simular Pagamento Aprovado (Teste)]` chamando `SBPS_Supabase.simulatePaymentApproval(email)` para testar aprovações instantaneamente sem gastar dinheiro real.
  - **Integração Real (Produção)**: Conexão com API do Asaas e Webhook para receber confirmação de liquidação.

### ⏳ FASE 4: Motor de Login Inteligente & Dispositivos Confiáveis (A SEGUIR)
- **Regra dos 7 Dias**:
  - Usuário cadastrado/validado fica logado direto.
  - Se fizer logout e entrar no mesmo dispositivo em até 7 dias: apenas **Usuário + Senha** (sem código).
  - Após 7 dias ou ao entrar por um **novo dispositivo/navegador**: exige **Usuário + Senha + Código OTP de 6 dígitos** enviado ao e-mail.
  - Ao validar o código, o dispositivo é renovado por mais 7 dias.
- **2FA Opcional no Perfil**:
  - Opção no painel de perfil: *"Exigir código de segurança em todos os logins"*, permitindo que o associado ative verificação em duas etapas obrigatória permanente.

---

## 🔑 Ativação em Produção Real (O que será configurado no final)

1. **Gateway Asaas**:
   - Conta no Asaas criada (gratuita, sem mensalidade).
   - Inserção da Chave de API de Produção e configuração da URL do Webhook da SBPS.
2. **Provedor de E-mail Transacional**:
   - Configuração do SMTP corporativo da SBPS no painel do Supabase (*Settings -> Auth -> SMTP*) OU chave de API do **Resend** (3.000 e-mails/mês gratuitos).
   - O card verde de teste é desligado e o código passa a chegar exclusivamente na caixa de entrada do associado.

---

## 📋 Dúvidas e Dados Pendentes

- **Benefícios dos Associados**: Definir lista final de parceiros/convênios e descontos.
- **Políticas Institucionais**:
  - Termos de Uso e Política de Privacidade da SBPS.
  - Política de Inscrição e Cancelamento de Eventos.
- **Conteúdo das Abas**:
  - Cadastro de Cursos e Seminários reais.
  - Cadastro de Obras na Vitrine de Autores (Livraria).
