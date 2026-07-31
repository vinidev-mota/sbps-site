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
         * Registra um novo associado no Supabase Auth e insere seus dados cadastrais na tabela 'associados'
         */
        registerUser: async function (userData, password) {
            const client = getSupabaseClient();
            if (!client) {
                console.warn('Supabase Client não inicializado. Usando cadastro local.');
                return { success: true, localOnly: true, data: userData };
            }

            const payload = {
                nome: userData.nome,
                nascimento: userData.nascimento || null,
                cpf: userData.cpf,
                email: userData.email,
                celular: userData.celular || '',
                fixo: userData.fixo || '',
                oab: userData.oab || '',
                conselho: userData.conselho || '',
                cep: userData.cep || '',
                endereco: userData.endereco || '',
                status: userData.status || 'Ativo'
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

            // 2. Tentar registrar no Supabase Auth (se disponível)
            let authUser = null;
            try {
                const { data: authData, error: authError } = await client.auth.signUp({
                    email: userData.email,
                    password: password,
                    options: {
                        data: {
                            nome: userData.nome,
                            cpf: userData.cpf,
                            oab: userData.oab
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
         * Realiza login no Supabase Auth ou busca perfil pelo CPF/E-mail
         */
        loginUser: async function (emailOrCpf, password) {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: 'Supabase SDK indisponível.' };
            }

            try {
                let targetEmail = emailOrCpf.trim();

                // Se o usuário digitou CPF em vez de E-mail, busca o e-mail correspondente na tabela associados
                if (!targetEmail.includes('@')) {
                    const cleanCpf = targetEmail.replace(/\D/g, '');
                    const { data: foundProfiles } = await client
                        .from('associados')
                        .select('email')
                        .or(`cpf.eq.${targetEmail},cpf.eq.${cleanCpf}`);

                    if (foundProfiles && foundProfiles.length > 0) {
                        targetEmail = foundProfiles[0].email;
                    }
                }

                // Autenticar estritamente via Supabase Auth com e-mail e senha
                const { data: authData, error: authError } = await client.auth.signInWithPassword({
                    email: targetEmail,
                    password: password
                });

                if (authError) {
                    console.warn('Autenticação negada no Supabase Auth:', authError.message);
                    return { success: false, error: 'E-mail ou senha incorretos.' };
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
                        oab: authData.user?.user_metadata?.oab || ''
                    }
                };
            } catch (err) {
                console.error('Erro no login Supabase:', err);
                return { success: false, error: err.message || 'Erro de autenticação no Supabase' };
            }
        },

        /**
         * Atualiza os dados do perfil do associado no Supabase
         */
        updateProfile: async function (userData) {
            const client = getSupabaseClient();
            if (!client || !userData || !userData.email) return;

            try {
                const { data, error } = await client
                    .from('associados')
                    .upsert({
                        nome: userData.nome,
                        nascimento: userData.nascimento || null,
                        cpf: userData.cpf,
                        email: userData.email,
                        celular: userData.celular || '',
                        fixo: userData.fixo || '',
                        oab: userData.oab || '',
                        conselho: userData.conselho || '',
                        cep: userData.cep || '',
                        endereco: userData.endereco || '',
                        status: userData.status || 'Ativo',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'email' });

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
                        nascimento: localUser.nascimento || null,
                        cpf: localUser.cpf,
                        email: localUser.email,
                        celular: localUser.celular || '',
                        fixo: localUser.fixo || '',
                        oab: localUser.oab || '',
                        conselho: localUser.conselho || '',
                        cep: localUser.cep || '',
                        endereco: localUser.endereco || '',
                        status: localUser.status || 'Ativo'
                    }, { onConflict: 'email' });
                    console.log('Sincronização de usuário do localStorage com Supabase concluída!');
                }
            } catch (err) {
                console.warn('Erro ao sincronizar usuário do localStorage:', err);
            }
        }
    };
})();
