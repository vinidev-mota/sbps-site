/* ==========================================================================
   Supabase Client & Auth Helper - SBPS Site
   ========================================================================== */

(function () {
    const SUPABASE_URL = 'https://napjtyscipdcomiobwcn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGp0eXNjaXBkY29taW9id2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTE2NjgsImV4cCI6MjEwMTA2NzY2OH0.zWPRWJ5Qo0Iwdk2utH0R667tME0ZuTitO03YS7quEDE';

    let _supabase = null;

    function getSupabaseClient() {
        if (!_supabase && window.supabase && typeof window.supabase.createClient === 'function') {
            _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return _supabase;
    }

    // Export SDK helper interface globally
    window.SBPS_Supabase = {
        getUrl: () => SUPABASE_URL,
        getKey: () => SUPABASE_ANON_KEY,
        getClient: getSupabaseClient,

        /**
         * Registra um novo associado no Supabase Auth e insere seus dados cadastrais completos na tabela 'associados'
         */
        registerUser: async function (userData, password) {
            const client = getSupabaseClient();
            if (!client) {
                console.warn('Supabase Client não inicializado. Usando cadastro local.');
                return { success: true, localOnly: true, data: userData };
            }

            const payload = {
                nome: userData.nome,
                cpf: userData.cpf,
                rg: userData.rg || '',
                nascimento: userData.nascimento || null,
                genero: userData.genero || '',
                profissao: userData.profissao || '',
                origem_sbps: userData.origem_sbps || '',
                origem_outro_desc: userData.origem_outro_desc || '',
                celular: userData.celular || '',
                fixo: userData.fixo || '',
                recado: userData.recado || '',
                email: userData.email,
                email_secundario: userData.email_secundario || '',
                cep: userData.cep || '',
                logradouro: userData.logradouro || '',
                numero: userData.numero || '',
                complemento: userData.complemento || '',
                bairro: userData.bairro || '',
                cidade: userData.cidade || '',
                uf: userData.uf || '',
                login_usuario: userData.login_usuario || userData.email,
                foto_url: userData.foto_url || '',
                status: userData.status || 'Ativo',
                updated_at: new Date().toISOString()
            };

            let dbResult = null;
            let dbError = null;

            // 1. Tentar salvar diretamente na tabela public.associados
            try {
                const { data, error } = await client
                    .from('associados')
                    .upsert(payload, { onConflict: 'email' })
                    .select();

                if (error) {
                    dbError = error;
                    console.error('Erro ao salvar na tabela associados:', error);
                } else {
                    dbResult = data ? data[0] : payload;
                }
            } catch (err) {
                console.warn('Erro de rede ao acessar tabela associados:', err);
                dbError = err;
            }

            // 2. Tentar registrar no Supabase Auth
            let authUser = null;
            try {
                const { data: authData, error: authError } = await client.auth.signUp({
                    email: userData.email,
                    password: password,
                    options: {
                        data: {
                            nome: userData.nome,
                            cpf: userData.cpf,
                            rg: userData.rg,
                            login_usuario: userData.login_usuario
                        }
                    }
                });

                if (!authError && authData?.user) {
                    authUser = authData.user;
                    // Atualizar user_id no DB se disponível
                    await client.from('associados').update({ user_id: authUser.id }).eq('email', userData.email);
                }
            } catch (err) {
                console.warn('Registro Auth ignorado/falhou:', err);
            }

            // Retornar sucesso se a tabela DB gravou ou se salvou localmente
            if (dbResult) {
                return { success: true, user: authUser, profile: dbResult };
            } else if (dbError) {
                return { success: false, error: dbError.message || 'Erro de comunicação com o Supabase' };
            }

            return { success: true, profile: payload };
        },

        /**
         * Realiza login no Supabase Auth ou busca perfil pelo Login/Usuário, CPF ou E-mail
         */
        loginUser: async function (identifier, password) {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: 'Supabase SDK indisponível.' };
            }

            try {
                let targetEmail = identifier.trim();

                // Se o usuário digitou Login/Usuário ou CPF em vez de E-mail, busca o e-mail na tabela associados
                if (!targetEmail.includes('@')) {
                    const cleanCpf = targetEmail.replace(/\D/g, '');
                    const { data: foundProfiles } = await client
                        .from('associados')
                        .select('email')
                        .or(`login_usuario.eq.${targetEmail},cpf.eq.${targetEmail},cpf.eq.${cleanCpf}`);

                    if (foundProfiles && foundProfiles.length > 0) {
                        targetEmail = foundProfiles[0].email;
                    }
                }

                // Autenticar via Supabase Auth com e-mail e senha
                const { data: authData, error: authError } = await client.auth.signInWithPassword({
                    email: targetEmail,
                    password: password
                });

                if (authError) {
                    console.warn('Autenticação negada no Supabase Auth:', authError.message);
                    return { success: false, error: 'E-mail, usuário ou senha incorretos.' };
                }

                // Buscar dados completos do perfil na tabela associados
                const { data: profile } = await client
                    .from('associados')
                    .select('*')
                    .eq('email', targetEmail)
                    .maybeSingle();

                return {
                    success: true,
                    authUser: authData.user,
                    profile: profile || {
                        nome: authData.user?.user_metadata?.nome || targetEmail,
                        email: targetEmail,
                        cpf: authData.user?.user_metadata?.cpf || '',
                        login_usuario: authData.user?.user_metadata?.login_usuario || targetEmail
                    }
                };
            } catch (err) {
                console.error('Erro no login Supabase:', err);
                return { success: false, error: err.message || 'Erro de autenticação no Supabase' };
            }
        },

        /**
         * Verifica se o nome de usuário (login_usuario) já está em uso no banco Supabase
         */
        isUsernameAvailable: async function (login_usuario) {
            const client = getSupabaseClient();
            if (!client || !login_usuario) return true;

            try {
                const cleanUser = login_usuario.trim().toLowerCase();
                const { data, error } = await client
                    .from('associados')
                    .select('id, login_usuario')
                    .ilike('login_usuario', cleanUser);

                if (error) {
                    console.warn('Consulta de usuário único no Supabase:', error.message);
                    return true;
                }

                return !(data && data.length > 0);
            } catch (err) {
                console.error('Erro na checagem de usuário único:', err);
                return true;
            }
        },

        /**
         * Atualiza os dados do perfil do associado no Supabase
         */
        updateProfile: async function (userData) {
            const client = getSupabaseClient();
            if (!client || !userData || !userData.email) return;

            try {
                const payload = {
                    nome: userData.nome,
                    cpf: userData.cpf,
                    rg: userData.rg || '',
                    nascimento: userData.nascimento || null,
                    genero: userData.genero || '',
                    profissao: userData.profissao || '',
                    origem_sbps: userData.origem_sbps || '',
                    origem_outro_desc: userData.origem_outro_desc || '',
                    celular: userData.celular || '',
                    fixo: userData.fixo || '',
                    recado: userData.recado || '',
                    email: userData.email,
                    email_secundario: userData.email_secundario || '',
                    cep: userData.cep || '',
                    logradouro: userData.logradouro || '',
                    numero: userData.numero || '',
                    complemento: userData.complemento || '',
                    bairro: userData.bairro || '',
                    cidade: userData.cidade || '',
                    uf: userData.uf || '',
                    login_usuario: userData.login_usuario || userData.email,
                    foto_url: userData.foto_url || '',
                    status: userData.status || 'Ativo',
                    updated_at: new Date().toISOString()
                };

                const { data, error } = await client
                    .from('associados')
                    .upsert(payload, { onConflict: 'email' });

                if (error) console.error('Erro ao atualizar perfil no Supabase:', error);
                return { success: !error, data };
            } catch (e) {
                console.error('Erro na atualização:', e);
            }
        },

        /**
         * Busca os certificados vinculados ao e-mail ou CPF do associado no Supabase
         */
        getCertificates: async function (email, cpf) {
            const client = getSupabaseClient();
            if (!client) return null;

            try {
                const { data, error } = await client
                    .from('certificados')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('Erro ao consultar certificados no Supabase:', error);
                    return null;
                }
                return data || [];
            } catch (err) {
                console.error('Exceção ao buscar certificados no Supabase:', err);
                return null;
            }
        },

        /**
         * Sincroniza usuário ativo no localStorage para a tabela do Supabase se ainda não sincronizado
         */
        syncLocalUser: async function () {
            const client = getSupabaseClient();
            if (!client) return;

            try {
                const raw = localStorage.getItem('sbps_associado_user');
                if (!raw) return;

                const localUser = JSON.parse(raw);
                if (localUser && localUser.email && localUser.cpf) {
                    await client.from('associados').upsert({
                        nome: localUser.nome,
                        cpf: localUser.cpf,
                        rg: localUser.rg || '',
                        nascimento: localUser.nascimento || null,
                        genero: localUser.genero || '',
                        profissao: localUser.profissao || '',
                        origem_sbps: localUser.origem_sbps || '',
                        origem_outro_desc: localUser.origem_outro_desc || '',
                        celular: localUser.celular || '',
                        fixo: localUser.fixo || '',
                        recado: localUser.recado || '',
                        email: localUser.email,
                        email_secundario: localUser.email_secundario || '',
                        cep: localUser.cep || '',
                        logradouro: localUser.logradouro || '',
                        numero: localUser.numero || '',
                        complemento: localUser.complemento || '',
                        bairro: localUser.bairro || '',
                        cidade: localUser.cidade || '',
                        uf: localUser.uf || '',
                        login_usuario: localUser.login_usuario || localUser.email,
                        foto_url: localUser.foto_url || '',
                        status: localUser.status || 'Ativo',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'email' });
                    console.log('Sincronização de usuário do localStorage com Supabase concluída!');
                }
            } catch (err) {
                console.warn('Erro ao sincronizar usuário do localStorage:', err);
            }
        },

        /**
         * Verifica se um e-mail já existe na tabela de associados
         */
        checkAssociadoByEmail: async function (email) {
            const client = getSupabaseClient();
            if (!client || !email) return null;
            try {
                const { data } = await client.from('associados').select('*').eq('email', email.trim()).maybeSingle();
                return data || null;
            } catch (e) {
                console.warn('Erro ao verificar e-mail em associados:', e);
                return null;
            }
        },

        /**
         * Registra um participante ou atualiza dados no Supabase e LocalStorage
         */
        registerParticipante: async function (userData, password) {
            const client = getSupabaseClient();
            const payload = { ...userData, updated_at: new Date().toISOString() };
            if (client) {
                try {
                    await client.from('participantes').upsert(payload, { onConflict: 'email' });
                    if (password) {
                        await client.auth.signUp({
                            email: userData.email,
                            password: password,
                            options: { data: { nome: userData.nome, role: 'participante' } }
                        }).catch(() => {});
                    }
                } catch (e) {
                    console.warn('Erro ao salvar participante no Supabase:', e);
                }
            }
            return { success: true, profile: payload };
        },

        /**
         * Registra um palestrante com seus dados acadêmicos e bancários no Supabase e LocalStorage
         */
        registerPalestrante: async function (userData, password) {
            const client = getSupabaseClient();
            const payload = { ...userData, updated_at: new Date().toISOString() };
            if (client) {
                try {
                    await client.from('palestrantes').upsert(payload, { onConflict: 'email' });
                    if (password) {
                        await client.auth.signUp({
                            email: userData.email,
                            password: password,
                            options: { data: { nome: userData.nome, role: 'palestrante' } }
                        }).catch(() => {});
                    }
                } catch (e) {
                    console.warn('Erro ao salvar palestrante no Supabase:', e);
                }
            }
            return { success: true, profile: payload };
        }
    };
})();
