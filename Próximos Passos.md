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
     - h) Construir funcionamento do cadastro de Eventos ✓
5. **Links Externos em Nova Aba (`target="_blank" rel="noopener noreferrer"`)** ✓ (80 links atualizados em todas as páginas) ✓
6. **Colocar arquivos das atas e documentos de apoio na aba "9. Outros" da Área do Associado** ✓
7. **Implementar sistema de pagamento da taxa de associação (R$ 100 via Asaas)** ✓ (Fase 3 Concluída)
8. **Implementar sistema de pagamento para Área de Eventos** ✓
   - 8.1. Participante: por evento/curso ✓
   - 8.2. Palestrante: mensalidade (até 4 eventos) ✓

9. **Templates jurídicos e previdenciários na aba "Templates"**
   - a) Modelos de petições e cálculos previdenciários

10. Refinar layouts e estilo

11. Prompt de verificação de performance, funcionamento, lógica, segurança e conformidades

12. Criar políticas

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
  - Ao validar: atualiza `email_verificado = true` no Supabase e persiste a sessão com `pagamento_status = 'Pendente'`.

### ✅ FASE 3: Módulo de Pagamento Asaas - Taxa de R$ 100 (CONCLUÍDA)
- **Modal de Pagamento da Anuidade/Taxa (`modal-pagamento-associacao`):**
  - Exibição da anuidade oficial SBPS: **R$ 100,00** (vigência de 12 meses).
  - **Aba 1: PIX Dinâmico**: QR Code gerado em tempo real, Chave Copia e Cola com botão de 1-clique, guia ilustrado de 3 passos e indicador pulsante de status com polling automático.
  - **Aba 2: Cartão de Crédito**: Formulário profissional com detecção visual dinâmica de bandeiras (Visa, Mastercard, Elo, Amex), parcelamento em até 12x, formatação de validade e CVV.
  - **Modo de Simulação para Testes**: Card de testes sandbox com botão `[⚡ Simular Pagamento Aprovado (Teste)]` que dispara a RPC `sbps.simular_aprovacao_pagamento` no Supabase e aprova instantaneamente.
  - **Tela de Recibo e Comprovante**: Exibe confirmação com número de identificação da transação, forma de pagamento e botão de liberação direta para a Área do Associado.
  - **Bloqueio no Login**: Ao tentar logar com anuidade pendente, o portal redireciona automaticamente para a tela de quitação.

### ✅ FASE 4: Motor de Login Inteligente & Dispositivos Confiáveis (CONCLUÍDA)
- **Regra dos 7 Dias**:
  - Usuário cadastrado/validado tem seu dispositivo atual registrado como confiável por 7 dias.
  - Ao fazer login no mesmo dispositivo em até 7 dias: login direto via **E-mail/CPF + Senha** sem pedir código (renovando automaticamente os 7 dias em background).
  - Em novo navegador/dispositivo ou após 7 dias de expiração: o sistema detecta dispositivo desconhecido e abre o **Modal de Verificação de Segurança (2FA)** solicitando código OTP de 6 dígitos.
  - Checkbox *"Lembrar este dispositivo por 7 dias"* no modal 2FA para memorizar a máquina.
- **2FA Permanente Opcional (Painel Perfil)**:
  - Toggle Switch moderno na aba Perfil (*"Exigir Código 2FA em Todos os Logins"*): ignora a regra dos 7 dias e exige código de 6 dígitos no e-mail a cada acesso.
  - Sincronização em tempo real com o Supabase (`updateTwoFactorPreference`).
- **Gerenciamento de Dispositivo**:
  - Exibe no perfil o navegador/SO conectado e badge de status ("Confiável (7 dias)" ou "Não Confiável").
  - Botão *"Esquecer Este Dispositivo"*: revoga imediatamente a confiança, forçando novo 2FA no próximo login.

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

---

## ✅ Sistema de Pagamentos - Área de Eventos (Concluído)

- **Participante**:
  - Paga apenas ao se inscrever em eventos/cursos pagos com valor definido pelo palestrante.
  - Eventos gratuitos têm confirmação direta sem cobrança.
  - Suporte a PIX com QR Code dinâmico e Cartão de Crédito com emissão de recibo digital.
- **Palestrante**:
  - Mensalidade Base de **R$ 50,00/mês** com franquia de até **5 publicações** combinadas (eventos e cursos).
  - **Opção 1**: Publicação avulsa por **R$ 10,00** (+1 publicação extra).
  - **Opção 2**: Aumento de Pacote Mensal de 5 em 5:
    - Base (5 publicações): R$ 50,00/mês
    - Pacote 10 (10 publicações): R$ 90,00/mês
    - Pacote 15 (15 publicações): R$ 125,00/mês
    - Pacote 20 (20 publicações): R$ 155,00/mês
    - Ilimitado: R$ 170,00/mês
  - Travamento automático ao criar eventos quando a cota estiver esgotada e atualização em tempo real no dashboard.

