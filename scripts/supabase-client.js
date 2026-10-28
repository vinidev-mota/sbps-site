/* ==========================================================================
   Supabase Client & Auth Helper - SBPS Site
   ========================================================================== */

(function () {
    const SUPABASE_URL = 'https://napjtyscipdcomiobwcn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGp0eXNjaXBkY29taW9id2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTE2NjgsImV4cCI6MjEwMTA2NzY2OH0.zWPRWJ5Qo0Iwdk2utH0R667tME0ZuTitO03YS7quEDE';

    let _supabase = null;

    function getSupabaseClient() {
        if (!_supabase && window.supabase && typeof window.supabase.createClient === 'function') {
            _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                db: { schema: 'sbps' }
            });
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
                tipo_associado: userData.tipo_associado || 'SBPS Pessoa Física',
                pessoa_tipo: userData.pessoa_tipo || 'Pessoa Física',
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
                email_verificado: userData.email_verificado ?? false,
                termo_lgpd_aceito_em: userData.termo_lgpd_aceito_em || new Date().toISOString(),
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
         * Verifica se o e-mail já está cadastrado no banco Supabase
         */
        isEmailAvailable: async function (email) {
            const client = getSupabaseClient();
            if (!client || !email) return true;

            try {
                const cleanEmail = email.trim().toLowerCase();
                const { data, error } = await client
                    .from('associados')
                    .select('id, email')
                    .eq('email', cleanEmail);

                if (error) {
                    console.warn('Consulta de e-mail único no Supabase:', error.message);
                    return true;
                }

                return !(data && data.length > 0);
            } catch (err) {
                console.error('Erro na checagem de e-mail único:', err);
                return true;
            }
        },

        /**
         * Verifica se o CPF já está cadastrado no banco Supabase
         */
        isCpfAvailable: async function (cpf) {
            const client = getSupabaseClient();
            if (!client || !cpf) return true;

            try {
                const cleanCpf = cpf.replace(/\D/g, '');
                const formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                const { data, error } = await client
                    .from('associados')
                    .select('id, cpf')
                    .or(`cpf.eq.${cleanCpf},cpf.eq.${formattedCpf}`);

                if (error) {
                    console.warn('Consulta de CPF único no Supabase:', error.message);
                    return true;
                }

                return !(data && data.length > 0);
            } catch (err) {
                console.error('Erro na checagem de CPF único:', err);
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
            if (!email && !cpf) return [];

            try {
                let query = client.from('certificados').select('*');
                const cleanEmail = (email || '').toLowerCase().trim();
                const cleanCpf = (cpf || '').replace(/\D/g, '');

                if (cleanEmail && cleanCpf) {
                    query = query.or(`email.ilike.${cleanEmail},cpf.eq.${cleanCpf}`);
                } else if (cleanEmail) {
                    query = query.ilike('email', cleanEmail);
                } else if (cleanCpf) {
                    query = query.eq('cpf', cleanCpf);
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                if (error) {
                    console.warn('Erro ao consultar certificados no Supabase (tentando fallback):', error);
                    // Fallback: se o filtro OR falhou, busca diretamente pelo e-mail
                    if (cleanEmail) {
                        const { data: fbData, error: fbErr } = await client
                            .from('certificados')
                            .select('*')
                            .ilike('email', cleanEmail)
                            .order('created_at', { ascending: false });
                        if (!fbErr && fbData) return fbData;
                    }
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
        },

        /**
         * Realiza login autenticado de participante, palestrante ou associado no Supabase
         */
        loginEventoUser: async function (email, password, role) {
            const client = getSupabaseClient();
            const targetEmail = (email || '').trim().toLowerCase();
            if (!targetEmail || !password) {
                return { success: false, error: 'Informe e-mail e senha.' };
            }

            if (!client) {
                // Modo fallback offline (apenas se Supabase não estiver carregado)
                const stored = localStorage.getItem('sbps_' + role + '_user');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (parsed.email && parsed.email.toLowerCase() === targetEmail) {
                            return { success: true, profile: parsed, offline: true };
                        }
                    } catch (e) {}
                }
                return { success: false, error: 'Serviço de autenticação temporariamente indisponível.' };
            }

            try {
                const { data: authData, error: authError } = await client.auth.signInWithPassword({
                    email: targetEmail,
                    password: password
                });

                if (authError) {
                    // Fallback para verificar no localStorage caso tenha sido cadastrado localmente
                    const localKey = 'sbps_' + role + '_user';
                    const localData = localStorage.getItem(localKey);
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        if (parsed.email && parsed.email.toLowerCase() === targetEmail) {
                            return { success: true, profile: parsed, localOnly: true };
                        }
                    }
                    return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
                }

                const table = role === 'palestrante' ? 'palestrantes' : (role === 'associado' ? 'associados' : 'participantes');
                let { data: profile } = await client.from(table).select('*').eq('email', targetEmail).maybeSingle();

                if (!profile) {
                    profile = {
                        email: targetEmail,
                        nome: authData.user?.user_metadata?.nome || targetEmail.split('@')[0],
                        role: role
                    };
                }

                return { success: true, authUser: authData.user, profile };
            } catch (err) {
                return { success: false, error: err.message || 'Erro de autenticação.' };
            }
        },

        /**
         * Gera ou recupera o identificador único e persistente do dispositivo atual (Device Fingerprint)
         */
        getDeviceToken: function () {
            let token = localStorage.getItem('sbps_device_token');
            if (!token) {
                const entropy = [
                    navigator.userAgent,
                    navigator.platform || '',
                    navigator.language || '',
                    screen.width + 'x' + screen.height,
                    new Date().getTimezoneOffset(),
                    Math.random().toString(36).substring(2),
                    Date.now().toString(36)
                ].join('|');
                let hash = 0;
                for (let i = 0; i < entropy.length; i++) {
                    hash = ((hash << 5) - hash) + entropy.charCodeAt(i);
                    hash |= 0;
                }
                token = 'dev_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
                localStorage.setItem('sbps_device_token', token);
            }
            return token;
        },

        getDeviceName: function () {
            const ua = navigator.userAgent;
            let browser = 'Navegador Web';
            if (ua.includes('Edg/')) browser = 'Edge';
            else if (ua.includes('Chrome/')) browser = 'Chrome';
            else if (ua.includes('Firefox/')) browser = 'Firefox';
            else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

            let os = 'Dispositivo';
            if (ua.includes('Windows')) os = 'Windows';
            else if (ua.includes('Android')) os = 'Android';
            else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
            else if (ua.includes('Macintosh')) os = 'macOS';
            else if (ua.includes('Linux')) os = 'Linux';

            return `${browser} no ${os}`;
        },

        /**
         * Gera código numérico OTP de 6 dígitos no Supabase
         */
        generateOtp: async function (email, finalidade = 'confirmacao_cadastro') {
            const client = getSupabaseClient();
            if (!client) {
                const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
                sessionStorage.setItem('sbps_temp_otp_' + email.trim().toLowerCase(), fallbackCode);
                return { success: true, codigo: fallbackCode, localOnly: true };
            }

            try {
                const { data, error } = await client.rpc('gerar_codigo_otp', {
                    p_email: email.trim().toLowerCase(),
                    p_finalidade: finalidade
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('Erro ao chamar gerar_codigo_otp no Supabase:', err);
                const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
                sessionStorage.setItem('sbps_temp_otp_' + email.trim().toLowerCase(), fallbackCode);
                return { success: true, codigo: fallbackCode, fallback: true };
            }
        },

        /**
         * Valida código numérico OTP de 6 dígitos no Supabase
         */
        verifyOtp: async function (email, codigo, finalidade = 'confirmacao_cadastro') {
            const client = getSupabaseClient();
            const cleanEmail = email.trim().toLowerCase();
            const cleanCode = codigo.trim();

            if (!client) {
                const stored = sessionStorage.getItem('sbps_temp_otp_' + cleanEmail);
                if (stored === cleanCode) {
                    sessionStorage.removeItem('sbps_temp_otp_' + cleanEmail);
                    return { success: true, message: 'Código validado com sucesso (local).' };
                }
                return { success: false, error: 'Código inválido ou expirado.' };
            }

            try {
                const { data, error } = await client.rpc('validar_codigo_otp', {
                    p_email: cleanEmail,
                    p_codigo: cleanCode,
                    p_finalidade: finalidade
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('Erro ao chamar validar_codigo_otp no Supabase:', err);
                const stored = sessionStorage.getItem('sbps_temp_otp_' + cleanEmail);
                if (stored === cleanCode) {
                    sessionStorage.removeItem('sbps_temp_otp_' + cleanEmail);
                    return { success: true, message: 'Código validado com sucesso.' };
                }
                return { success: false, error: err.message || 'Erro ao validar código.' };
            }
        },

        /**
         * Verifica se o dispositivo atual é confiável para o usuário (regra dos 7 dias e 2FA sempre)
         */
        checkTrustedDevice: async function (email) {
            const client = getSupabaseClient();
            const cleanEmail = email.trim().toLowerCase();
            const deviceToken = this.getDeviceToken();

            if (!client) {
                const localExp = localStorage.getItem('sbps_trusted_' + cleanEmail);
                if (localExp && Number(localExp) > Date.now()) {
                    return { confiavel: true };
                }
                return { confiavel: false, motivo: 'novo_ou_expirado' };
            }

            try {
                const { data, error } = await client.rpc('verificar_dispositivo_confiavel', {
                    p_email: cleanEmail,
                    p_device_token: deviceToken
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('Erro ao verificar dispositivo confiável:', err);
                const localExp = localStorage.getItem('sbps_trusted_' + cleanEmail);
                if (localExp && Number(localExp) > Date.now()) {
                    return { confiavel: true };
                }
                return { confiavel: false, motivo: 'novo_ou_expirado' };
            }
        },

        /**
         * Registra ou renova o dispositivo atual como confiável por 7 dias
         */
        registerTrustedDevice: async function (email) {
            const client = getSupabaseClient();
            const cleanEmail = email.trim().toLowerCase();
            const deviceToken = this.getDeviceToken();
            const deviceName = this.getDeviceName();

            const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem('sbps_trusted_' + cleanEmail, expires.toString());

            if (!client) return { success: true, valid_until: new Date(expires).toISOString() };

            try {
                const { data, error } = await client.rpc('registrar_ou_renovar_dispositivo', {
                    p_email: cleanEmail,
                    p_device_token: deviceToken,
                    p_device_name: deviceName,
                    p_ip: ''
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('Erro ao registrar dispositivo confiável no Supabase:', err);
                return { success: true, valid_until: new Date(expires).toISOString() };
            }
        },

        /**
         * Simula a aprovação do pagamento da taxa de R$ 100 em ambiente de teste
         */
        simulatePaymentApproval: async function (email, metodo = 'SIMULADO') {
            const client = getSupabaseClient();
            const cleanEmail = email.trim().toLowerCase();

            if (!client) {
                return { success: true, message: 'Pagamento simulado aprovado com sucesso (local).' };
            }

            try {
                const { data, error } = await client.rpc('simular_aprovacao_pagamento', {
                    p_email: cleanEmail,
                    p_metodo: metodo
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('Erro ao simular pagamento no Supabase:', err);
                return { success: true, message: 'Pagamento aprovado em modo de teste.' };
            }
        }
    };
})();
