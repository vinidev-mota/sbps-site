-- ============================================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DE NOTÍCIAS (PORTAL SBPS)
-- SCHEMA: sbps
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- ============================================================================

-- Garante a criação do schema sbps
CREATE SCHEMA IF NOT EXISTS sbps;

-- 1. TABELA DE NOTÍCIAS ATIVAS (sbps.news)
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

-- 2. TABELA DE NOTÍCIAS EXCLUÍDAS (sbps.deleted_news)
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

-- 3. PERMISSÕES PARA O N8N E API DO SUPABASE
GRANT USAGE ON SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON TABLES TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON SEQUENCES TO authenticator, anon, authenticated, service_role;

-- 4. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE sbps.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.deleted_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de notícias" ON sbps.news;
DROP POLICY IF EXISTS "Gestão de notícias" ON sbps.news;
DROP POLICY IF EXISTS "Gestão de notícias deletadas" ON sbps.deleted_news;

-- Leitura aberta para o portal
CREATE POLICY "Leitura pública de notícias" ON sbps.news
    FOR SELECT USING (true);

-- Permissão total para os fluxos do n8n gerenciarem notícias
CREATE POLICY "Gestão de notícias" ON sbps.news
    FOR ALL USING (true);

CREATE POLICY "Gestão de notícias deletadas" ON sbps.deleted_news
    FOR ALL USING (true);

-- Notifica a API do Supabase (PostgREST) para atualizar o cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
