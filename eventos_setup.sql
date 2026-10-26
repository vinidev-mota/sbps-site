-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE PARA A ÁREA DE EVENTOS E COMUNIDADE SBPS
-- SCHEMA: sbps
-- Execute este script no SQL Editor do Dashboard do Supabase
-- URL do projeto: https://napjtyscipdcomiobwcn.supabase.co
-- ============================================================================

-- Garante que o schema sbps existe e possui permissões concedidas
CREATE SCHEMA IF NOT EXISTS sbps;

GRANT USAGE ON SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sbps TO authenticator, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON TABLES TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON ROUTINES TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sbps GRANT ALL ON SEQUENCES TO authenticator, anon, authenticated, service_role;

-- 1. TABELA DE PARTICIPANTES (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.participantes (
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

CREATE INDEX IF NOT EXISTS idx_participantes_email ON sbps.participantes(email);
CREATE INDEX IF NOT EXISTS idx_participantes_cpf ON sbps.participantes(cpf);

-- 2. TABELA DE PALESTRANTES (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.palestrantes (
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

CREATE INDEX IF NOT EXISTS idx_palestrantes_email ON sbps.palestrantes(email);
CREATE INDEX IF NOT EXISTS idx_palestrantes_cpf ON sbps.palestrantes(cpf);

-- 3. TABELA DE EVENTOS (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.eventos (
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

CREATE INDEX IF NOT EXISTS idx_eventos_status ON sbps.eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_palestrante ON sbps.eventos(palestrante_email);

-- 4. TABELA DE INSCRIÇÕES NOS EVENTOS (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.inscricoes_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID REFERENCES sbps.eventos(id) ON DELETE CASCADE,
    participante_email TEXT NOT NULL,
    status TEXT DEFAULT 'Inscrito', -- 'Inscrito', 'Cancelado', 'Participou'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON sbps.inscricoes_eventos(participante_email);

-- 5. TABELA DE SUGESTÕES DA COMUNIDADE (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.sugestoes (
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

-- 6. TABELA DE VOTOS EM SUGESTÕES (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.votos_sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sugestao_id UUID REFERENCES sbps.sugestoes(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    tipo_voto TEXT CHECK (tipo_voto IN ('favor', 'contra')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sugestao_id, email)
);

-- 7. TABELA DE PERFIS DE MEMBROS DA COMUNIDADE E PONTUAÇÃO (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.comunidade_membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    role TEXT DEFAULT 'participante', -- 'participante', 'palestrante', 'associado'
    bio TEXT,
    interesses TEXT,
    linkedin TEXT,
    instagram TEXT,
    exibir_localizacao BOOLEAN DEFAULT true,
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    cidade TEXT,
    uf TEXT,
    reputacao_pontos INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE TÓPICOS DO FÓRUM DA COMUNIDADE (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.comunidade_topicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor TEXT NOT NULL,
    email TEXT NOT NULL,
    categoria TEXT NOT NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    likes INT DEFAULT 0,
    status TEXT DEFAULT 'Ativo', -- 'Ativo', 'Moderado', 'Fechado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE MENSAGENS E CHATS DA COMUNIDADE (SCHEMA sbps)
CREATE TABLE IF NOT EXISTS sbps.comunidade_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('group', 'private')),
    target_id TEXT NOT NULL,
    remetente TEXT NOT NULL,
    remetente_email TEXT,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY NO SCHEMA sbps)
ALTER TABLE sbps.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.palestrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.inscricoes_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.votos_sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.comunidade_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.comunidade_topicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbps.comunidade_mensagens ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores para permitir reexecução segura (idempotência)
DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON sbps.eventos;
DROP POLICY IF EXISTS "Leitura pública de eventos" ON sbps.eventos;
DROP POLICY IF EXISTS "Gestão de eventos por palestrante ou service_role" ON sbps.eventos;

DROP POLICY IF EXISTS "Permitir inserção livre para cadastro de participantes" ON sbps.participantes;
DROP POLICY IF EXISTS "Auto-cadastro de participantes" ON sbps.participantes;
DROP POLICY IF EXISTS "Leitura do próprio perfil de participante" ON sbps.participantes;
DROP POLICY IF EXISTS "Atualização do próprio participante" ON sbps.participantes;

DROP POLICY IF EXISTS "Permitir inserção livre para cadastro de palestrantes" ON sbps.palestrantes;
DROP POLICY IF EXISTS "Auto-cadastro de palestrantes" ON sbps.palestrantes;
DROP POLICY IF EXISTS "Leitura do próprio perfil de palestrante" ON sbps.palestrantes;
DROP POLICY IF EXISTS "Atualização do próprio palestrante" ON sbps.palestrantes;

DROP POLICY IF EXISTS "Leitura de membros da comunidade" ON sbps.comunidade_membros;
DROP POLICY IF EXISTS "Atualização do próprio perfil de membro" ON sbps.comunidade_membros;

DROP POLICY IF EXISTS "Leitura de tópicos da comunidade" ON sbps.comunidade_topicos;
DROP POLICY IF EXISTS "Publicação de tópicos na comunidade" ON sbps.comunidade_topicos;
DROP POLICY IF EXISTS "Atualização de likes de tópicos" ON sbps.comunidade_topicos;

DROP POLICY IF EXISTS "Leitura de mensagens da comunidade" ON sbps.comunidade_mensagens;
DROP POLICY IF EXISTS "Envio de mensagens na comunidade" ON sbps.comunidade_mensagens;

DROP POLICY IF EXISTS "Permitir leitura e inserção de sugestões" ON sbps.sugestoes;
DROP POLICY IF EXISTS "Leitura e envio de sugestões" ON sbps.sugestoes;
DROP POLICY IF EXISTS "Leitura e envio de votos" ON sbps.votos_sugestoes;

-- Eventos: Leitura pública, escrita via palestrante ou service_role
CREATE POLICY "Leitura pública de eventos" ON sbps.eventos 
    FOR SELECT USING (true);
CREATE POLICY "Gestão de eventos por palestrante ou service_role" ON sbps.eventos 
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT user_id FROM sbps.palestrantes WHERE email = sbps.eventos.palestrante_email));

-- Participantes e Palestrantes: Inserção de auto-cadastro permitida, leitura restrita ao próprio usuário ou service_role
CREATE POLICY "Auto-cadastro de participantes" ON sbps.participantes 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura do próprio perfil de participante" ON sbps.participantes 
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role' OR auth.uid() IS NULL);
CREATE POLICY "Atualização do próprio participante" ON sbps.participantes 
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Auto-cadastro de palestrantes" ON sbps.palestrantes 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura do próprio perfil de palestrante" ON sbps.palestrantes 
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role' OR auth.uid() IS NULL);
CREATE POLICY "Atualização do próprio palestrante" ON sbps.palestrantes 
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Comunidade: Leitura aberta para membros, inserção controlada
CREATE POLICY "Leitura de membros da comunidade" ON sbps.comunidade_membros 
    FOR SELECT USING (true);
CREATE POLICY "Atualização do próprio perfil de membro" ON sbps.comunidade_membros 
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT user_id FROM sbps.associados WHERE email = sbps.comunidade_membros.email));

CREATE POLICY "Leitura de tópicos da comunidade" ON sbps.comunidade_topicos 
    FOR SELECT USING (status != 'Moderado');
CREATE POLICY "Publicação de tópicos na comunidade" ON sbps.comunidade_topicos 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de likes de tópicos" ON sbps.comunidade_topicos 
    FOR UPDATE USING (true);

CREATE POLICY "Leitura de mensagens da comunidade" ON sbps.comunidade_mensagens 
    FOR SELECT USING (true);
CREATE POLICY "Envio de mensagens na comunidade" ON sbps.comunidade_mensagens 
    FOR INSERT WITH CHECK (true);

-- Sugestões e Votos
CREATE POLICY "Leitura e envio de sugestões" ON sbps.sugestoes 
    FOR ALL USING (true);
CREATE POLICY "Leitura e envio de votos" ON sbps.votos_sugestoes 
    FOR ALL USING (true);

-- Notifica a API do Supabase (PostgREST) para recarregar o cache de schemas imediatamente
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
