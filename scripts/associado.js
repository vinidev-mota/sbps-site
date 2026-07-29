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

    // Default Logged-In State Sample (if not registered yet, default demo user is available)
    const defaultUser = {
        nome: 'Dra. Ana Maria Silveira',
        nascimento: '1988-05-14',
        cpf: '123.456.789-00',
        email: 'ana.silveira@adv.com.br',
        celular: '(81) 99876-5432',
        fixo: '(81) 3456-7890',
        oab: '123456/PE',
        conselho: '',
        cep: '50000-000',
        endereco: 'Av. Boa Viagem, 1500, Apt 402 - Boa Viagem, Recife - PE',
        status: 'Ativo'
    };

    let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY_USER)) || null;
    let memberShortcuts = JSON.parse(localStorage.getItem(STORAGE_KEY_SHORTCUTS)) || [
        { id: 1, title: 'Calculadora de Benefícios INSS', url: '#templates', icon: 'fa-solid fa-calculator' },
        { id: 2, title: 'Estatuto Social SBPS', url: 'estatuto.html', icon: 'fa-solid fa-file-contract' },
        { id: 3, title: 'Vitrine de Autores', url: '#livraria', icon: 'fa-solid fa-book-open' }
    ];
    let enrolledCourses = JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES)) || [1];
    let enrolledSeminars = JSON.parse(localStorage.getItem(STORAGE_KEY_SEMINARS)) || [101];
    let activeTickets = JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS)) || [
        { id: 1, assunto: 'Dúvida sobre desconto em congresso', tema: 'Benefícios', status: 'Em Análise', data: '2026-07-20' }
    ];
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
    // 1. Autenticação & Cadastro Pessoa Física (ViaCEP)
    // --------------------------------------------------------------------------
    function initAuth() {
        const authContainer = document.getElementById('auth-container');
        const memberContent = document.getElementById('member-content');
        const loginTabBtn = document.getElementById('tab-login-btn');
        const registerTabBtn = document.getElementById('tab-register-btn');
        const loginForm = document.getElementById('form-login');
        const registerForm = document.getElementById('form-register');

        if (currentUser) {
            authContainer.style.display = 'none';
            memberContent.style.display = 'block';
            updateUserBadges();
        } else {
            authContainer.style.display = 'block';
            memberContent.style.display = 'none';
        }

        // Tab Switching in Auth
        if (loginTabBtn && registerTabBtn) {
            loginTabBtn.addEventListener('click', () => {
                loginTabBtn.classList.add('active');
                registerTabBtn.classList.remove('active');
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            });

            registerTabBtn.addEventListener('click', () => {
                registerTabBtn.classList.add('active');
                loginTabBtn.classList.remove('active');
                registerForm.style.display = 'block';
                loginForm.style.display = 'none';
            });
        }

        // Submit Login (or Quick Demo Login)
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                currentUser = currentUser || defaultUser;
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                authContainer.style.display = 'none';
                memberContent.style.display = 'block';
                updateUserBadges();
                showToastMessage('Login efetuado com sucesso!');
            });
        }

        // Submit Cadastro Pessoa Física
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const pass = document.getElementById('reg-password').value;
                const passConf = document.getElementById('reg-password-confirm').value;

                if (pass !== passConf) {
                    alert('As senhas não coincidem!');
                    return;
                }

                currentUser = {
                    nome: document.getElementById('reg-nome').value,
                    nascimento: document.getElementById('reg-nasc').value,
                    cpf: document.getElementById('reg-cpf').value,
                    email: document.getElementById('reg-email').value,
                    celular: document.getElementById('reg-celular').value,
                    fixo: document.getElementById('reg-fixo').value,
                    oab: document.getElementById('reg-oab').value,
                    conselho: document.getElementById('reg-conselho').value,
                    cep: document.getElementById('reg-cep').value,
                    endereco: `${document.getElementById('reg-rua').value}, ${document.getElementById('reg-numero').value} - ${document.getElementById('reg-bairro').value}, ${document.getElementById('reg-cidade').value}/${document.getElementById('reg-uf').value}`,
                    status: 'Ativo'
                };

                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                authContainer.style.display = 'none';
                memberContent.style.display = 'block';
                updateUserBadges();
                renderUserData();
                showToastMessage('Cadastro realizado com sucesso! Bem-vindo(a) à SBPS.');
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

    // Auto-complete Address via ViaCEP API
    function initViaCEP() {
        const cepInput = document.getElementById('reg-cep');
        if (!cepInput) return;

        cepInput.addEventListener('blur', () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.erro) {
                            document.getElementById('reg-rua').value = data.logradouro || '';
                            document.getElementById('reg-bairro').value = data.bairro || '';
                            document.getElementById('reg-cidade').value = data.localidade || '';
                            document.getElementById('reg-uf').value = data.uf || '';
                            document.getElementById('reg-numero').focus();
                        }
                    })
                    .catch(err => console.error('Erro ao consultar CEP:', err));
            }
        });
    }

    function updateUserBadges() {
        if (!currentUser) return;
        document.querySelectorAll('.user-name-display').forEach(el => el.textContent = currentUser.nome);
        document.querySelectorAll('.user-oab-display').forEach(el => el.textContent = currentUser.oab ? `OAB: ${currentUser.oab}` : 'Associado SBPS');
        document.querySelectorAll('.user-avatar-display').forEach(el => el.textContent = currentUser.nome ? currentUser.nome.charAt(0).toUpperCase() : 'A');
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
    // 3. Aba Perfil (Edição + Listas Inscritas)
    // --------------------------------------------------------------------------
    function renderUserData() {
        if (!currentUser) return;
        document.getElementById('edit-nome').value = currentUser.nome || '';
        document.getElementById('edit-nasc').value = currentUser.nascimento || '';
        document.getElementById('edit-cpf').value = currentUser.cpf || '';
        document.getElementById('edit-email').value = currentUser.email || '';
        document.getElementById('edit-celular').value = currentUser.celular || '';
        document.getElementById('edit-fixo').value = currentUser.fixo || '';
        document.getElementById('edit-oab').value = currentUser.oab || '';
        document.getElementById('edit-conselho').value = currentUser.conselho || '';
        document.getElementById('edit-cep').value = currentUser.cep || '';
        document.getElementById('edit-endereco').value = currentUser.endereco || '';

        const formPerfil = document.getElementById('form-edit-perfil');
        if (formPerfil) {
            formPerfil.addEventListener('submit', (e) => {
                e.preventDefault();
                currentUser.nome = document.getElementById('edit-nome').value;
                currentUser.nascimento = document.getElementById('edit-nasc').value;
                currentUser.cpf = document.getElementById('edit-cpf').value;
                currentUser.email = document.getElementById('edit-email').value;
                currentUser.celular = document.getElementById('edit-celular').value;
                currentUser.fixo = document.getElementById('edit-fixo').value;
                currentUser.oab = document.getElementById('edit-oab').value;
                currentUser.conselho = document.getElementById('edit-conselho').value;
                currentUser.cep = document.getElementById('edit-cep').value;
                currentUser.endereco = document.getElementById('edit-endereco').value;

                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                updateUserBadges();
                showToastMessage('Dados alterados com sucesso!');
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
    // 7. Aba Certificados (Emissão PDF / Impressão)
    // --------------------------------------------------------------------------
    // 7. Aba Certificados (Emissão PDF / Impressão)
    // --------------------------------------------------------------------------
    async function renderCertificates() {
        const list = document.getElementById('certificates-list');
        if (!list) return;
        list.innerHTML = '<p style="color:var(--assoc-text-muted);">Carregando certificados...</p>';

        let allCerts = [];
        try {
            const res = await fetch('../data/certificados.json?v=' + Date.now());
            if (res.ok) {
                allCerts = await res.json();
            }
        } catch (err) {
            console.warn('Não foi possível carregar data/certificados.json, usando padrão:', err);
        }

        const userEmail = currentUser && currentUser.email ? currentUser.email.toLowerCase().trim() : '';

        // Filtra certificados do usuário logado pelo e-mail
        let userCerts = allCerts.filter(c => c.email && c.email.toLowerCase().trim() === userEmail);

        // Se for o usuário de demonstração ou lista vazia, exibe amostras se o usuário for o padrão
        if (userCerts.length === 0 && (!currentUser || currentUser.email === defaultUser.email)) {
            userCerts = allCerts.filter(c => c.email === defaultUser.email);
        }

        list.innerHTML = '';

        if (userCerts.length === 0) {
            list.innerHTML = `
                <div class="panel-card" style="text-align:center; padding:30px;">
                    <i class="fa-solid fa-certificate" style="font-size:2.5rem; color:var(--assoc-text-muted); margin-bottom:10px;"></i>
                    <h3 style="color:var(--assoc-primary);">Nenhum certificado encontrado</h3>
                    <p style="color:var(--assoc-text-muted); font-size:0.9rem;">Não encontramos certificados vinculados ao e-mail <strong>${currentUser ? currentUser.email : ''}</strong>.</p>
                </div>
            `;
            return;
        }

        userCerts.forEach(cert => {
            const card = document.createElement('div');
            card.className = 'panel-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.flexWrap = 'wrap';
            card.style.gap = '15px';
            card.innerHTML = `
                <div>
                    <span class="format-badge" style="background:var(--assoc-secondary); color:#fff; font-size:0.8rem;">${cert.type || 'Certificado'}</span>
                    <h4 style="color:var(--assoc-primary); font-size:1.1rem; margin-top:6px;">${cert.title}</h4>
                    <span style="font-size:0.85rem; color:var(--assoc-text-muted);">Carga Horária: ${cert.horas || 'N/A'} | Emitido em: ${cert.data || 'N/A'}</span>
                </div>
                <div style="display:flex; gap:10px;">
                    ${cert.pdfUrl ? `
                        <a href="${cert.pdfUrl}" target="_blank" class="btn-enroll" style="width:auto; padding:9px 18px; text-decoration:none; background:var(--assoc-secondary);"><i class="fa-solid fa-file-pdf"></i> Abrir / Baixar PDF</a>
                    ` : ''}
                    <button class="btn-enroll btn-view-cert" style="width:auto; padding:9px 18px;"><i class="fa-solid fa-eye"></i> Visualizar Certificado</button>
                </div>
            `;

            card.querySelector('.btn-view-cert').addEventListener('click', () => {
                showCertificateModal(cert);
            });

            list.appendChild(card);
        });
    }

    function showCertificateModal(cert) {
        let modal = document.getElementById('modal-certificate');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-certificate';
            modal.className = 'assoc-modal';
            document.body.appendChild(modal);
        }

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
                <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
                    ${cert.pdfUrl ? `<a href="${cert.pdfUrl}" target="_blank" class="btn-auth-submit" style="width:auto; padding:10px 20px; background:var(--assoc-secondary);"><i class="fa-solid fa-download"></i> Baixar PDF Original</a>` : ''}
                    <button onclick="window.print()" class="btn-auth-submit" style="width:auto; padding:10px 20px;"><i class="fa-solid fa-print"></i> Imprimir / Salvar em PDF</button>
                </div>
            </div>
        `;

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
