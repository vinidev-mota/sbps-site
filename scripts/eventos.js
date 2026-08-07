/* ==========================================================================
   ÁREA DE EVENTOS - LÓGICA E REGRAS DE NEGÓCIO (LAYOUT SAAS DEFINITIVO)
   Sociedade Brasileira de Previdência Social (SBPS)
   ========================================================================== */

(function () {
    'use strict';

    // Mock Database Inicial
    const INITIAL_EVENTS = [
        {
            id: 'evt-101',
            titulo: 'Planejamento Previdenciário Integrado - Método 4x4',
            tipo: 'curso presencial',
            dateStr: '13/08/2026 às 19:00',
            cargaHoraria: '20h',
            palavraChave: 'PLANEJAMENTO_4X4',
            local: 'Recife/PE - Hotel Transamerica',
            valor: 'R$ 350,00',
            resumo: 'Capacitação completa em cálculos previdenciários e metodologias de planejamento de aposentadoria para advogados.',
            programacao: 'Módulo 1: Análise de CNIS | Módulo 2: Simulação de Renda Mensal Inicial | Módulo 3: Casos Práticos',
            palestrante: 'Dr. Roberto Mota',
            palestrante_email: 'roberto.mota@sbps.org.br',
            img: '../images/ref2.jpg',
            status: 'Ativo',
            tema: 'RGPS',
            area: 'Direito Previdenciário'
        },
        {
            id: 'evt-102',
            titulo: 'Aposentadoria da Pessoa com Deficiência: Avaliação Biopsicossocial',
            tipo: 'encontro de associados',
            dateStr: '25/08/2026 às 14:00',
            cargaHoraria: '10h',
            palavraChave: 'APOS_PCD_2026',
            local: 'Online via Zoom Live',
            valor: 'Gratuito para Associados / R$ 120,00',
            resumo: 'Debate prático sobre a aplicação do índice de funcionalidade da LC 142/2013 nas perícias do INSS.',
            programacao: '14:00 Abertura | 15:00 Apresentação de Laudos | 16:30 Mesa Redonda com Peritos',
            palestrante: 'Dra. Ana Silveira',
            palestrante_email: 'ana.silveira@adv.com.br',
            img: '../images/ref1.jpg',
            status: 'Ativo',
            tema: 'Saúde & Biopsicossocial',
            area: 'Perícia Médica'
        },
        {
            id: 'evt-103',
            titulo: 'Congresso Brasileiro de Reformas Previdenciárias Estaduais',
            tipo: 'congresso',
            dateStr: '10/09/2026 às 09:00',
            cargaHoraria: '30h',
            palavraChave: 'CONGRESSO_RPPS_2026',
            local: 'São Paulo/SP - Centro de Convenções',
            valor: 'R$ 490,00',
            resumo: 'Imersão nos novos regimes próprios de previdência social dos estados e municípios pós-EC 103/2019.',
            programacao: 'Dia 1: Alíquotas e Déficit Atuarial | Dia 2: Previdência Complementar',
            palestrante: 'Prof. Carlos Eduardo',
            palestrante_email: 'carlos.eduardo@sbps.org.br',
            img: '../images/ref3.png',
            status: 'Ativo',
            tema: 'RPPS',
            area: 'Direito Público'
        }
    ];

    // Estado Global da Área de Eventos
    let state = {
        userRole: null,
        currentUser: null,
        currentTab: 'dashboard',
        events: [],
        enrollments: [],
        participations: [],
        suggestions: [
            {
                id: 'sug-1',
                nome: 'Ana Silveira',
                is_anonimo: false,
                categoria: 'Cursos & Capacitação',
                titulo: 'Criar Curso de Advocacia nos Tribunais Superiores (STJ/STF)',
                descricao: 'Sugerimos a criação de uma capacitação focada em recursos previdenciários de uniformização de jurisprudência.',
                status: 'Aprovada pela SBPS',
                votos_favor: 24,
                votos_contra: 2
            },
            {
                id: 'sug-2',
                nome: 'Anônimo',
                is_anonimo: true,
                categoria: 'Eventos',
                titulo: 'Networking Presencial no Nordeste',
                descricao: 'Realização de encontros trimestrais itinerantes para fortalecer os advogados associados da região.',
                status: 'Em Análise',
                votos_favor: 12,
                votos_contra: 0
            }
        ],
        communityPosts: [
            {
                id: 'post-1',
                autor: 'Dr. Roberto Mota',
                email: 'roberto.mota@sbps.org.br',
                categoria: 'Jurisprudência',
                titulo: 'Nova Tese Fixada sobre Desaposentação e Reaposentação',
                conteudo: 'Colegas, compartilhando artigo de análise da última sessão de julgamento...',
                likes: 18,
                created_at: 'Há 2 dias'
            }
        ],
        userVotes: {},
        tabFilters: {
            'eventos': { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' },
            'inscricoes': { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' },
            'participacoes': { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' },
            'meus-eventos': { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' },
            'realizados': { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' }
        }
    };

    // Inicialização da Página
    document.addEventListener('DOMContentLoaded', () => {
        loadLocalStorageData();
        setupEventListeners();
        setupPopStateHistory();
        checkActiveSession();
    });

    function loadLocalStorageData() {
        const storedEvts = localStorage.getItem('sbps_evt_events');
        state.events = storedEvts ? JSON.parse(storedEvts) : INITIAL_EVENTS;

        const storedEnr = localStorage.getItem('sbps_evt_enrollments');
        state.enrollments = storedEnr ? JSON.parse(storedEnr) : ['evt-102'];

        const storedPart = localStorage.getItem('sbps_evt_participations');
        state.participations = storedPart ? JSON.parse(storedPart) : ['evt-101'];

        const storedSug = localStorage.getItem('sbps_evt_suggestions');
        if (storedSug) state.suggestions = JSON.parse(storedSug);

        const storedVotes = localStorage.getItem('sbps_evt_votes');
        if (storedVotes) state.userVotes = JSON.parse(storedVotes);
    }

    function saveData() {
        localStorage.setItem('sbps_evt_events', JSON.stringify(state.events));
        localStorage.setItem('sbps_evt_enrollments', JSON.stringify(state.enrollments));
        localStorage.setItem('sbps_evt_participations', JSON.stringify(state.participations));
        localStorage.setItem('sbps_evt_suggestions', JSON.stringify(state.suggestions));
        localStorage.setItem('sbps_evt_votes', JSON.stringify(state.userVotes));
    }

    // Suporte ao Botão Voltar do Navegador (History PopState)
    function setupPopStateHistory() {
        window.addEventListener('popstate', (e) => {
            if (state.currentUser) {
                let targetTab = 'dashboard';
                if (e.state && e.state.tab) {
                    targetTab = e.state.tab;
                } else if (window.location.hash) {
                    targetTab = window.location.hash.replace('#', '');
                }
                switchTab(targetTab, false);
            }
        });
    }

    function setupEventListeners() {
        // Selector Tipo de Perfil
        const btnPart = document.getElementById('btn-select-participante');
        const btnPal = document.getElementById('btn-select-palestrante');
        if (btnPart && btnPal) {
            btnPart.addEventListener('click', () => selectUserRole('participante'));
            btnPal.addEventListener('click', () => selectUserRole('palestrante'));
        }

        setupAuthSubtabs('part');
        setupAuthSubtabs('pal');

        // Submissão Autenticação
        const formLoginPart = document.getElementById('form-login-participante');
        const formRegPart = document.getElementById('form-register-participante');
        const formLoginPal = document.getElementById('form-login-palestrante');
        const formRegPal = document.getElementById('form-register-palestrante');

        if (formLoginPart) formLoginPart.addEventListener('submit', (e) => handleLogin(e, 'participante'));
        if (formRegPart) formRegPart.addEventListener('submit', (e) => handleRegisterParticipante(e));
        if (formLoginPal) formLoginPal.addEventListener('submit', (e) => handleLogin(e, 'palestrante'));
        if (formRegPal) formRegPal.addEventListener('submit', (e) => handleRegisterPalestrante(e));

        // Cursos dinâmicos
        const btnAddEdu = document.getElementById('btn-add-edu-item');
        if (btnAddEdu) btnAddEdu.addEventListener('click', addEduRow);

        // Mobile Menu Controls
        const btnMobileMenu = document.getElementById('btn-mobile-menu-toggle');
        const btnMobileProfile = document.getElementById('btn-mobile-profile-shortcut');
        const sidebar = document.getElementById('evt-sidebar');
        const backdrop = document.getElementById('evt-sidebar-backdrop');

        if (btnMobileMenu && sidebar && backdrop) {
            btnMobileMenu.addEventListener('click', () => {
                sidebar.classList.add('open');
                backdrop.classList.add('show');
            });
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('show');
            });
        }

        if (btnMobileProfile) {
            btnMobileProfile.addEventListener('click', () => {
                switchTab('perfil', true);
                if (sidebar) sidebar.classList.remove('open');
                if (backdrop) backdrop.classList.remove('show');
            });
        }

        // Formulários de Sugestão e Suporte
        const formSugestao = document.getElementById('form-nova-sugestao');
        if (formSugestao) formSugestao.addEventListener('submit', handleNovaSugestao);

        const formCriarEvt = document.getElementById('form-criar-evento-palestrante');
        if (formCriarEvt) formCriarEvt.addEventListener('submit', handleCriarEvento);

        // Chatbot IA
        const fabAi = document.getElementById('btn-ai-fab');
        const windowAi = document.getElementById('ai-chat-window');
        if (fabAi && windowAi) fabAi.onclick = () => windowAi.classList.toggle('open');

        const formAi = document.getElementById('form-ai-chat');
        if (formAi) formAi.addEventListener('submit', handleAiSubmit);

        // Logout
        const btnLogoutSidebar = document.getElementById('btn-logout-workspace');
        if (btnLogoutSidebar) {
            btnLogoutSidebar.addEventListener('click', () => {
                localStorage.removeItem('sbps_evt_session');
                document.body.classList.remove('evt-logged-in');
                location.reload();
            });
        }
    }

    function selectUserRole(role) {
        state.userRole = role;
        const btnPart = document.getElementById('btn-select-participante');
        const btnPal = document.getElementById('btn-select-palestrante');
        const boxPart = document.getElementById('auth-box-participante');
        const boxPal = document.getElementById('auth-box-palestrante');

        if (role === 'participante') {
            btnPart.classList.add('active');
            btnPal.classList.remove('active');
            boxPart.style.display = 'block';
            boxPal.style.display = 'none';
        } else {
            btnPal.classList.add('active');
            btnPart.classList.remove('active');
            boxPal.style.display = 'block';
            boxPart.style.display = 'none';
        }
    }

    function setupAuthSubtabs(prefix) {
        const btnLogin = document.getElementById(`tab-${prefix}-login-btn`);
        const btnReg = document.getElementById(`tab-${prefix}-reg-btn`);
        const formLogin = document.getElementById(`form-login-${prefix === 'part' ? 'participante' : 'palestrante'}`);
        const formReg = document.getElementById(`form-register-${prefix === 'part' ? 'participante' : 'palestrante'}`);

        if (btnLogin && btnReg && formLogin && formReg) {
            btnLogin.addEventListener('click', () => {
                btnLogin.classList.add('active');
                btnReg.classList.remove('active');
                formLogin.style.display = 'block';
                formReg.style.display = 'none';
            });
            btnReg.addEventListener('click', () => {
                btnReg.classList.add('active');
                btnLogin.classList.remove('active');
                formReg.style.display = 'block';
                formLogin.style.display = 'none';
            });
        }
    }

    function addEduRow() {
        const container = document.getElementById('edu-courses-container');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'evt-edu-row';
        row.innerHTML = `
            <input type="text" class="evt-form-control edu-nome" placeholder="Curso/Instituição" required>
            <input type="number" class="evt-form-control edu-inicio" placeholder="Ano Início" style="width:100px;" required>
            <input type="number" class="evt-form-control edu-fim" placeholder="Ano Conclusão" style="width:100px;" required>
            <button type="button" class="evt-btn-icon-danger btn-remove-edu" title="Remover"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
        row.querySelector('.btn-remove-edu').addEventListener('click', () => row.remove());
    }

    async function handleLogin(e, role) {
        e.preventDefault();
        const userInput = (e.target.querySelector('input[type="text"]') || e.target.querySelector('input[type="email"]')).value.trim();

        let assocProfile = null;
        if (window.SBPS_Supabase) {
            assocProfile = await window.SBPS_Supabase.checkAssociadoByEmail(userInput);
        }

        let userObj = {
            email: assocProfile ? assocProfile.email : userInput,
            nome: assocProfile ? assocProfile.nome : userInput.split('@')[0],
            role: role,
            isAssociado: !!assocProfile
        };

        state.currentUser = userObj;
        state.userRole = role;
        localStorage.setItem('sbps_evt_session', JSON.stringify(userObj));
        renderWorkspace();
    }

    async function handleRegisterParticipante(e) {
        e.preventDefault();
        const nome = document.getElementById('reg-part-nome').value;
        const email = document.getElementById('reg-part-email').value;
        const cpf = document.getElementById('reg-part-cpf').value;
        const senha = document.getElementById('reg-part-password').value;

        const userObj = { nome, email, cpf, role: 'participante', isAssociado: false };
        if (window.SBPS_Supabase) {
            await window.SBPS_Supabase.registerParticipante(userObj, senha);
        }

        state.currentUser = userObj;
        state.userRole = 'participante';
        localStorage.setItem('sbps_evt_session', JSON.stringify(userObj));
        renderWorkspace();
    }

    async function handleRegisterPalestrante(e) {
        e.preventDefault();
        const nome = document.getElementById('reg-pal-nome').value;
        const email = document.getElementById('reg-pal-email').value;
        const cpf = document.getElementById('reg-pal-cpf').value;
        const escolaridade = document.getElementById('reg-pal-escolaridade').value;
        const area = document.getElementById('reg-pal-area').value;
        const profissao = document.getElementById('reg-pal-profissao').value;
        const experiencia = document.getElementById('reg-pal-experiencia').value;
        const sobre = document.getElementById('reg-pal-sobre').value;
        const pix = document.getElementById('reg-pal-pix').value;
        const senha = document.getElementById('reg-pal-password').value;

        const eduRows = document.querySelectorAll('.evt-edu-row');
        const cursosList = [];
        eduRows.forEach(row => {
            const nomeCurso = row.querySelector('.edu-nome').value;
            const inicio = row.querySelector('.edu-inicio').value;
            const fim = row.querySelector('.edu-fim').value;
            if (nomeCurso) cursosList.push({ nomeCurso, inicio, fim });
        });

        const userObj = {
            nome, email, cpf, escolaridade, area, profissao, experiencia, sobre, pix,
            cursos: cursosList, role: 'palestrante', isAssociado: false
        };

        if (window.SBPS_Supabase) {
            await window.SBPS_Supabase.registerPalestrante(userObj, senha);
        }

        state.currentUser = userObj;
        state.userRole = 'palestrante';
        localStorage.setItem('sbps_evt_session', JSON.stringify(userObj));
        renderWorkspace();
    }

    function checkActiveSession() {
        const raw = localStorage.getItem('sbps_evt_session');
        if (raw) {
            try {
                const userObj = JSON.parse(raw);
                if (userObj && userObj.role) {
                    state.currentUser = userObj;
                    state.userRole = userObj.role;
                    renderWorkspace();
                }
            } catch (e) {
                localStorage.removeItem('sbps_evt_session');
            }
        }
    }

    function renderWorkspace() {
        const authContainer = document.getElementById('evt-auth-container');
        const workspaceContainer = document.getElementById('evt-workspace-container');

        if (!authContainer || !workspaceContainer) return;

        document.body.classList.add('evt-logged-in');

        authContainer.style.display = 'none';
        workspaceContainer.style.display = 'flex';

        // Atualizar informações de usuário na Sidebar e Header Mobile
        const avatarEl = document.getElementById('workspace-user-avatar');
        const nameEl = document.getElementById('workspace-user-name');
        const badgeEl = document.getElementById('workspace-user-badge');
        const mobileAvatar = document.getElementById('btn-mobile-profile-shortcut');

        const initial = state.currentUser.nome.charAt(0).toUpperCase();
        if (avatarEl) avatarEl.textContent = initial;
        if (mobileAvatar) mobileAvatar.textContent = initial;
        if (nameEl) nameEl.textContent = state.currentUser.nome;
        if (badgeEl) {
            badgeEl.textContent = state.userRole === 'participante' ? 'Participante' : 'Palestrante';
            badgeEl.className = `evt-role-badge ${state.userRole}`;
        }

        renderSidebarNav();

        // Verificar tab inicial da URL hash
        let initialTab = 'dashboard';
        if (window.location.hash) {
            const hTab = window.location.hash.replace('#', '');
            if (hTab) initialTab = hTab;
        }

        history.replaceState({ tab: initialTab }, '', '#' + initialTab);
        switchTab(initialTab, false);
    }

    function renderSidebarNav() {
        const navContainer = document.getElementById('workspace-sidebar-nav');
        if (!navContainer) return;

        let navItems = [];
        if (state.userRole === 'participante') {
            navItems = [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
                { id: 'perfil', label: 'Perfil', icon: 'fa-user' },
                { id: 'eventos', label: 'Eventos', icon: 'fa-calendar-days' },
                { id: 'inscricoes', label: 'Inscrições', icon: 'fa-ticket' },
                { id: 'participacoes', label: 'Participações', icon: 'fa-award' },
                { id: 'comunidade', label: 'Comunidade', icon: 'fa-users' },
                { id: 'sugestoes', label: 'Sugestões', icon: 'fa-lightbulb' },
                { id: 'ajuda', label: 'Ajuda', icon: 'fa-circle-question' }
            ];
        } else {
            navItems = [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
                { id: 'perfil', label: 'Perfil', icon: 'fa-user' },
                { id: 'criar-eventos', label: 'Criar Eventos', icon: 'fa-calendar-plus' },
                { id: 'meus-eventos', label: 'Meus Eventos', icon: 'fa-calendar-check' },
                { id: 'realizados', label: 'Realizados', icon: 'fa-circle-check' },
                { id: 'comunidade', label: 'Comunidade', icon: 'fa-users' },
                { id: 'sugestoes', label: 'Sugestões', icon: 'fa-lightbulb' },
                { id: 'ajuda', label: 'Ajuda', icon: 'fa-circle-question' }
            ];
        }

        navContainer.innerHTML = navItems.map(item => `
            <li>
                <a class="evt-sidebar-link" data-tab="${item.id}">
                    <i class="fa-solid ${item.icon}"></i> ${item.label}
                </a>
            </li>
        `).join('');

        const sidebar = document.getElementById('evt-sidebar');
        const backdrop = document.getElementById('evt-sidebar-backdrop');

        navContainer.querySelectorAll('.evt-sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                switchTab(targetTab, true);
                if (sidebar) sidebar.classList.remove('open');
                if (backdrop) backdrop.classList.remove('show');
            });
        });
    }

    // Alternar entre Abas do Workspace
    function switchTab(tabId, updateHistory = true) {
        state.currentTab = tabId;

        if (updateHistory) {
            history.pushState({ tab: tabId }, '', '#' + tabId);
        }

        document.querySelectorAll('.evt-sidebar-link').forEach(link => {
            if (link.getAttribute('data-tab') === tabId) link.classList.add('active');
            else link.classList.remove('active');
        });

        document.querySelectorAll('.evt-tab-panel').forEach(panel => panel.style.display = 'none');
        const targetPanel = document.getElementById(`panel-${tabId}`);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            renderTabContent(tabId);
        }
    }

    function renderTabContent(tabId) {
        if (tabId === 'dashboard') {
            if (state.userRole === 'participante') renderParticipanteDashboard();
            else renderPalestranteDashboard();
        } else if (tabId === 'perfil') {
            renderPerfilTab();
        } else if (tabId === 'eventos') {
            renderEventosTab();
        } else if (tabId === 'inscricoes') {
            renderInscricoesTab();
        } else if (tabId === 'participacoes') {
            renderParticipacoesTab();
        } else if (tabId === 'meus-eventos') {
            renderMeusEventosTab();
        } else if (tabId === 'realizados') {
            renderRealizadosTab();
        } else if (tabId === 'comunidade') {
            renderComunidadeTab();
        } else if (tabId === 'sugestoes') {
            renderSugestoesTab();
        } else if (tabId === 'ajuda') {
            renderAjudaTab();
        }
    }

    function renderParticipanteDashboard() {
        const container = document.getElementById('panel-dashboard');
        if (!container) return;

        const availableEvts = state.events.filter(e => e.status === 'Ativo');
        const enrolledEvts = state.events.filter(e => state.enrollments.includes(e.id));
        const attendedEvts = state.events.filter(e => state.participations.includes(e.id));

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-house"></i> Dashboard do Participante</h1>
            </div>

            <!-- Seção 1: Eventos recomendados -->
            <div style="margin-bottom:35px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="color:var(--evt-primary); margin:0;"><i class="fa-solid fa-compass"></i> Recomendados para Você</h3>
                    <button class="evt-btn-card-secondary" style="width:auto; padding:6px 14px;" onclick="window.switchTab('eventos', true)">Ver todos os eventos <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="evt-cards-grid">
                    ${availableEvts.slice(0, 6).map(e => createEventCardHTML(e, 'disponivel')).join('')}
                </div>
            </div>

            <!-- Seção 2: Eventos Inscritos -->
            <div style="margin-bottom:35px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="color:var(--evt-primary); margin:0;"><i class="fa-solid fa-ticket"></i> Minhas Inscrições Ativas</h3>
                    <button class="evt-btn-card-secondary" style="width:auto; padding:6px 14px;" onclick="window.switchTab('inscricoes', true)">Ver todas as minhas inscrições <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="evt-card-row-single">
                    ${enrolledEvts.length > 0 ? enrolledEvts.map(e => createEventCardHTML(e, 'inscrito')).join('') : '<p style="color:var(--evt-text-muted);">Você ainda não possui inscrições ativas.</p>'}
                </div>
            </div>

            <!-- Seção 3: Eventos que Participei -->
            <div style="margin-bottom:35px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="color:var(--evt-primary); margin:0;"><i class="fa-solid fa-award"></i> Minhas Participações Realizadas</h3>
                    <button class="evt-btn-card-secondary" style="width:auto; padding:6px 14px;" onclick="window.switchTab('participacoes', true)">Ver todas as minhas participações <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="evt-card-row-single">
                    ${attendedEvts.length > 0 ? attendedEvts.map(e => createEventCardHTML(e, 'participado')).join('') : '<p style="color:var(--evt-text-muted);">Nenhum histórico de participação concluída.</p>'}
                </div>
            </div>
        `;

        attachCardActionListeners(container);
    }

    function renderPalestranteDashboard() {
        const container = document.getElementById('panel-dashboard');
        if (!container) return;

        const myEvents = state.events.filter(e => e.palestrante_email === state.currentUser.email || e.palestrante === state.currentUser.nome);
        const realizedEvents = state.events.filter(e => e.status === 'Realizado');

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-house"></i> Dashboard do Palestrante</h1>
            </div>

            <div class="evt-create-event-banner-card" onclick="window.switchTab('criar-eventos', true)">
                <div class="evt-create-card-left">
                    <div class="evt-plus-square-icon"><i class="fa-solid fa-plus"></i></div>
                    <div class="evt-create-card-text">
                        <h2>Criar Novo Evento / Capacitação</h2>
                        <p>Publique uma nova palestra, seminário ou curso na plataforma SBPS</p>
                    </div>
                </div>
                <div><i class="fa-solid fa-chevron-right" style="font-size:1.4rem;"></i></div>
            </div>

            <div style="margin-bottom:35px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="color:var(--evt-primary); margin:0;"><i class="fa-solid fa-calendar-check"></i> Eventos Criados</h3>
                    <button class="evt-btn-card-secondary" style="width:auto; padding:6px 14px;" onclick="window.switchTab('meus-eventos', true)">Ver todos os meus eventos <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="evt-card-row-single">
                    ${myEvents.length > 0 ? myEvents.map(e => createEventCardHTML(e, 'palestrante-criado')).join('') : '<p style="color:var(--evt-text-muted);">Você ainda não criou nenhum evento.</p>'}
                </div>
            </div>

            <div style="margin-bottom:35px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="color:var(--evt-primary); margin:0;"><i class="fa-solid fa-circle-check"></i> Eventos que Realizei</h3>
                    <button class="evt-btn-card-secondary" style="width:auto; padding:6px 14px;" onclick="window.switchTab('realizados', true)">Ver todos os eventos realizados <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="evt-card-row-single">
                    ${realizedEvents.length > 0 ? realizedEvents.map(e => createEventCardHTML(e, 'palestrante-realizado')).join('') : '<p style="color:var(--evt-text-muted);">Nenhum evento registrado como realizado.</p>'}
                </div>
            </div>
        `;

        attachCardActionListeners(container);
    }

    function createEventCardHTML(evt, mode) {
        let buttonsHTML = '';
        let dotsMenuHTML = '';

        if (mode === 'disponivel') {
            const isEnrolled = state.enrollments.includes(evt.id);
            buttonsHTML = isEnrolled ?
                `<button class="evt-btn-card-secondary" disabled><i class="fa-solid fa-check"></i> Inscrito</button>` :
                `<button class="evt-btn-card-primary btn-inscrever" data-id="${evt.id}"><i class="fa-solid fa-pen-to-square"></i> Inscrever-se</button>`;
        } else if (mode === 'inscrito') {
            buttonsHTML = `
                <button class="evt-btn-card-primary btn-ver-inscricao" data-id="${evt.id}">Visualizar Inscrição</button>
                <button class="evt-btn-card-danger btn-cancelar-inscricao" data-id="${evt.id}">Cancelar Inscrição</button>
            `;
        } else if (mode === 'participado' || mode === 'palestrante-realizado') {
            buttonsHTML = `
                <button class="evt-btn-card-primary btn-ver-evento" data-id="${evt.id}">Visualizar Evento</button>
                <button class="evt-btn-card-secondary btn-certificado" data-id="${evt.id}">Emitir Certificado</button>
            `;
        } else if (mode === 'palestrante-criado') {
            buttonsHTML = `
                <button class="evt-btn-card-secondary btn-ver-evento" data-id="${evt.id}">Visualizar</button>
                <button class="evt-btn-card-danger btn-cancelar-palestra" data-id="${evt.id}">Cancelar</button>
                <button class="evt-btn-card-primary btn-alterar-palestra" data-id="${evt.id}">Alterar</button>
            `;
        }

        return `
            <div class="evt-event-card" data-id="${evt.id}">
                ${dotsMenuHTML}
                <div class="evt-card-img-wrapper">
                    <img src="${evt.img || '../images/ref1.jpg'}" alt="${evt.titulo}">
                    <span class="evt-badge-tag">${evt.tipo}</span>
                </div>
                <div class="evt-card-body">
                    <div class="evt-card-meta"><i class="fa-solid fa-calendar"></i> ${evt.dateStr}</div>
                    <h4 class="evt-card-title">${evt.titulo}</h4>
                    <p class="evt-card-desc">${evt.resumo}</p>
                    <div class="evt-card-footer-btns">
                        ${buttonsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    function attachCardActionListeners(container) {
        container.querySelectorAll('.btn-inscrever').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                if (!state.enrollments.includes(id)) {
                    state.enrollments.push(id);
                    saveData();
                    showToast('Inscrição realizada com sucesso!');
                    renderTabContent('dashboard');
                }
            };
        });

        container.querySelectorAll('.btn-cancelar-inscricao').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                state.enrollments = state.enrollments.filter(eId => eId !== id);
                saveData();
                showToast('Inscrição cancelada.');
                renderTabContent('inscricoes');
            };
        });

        container.querySelectorAll('.btn-ver-inscricao, .btn-ver-evento').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const evt = state.events.find(e => e.id === id);
                if (evt) alert(`Visualização do Evento: ${evt.titulo}\nData: ${evt.dateStr}\nLocal: ${evt.local}`);
            };
        });

        container.querySelectorAll('.btn-certificado').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const evt = state.events.find(e => e.id === id);
                alert(`Emitindo Certificado Oficial SBPS em PDF para:\n${evt ? evt.titulo : 'Evento SBPS'}`);
            };
        });
    }

    function renderPerfilTab() {
        const container = document.getElementById('panel-perfil');
        if (!container) return;
        const u = state.currentUser;

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-user-gear"></i> Meus Dados Cadastrais</h1>
            </div>
            <div class="evt-auth-card" style="padding:25px;">
                <form id="form-edit-perfil-evt">
                    <div class="evt-grid-2">
                        <div class="evt-form-group evt-full-width">
                            <label>Nome Completo</label>
                            <input type="text" id="edit-evt-nome" class="evt-form-control" value="${u.nome || ''}" required>
                        </div>
                        <div class="evt-form-group">
                            <label>E-mail</label>
                            <input type="email" class="evt-form-control" value="${u.email || ''}" readonly style="background:#F1F5F9;">
                        </div>
                        <div class="evt-form-group">
                            <label>CPF</label>
                            <input type="text" id="edit-evt-cpf" class="evt-form-control" value="${u.cpf || ''}" required>
                        </div>
                    </div>
                    <button type="submit" class="evt-btn-primary" style="width:auto; margin-top:15px;"><i class="fa-solid fa-floppy-disk"></i> Salvar Alterações</button>
                </form>
            </div>
        `;

        document.getElementById('form-edit-perfil-evt').onsubmit = (e) => {
            e.preventDefault();
            u.nome = document.getElementById('edit-evt-nome').value;
            u.cpf = document.getElementById('edit-evt-cpf').value;
            localStorage.setItem('sbps_evt_session', JSON.stringify(u));
            showToast('Perfil atualizado com sucesso!');
        };
    }

    /* ==========================================================================
       LÓGICA DE FILTRAGEM E BUSCA AVANÇADA DE EVENTOS
       ========================================================================== */

    function parseEventPrice(valorStr) {
        if (!valorStr) return 0;
        const str = String(valorStr).toLowerCase();
        if (str.includes('gratuito') && !str.includes('r$')) return 0;
        const match = str.match(/r\$\s*([\d\.\,]+)/i) || str.match(/([\d\.\,]+)/);
        if (match && match[1]) {
            let clean = match[1].replace(/\./g, '').replace(',', '.');
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    }

    function parseEventHours(cargaStr) {
        if (!cargaStr) return 0;
        const match = String(cargaStr).match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    function parseEventShift(dateStr) {
        if (!dateStr) return 'todos';
        const match = String(dateStr).match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const hour = parseInt(match[1], 10);
            if (hour >= 6 && hour < 12) return 'manha';
            if (hour >= 12 && hour < 18) return 'tarde';
            return 'noite';
        }
        return 'todos';
    }

    function parseEventDateObj(dateStr) {
        if (!dateStr) return null;
        const matchBr = String(dateStr).match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (matchBr) {
            return new Date(parseInt(matchBr[3], 10), parseInt(matchBr[2], 10) - 1, parseInt(matchBr[1], 10));
        }
        const matchIso = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
        if (matchIso) {
            return new Date(parseInt(matchIso[1], 10), parseInt(matchIso[2], 10) - 1, parseInt(matchIso[3], 10));
        }
        return null;
    }

    function escapeAttr(str) {
        if (!str) return '';
        return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function filterEventsList(eventsList, filters) {
        if (!filters) return eventsList;

        return eventsList.filter(e => {
            // 1. Pesquisa Inteligente Textual
            if (filters.search && filters.search.trim()) {
                const q = filters.search.trim().toLowerCase();
                const fullText = [
                    e.titulo, e.resumo, e.palestrante, e.local, e.palavraChave, e.area, e.tema, e.tipo
                ].filter(Boolean).join(' ').toLowerCase();

                if (!fullText.includes(q)) return false;
            }

            // 2. Tema
            if (filters.tema && filters.tema !== '') {
                const t = filters.tema.toLowerCase();
                const eTema = (e.tema || e.tipo || '').toLowerCase();
                if (!eTema.includes(t)) return false;
            }

            // 3. Área
            if (filters.area && filters.area !== '') {
                const a = filters.area.toLowerCase();
                const eArea = (e.area || '').toLowerCase();
                if (!eArea.includes(a)) return false;
            }

            // 4. Valor (Preço & Intervalo)
            const price = parseEventPrice(e.valor);
            const isFree = String(e.valor || '').toLowerCase().includes('gratuito') || price === 0;

            if (filters.valorModo === 'gratuito') {
                if (!isFree) return false;
            } else if (filters.valorModo === 'pago') {
                if (isFree) return false;
            } else if (filters.valorModo === 'ate100') {
                if (price > 100) return false;
            } else if (filters.valorModo === '100-300') {
                if (price < 100 || price > 300) return false;
            } else if (filters.valorModo === 'acima300') {
                if (price <= 300) return false;
            } else if (filters.valorModo === 'custom') {
                if (filters.valorMin !== '' && !isNaN(parseFloat(filters.valorMin))) {
                    if (price < parseFloat(filters.valorMin)) return false;
                }
                if (filters.valorMax !== '' && !isNaN(parseFloat(filters.valorMax))) {
                    if (price > parseFloat(filters.valorMax)) return false;
                }
            }

            // 5. Carga Horária
            const hours = parseEventHours(e.cargaHoraria);
            if (filters.carga === 'ate10') {
                if (hours > 10) return false;
            } else if (filters.carga === '10-20') {
                if (hours < 10 || hours > 20) return false;
            } else if (filters.carga === 'acima20') {
                if (hours <= 20) return false;
            }

            // 6. Horário / Turno
            if (filters.shift && filters.shift !== '' && filters.shift !== 'todos') {
                const shift = parseEventShift(e.dateStr);
                if (shift !== filters.shift) return false;
            }

            // 7. Dia / Período
            if (filters.dataPer && filters.dataPer !== '' && filters.dataPer !== 'todos') {
                const evtDate = parseEventDateObj(e.dateStr);
                if (evtDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (filters.dataPer === '7dias') {
                        const nextWeek = new Date(today);
                        nextWeek.setDate(today.getDate() + 7);
                        if (evtDate < today || evtDate > nextWeek) return false;
                    } else if (filters.dataPer === 'este-mes') {
                        if (evtDate.getMonth() !== today.getMonth() || evtDate.getFullYear() !== today.getFullYear()) {
                            return false;
                        }
                    } else if (filters.dataPer === 'especifica' && filters.dateExact) {
                        const selectedDate = parseEventDateObj(filters.dateExact);
                        if (selectedDate) {
                            if (evtDate.getFullYear() !== selectedDate.getFullYear() ||
                                evtDate.getMonth() !== selectedDate.getMonth() ||
                                evtDate.getDate() !== selectedDate.getDate()) {
                                return false;
                            }
                        }
                    }
                }
            }

            return true;
        });
    }

    function renderFilterBarHTML(tabId, totalCount, filteredCount) {
        const f = state.tabFilters[tabId] || { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' };

        const temasSet = new Set(['RGPS', 'RPPS', 'Saúde & Biopsicossocial']);
        const areasSet = new Set(['Direito Previdenciário', 'Perícia Médica', 'Direito Público']);
        state.events.forEach(e => {
            if (e.tema) temasSet.add(e.tema);
            if (e.area) areasSet.add(e.area);
        });

        const isCustomPrice = f.valorModo === 'custom';
        const isExactDate = f.dataPer === 'especifica';

        return `
            <div class="evt-filter-panel" data-tab-id="${tabId}">
                <!-- Barra de Pesquisa Inteligente -->
                <div class="evt-search-box-wrapper">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" class="evt-search-input filter-field" data-field="search" value="${escapeAttr(f.search)}" placeholder="Pesquisa inteligente por título, resumo, palestrante, cidade, palavra-chave...">
                </div>

                <!-- Grid de Filtros Avançados -->
                <div class="evt-filter-grid">
                    <!-- Tema -->
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-tag"></i> Tema</label>
                        <select class="filter-field" data-field="tema">
                            <option value="">Todos os Temas</option>
                            ${Array.from(temasSet).map(t => `<option value="${escapeAttr(t)}" ${f.tema === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Área -->
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-briefcase"></i> Área</label>
                        <select class="filter-field" data-field="area">
                            <option value="">Todas as Áreas</option>
                            ${Array.from(areasSet).map(a => `<option value="${escapeAttr(a)}" ${f.area === a ? 'selected' : ''}>${a}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Valor / Preço -->
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-coins"></i> Valor</label>
                        <select class="filter-field" data-field="valorModo">
                            <option value="">Todos os Valores</option>
                            <option value="gratuito" ${f.valorModo === 'gratuito' ? 'selected' : ''}>Apenas Gratuitos</option>
                            <option value="pago" ${f.valorModo === 'pago' ? 'selected' : ''}>Apenas Pagos</option>
                            <option value="ate100" ${f.valorModo === 'ate100' ? 'selected' : ''}>Até R$ 100,00</option>
                            <option value="100-300" ${f.valorModo === '100-300' ? 'selected' : ''}>R$ 100,00 a R$ 300,00</option>
                            <option value="acima300" ${f.valorModo === 'acima300' ? 'selected' : ''}>Acima de R$ 300,00</option>
                            <option value="custom" ${f.valorModo === 'custom' ? 'selected' : ''}>Intervalo Personalizado...</option>
                        </select>
                    </div>

                    <!-- Intervalo de Valor Personalizado (Min / Max) -->
                    ${isCustomPrice ? `
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-calculator"></i> Faixa (R$ Min - Max)</label>
                        <div class="evt-range-inputs">
                            <input type="number" step="10" class="filter-field" data-field="valorMin" value="${escapeAttr(f.valorMin)}" placeholder="Min (ex: 40)">
                            <span>-</span>
                            <input type="number" step="10" class="filter-field" data-field="valorMax" value="${escapeAttr(f.valorMax)}" placeholder="Max (ex: 80)">
                        </div>
                    </div>
                    ` : ''}

                    <!-- Carga Horária -->
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-clock"></i> Carga Horária</label>
                        <select class="filter-field" data-field="carga">
                            <option value="">Todas as Cargas</option>
                            <option value="ate10" ${f.carga === 'ate10' ? 'selected' : ''}>Até 10 horas</option>
                            <option value="10-20" ${f.carga === '10-20' ? 'selected' : ''}>10h a 20h</option>
                            <option value="acima20" ${f.carga === 'acima20' ? 'selected' : ''}>Acima de 20h</option>
                        </select>
                    </div>

                    <!-- Horário do Evento (Turno) -->
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-business-time"></i> Horário / Turno</label>
                        <select class="filter-field" data-field="shift">
                            <option value="">Todos os Horários</option>
                            <option value="manha" ${f.shift === 'manha' ? 'selected' : ''}>Manhã (06h - 12h)</option>
                            <option value="tarde" ${f.shift === 'tarde' ? 'selected' : ''}>Tarde (12h - 18h)</option>
                            <option value="noite" ${f.shift === 'noite' ? 'selected' : ''}>Noite (18h+)</option>
                        </select>
                    </div>

                    <!-- Dia / Período -->
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-calendar-day"></i> Dia / Período</label>
                        <select class="filter-field" data-field="dataPer">
                            <option value="">Todos os Períodos</option>
                            <option value="7dias" ${f.dataPer === '7dias' ? 'selected' : ''}>Próximos 7 Dias</option>
                            <option value="este-mes" ${f.dataPer === 'este-mes' ? 'selected' : ''}>Este Mês</option>
                            <option value="especifica" ${f.dataPer === 'especifica' ? 'selected' : ''}>Data Específica...</option>
                        </select>
                    </div>

                    ${isExactDate ? `
                    <div class="evt-filter-group">
                        <label><i class="fa-solid fa-calendar-check"></i> Escolher Data</label>
                        <input type="date" class="filter-field" data-field="dateExact" value="${escapeAttr(f.dateExact)}">
                    </div>
                    ` : ''}
                </div>

                <!-- Rodapé dos Filtros -->
                <div class="evt-filter-footer">
                    <span class="evt-results-counter">Exibindo <strong>${filteredCount}</strong> de ${totalCount} evento(s)</span>
                    <button type="button" class="evt-btn-clear-filters btn-clear-tab-filters" data-tab-id="${tabId}">
                        <i class="fa-solid fa-filter-circle-xmark"></i> Limpar Filtros
                    </button>
                </div>
            </div>
        `;
    }

    function attachFilterEventListeners(container, tabId) {
        if (!container) return;

        container.querySelectorAll('.filter-field').forEach(field => {
            const eventName = field.tagName === 'SELECT' || field.type === 'date' || field.type === 'number' ? 'change' : 'input';
            field.addEventListener(eventName, (e) => {
                const fieldName = e.target.getAttribute('data-field');
                state.tabFilters[tabId][fieldName] = e.target.value;
                renderTabContent(tabId);
            });
        });

        const btnClear = container.querySelector('.btn-clear-tab-filters');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                state.tabFilters[tabId] = { search: '', tema: '', area: '', valorModo: '', valorMin: '', valorMax: '', carga: '', shift: '', dataPer: '', dateExact: '' };
                renderTabContent(tabId);
            });
        }
    }

    function renderEventosTab() {
        const container = document.getElementById('panel-eventos');
        if (!container) return;
        const availableEvts = state.events.filter(e => e.status === 'Ativo');
        const filters = state.tabFilters['eventos'];
        const filteredEvts = filterEventsList(availableEvts, filters);

        const filterHTML = renderFilterBarHTML('eventos', availableEvts.length, filteredEvts.length);

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-calendar-days"></i> Todos os Eventos Disponíveis</h1>
            </div>
            ${filterHTML}
            <div class="evt-cards-grid">
                ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'disponivel')).join('') : `
                    <div class="evt-empty-results">
                        <i class="fa-solid fa-calendar-xmark"></i>
                        <h4>Nenhum evento encontrado</h4>
                        <p>Nenhum evento corresponde aos filtros ou pesquisa aplicados.</p>
                    </div>
                `}
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'eventos');
    }

    function renderInscricoesTab() {
        const container = document.getElementById('panel-inscricoes');
        if (!container) return;
        const enrolled = state.events.filter(e => state.enrollments.includes(e.id));
        const filters = state.tabFilters['inscricoes'];
        const filteredEvts = filterEventsList(enrolled, filters);

        const filterHTML = renderFilterBarHTML('inscricoes', enrolled.length, filteredEvts.length);

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-ticket"></i> Minhas Inscrições</h1>
                <button class="evt-btn-card-primary" style="width:auto;" onclick="window.switchTab('eventos', true)"><i class="fa-solid fa-plus"></i> Novas Inscrições</button>
            </div>
            ${filterHTML}
            <div class="evt-cards-grid">
                ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'inscrito')).join('') : `
                    <div class="evt-empty-results">
                        <i class="fa-solid fa-ticket-simple"></i>
                        <h4>Nenhuma inscrição encontrada</h4>
                        <p>Não há inscrições que correspondam aos filtros pesquisados.</p>
                    </div>
                `}
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'inscricoes');
    }

    function renderParticipacoesTab() {
        const container = document.getElementById('panel-participacoes');
        if (!container) return;
        const attended = state.events.filter(e => state.participations.includes(e.id));
        const filters = state.tabFilters['participacoes'];
        const filteredEvts = filterEventsList(attended, filters);

        const filterHTML = renderFilterBarHTML('participacoes', attended.length, filteredEvts.length);

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-award"></i> Minhas Participações</h1>
            </div>
            ${filterHTML}
            <div class="evt-cards-grid">
                ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'participado')).join('') : `
                    <div class="evt-empty-results">
                        <i class="fa-solid fa-award"></i>
                        <h4>Nenhuma participação encontrada</h4>
                        <p>Não foram encontradas participações com os critérios selecionados.</p>
                    </div>
                `}
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'participacoes');
    }

    function renderMeusEventosTab() {
        const container = document.getElementById('panel-meus-eventos');
        if (!container) return;
        const myEvents = state.events.filter(e => e.palestrante_email === state.currentUser.email || e.palestrante === state.currentUser.nome);
        const filters = state.tabFilters['meus-eventos'];
        const filteredEvts = filterEventsList(myEvents, filters);

        const filterHTML = renderFilterBarHTML('meus-eventos', myEvents.length, filteredEvts.length);

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-calendar-check"></i> Meus Eventos Criados</h1>
            </div>
            ${filterHTML}
            <div class="evt-cards-grid">
                ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'palestrante-criado')).join('') : `
                    <div class="evt-empty-results">
                        <i class="fa-solid fa-calendar-minus"></i>
                        <h4>Nenhum evento encontrado</h4>
                        <p>Nenhum dos seus eventos criados corresponde à pesquisa ou filtros.</p>
                    </div>
                `}
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'meus-eventos');
    }

    function renderRealizadosTab() {
        const container = document.getElementById('panel-realizados');
        if (!container) return;
        const realized = state.events.filter(e => e.status === 'Realizado');
        const filters = state.tabFilters['realizados'];
        const filteredEvts = filterEventsList(realized, filters);

        const filterHTML = renderFilterBarHTML('realizados', realized.length, filteredEvts.length);

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-circle-check"></i> Eventos Realizados</h1>
            </div>
            ${filterHTML}
            <div class="evt-cards-grid">
                ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'palestrante-realizado')).join('') : `
                    <div class="evt-empty-results">
                        <i class="fa-solid fa-circle-xmark"></i>
                        <h4>Nenhum evento realizado encontrado</h4>
                        <p>Nenhum evento finalizado corresponde aos filtros selecionados.</p>
                    </div>
                `}
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'realizados');
    }

    function renderComunidadeTab() {
        const container = document.getElementById('panel-comunidade');
        if (!container) return;
        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-users"></i> Comunidade Previdenciária</h1>
                <div class="evt-reputation-badge"><i class="fa-solid fa-star"></i> Reputação: 12 Pontos</div>
            </div>
            <div class="evt-auth-card" style="padding:20px;">
                <h3><i class="fa-solid fa-comments"></i> Fórum da Comunidade</h3>
                <p style="font-size:0.85rem; color:var(--evt-text-muted);">Troca de experiências e debates práticos entre membros e palestrantes.</p>
            </div>
        `;
    }

    function renderSugestoesTab() {
        const container = document.getElementById('panel-sugestoes');
        if (!container) return;
        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-lightbulb"></i> Sugestões & Votação</h1>
            </div>
            <div class="evt-auth-card" style="padding:20px;">
                <h3>Faça sua Sugestão</h3>
                <form id="form-nova-sugestao">
                    <div class="evt-form-group" style="margin-bottom:10px;">
                        <label>Título</label>
                        <input type="text" id="sug-titulo" class="evt-form-control" required>
                    </div>
                    <div class="evt-form-group" style="margin-bottom:10px;">
                        <label>Descrição</label>
                        <textarea id="sug-descricao" class="evt-form-control" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="evt-btn-primary">Enviar Sugestão</button>
                </form>
            </div>
        `;
    }

    function renderAjudaTab() {
        const container = document.getElementById('panel-ajuda');
        if (!container) return;
        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-circle-question"></i> Central de Ajuda</h1>
            </div>
            <div class="evt-auth-card" style="padding:20px;">
                <h3>Canais de Atendimento</h3>
                <p>E-mail: suporte@sbps.org.br | Whats: (00) 90000-0000</p>
            </div>
        `;
    }

    function handleNovaSugestao(e) {
        e.preventDefault();
        showToast('Sugestão enviada!');
    }

    function handleCriarEvento(e) {
        e.preventDefault();
        
        // 1. Coletar dados
        const titulo = document.getElementById('create-evt-titulo').value;
        const carga = document.getElementById('create-evt-carga').value;
        const dataStr = document.getElementById('create-evt-data').value;
        const palavra = document.getElementById('create-evt-palavra').value;
        const local = document.getElementById('create-evt-local').value;
        const taxas = document.getElementById('create-evt-taxas').value;
        
        // 2. Formatar a data se vier YYYY-MM-DD para DD/MM/YYYY
        let dataFormatada = dataStr;
        if (dataStr && dataStr.includes('-')) {
            const partes = dataStr.split('-');
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        
        // 3. Preencher Modal
        document.getElementById('resumo-evt-titulo').textContent = titulo;
        document.getElementById('resumo-evt-carga').textContent = carga;
        document.getElementById('resumo-evt-data').textContent = dataFormatada;
        document.getElementById('resumo-evt-palavra').textContent = palavra;
        document.getElementById('resumo-evt-local').textContent = local;
        document.getElementById('resumo-evt-taxas').textContent = taxas;
        
        // 4. Mostrar Modal
        document.getElementById('evt-modal-confirmar-evento').style.display = 'flex';
        
        // 5. Configurar Botão Confirmar
        const btnConfirmar = document.getElementById('btn-confirmar-publicacao');
        // Evitar múltiplos listeners ao abrir e fechar o modal várias vezes
        btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
        
        document.getElementById('btn-confirmar-publicacao').addEventListener('click', async function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';
            this.disabled = true;
            
            const payload = {
                nome_evento: titulo,
                carga_horaria: Number(carga),
                data: dataFormatada,
                palavra_chave: palavra
            };
            
            try {
                await fetch('https://n8n-motaadv.duckdns.org/webhook/cria-evento', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                // Sucesso
                const novo = {
                    id: 'evt-' + Date.now(),
                    titulo, 
                    dateStr: dataFormatada, 
                    cargaHoraria: carga + 'h',
                    palestrante: state.currentUser.nome, 
                    status: 'Ativo', 
                    tipo: 'curso presencial',
                    resumo: 'Novo evento publicado e sincronizado.',
                    local: local,
                    valor: taxas === '0' || taxas === '0.00' ? 'Gratuito' : 'R$ ' + taxas
                };
                state.events.push(novo);
                saveData();
                showToast('Evento publicado com sucesso!');
                
                document.getElementById('evt-modal-confirmar-evento').style.display = 'none';
                document.getElementById('form-criar-evento-palestrante').reset();
                switchTab('meus-eventos', true);
            } catch (err) {
                console.error(err);
                showToast('Erro ao comunicar com o sistema. Tente novamente.');
            } finally {
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }

    async function handleAiSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('ai-input-text');
        const box = document.getElementById('ai-messages-list');
        const form = document.getElementById('form-ai-chat');
        if (!input || !box || !input.value.trim()) return;

        const userQuestion = input.value.trim();
        input.value = '';

        // Adiciona a mensagem enviada pelo usuário no chat
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'evt-chat-msg sent';
        userMsgDiv.textContent = userQuestion;
        box.appendChild(userMsgDiv);
        box.scrollTop = box.scrollHeight;

        // Adiciona indicador visual de carregamento / digitando
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'evt-chat-msg received';
        loadingDiv.id = 'ai-loading-indicator';
        loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Digitando resposta...';
        box.appendChild(loadingDiv);
        box.scrollTop = box.scrollHeight;

        // Desabilita input e botão enquanto aguarda resposta
        input.disabled = true;
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        if (submitBtn) submitBtn.disabled = true;

        const sessionId = getOrCreateChatSessionId();
        const currentUser = state.currentUser || {};
        const userId = currentUser.email || currentUser.cpf || sessionId;

        const payload = {
            pergunta: userQuestion,
            sessionId: sessionId,
            userId: userId
        };
        if (currentUser.nome) payload.user_name = currentUser.nome;
        if (currentUser.email) payload.user_email = currentUser.email;

        try {
            const response = await fetch('https://n8n-motaadv.duckdns.org/webhook/mensagem-de-entrada', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const currentLoading = document.getElementById('ai-loading-indicator');
            if (currentLoading) currentLoading.remove();

            if (!response.ok) {
                let errDetail = '';
                try { errDetail = await response.text(); } catch (_) {}
                throw new Error(`Erro HTTP ${response.status}: ${errDetail}`);
            }

            let responseData;
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            const aiText = parseAiWebhookResponse(responseData);

            const aiMsgDiv = document.createElement('div');
            aiMsgDiv.className = 'evt-chat-msg received';
            aiMsgDiv.innerHTML = formatAiResponseContent(aiText);
            box.appendChild(aiMsgDiv);
        } catch (err) {
            console.error('Erro na resposta do chatbot:', err);
            const currentLoading = document.getElementById('ai-loading-indicator');
            if (currentLoading) currentLoading.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'evt-chat-msg received';
            errorDiv.style.borderLeft = '3px solid #ef4444';
            errorDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i> Ocorreu um erro ao comunicar com a IA. Certifique-se de que o fluxo n8n esteja ativo e tente novamente.';
            box.appendChild(errorDiv);
        } finally {
            input.disabled = false;
            if (submitBtn) submitBtn.disabled = false;
            input.focus();
            box.scrollTop = box.scrollHeight;
        }
    }

    function getOrCreateChatSessionId() {
        let sId = localStorage.getItem('sbps_chat_session_id');
        if (!sId) {
            sId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('sbps_chat_session_id', sId);
        }
        return sId;
    }

    function parseAiWebhookResponse(data) {
        if (!data) return "Desculpe, não recebi uma resposta válida do servidor.";
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return parseAiWebhookResponse(parsed);
            } catch (e) {
                return data;
            }
        }
        if (Array.isArray(data)) {
            if (data.length === 0) return "Nenhuma resposta retornada do fluxo.";
            return parseAiWebhookResponse(data[0]);
        }
        if (typeof data === 'object') {
            if (data.resposta) return data.resposta;
            if (data.output) return data.output;
            if (data.response) return data.response;
            if (data.text) return data.text;
            if (data.mensagem) return data.mensagem;
            if (data.message) return data.message;
            if (data.result) return data.result;
            if (data.data) return parseAiWebhookResponse(data.data);
            if (data.body) return parseAiWebhookResponse(data.body);

            const keys = Object.keys(data);
            if (keys.length === 1 && typeof data[keys[0]] === 'string') {
                return data[keys[0]];
            }
            return JSON.stringify(data, null, 2);
        }
        return String(data);
    }

    function formatAiResponseContent(text) {
        if (!text) return '';
        let escaped = String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Format **bold**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Format *italic*
        escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Convert newlines to <br>
        escaped = escaped.replace(/\n/g, '<br>');

        return escaped;
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed; bottom:25px; left:50%; transform:translateX(-50%); background:#0F3B5F; color:#fff; padding:10px 22px; border-radius:25px; font-weight:700; font-size:0.85rem; z-index:9999; box-shadow:0 8px 20px rgba(0,0,0,0.3);';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    window.switchTab = switchTab;

})();
