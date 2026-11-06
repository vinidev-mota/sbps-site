/* ==========================================================================
   Área do Associado - SBPS JavaScript Engine
   ========================================================================== */

// Definições Globais de Navegação Imediata (Resiliente a qualquer ordem de carregamento)
const TAB_TITLES = {
    'dashboard': 'Visão Geral',
    'perfil': '1. Perfil',
    'beneficios': '2. Benefícios',
    'atalhos': '3. Atalhos',
    'cursos': '4. Cursos',
    'seminarios': '5. Seminários',
    'certificados': '6. Certificados',
    'templates': '7. Templates',
    'livraria': '8. Livraria',
    'outros': '9. Outros & Ajuda'
};

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function syncSidebarNavState(activeTabId) {
    document.querySelectorAll('.nav-item').forEach(btn => {
        const isActive = btn.dataset.tab === activeTabId;
        if (isActive) {
            btn.classList.remove('text-slate-400');
            btn.classList.add('text-slate-800', 'bg-slate-100');
        } else {
            btn.classList.remove('text-slate-800', 'bg-slate-100');
            btn.classList.add('text-slate-400');
        }
    });
}

window.openModal = function(title, description) {
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');
    const modalEl = document.getElementById('actionModal');
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description;
    if (modalEl) modalEl.classList.remove('hidden');
};

window.closeModal = function() {
    const modalEl = document.getElementById('actionModal');
    if (modalEl) modalEl.classList.add('hidden');
};

window.toggleChatSidebar = function() {
    const drawer = document.getElementById('chatDrawer');
    if (drawer) drawer.classList.toggle('translate-x-full');
};

window.sendChatMessage = function(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const container = document.getElementById('chatMessages');
    if (!container) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'flex justify-end';
    const bubble = document.createElement('div');
    bubble.className = 'bg-emerald-700 text-white p-2.5 rounded-2xl rounded-tr-none text-xs max-w-[85%]';
    bubble.textContent = text;
    userMsg.appendChild(bubble);
    container.appendChild(userMsg);
    input.value = '';

    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'flex items-start gap-2';
        botMsg.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]">S</div>
          <div class="bg-white p-2.5 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-700 shadow-sm">
            Mensagem registrada! Um consultor SBPS entrará em contato em instantes.
          </div>
        `;
        container.appendChild(botMsg);
    }, 600);
};

window.showToast = function(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    if (toast._hideTimer) clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
};

window.showToastMessage = window.showToast;

window.togglePasswordVisibility = function(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button ? button.querySelector('i') : null;
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
};

window.setActiveNav = function(element, title) {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('text-slate-800', 'bg-slate-100');
        btn.classList.add('text-slate-400');
    });
    if (element) {
        element.classList.remove('text-slate-400');
        element.classList.add('text-slate-800', 'bg-slate-100');
    }
    if (title) window.showToast('Visualizando: ' + title);
};

window.addEventListener('click', (event) => {
    const modal = document.getElementById('actionModal');
    if (modal && event.target === modal) {
        window.closeModal();
    }
});

window.switchTab = function(tabId, tabTitle, fromPopState = false) {
    if (!tabId) return;

    if (tabId === 'dashboard') {
        window.showDashboard();
        return;
    }

    const authContainer = document.getElementById('auth-container');
    const memberContent = document.getElementById('member-content');
    if (authContainer) authContainer.style.display = 'none';
    if (memberContent) memberContent.style.display = 'block';

    // Hide Dashboard
    const dashboardView = document.getElementById('dashboard-view');
    if (dashboardView) dashboardView.style.display = 'none';

    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
    });

    // Show selected panel
    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.style.display = 'block';
    }

    const backBtn = document.getElementById('btn-back-dashboard');
    if (backBtn) backBtn.style.display = 'inline-flex';

    const currentPageBreadcrumb = document.getElementById('breadcrumb-current');
    const titleToUse = tabTitle || TAB_TITLES[tabId] || tabId;
    if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = titleToUse;

    syncSidebarNavState(tabId);

    // Update active state in quick dropdown
    document.querySelectorAll('.quick-menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });

    // Update hash in URL
    if (!fromPopState && window.location.hash !== `#${tabId}`) {
        history.pushState({ internal: true, tab: tabId }, '', `#${tabId}`);
    }

    if (tabId === 'templates' && typeof window.renderTemplates === 'function') window.renderTemplates();

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const quickMenuDropdown = document.getElementById('quick-menu-dropdown');
    if (quickMenuDropdown) quickMenuDropdown.classList.remove('show');
};

window.showDashboard = function(fromPopState = false) {
    const authContainer = document.getElementById('auth-container');
    const memberContent = document.getElementById('member-content');
    if (authContainer) authContainer.style.display = 'none';
    if (memberContent) memberContent.style.display = 'block';

    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
    });

    const dashboardView = document.getElementById('dashboard-view');
    if (dashboardView) dashboardView.style.display = 'block';

    const backBtn = document.getElementById('btn-back-dashboard');
    if (backBtn) backBtn.style.display = 'none';

    const currentPageBreadcrumb = document.getElementById('breadcrumb-current');
    if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = 'Visão Geral';

    syncSidebarNavState('dashboard');

    document.querySelectorAll('.quick-menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === 'dashboard');
    });

    if (!fromPopState && window.location.hash !== '#dashboard') {
        history.pushState({ internal: true, tab: 'dashboard' }, '', '#dashboard');
    }

    const quickMenuDropdown = document.getElementById('quick-menu-dropdown');
    if (quickMenuDropdown) quickMenuDropdown.classList.remove('show');
};

window.goBack = function() {
    if (window.history.state && window.history.state.internal) {
        history.back();
    } else {
        window.showDashboard();
    }
};

window.logoutAssociado = function() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.confirmLogout = function() {
    localStorage.removeItem('sbps_associado_user');
    currentUser = null;
    const authContainer = document.getElementById('auth-container');
    const memberContent = document.getElementById('member-content');
    if (authContainer) authContainer.style.display = 'block';
    if (memberContent) memberContent.style.display = 'none';
    const modal = document.getElementById('logout-modal');
    if (modal) modal.style.display = 'none';
};

window.cancelLogout = function() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.leaveArea = function() {
    window.location.href = '../index.html';
};

window.toggleDocApoioCollapse = function () {
    const banner = document.getElementById('doc-apoio-folder-banner');
    const content = document.getElementById('doc-apoio-content');
    const toggleText = document.getElementById('doc-toggle-text');
    const chevron = document.getElementById('doc-toggle-chevron');
    const icon = document.getElementById('doc-folder-main-icon');

    if (!content) return;

    const isOpen = content.style.display !== 'none';
    if (isOpen) {
        content.style.display = 'none';
        if (banner) banner.classList.remove('is-open');
        if (toggleText) toggleText.textContent = 'Abrir Documentos';
        if (chevron) {
            chevron.classList.remove('fa-chevron-up');
            chevron.classList.add('fa-chevron-down');
        }
        if (icon) {
            icon.classList.remove('fa-folder-open');
            icon.classList.add('fa-folder');
        }
    } else {
        content.style.display = 'block';
        if (banner) banner.classList.add('is-open');
        if (toggleText) toggleText.textContent = 'Recolher Documentos';
        if (chevron) {
            chevron.classList.remove('fa-chevron-down');
            chevron.classList.add('fa-chevron-up');
        }
        if (icon) {
            icon.classList.remove('fa-folder');
            icon.classList.add('fa-folder-open');
        }
    }
};

window.addEventListener('popstate', (e) => {
    const hash = window.location.hash.substring(1);
    if (!hash || hash === 'dashboard') {
        window.showDashboard(true);
    } else if (TAB_TITLES[hash]) {
        window.switchTab(hash, TAB_TITLES[hash], true);
    }
});

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

    // Sessão padrão para testes e navegação imediata
    function ensureActiveSession() {
        if (!currentUser) {
            currentUser = {
                nome: 'Thiago',
                cpf: '123.456.789-00',
                rg: '12.345.678-9',
                nascimento: '1990-05-15',
                genero: 'Masculino',
                profissao: 'Advogado(a) Previdenciarista',
                origem_sbps: 'Indicação',
                celular: '(11) 98765-4321',
                fixo: '(11) 3456-7890',
                recado: '',
                email: 'thiago@sbps.org.br',
                email_secundario: '',
                cep: '01310-100',
                logradouro: 'Avenida Paulista',
                numero: '1000',
                complemento: 'Conjunto 501',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                uf: 'SP',
                login_usuario: 'thiago',
                status: 'Ativo'
            };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
        }
        updateUserBadges();
        renderUserData();
    }

    if (currentUser) {
        updateUserBadges();
        renderUserData();
    }

    let memberShortcuts = [];
    let enrolledCourses = [];
    let enrolledSeminars = [];
    let activeTickets = [];
    let authorBooks = [];

    try {
        memberShortcuts = JSON.parse(localStorage.getItem(STORAGE_KEY_SHORTCUTS)) || [
            { id: 1, title: 'Calculadora de Benefícios INSS', url: '#templates', icon: 'fa-solid fa-calculator' },
            { id: 2, title: 'Estatuto Social SBPS', url: 'estatuto.html', icon: 'fa-solid fa-file-contract' },
            { id: 3, title: 'Vitrine de Autores', url: '#livraria', icon: 'fa-solid fa-book-open' }
        ];
    } catch (e) { console.error(e); }

    try { enrolledCourses = JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES)) || []; } catch (e) {}
    try { enrolledSeminars = JSON.parse(localStorage.getItem(STORAGE_KEY_SEMINARS)) || []; } catch (e) {}
    try { activeTickets = JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS)) || []; } catch (e) {}
    try {
        authorBooks = JSON.parse(localStorage.getItem(STORAGE_KEY_AUTHOR_BOOKS)) || [
            { title: 'Reforma Previdenciária Prática', autor: 'Dr. Carlos Eduardo', preco: 'R$ 65,00', desc: 'Guia definitivo de transição e cálculos.' },
            { title: 'Aposentadoria Biopsicossocial', autor: 'Dra. Mariana Costa', preco: 'R$ 80,00', desc: 'Avaliação em PCD e laudos periciais.' }
        ];
    } catch (e) {}

    // --------------------------------------------------------------------------
    // 8. Aba Templates Hub (Estilo Canva para Documentos Advocatícios)
    // --------------------------------------------------------------------------
    var realTemplatesData = {
        'ementa-padrao': {
            id: 'ementa-padrao',
            title: 'EMENTA-PADRÃO',
            filename: 'EMENTA-PADRÃO.docx',
            filePath: '../templates/EMENTA-PADRÃO.docx',
            fileSize: '238 KB',
            cat: 'pecas',
            formats: ['DOCX'],
            desc: 'Estrutura técnica padronizada para ementas jurídicas e acórdãos com divisão em Caso em Exame, Questão em Discussão, Razões de Decidir e Dispositivo.',
            paragraphs: [
                { type: 'title', text: 'EMENTA-PADRÃO' },
                { type: 'lead', text: 'Ementa: Ramo do Direito. Classe processual. Frase ou palavras que indiquem o assunto principal. Conclusão.' },
                { type: 'section', text: 'I. Caso em exame' },
                { type: 'p', text: '1. Apresentação do caso, com a indicação dos fatos relevantes, do pedido principal da ação ou do recurso e, se for o caso, da decisão recorrida.' },
                { type: 'section', text: 'II. Questão em discussão' },
                { type: 'p', text: '2. A questão em discussão consiste em (...). / Há duas questões em discussão: (i) saber se (...); e (ii) saber se (...). (incluir todas as questões, com os seus respectivos fatos e fundamentos, utilizando-se de numeração em romano, letras minúsculas e entre parênteses).' },
                { type: 'section', text: 'III. Razões de decidir' },
                { type: 'p', text: '3. Exposição do fundamento de maneira resumida (cada fundamento deve integrar um item).' },
                { type: 'p', text: '4. Exposição de outro fundamento de maneira resumida.' },
                { type: 'section', text: 'IV. Dispositivo e tese' },
                { type: 'p', text: '5. Ex: Pedido procedente/improcedente. Recurso provido/desprovido.' },
                { type: 'quote', text: 'Tese de julgamento: frases objetivas das conclusões da decisão, ordenadas por numerais cardinais entre aspas e sem itálico. “1. [texto da tese]. 2. [texto da tese]” (quando houver tese).' },
                { type: 'hr', text: '' },
                { type: 'meta', text: 'Dispositivos relevantes citados: ex.: CF/1988, art. 1º, III e IV; CC, arts. 1.641, II, e 1.639, § 2º.' },
                { type: 'meta', text: 'Jurisprudência relevante citada: ex.: STF, ADPF nº 130, Rel. Min. Ayres Britto, Plenário, j. 30.04.2009.' }
            ]
        },
        'procuracao-geral': {
            id: 'procuracao-geral',
            title: 'Procuração - Geral',
            filename: 'Procuração - Geral.docx',
            filePath: '../templates/Procuração - Geral.docx',
            fileSize: '7.5 KB',
            cat: 'docs',
            formats: ['DOCX'],
            desc: 'Instrumento particular de mandato com poderes ad judicia e cláusula extrajudicial completa para representação previdenciária e administrativa.',
            paragraphs: [
                { type: 'title', text: 'PROCURAÇÃO' },
                { type: 'section', text: 'OUTORGANTE:' },
                { type: 'field', text: 'Nome: __________________________________________________________________________' },
                { type: 'field', text: 'Nacionalidade: _______________________ Estado Civil: _________________________________' },
                { type: 'field', text: 'RG: ______________ SSP: _________ CPF: ___________________________________________' },
                { type: 'field', text: 'Endereço: _______________________________________________________________________' },
                { type: 'field', text: 'Cidade: __________________________ Unidade Federativa: ________________ CEP: _________' },
                { type: 'field', text: 'Profissão: ________________________ Telefone (s) : ____________________________________' },
                { type: 'field', text: 'E-mail:__________________________________________________________________________' },
                { type: 'blank', text: '' },
                { type: 'p', text: 'OUTORGADOS: Os advogados [NOME], brasileira, casada, OAB/DF xx.xxx, [NOME], brasileiro, casado, OAB/DF x.xxx-x, [NOME], brasileiro, solteiro, OAB/DF xx.xxx, todos com endereço profissional em [ENDEREÇO COMPLETO], CEP: 00000-000.' },
                { type: 'blank', text: '' },
                { type: 'p', text: 'PODERES: O (a) OUTORGANTE nomeia e constitui em caráter irrevogável e irretratável os OUTORGADOS, conferindo-lhes poderes para sua representação judicial nos autos do processo NNNNNNN-DD.AAAA.J.TR.OOOO, que tramita na [Seção Judiciária Correspondente], bem como os poderes contidos na cláusula “[EXEMPLO]”, e mais os especiais para confessar, acordar, desistir, transigir, firmar compromisso, reconvir, contestar, receber e dar quitação, levantar e receber precatório e/ou requisição de pequeno valor e propor ação rescisória, podendo os mesmos atuarem em conjunto ou individualmente, em qualquer instância administrativa ou do Poder Judiciário, em defesa dos interesses do outorgante, bem como o que for preciso para o bom e fiel desempenho das obrigações decorrentes deste instrumento, podendo substabelecê-lo, com ou sem reserva de poderes.' },
                { type: 'blank', text: '' },
                { type: 'date', text: '________________________, ____ de ____________________, de 20__' },
                { type: 'sign', text: '_____________________________________________________________\nAssinatura' }
            ]
        }
    };

    var mockTemplates = [
        {
            id: 'ementa-padrao',
            title: 'EMENTA-PADRÃO',
            filename: 'EMENTA-PADRÃO.docx',
            filePath: '../templates/EMENTA-PADRÃO.docx',
            cat: 'pecas',
            formats: ['DOCX'],
            isReal: true,
            desc: 'Modelo oficial de ementa jurídica com padronização técnica de caso, questão, fundamentação e tese.'
        },
        {
            id: 'procuracao-geral',
            title: 'Procuração - Geral',
            filename: 'Procuração - Geral.docx',
            filePath: '../templates/Procuração - Geral.docx',
            cat: 'docs',
            formats: ['DOCX'],
            isReal: true,
            desc: 'Instrumento completo de mandato ad judicia e extrajudicial para atuação perante a Justiça e o INSS.'
        },
        { id: 1, title: 'Petição Inicial - Concessão de Aposentadoria por Idade', cat: 'pecas', formats: ['DOCX', 'TXT', 'PDF'], desc: 'Peça pronta e fundamentada com pedidos de benefício urbano/rural.' },
        { id: 2, title: 'Contestação Previdenciária - Acidente de Trabalho', cat: 'pecas', formats: ['DOCX', 'PDF'], desc: 'Peça com teses técnicas periciais e nexo de causalidade ocupacional.' },
        { id: 3, title: 'Ata de Assembleia Geral Extraordinária', cat: 'docs', formats: ['DOCX', 'TXT'], desc: 'Minuta formal de deliberação para entidades e sindicatos.' },
        { id: 5, title: 'Planilha de Cálculo de Liquidação de Sentença RMI', cat: 'planilhas', formats: ['XLSX', 'CSV'], desc: 'Planilha automatizada com índices de correção monetária previdenciária.' },
        { id: 6, title: 'Logotipo Genérico & Identidade Visual de Escritório', cat: 'design', formats: ['PNG', 'PDF'], desc: 'Kit de identidade visual vetorizado para advogados previdenciaristas.' }
    ];

    var currentTemplateCategory = 'all';

    var mockCourses = [
        { id: 1, title: 'Planejamento Previdenciário Integrado - Método 4x4', professor: 'Prof. Carlos Santos', horas: '40h', materia: 'Previdenciário RGPS', precoOriginal: 'R$ 690,00', precoAssociado: 'R$ 290,00', img: '../images/ref2.jpg' },
        { id: 2, title: 'Avaliação Biopsicossocial na Aposentadoria PCD', professor: 'Dra. Juliana Mendes', horas: '24h', materia: 'Saúde & Biopsicossocial', precoOriginal: 'R$ 450,00', precoAssociado: 'R$ 180,00', img: '../images/ref1.jpg' },
        { id: 3, title: 'Cálculos Previdenciários de RMI e Revisões', professor: 'Dr. Roberto Lima', horas: '30h', materia: 'Cálculos', precoOriginal: 'R$ 550,00', precoAssociado: 'R$ 220,00', img: '../images/ref3.png' }
    ];

    var mockSeminars = [
        { id: 101, title: 'Congresso Brasileiro de Direito Previdenciário 2026', palestrante: 'Painel de Especialistas SBPS', horas: '16h', tema: 'Geral', precoOriginal: 'R$ 380,00', precoAssociado: 'R$ 120,00', img: '../images/capa-sociedade.png' },
        { id: 102, title: 'Seminário de Reformas Previdenciárias Estaduais', palestrante: 'Dr. Fernando Oliveira', horas: '12h', tema: 'Regimes Próprios (RPPS)', precoOriginal: 'R$ 300,00', precoAssociado: 'R$ 90,00', img: '../images/capa.jpg' }
    ];

    var courseFilterSearch = '';
    var courseFilterMateria = 'Todas as Matérias';
    var courseFilterHoras = 'Qualquer Carga Horária';
    var seminarFilterSearch = '';
    var seminarFilterArea = 'Todas as Áreas';

    // Initialize User Interface
    try { initAuth(); } catch (e) { console.error('initAuth:', e); }
    try { initViaCEP(); } catch (e) { console.error('initViaCEP:', e); }
    try { initNavigation(); } catch (e) { console.error('initNavigation:', e); }
    try { renderUserData(); } catch (e) { console.error('renderUserData:', e); }
    try { renderShortcuts(); } catch (e) { console.error('renderShortcuts:', e); }
    try { renderCourses(); } catch (e) { console.error('renderCourses:', e); }
    try { renderSeminars(); } catch (e) { console.error('renderSeminars:', e); }
    try { renderCertificates(); } catch (e) { console.error('renderCertificates:', e); }
    try { renderTemplates(); } catch (e) { console.error('renderTemplates:', e); }
    try { renderLivraria(); } catch (e) { console.error('renderLivraria:', e); }
    try { renderAjudaSupport(); } catch (e) { console.error('renderAjudaSupport:', e); }

    // Check initial hash in URL
    if (window.location.hash && window.location.hash.length > 1) {
        const initialTab = window.location.hash.substring(1);
        if (initialTab !== 'dashboard' && TAB_TITLES[initialTab]) {
            window.switchTab(initialTab, TAB_TITLES[initialTab]);
        }
    }

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
        const btnQuickGuest = document.getElementById('btn-quick-guest-login');

        // Botão de Acesso Rápido às Abas (1 clique)
        if (btnQuickGuest) {
            btnQuickGuest.addEventListener('click', (e) => {
                e.preventDefault();
                ensureActiveSession();
                if (authContainer) authContainer.style.display = 'none';
                if (memberContent) memberContent.style.display = 'block';
                window.showDashboard();
                // Toast removido
            });
        }

        if (currentUser && currentUser.email) {
            if (authContainer) authContainer.style.display = 'none';
            if (memberContent) memberContent.style.display = 'block';
            updateUserBadges();
        } else {
            if (authContainer) authContainer.style.display = 'block';
            if (memberContent) memberContent.style.display = 'none';
        }

        // Tab Switching in Auth (Expande o formulário para a tela toda do desktop no cadastro)
        const authWrapper = authContainer ? authContainer.querySelector('.auth-wrapper') : null;
        if (loginTabBtn && registerTabBtn) {
            loginTabBtn.addEventListener('click', () => {
                loginTabBtn.classList.add('active');
                registerTabBtn.classList.remove('active');
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                if (authWrapper) authWrapper.classList.remove('register-expanded');
            });

            registerTabBtn.addEventListener('click', () => {
                registerTabBtn.classList.add('active');
                loginTabBtn.classList.remove('active');
                if (registerForm) registerForm.style.display = 'block';
                if (loginForm) loginForm.style.display = 'none';
                if (authWrapper) authWrapper.classList.add('register-expanded');
            });
        }

        // Logout
        document.querySelectorAll('.btn-logout').forEach(btn => {
            btn.addEventListener('click', () => {
                window.logoutAssociado();
            });
        });

        // Submit Login (Supabase Auth com suporte a E-mail, Login ou CPF e Fallback)
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
                if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

                let loginSuccess = false;
                if (window.SBPS_Supabase) {
                    try {
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
                                status: res.profile.status || 'Ativo',
                                pagamento_status: res.profile.pagamento_status || 'Pendente',
                                dois_fatores_sempre: !!res.profile.dois_fatores_sempre
                            };

                            // Se a taxa de associação estiver pendente, direcionar para o pagamento
                            if (currentUser.pagamento_status !== 'Aprovado') {
                                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                                if (typeof window.openPaymentModal === 'function') {
                                    window.openPaymentModal(currentUser);
                                }
                                if (typeof showToastMessage === 'function') {
                                    showToastMessage('Sua anuidade SBPS (R$ 100,00) está pendente. Conclua o pagamento para liberar seu acesso.');
                                }
                                loginSuccess = true;
                                if (btn) btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Acessar Portal';
                                return;
                            }

                            // VERIFICAÇÃO DE DISPOSITIVO CONFIÁVEL & 2FA (FASE 4)
                            let isTrusted = false;
                            if (window.SBPS_Supabase) {
                                const trustRes = await window.SBPS_Supabase.checkTrustedDevice(currentUser.email);
                                isTrusted = !!(trustRes && trustRes.confiavel);
                            } else {
                                const localExp = localStorage.getItem('sbps_trusted_' + currentUser.email.toLowerCase());
                                isTrusted = localExp && Number(localExp) > Date.now();
                            }

                            if (!isTrusted) {
                                pending2faUser = currentUser;
                                let otpRes = { codigo: Math.floor(100000 + Math.random() * 900000).toString() };
                                if (window.SBPS_Supabase) {
                                    otpRes = await window.SBPS_Supabase.generateOtp(currentUser.email, 'login_2fa');
                                }
                                open2faLoginModal(currentUser.email, otpRes.codigo);
                                loginSuccess = true;
                                if (btn) btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Acessar Portal';
                                return;
                            }

                            // Dispositivo é confiável: renova validade de 7 dias e efetua login direto
                            if (window.SBPS_Supabase) {
                                window.SBPS_Supabase.registerTrustedDevice(currentUser.email);
                            }
                            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

                            authContainer.style.display = 'none';
                            memberContent.style.display = 'block';
                            updateUserBadges();
                            renderUserData();
                            renderCertificates();
                            loginSuccess = true;
                        }
                    } catch (authErr) {
                        console.warn('Erro ao autenticar no Supabase, usando sessão local:', authErr);
                    }
                }

                if (btn) btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Acessar Portal';

                if (!loginSuccess) {
                    const localRaw = localStorage.getItem(STORAGE_KEY_USER);
                    if (localRaw) {
                        try {
                            const localUser = JSON.parse(localRaw);
                            const cleanInput = userInput.trim().toLowerCase();
                            const cleanCpf = userInput.replace(/\D/g, '');
                            const matchEmail = (localUser.email || '').toLowerCase() === cleanInput;
                            const matchUser = (localUser.login_usuario || '').toLowerCase() === cleanInput;
                            const matchCpf = cleanCpf.length === 11 && (localUser.cpf || '').replace(/\D/g, '') === cleanCpf;

                            if (matchEmail || matchUser || matchCpf) {
                                currentUser = localUser;

                                // Se pendente de pagamento local
                                if (currentUser.pagamento_status && currentUser.pagamento_status !== 'Aprovado') {
                                    if (typeof window.openPaymentModal === 'function') {
                                        window.openPaymentModal(currentUser);
                                    }
                                    if (typeof showToastMessage === 'function') {
                                        showToastMessage('Sua anuidade SBPS (R$ 100,00) está pendente. Conclua o pagamento para liberar seu acesso.');
                                    }
                                    loginSuccess = true;
                                    return;
                                }

                                // VERIFICAÇÃO DE DISPOSITIVO CONFIÁVEL & 2FA (FASE 4)
                                let isTrusted = false;
                                if (window.SBPS_Supabase) {
                                    const trustRes = await window.SBPS_Supabase.checkTrustedDevice(currentUser.email);
                                    isTrusted = !!(trustRes && trustRes.confiavel);
                                } else {
                                    const localExp = localStorage.getItem('sbps_trusted_' + (currentUser.email || '').toLowerCase());
                                    isTrusted = localExp && Number(localExp) > Date.now();
                                }

                                if (!isTrusted) {
                                    pending2faUser = currentUser;
                                    let otpRes = { codigo: Math.floor(100000 + Math.random() * 900000).toString() };
                                    if (window.SBPS_Supabase) {
                                        otpRes = await window.SBPS_Supabase.generateOtp(currentUser.email, 'login_2fa');
                                    }
                                    open2faLoginModal(currentUser.email, otpRes.codigo);
                                    loginSuccess = true;
                                    return;
                                }

                                if (window.SBPS_Supabase) {
                                    window.SBPS_Supabase.registerTrustedDevice(currentUser.email);
                                }
                                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

                                if (authContainer) authContainer.style.display = 'none';
                                if (memberContent) memberContent.style.display = 'block';
                                updateUserBadges();
                                renderUserData();
                                renderCertificates();
                                if (typeof showDashboard === 'function') showDashboard();
                                loginSuccess = true;
                            }
                        } catch (err) {
                            console.warn('Erro ao ler usuário local:', err);
                        }
                    }

                    if (!loginSuccess) {
                        alert('E-mail, usuário ou senha incorretos. Por favor, verifique seus dados ou realize seu cadastro de associado.');
                    }
                }
            });
        }

        // Lista de provedores de e-mail temporários/descartáveis bloqueados
        const DISPOSABLE_EMAIL_DOMAINS = [
            'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
            'yopmail.com', 'throwawaymail.com', 'dispostable.com', 'sharklasers.com',
            'getairmail.com', 'trashmail.com', 'mohmal.com', 'burnermail.io'
        ];

        // Validador oficial de DDDs brasileiros
        function isValidDDD(ddd) {
            const valid = [
                11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
                21, 22, 24,                         // RJ
                27, 28,                             // ES
                31, 32, 33, 34, 35, 37, 38,         // MG
                41, 42, 43, 44, 45, 46,             // PR
                47, 48, 49,                         // SC
                51, 53, 54, 55,                     // RS
                61,                                 // DF/GO
                62, 64,                             // GO
                63,                                 // TO
                65, 66,                             // MT
                67,                                 // MS
                68,                                 // AC
                69,                                 // RO
                71, 73, 74, 75, 77,                 // BA
                79,                                 // SE
                81, 87,                             // PE
                82,                                 // AL
                83,                                 // PB
                84,                                 // RN
                85, 88,                             // CE
                86, 89,                             // PI
                91, 93, 94,                         // PA
                92, 97,                             // AM
                95,                                 // RR
                96,                                 // AP
                98, 99                              // MA
            ];
            return valid.includes(Number(ddd));
        }

        // Estado do cadastro pendente de validação OTP
        let pendingRegistration = {
            userData: null,
            password: '',
            email: '',
            currentOtpCode: ''
        };
        let otpTimerInterval = null;
        let isUsernameAvailableState = true;
        let isEmailAvailableState = true;
        let isCpfAvailableState = true;

        // 1. CPF: Máscara Automática e Validação Oficial (Módulo 11 + Unicidade Supabase)
        const cpfInput = document.getElementById('reg-cpf');
        const cpfFeedback = document.getElementById('cpf-feedback');
        let cpfDebounce = null;

        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
                else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                e.target.value = v;

                if (v.replace(/\D/g, '').length < 11) {
                    cpfInput.classList.remove('is-valid', 'is-invalid');
                    if (cpfFeedback) cpfFeedback.style.display = 'none';
                }
            });

            cpfInput.addEventListener('blur', () => {
                const raw = cpfInput.value.replace(/\D/g, '');
                if (!raw) {
                    if (cpfFeedback) cpfFeedback.style.display = 'none';
                    cpfInput.classList.remove('is-valid', 'is-invalid');
                    return;
                }

                if (!isValidCPF(raw)) {
                    isCpfAvailableState = false;
                    cpfInput.classList.add('is-invalid');
                    cpfInput.classList.remove('is-valid');
                    if (cpfFeedback) {
                        cpfFeedback.style.display = 'flex';
                        cpfFeedback.className = 'field-feedback-box invalid';
                        cpfFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> CPF inválido. Confira os números digitados.';
                    }
                    return;
                }

                if (cpfFeedback) {
                    cpfFeedback.style.display = 'flex';
                    cpfFeedback.className = 'field-feedback-box checking';
                    cpfFeedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando no banco de dados...';
                }

                clearTimeout(cpfDebounce);
                cpfDebounce = setTimeout(async () => {
                    let available = true;
                    if (window.SBPS_Supabase) {
                        available = await window.SBPS_Supabase.isCpfAvailable(raw);
                    }

                    if (!available) {
                        isCpfAvailableState = false;
                        cpfInput.classList.add('is-invalid');
                        cpfInput.classList.remove('is-valid');
                        if (cpfFeedback) {
                            cpfFeedback.style.display = 'flex';
                            cpfFeedback.className = 'field-feedback-box taken';
                            cpfFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Este CPF já está cadastrado na SBPS.';
                        }
                    } else {
                        isCpfAvailableState = true;
                        cpfInput.classList.remove('is-invalid');
                        cpfInput.classList.add('is-valid');
                        if (cpfFeedback) {
                            cpfFeedback.style.display = 'flex';
                            cpfFeedback.className = 'field-feedback-box valid';
                            cpfFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> CPF válido e disponível.';
                        }
                    }
                }, 200);
            });
        }

        // 2. RG: Máscara e Validação com Dígito Verificador
        const rgInput = document.getElementById('reg-rg');
        const rgFeedback = document.getElementById('rg-feedback');
        if (rgInput) {
            rgInput.addEventListener('input', (e) => {
                let v = e.target.value.toUpperCase().replace(/[^0-9X]/g, '').slice(0, 9);
                if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})([0-9X]{1})/, '$1.$2.$3-$4');
                else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
                else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,3})/, '$1.$2');
                e.target.value = v;
            });

            rgInput.addEventListener('blur', () => {
                const raw = rgInput.value.trim();
                if (raw && !isValidRG(raw)) {
                    rgInput.classList.add('is-invalid');
                    rgInput.classList.remove('is-valid');
                    if (rgFeedback) {
                        rgFeedback.style.display = 'flex';
                        rgFeedback.className = 'field-feedback-box invalid';
                        rgFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> RG inválido. Confira o número e o dígito verificador.';
                    }
                } else if (raw) {
                    rgInput.classList.remove('is-invalid');
                    rgInput.classList.add('is-valid');
                    if (rgFeedback) {
                        rgFeedback.style.display = 'flex';
                        rgFeedback.className = 'field-feedback-box valid';
                        rgFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> RG válido.';
                    }
                } else if (rgFeedback) {
                    rgFeedback.style.display = 'none';
                }
            });
        }

        // 3. Data de Nascimento: Limite Oficial 18+ anos e Validação
        const nascInput = document.getElementById('reg-nasc');
        const nascFeedback = document.getElementById('nasc-feedback');
        if (nascInput) {
            const today = new Date();
            const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
            nascInput.max = maxDate;

            nascInput.addEventListener('change', () => {
                const val = nascInput.value;
                if (!val) {
                    if (nascFeedback) nascFeedback.style.display = 'none';
                    nascInput.classList.remove('is-valid', 'is-invalid');
                    return;
                }

                if (!isAdult(val)) {
                    nascInput.classList.add('is-invalid');
                    nascInput.classList.remove('is-valid');
                    if (nascFeedback) {
                        nascFeedback.style.display = 'flex';
                        nascFeedback.className = 'field-feedback-box invalid';
                        nascFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> O cadastro na SBPS é restrito a maiores de 18 anos.';
                    }
                } else {
                    nascInput.classList.remove('is-invalid');
                    nascInput.classList.add('is-valid');
                    if (nascFeedback) {
                        nascFeedback.style.display = 'flex';
                        nascFeedback.className = 'field-feedback-box valid';
                        nascFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Maioridade confirmada (+18 anos).';
                    }
                }
            });
        }

        // 4. Celular / WhatsApp: Máscara, DDD e 9 Dígitos
        const celularInput = document.getElementById('reg-celular');
        const celularFeedback = document.getElementById('celular-feedback');
        if (celularInput) {
            celularInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                e.target.value = v;

                if (v.replace(/\D/g, '').length < 11) {
                    celularInput.classList.remove('is-valid', 'is-invalid');
                    if (celularFeedback) celularFeedback.style.display = 'none';
                }
            });

            celularInput.addEventListener('blur', () => {
                const raw = celularInput.value.replace(/\D/g, '');
                if (!raw) {
                    if (celularFeedback) celularFeedback.style.display = 'none';
                    celularInput.classList.remove('is-valid', 'is-invalid');
                    return;
                }

                const ddd = raw.substring(0, 2);
                if (raw.length !== 11 || raw.charAt(2) !== '9' || !isValidDDD(ddd)) {
                    celularInput.classList.add('is-invalid');
                    celularInput.classList.remove('is-valid');
                    if (celularFeedback) {
                        celularFeedback.style.display = 'flex';
                        celularFeedback.className = 'field-feedback-box invalid';
                        celularFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Celular inválido. Digite DDD válido e número de 9 dígitos.';
                    }
                } else {
                    celularInput.classList.remove('is-invalid');
                    celularInput.classList.add('is-valid');
                    if (celularFeedback) {
                        celularFeedback.style.display = 'flex';
                        celularFeedback.className = 'field-feedback-box valid';
                        celularFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Número de WhatsApp/Celular válido.';
                    }
                }
            });
        }

        // 5. E-mail Principal: Formato, Filtro Anti-Descartável e Unicidade Supabase
        const emailInput = document.getElementById('reg-email');
        const emailFeedback = document.getElementById('email-feedback');
        let emailDebounce = null;

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const emailVal = emailInput.value.trim().toLowerCase();
                if (!emailVal) {
                    if (emailFeedback) emailFeedback.style.display = 'none';
                    emailInput.classList.remove('is-valid', 'is-invalid');
                    return;
                }

                if (!isValidEmail(emailVal)) {
                    isEmailAvailableState = false;
                    emailInput.classList.add('is-invalid');
                    emailInput.classList.remove('is-valid');
                    if (emailFeedback) {
                        emailFeedback.style.display = 'flex';
                        emailFeedback.className = 'field-feedback-box invalid';
                        emailFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Formato de e-mail inválido.';
                    }
                    return;
                }

                const domain = emailVal.split('@')[1];
                if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
                    isEmailAvailableState = false;
                    emailInput.classList.add('is-invalid');
                    emailInput.classList.remove('is-valid');
                    if (emailFeedback) {
                        emailFeedback.style.display = 'flex';
                        emailFeedback.className = 'field-feedback-box invalid';
                        emailFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Provedores de e-mail temporários não são aceitos.';
                    }
                    return;
                }

                if (emailFeedback) {
                    emailFeedback.style.display = 'flex';
                    emailFeedback.className = 'field-feedback-box checking';
                    emailFeedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando disponibilidade...';
                }

                clearTimeout(emailDebounce);
                emailDebounce = setTimeout(async () => {
                    let available = true;
                    if (window.SBPS_Supabase) {
                        available = await window.SBPS_Supabase.isEmailAvailable(emailVal);
                    }

                    if (!available) {
                        isEmailAvailableState = false;
                        emailInput.classList.add('is-invalid');
                        emailInput.classList.remove('is-valid');
                        if (emailFeedback) {
                            emailFeedback.style.display = 'flex';
                            emailFeedback.className = 'field-feedback-box taken';
                            emailFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Este e-mail já está cadastrado. Faça login.';
                        }
                    } else {
                        isEmailAvailableState = true;
                        emailInput.classList.remove('is-invalid');
                        emailInput.classList.add('is-valid');
                        if (emailFeedback) {
                            emailFeedback.style.display = 'flex';
                            emailFeedback.className = 'field-feedback-box valid';
                            emailFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> E-mail válido e disponível!';
                        }
                    }
                }, 200);
            });
        }

        // 6. Confirmação do E-mail Principal
        const emailConfirmInput = document.getElementById('reg-email-confirm');
        const emailConfirmFeedback = document.getElementById('email-confirm-feedback');

        if (emailConfirmInput && emailInput) {
            const checkEmailMatch = () => {
                const em1 = emailInput.value.trim().toLowerCase();
                const em2 = emailConfirmInput.value.trim().toLowerCase();

                if (!em2) {
                    if (emailConfirmFeedback) emailConfirmFeedback.style.display = 'none';
                    emailConfirmInput.classList.remove('is-valid', 'is-invalid');
                    return;
                }

                if (em1 !== em2) {
                    emailConfirmInput.classList.add('is-invalid');
                    emailConfirmInput.classList.remove('is-valid');
                    if (emailConfirmFeedback) {
                        emailConfirmFeedback.style.display = 'flex';
                        emailConfirmFeedback.className = 'field-feedback-box invalid';
                        emailConfirmFeedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Os e-mails informados não coincidem.';
                    }
                } else {
                    emailConfirmInput.classList.remove('is-invalid');
                    emailConfirmInput.classList.add('is-valid');
                    if (emailConfirmFeedback) {
                        emailConfirmFeedback.style.display = 'flex';
                        emailConfirmFeedback.className = 'field-feedback-box valid';
                        emailConfirmFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> E-mails coincidem perfeitamente!';
                    }
                }
            };

            emailConfirmInput.addEventListener('input', checkEmailMatch);
            emailConfirmInput.addEventListener('blur', checkEmailMatch);
        }

        // Toggle Complemento
        const checkSemComp = document.getElementById('check-sem-complemento');
        const inputComp = document.getElementById('reg-complemento');
        if (checkSemComp && inputComp) {
            checkSemComp.addEventListener('change', () => {
                if (checkSemComp.checked) {
                    inputComp.value = 'Sem complemento';
                    inputComp.disabled = true;
                } else {
                    inputComp.value = '';
                    inputComp.disabled = false;
                }
            });
        }

        // 7. Nome de Usuário Único (Login): Consulta em Tempo Real no Supabase
        const loginUserInput = document.getElementById('reg-login-user');
        const usernameFeedback = document.getElementById('username-feedback');
        let usernameDebounceTimer = null;

        if (loginUserInput && usernameFeedback) {
            loginUserInput.addEventListener('input', () => {
                const val = loginUserInput.value.trim();
                clearTimeout(usernameDebounceTimer);

                if (val.length < 3) {
                    usernameFeedback.style.display = 'none';
                    isUsernameAvailableState = false;
                    return;
                }

                usernameFeedback.style.display = 'flex';
                usernameFeedback.className = 'field-feedback-box checking';
                usernameFeedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando disponibilidade...';

                usernameDebounceTimer = setTimeout(async () => {
                    let available = true;
                    if (window.SBPS_Supabase) {
                        available = await window.SBPS_Supabase.isUsernameAvailable(val);
                    }

                    if (available) {
                        isUsernameAvailableState = true;
                        usernameFeedback.className = 'field-feedback-box valid';
                        usernameFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Usuário "${val}" disponível!`;
                        loginUserInput.classList.remove('is-invalid');
                        loginUserInput.classList.add('is-valid');
                    } else {
                        isUsernameAvailableState = false;
                        usernameFeedback.className = 'field-feedback-box taken';
                        usernameFeedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> O usuário "${val}" já está em uso.`;
                        loginUserInput.classList.add('is-invalid');
                        loginUserInput.classList.remove('is-valid');
                    }
                }, 300);
            });
        }

        // 8. Confirmação de Senha
        const regPasswordInput = document.getElementById('reg-password');
        const regPasswordConfirmInput = document.getElementById('reg-password-confirm');
        if (regPasswordConfirmInput && regPasswordInput) {
            const checkPassMatch = () => {
                const p1 = regPasswordInput.value;
                const p2 = regPasswordConfirmInput.value;
                if (!p2) {
                    regPasswordConfirmInput.classList.remove('is-valid', 'is-invalid');
                    return;
                }
                if (p1 !== p2) {
                    regPasswordConfirmInput.classList.add('is-invalid');
                    regPasswordConfirmInput.classList.remove('is-valid');
                } else {
                    regPasswordConfirmInput.classList.remove('is-invalid');
                    regPasswordConfirmInput.classList.add('is-valid');
                }
            };
            regPasswordConfirmInput.addEventListener('input', checkPassMatch);
            regPasswordConfirmInput.addEventListener('blur', checkPassMatch);
        }

        // Inicializar listeners dos Modais OTP (Cadastro e 2FA Login)
        setupOtpModalEvents();
        setup2faModalEvents();

        // 9. SUBMIT CADASTRO: Validação Estrita Completa e Disparo do Modal OTP
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // A. Nome Completo
                const nomeInput = document.getElementById('reg-nome');
                const nome = nomeInput ? nomeInput.value.trim() : '';
                const nomeWords = nome.split(/\s+/).filter(w => w.length > 0);
                if (nomeWords.length < 2) {
                    alert('Por favor, informe seu Nome Completo (nome e sobrenome).');
                    if (nomeInput) {
                        nomeInput.classList.add('is-invalid');
                        nomeInput.focus();
                    }
                    return;
                }

                // B. CPF Oficial
                const rawCpf = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
                if (!isValidCPF(rawCpf)) {
                    alert('CPF inválido! Por favor, confira os números digitados.');
                    if (cpfInput) {
                        cpfInput.classList.add('is-invalid');
                        cpfInput.focus();
                    }
                    return;
                }

                if (!isCpfAvailableState) {
                    alert('Este CPF já está cadastrado na SBPS. Por favor, acerte os dados ou faça login.');
                    if (cpfInput) cpfInput.focus();
                    return;
                }

                // C. RG
                const rawRg = rgInput ? rgInput.value.trim() : '';
                if (!isValidRG(rawRg)) {
                    alert('RG inválido! O número do RG ou dígito verificador está incorreto.');
                    if (rgInput) {
                        rgInput.classList.add('is-invalid');
                        rgInput.focus();
                    }
                    return;
                }

                // D. Data de Nascimento (18+)
                const birthDate = nascInput ? nascInput.value : '';
                if (!birthDate || !isAdult(birthDate)) {
                    alert('O cadastro na SBPS é restrito para maiores de 18 anos. Verifique a data de nascimento.');
                    if (nascInput) {
                        nascInput.classList.add('is-invalid');
                        nascInput.focus();
                    }
                    return;
                }

                // E. Gênero
                const generoInput = document.getElementById('reg-genero');
                if (!generoInput || !generoInput.value) {
                    alert('Por favor, selecione seu Gênero.');
                    if (generoInput) generoInput.focus();
                    return;
                }

                // F. Origem
                const origemInput = document.getElementById('reg-origem');
                if (!origemInput || !origemInput.value) {
                    alert('Por favor, informe como você conheceu a SBPS.');
                    if (origemInput) origemInput.focus();
                    return;
                }

                let origemOutroDesc = '';
                if (origemInput.value === 'Outro') {
                    const origemOutroInput = document.getElementById('reg-origem-outro');
                    origemOutroDesc = origemOutroInput ? origemOutroInput.value.trim() : '';
                    if (!origemOutroDesc) {
                        alert('Como você selecionou "Outro", por favor descreva como conheceu a SBPS.');
                        if (origemOutroInput) origemOutroInput.focus();
                        return;
                    }
                }

                // G. Celular / WhatsApp
                const rawCelular = celularInput ? celularInput.value.replace(/\D/g, '') : '';
                const ddd = rawCelular.substring(0, 2);
                if (rawCelular.length !== 11 || rawCelular.charAt(2) !== '9' || !isValidDDD(ddd)) {
                    alert('Por favor, informe um Celular/WhatsApp válido no formato com DDD (11 dígitos, iniciando com 9).');
                    if (celularInput) {
                        celularInput.classList.add('is-invalid');
                        celularInput.focus();
                    }
                    return;
                }

                // H. E-mail Principal & Confirmação
                const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
                const emailConfirm = emailConfirmInput ? emailConfirmInput.value.trim().toLowerCase() : '';

                if (!isValidEmail(email)) {
                    alert('Por favor, informe um E-mail Principal com formato válido.');
                    if (emailInput) {
                        emailInput.classList.add('is-invalid');
                        emailInput.focus();
                    }
                    return;
                }

                const emailDomain = email.split('@')[1];
                if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
                    alert('Provedores de e-mail temporários ou descartáveis não são aceitos.');
                    if (emailInput) {
                        emailInput.classList.add('is-invalid');
                        emailInput.focus();
                    }
                    return;
                }

                if (email !== emailConfirm) {
                    alert('A confirmação de e-mail não confere com o E-mail Principal informado!');
                    if (emailConfirmInput) {
                        emailConfirmInput.classList.add('is-invalid');
                        emailConfirmInput.focus();
                    }
                    return;
                }

                if (!isEmailAvailableState) {
                    alert('Este e-mail já está cadastrado na SBPS. Por favor, acesse a aba de login.');
                    if (emailInput) emailInput.focus();
                    return;
                }

                const emailSecundarioInput = document.getElementById('reg-email-secundario');
                const emailSecundario = emailSecundarioInput ? emailSecundarioInput.value.trim().toLowerCase() : '';
                if (emailSecundario && !isValidEmail(emailSecundario)) {
                    alert('O E-mail Secundário informado possui formato inválido.');
                    if (emailSecundarioInput) emailSecundarioInput.focus();
                    return;
                }

                // I. Endereço
                const cepInput = document.getElementById('reg-cep');
                const rawCep = cepInput ? cepInput.value.replace(/\D/g, '') : '';
                if (rawCep.length !== 8) {
                    alert('Por favor, informe um CEP válido com 8 dígitos.');
                    if (cepInput) cepInput.focus();
                    return;
                }

                const numeroInput = document.getElementById('reg-numero');
                if (!numeroInput || !numeroInput.value.trim()) {
                    alert('Por favor, informe o Número do endereço.');
                    if (numeroInput) numeroInput.focus();
                    return;
                }

                const ruaInput = document.getElementById('reg-rua');
                if (!ruaInput || !ruaInput.value.trim()) {
                    alert('Por favor, informe o Logradouro / Rua.');
                    if (ruaInput) ruaInput.focus();
                    return;
                }

                const complementoInput = document.getElementById('reg-complemento');
                const semComplementoChecked = document.getElementById('check-sem-complemento')?.checked;
                const complemento = semComplementoChecked ? 'Sem complemento' : (complementoInput ? (complementoInput.value.trim() || 'Sem complemento') : 'Sem complemento');

                const bairroInput = document.getElementById('reg-bairro');
                if (!bairroInput || !bairroInput.value.trim()) {
                    alert('Por favor, informe o Bairro.');
                    if (bairroInput) bairroInput.focus();
                    return;
                }

                const cidadeInput = document.getElementById('reg-cidade');
                const ufInput = document.getElementById('reg-uf');
                if (!cidadeInput || !ufInput || !cidadeInput.value.trim() || !ufInput.value.trim()) {
                    alert('Por favor, consulte um CEP válido para preencher Cidade e UF.');
                    if (cepInput) cepInput.focus();
                    return;
                }

                // J. Login / Usuário
                const loginUser = loginUserInput ? loginUserInput.value.trim() : '';
                if (loginUser.length < 3) {
                    alert('O Nome de Usuário / Login deve conter no mínimo 3 caracteres.');
                    if (loginUserInput) loginUserInput.focus();
                    return;
                }

                if (!isUsernameAvailableState) {
                    alert(`O nome de usuário "${loginUser}" já está em uso por outro associado. Escolha outro.`);
                    if (loginUserInput) loginUserInput.focus();
                    return;
                }

                // K. Senhas e Checklist de Segurança
                const pass = regPasswordInput ? regPasswordInput.value : '';
                const passConf = regPasswordConfirmInput ? regPasswordConfirmInput.value : '';

                const passValidation = validateStrongPassword(pass);
                if (!passValidation.isValid) {
                    alert('A senha informada não atende a todos os requisitos de segurança:\n' + passValidation.errors.join('\n'));
                    if (regPasswordInput) regPasswordInput.focus();
                    return;
                }

                if (pass !== passConf) {
                    alert('A confirmação de senha não coincide com a senha digitada!');
                    if (regPasswordConfirmInput) regPasswordConfirmInput.focus();
                    return;
                }

                // L. Termo de Adesão & LGPD
                const termoLgpd = document.getElementById('reg-termo-lgpd');
                if (!termoLgpd || !termoLgpd.checked) {
                    alert('Você deve aceitar os Termos do Estatuto Social e a Política de Privacidade (LGPD) para prosseguir.');
                    if (termoLgpd) termoLgpd.focus();
                    return;
                }

                // Foto de perfil
                const fotoPreviewEl = document.getElementById('photo-preview');
                const fotoUrl = fotoPreviewEl ? (fotoPreviewEl.dataset.photoUrl || '') : '';

                // Montar Objeto Completo do Associado
                const newUser = {
                    nome: nome,
                    cpf: formatCPF(rawCpf),
                    rg: rawRg,
                    nascimento: birthDate,
                    genero: generoInput.value,
                    tipo_associado: document.getElementById('reg-tipo-assoc')?.value || 'SBPS Pessoa Física',
                    pessoa_tipo: document.getElementById('reg-juridica-fisica')?.value || 'Pessoa Física',
                    profissao: document.getElementById('reg-profissao')?.value.trim() || '',
                    origem_sbps: origemInput.value,
                    origem_outro_desc: origemOutroDesc,
                    celular: formatPhone(rawCelular),
                    fixo: document.getElementById('reg-fixo')?.value.trim() || '',
                    recado: document.getElementById('reg-recado')?.value.trim() || '',
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
                    status: 'Ativo',
                    email_verificado: false,
                    termo_lgpd_aceito_em: new Date().toISOString()
                };

                // Armazenar temporariamente para confirmação pós-código
                pendingRegistration = {
                    userData: newUser,
                    password: pass,
                    email: email,
                    currentOtpCode: ''
                };

                // Botão com estado de carregamento
                const submitBtn = document.getElementById('btn-submit-register');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando código de segurança...';
                }

                // Chamar RPC gerar_codigo_otp no Supabase
                let otpRes = { success: true, codigo: Math.floor(100000 + Math.random() * 900000).toString() };
                if (window.SBPS_Supabase) {
                    try {
                        otpRes = await window.SBPS_Supabase.generateOtp(email, 'confirmacao_cadastro');
                    } catch (err) {
                        console.warn('Fallback OTP local:', err);
                    }
                }

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-envelope-circle-check"></i> Validar Dados e Enviar Código por E-mail';
                }

                // Abrir o Modal OTP de 6 Dígitos
                openOtpModal(email, otpRes.codigo);
            });
        }

        // Funções do Modal OTP de E-mail
        function setupOtpModalEvents() {
            const modal = document.getElementById('modal-otp-cadastro');
            const digitsContainer = document.getElementById('otp-digits-container');
            const btnConfirm = document.getElementById('btn-confirm-otp');
            const errorMsg = document.getElementById('otp-error-msg');
            if (!digitsContainer) return;

            const digitInputs = Array.from(digitsContainer.querySelectorAll('.otp-digit-input'));

            digitInputs.forEach((input, index) => {
                input.addEventListener('input', (e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    e.target.value = val ? val.slice(-1) : '';
                    if (errorMsg) errorMsg.style.display = 'none';
                    digitInputs.forEach(i => i.classList.remove('is-error'));

                    if (e.target.value && index < digitInputs.length - 1) {
                        digitInputs[index + 1].focus();
                    }

                    const code = digitInputs.map(i => i.value).join('');
                    if (btnConfirm) btnConfirm.disabled = (code.length !== 6);
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !input.value && index > 0) {
                        digitInputs[index - 1].focus();
                        digitInputs[index - 1].value = '';
                        if (btnConfirm) btnConfirm.disabled = true;
                    } else if (e.key === 'ArrowLeft' && index > 0) {
                        digitInputs[index - 1].focus();
                    } else if (e.key === 'ArrowRight' && index < digitInputs.length - 1) {
                        digitInputs[index + 1].focus();
                    }
                });

                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                    if (!pasteData) return;
                    pasteData.split('').forEach((char, i) => {
                        if (digitInputs[i]) digitInputs[i].value = char;
                    });
                    const lastIdx = Math.min(pasteData.length, digitInputs.length) - 1;
                    if (digitInputs[lastIdx]) digitInputs[lastIdx].focus();
                    const code = digitInputs.map(i => i.value).join('');
                    if (btnConfirm) btnConfirm.disabled = (code.length !== 6);
                });
            });

            if (btnConfirm) {
                btnConfirm.addEventListener('click', async () => {
                    const code = digitInputs.map(i => i.value).join('');
                    if (code.length !== 6) return;

                    btnConfirm.disabled = true;
                    btnConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando código...';
                    if (errorMsg) errorMsg.style.display = 'none';

                    let verifyRes = { success: false };
                    if (window.SBPS_Supabase) {
                        verifyRes = await window.SBPS_Supabase.verifyOtp(pendingRegistration.email, code, 'confirmacao_cadastro');
                    }

                    if (verifyRes.success) {
                        btnConfirm.innerHTML = '<i class="fa-solid fa-circle-check"></i> E-mail Confirmado!';
                        btnConfirm.style.background = '#059669';

                        pendingRegistration.userData.email_verificado = true;
                        pendingRegistration.userData.pagamento_status = 'Pendente';
                        if (window.SBPS_Supabase) {
                            await window.SBPS_Supabase.registerUser(pendingRegistration.userData, pendingRegistration.password);
                        }

                        currentUser = pendingRegistration.userData;
                        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

                        if (typeof showToastMessage === 'function') {
                            showToastMessage('E-mail confirmado com sucesso! Conclua o pagamento da anuidade para ativar sua conta.');
                        }

                        setTimeout(() => {
                            window.closeOtpModal();
                            if (typeof window.openPaymentModal === 'function') {
                                window.openPaymentModal(currentUser);
                            }
                        }, 800);
                    } else {
                        btnConfirm.disabled = false;
                        btnConfirm.innerHTML = '<i class="fa-solid fa-check"></i> Validar Código';
                        digitInputs.forEach(i => i.classList.add('is-error'));
                        if (errorMsg) {
                            errorMsg.style.display = 'flex';
                            errorMsg.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${verifyRes.error || 'Código incorreto ou expirado. Tente novamente.'}`;
                        }
                        digitInputs[0].focus();
                    }
                });
            }
        }

        function openOtpModal(email, code) {
            const modal = document.getElementById('modal-otp-cadastro');
            if (!modal) return;

            pendingRegistration.email = email;
            pendingRegistration.currentOtpCode = code;

            const emailDisplay = document.getElementById('otp-target-email');
            if (emailDisplay) emailDisplay.textContent = email;

            const codeDisplay = document.getElementById('otp-dev-code-display');
            if (codeDisplay) codeDisplay.textContent = code;

            const errorMsg = document.getElementById('otp-error-msg');
            if (errorMsg) errorMsg.style.display = 'none';

            const btnConfirm = document.getElementById('btn-confirm-otp');
            if (btnConfirm) {
                btnConfirm.disabled = true;
                btnConfirm.innerHTML = '<i class="fa-solid fa-check"></i> Validar Código';
                btnConfirm.style.background = '';
            }

            const digitInputs = modal.querySelectorAll('.otp-digit-input');
            digitInputs.forEach(i => {
                i.value = '';
                i.classList.remove('is-error');
            });

            modal.classList.add('active');
            startOtpCountdown(60);

            setTimeout(() => {
                if (digitInputs[0]) digitInputs[0].focus();
            }, 150);
        }

        window.openOtpModal = openOtpModal;

        window.closeOtpModal = function () {
            const modal = document.getElementById('modal-otp-cadastro');
            if (modal) modal.classList.remove('active');
            if (otpTimerInterval) clearInterval(otpTimerInterval);
            const btnSubmit = document.getElementById('btn-submit-register');
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa-solid fa-envelope-circle-check"></i> Validar Dados e Enviar Código por E-mail';
            }
        };

        window.fillTestOtp = function () {
            if (!pendingRegistration.currentOtpCode) return;
            const modal = document.getElementById('modal-otp-cadastro');
            if (!modal) return;
            const digitInputs = modal.querySelectorAll('.otp-digit-input');
            const chars = pendingRegistration.currentOtpCode.split('');
            chars.forEach((c, i) => {
                if (digitInputs[i]) digitInputs[i].value = c;
            });
            const btnConfirm = document.getElementById('btn-confirm-otp');
            if (btnConfirm) btnConfirm.disabled = false;
            if (digitInputs[5]) digitInputs[5].focus();
        };

        window.resendOtpCode = async function () {
            if (!pendingRegistration.email) return;
            const btnResend = document.getElementById('btn-resend-otp');
            if (btnResend) btnResend.style.display = 'none';

            let otpRes = { codigo: Math.floor(100000 + Math.random() * 900000).toString() };
            if (window.SBPS_Supabase) {
                otpRes = await window.SBPS_Supabase.generateOtp(pendingRegistration.email, 'confirmacao_cadastro');
            }

            pendingRegistration.currentOtpCode = otpRes.codigo;
            const codeDisplay = document.getElementById('otp-dev-code-display');
            if (codeDisplay) codeDisplay.textContent = otpRes.codigo;

            if (typeof showToastMessage === 'function') {
                showToastMessage(`Novo código enviado para ${pendingRegistration.email}: [ ${otpRes.codigo} ]`);
            }
            startOtpCountdown(60);
        };

        function startOtpCountdown(seconds) {
            if (otpTimerInterval) clearInterval(otpTimerInterval);
            let remaining = seconds;
            const timerText = document.getElementById('otp-countdown-text');
            const secondsEl = document.getElementById('otp-timer-seconds');
            const btnResend = document.getElementById('btn-resend-otp');

            if (timerText) timerText.style.display = 'inline';
            if (btnResend) btnResend.style.display = 'none';
            if (secondsEl) secondsEl.textContent = remaining + 's';

            otpTimerInterval = setInterval(() => {
                remaining--;
                if (secondsEl) secondsEl.textContent = remaining + 's';
                if (remaining <= 0) {
                    clearInterval(otpTimerInterval);
                    if (timerText) timerText.style.display = 'none';
                    if (btnResend) btnResend.style.display = 'inline-flex';
                }
            }, 1000);
        }

        // ==========================================================================
        // FASE 3: MÓDULO DE PAGAMENTO DA TAXA DE ASSOCIAÇÃO (ASAAS / PIX / CARTÃO)
        // ==========================================================================
        let currentPayingUser = null;
        let pixPollingInterval = null;

        function openPaymentModal(userData) {
            currentPayingUser = userData || currentUser;
            const modal = document.getElementById('modal-pagamento-associacao');
            if (!modal) return;

            // Resetar visualizações
            const mainView = document.getElementById('payment-main-view');
            const successView = document.getElementById('payment-success-view');
            if (mainView) mainView.style.display = 'block';
            if (successView) successView.style.display = 'none';

            // Gerar payload PIX dinâmico
            const pixCodeField = document.getElementById('pix-copy-input');
            const pixQrImg = document.getElementById('pix-qrcode-img');
            const userEmail = (currentPayingUser?.email || 'associado@sbps.org.br').toLowerCase();
            const userName = currentPayingUser?.nome || 'Associado SBPS';

            // Chave PIX e payload padrão EMV do Asaas / Banco Central
            const dummyTxId = 'SBPS' + Date.now().toString(36).toUpperCase();
            const pixPayload = `00020101021226840014br.gov.bcb.pix2562pix.asaas.com/qr/stat/${dummyTxId}5204000053039865406100.005802BR5918SBPS PREVIDENCIA6009SAO PAULO62070503***63048F12`;

            if (pixCodeField) pixCodeField.value = pixPayload;
            if (pixQrImg) {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixPayload)}`;
                pixQrImg.src = qrUrl;
            }

            // Preencher campos do titular do cartão caso já existam
            const cardHolder = document.getElementById('card-holder');
            const cardCpf = document.getElementById('card-cpf');
            if (cardHolder && !cardHolder.value) cardHolder.value = userName.toUpperCase();
            if (cardCpf && !cardCpf.value && currentPayingUser?.cpf) cardCpf.value = currentPayingUser.cpf;

            // Ativar aba PIX por padrão
            window.switchPaymentMethod('pix');

            modal.classList.add('active');

            // Iniciar escuta periódica (polling) de confirmação de pagamento
            startPixStatusPolling(userEmail);
        }
        window.openPaymentModal = openPaymentModal;

        window.closePaymentModal = function () {
            const modal = document.getElementById('modal-pagamento-associacao');
            if (modal) modal.classList.remove('active');
            if (pixPollingInterval) clearInterval(pixPollingInterval);

            // Se o usuário ainda não tiver pagamento aprovado, avisar que pode concluir no login
            if (!currentUser || currentUser.pagamento_status !== 'Aprovado') {
                if (typeof showToastMessage === 'function') {
                    showToastMessage('Você pode concluir a taxa de associação de R$ 100,00 quando quiser ao fazer login.');
                }
            }
        };

        window.switchPaymentMethod = function (method) {
            const tabPix = document.getElementById('tab-btn-pix');
            const tabCard = document.getElementById('tab-btn-card');
            const panelPix = document.getElementById('payment-panel-pix');
            const panelCard = document.getElementById('payment-panel-card');

            if (method === 'pix') {
                if (tabPix) tabPix.classList.add('active');
                if (tabCard) tabCard.classList.remove('active');
                if (panelPix) panelPix.style.display = 'block';
                if (panelCard) panelCard.style.display = 'none';
            } else {
                if (tabPix) tabPix.classList.remove('active');
                if (tabCard) tabCard.classList.add('active');
                if (panelPix) panelPix.style.display = 'none';
                if (panelCard) panelCard.style.display = 'block';
            }
        };

        window.copyPixCode = function () {
            const pixCodeField = document.getElementById('pix-copy-input');
            const btn = document.getElementById('btn-copy-pix');
            if (!pixCodeField) return;

            navigator.clipboard.writeText(pixCodeField.value).then(() => {
                if (btn) {
                    btn.classList.add('copied');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
                    }, 2500);
                }
                if (typeof showToastMessage === 'function') {
                    showToastMessage('Código PIX Copia e Cola copiado para a área de transferência!');
                }
            }).catch(() => {
                pixCodeField.select();
                document.execCommand('copy');
                if (typeof showToastMessage === 'function') {
                    showToastMessage('Código PIX selecionado. Pressione Ctrl+C para copiar.');
                }
            });
        };

        // Formatação dinâmica e detecção de bandeira do Cartão de Crédito
        function setupCreditCardInputs() {
            const cardNumInput = document.getElementById('card-number');
            const cardBrandBadge = document.getElementById('card-brand-badge');
            const expiryInput = document.getElementById('card-expiry');
            const cvvInput = document.getElementById('card-cvv');
            const cpfInput = document.getElementById('card-cpf');

            if (cardNumInput) {
                cardNumInput.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
                    e.target.value = v;

                    // Detecção visual de bandeira
                    const raw = v.replace(/\s/g, '');
                    if (cardBrandBadge) {
                        cardBrandBadge.className = 'card-brand-icon';
                        if (/^4/.test(raw)) {
                            cardBrandBadge.innerHTML = '<i class="fa-brands fa-cc-visa"></i>';
                            cardBrandBadge.classList.add('visa');
                        } else if (/^(5[1-5]|2[2-7])/.test(raw)) {
                            cardBrandBadge.innerHTML = '<i class="fa-brands fa-cc-mastercard"></i>';
                            cardBrandBadge.classList.add('mastercard');
                        } else if (/^(4011|4389|4514|4576|5041|5066|5090|6277|6362|6363)/.test(raw)) {
                            cardBrandBadge.innerHTML = '<i class="fa-solid fa-credit-card"></i>';
                            cardBrandBadge.classList.add('elo');
                        } else if (/^3[47]/.test(raw)) {
                            cardBrandBadge.innerHTML = '<i class="fa-brands fa-cc-amex"></i>';
                            cardBrandBadge.classList.add('amex');
                        } else {
                            cardBrandBadge.innerHTML = '<i class="fa-regular fa-credit-card"></i>';
                        }
                    }
                });
            }

            if (expiryInput) {
                expiryInput.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                    e.target.value = v;
                });
            }

            if (cvvInput) {
                cvvInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
                });
            }

            if (cpfInput) {
                cpfInput.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
                    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
                    e.target.value = v;
                });
            }
        }
        setupCreditCardInputs();

        // Processar Pagamento por Cartão de Crédito
        window.processCreditCardPayment = async function (e) {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-card');
            const cardNum = (document.getElementById('card-number')?.value || '').replace(/\s/g, '');
            const cardHolder = document.getElementById('card-holder')?.value.trim() || '';
            const cardExpiry = document.getElementById('card-expiry')?.value.trim() || '';
            const cardCvv = document.getElementById('card-cvv')?.value.trim() || '';
            const cardCpf = (document.getElementById('card-cpf')?.value || '').replace(/\D/g, '');
            const installments = document.getElementById('card-installments')?.value || '1';

            if (cardNum.length < 15 || !cardHolder || cardExpiry.length < 5 || cardCvv.length < 3 || cardCpf.length !== 11) {
                alert('Por favor, preencha todos os campos do cartão de crédito corretamente.');
                return;
            }

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando transação segura Asaas...';
            }

            const targetEmail = (currentPayingUser?.email || '').toLowerCase();

            // Chamada ao backend Supabase
            let approvalRes = { success: true, payment_id: 'ASAAS-CARD-' + Date.now().toString(36).toUpperCase() };
            if (window.SBPS_Supabase && targetEmail) {
                try {
                    approvalRes = await window.SBPS_Supabase.simulatePaymentApproval(targetEmail, 'CREDIT_CARD');
                } catch (err) {
                    console.warn('Erro ao processar cartão:', err);
                }
            }

            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Pagar R$ 100,00 com Cartão';
                }
                showPaymentSuccessScreen('Cartão de Crédito (' + installments + 'x)', approvalRes.payment_id);
            }, 1200);
        };

        // Simulação instantânea para Testes de Homologação
        window.simulatePaymentSuccess = async function () {
            const btn = document.querySelector('.btn-simulate-payment');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aprovando no Supabase...';
            }

            const targetEmail = (currentPayingUser?.email || currentUser?.email || '').toLowerCase();
            let approvalRes = { success: true, payment_id: 'ASAAS-SIM-' + Math.random().toString(36).substring(2, 8).toUpperCase() };

            if (window.SBPS_Supabase && targetEmail) {
                try {
                    approvalRes = await window.SBPS_Supabase.simulatePaymentApproval(targetEmail, 'PIX');
                } catch (err) {
                    console.warn('Erro ao simular no Supabase:', err);
                }
            }

            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Simular Pagamento Aprovado (Teste)';
                }
                showPaymentSuccessScreen('PIX Dinâmico (Simulação)', approvalRes.payment_id || ('PAY-' + Date.now().toString(36).toUpperCase()));
            }, 800);
        };

        function showPaymentSuccessScreen(methodName, txId) {
            if (pixPollingInterval) clearInterval(pixPollingInterval);

            // Atualizar estado em memória e localStorage
            if (currentPayingUser) {
                currentPayingUser.pagamento_status = 'Aprovado';
                currentPayingUser.status = 'Ativo';
            }
            if (currentUser) {
                currentUser.pagamento_status = 'Aprovado';
                currentUser.status = 'Ativo';
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
            }

            // Registrar dispositivo atual como confiável por 7 dias para o associado
            const targetAssocEmail = currentPayingUser?.email || currentUser?.email;
            if (targetAssocEmail && window.SBPS_Supabase) {
                window.SBPS_Supabase.registerTrustedDevice(targetAssocEmail);
            }

            const mainView = document.getElementById('payment-main-view');
            const successView = document.getElementById('payment-success-view');
            if (mainView) mainView.style.display = 'none';
            if (successView) successView.style.display = 'block';

            const nameEl = document.getElementById('receipt-assoc-name');
            const emailEl = document.getElementById('receipt-assoc-email');
            const methodEl = document.getElementById('receipt-payment-method');
            const idEl = document.getElementById('receipt-payment-id');

            if (nameEl) nameEl.textContent = currentPayingUser?.nome || currentUser?.nome || 'Associado SBPS';
            if (emailEl) emailEl.textContent = currentPayingUser?.email || currentUser?.email || 'associado@sbps.org.br';
            if (methodEl) methodEl.textContent = methodName || 'PIX Dinâmico';
            if (idEl) idEl.textContent = txId || ('ASAAS-' + Date.now().toString(36).toUpperCase());

            if (typeof showToastMessage === 'function') {
                showToastMessage('Pagamento confirmado com sucesso! Bem-vindo(a) à SBPS.');
            }
        }

        window.finishPaymentAndEnterPortal = function () {
            window.closePaymentModal();
            if (authContainer) authContainer.style.display = 'none';
            if (memberContent) memberContent.style.display = 'block';
            updateUserBadges();
            renderUserData();
            renderCertificates();
            if (typeof showDashboard === 'function') showDashboard();
        };

        function startPixStatusPolling(email) {
            if (pixPollingInterval) clearInterval(pixPollingInterval);
            if (!email || !window.SBPS_Supabase) return;

            pixPollingInterval = setInterval(async () => {
                try {
                    const res = await window.SBPS_Supabase.getPaymentStatus(email);
                    if (res && res.status === 'Aprovado') {
                        clearInterval(pixPollingInterval);
                        showPaymentSuccessScreen('PIX Dinâmico (Asaas Webhook)', 'ASAAS-WH-' + Date.now().toString(36).toUpperCase());
                    }
                } catch (e) {
                    console.warn('Polling de pagamento:', e);
                }
            }, 5000);
        }

        // ==========================================================================
        // FASE 4: AUTENTICAÇÃO EM 2 ETAPAS (2FA) & DISPOSITIVOS CONFIÁVEIS (7 DIAS)
        // ==========================================================================
        let pending2faUser = null;
        let otp2faTimerInterval = null;

        function setup2faModalEvents() {
            const modal = document.getElementById('modal-otp-login');
            const digitsContainer = document.getElementById('otp-2fa-digits-container');
            const btnConfirm = document.getElementById('btn-confirm-2fa');
            const errorMsg = document.getElementById('otp-2fa-error-msg');
            if (!digitsContainer) return;

            const digitInputs = Array.from(digitsContainer.querySelectorAll('.otp-2fa-digit-input'));

            digitInputs.forEach((input, index) => {
                input.addEventListener('input', (e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    e.target.value = val ? val.slice(-1) : '';
                    if (errorMsg) errorMsg.style.display = 'none';
                    digitInputs.forEach(i => i.classList.remove('is-error'));

                    if (e.target.value && index < digitInputs.length - 1) {
                        digitInputs[index + 1].focus();
                    }

                    const code = digitInputs.map(i => i.value).join('');
                    if (btnConfirm) btnConfirm.disabled = (code.length !== 6);
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !input.value && index > 0) {
                        digitInputs[index - 1].focus();
                        digitInputs[index - 1].value = '';
                        if (btnConfirm) btnConfirm.disabled = true;
                    } else if (e.key === 'ArrowLeft' && index > 0) {
                        digitInputs[index - 1].focus();
                    } else if (e.key === 'ArrowRight' && index < digitInputs.length - 1) {
                        digitInputs[index + 1].focus();
                    }
                });

                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                    if (!pasteData) return;
                    pasteData.split('').forEach((char, i) => {
                        if (digitInputs[i]) digitInputs[i].value = char;
                    });
                    const lastIdx = Math.min(pasteData.length, digitInputs.length) - 1;
                    if (digitInputs[lastIdx]) digitInputs[lastIdx].focus();
                    const code = digitInputs.map(i => i.value).join('');
                    if (btnConfirm) btnConfirm.disabled = (code.length !== 6);
                });
            });
        }

        function open2faLoginModal(email, code) {
            const modal = document.getElementById('modal-otp-login');
            if (!modal) return;

            const emailDisplay = document.getElementById('otp-2fa-target-email');
            if (emailDisplay) emailDisplay.textContent = email;

            const codeDisplay = document.getElementById('otp-2fa-dev-code-display');
            if (codeDisplay) codeDisplay.textContent = code;

            const errorMsg = document.getElementById('otp-2fa-error-msg');
            if (errorMsg) errorMsg.style.display = 'none';

            const btnConfirm = document.getElementById('btn-confirm-2fa');
            if (btnConfirm) {
                btnConfirm.disabled = true;
                btnConfirm.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Confirmar e Acessar Portal';
                btnConfirm.style.background = '';
            }

            const digitInputs = modal.querySelectorAll('.otp-2fa-digit-input');
            digitInputs.forEach(i => {
                i.value = '';
                i.classList.remove('is-error');
            });

            modal.classList.add('active');
            start2faCountdown(60);

            setTimeout(() => {
                if (digitInputs[0]) digitInputs[0].focus();
            }, 150);
        }

        window.open2faLoginModal = open2faLoginModal;

        window.close2faLoginModal = function () {
            const modal = document.getElementById('modal-otp-login');
            if (modal) modal.classList.remove('active');
            if (otp2faTimerInterval) clearInterval(otp2faTimerInterval);
            pending2faUser = null;
        };

        window.fillTest2faOtp = function () {
            const codeDisplay = document.getElementById('otp-2fa-dev-code-display');
            const code = codeDisplay ? codeDisplay.textContent.trim() : '';
            if (!code || code === '------') return;

            const modal = document.getElementById('modal-otp-login');
            if (!modal) return;
            const digitInputs = modal.querySelectorAll('.otp-2fa-digit-input');
            const chars = code.split('');
            chars.forEach((c, i) => {
                if (digitInputs[i]) digitInputs[i].value = c;
            });
            const btnConfirm = document.getElementById('btn-confirm-2fa');
            if (btnConfirm) btnConfirm.disabled = false;
            if (digitInputs[5]) digitInputs[5].focus();
        };

        window.resend2faCode = async function () {
            if (!pending2faUser || !pending2faUser.email) return;
            const btnResend = document.getElementById('btn-resend-2fa');
            if (btnResend) btnResend.style.display = 'none';

            let otpRes = { codigo: Math.floor(100000 + Math.random() * 900000).toString() };
            if (window.SBPS_Supabase) {
                otpRes = await window.SBPS_Supabase.generateOtp(pending2faUser.email, 'login_2fa');
            }

            const codeDisplay = document.getElementById('otp-2fa-dev-code-display');
            if (codeDisplay) codeDisplay.textContent = otpRes.codigo;

            if (typeof showToastMessage === 'function') {
                showToastMessage(`Novo código 2FA enviado para ${pending2faUser.email}: [ ${otpRes.codigo} ]`);
            }
            start2faCountdown(60);
        };

        function start2faCountdown(seconds) {
            if (otp2faTimerInterval) clearInterval(otp2faTimerInterval);
            let remaining = seconds;
            const timerText = document.getElementById('otp-2fa-countdown-text');
            const secondsEl = document.getElementById('otp-2fa-timer-seconds');
            const btnResend = document.getElementById('btn-resend-2fa');

            if (timerText) timerText.style.display = 'inline';
            if (btnResend) btnResend.style.display = 'none';
            if (secondsEl) secondsEl.textContent = remaining + 's';

            otp2faTimerInterval = setInterval(() => {
                remaining--;
                if (secondsEl) secondsEl.textContent = remaining + 's';
                if (remaining <= 0) {
                    clearInterval(otp2faTimerInterval);
                    if (timerText) timerText.style.display = 'none';
                    if (btnResend) btnResend.style.display = 'inline-flex';
                }
            }, 1000);
        }

        window.submit2faVerification = async function () {
            if (!pending2faUser) return;
            const modal = document.getElementById('modal-otp-login');
            if (!modal) return;

            const digitInputs = Array.from(modal.querySelectorAll('.otp-2fa-digit-input'));
            const code = digitInputs.map(i => i.value).join('');
            if (code.length !== 6) return;

            const btnConfirm = document.getElementById('btn-confirm-2fa');
            const errorMsg = document.getElementById('otp-2fa-error-msg');

            if (btnConfirm) {
                btnConfirm.disabled = true;
                btnConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando código 2FA...';
            }
            if (errorMsg) errorMsg.style.display = 'none';

            let verifyRes = { success: false };
            if (window.SBPS_Supabase) {
                verifyRes = await window.SBPS_Supabase.verifyOtp(pending2faUser.email, code, 'login_2fa');
            } else {
                const stored = sessionStorage.getItem('sbps_temp_otp_' + pending2faUser.email.toLowerCase());
                if (stored === code) verifyRes = { success: true };
            }

            if (verifyRes.success) {
                if (btnConfirm) {
                    btnConfirm.innerHTML = '<i class="fa-solid fa-circle-check"></i> Acesso Autorizado!';
                    btnConfirm.style.background = '#059669';
                }

                // Verificar se o usuário marcou "Lembrar este dispositivo por 7 dias"
                const trustCheckbox = document.getElementById('check-trust-device-7days');
                const remember7Days = trustCheckbox ? trustCheckbox.checked : true;

                if (remember7Days && window.SBPS_Supabase) {
                    await window.SBPS_Supabase.registerTrustedDevice(pending2faUser.email);
                } else if (remember7Days) {
                    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
                    localStorage.setItem('sbps_trusted_' + pending2faUser.email.toLowerCase(), expires.toString());
                }

                currentUser = pending2faUser;
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

                setTimeout(() => {
                    window.close2faLoginModal();
                    if (authContainer) authContainer.style.display = 'none';
                    if (memberContent) memberContent.style.display = 'block';
                    updateUserBadges();
                    renderUserData();
                    renderCertificates();
                    if (typeof showDashboard === 'function') showDashboard();
                    if (typeof showToastMessage === 'function') {
                        showToastMessage(`Bem-vindo(a), ${currentUser.nome || 'Associado'}!`);
                    }
                }, 700);
            } else {
                if (btnConfirm) {
                    btnConfirm.disabled = false;
                    btnConfirm.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Confirmar e Acessar Portal';
                }
                digitInputs.forEach(i => i.classList.add('is-error'));
                if (errorMsg) {
                    errorMsg.style.display = 'flex';
                    errorMsg.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${verifyRes.error || 'Código 2FA incorreto ou expirado. Tente novamente.'}`;
                }
                digitInputs[0].focus();
            }
        };

        // Preferência de 2FA permanente na aba Perfil
        window.toggleTwoFactorPreference = async function (checked) {
            if (!currentUser) return;
            currentUser.dois_fatores_sempre = checked;
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

            const label2fa = document.getElementById('label-2fa-status');
            if (label2fa) {
                label2fa.textContent = checked ? 'Máxima Proteção (Sempre)' : 'Padrão (7 Dias)';
                label2fa.style.color = checked ? '#059669' : '#64748b';
            }

            if (window.SBPS_Supabase) {
                await window.SBPS_Supabase.updateTwoFactorPreference(currentUser.email, checked);
            }

            if (typeof showToastMessage === 'function') {
                showToastMessage(checked 
                    ? '2FA Obrigatório ativado! Você receberá código em todos os acessos.' 
                    : 'Modo padrão ativado: Dispositivos confiáveis são lembrados por 7 dias.');
            }
        };

        // Revogar Dispositivo Confiável Atual
        window.revokeCurrentDevice = async function () {
            if (!currentUser) return;

            if (window.SBPS_Supabase) {
                await window.SBPS_Supabase.revokeTrustedDevice(currentUser.email);
            }
            localStorage.removeItem('sbps_trusted_' + (currentUser.email || '').toLowerCase());

            const badgeTrusted = document.getElementById('badge-device-trusted');
            if (badgeTrusted) {
                badgeTrusted.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Não Confiável (Exige 2FA)';
                badgeTrusted.style.background = '#fef2f2';
                badgeTrusted.style.color = '#dc2626';
                badgeTrusted.style.borderColor = '#fecaca';
            }

            if (typeof showToastMessage === 'function') {
                showToastMessage('Dispositivo esquecido. No próximo login, um código de verificação 2FA será solicitado.');
            }
        };

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
                        const img = new Image();
                        img.onload = () => {
                            const maxDim = 400;
                            let w = img.width;
                            let h = img.height;
                            if (w > maxDim || h > maxDim) {
                                if (w > h) {
                                    h = Math.round((h * maxDim) / w);
                                    w = maxDim;
                                } else {
                                    w = Math.round((w * maxDim) / h);
                                    h = maxDim;
                                }
                            }
                            const canvas = document.createElement('canvas');
                            canvas.width = w;
                            canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
                            fotoPreview.innerHTML = `<img src="${compressedBase64}" alt="Foto de Perfil">`;
                            fotoPreview.dataset.photoUrl = compressedBase64;
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Validação de RG com Módulo 11 (Dígito Verificador de 0 a 9 ou X e bloqueio de sequências falsas)
    function isValidRG(rg) {
        if (!rg) return false;
        const clean = rg.toUpperCase().replace(/[^0-9X]/g, '');
        // O Brasil possui diferentes padrões estaduais de RG (entre 6 e 12 dígitos alfanuméricos)
        if (clean.length < 6 || clean.length > 12) return false;
        if (/^(\w)\1+$/.test(clean)) return false; // Rejeita sequências repetidas (00000000, 11111111, etc.)
        return true;
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
        const firstName = (currentUser.nome && currentUser.nome !== 'Vinícius Mota')
            ? currentUser.nome.trim().split(' ')[0]
            : 'Thiago';

        const headerGreeting = document.getElementById('header-user-greeting');
        if (headerGreeting) headerGreeting.textContent = `Olá, ${firstName}`;

        const chatGreeting = document.getElementById('chat-user-greeting');
        if (chatGreeting) chatGreeting.textContent = firstName;

        const headerAvatarImg = document.getElementById('header-user-avatar-img');
        if (headerAvatarImg) {
            if (currentUser.foto_url) {
                headerAvatarImg.src = currentUser.foto_url;
            } else {
                headerAvatarImg.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80';
            }
        }

        const editPhotoPreview = document.getElementById('edit-photo-preview');
        if (editPhotoPreview) {
            if (currentUser.foto_url) {
                editPhotoPreview.innerHTML = `<img src="${currentUser.foto_url}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                editPhotoPreview.innerHTML = `<i class="fa-solid fa-user"></i>`;
            }
        }

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
    // 2. Navegação da Área do Associado (Dashboard + 9 Abas + Tabs Horizontais + Dropdown)
    // --------------------------------------------------------------------------
    const TAB_TITLES = {
        'dashboard': 'Visão Geral',
        'perfil': '1. Perfil',
        'beneficios': '2. Benefícios',
        'atalhos': '3. Atalhos',
        'cursos': '4. Cursos',
        'seminarios': '5. Seminários',
        'certificados': '6. Certificados',
        'templates': '7. Templates',
        'livraria': '8. Livraria',
        'outros': '9. Outros & Ajuda'
    };

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
        window.switchTab = function(tabId, tabTitle, fromPopState = false) {
            if (!tabId) return;

            if (tabId === 'dashboard') {
                window.showDashboard();
                return;
            }

            ensureActiveSession();

            const authContainer = document.getElementById('auth-container');
            const memberContent = document.getElementById('member-content');
            if (authContainer) authContainer.style.display = 'none';
            if (memberContent) memberContent.style.display = 'block';

            // Hide Dashboard
            const dashboardView = document.getElementById('dashboard-view');
            if (dashboardView) dashboardView.style.display = 'none';

            // Hide all tab panels
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });

            // Show selected panel
            const targetPanel = document.getElementById(`tab-${tabId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';
                const backBtn = document.getElementById('btn-back-dashboard');
                if (backBtn) backBtn.style.display = 'inline-flex';
                const currentPageBreadcrumb = document.getElementById('breadcrumb-current');
                const titleToUse = tabTitle || TAB_TITLES[tabId] || tabId;
                if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = titleToUse;

                syncSidebarNavState(tabId);

                // Update active state in quick dropdown
                document.querySelectorAll('.quick-menu-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.tab === tabId);
                });

                // Update hash in URL
                if (!fromPopState && window.location.hash !== `#${tabId}`) {
                    history.pushState({ internal: true, tab: tabId }, '', `#${tabId}`);
                }

                // Renderização dinâmica dos dados da aba
                if (tabId === 'certificados' && typeof renderCertificates === 'function') renderCertificates();
                if (tabId === 'perfil' && typeof renderUserData === 'function') renderUserData();
                if (tabId === 'cursos' && typeof renderCourses === 'function') renderCourses();
                if (tabId === 'seminarios' && typeof renderSeminars === 'function') renderSeminars();
                if (tabId === 'atalhos' && typeof renderShortcuts === 'function') renderShortcuts();
                if (tabId === 'templates' && typeof renderTemplates === 'function') renderTemplates();
                if (tabId === 'livraria' && typeof renderLivraria === 'function') renderLivraria();
                if (tabId === 'outros' && typeof renderAjudaSupport === 'function') renderAjudaSupport();
            }

            // Scroll to top of member area smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const quickMenuDropdown = document.getElementById('quick-menu-dropdown');
            if (quickMenuDropdown) quickMenuDropdown.classList.remove('show');
        };

        // Switch to Dashboard
        window.showDashboard = function(fromPopState = false) {
            ensureActiveSession();

            const authContainer = document.getElementById('auth-container');
            const memberContent = document.getElementById('member-content');
            if (authContainer) authContainer.style.display = 'none';
            if (memberContent) memberContent.style.display = 'block';

            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });
            const dashboardView = document.getElementById('dashboard-view');
            if (dashboardView) dashboardView.style.display = 'block';
            const backBtn = document.getElementById('btn-back-dashboard');
            if (backBtn) backBtn.style.display = 'none';
            const currentPageBreadcrumb = document.getElementById('breadcrumb-current');
            if (currentPageBreadcrumb) currentPageBreadcrumb.textContent = 'Visão Geral';

            syncSidebarNavState('dashboard');

            // Update active state in Quick Menu Dropdown
            document.querySelectorAll('.quick-menu-item').forEach(item => {
                item.classList.toggle('active', item.dataset.tab === 'dashboard');
            });

            // Update hash in URL
            if (!fromPopState && window.location.hash !== '#dashboard') {
                history.pushState({ internal: true, tab: 'dashboard' }, '', '#dashboard');
            }

            const quickMenuDropdown = document.getElementById('quick-menu-dropdown');
            if (quickMenuDropdown) quickMenuDropdown.classList.remove('show');
        };

        // Click on Horizontal Tabs Bar buttons
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.dataset.tab;
                if (tabId === 'dashboard') {
                    showDashboard();
                } else {
                    const tabTitle = TAB_TITLES[tabId] || btn.textContent.trim();
                    window.switchTab(tabId, tabTitle);
                }
            });
        });

        // Click on 9 Dashboard Cards
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = card.getAttribute('data-tab');
                const tabTitle = TAB_TITLES[tabId] || card.querySelector('.card-title')?.textContent || '';
                if (tabId) {
                    window.switchTab(tabId, tabTitle);
                }
            });
        });

        // Click on Quick Dropdown Menu items
        document.querySelectorAll('.quick-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.dataset.tab;
                if (tabId === 'dashboard') {
                    showDashboard();
                } else {
                    const tabTitle = TAB_TITLES[tabId] || item.textContent.trim();
                    window.switchTab(tabId, tabTitle);
                }
            });
        });

        // Atalho ao clicar na própria Foto de Perfil ou Nome no cabeçalho
        const avatarNav = document.getElementById('nav-user-avatar');
        const infoNav = document.getElementById('nav-user-info');

        if (avatarNav) {
            avatarNav.style.cursor = 'pointer';
            avatarNav.addEventListener('click', () => {
                window.switchTab('perfil', '1. Perfil');
            });
        }
        if (infoNav) {
            infoNav.style.cursor = 'pointer';
            infoNav.addEventListener('click', () => {
                window.switchTab('perfil', '1. Perfil');
            });
        }

        // Click Back to Dashboard
        if (backBtn) {
            backBtn.addEventListener('click', showDashboard);
        }

        // Handle Hash change & direct links (e.g., #cursos)
        function handleHash() {
            const rawHash = window.location.hash ? window.location.hash.substring(1).toLowerCase() : '';
            if (rawHash && TAB_TITLES[rawHash]) {
                if (rawHash === 'dashboard') {
                    showDashboard();
                } else {
                    switchTab(rawHash, TAB_TITLES[rawHash]);
                }
            }
        }

        window.addEventListener('hashchange', handleHash);

        if (window.location.hash) {
            handleHash();
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

        // 5. Segurança & Dispositivos (2FA)
        const toggle2fa = document.getElementById('toggle-dois-fatores-sempre');
        const label2fa = document.getElementById('label-2fa-status');
        const deviceNameDisplay = document.getElementById('current-device-name-display');
        const badgeTrusted = document.getElementById('badge-device-trusted');

        if (toggle2fa) {
            toggle2fa.checked = !!currentUser.dois_fatores_sempre;
        }
        if (label2fa) {
            label2fa.textContent = currentUser.dois_fatores_sempre ? 'Máxima Proteção (Sempre)' : 'Padrão (7 Dias)';
            label2fa.style.color = currentUser.dois_fatores_sempre ? '#059669' : '#64748b';
        }
        if (deviceNameDisplay && window.SBPS_Supabase) {
            deviceNameDisplay.textContent = window.SBPS_Supabase.getDeviceName();
        }
        if (badgeTrusted) {
            const isLocalTrusted = localStorage.getItem('sbps_trusted_' + (currentUser.email || '').toLowerCase());
            if (isLocalTrusted && Number(isLocalTrusted) > Date.now()) {
                badgeTrusted.innerHTML = '<i class="fa-solid fa-circle-check"></i> Confiável (7 dias)';
                badgeTrusted.style.background = '#ecfdf5';
                badgeTrusted.style.color = '#059669';
                badgeTrusted.style.borderColor = '#a7f3d0';
            } else {
                badgeTrusted.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Não Confiável (Exige 2FA)';
                badgeTrusted.style.background = '#fef2f2';
                badgeTrusted.style.color = '#dc2626';
                badgeTrusted.style.borderColor = '#fecaca';
            }
        }

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
        // Upload / Alteração de foto no perfil
        const photoInput = document.getElementById('edit-foto-input');
        const btnRemovePhoto = document.getElementById('btn-remove-photo');

        if (photoInput && !photoInput.dataset.bound) {
            photoInput.dataset.bound = 'true';
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
                    return;
                }

                // Compressão em canvas para otimização
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const maxDim = 300;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxDim) {
                                height = Math.round((height * maxDim) / width);
                                width = maxDim;
                            }
                        } else {
                            if (height > maxDim) {
                                width = Math.round((width * maxDim) / height);
                                height = maxDim;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        currentUser.foto_url = compressedDataUrl;
                        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                        updateUserBadges();

                        if (window.SBPS_Supabase) {
                            window.SBPS_Supabase.updateProfile(currentUser).catch(console.error);
                        }

                        showToastMessage('Foto de perfil atualizada com sucesso!');
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        if (btnRemovePhoto && !btnRemovePhoto.dataset.bound) {
            btnRemovePhoto.dataset.bound = 'true';
            btnRemovePhoto.addEventListener('click', () => {
                if (!currentUser.foto_url) {
                    showToastMessage('Nenhuma foto personalizada definida.');
                    return;
                }
                if (confirm('Deseja remover sua foto de perfil?')) {
                    delete currentUser.foto_url;
                    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
                    updateUserBadges();

                    if (window.SBPS_Supabase) {
                        window.SBPS_Supabase.updateProfile(currentUser).catch(console.error);
                    }

                    showToastMessage('Foto de perfil removida.');
                }
            });
        }

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
            card.className = 'bg-white rounded-2xl p-5 border border-slate-200 custom-shadow transition-all duration-200 flex flex-col justify-between gap-4';
            card.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3.5 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-sm sm:text-base font-bold text-slate-900 truncate">${sc.title}</h4>
                            <span class="text-xs text-slate-400 truncate block">${sc.url}</span>
                        </div>
                    </div>
                    <button type="button" class="btn-del-sc text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer" title="Remover atalho">
                        <i class="fa-regular fa-trash-can text-xs"></i>
                    </button>
                </div>
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button type="button" class="btn-open-sc inline-flex items-center text-xs font-semibold text-slate-800 hover:text-emerald-700 group transition-colors cursor-pointer">
                        Acessar Atalho
                        <svg class="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            `;

            card.querySelector('.btn-open-sc').addEventListener('click', () => {
                if (sc.url.startsWith('#')) {
                    const tabId = sc.url.substring(1);
                    switchTab(tabId, sc.title);
                } else if (sc.url.includes('eventos.html') || sc.url.includes('associado.html')) {
                    window.open(sc.url, '_blank', 'noopener,noreferrer');
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
                const modal = document.getElementById('shortcut-modal');
                if (modal) {
                    document.getElementById('shortcut-title').value = '';
                    document.getElementById('shortcut-url').value = '';
                    modal.style.display = 'flex';
                }
            };
        }
        
        window.saveShortcut = function() {
            const title = document.getElementById('shortcut-title').value.trim();
            const url = document.getElementById('shortcut-url').value.trim();
            if (!title || !url) {
                showToastMessage('Por favor, preencha o nome e o destino do atalho.');
                return;
            }
            
            memberShortcuts.push({
                id: Date.now(),
                title,
                url,
                icon: 'fa-solid fa-arrow-up-right-from-square'
            });
            localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(memberShortcuts));
            renderShortcuts();
            document.getElementById('shortcut-modal').style.display = 'none';
            showToastMessage('Novo atalho criado!');
        };
    }

    // --------------------------------------------------------------------------
    // 5. Aba Cursos & 6. Aba Seminários (Catálogo, Busca, Filtros & Inscrição)
    // --------------------------------------------------------------------------
    function renderCourses() {
        const grid = document.getElementById('courses-grid');
        const myCoursesList = document.getElementById('my-courses-list');
        if (!grid) return;
        grid.innerHTML = '';
        if (myCoursesList) myCoursesList.innerHTML = '';

        // Bind filter inputs only once
        const tabCursos = document.getElementById('tab-cursos');
        if (tabCursos && !tabCursos.dataset.filtersBound) {
            tabCursos.dataset.filtersBound = 'true';
            const searchInput = tabCursos.querySelector('.search-box input');
            const selects = tabCursos.querySelectorAll('.filter-select');

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    courseFilterSearch = e.target.value.toLowerCase().trim();
                    renderCourses();
                });
            }

            if (selects[0]) {
                selects[0].addEventListener('change', (e) => {
                    courseFilterMateria = e.target.value;
                    renderCourses();
                });
            }

            if (selects[1]) {
                selects[1].addEventListener('change', (e) => {
                    courseFilterHoras = e.target.value;
                    renderCourses();
                });
            }
        }

        const filteredCourses = mockCourses.filter(c => {
            const matchesSearch = !courseFilterSearch || 
                c.title.toLowerCase().includes(courseFilterSearch) || 
                c.professor.toLowerCase().includes(courseFilterSearch);

            const matchesMateria = courseFilterMateria === 'Todas as Matérias' || c.materia === courseFilterMateria;

            let matchesHoras = true;
            const hoursNum = parseInt(c.horas, 10) || 0;
            if (courseFilterHoras === 'Até 20h') matchesHoras = hoursNum <= 20;
            else if (courseFilterHoras === 'Mais de 20h') matchesHoras = hoursNum > 20;

            return matchesSearch && matchesMateria && matchesHoras;
        });

        if (filteredCourses.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-10 text-xs sm:text-sm text-slate-400">Nenhum curso encontrado com os filtros selecionados.</div>';
        }

        filteredCourses.forEach(c => {
            const isEnrolled = enrolledCourses.includes(c.id);

            // Card no Catálogo (Seguindo o estilo limpo da tela inicial)
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden flex flex-col justify-between transition-all duration-200';
            card.innerHTML = `
                <div>
                    <div class="h-44 relative bg-slate-100 overflow-hidden">
                        <img src="${c.img}" alt="${c.title}" class="w-full h-full object-cover">
                        <span class="absolute top-3 right-3 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-white/95 text-blue-700 border border-blue-200 shadow-sm">Desconto Associado</span>
                    </div>
                    <div class="p-6 pb-4">
                        <div class="flex items-center gap-2 mb-2.5">
                            <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">${c.materia}</span>
                            <span class="text-xs text-slate-400">• ${c.horas}</span>
                        </div>
                        <h3 class="text-base font-bold text-slate-900 leading-snug">${c.title}</h3>
                        <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <i class="fa-solid fa-chalkboard-user text-slate-400"></i> ${c.professor}
                        </p>
                    </div>
                </div>
                <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex flex-col gap-3">
                    <div class="flex items-baseline gap-2">
                        <span class="text-xs text-slate-400 line-through">${c.precoOriginal}</span>
                        <span class="text-lg font-bold text-emerald-700">${c.precoAssociado}</span>
                    </div>
                    <button type="button" class="btn-enroll-action w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${isEnrolled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' : 'bg-slate-900 hover:bg-emerald-700 text-white shadow-sm'}" ${isEnrolled ? 'disabled' : ''}>
                        ${isEnrolled ? '<i class="fa-solid fa-check mr-1"></i> Inscrito' : 'Garantir Vaga com Desconto'}
                    </button>
                </div>
            `;

            if (!isEnrolled) {
                card.querySelector('.btn-enroll-action').addEventListener('click', () => {
                    enrolledCourses.push(c.id);
                    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(enrolledCourses));
                    renderCourses();
                    showToastMessage('Inscrição realizada com sucesso!');
                });
            }

            grid.appendChild(card);
        });

        // Meus Cursos no Perfil
        if (myCoursesList) {
            const myEnrolledCourses = mockCourses.filter(c => enrolledCourses.includes(c.id));
            if (myEnrolledCourses.length === 0) {
                myCoursesList.innerHTML = '<p class="text-xs sm:text-[13px] text-slate-500 leading-relaxed">Você ainda não possui cursos inscritos. Explore a aba <strong class="text-slate-700">4. Cursos</strong> para se inscrever com desconto.</p>';
            } else {
                myEnrolledCourses.forEach(c => {
                    const myCard = document.createElement('div');
                    myCard.className = 'bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 mb-3 flex items-center justify-between gap-3 flex-wrap';
                    myCard.innerHTML = `
                        <div>
                            <h4 class="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">${c.title}</h4>
                            <span class="text-xs text-slate-500">${c.professor} • ${c.horas}</span>
                        </div>
                        <button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer" onclick="showToastMessage('Acessando sala de aula virtual do curso...')">
                            <i class="fa-solid fa-play text-[10px]"></i> Sala Virtual
                        </button>
                    `;
                    myCoursesList.appendChild(myCard);
                });
            }
        }
    }

    function renderSeminars() {
        const grid = document.getElementById('seminars-grid');
        const mySeminarsList = document.getElementById('my-seminars-list');
        if (!grid) return;
        grid.innerHTML = '';
        if (mySeminarsList) mySeminarsList.innerHTML = '';

        // Bind filter inputs only once
        const tabSeminarios = document.getElementById('tab-seminarios');
        if (tabSeminarios && !tabSeminarios.dataset.filtersBound) {
            tabSeminarios.dataset.filtersBound = 'true';
            const searchInput = tabSeminarios.querySelector('.search-box input');
            const select = tabSeminarios.querySelector('.filter-select');

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    seminarFilterSearch = e.target.value.toLowerCase().trim();
                    renderSeminars();
                });
            }

            if (select) {
                select.addEventListener('change', (e) => {
                    seminarFilterArea = e.target.value;
                    renderSeminars();
                });
            }
        }

        const filteredSeminars = mockSeminars.filter(s => {
            const matchesSearch = !seminarFilterSearch || 
                s.title.toLowerCase().includes(seminarFilterSearch) || 
                s.palestrante.toLowerCase().includes(seminarFilterSearch);

            const matchesArea = seminarFilterArea === 'Todas as Áreas' || s.tema === seminarFilterArea;

            return matchesSearch && matchesArea;
        });

        if (filteredSeminars.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-10 text-xs sm:text-sm text-slate-400">Nenhum seminário encontrado com os filtros selecionados.</div>';
        }

        filteredSeminars.forEach(s => {
            const isEnrolled = enrolledSeminars.includes(s.id);

            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden flex flex-col justify-between transition-all duration-200';
            card.innerHTML = `
                <div>
                    <div class="h-44 relative bg-slate-100 overflow-hidden">
                        <img src="${s.img}" alt="${s.title}" class="w-full h-full object-cover">
                        <span class="absolute top-3 right-3 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-white/95 text-emerald-700 border border-emerald-200 shadow-sm">Exclusivo SBPS</span>
                    </div>
                    <div class="p-6 pb-4">
                        <div class="flex items-center gap-2 mb-2.5">
                            <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${s.tema}</span>
                            <span class="text-xs text-slate-400">• ${s.horas}</span>
                        </div>
                        <h3 class="text-base font-bold text-slate-900 leading-snug">${s.title}</h3>
                        <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <i class="fa-solid fa-user-tie text-slate-400"></i> ${s.palestrante}
                        </p>
                    </div>
                </div>
                <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex flex-col gap-3">
                    <div class="flex items-baseline gap-2">
                        <span class="text-xs text-slate-400 line-through">${s.precoOriginal}</span>
                        <span class="text-lg font-bold text-emerald-700">${s.precoAssociado}</span>
                    </div>
                    <button type="button" class="btn-enroll-action w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${isEnrolled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' : 'bg-slate-900 hover:bg-emerald-700 text-white shadow-sm'}" ${isEnrolled ? 'disabled' : ''}>
                        ${isEnrolled ? '<i class="fa-solid fa-check mr-1"></i> Inscrito' : 'Participar do Seminário'}
                    </button>
                </div>
            `;

            if (!isEnrolled) {
                card.querySelector('.btn-enroll-action').addEventListener('click', () => {
                    enrolledSeminars.push(s.id);
                    localStorage.setItem(STORAGE_KEY_SEMINARS, JSON.stringify(enrolledSeminars));
                    renderSeminars();
                    showToastMessage('Inscrição no seminário efetuada!');
                });
            }

            grid.appendChild(card);
        });

        // Meus Seminários no Perfil
        if (mySeminarsList) {
            const myEnrolledSeminars = mockSeminars.filter(s => enrolledSeminars.includes(s.id));
            if (myEnrolledSeminars.length === 0) {
                mySeminarsList.innerHTML = '<p class="text-xs sm:text-[13px] text-slate-500 leading-relaxed">Você ainda não possui seminários inscritos. Explore a aba <strong class="text-slate-700">5. Seminários</strong> para participar.</p>';
            } else {
                myEnrolledSeminars.forEach(s => {
                    const myCard = document.createElement('div');
                    myCard.className = 'bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 mb-3 flex items-center justify-between gap-3 flex-wrap';
                    myCard.innerHTML = `
                        <div>
                            <h4 class="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">${s.title}</h4>
                            <span class="text-xs text-slate-500">${s.palestrante} • ${s.horas}</span>
                        </div>
                        <button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer" onclick="showToastMessage('Conectando ao canal de transmissão ao vivo...')">
                            <i class="fa-solid fa-video text-[10px]"></i> Transmissão
                        </button>
                    `;
                    mySeminarsList.appendChild(myCard);
                });
            }
        }
    }

    // --------------------------------------------------------------------------
    // 7. Aba Certificados (Consulta de Certificados Emitidos & Download PDF)
    // --------------------------------------------------------------------------

    async function renderCertificates() {
        const list = document.getElementById('certificates-list');
        if (!list) return;
        list.innerHTML = '<p class="text-xs text-slate-500 py-4"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Carregando certificados do Supabase...</p>';

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
                        (userEmail && c.email.toLowerCase() === userEmail.toLowerCase()) || 
                        (userCpf && c.cpf && c.cpf === userCpf)
                    );
                }
            } catch (err) {
                console.error('Erro ao processar certificados do Supabase:', err);
            }
        }

        list.innerHTML = '';

        if (!certsToDisplay || certsToDisplay.length === 0) {
            list.innerHTML = `
                <div class="bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mx-auto mb-3">
                        <svg class="w-6 h-6 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="10" r="6" stroke-linecap="round" stroke-linejoin="round"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 10l2 2 4-4"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 16l-2 5 4-2 4 2-2-5"/>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-slate-900 mb-1">Nenhum certificado emitido</h3>
                    <p class="text-xs sm:text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">Não há certificados registrados para o e-mail <strong class="text-slate-700">${userEmail || 'conectado'}</strong> na base de dados do Supabase.</p>
                </div>
            `;
            return;
        }

        certsToDisplay.forEach(cert => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl p-5 border border-slate-200 custom-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3.5 transition-all';

            const emailTarget = userEmail || cert.email || '';
            const driveLink = cert.driveUrl || cert.drive_url || cert.pdfUrl || '';

            card.innerHTML = `
                <div class="flex items-start gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                        <svg class="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="10" r="6" stroke-linecap="round" stroke-linejoin="round"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 10l2 2 4-4"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 16l-2 5 4-2 4 2-2-5"/>
                        </svg>
                    </div>
                    <div>
                        <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${cert.type}</span>
                        <h4 class="text-sm sm:text-base font-bold text-slate-900 mt-1.5">${cert.title}</h4>
                        <span class="text-xs text-slate-500 block mt-0.5">Carga Horária: ${cert.horas} • Emitido em: ${cert.data}</span>
                    </div>
                </div>
                <div class="flex gap-2.5 flex-wrap">
                    <button type="button" class="btn-download-pdf inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer">
                        <i class="fa-solid fa-file-pdf"></i> Baixar PDF
                    </button>
                    <button type="button" class="btn-view-cert inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Visualizar
                    </button>
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
        const webhookUrl = `https://n8n.motaadv.net/webhook/download-certificado?id=${encodeURIComponent(certId)}&email=${encodeURIComponent(email)}`;

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

            const defaultName = (currentUser && currentUser.nome) 
                ? `Certificado - ${currentUser.nome}.pdf` 
                : 'Certificado - SBPS.pdf';

            if (filename) {
                // Se o n8n enviou a expressão literal não avaliada {{ $binary... }}, descarta e usa o nome limpo
                if (filename.includes('{{') || filename.includes('$') || filename.includes('binary')) {
                    filename = defaultName;
                } else if (!filename.toLowerCase().endsWith('.pdf')) {
                    filename += '.pdf';
                }
            } else {
                filename = defaultName;
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
                    <img src="../images/logo.png" alt="SBPS Logo" style="height:56px; margin:0 auto 15px auto;">
                    <h2 style="color:var(--assoc-primary); font-size:1.6rem; font-weight:700; margin-bottom:10px;">CERTIFICADO DE ${cert.type ? cert.type.toUpperCase() : 'CONCLUSÃO'}</h2>
                    <p style="font-size:0.95rem; color:#475569; line-height:1.8;">
                        Certificamos que <strong>${currentUser ? currentUser.nome : 'Associado(a)'}</strong>, portador(a) do registro OAB/Documento <strong>${currentUser ? currentUser.oab : 'Pessoa Física'}</strong>, concluiu com êxito o ${cert.type || 'evento'} de <strong>"${cert.title}"</strong> promovido pela Sociedade Brasileira de Previdência Social (SBPS), perfazendo carga horária total de <strong>${cert.horas}</strong>.
                    </p>
                    <br>
                    <p style="font-size:0.85rem; color:#64748b;">Recife/PE, ${cert.data}</p>
                    <br>
                    <div style="display:flex; justify-content:space-around; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:15px;">
                        <div>
                            <strong style="font-size:0.88rem; color:#0f172a;">Diretoria Acadêmica SBPS</strong>
                        </div>
                        <div>
                            <strong style="font-size:0.88rem; color:#0f172a;">Presidente Executivo</strong>
                        </div>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
                    <button type="button" id="btn-modal-dl-pdf" class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer"><i class="fa-solid fa-download"></i> Baixar PDF Seguro</button>
                    ${driveLink && driveLink !== '#' ? `<a href="${driveLink}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors no-underline"><i class="fa-brands fa-google-drive"></i> Abrir no Google Drive</a>` : ''}
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
    function renderTemplates() {
        const grid = document.getElementById('templates-grid');
        if (!grid) return;
        grid.innerHTML = '';

        // Bind category button clicks once
        const tabTemplates = document.getElementById('tab-templates');
        if (tabTemplates && !tabTemplates.dataset.catsBound) {
            tabTemplates.dataset.catsBound = 'true';
            const catButtons = tabTemplates.querySelectorAll('.template-cat-btn');
            const catMap = ['all', 'pecas', 'docs', 'planilhas', 'design'];

            catButtons.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    catButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentTemplateCategory = catMap[index] || 'all';
                    renderTemplates();
                });
            });
        }

        const filtered = mockTemplates.filter(t => currentTemplateCategory === 'all' || t.cat === currentTemplateCategory);

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-10 text-xs sm:text-sm text-slate-400">Nenhum template encontrado para esta categoria.</div>';
        }

        filtered.forEach(t => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl p-6 border border-slate-200 custom-shadow transition-all duration-200 flex flex-col justify-between';
            
            const badgeReal = t.isReal ? '<span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-file-word mr-1"></i>Arquivo Oficial</span>' : '';
            
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-800 shrink-0">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2.5" y="3" width="19" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/>
                                <line x1="2.5" y1="7.5" x2="21.5" y2="7.5" stroke="currentColor" stroke-width="1.5"/>
                                <circle cx="5.5" cy="5.2" r="0.8" fill="currentColor"/>
                                <circle cx="8" cy="5.2" r="0.8" fill="currentColor"/>
                                <circle cx="10.5" cy="5.2" r="0.8" fill="currentColor"/>
                                <rect x="5" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
                                <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
                                <rect x="15" y="10" width="4" height="8" rx="0.5" fill="currentColor"/>
                                <rect x="5" y="15" width="9" height="3" rx="0.5" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="flex items-center gap-1.5 flex-wrap justify-end">
                            ${badgeReal}
                            ${t.formats.map(f => `<span class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">${f}</span>`).join('')}
                        </div>
                    </div>
                    <h4 class="text-base font-bold text-slate-900 leading-snug">${t.title}</h4>
                    <p class="text-slate-500 text-xs mt-2 leading-relaxed">${t.desc || 'Modelo advocatício editável e pronto para preenchimento imediato.'}</p>
                </div>
                <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button type="button" class="btn-view-tpl inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-colors cursor-pointer">
                        <i class="fa-solid fa-eye text-emerald-600"></i> Visualizar
                    </button>
                    <button type="button" class="btn-dl-tpl inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer">
                        <i class="fa-solid fa-download"></i> Baixar ${t.formats[0] || 'Arquivo'}
                    </button>
                </div>
            `;

            // Botão Visualizar
            card.querySelector('.btn-view-tpl').addEventListener('click', () => {
                openTemplateViewer(t);
            });

            // Botão Baixar
            card.querySelector('.btn-dl-tpl').addEventListener('click', () => {
                downloadTemplateFile(t);
            });

            grid.appendChild(card);
        });
    }

    function downloadTemplateFile(tpl) {
        if (tpl.filePath) {
            const link = document.createElement('a');
            link.href = tpl.filePath;
            link.download = tpl.filename || (tpl.title + '.docx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToastMessage(`Download de "${tpl.title}" iniciado com sucesso!`);
        } else {
            // Download simulado com arquivo de texto gerado instantaneamente
            const content = `SBPS - Sociedade Brasileira de Previdência Social\nModelo: ${tpl.title}\nCategoria: ${tpl.cat}\n\nDocumento gerado para associado SBPS.\nUtilize este conteúdo em seu software jurídico de preferência.`;
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${tpl.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToastMessage(`Download de "${tpl.title}" concluído!`);
        }
    }

    function openTemplateViewer(tpl) {
        let modal = document.getElementById('modal-tpl-viewer');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-tpl-viewer';
            modal.className = 'assoc-modal';
            modal.innerHTML = `
                <div class="assoc-modal-content" style="max-width: 820px; max-height: 92vh; display: flex; flex-direction: column;">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                                <i class="fa-solid fa-file-lines"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-slate-900 m-0 leading-tight" id="tpl-viewer-title">Visualizar Modelo</h3>
                                <p class="text-xs text-slate-500 m-0 mt-0.5" id="tpl-viewer-subtitle">Visualização do documento na íntegra</p>
                            </div>
                        </div>
                        <button type="button" class="close-tpl-viewer text-slate-400 hover:text-slate-700 text-2xl font-bold cursor-pointer transition-colors p-1" style="background:none; border:none; line-height:1;">&times;</button>
                    </div>

                    <!-- Folha A4 Simulação Visual -->
                    <div id="tpl-viewer-body" class="overflow-y-auto flex-1 p-6 sm:p-8 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-sans" style="max-height: 60vh; font-family: 'Times New Roman', Times, serif; background-color: #fafbfc;">
                        <!-- Conteúdo injetado dinamicamente -->
                    </div>

                    <!-- Rodapé com Ações -->
                    <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 flex-wrap gap-3">
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <i class="fa-solid fa-shield-halved text-emerald-600"></i> Modelo oficial verificado pela SBPS
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" id="btn-tpl-copy-text" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer">
                                <i class="fa-regular fa-copy"></i> Copiar Texto
                            </button>
                            <button type="button" id="btn-tpl-download-direct" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer">
                                <i class="fa-solid fa-download"></i> Baixar Arquivo Original
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.close-tpl-viewer').onclick = () => modal.classList.remove('show');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('show');
            });
        }

        const titleEl = modal.querySelector('#tpl-viewer-title');
        const subtitleEl = modal.querySelector('#tpl-viewer-subtitle');
        const bodyEl = modal.querySelector('#tpl-viewer-body');
        const btnDownload = modal.querySelector('#btn-tpl-download-direct');
        const btnCopy = modal.querySelector('#btn-tpl-copy-text');

        titleEl.textContent = tpl.title;
        subtitleEl.textContent = tpl.filename ? `Arquivo: ${tpl.filename} • Disponível para download imediato` : 'Modelo padrão SBPS';

        let rawTextToCopy = '';

        if (realTemplatesData[tpl.id]) {
            const data = realTemplatesData[tpl.id];
            const htmlParts = data.paragraphs.map(p => {
                if (p.type === 'title') {
                    return `<div class="text-center font-bold text-base sm:text-lg mb-6 pb-2 border-b border-slate-300 tracking-wide text-slate-900">${escapeHTML(p.text)}</div>`;
                }
                if (p.type === 'section') {
                    return `<div class="font-bold text-slate-900 mt-4 mb-2 uppercase text-xs sm:text-sm tracking-wider">${escapeHTML(p.text)}</div>`;
                }
                if (p.type === 'lead') {
                    return `<div class="font-semibold text-slate-800 italic mb-4 leading-relaxed">${escapeHTML(p.text)}</div>`;
                }
                if (p.type === 'quote') {
                    return `<div class="my-3 p-3 bg-amber-50/70 border-l-4 border-amber-400 text-slate-700 rounded-r-md leading-relaxed italic">${escapeHTML(p.text)}</div>`;
                }
                if (p.type === 'hr') {
                    return `<hr class="my-4 border-slate-300">`;
                }
                if (p.type === 'meta') {
                    return `<div class="text-[11px] text-slate-500 mb-1 leading-snug"><strong>${escapeHTML(p.text.split(':')[0])}:</strong>${escapeHTML(p.text.substring(p.text.indexOf(':') + 1))}</div>`;
                }
                if (p.type === 'blank') {
                    return `<div class="h-3"></div>`;
                }
                if (p.type === 'sign') {
                    return `<div class="mt-8 text-center text-slate-700 whitespace-pre-line font-medium">${escapeHTML(p.text)}</div>`;
                }
                if (p.type === 'date') {
                    return `<div class="mt-6 text-right text-slate-600 italic">${escapeHTML(p.text)}</div>`;
                }
                return `<div class="mb-3 text-slate-700 leading-relaxed text-justify">${escapeHTML(p.text)}</div>`;
            });
            bodyEl.innerHTML = `
                <div class="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-sm border border-slate-200">
                    ${htmlParts.join('')}
                </div>
            `;
            rawTextToCopy = data.paragraphs.map(p => p.text).filter(Boolean).join('\n\n');
        } else {
            // Template padrão
            bodyEl.innerHTML = `
                <div class="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-sm border border-slate-200">
                    <div class="text-center font-bold text-base sm:text-lg mb-6 pb-2 border-b border-slate-300 text-slate-900">${escapeHTML(tpl.title)}</div>
                    <div class="font-bold text-slate-900 mt-4 mb-2">EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DA ___ VARA DA SUBSEÇÃO JUDICIÁRIA</div>
                    <p class="mb-4 text-slate-700 leading-relaxed text-justify">[QUALIFICAÇÃO COMPLETA DA PARTE AUTORA: Nome completo, nacionalidade, estado civil, profissão, portador do RG nº ..., inscrito no CPF sob o nº ..., residente e domiciliado em ...], por seu advogado infra-assinado, com instrumento de mandato anexo, vem, respeitosamente, à presença de Vossa Excelência, propor a presente:</p>
                    <div class="text-center font-bold text-slate-900 my-4 uppercase tracking-wider">${escapeHTML(tpl.title)}</div>
                    <p class="mb-3 text-slate-700 leading-relaxed text-justify">em face do <strong>INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS)</strong>, pessoa jurídica de direito público, pelos fatos e fundamentos jurídicos a seguir expostos.</p>
                    <div class="font-bold text-slate-900 mt-5 mb-2">I - DOS FATOS</div>
                    <p class="mb-3 text-slate-700 leading-relaxed text-justify">A parte autora pleiteou perante a Autarquia Previdenciária a concessão do benefício em comento, o qual foi indevidamente indeferido/cessado.</p>
                    <div class="font-bold text-slate-900 mt-5 mb-2">II - DO DIREITO</div>
                    <p class="mb-3 text-slate-700 leading-relaxed text-justify">Conforme legislação previdenciária de regência (Lei nº 8.213/91) e sólida jurisprudência dos Tribunais Regionais Federais e do Superior Tribunal de Justiça, restam preenchidos todos os requisitos legais.</p>
                    <div class="font-bold text-slate-900 mt-5 mb-2">III - DOS PEDIDOS</div>
                    <p class="mb-2 text-slate-700 leading-relaxed">Ante o exposto, requer a citação do Réu, a total procedência da demanda e a condenação do INSS ao pagamento das parcelas vencidas e vincendas acrescidas de juros e correção monetária.</p>
                    <div class="mt-8 text-right text-slate-600 italic">Nestes termos, pede deferimento.</div>
                    <div class="mt-6 text-center text-slate-700">__________________________________________<br>Advogado(a) - OAB/___ nº ______</div>
                </div>
            `;
            rawTextToCopy = `${tpl.title}\n\nEXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DA ___ VARA DA SUBSEÇÃO JUDICIÁRIA\n\n[QUALIFICAÇÃO COMPLETA DA PARTE AUTORA], vem propor a presente demanda em face do INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS)...\n\nNestes termos, pede deferimento.`;
        }

        btnDownload.onclick = () => {
            downloadTemplateFile(tpl);
        };

        btnCopy.onclick = () => {
            navigator.clipboard.writeText(rawTextToCopy).then(() => {
                showToastMessage('Texto do template copiado para a área de transferência!');
            }).catch(() => {
                showToastMessage('Não foi possível copiar o texto automaticamente.');
            });
        };

        requestAnimationFrame(() => modal.classList.add('show'));
    }

    function openTemplateEditor(tpl) {
        // Redireciona para o novo visualizador integrado com download
        openTemplateViewer(tpl);
    }

    window.renderTemplates = renderTemplates;
    window.downloadTemplateFile = downloadTemplateFile;
    window.openTemplateViewer = openTemplateViewer;
    window.openTemplateById = function(id) {
        const found = mockTemplates.find(t => String(t.id) === String(id));
        if (found) openTemplateViewer(found);
    };
    window.downloadTemplateById = function(id) {
        const found = mockTemplates.find(t => String(t.id) === String(id));
        if (found) downloadTemplateFile(found);
    };
    window.filterTemplatesByCategory = function(cat, btnEl) {
        const tabTemplates = document.getElementById('tab-templates');
        if (tabTemplates) {
            const catButtons = tabTemplates.querySelectorAll('.template-cat-btn');
            catButtons.forEach(b => b.classList.remove('active'));
        }
        if (btnEl) btnEl.classList.add('active');
        currentTemplateCategory = cat || 'all';
        renderTemplates();
    };

    // --------------------------------------------------------------------------
    // 9. Aba Livraria (Ebooks, Livros Físicos e Vitrine de Autores)
    // --------------------------------------------------------------------------
    function renderLivraria() {
        const showcaseGrid = document.getElementById('author-books-grid');
        if (!showcaseGrid) return;
        showcaseGrid.innerHTML = '';

        authorBooks.forEach(b => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl p-6 border border-slate-200 custom-shadow transition-all duration-200 flex flex-col justify-between';
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                            <svg class="w-6 h-6" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 8L16 3L27 8L16 13L5 8Z"/>
                                <path d="M5 8V12L16 17L27 12V8"/>
                                <path d="M9 10V18L12 16L15 18V12" fill="#047857" stroke="none"/>
                                <path d="M5 15V19L16 24L27 19V15"/>
                                <path d="M5 22V26L16 31L27 26V22"/>
                            </svg>
                        </div>
                        <span class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${b.preco}</span>
                    </div>
                    <h4 class="text-base font-bold text-slate-900 leading-snug">${b.title}</h4>
                    <span class="text-xs font-medium text-slate-400 block mt-1">Autor(a): <strong class="text-slate-600">${b.autor}</strong></span>
                    <p class="text-slate-500 text-xs sm:text-[13px] mt-2.5 leading-relaxed">${b.desc}</p>
                </div>
                <div class="mt-5 pt-3 border-t border-slate-100">
                    <button type="button" onclick="showToastMessage('Abrindo detalhes da obra: ${b.title.replace(/'/g, "\\'")}')" class="inline-flex items-center text-xs font-semibold text-slate-800 hover:text-emerald-700 group transition-colors cursor-pointer">
                        Consultar Obra
                        <svg class="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            `;
            showcaseGrid.appendChild(card);
        });

        const btnPublish = document.getElementById('btn-publish-book');
        btnAddBookModal(btnPublish);
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

        if (ticketsList) {
            ticketsList.innerHTML = '';
            if (activeTickets.length === 0) {
                ticketsList.innerHTML = '<p class="text-xs text-slate-400">Nenhum chamado aberto no momento.</p>';
            } else {
                activeTickets.forEach(t => {
                    const item = document.createElement('div');
                    item.className = 'bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-3 flex-wrap';
                    item.innerHTML = `
                        <div>
                            <strong class="text-xs sm:text-sm font-bold text-slate-900 block"># Chamado: ${t.assunto}</strong>
                            <span class="text-xs text-slate-500">Tema: ${t.tema} • Data: ${t.data}</span>
                        </div>
                        <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${t.status}</span>
                    `;
                    ticketsList.appendChild(item);
                });
            }
        }

        if (formTicket && !formTicket.dataset.ticketBound) {
            formTicket.dataset.ticketBound = 'true';
            formTicket.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Verifica o limite de 3 chamados abertos
                const openCount = activeTickets.filter(t => t.status !== 'Resolvido').length;
                if (openCount >= 3) {
                    alert('Você atingiu o limite máximo de 3 chamados de suporte abertos em simultâneo. Aguarde a resolução de um dos seus chamados para abrir um novo.');
                    return;
                }

                const btnSubmit = document.getElementById('btn-submit-ticket');
                if (btnSubmit) {
                    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
                    btnSubmit.disabled = true;
                }

                const assunto = document.getElementById('ticket-assunto').value;
                const tema = document.getElementById('ticket-tema').value;
                const desc = document.getElementById('ticket-desc').value;
                const contato = document.getElementById('ticket-contato').value;
                const canal = document.querySelector('input[name="ticket-canal"]:checked').value;

                const payload = {
                    Canal: canal,
                    tema: tema + ' - ' + assunto,
                    id: contato,
                    Mensagem: desc
                };

                try {
                    const response = await fetch("https://n8n.motaadv.net/webhook/suporte", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error('Erro na requisição para o webhook');
                    }

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

                } catch (err) {
                    console.error('Erro ao enviar o chamado:', err);
                    alert('Ocorreu um erro ao enviar o seu chamado. Tente novamente mais tarde.');
                } finally {
                    if (btnSubmit) {
                        btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Chamado de Suporte';
                        btnSubmit.disabled = false;
                    }
                }
            });
        }
    }

});


// Dropdown de perfil
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('user-profile-trigger');
    const dropdown = document.getElementById('user-profile-dropdown');
    
    if(trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
});
