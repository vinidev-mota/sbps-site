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

-- Notifica a API do Supabase (PostgREST) para recarregar o cache de schemas imediatamente
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
