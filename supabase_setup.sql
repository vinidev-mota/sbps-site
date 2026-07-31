-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE PARA SBPS (ASSOCIADOS E CERTIFICADOS)
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- URL do projeto: https://napjtyscipdcomiobwcn.supabase.co
-- ============================================================================

-- 1. TABELA DE ASSOCIADOS
CREATE TABLE IF NOT EXISTS public.associados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    nascimento DATE,
    cpf TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    celular TEXT,
    fixo TEXT,
    oab TEXT,
    conselho TEXT,
    cep TEXT,
    endereco TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_associados_cpf ON public.associados(cpf);
CREATE INDEX IF NOT EXISTS idx_associados_email ON public.associados(email);
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
