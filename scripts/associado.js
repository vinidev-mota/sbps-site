/* ==========================================================================
   Área do Associado - SBPS JavaScript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // State Management (LocalStorage)
    // --------------------------------------------------------------------------
    const STORAGE_KEY_USER = 'sbps_associado_user';
    const STORAGE_KEY_SHORTCUTS = 'sbps_associado_shortcuts';
    const STORAGE_KEY_COURSES = 'sbps_associado_courses';
    const STORAGE_KEY_SEMINARS = 'sbps_associado_seminars';
    const STORAGE_KEY_TICKETS = 'sbps_associado_tickets';
    const STORAGE_KEY_AUTHOR_BOOKS = 'sbps_associado_books';

    let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY_USER)) || null;

    // Se houver um usuário salvo da demonstração legada (ex: Ana Silveira), limpa para forçar login real no Supabase
    if (currentUser && (currentUser.email === 'ana.silveira@adv.com.br' || !currentUser.email)) {
        localStorage.removeItem(STORAGE_KEY_USER);
        currentUser = null;
    }

    let memberShortcuts = JSON.parse(localStorage.getItem(STORAGE_KEY_SHORTCUTS)) || [
        { id: 1, title: 'Calculadora de Benefícios INSS', url: '#templates', icon: 'fa-solid fa-calculator' },
        { id: 2, title: 'Estatuto Social SBPS', url: 'estatuto.html', icon: 'fa-solid fa-file-contract' },
        { id: 3, title: 'Vitrine de Autores', url: '#livraria', icon: 'fa-solid fa-book-open' }
    ];
    let enrolledCourses = JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES)) || [];
    let enrolledSeminars = JSON.parse(localStorage.getItem(STORAGE_KEY_SEMINARS)) || [];
    let activeTickets = JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS)) || [];
    let authorBooks = JSON.parse(localStorage.getItem(STORAGE_KEY_AUTHOR_BOOKS)) || [
        { title: 'Reforma Previdenciária Prática', autor: 'Dr. Carlos Eduardo', preco: 'R$ 65,00', desc: 'Guia definitivo de transição e cálculos.' },
        { title: 'Aposentadoria Biopsicossocial', autor: 'Dra. Mariana Costa', preco: 'R$ 80,00', desc: 'Avaliação em PCD e laudos periciais.' }
    ];

    // Initialize User Interface
    initAuth();
    initViaCEP();
    initNavigation();
    renderUserData();
    renderShortcuts();
    renderCourses();
    renderSeminars();
    renderCertificates();
    renderTemplates();
    renderLivraria();
    renderAjudaSupport();

    // --------------------------------------------------------------------------
    // 1. Autenticação, Validações Estritas & Cadastro Pessoa Física (Supabase)
    // --------------------------------------------------------------------------
    function initAuth() {
        const authContainer = document.getElementById('auth-container');
        const memberContent = document.getElementById('member-content');
        const loginTabBtn = document.getElementById('tab-login-btn');
        const registerTabBtn = document.getElementById('tab-register-btn');
        const loginForm = document.getElementById('form-login');
        const registerForm = document.getElementById('form-register');

        if (currentUser && currentUser.email) {
            authContainer.style.display = 'none';
            memberContent.style.display = 'block';
            updateUserBadges();
        } else {
            authContainer.style.display = 'block';
            memberContent.style.display = 'none';
        }

        // Tab Switching in Auth (Expande o formulário para a tela toda do desktop no cadastro)
        const authWrapper = authContainer.querySelector('.auth-wrapper');
        if (loginTabBtn && registerTabBtn) {
            loginTabBtn.addEventListener('click', () => {
                loginTabBtn.classList.add('active');
                registerTabBtn.classList.remove('active');
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                if (authWrapper) authWrapper.classList.remove('register-expanded');
            });

            registerTabBtn.addEventListener('click', () => {
                registerTabBtn.classList.add('active');
                loginTabBtn.classList.remove('active');
                registerForm.style.display = 'block';
                loginForm.style.display = 'none';
                if (authWrapper) authWrapper.classList.add('register-expanded');
            });
        }

        // ----------------------------------------------------------------------
        // Listeners e Validações Dinâmicas do Formulário de Cadastro
        // ----------------------------------------------------------------------
        setupRegistrationFormInteractions();

        // Submit Login (Supabase Auth com suporte a E-mail, Login ou CPF)
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userInput = document.getElementById('login-user')?.value.trim() || '';
                const passInput = document.getElementById('login-password')?.value || '';

                if (!userInput || !passInput) {
                    alert('Por favor, informe seu e-mail, login ou CPF e a senha.');
                    return;
                }

                const btn = loginForm.querySelector('button[type="submit"]');
                if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando no Supabase...';

                let loginSuccess = false;
                if (window.SBPS_Supabase) {
                    const res = await window.SBPS_Supabase.loginUser(userInput, passInput);
                    if (res && res.success && res.profile) {
                        currentUser = {
                            nome: res.profile.nome || 'Associado',
                            cpf: res.profile.cpf || '',
                            rg: res.profile.rg || '',
                            nascimento: res.profile.nascimento || '',
                            genero: res.profile.genero || '',
                            profissao: res.profile.profissao || '',
                            origem_sbps: res.profile.origem_sbps || '',
                            origem_outro_desc: res.profile.origem_outro_desc || '',
                            celular: res.profile.celular || '',
                            fixo: res.profile.fixo || '',
                            recado: res.profile.recado || '',
                            email: res.profile.email || userInput,
                            email_secundario: res.profile.email_secundario || '',
                            cep: res.profile.cep || '',
                            logradouro: res.profile.logradouro || '',
                            numero: res.profile.numero || '',
                            complemento: res.profile.complemento || '',
                            bairro: res.profile.bairro || '',
                            cidade: res.profile.cidade || '',
                            uf: res.profile.uf || '',
                            login_usuario: res.profile.login_usuario || userInput,
                            foto_url: res.profile.foto_url || '',
                            status: res.profile.status || 'Ativo'
                        };
                        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                        authContainer.style.display = 'none';
                        memberContent.style.display = 'block';
                        updateUserBadges();
                        renderUserData();
                        renderCertificates();
                        showToastMessage('Login efetuado com sucesso!');
                        loginSuccess = true;
                    }
                }

                if (btn) btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Acessar Portal';

                if (!loginSuccess) {
                    alert('Usuário não encontrado ou senha incorreta no Supabase. Caso ainda não tenha conta, faça seu cadastro na aba ao lado.');
                }
            });
        }

        // Submit Cadastro Pessoa Física com Validações Estritas
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // 1. Informações Pessoais
                const nomeInput = document.getElementById('reg-nome');
                const nome = nomeInput.value.trim();
                const nomeWords = nome.split(/\s+/).filter(w => w.length > 0);
                if (nomeWords.length < 2) {
                    alert('Por favor, informe seu Nome Completo (nome e sobrenome).');
                    nomeInput.focus();
                    return;
                }

                const cpfInput = document.getElementById('reg-cpf');
                const rawCpf = cpfInput.value.replace(/\D/g, '');
                if (!isValidCPF(rawCpf)) {
                    alert('CPF inválido! Por favor, confira os números digitados.');
                    cpfInput.focus();
                    return;
                }

                const rgInput = document.getElementById('reg-rg');
                const rawRg = rgInput.value.replace(/\D/g, '');
                if (rawRg.length < 4) {
                    alert('RG inválido! O campo de RG deve conter apenas números e ao menos 4 dígitos.');
                    rgInput.focus();
                    return;
                }

                const nascInput = document.getElementById('reg-nasc');
                const birthDate = nascInput.value;
                if (!birthDate || !isAdult(birthDate)) {
                    alert('O cadastro na SBPS é permitido apenas para maiores de 18 anos. Verifique a data de nascimento.');
                    nascInput.focus();
                    return;
                }

                const generoInput = document.getElementById('reg-genero');
                if (!generoInput.value) {
                    alert('Por favor, selecione seu Gênero.');
                    generoInput.focus();
                    return;
                }

                const origemInput = document.getElementById('reg-origem');
                if (!origemInput.value) {
                    alert('Por favor, informe como você conheceu a SBPS.');
                    origemInput.focus();
                    return;
                }

                let origemOutroDesc = '';
                if (origemInput.value === 'Outro') {
                    const origemOutroInput = document.getElementById('reg-origem-outro');
                    origemOutroDesc = origemOutroInput.value.trim();
                    if (!origemOutroDesc) {
                        alert('Como você selecionou "Outro", por favor descreva como conheceu a SBPS.');
                        origemOutroInput.focus();
                        return;
                    }
                }

                // 2. Informações de Contato
                const celularInput = document.getElementById('reg-celular');
                const rawCelular = celularInput.value.replace(/\D/g, '');
                if (rawCelular.length < 10) {
                    alert('Por favor, informe um número de celular válido com DDD (10 ou 11 dígitos).');
                    celularInput.focus();
                    return;
                }

                const emailInput = document.getElementById('reg-email');
                const emailConfirmInput = document.getElementById('reg-email-confirm');
                const email = emailInput.value.trim().toLowerCase();
                const emailConfirm = emailConfirmInput.value.trim().toLowerCase();

                if (!isValidEmail(email)) {
                    alert('Por favor, informe um E-mail Principal válido.');
                    emailInput.focus();
                    return;
                }

                if (email !== emailConfirm) {
                    alert('A confirmação do e-mail não confere com o E-mail Principal!');
                    emailConfirmInput.focus();
                    return;
                }

                const emailSecundario = document.getElementById('reg-email-secundario').value.trim().toLowerCase();
                if (emailSecundario && !isValidEmail(emailSecundario)) {
                    alert('O E-mail Secundário informado possui formato inválido.');
                    document.getElementById('reg-email-secundario').focus();
                    return;
                }

                // 3. Endereço
                const cepInput = document.getElementById('reg-cep');
                const rawCep = cepInput.value.replace(/\D/g, '');
                if (rawCep.length !== 8) {
                    alert('Por favor, informe um CEP válido com 8 dígitos.');
                    cepInput.focus();
                    return;
                }

                const numeroInput = document.getElementById('reg-numero');
                if (!numeroInput.value.trim()) {
                    alert('Por favor, informe o Número do endereço.');
                    numeroInput.focus();
                    return;
                }

                const ruaInput = document.getElementById('reg-rua');
                if (!ruaInput.value.trim()) {
                    alert('Por favor, informe o Logradouro / Rua.');
                    ruaInput.focus();
                    return;
                }

                const complementoInput = document.getElementById('reg-complemento');
                const semComplementoChecked = document.getElementById('check-sem-complemento')?.checked;
                const complemento = semComplementoChecked ? 'Sem complemento' : complementoInput.value.trim();
                if (!complemento) {
                    alert('Por favor, informe o Complemento ou marque a opção "Sem complemento".');
                    complementoInput.focus();
                    return;
                }

                const bairroInput = document.getElementById('reg-bairro');
                if (!bairroInput.value.trim()) {
                    alert('Por favor, informe o Bairro.');
                    bairroInput.focus();
                    return;
                }

                const cidadeInput = document.getElementById('reg-cidade');
                const ufInput = document.getElementById('reg-uf');
                if (!cidadeInput.value.trim() || !ufInput.value.trim()) {
                    alert('Por favor, informe um CEP válido para preencher Cidade e UF automaticamente.');
                    cepInput.focus();
                    return;
                }

                // 4. Informações de Acesso e Senha Forte
                const loginUserInput = document.getElementById('reg-login-user');
                const loginUser = loginUserInput.value.trim();
                if (loginUser.length < 3) {
                    alert('O Login/Usuário deve conter no mínimo 3 caracteres.');
                    loginUserInput.focus();
                    return;
                }

                const passInput = document.getElementById('reg-password');
                const passConfirmInput = document.getElementById('reg-password-confirm');
                const pass = passInput.value;
                const passConf = passConfirmInput.value;

                const passValidation = validateStrongPassword(pass);
                if (!passValidation.isValid) {
                    alert('A senha informada não atende a todos os requisitos de segurança:\n' + passValidation.errors.join('\n'));
                    passInput.focus();
                    return;
                }

                if (pass !== passConf) {
                    alert('A confirmação de senha não coincide com a senha digitada!');
                    passConfirmInput.focus();
                    return;
                }

                // Foto de perfil
                const fotoPreviewEl = document.getElementById('photo-preview');
                const fotoUrl = fotoPreviewEl ? (fotoPreviewEl.dataset.photoUrl || '') : '';

                // Objeto do Novo Associado
                const newUser = {
                    nome: nome,
                    cpf: formatCPF(rawCpf),
                    rg: rawRg,
                    nascimento: birthDate,
                    genero: generoInput.value,
                    profissao: document.getElementById('reg-profissao').value.trim(),
                    origem_sbps: origemInput.value,
                    origem_outro_desc: origemOutroDesc,
                    celular: formatPhone(rawCelular),
                    fixo: document.getElementById('reg-fixo').value.trim(),
                    recado: document.getElementById('reg-recado').value.trim(),
                    email: email,
                    email_secundario: emailSecundario,
                    cep: formatCEP(rawCep),
                    logradouro: ruaInput.value.trim(),
                    numero: numeroInput.value.trim(),
                    complemento: complemento,
                    bairro: bairroInput.value.trim(),
                    cidade: cidadeInput.value.trim(),
                    uf: ufInput.value.trim().toUpperCase(),
                    login_usuario: loginUser,
                    foto_url: fotoUrl,
                    status: 'Ativo'
                };

                const btn = registerForm.querySelector('button[type="submit"]');
                if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cadastrando no Supabase...';

                if (window.SBPS_Supabase) {
                    const res = await window.SBPS_Supabase.registerUser(newUser, pass);
                    if (!res.success) {
                        console.warn('Aviso do Supabase:', res.error);
                    }
                }

                if (btn) btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Concluir Cadastro de Associado';

                currentUser = newUser;
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                authContainer.style.display = 'none';
                memberContent.style.display = 'block';
                updateUserBadges();
                renderUserData();
                showToastMessage('Cadastro de Associado realizado e salvo com sucesso no Supabase! Bem-vindo(a) à SBPS.');
            });
        }

        // Logout
        document.querySelectorAll('.btn-logout').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Deseja realmente sair da Área do Associado?')) {
                    localStorage.removeItem(STORAGE_KEY_USER);
                    currentUser = null;
                    authContainer.style.display = 'block';
                    memberContent.style.display = 'none';
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // 1.1 Helpers de Validação, Máscaras e Interações do Cadastro
    // --------------------------------------------------------------------------
    function setupRegistrationFormInteractions() {
        // CPF: Máscara e validação em tempo real
        const cpfInput = document.getElementById('reg-cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
                else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                e.target.value = v;
            });
        }

        // RG: Apenas números
        const rgInput = document.getElementById('reg-rg');
        if (rgInput) {
            rgInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 15);
            });
        }

        // Celular e Telefone Fixo: Máscaras
        const celularInput = document.getElementById('reg-celular');
        if (celularInput) {
            celularInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                e.target.value = v;
            });
        }

        const fixoInput = document.getElementById('reg-fixo');
        if (fixoInput) {
            fixoInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 10);
                if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                e.target.value = v;
            });
        }

        // Origem SBPS: Toggle para campo "Outro"
        const origemSelect = document.getElementById('reg-origem');
        const boxOrigemOutro = document.getElementById('box-origem-outro');
        const origemOutroInput = document.getElementById('reg-origem-outro');
        if (origemSelect && boxOrigemOutro) {
            origemSelect.addEventListener('change', () => {
                if (origemSelect.value === 'Outro') {
                    boxOrigemOutro.style.display = 'block';
                    if (origemOutroInput) origemOutroInput.required = true;
                } else {
                    boxOrigemOutro.style.display = 'none';
                    if (origemOutroInput) {
                        origemOutroInput.required = false;
                        origemOutroInput.value = '';
                    }
                }
            });
        }

        // Checkbox "Sem complemento"
        const checkSemComplemento = document.getElementById('check-sem-complemento');
        const complementoInput = document.getElementById('reg-complemento');
        if (checkSemComplemento && complementoInput) {
            checkSemComplemento.addEventListener('change', () => {
                if (checkSemComplemento.checked) {
                    complementoInput.value = 'Sem complemento';
                    complementoInput.readOnly = true;
                    complementoInput.style.backgroundColor = '#f1f5f9';
                } else {
                    complementoInput.value = '';
                    complementoInput.readOnly = false;
                    complementoInput.style.backgroundColor = '#ffffff';
                    complementoInput.focus();
                }
            });
        }

        // Checklist Dinâmico de Segurança da Senha
        const passInput = document.getElementById('reg-password');
        if (passInput) {
            passInput.addEventListener('input', () => {
                const val = passInput.value;
                updatePasswordChecklist(val);
            });
        }

        // Upload e Preview de Foto de Perfil
        const fotoInput = document.getElementById('reg-foto');
        const fotoPreview = document.getElementById('photo-preview');
        if (fotoInput && fotoPreview) {
            fotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        alert('A foto deve ter no máximo 2MB.');
                        fotoInput.value = '';
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        fotoPreview.innerHTML = `<img src="${base64}" alt="Foto de Perfil">`;
                        fotoPreview.dataset.photoUrl = base64;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Validação de CPF (Módulo 11 real)
    function isValidCPF(cpf) {
        if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let sum = 0, rest;
        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        return rest === parseInt(cpf.substring(10, 11));
    }

    // Validação de Maioridade (18+ Anos)
    function isAdult(birthDateString) {
        if (!birthDateString) return false;
        const birth = new Date(birthDateString + 'T00:00:00');
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 18;
    }

    // Validação de E-mail
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Validação e Checklist de Senha Forte
    function validateStrongPassword(pass) {
        const errors = [];
        const hasLen = pass.length >= 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasNum = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pass);

        if (!hasLen) errors.push('• Mínimo de 8 caracteres');
        if (!hasUpper) errors.push('• Pelo menos 1 letra maiúscula (A-Z)');
        if (!hasNum) errors.push('• Pelo menos 1 número (0-9)');
        if (!hasSpecial) errors.push('• Pelo menos 1 caractere especial (!@#$%...)');

        return {
            isValid: hasLen && hasUpper && hasNum && hasSpecial,
            hasLen,
            hasUpper,
            hasNum,
            hasSpecial,
            errors
        };
    }

    function updatePasswordChecklist(pass) {
        const v = validateStrongPassword(pass);
        const setItem = (id, valid) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (valid) {
                el.className = 'valid';
                el.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${el.textContent.replace(/^[^a-zA-Z0-9(]+/, '')}`;
            } else {
                el.className = 'invalid';
                el.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${el.textContent.replace(/^[^a-zA-Z0-9(]+/, '')}`;
            }
        };

        setItem('req-len', v.hasLen);
        setItem('req-upper', v.hasUpper);
        setItem('req-num', v.hasNum);
        setItem('req-special', v.hasSpecial);
    }

    // Formatadores Auxiliares
    function formatCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function formatCEP(cep) {
        return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    function formatPhone(phone) {
        if (phone.length === 11) return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // --------------------------------------------------------------------------
    // 1.2 Fluxo Inteligente de Endereço via CEP (ViaCEP API)
    // --------------------------------------------------------------------------
    function initViaCEP() {
        const cepInput = document.getElementById('reg-cep');
        if (!cepInput) return;

        // Máscara no CEP
        cepInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 8);
            if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
            e.target.value = v;

            // Se completou 8 números, dispara a consulta automática imediatamente
            const clean = v.replace(/\D/g, '');
            if (clean.length === 8) {
                fetchAddressByCEP(clean);
            }
        });

        cepInput.addEventListener('blur', () => {
            const clean = cepInput.value.replace(/\D/g, '');
            if (clean.length === 8) {
                fetchAddressByCEP(clean);
            }
        });
    }

    function fetchAddressByCEP(cep) {
        const ruaInput = document.getElementById('reg-rua');
        const bairroInput = document.getElementById('reg-bairro');
        const cidadeInput = document.getElementById('reg-cidade');
        const ufInput = document.getElementById('reg-uf');
        const numeroInput = document.getElementById('reg-numero');

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    if (ruaInput) ruaInput.value = data.logradouro || '';
                    if (bairroInput) bairroInput.value = data.bairro || '';
                    if (cidadeInput) cidadeInput.value = data.localidade || '';
                    if (ufInput) ufInput.value = data.uf || '';

                    // Mantém Cidade e UF bloqueadas para edição conforme especificado
                    if (cidadeInput) cidadeInput.readOnly = true;
                    if (ufInput) ufInput.readOnly = true;

                    if (numeroInput) numeroInput.focus();
                } else {
                    alert('CEP não encontrado na base dos Correios. Por favor, verifique o número digitado.');
                }
            })
            .catch(err => console.error('Erro ao consultar CEP:', err));
    }

    function updateUserBadges() {
        if (!currentUser) return;
        document.querySelectorAll('.user-name-display').forEach(el => el.textContent = currentUser.nome);
        document.querySelectorAll('.user-oab-display').forEach(el => {
            el.textContent = currentUser.login_usuario ? `@${currentUser.login_usuario}` : (currentUser.cpf ? `CPF: ${currentUser.cpf}` : 'Associado SBPS');
        });
        document.querySelectorAll('.user-avatar-display').forEach(el => {
            if (currentUser.foto_url && currentUser.foto_url.startsWith('data:image')) {
                el.innerHTML = `<img src="${currentUser.foto_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            } else {
                el.textContent = currentUser.nome ? currentUser.nome.charAt(0).toUpperCase() : 'A';
            }
        });
    }


    // --------------------------------------------------------------------------
    // 2. Navegação da Área do Associado (Dashboard + 9 Abas + Quick Dropdown Menu)
    // --------------------------------------------------------------------------
    function initNavigation() {
        const dashboardView = document.getElementById('dashboard-view');
        const tabPanels = document.querySelectorAll('.tab-panel');
        const backBtn = document.getElementById('btn-back-dashboard');
        const currentPageBreadcrumb = document.getElementById('breadcrumb-current');
        const quickMenuToggle = document.getElementById('btn-quick-menu-toggle');
        const quickMenuDropdown = document.getElementById('quick-menu-dropdown');

        // Toggle Quick Menu Dropdown
        if (quickMenuToggle && quickMenuDropdown) {
            quickMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                quickMenuDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!quickMenuDropdown.contains(e.target)) {
                    quickMenuDropdown.classList.remove('show');
                }
            });
        }

        // Switch to specific tab function
        window.switchTab = function(tabId, tabTitle) {
            // Hide Dashboard
            if (dashboardView) dashboardView.style.display = 'none';

            // Hide all tab panels
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Show selected panel
            const targetPanel = document.getElementById(`tab-${tabId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                if (backBtn) backBtn.style.display = 'inline-flex';
                if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = tabTitle || tabId;

                // Update active state in quick dropdown
                document.querySelectorAll('.quick-menu-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.tab === tabId);
                });

                // Se alternar para a aba de certificados, força atualização com o e-mail/CPF atual
                if (tabId === 'certificados' && typeof renderCertificates === 'function') {
                    renderCertificates();
                }
            }

            // Scroll to top of member area smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (quickMenuDropdown) quickMenuDropdown.classList.remove('show');
        };

        // Switch to Dashboard
        window.showDashboard = function() {
            tabPanels.forEach(panel => panel.classList.remove('active'));
            if (dashboardView) dashboardView.style.display = 'block';
            if (backBtn) backBtn.style.display = 'none';
            if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = 'Visão Geral';
            if (quickMenuDropdown) quickMenuDropdown.classList.remove('show');
        };

        // Click on 9 Dashboard Cards
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('click', () => {
                const tabId = card.dataset.tab;
                const tabTitle = card.querySelector('.card-title')?.textContent || '';
                switchTab(tabId, tabTitle);
            });
        });

        // Click on Quick Dropdown Menu items
        document.querySelectorAll('.quick-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.dataset.tab;
                if (tabId === 'dashboard') {
                    showDashboard();
                } else {
                    const tabTitle = item.textContent.trim();
                    switchTab(tabId, tabTitle);
                }
            });
        });

        // Click Back to Dashboard
        if (backBtn) {
            backBtn.addEventListener('click', showDashboard);
        }

        // Handle Hash in URL (e.g., #cursos)
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            if (hash === 'perfil') switchTab('perfil', 'Perfil');
            else if (hash === 'beneficios') switchTab('beneficios', 'Benefícios');
            else if (hash === 'atalhos') switchTab('atalhos', 'Atalhos');
            else if (hash === 'cursos') switchTab('cursos', 'Cursos');
            else if (hash === 'seminarios') switchTab('seminarios', 'Seminários');
            else if (hash === 'certificados') switchTab('certificados', 'Certificados');
            else if (hash === 'templates') switchTab('templates', 'Templates');
            else if (hash === 'livraria') switchTab('livraria', 'Livraria');
            else if (hash === 'outros') switchTab('outros', 'Outros');
        }
    }

    // --------------------------------------------------------------------------
    // 3. Aba Perfil (Edição Completa de Dados Cadastrais & Supabase Sync)
    // --------------------------------------------------------------------------
    function renderUserData() {
        if (!currentUser) return;

        // 1. Informações Pessoais
        const elNome = document.getElementById('edit-nome');
        const elCpf = document.getElementById('edit-cpf');
        const elRg = document.getElementById('edit-rg');
        const elNasc = document.getElementById('edit-nasc');
        const elGenero = document.getElementById('edit-genero');
        const elProfissao = document.getElementById('edit-profissao');
        const elOrigem = document.getElementById('edit-origem');

        if (elNome) elNome.value = currentUser.nome || '';
        if (elCpf) elCpf.value = currentUser.cpf || '';
        if (elRg) elRg.value = currentUser.rg || '';
        if (elNasc) elNasc.value = currentUser.nascimento || '';
        if (elGenero) elGenero.value = currentUser.genero || '';
        if (elProfissao) elProfissao.value = currentUser.profissao || '';
        if (elOrigem) elOrigem.value = currentUser.origem_outro_desc ? `${currentUser.origem_sbps || ''} (${currentUser.origem_outro_desc})` : (currentUser.origem_sbps || '');

        // 2. Informações de Contato
        const elCelular = document.getElementById('edit-celular');
        const elRecado = document.getElementById('edit-recado');
        const elFixo = document.getElementById('edit-fixo');
        const elEmail = document.getElementById('edit-email');
        const elEmailSec = document.getElementById('edit-email-secundario');

        if (elCelular) elCelular.value = currentUser.celular || '';
        if (elRecado) elRecado.value = currentUser.recado || '';
        if (elFixo) elFixo.value = currentUser.fixo || '';
        if (elEmail) elEmail.value = currentUser.email || '';
        if (elEmailSec) elEmailSec.value = currentUser.email_secundario || '';

        // 3. Endereço Residencial
        const elCep = document.getElementById('edit-cep');
        const elRua = document.getElementById('edit-rua');
        const elNumero = document.getElementById('edit-numero');
        const elBairro = document.getElementById('edit-bairro');
        const elUf = document.getElementById('edit-uf');
        const elCidade = document.getElementById('edit-cidade');
        const elComplemento = document.getElementById('edit-complemento');

        if (elCep) elCep.value = currentUser.cep || '';
        if (elRua) elRua.value = currentUser.logradouro || '';
        if (elNumero) elNumero.value = currentUser.numero || '';
        if (elBairro) elBairro.value = currentUser.bairro || '';
        if (elUf) elUf.value = currentUser.uf || '';
        if (elCidade) elCidade.value = currentUser.cidade || '';
        if (elComplemento) elComplemento.value = currentUser.complemento || '';

        // 4. Acesso & Membresia
        const elLoginUser = document.getElementById('edit-login-user');
        const elStatus = document.getElementById('edit-status');
        if (elLoginUser) elLoginUser.value = currentUser.login_usuario || currentUser.email || '';
        if (elStatus) elStatus.value = currentUser.status || 'Ativo';

        // ViaCEP na Aba Perfil
        if (elCep && !elCep.dataset.cepBound) {
            elCep.dataset.cepBound = 'true';
            elCep.addEventListener('blur', () => {
                const clean = elCep.value.replace(/\D/g, '');
                if (clean.length === 8) {
                    fetch(`https://viacep.com.br/ws/${clean}/json/`)
                        .then(res => res.json())
                        .then(data => {
                            if (!data.erro) {
                                if (elRua) elRua.value = data.logradouro || '';
                                if (elBairro) elBairro.value = data.bairro || '';
                                if (elCidade) elCidade.value = data.localidade || '';
                                if (elUf) elUf.value = data.uf || '';
                                if (elNumero) elNumero.focus();
                            }
                        })
                        .catch(err => console.error('Erro ao consultar CEP no perfil:', err));
                }
            });
        }

        // Submissão do Formulário de Edição de Perfil
        const formPerfil = document.getElementById('form-edit-perfil');
        if (formPerfil && !formPerfil.dataset.submitBound) {
            formPerfil.dataset.submitBound = 'true';
            formPerfil.addEventListener('submit', async (e) => {
                e.preventDefault();

                currentUser.nome = elNome ? elNome.value.trim() : currentUser.nome;
                currentUser.rg = elRg ? elRg.value.trim() : currentUser.rg;
                currentUser.nascimento = elNasc ? elNasc.value : currentUser.nascimento;
                currentUser.genero = elGenero ? elGenero.value : currentUser.genero;
                currentUser.profissao = elProfissao ? elProfissao.value.trim() : currentUser.profissao;
                currentUser.origem_sbps = elOrigem ? elOrigem.value.trim() : currentUser.origem_sbps;

                currentUser.celular = elCelular ? elCelular.value.trim() : currentUser.celular;
                currentUser.recado = elRecado ? elRecado.value.trim() : currentUser.recado;
                currentUser.fixo = elFixo ? elFixo.value.trim() : currentUser.fixo;
                currentUser.email = elEmail ? elEmail.value.trim().toLowerCase() : currentUser.email;
                currentUser.email_secundario = elEmailSec ? elEmailSec.value.trim().toLowerCase() : currentUser.email_secundario;

                currentUser.cep = elCep ? elCep.value.trim() : currentUser.cep;
                currentUser.logradouro = elRua ? elRua.value.trim() : currentUser.logradouro;
                currentUser.numero = elNumero ? elNumero.value.trim() : currentUser.numero;
                currentUser.bairro = elBairro ? elBairro.value.trim() : currentUser.bairro;
                currentUser.uf = elUf ? elUf.value.trim().toUpperCase() : currentUser.uf;
                currentUser.cidade = elCidade ? elCidade.value.trim() : currentUser.cidade;
                currentUser.complemento = elComplemento ? elComplemento.value.trim() : currentUser.complemento;

                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                updateUserBadges();

                if (window.SBPS_Supabase) {
                    await window.SBPS_Supabase.updateProfile(currentUser);
                }

                showToastMessage('Dados cadastrais atualizados e salvos no Supabase com sucesso!');
            });
        }
    }

    // --------------------------------------------------------------------------
    // 4. Aba Atalhos (Gerenciador de Atalhos Customizados)
    // --------------------------------------------------------------------------
    function renderShortcuts() {
        const list = document.getElementById('shortcuts-list');
        if (!list) return;
        list.innerHTML = '';

        memberShortcuts.forEach(sc => {
            const card = document.createElement('div');
            card.className = 'panel-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="card-icon-wrapper" style="margin: 0; width: 45px; height: 45px; font-size: 1.2rem;">
                        <i class="${sc.icon}"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 1.05rem; color: var(--assoc-primary);">${sc.title}</h4>
                        <span style="font-size: 0.8rem; color: var(--assoc-text-muted);">${sc.url}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-enroll btn-open-sc" style="padding: 8px 14px; font-size: 0.85rem;"><i class="fa-solid fa-external-link"></i> Acessar</button>
                    <button class="btn-logout btn-del-sc" style="margin:0;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            card.querySelector('.btn-open-sc').addEventListener('click', () => {
                if (sc.url.startsWith('#')) {
                    const tabId = sc.url.substring(1);
                    switchTab(tabId, sc.title);
                } else {
                    window.location.href = sc.url;
                }
            });

            card.querySelector('.btn-del-sc').addEventListener('click', () => {
                memberShortcuts = memberShortcuts.filter(item => item.id !== sc.id);
                localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(memberShortcuts));
                renderShortcuts();
                showToastMessage('Atalho removido.');
            });

            list.appendChild(card);
        });

        const btnAdd = document.getElementById('btn-add-shortcut');
        if (btnAdd) {
            btnAdd.onclick = () => {
                const title = prompt('Digite o nome do Atalho:');
                if (!title) return;
                const url = prompt('Digite o destino (ex: #cursos, #templates ou /pages/noticias.html):', '#cursos');
                if (!url) return;

                memberShortcuts.push({
                    id: Date.now(),
                    title,
                    url,
                    icon: 'fa-solid fa-arrow-up-right-from-square'
                });
                localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(memberShortcuts));
                renderShortcuts();
                showToastMessage('Novo atalho criado!');
            };
        }
    }

    // --------------------------------------------------------------------------
    // 5. Aba Cursos & 6. Aba Seminários (Catálogo, Busca, Filtros & Inscrição)
    // --------------------------------------------------------------------------
    const mockCourses = [
        { id: 1, title: 'Planejamento Previdenciário Integrado - Método 4x4', professor: 'Prof. Carlos Santos', horas: '40h', materia: 'Previdenciário', precoOriginal: 'R$ 690,00', precoAssociado: 'R$ 290,00', img: '../images/ref2.jpg' },
        { id: 2, title: 'Avaliação Biopsicossocial na Aposentadoria PCD', professor: 'Dra. Juliana Mendes', horas: '24h', materia: 'Saúde & Biopsicossocial', precoOriginal: 'R$ 450,00', precoAssociado: 'R$ 180,00', img: '../images/ref1.jpg' },
        { id: 3, title: 'Cálculos Previdenciários de RMI e Revisões', professor: 'Dr. Roberto Lima', horas: '30h', materia: 'Cálculos', precoOriginal: 'R$ 550,00', precoAssociado: 'R$ 220,00', img: '../images/ref3.png' }
    ];

    const mockSeminars = [
        { id: 101, title: 'Congresso Brasileiro de Direito Previdenciário 2026', palestrante: 'Painel de Especialistas SBPS', horas: '16h', tema: 'Geral', precoOriginal: 'R$ 380,00', precoAssociado: 'R$ 120,00', img: '../images/capa-sociedade.png' },
        { id: 102, title: 'Seminário de Reformas Previdenciárias Estaduais', palestrante: 'Dr. Fernando Oliveira', horas: '12h', tema: 'Regimes Próprios (RPPS)', precoOriginal: 'R$ 300,00', precoAssociado: 'R$ 90,00', img: '../images/capa.jpg' }
    ];

    function renderCourses() {
        const grid = document.getElementById('courses-grid');
        const myCoursesList = document.getElementById('my-courses-list');
        if (!grid) return;
        grid.innerHTML = '';
        if (myCoursesList) myCoursesList.innerHTML = '';

        mockCourses.forEach(c => {
            const isEnrolled = enrolledCourses.includes(c.id);

            // Card no Catálogo
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-img">
                    <img src="${c.img}" alt="${c.title}">
                    <span class="item-badge-discount">Desconto Associado</span>
                </div>
                <div class="item-body">
                    <h3 class="item-title">${c.title}</h3>
                    <div class="item-meta">
                        <span><i class="fa-solid fa-chalkboard-user"></i> ${c.professor}</span>
                        <span><i class="fa-solid fa-clock"></i> Carga Horária: ${c.horas}</span>
                    </div>
                    <div class="item-price-tag">
                        <span class="price-old">${c.precoOriginal}</span>
                        <span class="price-new">${c.precoAssociado}</span>
                    </div>
                    <button class="btn-enroll ${isEnrolled ? 'enrolled' : ''}" ${isEnrolled ? 'disabled' : ''}>
                        ${isEnrolled ? '<i class="fa-solid fa-check"></i> Inscrito' : 'Garantir Vaga com Desconto'}
                    </button>
                </div>
            `;

            if (!isEnrolled) {
                card.querySelector('.btn-enroll').addEventListener('click', () => {
                    enrolledCourses.push(c.id);
                    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(enrolledCourses));
                    renderCourses();
                    showToastMessage('Inscrição realizada com sucesso!');
                });
            }

            grid.appendChild(card);

            // Card no Perfil -> Meus Cursos
            if (isEnrolled && myCoursesList) {
                const myCard = document.createElement('div');
                myCard.className = 'panel-card';
                myCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div>
                            <h4 style="color:var(--assoc-primary); font-size:1.1rem;">${c.title}</h4>
                            <span style="font-size:0.85rem; color:var(--assoc-text-muted);">${c.professor} | ${c.horas}</span>
                        </div>
                        <button class="btn-enroll" style="width:auto; padding:8px 16px;">Acessar Sala Virtual</button>
                    </div>
                `;
                myCoursesList.appendChild(myCard);
            }
        });
    }

    function renderSeminars() {
        const grid = document.getElementById('seminars-grid');
        const mySeminarsList = document.getElementById('my-seminars-list');
        if (!grid) return;
        grid.innerHTML = '';
        if (mySeminarsList) mySeminarsList.innerHTML = '';

        mockSeminars.forEach(s => {
            const isEnrolled = enrolledSeminars.includes(s.id);

            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-img">
                    <img src="${s.img}" alt="${s.title}">
                    <span class="item-badge-discount">Exclusivo SBPS</span>
                </div>
                <div class="item-body">
                    <h3 class="item-title">${s.title}</h3>
                    <div class="item-meta">
                        <span><i class="fa-solid fa-user-tie"></i> ${s.palestrante}</span>
                        <span><i class="fa-solid fa-clock"></i> ${s.horas}</span>
                    </div>
                    <div class="item-price-tag">
                        <span class="price-old">${s.precoOriginal}</span>
                        <span class="price-new">${s.precoAssociado}</span>
                    </div>
                    <button class="btn-enroll ${isEnrolled ? 'enrolled' : ''}" ${isEnrolled ? 'disabled' : ''}>
                        ${isEnrolled ? '<i class="fa-solid fa-check"></i> Inscrito' : 'Participar do Seminário'}
                    </button>
                </div>
            `;

            if (!isEnrolled) {
                card.querySelector('.btn-enroll').addEventListener('click', () => {
                    enrolledSeminars.push(s.id);
                    localStorage.setItem(STORAGE_KEY_SEMINARS, JSON.stringify(enrolledSeminars));
                    renderSeminars();
                    showToastMessage('Inscrição no seminário efetuada!');
                });
            }

            grid.appendChild(card);

            if (isEnrolled && mySeminarsList) {
                const myCard = document.createElement('div');
                myCard.className = 'panel-card';
                myCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div>
                            <h4 style="color:var(--assoc-primary); font-size:1.1rem;">${s.title}</h4>
                            <span style="font-size:0.85rem; color:var(--assoc-text-muted);">${s.palestrante} | ${s.horas}</span>
                        </div>
                        <button class="btn-enroll" style="width:auto; padding:8px 16px;">Ver Transmissão</button>
                    </div>
                `;
                mySeminarsList.appendChild(myCard);
            }
        });
    }

    // --------------------------------------------------------------------------
    // 7. Aba Certificados (Consulta de Certificados Emitidos & Download PDF)
    // --------------------------------------------------------------------------

    async function renderCertificates() {
        const list = document.getElementById('certificates-list');
        if (!list) return;
        list.innerHTML = '<p style="color:var(--assoc-text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Carregando certificados do Supabase...</p>';

        const userEmail = (currentUser && currentUser.email ? currentUser.email : '').toLowerCase().trim();
        const userCpf = (currentUser && currentUser.cpf ? currentUser.cpf : '').replace(/\D/g, '');

        let certsToDisplay = [];

        if (window.SBPS_Supabase && (userEmail || userCpf)) {
            try {
                const dbCerts = await window.SBPS_Supabase.getCertificates(userEmail, userCpf);

                if (Array.isArray(dbCerts) && dbCerts.length > 0) {
                    const mappedCerts = dbCerts.map(c => ({
                        id: c.id || 'cert-001',
                        email: (c.email || '').toLowerCase().trim(),
                        cpf: (c.cpf || '').replace(/\D/g, ''),
                        type: c.type || 'Curso',
                        title: c.title || 'Certificado SBPS',
                        horas: c.horas || '20h',
                        data: c.data || (c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : 'N/A'),
                        driveUrl: c.drive_url || null,
                        pdfUrl: c.pdf_url || null
                    }));

                    certsToDisplay = mappedCerts.filter(c => 
                        (userEmail && c.email === userEmail) || 
                        (userCpf && c.cpf === userCpf)
                    );
                }
            } catch (err) {
                console.error('Erro ao processar certificados do Supabase:', err);
            }
        }

        list.innerHTML = '';

        if (!certsToDisplay || certsToDisplay.length === 0) {
            list.innerHTML = `
                <div class="panel-card" style="text-align:center; padding:35px 20px;">
                    <i class="fa-solid fa-certificate" style="font-size:2.5rem; color:var(--assoc-text-muted); margin-bottom:12px;"></i>
                    <h3 style="color:var(--assoc-primary); margin-bottom:8px;">Nenhum certificado emitido</h3>
                    <p style="color:var(--assoc-text-muted); font-size:0.9rem;">Não há certificados registrados para o e-mail <strong>${userEmail || 'conectado'}</strong> na base de dados do Supabase.</p>
                </div>
            `;
            return;
        }

        certsToDisplay.forEach(cert => {
            const card = document.createElement('div');
            card.className = 'panel-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.flexWrap = 'wrap';
            card.style.gap = '15px';

            const emailTarget = userEmail || cert.email || '';
            const driveLink = cert.driveUrl || cert.drive_url || cert.pdfUrl || '';

            card.innerHTML = `
                <div>
                    <span class="format-badge" style="background:var(--assoc-secondary); color:#fff; font-size:0.8rem;">${cert.type}</span>
                    <h4 style="color:var(--assoc-primary); font-size:1.1rem; margin-top:6px;">${cert.title}</h4>
                    <span style="font-size:0.85rem; color:var(--assoc-text-muted);">Carga Horária: ${cert.horas} | Emitido em: ${cert.data}</span>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn-enroll btn-download-pdf" style="width:auto; padding:9px 18px; background:var(--assoc-secondary); cursor:pointer;"><i class="fa-solid fa-file-pdf"></i> Baixar PDF</button>
                    <button type="button" class="btn-enroll btn-view-cert" style="width:auto; padding:9px 18px; cursor:pointer;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Visualizar Certificado (Drive)</button>
                </div>
            `;

            // Clique para baixar o PDF direto do fluxo n8n para o dispositivo
            card.querySelector('.btn-download-pdf').addEventListener('click', function() {
                downloadCertificadoPDF(cert.id, emailTarget, this, cert.title);
            });

            // Clique para visualizar o arquivo no Google Drive ou modal
            card.querySelector('.btn-view-cert').addEventListener('click', () => {
                if (driveLink && (driveLink.includes('drive.google.com') || driveLink.includes('http'))) {
                    window.open(driveLink, '_blank');
                } else {
                    showCertificateModal(cert, emailTarget);
                }
            });

            list.appendChild(card);
        });
    }

    // Função de download direto via Blob para salvar o PDF no dispositivo
    async function downloadCertificadoPDF(certId, email, btnElement) {
        if (!certId || !email) return;
        const originalHtml = btnElement ? btnElement.innerHTML : '';
        const webhookUrl = `https://n8n-motaadv.duckdns.org/webhook/download-certificado?id=${encodeURIComponent(certId)}&email=${encodeURIComponent(email)}`;

        try {
            if (btnElement) {
                btnElement.disabled = true;
                btnElement.style.opacity = '0.7';
                btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Baixando...';
            }

            const res = await fetch(webhookUrl);

            if (!res.ok) {
                throw new Error(`Status HTTP ${res.status}`);
            }

            // Tenta extrair o nome exato enviado pelo n8n nos headers Content-Disposition ou Content-disp
            let filename = null;
            let disposition = res.headers.get('Content-Disposition') || 
                              res.headers.get('content-disposition') || 
                              res.headers.get('Content-disp') || 
                              res.headers.get('content-disp');

            // Se não encontrou pela busca direta, varre todos os headers expostos
            if (!disposition) {
                res.headers.forEach((val, key) => {
                    if (key.toLowerCase().includes('disp')) {
                        disposition = val;
                    }
                });
            }

            console.log('Header de Disposição recebido do n8n:', disposition);

            if (disposition) {
                const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
                if (utf8Match && utf8Match[1]) {
                    filename = decodeURIComponent(utf8Match[1]);
                } else {
                    // Trata filename="exemplo.pdf", filename=exemplo.pdf, filename "exemplo.pdf"
                    const match = /filename\s*=?\s*["']?([^"';\r\n]+)["']?/i.exec(disposition);
                    if (match && match[1]) {
                        filename = match[1].trim();
                    }
                }
            }

            console.log('Nome do arquivo final extraído:', filename);

            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.download = filename || 'Certificado.pdf';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(link);
            }, 300);

            if (typeof showToastMessage === 'function') {
                showToastMessage(filename ? `Download de "${filename}" concluído!` : 'Download do certificado em PDF concluído!');
            }
        } catch (err) {
            console.error('Erro no download do PDF:', err);
            window.open(webhookUrl, '_blank');
        } finally {
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.style.opacity = '1';
                btnElement.innerHTML = originalHtml;
            }
        }
    }

    function showCertificateModal(cert, emailTarget) {
        let modal = document.getElementById('modal-certificate');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-certificate';
            modal.className = 'assoc-modal';
            document.body.appendChild(modal);
        }

        const driveLink = cert.driveUrl || cert.drive_url || cert.pdfUrl || '#';

        modal.innerHTML = `
            <div class="assoc-modal-content" style="max-width:750px; border: 4px double var(--assoc-primary); text-align:center;">
                <span class="close-assoc-modal" onclick="document.getElementById('modal-certificate').classList.remove('show')">&times;</span>
                <div style="padding:20px;">
                    <img src="../images/image-header.png" alt="SBPS Logo" style="height:60px; margin-bottom:15px;">
                    <h2 style="color:var(--assoc-primary); font-size:1.8rem; margin-bottom:10px;">CERTIFICADO DE ${cert.type ? cert.type.toUpperCase() : 'CONCLUSÃO'}</h2>
                    <p style="font-size:1rem; color:#444; line-height:1.8;">
                        Certificamos que <strong>${currentUser ? currentUser.nome : 'Associado(a)'}</strong>, portador(a) do registro OAB/Documento <strong>${currentUser ? currentUser.oab : 'Pessoa Física'}</strong>, concluiu com êxito o ${cert.type || 'evento'} de <strong>"${cert.title}"</strong> promovido pela Sociedade Brasileira de Previdência Social (SBPS), perfazendo carga horária total de <strong>${cert.horas}</strong>.
                    </p>
                    <br>
                    <p style="font-size:0.85rem; color:#777;">Recife/PE, ${cert.data}</p>
                    <br>
                    <div style="display:flex; justify-content:space-around; margin-top:30px; border-top:1px solid #ccc; padding-top:15px;">
                        <div>
                            <strong>Diretoria Acadêmica SBPS</strong>
                        </div>
                        <div>
                            <strong>Presidente Executivo</strong>
                        </div>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
                    <button type="button" id="btn-modal-dl-pdf" class="btn-auth-submit" style="width:auto; padding:10px 20px; background:var(--assoc-secondary); cursor:pointer;"><i class="fa-solid fa-download"></i> Baixar PDF Seguro</button>
                    ${driveLink && driveLink !== '#' ? `<a href="${driveLink}" target="_blank" class="btn-auth-submit" style="width:auto; padding:10px 20px; text-decoration:none;"><i class="fa-brands fa-google-drive"></i> Abrir no Google Drive</a>` : ''}
                </div>
            </div>
        `;

        const modalDlBtn = modal.querySelector('#btn-modal-dl-pdf');
        if (modalDlBtn) {
            modalDlBtn.onclick = function() {
                downloadCertificadoPDF(cert.id, emailTarget || (currentUser ? currentUser.email : ''), this, cert.title);
            };
        }

        requestAnimationFrame(() => modal.classList.add('show'));
    }

    // --------------------------------------------------------------------------
    // 8. Aba Templates Hub (Estilo Canva para Documentos Advocatícios)
    // --------------------------------------------------------------------------
    const mockTemplates = [
        { id: 1, title: 'Petição Inicial - Concessão de Aposentadoria por Idade', cat: 'pecas', formats: ['DOCX', 'TXT', 'PDF'] },
        { id: 2, title: 'Contestação Previdenciária - Acidente de Trabalho', cat: 'pecas', formats: ['DOCX', 'PDF'] },
        { id: 3, title: 'Ata de Assembleia Geral Extraordinária', cat: 'docs', formats: ['DOCX', 'TXT'] },
        { id: 4, title: 'Procuração Ad Judicia Previdenciária com Poderes Especiais', cat: 'docs', formats: ['DOCX', 'PDF'] },
        { id: 5, title: 'Planilha de Cálculo de Liquidação de Sentença RMI', cat: 'planilhas', formats: ['XLSX', 'CSV'] },
        { id: 6, title: 'Logotipo Genérico & Identidade Visual de Escritório', cat: 'design', formats: ['PNG', 'PDF'] }
    ];

    function renderTemplates() {
        const grid = document.getElementById('templates-grid');
        if (!grid) return;
        grid.innerHTML = '';

        mockTemplates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'template-item-card';
            card.innerHTML = `
                <div style="font-size:1.8rem; color:var(--assoc-secondary); margin-bottom:12px;"><i class="fa-solid fa-file-signature"></i></div>
                <h4 style="color:var(--assoc-primary); font-size:1.05rem; margin-bottom:8px;">${t.title}</h4>
                <div class="format-badges">
                    ${t.formats.map(f => `<span class="format-badge">${f}</span>`).join('')}
                </div>
                <button class="btn-enroll btn-use-tpl" style="margin-top:15px; padding:8px 12px; font-size:0.85rem;"><i class="fa-solid fa-pen-to-square"></i> Usar e Editar Template</button>
            `;

            card.querySelector('.btn-use-tpl').addEventListener('click', () => {
                openTemplateEditor(t);
            });

            grid.appendChild(card);
        });
    }

    function openTemplateEditor(tpl) {
        let modal = document.getElementById('modal-tpl-editor');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-tpl-editor';
            modal.className = 'assoc-modal';
            modal.innerHTML = `
                <div class="assoc-modal-content">
                    <span class="close-assoc-modal">&times;</span>
                    <h3 style="color:var(--assoc-primary); margin-bottom:15px;" id="tpl-modal-title">Editar Modelo</h3>
                    <p style="font-size:0.9rem; color:var(--assoc-text-muted); margin-bottom:20px;">Preencha os campos para personalizar seu documento e baixar no formato desejado:</p>
                    
                    <div class="form-group">
                        <label>Nome do Cliente / Requerente</label>
                        <input type="text" id="tpl-client-name" class="form-control" placeholder="Ex: João da Silva">
                    </div>
                    <div class="form-group">
                        <label>Réu / Órgão Responsável</label>
                        <input type="text" id="tpl-target-name" class="form-control" value="Instituto Nacional do Seguro Social - INSS">
                    </div>
                    <div class="form-group">
                        <label>Vara / Comarca</label>
                        <input type="text" id="tpl-vara" class="form-control" placeholder="Ex: 5ª Vara Federal da Seção Judiciária de Pernambuco">
                    </div>

                    <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
                        <button id="btn-dl-docx" class="btn-enroll" style="flex:1;"><i class="fa-solid fa-file-word"></i> Baixar DOCX</button>
                        <button id="btn-dl-txt" class="btn-enroll" style="flex:1; background:var(--assoc-primary);"><i class="fa-solid fa-file-lines"></i> Baixar TXT</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.close-assoc-modal').onclick = () => modal.classList.remove('show');

            modal.querySelector('#btn-dl-docx').onclick = () => {
                showToastMessage('Download do modelo DOCX iniciado!');
                modal.classList.remove('show');
            };

            modal.querySelector('#btn-dl-txt').onclick = () => {
                showToastMessage('Download do arquivo TXT concluído!');
                modal.classList.remove('show');
            };
        }

        modal.querySelector('#tpl-modal-title').textContent = tpl.title;
        requestAnimationFrame(() => modal.classList.add('show'));
    }

    // --------------------------------------------------------------------------
    // 9. Aba Livraria (Ebooks, Livros Físicos e Vitrine de Autores)
    // --------------------------------------------------------------------------
    function renderLivraria() {
        const showcaseGrid = document.getElementById('author-books-grid');
        if (!showcaseGrid) return;
        showcaseGrid.innerHTML = '';

        authorBooks.forEach(b => {
            const card = document.createElement('div');
            card.className = 'panel-card';
            card.innerHTML = `
                <div style="display:flex; gap:15px; align-items:flex-start;">
                    <div style="font-size:2.5rem; color:var(--assoc-secondary);"><i class="fa-solid fa-book-bookmark"></i></div>
                    <div>
                        <h4 style="color:var(--assoc-primary); font-size:1.1rem;">${b.title}</h4>
                        <span style="font-size:0.85rem; color:var(--assoc-text-muted); font-weight:700;">Autor(a): ${b.autor}</span>
                        <p style="font-size:0.9rem; color:#555; margin:8px 0;">${b.desc}</p>
                        <span style="color:var(--assoc-secondary); font-weight:700; font-size:1.1rem;">${b.preco}</span>
                    </div>
                </div>
            `;
            showcaseGrid.appendChild(card);
        });

        const btnPublish = document.getElementById('btn-publish-book');
        if (btnAddBookModal(btnPublish));
    }

    function btnAddBookModal(btn) {
        if (!btn) return;
        btn.onclick = () => {
            const title = prompt('Título da sua obra jurídica:');
            if (!title) return;
            const desc = prompt('Breve descrição da obra:');
            authorBooks.push({
                title,
                autor: currentUser ? currentUser.nome : 'Associado SBPS',
                preco: 'R$ 75,00',
                desc: desc || 'Obra especializada em Direito Previdenciário.'
            });
            localStorage.setItem(STORAGE_KEY_AUTHOR_BOOKS, JSON.stringify(authorBooks));
            renderLivraria();
            showToastMessage('Sua obra foi cadastrada na Vitrine de Autores!');
        };
    }

    // --------------------------------------------------------------------------
    // 10. Aba Outros / Seção Ajuda (Suporte Técnico com limite de 3 chamados)
    // --------------------------------------------------------------------------
    function renderAjudaSupport() {
        const ticketsList = document.getElementById('tickets-list');
        const formTicket = document.getElementById('form-new-ticket');
        const limitNotice = document.getElementById('ticket-limit-notice');

        if (ticketsList) {
            ticketsList.innerHTML = '';
            activeTickets.forEach(t => {
                const item = document.createElement('div');
                item.className = 'panel-card';
                item.style.padding = '15px 20px';
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="color:var(--assoc-primary);"># Chamado: ${t.assunto}</strong>
                            <span style="display:block; font-size:0.8rem; color:var(--assoc-text-muted);">Tema: ${t.tema} | Data: ${t.data}</span>
                        </div>
                        <span class="format-badge" style="background:var(--assoc-accent); color:var(--assoc-primary);">${t.status}</span>
                    </div>
                `;
                ticketsList.appendChild(item);
            });
        }

        if (formTicket) {
            formTicket.addEventListener('submit', (e) => {
                e.preventDefault();

                // Verifica o limite de 3 chamados abertos
                const openCount = activeTickets.filter(t => t.status !== 'Resolvido').length;
                if (openCount >= 3) {
                    alert('Você atingiu o limite máximo de 3 chamados de suporte abertos em simultâneo. Aguarde a resolução de um dos seus chamados para abrir um novo.');
                    return;
                }

                const assunto = document.getElementById('ticket-assunto').value;
                const tema = document.getElementById('ticket-tema').value;
                const desc = document.getElementById('ticket-desc').value;
                const contato = document.getElementById('ticket-contato').value;

                activeTickets.push({
                    id: Date.now(),
                    assunto,
                    tema,
                    desc,
                    contato,
                    status: 'Em Análise',
                    data: new Date().toLocaleDateString('pt-BR')
                });

                localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(activeTickets));
                renderAjudaSupport();
                formTicket.reset();
                showToastMessage('Chamado de suporte aberto com sucesso!');
            });
        }
    }

});
