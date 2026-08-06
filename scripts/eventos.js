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
        userVotes: {}
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

    function renderEventosTab() {
        const container = document.getElementById('panel-eventos');
        if (!container) return;
        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-calendar-days"></i> Todos os Eventos Disponíveis</h1>
            </div>
            <div class="evt-cards-grid">
                ${state.events.map(e => createEventCardHTML(e, 'disponivel')).join('')}
            </div>
        `;
        attachCardActionListeners(container);
    }

    function renderInscricoesTab() {
        const container = document.getElementById('panel-inscricoes');
        if (!container) return;
        const enrolled = state.events.filter(e => state.enrollments.includes(e.id));

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-ticket"></i> Minhas Inscrições</h1>
                <button class="evt-btn-card-primary" style="width:auto;" onclick="window.switchTab('eventos', true)"><i class="fa-solid fa-plus"></i> Novas Inscrições</button>
            </div>
            <div class="evt-cards-grid">
                ${enrolled.length > 0 ? enrolled.map(e => createEventCardHTML(e, 'inscrito')).join('') : '<p style="color:var(--evt-text-muted);">Nenhuma inscrição ativa.</p>'}
            </div>
        `;
        attachCardActionListeners(container);
    }

    function renderParticipacoesTab() {
        const container = document.getElementById('panel-participacoes');
        if (!container) return;
        const attended = state.events.filter(e => state.participations.includes(e.id));

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-award"></i> Minhas Participações</h1>
            </div>
            <div class="evt-cards-grid">
                ${attended.length > 0 ? attended.map(e => createEventCardHTML(e, 'participado')).join('') : '<p style="color:var(--evt-text-muted);">Nenhum histórico de participação concluída.</p>'}
            </div>
        `;
        attachCardActionListeners(container);
    }

    function renderMeusEventosTab() {
        const container = document.getElementById('panel-meus-eventos');
        if (!container) return;
        const myEvents = state.events.filter(e => e.palestrante_email === state.currentUser.email || e.palestrante === state.currentUser.nome);

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-calendar-check"></i> Meus Eventos Criados</h1>
            </div>
            <div class="evt-cards-grid">
                ${myEvents.length > 0 ? myEvents.map(e => createEventCardHTML(e, 'palestrante-criado')).join('') : '<p style="color:var(--evt-text-muted);">Você não tem eventos criados.</p>'}
            </div>
        `;
        attachCardActionListeners(container);
    }

    function renderRealizadosTab() {
        const container = document.getElementById('panel-realizados');
        if (!container) return;
        const realized = state.events.filter(e => e.status === 'Realizado');

        container.innerHTML = `
            <div class="evt-page-header">
                <h1 class="evt-page-title"><i class="fa-solid fa-circle-check"></i> Eventos Realizados</h1>
            </div>
            <div class="evt-cards-grid">
                ${realized.length > 0 ? realized.map(e => createEventCardHTML(e, 'palestrante-realizado')).join('') : '<p style="color:var(--evt-text-muted);">Nenhum evento finalizado.</p>'}
            </div>
        `;
        attachCardActionListeners(container);
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

    function handleAiSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('ai-input-text');
        const box = document.getElementById('ai-messages-list');
        if (!input || !box || !input.value.trim()) return;

        box.innerHTML += `<div class="evt-chat-msg sent">${input.value}</div>`;
        input.value = '';
        setTimeout(() => {
            box.innerHTML += `<div class="evt-chat-msg received">Sou o assistente IA da SBPS. Como posso ajudar com seus eventos?</div>`;
            box.scrollTop = box.scrollHeight;
        }, 500);
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
