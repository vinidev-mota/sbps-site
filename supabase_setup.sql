-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE PARA SBPS (ASSOCIADOS E CERTIFICADOS)
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- URL do projeto: https://napjtyscipdcomiobwcn.supabase.co
-- ============================================================================

-- 1. TABELA DE ASSOCIADOS COMPLETA
CREATE TABLE IF NOT EXISTS public.associados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 1. Informações Pessoais
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    rg TEXT NOT NULL,
    nascimento DATE NOT NULL,
    genero TEXT NOT NULL,
    profissao TEXT,
    origem_sbps TEXT NOT NULL,
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
    complemento TEXT NOT NULL,
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    uf TEXT NOT NULL,
    
    -- 4. Informações de Acesso & Foto
    login_usuario TEXT NOT NULL UNIQUE,
    foto_url TEXT,
    
    -- Metadados e Status
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migração / Atualização de colunas caso a tabela já exista com estrutura anterior
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS genero TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS profissao TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS origem_sbps TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS origem_outro_desc TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS recado TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS email_secundario TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS login_usuario TEXT;
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS foto_url TEXT;

CREATE INDEX IF NOT EXISTS idx_associados_cpf ON public.associados(cpf);
CREATE INDEX IF NOT EXISTS idx_associados_email ON public.associados(email);
CREATE INDEX IF NOT EXISTS idx_associados_login ON public.associados(login_usuario);
CREATE INDEX IF NOT EXISTS idx_associados_user_id ON public.associados(user_id);

ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção de cadastros" ON public.associados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de associados" ON public.associados
    FOR SELECT USING (true);

CREATE POLICY "Permitir atualização pelo próprio associado" ON public.associados
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL)
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- 2. TABELA DE CERTIFICADOS DOS ASSOCIADOS
CREATE TABLE IF NOT EXISTS public.certificados (
    id TEXT PRIMARY KEY DEFAULT ('cert-' || gen_random_uuid()),
    email TEXT NOT NULL,
    cpf TEXT,
    type TEXT DEFAULT 'Curso', -- 'Curso', 'Seminário', 'Congresso'
    title TEXT NOT NULL,
    horas TEXT DEFAULT '20h',
    data TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificados_email ON public.certificados(email);
CREATE INDEX IF NOT EXISTS idx_certificados_cpf ON public.certificados(cpf);

ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de certificados por e-mail ou anon" ON public.certificados
    FOR SELECT USING (true);

CREATE POLICY "Permitir gestão de certificados" ON public.certificados
    FOR ALL USING (true);

-- 3. Trigger para atualização automática da coluna updated_at em associados
CREATE OR REPLACE FUNCTION update_updated_at_column()
-- FUNCTION TRIGGER
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON public.associados;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.associados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. INSERIR ALGUNS CERTIFICADOS DE EXEMPLO (OPCIONAL PARA TESTE)
INSERT INTO public.certificados (id, email, type, title, horas, data, pdf_url)
VALUES 
    ('cert-001', 'ana.silveira@adv.com.br', 'Curso', 'Planejamento Previdenciário Integrado - Método 4x4', '40h', '15/06/2026', 'https://n8n-motaadv.duckdns.org/webhook/download-certificado?id=cert-001'),
    ('cert-002', 'ana.silveira@adv.com.br', 'Seminário', 'Congresso Brasileiro de Direito Previdenciário 2026', '16h', '10/05/2026', 'https://n8n-motaadv.duckdns.org/webhook/download-certificado?id=cert-002')
ON CONFLICT (id) DO NOTHING;
