-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE PARA A ÁREA DE EVENTOS SBPS
-- Execute este script no SQL Editor do Dashboard do Supabase
-- ============================================================================

-- 1. TABELA DE PARTICIPANTES
CREATE TABLE IF NOT EXISTS public.participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PALESTRANTES
CREATE TABLE IF NOT EXISTS public.palestrantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    escolaridade TEXT,
    cursos_formacao JSONB DEFAULT '[]'::jsonb,
    area_atuacao TEXT,
    profissao_atual TEXT,
    anos_experiencia INT,
    experiencias_profissionais TEXT,
    sobre_mim TEXT,
    dados_bancarios JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE EVENTOS
CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    carga_horaria TEXT,
    data_horario TIMESTAMP WITH TIME ZONE,
    palavra_chave TEXT,
    local TEXT,
    programacao TEXT,
    resumo TEXT,
    tema TEXT,
    area TEXT,
    valor NUMERIC(10,2) DEFAULT 0.00,
    taxas_inscricao TEXT,
    palestrante_email TEXT,
    status TEXT DEFAULT 'Ativo', -- 'Ativo', 'Cancelado', 'Reagendado', 'Realizado'
    gravacao_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE INSCRIÇÕES NOS EVENTOS
CREATE TABLE IF NOT EXISTS public.inscricoes_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
    participante_email TEXT NOT NULL,
    status TEXT DEFAULT 'Inscrito', -- 'Inscrito', 'Cancelado', 'Participou'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE SUGESTÕES DA COMUNIDADE
CREATE TABLE IF NOT EXISTS public.sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    contato TEXT,
    is_anonimo BOOLEAN DEFAULT false,
    categoria TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    anexo_url TEXT,
    status TEXT DEFAULT 'Em Análise', -- 'Em Análise', 'Aprovada pela SBPS', 'Em Andamento', 'Concluída'
    votos_favor INT DEFAULT 0,
    votos_contra INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE VOTOS EM SUGESTÕES
CREATE TABLE IF NOT EXISTS public.votos_sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sugestao_id UUID REFERENCES public.sugestoes(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    tipo_voto TEXT CHECK (tipo_voto IN ('favor', 'contra')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sugestao_id, email)
);

-- 7. TABELA DE PERFIS DE MEMBROS DA COMUNIDADE E PONTUAÇÃO
CREATE TABLE IF NOT EXISTS public.comunidade_membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    bio TEXT,
    interesses TEXT,
    redes_sociais TEXT,
    exibir_localizacao BOOLEAN DEFAULT false,
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    cidade TEXT,
    reputacao_pontos INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palestrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de eventos" ON public.eventos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção livre para cadastro de participantes" ON public.participantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção livre para cadastro de palestrantes" ON public.palestrantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura e inserção de sugestões" ON public.sugestoes FOR ALL USING (true);
