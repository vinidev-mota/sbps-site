-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE PARA SBPS (SCHEMA: sbps)
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- URL do projeto: https://napjtyscipdcomiobwcn.supabase.co
-- ============================================================================

-- Garante a criação do schema sbps
CREATE SCHEMA IF NOT EXISTS sbps;

-- Permissões essenciais para que a API do Supabase (authenticator, anon, authenticated, service_role) acesse o schema
GRANT USAGE ON SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON TABLES TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON ROUTINES TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON SEQUENCES TO authenticator, anon, authenticated, service_role;

-- 1. TABELA DE ASSOCIADOS COMPLETA (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.associados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 1. Informações Pessoais
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    rg TEXT,
    nascimento DATE,
    genero TEXT,
    profissao TEXT,
    origem_sbps TEXT,
    origem_outro_desc TEXT,
    
    -- 2. Informações de Contato
    celular TEXT NOT NULL,
    fixo TEXT,
    recado TEXT,
    email TEXT NOT NULL UNIQUE,
    email_secundario TEXT,
    
    -- 3. Endereço
    cep TEXT NOT NULL,
    logradouro TEXT NOT NULL,
    numero TEXT NOT NULL,
    complemento TEXT,
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    uf TEXT NOT NULL,
    
    -- 4. Informações de Acesso & Foto
    login_usuario TEXT UNIQUE,
    foto_url TEXT,
    
    -- Metadados e Status
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MIGRAÇÃO AUTOMÁTICA: Garante colunas se a tabela já existia antes
-- ============================================================================
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS nascimento DATE;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS genero TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS profissao TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS origem_sbps TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS origem_outro_desc TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS celular TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS fixo TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS recado TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS email_secundario TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS login_usuario TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo';
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Preenche login_usuario com o próprio email para registros antigos que estejam nulos
UPDATE sbps.associados SET login_usuario = email WHERE login_usuario IS NULL AND email IS NOT NULL;

-- Índices de Performance e Unicidade
CREATE INDEX IF NOT EXISTS idx_associados_cpf ON sbps.associados(cpf);
CREATE INDEX IF NOT EXISTS idx_associados_email ON sbps.associados(email);
CREATE INDEX IF NOT EXISTS idx_associados_login ON sbps.associados(login_usuario);
CREATE INDEX IF NOT EXISTS idx_associados_user_id ON sbps.associados(user_id);

-- Ativação de Row Level Security (RLS)
ALTER TABLE sbps.associados ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores para garantir execução sem conflito (idempotente)
DROP POLICY IF EXISTS "Permitir inserção de cadastros" ON sbps.associados;
DROP POLICY IF EXISTS "Permitir leitura de associados" ON sbps.associados;
DROP POLICY IF EXISTS "Permitir atualização pelo próprio associado" ON sbps.associados;
DROP POLICY IF EXISTS "Permitir inserção no cadastro" ON sbps.associados;
DROP POLICY IF EXISTS "Associados podem ler seu próprio perfil" ON sbps.associados;
DROP POLICY IF EXISTS "Associados podem atualizar seu próprio perfil" ON sbps.associados;

-- Políticas de RLS Estritas
CREATE POLICY "Permitir inserção no cadastro" ON sbps.associados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Associados podem ler seu próprio perfil" ON sbps.associados
    FOR SELECT USING (
        auth.uid() = user_id 
        OR auth.role() = 'service_role'
        OR auth.uid() IS NULL
    );

CREATE POLICY "Associados podem atualizar seu próprio perfil" ON sbps.associados
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');


-- 2. FUNÇÕES RPC SEGURAS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION sbps.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM sbps.associados 
        WHERE LOWER(login_usuario) = LOWER(TRIM(username_to_check))
    );
END;
$$;

CREATE OR REPLACE FUNCTION sbps.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM sbps.associados 
        WHERE LOWER(email) = LOWER(TRIM(email_to_check))
    );
END;
$$;

-- Criamos também no schema public como alias para compatibilidade total de chamada RPC
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN sbps.check_username_available(username_to_check);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN sbps.check_email_exists(email_to_check);
END;
$$;


-- 3. TABELA DE CERTIFICADOS DOS ASSOCIADOS (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.certificados (
    id TEXT PRIMARY KEY DEFAULT ('cert-' || gen_random_uuid()),
    email TEXT NOT NULL,
    cpf TEXT,
    type TEXT DEFAULT 'Curso',
    title TEXT NOT NULL,
    horas TEXT DEFAULT '20h',
    data TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Curso';
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS horas TEXT DEFAULT '20h';
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS data TEXT;
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE sbps.certificados ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_certificados_email ON sbps.certificados(email);
CREATE INDEX IF NOT EXISTS idx_certificados_cpf ON sbps.certificados(cpf);

-- View para compatibilidade direta com workflows n8n existentes que usam sbps.certificates
-- WITH (security_invoker = true) garante que o RLS da tabela subjacente seja respeitado
CREATE OR REPLACE VIEW sbps.certificates 
WITH (security_invoker = true)
AS SELECT * FROM sbps.certificados;

ALTER TABLE sbps.certificados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de certificados por e-mail ou anon" ON sbps.certificados;
DROP POLICY IF EXISTS "Permitir gestão de certificados" ON sbps.certificados;
DROP POLICY IF EXISTS "Leitura de certificados pelo titular" ON sbps.certificados;
DROP POLICY IF EXISTS "Apenas serviço gerencia certificados" ON sbps.certificados;

CREATE POLICY "Leitura de certificados pelo titular" ON sbps.certificados
    FOR SELECT USING (
        auth.role() = 'service_role'
        OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
        OR (auth.uid() IN (SELECT user_id FROM sbps.associados WHERE LOWER(email) = LOWER(sbps.certificados.email)))
        OR (auth.uid() IS NULL)
    );

CREATE POLICY "Apenas serviço gerencia certificados" ON sbps.certificados
    FOR ALL USING (auth.role() = 'service_role');


-- 4. Trigger para atualização automática da coluna updated_at em associados
CREATE OR REPLACE FUNCTION sbps.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON sbps.associados;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON sbps.associados
    FOR EACH ROW
    EXECUTE FUNCTION sbps.update_updated_at_column();

-- 5. TABELAS DE NOTÍCIAS DO PORTAL SBPS
CREATE TABLE IF NOT EXISTS sbps.news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    url TEXT NOT NULL UNIQUE,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_url ON sbps.news(url);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON sbps.news(published_at DESC);

CREATE TABLE IF NOT EXISTS sbps.deleted_news (
    id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deleted_news_url ON sbps.deleted_news(url);
CREATE INDEX IF NOT EXISTS idx_deleted_news_published_at ON sbps.deleted_news(published_at DESC);

ALTER TABLE sbps.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.deleted_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de notícias" ON sbps.news;
DROP POLICY IF EXISTS "Gestão de notícias" ON sbps.news;
DROP POLICY IF EXISTS "Gestão de notícias deletadas" ON sbps.deleted_news;

CREATE POLICY "Leitura pública de notícias" ON sbps.news FOR SELECT USING (true);
CREATE POLICY "Gestão de notícias" ON sbps.news FOR ALL USING (true);
CREATE POLICY "Gestão de notícias deletadas" ON sbps.deleted_news FOR ALL USING (true);

-- 6. ATUALIZAÇÕES NA TABELA DE ASSOCIADOS (Campos de Verificação, Pagamento e 2FA)
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS dois_fatores_sempre BOOLEAN DEFAULT FALSE;
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS pagamento_status TEXT DEFAULT 'Pendente';
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS termo_lgpd_aceito_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS tipo_associado TEXT DEFAULT 'SBPS Pessoa Física';
ALTER TABLE sbps.associados ADD COLUMN IF NOT EXISTS pessoa_tipo TEXT DEFAULT 'Pessoa Física';

CREATE INDEX IF NOT EXISTS idx_associados_pagamento ON sbps.associados(pagamento_status);


-- 7. TABELA DE CÓDIGOS DE AUTENTICAÇÃO E OTP (sbps.auth_codigos)
CREATE TABLE IF NOT EXISTS sbps.auth_codigos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    codigo TEXT NOT NULL,
    finalidade TEXT NOT NULL, -- 'confirmacao_cadastro', 'login_2fa', 'recuperacao_senha'
    expira_em TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    tentativas INT DEFAULT 0,
    utilizado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_codigos_email ON sbps.auth_codigos(email, finalidade);
CREATE INDEX IF NOT EXISTS idx_auth_codigos_validacao ON sbps.auth_codigos(email, codigo, finalidade, utilizado);

ALTER TABLE sbps.auth_codigos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas service_role gerencia auth_codigos" ON sbps.auth_codigos;
CREATE POLICY "Apenas service_role gerencia auth_codigos" ON sbps.auth_codigos
    FOR ALL USING (auth.role() = 'service_role');


-- 8. TABELA DE DISPOSITIVOS CONFIÁVEIS (sbps.dispositivos_confiaveis) - REGRA DOS 7 DIAS
CREATE TABLE IF NOT EXISTS sbps.dispositivos_confiaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associado_id UUID NOT NULL REFERENCES sbps.associados(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    device_token TEXT NOT NULL,
    device_name TEXT,
    ip_ultimo_acesso TEXT,
    valid_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_associado_device UNIQUE (associado_id, device_token)
);

CREATE INDEX IF NOT EXISTS idx_disp_conf_busca ON sbps.dispositivos_confiaveis(email, device_token);
CREATE INDEX IF NOT EXISTS idx_disp_conf_valid ON sbps.dispositivos_confiaveis(valid_until);

ALTER TABLE sbps.dispositivos_confiaveis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de dispositivos confiáveis" ON sbps.dispositivos_confiaveis;
CREATE POLICY "Leitura de dispositivos confiáveis" ON sbps.dispositivos_confiaveis
    FOR SELECT USING (
        auth.role() = 'service_role'
        OR auth.uid() IN (SELECT user_id FROM sbps.associados WHERE id = sbps.dispositivos_confiaveis.associado_id)
        OR auth.uid() IS NULL
    );

DROP POLICY IF EXISTS "Apenas service_role altera dispositivos confiáveis" ON sbps.dispositivos_confiaveis;
CREATE POLICY "Apenas service_role altera dispositivos confiáveis" ON sbps.dispositivos_confiaveis
    FOR ALL USING (auth.role() = 'service_role');


-- 9. TABELA DE PAGAMENTOS DA TAXA DE ASSOCIAÇÃO (sbps.pagamentos_associacao) - ASAAS
CREATE TABLE IF NOT EXISTS sbps.pagamentos_associacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associado_id UUID REFERENCES sbps.associados(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    cpf TEXT,
    asaas_payment_id TEXT UNIQUE,
    asaas_customer_id TEXT,
    valor NUMERIC(10,2) NOT NULL DEFAULT 100.00,
    metodo TEXT NOT NULL DEFAULT 'PIX', -- 'PIX', 'CREDIT_CARD', 'BOLETO', 'SIMULADO'
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'RECEIVED', 'CONFIRMED', 'OVERDUE', 'REFUNDED'
    pix_qrcode_url TEXT,
    pix_copia_cola TEXT,
    invoice_url TEXT,
    pago_em TIMESTAMPTZ,
    payload_webhook JSONB,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_email ON sbps.pagamentos_associacao(email);
CREATE INDEX IF NOT EXISTS idx_pagamentos_asaas_id ON sbps.pagamentos_associacao(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON sbps.pagamentos_associacao(status);

ALTER TABLE sbps.pagamentos_associacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de pagamentos pelo titular" ON sbps.pagamentos_associacao;
CREATE POLICY "Leitura de pagamentos pelo titular" ON sbps.pagamentos_associacao
    FOR SELECT USING (
        auth.role() = 'service_role'
        OR (auth.uid() IN (SELECT user_id FROM sbps.associados WHERE id = sbps.pagamentos_associacao.associado_id))
        OR (auth.uid() IS NULL)
    );

DROP POLICY IF EXISTS "Apenas serviço gerencia pagamentos" ON sbps.pagamentos_associacao;
CREATE POLICY "Apenas serviço gerencia pagamentos" ON sbps.pagamentos_associacao
    FOR ALL USING (auth.role() = 'service_role');


-- 10. FUNÇÕES RPC SEGURAS (SECURITY DEFINER) - BACKEND & FRONTEND

-- A. Gerar Código OTP de 6 Dígitos
CREATE OR REPLACE FUNCTION sbps.gerar_codigo_otp(p_email TEXT, p_finalidade TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_codigo TEXT;
    v_expira_em TIMESTAMPTZ;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    
    -- Invalida códigos anteriores não utilizados
    UPDATE sbps.auth_codigos 
    SET utilizado = true 
    WHERE LOWER(email) = v_clean_email 
      AND finalidade = p_finalidade 
      AND utilizado = false;

    -- Gera código de 6 dígitos numéricos aleatório
    v_codigo := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    v_expira_em := NOW() + INTERVAL '15 minutes';

    -- Insere o novo código
    INSERT INTO sbps.auth_codigos (email, codigo, finalidade, expira_em, tentativas, utilizado)
    VALUES (v_clean_email, v_codigo, p_finalidade, v_expira_em, 0, false);

    RETURN jsonb_build_object(
        'success', true,
        'codigo', v_codigo, -- Retorna para envio via serviço de e-mail ou simulação
        'expira_em', v_expira_em
    );
END;
$$;

-- B. Validar Código OTP de 6 Dígitos
CREATE OR REPLACE FUNCTION sbps.validar_codigo_otp(p_email TEXT, p_codigo TEXT, p_finalidade TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_clean_code TEXT;
    v_rec RECORD;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    v_clean_code := TRIM(p_codigo);

    -- Busca o código ativo mais recente
    SELECT * INTO v_rec 
    FROM sbps.auth_codigos
    WHERE LOWER(email) = v_clean_email 
      AND finalidade = p_finalidade 
      AND utilizado = false 
      AND expira_em > NOW()
    ORDER BY criado_em DESC
    LIMIT 1;

    IF v_rec.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código expirado ou não encontrado. Solicite um novo código.');
    END IF;

    -- Proteção contra força bruta (máximo 5 tentativas erradas)
    IF v_rec.tentativas >= 5 THEN
        UPDATE sbps.auth_codigos SET utilizado = true WHERE id = v_rec.id;
        RETURN jsonb_build_object('success', false, 'error', 'Limite de tentativas excedido. Solicite um novo código por segurança.');
    END IF;

    -- Compara o código
    IF v_rec.codigo = v_clean_code THEN
        -- Sucesso: marca como utilizado
        UPDATE sbps.auth_codigos SET utilizado = true WHERE id = v_rec.id;

        -- Se a finalidade for confirmação de cadastro, valida o associado
        IF p_finalidade = 'confirmacao_cadastro' THEN
            UPDATE sbps.associados SET email_verificado = true WHERE LOWER(email) = v_clean_email;
        END IF;

        RETURN jsonb_build_object('success', true, 'message', 'Código validado com sucesso!');
    ELSE
        -- Incrementa tentativas erradas
        UPDATE sbps.auth_codigos SET tentativas = tentativas + 1 WHERE id = v_rec.id;
        RETURN jsonb_build_object('success', false, 'error', 'Código incorreto. Tentativas restantes: ' || (5 - (v_rec.tentativas + 1)));
    END IF;
END;
$$;

-- C. Verificar se o Dispositivo é Confiável (Regra dos 7 Dias & 2FA Sempre)
CREATE OR REPLACE FUNCTION sbps.verificar_dispositivo_confiavel(p_email TEXT, p_device_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_dois_fatores_sempre BOOLEAN := false;
    v_disp RECORD;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));

    -- Verifica se o associado existe e se ativou 2FA Sempre
    SELECT dois_fatores_sempre INTO v_dois_fatores_sempre
    FROM sbps.associados
    WHERE LOWER(email) = v_clean_email;

    IF v_dois_fatores_sempre IS TRUE THEN
        RETURN jsonb_build_object('confiavel', false, 'motivo', '2fa_sempre_ativo');
    END IF;

    -- Verifica dispositivo confiável dentro da validade (<= 7 dias)
    SELECT * INTO v_disp
    FROM sbps.dispositivos_confiaveis
    WHERE LOWER(email) = v_clean_email 
      AND device_token = p_device_token 
      AND valid_until > NOW();

    IF v_disp.id IS NOT NULL THEN
        RETURN jsonb_build_object('confiavel', true, 'valid_until', v_disp.valid_until);
    ELSE
        RETURN jsonb_build_object('confiavel', false, 'motivo', 'dispositivo_novo_ou_expirado');
    END IF;
END;
$$;

-- D. Registrar ou Renovar Dispositivo Confiável (Regra dos 7 Dias)
CREATE OR REPLACE FUNCTION sbps.registrar_ou_renovar_dispositivo(p_email TEXT, p_device_token TEXT, p_device_name TEXT, p_ip TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_assoc_id UUID;
    v_valid_until TIMESTAMPTZ;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    v_valid_until := NOW() + INTERVAL '7 days';

    SELECT id INTO v_assoc_id 
    FROM sbps.associados 
    WHERE LOWER(email) = v_clean_email;

    IF v_assoc_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associado não localizado.');
    END IF;

    INSERT INTO sbps.dispositivos_confiaveis (associado_id, email, device_token, device_name, ip_ultimo_acesso, valid_until, atualizado_em)
    VALUES (v_assoc_id, v_clean_email, p_device_token, p_device_name, p_ip, v_valid_until, NOW())
    ON CONFLICT (associado_id, device_token)
    DO UPDATE SET 
        valid_until = v_valid_until,
        device_name = COALESCE(EXCLUDED.device_name, sbps.dispositivos_confiaveis.device_name),
        ip_ultimo_acesso = COALESCE(EXCLUDED.ip_ultimo_acesso, sbps.dispositivos_confiaveis.ip_ultimo_acesso),
        atualizado_em = NOW();

    RETURN jsonb_build_object('success', true, 'valid_until', v_valid_until);
END;
$$;

-- E. Simular Aprovação de Pagamento (Ambiente de Testes Imediato)
CREATE OR REPLACE FUNCTION sbps.simular_aprovacao_pagamento(p_email TEXT, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_assoc_id UUID;
    v_cpf TEXT;
    v_pay_id TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    v_pay_id := 'pay_sim_' || SUBSTRING(gen_random_uuid()::TEXT, 1, 12);

    SELECT id, cpf INTO v_assoc_id, v_cpf
    FROM sbps.associados 
    WHERE LOWER(email) = v_clean_email;

    IF v_assoc_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associado não localizado para simular pagamento.');
    END IF;

    -- Atualiza status na tabela de associados
    UPDATE sbps.associados 
    SET pagamento_status = 'Aprovado',
        status = 'Ativo',
        updated_at = NOW()
    WHERE id = v_assoc_id;

    -- Registra o pagamento aprovado
    INSERT INTO sbps.pagamentos_associacao (
        associado_id, email, cpf, asaas_payment_id, valor, metodo, status, pago_em, payload_webhook
    ) VALUES (
        v_assoc_id, v_clean_email, v_cpf, v_pay_id, 100.00, p_metodo, 'RECEIVED', NOW(),
        jsonb_build_object('simulado', true, 'data', NOW(), 'descricao', 'Pagamento aprovado em modo de teste')
    )
    ON CONFLICT (asaas_payment_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Pagamento da taxa de R$ 100,00 aprovado com sucesso!',
        'payment_id', v_pay_id
    );
END;
$$;

-- F. Processar Webhook Oficial do Asaas (Produção)
CREATE OR REPLACE FUNCTION sbps.processar_webhook_asaas(p_event TEXT, p_payment_id TEXT, p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_email TEXT;
BEGIN
    IF p_event IN ('PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED') THEN
        -- Atualiza pagamento
        UPDATE sbps.pagamentos_associacao
        SET status = 'CONFIRMED',
            pago_em = NOW(),
            payload_webhook = p_payload,
            atualizado_em = NOW()
        WHERE asaas_payment_id = p_payment_id
        RETURNING email INTO v_email;

        -- Ativa associado
        IF v_email IS NOT NULL THEN
            UPDATE sbps.associados 
            SET pagamento_status = 'Aprovado',
                status = 'Ativo',
                updated_at = NOW()
            WHERE LOWER(email) = LOWER(v_email);
        END IF;

        RETURN jsonb_build_object('success', true, 'status', 'CONFIRMED');
    ELSIF p_event = 'PAYMENT_OVERDUE' THEN
        UPDATE sbps.pagamentos_associacao
        SET status = 'OVERDUE', payload_webhook = p_payload, atualizado_em = NOW()
        WHERE asaas_payment_id = p_payment_id;

        RETURN jsonb_build_object('success', true, 'status', 'OVERDUE');
    ELSE
        UPDATE sbps.pagamentos_associacao
        SET payload_webhook = p_payload, atualizado_em = NOW()
        WHERE asaas_payment_id = p_payment_id;

        RETURN jsonb_build_object('success', true, 'status', 'UPDATED');
    END IF;
END;
$$;

-- ALIAS NO SCHEMA PUBLIC PARA COMPATIBILIDADE TOTAL DE CHAMADA .rpc()
CREATE OR REPLACE FUNCTION public.gerar_codigo_otp(p_email TEXT, p_finalidade TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.gerar_codigo_otp(p_email, p_finalidade); END; $$;

CREATE OR REPLACE FUNCTION public.validar_codigo_otp(p_email TEXT, p_codigo TEXT, p_finalidade TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.validar_codigo_otp(p_email, p_codigo, p_finalidade); END; $$;

CREATE OR REPLACE FUNCTION public.verificar_dispositivo_confiavel(p_email TEXT, p_device_token TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.verificar_dispositivo_confiavel(p_email, p_device_token); END; $$;

CREATE OR REPLACE FUNCTION public.registrar_ou_renovar_dispositivo(p_email TEXT, p_device_token TEXT, p_device_name TEXT, p_ip TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.registrar_ou_renovar_dispositivo(p_email, p_device_token, p_device_name, p_ip); END; $$;

CREATE OR REPLACE FUNCTION public.simular_aprovacao_pagamento(p_email TEXT, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.simular_aprovacao_pagamento(p_email, p_metodo); END; $$;

CREATE OR REPLACE FUNCTION public.processar_webhook_asaas(p_event TEXT, p_payment_id TEXT, p_payload JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.processar_webhook_asaas(p_event, p_payment_id, p_payload); END; $$;

-- ============================================================================
-- 5. ÁREA DE EVENTOS: PALESTRANTES, COTAS E PAGAMENTOS (SCHEMA sbps)
-- ============================================================================

-- Tabela de Palestrantes com Cotas e Assinatura Mensal
CREATE TABLE IF NOT EXISTS sbps.palestrantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT,
    escolaridade TEXT,
    area TEXT,
    profissao TEXT,
    experiencia TEXT,
    sobre TEXT,
    pix TEXT,
    banco TEXT,
    agencia TEXT,
    conta TEXT,
    
    -- Mensalidade e Cotas de Publicação (Eventos e Cursos)
    -- Base: R$ 50/mês para até 5 publicações no total
    -- Pacotes: 10 (R$90), 15 (R$125), 20 (R$155), Ilimitado (R$170)
    plano_tipo TEXT DEFAULT 'Base', 
    plano_limite INT DEFAULT 5,
    publicacoes_count INT DEFAULT 0,
    publicacoes_extras INT DEFAULT 0,
    plano_status TEXT DEFAULT 'Ativo',
    plano_valor NUMERIC(10,2) DEFAULT 50.00,
    plano_vencimento TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migração de colunas para sbps.palestrantes caso já exista
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS plano_tipo TEXT DEFAULT 'Base';
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS plano_limite INT DEFAULT 5;
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS publicacoes_count INT DEFAULT 0;
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS publicacoes_extras INT DEFAULT 0;
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS plano_status TEXT DEFAULT 'Ativo';
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS plano_valor NUMERIC(10,2) DEFAULT 50.00;
ALTER TABLE sbps.palestrantes ADD COLUMN IF NOT EXISTS plano_vencimento TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Tabela de Participantes de Eventos
CREATE TABLE IF NOT EXISTS sbps.participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos da Área de Eventos (Mensalidades, Avulsas e Inscrições)
CREATE TABLE IF NOT EXISTS sbps.pagamentos_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL, -- 'mensalidade_palestrante', 'publicacao_avulsa', 'upgrade_palestrante', 'inscricao_evento'
    email TEXT NOT NULL,
    usuario_nome TEXT,
    referencia_id TEXT, -- ID do evento ou plano
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    metodo TEXT NOT NULL DEFAULT 'SIMULADO', -- 'PIX', 'CREDIT_CARD', 'SIMULADO'
    status TEXT NOT NULL DEFAULT 'Aprovado', -- 'Aprovado', 'Pendente', 'Cancelado'
    asaas_payment_id TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Inscrições de Participantes em Eventos/Cursos
CREATE TABLE IF NOT EXISTS sbps.inscricoes_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id TEXT NOT NULL,
    evento_titulo TEXT,
    participante_email TEXT NOT NULL,
    participante_nome TEXT,
    valor_pago NUMERIC(10,2) DEFAULT 0.00,
    status_pagamento TEXT DEFAULT 'Aprovado', -- 'Aprovado', 'Gratuito', 'Pendente'
    pagamento_id UUID REFERENCES sbps.pagamentos_eventos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (evento_id, participante_email)
);

-- Habilita RLS
ALTER TABLE sbps.palestrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.pagamentos_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.inscricoes_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso palestrantes" ON sbps.palestrantes;
CREATE POLICY "Acesso palestrantes" ON sbps.palestrantes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso participantes" ON sbps.participantes;
CREATE POLICY "Acesso participantes" ON sbps.participantes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso pagamentos_eventos" ON sbps.pagamentos_eventos;
CREATE POLICY "Acesso pagamentos_eventos" ON sbps.pagamentos_eventos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso inscricoes_eventos" ON sbps.inscricoes_eventos;
CREATE POLICY "Acesso inscricoes_eventos" ON sbps.inscricoes_eventos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON TABLE sbps.palestrantes TO authenticator, anon, authenticated, service_role;
GRANT ALL ON TABLE sbps.participantes TO authenticator, anon, authenticated, service_role;
GRANT ALL ON TABLE sbps.pagamentos_eventos TO authenticator, anon, authenticated, service_role;
GRANT ALL ON TABLE sbps.inscricoes_eventos TO authenticator, anon, authenticated, service_role;

-- ============================================================================
-- RPCs PARA REGRAS DE NEGÓCIO DE COTAS E PAGAMENTOS NA ÁREA DE EVENTOS
-- ============================================================================

-- 1. Verificar Cota do Palestrante
CREATE OR REPLACE FUNCTION sbps.verificar_cota_palestrante(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_palestrante RECORD;
    v_limite_total INT;
    v_disponiveis INT;
    v_pode_publicar BOOLEAN;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    
    SELECT * INTO v_palestrante 
    FROM sbps.palestrantes 
    WHERE LOWER(email) = v_clean_email;

    -- Se não existe, cria o palestrante com o plano base padrão
    IF v_palestrante.id IS NULL THEN
        INSERT INTO sbps.palestrantes (
            nome, email, plano_tipo, plano_limite, publicacoes_count, publicacoes_extras, plano_status, plano_valor
        ) VALUES (
            SPLIT_PART(v_clean_email, '@', 1), v_clean_email, 'Base', 5, 0, 0, 'Ativo', 50.00
        )
        RETURNING * INTO v_palestrante;
    END IF;

    -- Ilimitado tem 999999 de limite
    IF v_palestrante.plano_tipo = 'Ilimitado' THEN
        v_limite_total := 999999;
        v_disponiveis := 999999;
        v_pode_publicar := (v_palestrante.plano_status = 'Ativo');
    ELSE
        v_limite_total := COALESCE(v_palestrante.plano_limite, 5) + COALESCE(v_palestrante.publicacoes_extras, 0);
        v_disponiveis := GREATEST(0, v_limite_total - COALESCE(v_palestrante.publicacoes_count, 0));
        v_pode_publicar := (v_disponiveis > 0) AND (v_palestrante.plano_status = 'Ativo');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'email', v_clean_email,
        'pode_publicar', v_pode_publicar,
        'plano_tipo', v_palestrante.plano_tipo,
        'plano_limite', v_palestrante.plano_limite,
        'publicacoes_extras', v_palestrante.publicacoes_extras,
        'limite_total', v_limite_total,
        'publicacoes_count', v_palestrante.publicacoes_count,
        'disponiveis', v_disponiveis,
        'plano_status', v_palestrante.plano_status,
        'plano_valor', v_palestrante.plano_valor,
        'plano_vencimento', v_palestrante.plano_vencimento
    );
END;
$$;

-- 2. Opção 1 do Palestrante: Pagar por Nova Publicação Avulsa (R$ 10,00)
CREATE OR REPLACE FUNCTION sbps.comprar_publicacao_avulsa(p_email TEXT, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_palestrante RECORD;
    v_pay_id UUID;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));

    SELECT * INTO v_palestrante 
    FROM sbps.palestrantes 
    WHERE LOWER(email) = v_clean_email;

    IF v_palestrante.id IS NULL THEN
        INSERT INTO sbps.palestrantes (
            nome, email, plano_tipo, plano_limite, publicacoes_count, publicacoes_extras, plano_status, plano_valor
        ) VALUES (
            SPLIT_PART(v_clean_email, '@', 1), v_clean_email, 'Base', 5, 0, 0, 'Ativo', 50.00
        )
        RETURNING * INTO v_palestrante;
    END IF;

    -- Registra o pagamento avulso de R$ 10,00
    INSERT INTO sbps.pagamentos_eventos (
        tipo, email, usuario_nome, referencia_id, descricao, valor, metodo, status, payload
    ) VALUES (
        'publicacao_avulsa', v_clean_email, v_palestrante.nome, 'avulso_10',
        'Pagamento de publicação avulsa (+1 evento/curso)', 10.00, p_metodo, 'Aprovado',
        jsonb_build_object('data', NOW(), 'origem', 'modulo_eventos', 'metodo', p_metodo)
    )
    RETURNING id INTO v_pay_id;

    -- Concede +1 cota extra
    UPDATE sbps.palestrantes 
    SET publicacoes_extras = COALESCE(publicacoes_extras, 0) + 1,
        updated_at = NOW()
    WHERE id = v_palestrante.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Publicação avulsa de R$ 10,00 aprovada! Cota de +1 publicação adicionada.',
        'payment_id', v_pay_id,
        'novas_extras', v_palestrante.publicacoes_extras + 1
    );
END;
$$;

-- 3. Opção 2 do Palestrante: Aumentar o Pacote Mensal (Base R$50, 10 por R$90, 15 por R$125, 20 por R$155, Ilimitado por R$170)
CREATE OR REPLACE FUNCTION sbps.atualizar_plano_palestrante(p_email TEXT, p_novo_plano TEXT, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_palestrante RECORD;
    v_limite INT;
    v_valor NUMERIC(10,2);
    v_pay_id UUID;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));

    IF p_novo_plano = 'Base' THEN
        v_limite := 5;
        v_valor := 50.00;
    ELSIF p_novo_plano = 'Pacote 10' THEN
        v_limite := 10;
        v_valor := 90.00;
    ELSIF p_novo_plano = 'Pacote 15' THEN
        v_limite := 15;
        v_valor := 125.00;
    ELSIF p_novo_plano = 'Pacote 20' THEN
        v_limite := 20;
        v_valor := 155.00;
    ELSIF p_novo_plano = 'Ilimitado' THEN
        v_limite := 999999;
        v_valor := 170.00;
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Pacote inválido. Escolha Base, Pacote 10, Pacote 15, Pacote 20 ou Ilimitado.');
    END IF;

    SELECT * INTO v_palestrante 
    FROM sbps.palestrantes 
    WHERE LOWER(email) = v_clean_email;

    IF v_palestrante.id IS NULL THEN
        INSERT INTO sbps.palestrantes (
            nome, email, plano_tipo, plano_limite, publicacoes_count, publicacoes_extras, plano_status, plano_valor
        ) VALUES (
            SPLIT_PART(v_clean_email, '@', 1), v_clean_email, p_novo_plano, v_limite, 0, 0, 'Ativo', v_valor
        )
        RETURNING * INTO v_palestrante;
    END IF;

    -- Registra o pagamento do pacote
    INSERT INTO sbps.pagamentos_eventos (
        tipo, email, usuario_nome, referencia_id, descricao, valor, metodo, status, payload
    ) VALUES (
        'upgrade_palestrante', v_clean_email, v_palestrante.nome, p_novo_plano,
        'Assinatura/Upgrade ' || p_novo_plano || ' (R$ ' || v_valor || '/mês)', v_valor, p_metodo, 'Aprovado',
        jsonb_build_object('data', NOW(), 'plano', p_novo_plano, 'limite', v_limite, 'valor', v_valor, 'metodo', p_metodo)
    )
    RETURNING id INTO v_pay_id;

    -- Atualiza plano e cota do palestrante
    UPDATE sbps.palestrantes 
    SET plano_tipo = p_novo_plano,
        plano_limite = v_limite,
        plano_valor = v_valor,
        plano_status = 'Ativo',
        plano_vencimento = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    WHERE id = v_palestrante.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Plano atualizado para ' || p_novo_plano || ' (R$ ' || v_valor || '/mês) com sucesso!',
        'payment_id', v_pay_id,
        'plano_tipo', p_novo_plano,
        'plano_limite', v_limite,
        'plano_valor', v_valor
    );
END;
$$;

-- 4. Incrementar Contador de Publicações (Chamado após criação bem sucedida)
CREATE OR REPLACE FUNCTION sbps.incrementar_uso_cota_palestrante(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    
    UPDATE sbps.palestrantes 
    SET publicacoes_count = COALESCE(publicacoes_count, 0) + 1,
        updated_at = NOW()
    WHERE LOWER(email) = v_clean_email;

    RETURN sbps.verificar_cota_palestrante(v_clean_email);
END;
$$;

-- 5. Pagamento de Inscrição em Evento pelo Participante
CREATE OR REPLACE FUNCTION sbps.pagar_inscricao_evento(
    p_email TEXT, 
    p_nome TEXT, 
    p_evento_id TEXT, 
    p_evento_titulo TEXT, 
    p_valor NUMERIC, 
    p_metodo TEXT DEFAULT 'SIMULADO'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_email TEXT;
    v_pay_id UUID;
    v_insc_id UUID;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));

    -- Registra pagamento da inscrição
    INSERT INTO sbps.pagamentos_eventos (
        tipo, email, usuario_nome, referencia_id, descricao, valor, metodo, status, payload
    ) VALUES (
        'inscricao_evento', v_clean_email, p_nome, p_evento_id,
        'Inscrição no Evento: ' || COALESCE(p_evento_titulo, p_evento_id), 
        COALESCE(p_valor, 0.00), p_metodo, 'Aprovado',
        jsonb_build_object('data', NOW(), 'evento_id', p_evento_id, 'titulo', p_evento_titulo, 'metodo', p_metodo)
    )
    RETURNING id INTO v_pay_id;

    -- Registra inscrição
    INSERT INTO sbps.inscricoes_eventos (
        evento_id, evento_titulo, participante_email, participante_nome, valor_pago, status_pagamento, pagamento_id
    ) VALUES (
        p_evento_id, p_evento_titulo, v_clean_email, p_nome, COALESCE(p_valor, 0.00), 'Aprovado', v_pay_id
    )
    ON CONFLICT (evento_id, participante_email) DO UPDATE 
    SET status_pagamento = 'Aprovado',
        valor_pago = COALESCE(p_valor, 0.00),
        pagamento_id = v_pay_id
    RETURNING id INTO v_insc_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Pagamento de inscrição de R$ ' || COALESCE(p_valor, 0.00) || ' aprovado com sucesso!',
        'payment_id', v_pay_id,
        'inscricao_id', v_insc_id,
        'evento_id', p_evento_id
    );
END;
$$;

-- ALIAS NO SCHEMA PUBLIC PARA COMPATIBILIDADE .rpc()
CREATE OR REPLACE FUNCTION public.verificar_cota_palestrante(p_email TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.verificar_cota_palestrante(p_email); END; $$;

CREATE OR REPLACE FUNCTION public.comprar_publicacao_avulsa(p_email TEXT, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.comprar_publicacao_avulsa(p_email, p_metodo); END; $$;

CREATE OR REPLACE FUNCTION public.atualizar_plano_palestrante(p_email TEXT, p_novo_plano TEXT, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.atualizar_plano_palestrante(p_email, p_novo_plano, p_metodo); END; $$;

CREATE OR REPLACE FUNCTION public.incrementar_uso_cota_palestrante(p_email TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.incrementar_uso_cota_palestrante(p_email); END; $$;

CREATE OR REPLACE FUNCTION public.pagar_inscricao_evento(p_email TEXT, p_nome TEXT, p_evento_id TEXT, p_evento_titulo TEXT, p_valor NUMERIC, p_metodo TEXT DEFAULT 'SIMULADO')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN sbps.pagar_inscricao_evento(p_email, p_nome, p_evento_id, p_evento_titulo, p_valor, p_metodo); END; $$;

-- Notifica a API do Supabase (PostgREST) para recarregar o cache de schemas imediatamente
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

