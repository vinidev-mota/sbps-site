/* ==========================================================================
   ÁREA DE EVENTOS - LÓGICA E REGRAS DE NEGÓCIO (PADRÃO PORTAL DO ASSOCIADO SBPS)
   Sociedade Brasileira de Previdência Social (SBPS)
   ========================================================================== */

(function () {
    'use strict';

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Utilitário Global de Senha e Toast (Independente de script.js)
    window.togglePasswordVisibility = function (inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const icon = btn ? btn.querySelector('i') : null;
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        } else {
            input.type = 'password';
            if (icon) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    };

    let toastTimeout = null;
    function showToast(msg) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;
        msgEl.textContent = msg;
        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3200);
    }
    window.showToast = showToast;

    window.toggleAiChatDrawer = function () {
        const drawer = document.getElementById('ai-chat-window');
        if (!drawer) return;
        if (drawer.classList.contains('translate-x-full')) {
            drawer.classList.remove('translate-x-full');
            drawer.classList.add('translate-x-0');
            const input = document.getElementById('ai-input-text');
            if (input) setTimeout(() => input.focus(), 150);
        } else {
            drawer.classList.add('translate-x-full');
            drawer.classList.remove('translate-x-0');
        }
    };
    window.toggleSpeakerChatDrawer = window.toggleAiChatDrawer;

    window.openLogoutModalEventos = function () {
        const modal = document.getElementById('logout-modal');
        if (modal) modal.style.display = 'flex';
    };

    // Modais e Gavetas Executivos do Palestrante & Participante
    window.openCreateProposalModal = function () {
        const modal = document.getElementById('proposalModal');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeCreateProposalModal = function () {
        const modal = document.getElementById('proposalModal');
        if (modal) modal.classList.add('hidden');
    };

    window.handleProposalSubmit = function (e) {
        e.preventDefault();
        const titleInput = document.getElementById('propTitle');
        const hoursInput = document.getElementById('propHours');
        const formatInput = document.getElementById('propFormat');
        const ementaInput = document.getElementById('propEmenta');
        const title = titleInput ? titleInput.value.trim() : 'Nova Palestra SBPS';
        const hours = hoursInput ? hoursInput.value : '2h';
        const format = formatInput ? formatInput.value : 'Online Ao Vivo (Zoom SBPS)';
        const ementa = ementaInput ? ementaInput.value.trim() : 'Proposta pedagógica submetida pelo corpo docente.';

        const novoEvento = {
            id: 'evt-' + Date.now(),
            titulo: title,
            tipo: 'workshop / palestra',
            dateStr: '18/11/2026 às 19:00',
            cargaHoraria: hours,
            palavraChave: 'PROPOSTA_DOCENTE',
            local: format,
            valor: 'Gratuito para Associados',
            resumo: ementa,
            programacao: 'Exposição prática + 30 minutos para perguntas ao vivo dos associados.',
            palestrante: state.currentUser ? state.currentUser.nome : 'Prof. Thiago',
            palestrante_email: state.currentUser ? state.currentUser.email : 'thiago@sbps.org.br',
            status: 'Ativo',
            tema: 'RGPS',
            area: 'Direito Previdenciário'
        };

        state.events.unshift(novoEvento);
        saveData();
        window.closeCreateProposalModal();
        if (titleInput) titleInput.value = '';
        if (ementaInput) ementaInput.value = '';
        showToast('Proposta "' + title + '" enviada para a Diretoria Científica!');
        if (state.currentTab === 'dashboard' || state.currentTab === 'meus-eventos') {
            renderTabContent(state.currentTab);
        }
    };

    window.openUploadSlidesModal = function (eventName) {
        const sub = document.getElementById('slideModalSubtitle');
        const fileSpan = document.getElementById('fileNameSelected');
        const modal = document.getElementById('uploadSlidesModal');
        if (sub) sub.textContent = 'Palestra: ' + (eventName || 'Evento Selecionado');
        if (fileSpan) fileSpan.textContent = '';
        if (modal) modal.classList.remove('hidden');
    };

    window.closeUploadSlidesModal = function () {
        const modal = document.getElementById('uploadSlidesModal');
        if (modal) modal.classList.add('hidden');
    };

    window.previewUpload = function (input) {
        const fileSpan = document.getElementById('fileNameSelected');
        if (input && input.files && input.files[0] && fileSpan) {
            fileSpan.textContent = 'Arquivo selecionado: ' + input.files[0].name;
        }
    };

    window.handleSlideUpload = function (e) {
        e.preventDefault();
        window.closeUploadSlidesModal();
        showToast('Material didático atualizado com sucesso no servidor SBPS!');
    };

    window.openAttendeesModal = function (eventName, count) {
        const nameEl = document.getElementById('attEventName');
        const countEl = document.getElementById('attCount');
        const modal = document.getElementById('attendeesModal');
        if (nameEl) nameEl.textContent = 'Inscritos: ' + (eventName || 'Evento SBPS');
        if (countEl) countEl.textContent = (count || 142) + ' associados inscritos confirmados';
        if (modal) modal.classList.remove('hidden');
    };

    window.closeAttendeesModal = function () {
        const modal = document.getElementById('attendeesModal');
        if (modal) modal.classList.add('hidden');
    };

    window.openTopicsDrawer = function () {
        const drawer = document.getElementById('topicsDrawer');
        if (drawer) drawer.classList.remove('translate-x-full');
    };

    window.closeTopicsDrawer = function () {
        const drawer = document.getElementById('topicsDrawer');
        if (drawer) drawer.classList.add('translate-x-full');
    };

    window.adoptTopic = function (topicName) {
        window.closeTopicsDrawer();
        window.openCreateProposalModal();
        const propTitle = document.getElementById('propTitle');
        if (propTitle) propTitle.value = 'Workshop: ' + topicName;
        showToast('Tema selecionado! Complete a proposta pedagógica.');
    };

    window.openSpeakerRoomModal = function (eventName) {
        window.openGenericModal(
            'Sala Virtual do Instrutor — ' + (eventName || 'Transmissão Ao Vivo'),
            'Acesso à transmissão com controle de áudio, slides e visualização de perguntas enviadas no chat pelos alunos e associados da SBPS.'
        );
    };

    window.openGenericModal = function (title, desc) {
        const t = document.getElementById('gModalTitle');
        const d = document.getElementById('gModalDesc');
        const m = document.getElementById('genericModal');
        if (t) t.textContent = title || 'Informação';
        if (d) d.textContent = desc || '';
        if (m) m.classList.remove('hidden');
    };

    window.closeGenericModal = function () {
        const m = document.getElementById('genericModal');
        if (m) m.classList.add('hidden');
    };

    window.switchSpeakerTab = function (key, btn) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
            b.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
        });

        if (btn && btn.classList.contains('tab-btn')) {
            btn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
            btn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        }

        if (key === 'publicadas') {
            switchTab('meus-eventos', true);
            showToast('Exibindo: Eventos Publicados sob sua Coordenação');
        } else if (key === 'historico') {
            switchTab('realizados', true);
            showToast('Exibindo: Palestras Ministradas e Avaliações de Ouvintes');
        } else if (key === 'comunidade') {
            switchTab('comunidade', true);
            showToast('Abrindo: Fórum do Corpo Docente e Instrutores SBPS');
        } else {
            switchTab('dashboard', true);
        }
    };

    // Fechar modais ao clicar no backdrop
    window.addEventListener('click', function (e) {
        const g = document.getElementById('genericModal');
        const p = document.getElementById('proposalModal');
        const s = document.getElementById('uploadSlidesModal');
        const a = document.getElementById('attendeesModal');
        if (g && e.target === g) window.closeGenericModal();
        if (p && e.target === p) window.closeCreateProposalModal();
        if (s && e.target === s) window.closeUploadSlidesModal();
        if (a && e.target === a) window.closeAttendeesModal();
    });

    // Catálogo Centralizado de Abas e Ícones SVG (Exatamente os 8 ícones da referência)
    const TAB_DEFINITIONS = {
        'dashboard': {
            numTitle: 'Painel Geral',
            shortTitle: 'Painel Geral',
            desc: 'Visão executiva de métricas, apresentações confirmadas, pautas demandadas e certificações.',
            iconBoxClass: 'bg-slate-100 text-slate-900',
            badge: null,
            svg: `<svg class="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>`
        },
        'perfil': {
            numTitle: 'Perfil & Credenciais Acadêmicas',
            shortTitle: 'Perfil',
            desc: 'Edição de mini-currículo, foto oficial para banners, titulação acadêmica, dados cadastrais e links do Lattes/LinkedIn.',
            cta: 'Acessar Perfil',
            iconBoxClass: 'bg-slate-50 border border-slate-200/80 text-slate-700',
            badge: { text: 'Credenciais SBPS', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>`
        },
        'criar-eventos': {
            numTitle: 'Propor & Publicar Novo Evento / Palestra',
            shortTitle: 'Propor Palestra',
            desc: 'Submeta propostas de workshops ou publique diretamente simpósios, palestras e cursos na grade acadêmica SBPS.',
            cta: 'Propor Palestra',
            isHighlightPlus: true,
            iconBoxClass: 'bg-emerald-50/80 border border-emerald-200 text-emerald-700',
            badge: { text: 'Coordenação Científica', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>`
        },
        'eventos': {
            numTitle: 'Explorar Eventos & Workshops Disponíveis',
            shortTitle: 'Explorar Eventos',
            desc: 'Confira a agenda oficial de simpósios, workshops práticos, congressos e cursos com inscrições abertas.',
            cta: 'Explorar Eventos',
            isHighlightPlus: true,
            iconBoxClass: 'bg-emerald-50/80 border border-emerald-200 text-emerald-700',
            badge: { text: 'Inscrições Abertas', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>`
        },
        'meus-eventos': {
            numTitle: 'Minhas Palestras e Eventos Publicados',
            shortTitle: 'Minhas Palestras',
            desc: 'Gerencie os eventos e workshops sob sua coordenação, envie materiais didáticos (PDF/PPTX) e acompanhe a lista de inscritos.',
            cta: 'Gerenciar Palestras',
            iconBoxClass: 'bg-blue-50 border border-blue-200/80 text-blue-700',
            badge: { text: 'Gestão do Ministrante', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>`
        },
        'inscricoes': {
            numTitle: 'Minhas Inscrições & Agenda Confirmada',
            shortTitle: 'Minhas Inscrições',
            desc: 'Acompanhe os eventos, simpósios e workshops nos quais sua inscrição está confirmada, baixe materiais e acesse o link de transmissão.',
            cta: 'Minhas Inscrições',
            iconBoxClass: 'bg-blue-50 border border-blue-200/80 text-blue-700',
            badge: { text: 'Inscrições Ativas', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>`
        },
        'realizados': {
            numTitle: 'Histórico de Palestras Ministradas & Certificados',
            shortTitle: 'Histórico Ministrado',
            desc: 'Portfólio acadêmico de aulas, simpósios e workshops concluídos com avaliação dos ouvintes e certificados de docência.',
            cta: 'Ver Histórico',
            iconBoxClass: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
            badge: { text: '14 Certificações Docentes', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>`
        },
        'participacoes': {
            numTitle: 'Histórico de Participações & Certificados Emitidos',
            shortTitle: 'Histórico & Certificados',
            desc: 'Consulte os eventos, simpósios e workshops concluídos e faça a emissão imediata dos seus certificados oficiais em PDF.',
            cta: 'Ver Certificados',
            iconBoxClass: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
            badge: { text: 'Certificação Oficial SBPS', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>`
        },
        'comunidade': {
            numTitle: 'Fórum Docente & Comunidade Previdenciária',
            shortTitle: 'Fórum & Comunidade',
            desc: 'Fórum técnico de debates jurídicos, mural científico da SBPS, salas de grupos temáticos e diretório geolocalizado.',
            cta: 'Acessar Fórum',
            iconBoxClass: 'bg-slate-50 border border-slate-200/80 text-slate-700',
            badge: { text: 'Corpo Docente & Membros', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>`
        },
        'sugestoes': {
            numTitle: 'Banco de Pautas Solicitadas & Temas Demandados',
            shortTitle: 'Pautas Solicitadas',
            desc: 'Temas mais votados pelos associados da SBPS aguardando professores interessados em ministrar ou novas sugestões.',
            cta: 'Ver Pautas Solicitadas',
            iconBoxClass: 'bg-amber-50 border border-amber-200 text-amber-700',
            badge: { text: 'Demanda dos Associados', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
            svg: `<svg class="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>`
        },
        'ajuda': {
            numTitle: 'Recursos, Kit Oficial & Suporte Acadêmico',
            shortTitle: 'Recursos & Ajuda',
            desc: 'Termo de cessão de direitos, template oficial de slides (.PPTX), manual de identidade visual e canal direto com a coordenação.',
            cta: 'Acessar Recursos',
            iconBoxClass: 'bg-slate-50 border border-slate-200/80 text-slate-700',
            badge: { text: 'Suporte Técnico SBPS', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            svg: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8" cy="12" r="1.25" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.25" fill="currentColor"/>
                    <circle cx="16" cy="12" r="1.25" fill="currentColor"/>
                  </svg>`
        }
    };

    function renderStandardTabHeader(tabId, rightElementHTML = '') {
        const def = TAB_DEFINITIONS[tabId] || TAB_DEFINITIONS['eventos'];
        let badgeOrRight = rightElementHTML;
        if (!badgeOrRight && def.badge) {
            badgeOrRight = `<span class="self-start sm:self-auto px-2.5 py-1 text-xs font-medium rounded-lg border ${def.badge.cls}">${def.badge.text}</span>`;
        }
        return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                <div class="flex items-start sm:items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl ${def.iconBoxClass} flex items-center justify-center shrink-0">
                        ${def.svg}
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 leading-tight">${def.numTitle}</h2>
                        <p class="text-slate-500 text-xs sm:text-[13px] mt-0.5">${def.desc}</p>
                    </div>
                </div>
                ${badgeOrRight}
            </div>
        `;
    }

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
        },
        {
            id: 'evt-104',
            titulo: 'Webinar Introdutório: Prática no INSS Digital e Meu INSS',
            tipo: 'webinar online',
            dateStr: '15/09/2026 às 19:30',
            cargaHoraria: '4h',
            palavraChave: 'INSS_DIGITAL_2026',
            local: 'Online via YouTube SBPS',
            valor: 'Gratuito',
            resumo: 'Aprenda os primeiros passos para protocolar requerimentos administrativos sem exigências indevidas.',
            programacao: '19:30 Abertura | 20:00 Acesso ao Meu INSS Gov.br | 21:00 Perguntas e Respostas',
            palestrante: 'Dr. Roberto Mota',
            palestrante_email: 'roberto.mota@sbps.org.br',
            img: '../images/ref1.jpg',
            status: 'Ativo',
            tema: 'RGPS',
            area: 'Direito Previdenciário'
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
        members: [
            { email: 'roberto.mota@sbps.org.br', nome: 'Dr. Roberto Mota', role: 'palestrante', bio: 'Advogado previdenciarista com 12 anos de experiência.', interesses: 'RPPS, Cálculos, Planejamento', linkedin: 'linkedin.com/in/robertomota', instagram: '@robertomota', exibirLocal: true, lat: -8.047562, lng: -34.877002 },
            { email: 'ana.silveira@adv.com.br', nome: 'Dra. Ana Silveira', role: 'participante', bio: 'Foco em perícias médicas e benefícios por incapacidade.', interesses: 'BPC, Perícia Médica', linkedin: '', instagram: '@anasilveira.adv', exibirLocal: true, lat: -23.550520, lng: -46.633308 }
        ],
        groups: [
            { id: 'grp-1', nome: 'Jovem Advocacia', descricao: 'Espaço para advogados iniciantes trocarem dicas.', membrosCount: 45 },
            { id: 'grp-2', nome: 'Especialistas em RPPS', descricao: 'Discussões avançadas sobre Regimes Próprios.', membrosCount: 12 }
        ],
        notices: [
            { id: 'not-1', titulo: 'Edital para Novos Artigos', data: '15/08/2026', conteudo: 'A Revista Científica da SBPS está aceitando novos artigos até o dia 30/09.' }
        ],
        chats: [
            { id: 'msg-1', tipo: 'group', targetId: 'grp-1', remetente: 'Dr. Roberto Mota', mensagem: 'Sejam bem-vindos ao grupo!', timestamp: '10:00' }
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
        const hasSession = checkActiveSession();
        if (!hasSession) {
            const lastRole = localStorage.getItem('sbps_evt_last_role');
            if (lastRole) {
                selectUserRole(lastRole);
            }
        }
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

        const storedMembers = localStorage.getItem('sbps_evt_members');
        if (storedMembers) state.members = JSON.parse(storedMembers);

        const storedGroups = localStorage.getItem('sbps_evt_groups');
        if (storedGroups) state.groups = JSON.parse(storedGroups);

        const storedNotices = localStorage.getItem('sbps_evt_notices');
        if (storedNotices) state.notices = JSON.parse(storedNotices);

        const storedChats = localStorage.getItem('sbps_evt_chats');
        if (storedChats) state.chats = JSON.parse(storedChats);

        const storedPosts = localStorage.getItem('sbps_evt_community_posts');
        if (storedPosts) state.communityPosts = JSON.parse(storedPosts);
    }

    function saveData() {
        localStorage.setItem('sbps_evt_events', JSON.stringify(state.events));
        localStorage.setItem('sbps_evt_enrollments', JSON.stringify(state.enrollments));
        localStorage.setItem('sbps_evt_participations', JSON.stringify(state.participations));
        localStorage.setItem('sbps_evt_suggestions', JSON.stringify(state.suggestions));
        localStorage.setItem('sbps_evt_votes', JSON.stringify(state.userVotes));
        localStorage.setItem('sbps_evt_members', JSON.stringify(state.members));
        localStorage.setItem('sbps_evt_groups', JSON.stringify(state.groups));
        localStorage.setItem('sbps_evt_notices', JSON.stringify(state.notices));
        localStorage.setItem('sbps_evt_chats', JSON.stringify(state.chats));
        localStorage.setItem('sbps_evt_community_posts', JSON.stringify(state.communityPosts));
    }

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
        const btnPart = document.getElementById('btn-select-participante');
        const btnPal = document.getElementById('btn-select-palestrante');
        if (btnPart && btnPal) {
            btnPart.addEventListener('click', () => selectUserRole('participante'));
            btnPal.addEventListener('click', () => selectUserRole('palestrante'));
        }

        setupAuthSubtabs('part');
        setupAuthSubtabs('pal');

        const formLoginPart = document.getElementById('form-login-participante');
        const formRegPart = document.getElementById('form-register-participante');
        const formLoginPal = document.getElementById('form-login-palestrante');
        const formRegPal = document.getElementById('form-register-palestrante');

        if (formLoginPart) formLoginPart.addEventListener('submit', (e) => handleLogin(e, 'participante'));
        if (formRegPart) formRegPart.addEventListener('submit', (e) => handleRegisterParticipante(e));
        if (formLoginPal) formLoginPal.addEventListener('submit', (e) => handleLogin(e, 'palestrante'));
        if (formRegPal) formRegPal.addEventListener('submit', (e) => handleRegisterPalestrante(e));

        const btnAddEdu = document.getElementById('btn-add-edu-item');
        if (btnAddEdu) btnAddEdu.addEventListener('click', addEduRow);

        const formCriarEvt = document.getElementById('form-criar-evento-palestrante');
        if (formCriarEvt) formCriarEvt.addEventListener('submit', handleCriarEvento);

        const formAi = document.getElementById('form-ai-chat');
        if (formAi) formAi.addEventListener('submit', handleAiSubmit);

        setupPrivateChatForm();

        const btnLogoutSidebar = document.getElementById('btn-logout-workspace');
        if (btnLogoutSidebar) {
            btnLogoutSidebar.addEventListener('click', () => {
                window.openLogoutModalEventos();
            });
        }
    }

    window.quickDemoLoginEventos = function (role) {
        const isPal = role === 'palestrante';
        const userObj = isPal
            ? {
                nome: 'Thiago Oliveira',
                email: 'roberto.mota@sbps.org.br',
                cpf: '123.456.789-00',
                role: 'palestrante',
                escolaridade: 'Mestrado',
                area: 'Direito Previdenciário RGPS / RPPS',
                profissao: 'Advogado e Professor (12 anos de experiência)',
                sobre: 'Especialista em planejamento previdenciário e cálculos atuariais.',
                foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
                isAssociado: true
            }
            : {
                nome: 'Thiago Oliveira',
                email: 'thiago@sbps.org.br',
                cpf: '000.111.222-33',
                role: 'participante',
                foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
                isAssociado: true
            };
        state.currentUser = userObj;
        state.userRole = role;
        localStorage.setItem('sbps_evt_session', JSON.stringify(userObj));
        renderWorkspace();
        showToast(`Bem-vindo ao Painel do ${isPal ? 'Palestrante' : 'Participante'} SBPS!`);
    };

    window.cancelLogoutEventos = function () {
        const modal = document.getElementById('logout-modal');
        if (modal) modal.style.display = 'none';
    };

    window.leaveAreaEventos = function () {
        window.location.href = '../index.html';
    };

    window.confirmLogoutEventos = function () {
        if (state.userRole) {
            localStorage.setItem('sbps_evt_last_role', state.userRole);
        }
        localStorage.removeItem('sbps_evt_session');
        document.body.classList.remove('evt-logged-in');
        const modal = document.getElementById('logout-modal');
        if (modal) modal.style.display = 'none';
        location.reload();
    };

    function selectUserRole(role) {
        state.userRole = role;
        const btnPart = document.getElementById('btn-select-participante');
        const btnPal = document.getElementById('btn-select-palestrante');
        const boxPart = document.getElementById('auth-box-participante');
        const boxPal = document.getElementById('auth-box-palestrante');

        if (!btnPart || !btnPal || !boxPart || !boxPal) return;

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
        const passInput = (e.target.querySelector('input[type="password"]')) ? e.target.querySelector('input[type="password"]').value : '';

        if (!userInput || !passInput) {
            alert('Por favor, informe seu e-mail e sua senha cadastrada.');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

        try {
            if (window.SBPS_Supabase && typeof window.SBPS_Supabase.loginEventoUser === 'function') {
                const res = await window.SBPS_Supabase.loginEventoUser(userInput, passInput, role);
                if (res && res.success) {
                    const prof = res.profile || {};
                    let userObj = {
                        email: prof.email || userInput,
                        nome: prof.nome || (userInput.includes('@') ? userInput.split('@')[0] : userInput),
                        role: role,
                        isAssociado: !!prof.cpf
                    };
                    state.currentUser = userObj;
                    state.userRole = role;
                    localStorage.setItem('sbps_evt_session', JSON.stringify(userObj));
                    renderWorkspace();
                    return;
                } else {
                    alert(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
                    return;
                }
            } else {
                const storedKey = 'sbps_' + role + '_user';
                const localUser = localStorage.getItem(storedKey);
                if (localUser) {
                    try {
                        const parsed = JSON.parse(localUser);
                        if (parsed.email && parsed.email.toLowerCase() === userInput.toLowerCase()) {
                            state.currentUser = { email: parsed.email, nome: parsed.nome || userInput, role: role, isAssociado: true };
                            state.userRole = role;
                            localStorage.setItem('sbps_evt_session', JSON.stringify(state.currentUser));
                            renderWorkspace();
                            return;
                        }
                    } catch (err) {}
                }
                alert('Credenciais não localizadas ou serviço de autenticação temporariamente indisponível.');
            }
        } finally {
            if (submitBtn) submitBtn.innerHTML = origBtnText;
        }
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
                    return true;
                }
            } catch (e) {
                localStorage.removeItem('sbps_evt_session');
            }
        }
        return false;
    }

    function updateHeaderUserDisplay() {
        if (!state.currentUser) return;
        const avatarEl = document.getElementById('workspace-user-avatar');
        const nameEl = document.getElementById('workspace-user-name');
        const badgeEl = document.getElementById('workspace-user-badge');
        const titleEl = document.getElementById('workspace-header-title');
        const pillTextEl = document.getElementById('workspace-header-pill-text');
        const subtitleEl = document.getElementById('workspace-header-subtitle');
        const footerCopyEl = document.getElementById('workspace-footer-copy');
        const chatTitleEl = document.getElementById('chat-drawer-title');
        const chatGreetingEl = document.getElementById('chat-drawer-greeting');

        const isPal = state.userRole === 'palestrante';
        const fullName = state.currentUser.nome || 'Thiago';
        const cleanParts = fullName.replace(/^(Dr\.|Dra\.|Prof\.|Profa\.)\s+/i, '').trim().split(' ');
        const firstName = cleanParts[0] || 'Thiago';
        const initial = firstName.charAt(0).toUpperCase();
        const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80';

        if (avatarEl) {
            if (state.currentUser.fotoRemovida) {
                avatarEl.innerHTML = `<span class="text-white font-bold text-xs">${escapeHTML(initial)}</span>`;
            } else {
                const src = state.currentUser.foto || defaultAvatar;
                avatarEl.innerHTML = `<img src="${src}" alt="${escapeHTML(firstName)}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/80x80/059669/ffffff?text=${encodeURIComponent(initial)}'" />`;
            }
        }
        if (nameEl) nameEl.textContent = `Olá, ${firstName}`;
        if (badgeEl) {
            badgeEl.textContent = isPal ? 'Palestrante SBPS' : 'Participante SBPS';
        }
        if (titleEl) {
            titleEl.textContent = isPal ? 'Painel do Palestrante' : 'Painel do Participante';
        }
        if (pillTextEl) {
            pillTextEl.textContent = isPal ? 'Corpo Docente SBPS' : 'Membro Participante SBPS';
        }
        if (subtitleEl) {
            subtitleEl.textContent = isPal
                ? 'Gerencie suas apresentações agendadas, envie materiais didáticos, confira a lista de inscritos e proponha novos eventos.'
                : 'Acompanhe suas inscrições confirmadas, baixe materiais didáticos, emita certificados e explore a agenda oficial SBPS.';
        }
        if (footerCopyEl) {
            footerCopyEl.textContent = isPal
                ? '© 2026 Sociedade Brasileira de Previdência Social (SBPS) • Módulo Acadêmico do Palestrante'
                : '© 2026 Sociedade Brasileira de Previdência Social (SBPS) • Portal Oficial do Congressista & Participante';
        }
        if (chatTitleEl) {
            chatTitleEl.textContent = isPal ? 'Canal do Palestrante' : 'Suporte ao Participante';
        }
        if (chatGreetingEl) {
            chatGreetingEl.textContent = isPal ? `Professor ${firstName}` : firstName;
        }
    }

    function renderWorkspace() {
        const authContainer = document.getElementById('evt-auth-container');
        const workspaceContainer = document.getElementById('evt-workspace-container');

        if (!authContainer || !workspaceContainer) return;

        document.body.classList.add('evt-logged-in');

        authContainer.style.display = 'none';
        workspaceContainer.style.display = 'block';

        updateHeaderUserDisplay();
        renderSidebarNav();

        let initialTab = 'dashboard';
        if (window.location.hash) {
            const hTab = window.location.hash.replace('#', '');
            if (hTab) initialTab = hTab;
        }

        history.replaceState({ tab: initialTab }, '', '#' + initialTab);
        switchTab(initialTab, false);
    }

    function getRoleTabIds() {
        if (state.userRole === 'palestrante') {
            return ['perfil', 'criar-eventos', 'meus-eventos', 'realizados', 'comunidade', 'sugestoes', 'ajuda'];
        }
        return ['perfil', 'eventos', 'inscricoes', 'participacoes', 'comunidade', 'sugestoes', 'ajuda'];
    }

    function renderSidebarNav() {
        const navContainer = document.getElementById('workspace-sidebar-nav');
        if (!navContainer) return;

        const allTabs = ['dashboard', ...getRoleTabIds()];

        navContainer.innerHTML = allTabs.map(id => {
            const def = TAB_DEFINITIONS[id];
            const isPlusBtn = !!def.isHighlightPlus;
            const baseCls = isPlusBtn
                ? 'evt-sidebar-link sidebar-item group relative p-2.5 rounded-xl text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-800 transition-all'
                : 'evt-sidebar-link sidebar-item group relative p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all';
            return `
                <button type="button" data-tab="${id}" data-plus="${isPlusBtn ? '1' : '0'}" title="${def.shortTitle}" class="${baseCls}">
                    ${def.svg}
                    <span class="absolute left-16 bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block whitespace-nowrap z-50">${def.shortTitle}</span>
                </button>
            `;
        }).join('');

        navContainer.querySelectorAll('.evt-sidebar-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                switchTab(targetTab, true);
            });
        });
    }

    function switchTab(tabId, updateHistory = true) {
        state.currentTab = tabId;

        if (updateHistory) {
            history.pushState({ tab: tabId }, '', '#' + tabId);
        }

        document.querySelectorAll('.evt-sidebar-link').forEach(btn => {
            const btnTab = btn.getAttribute('data-tab');
            const isPlus = btn.getAttribute('data-plus') === '1';
            if (isPlus) {
                if (btnTab === tabId) {
                    btn.className = 'evt-sidebar-link sidebar-item group relative p-2.5 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-sm';
                } else {
                    btn.className = 'evt-sidebar-link sidebar-item group relative p-2.5 rounded-xl text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-800 transition-all';
                }
            } else {
                if (btnTab === tabId) {
                    btn.className = 'evt-sidebar-link sidebar-item group relative p-2.5 rounded-xl text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all';
                } else {
                    btn.className = 'evt-sidebar-link sidebar-item group relative p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all';
                }
            }
        });

        const backBtn = document.getElementById('btn-back-evt-dashboard');
        if (backBtn) {
            backBtn.style.display = tabId === 'dashboard' ? 'none' : 'inline-flex';
        }

        document.querySelectorAll('.evt-tab-panel').forEach(panel => panel.style.display = 'none');
        const targetPanel = document.getElementById(`panel-${tabId}`);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            renderTabContent(tabId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        } else if (tabId === 'criar-eventos') {
            atualizarBannerCotaCriarEvento();
        }
    }

    function extractDateBadgeParts(dateStr) {
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        if (!dateStr) return { month: 'DEZ', day: '04', sub: 'SEX • 19:30' };
        const str = String(dateStr);
        const matchTime = str.match(/(\d{1,2}:\d{2})/);
        const timePart = matchTime ? matchTime[1] : '19:00';
        const matchBr = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (matchBr) {
            const d = parseInt(matchBr[1], 10);
            const m = parseInt(matchBr[2], 10) - 1;
            const y = parseInt(matchBr[3], 10);
            const dateObj = new Date(y, m, d);
            const dow = daysOfWeek[dateObj.getDay()] || 'SEX';
            return {
                month: months[m] || 'AGO',
                day: String(d).padStart(2, '0'),
                sub: `${dow} • ${timePart}`
            };
        }
        return { month: 'NOV', day: '18', sub: `QUA • ${timePart}` };
    }

    function renderPalestranteDashboard() {
        const container = document.getElementById('panel-dashboard');
        if (!container) return;

        const myEvents = state.events.filter(e => e.palestrante_email === state.currentUser.email || e.palestrante === state.currentUser.nome);
        const customCreated = myEvents.filter(e => !['evt-101', 'evt-102', 'evt-103', 'evt-104'].includes(e.id));

        container.innerHTML = `
            <!-- CARDS DE MÉTRICAS DO PALESTRANTE -->
            <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ouvintes Impactados</span>
                        <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-slate-900">1.840</span>
                        <span class="text-xs font-semibold text-emerald-600">+18% este ano</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-1">Associados e congressistas</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Avaliação Média</span>
                        <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                            <svg class="w-4 h-4 fill-amber-400 stroke-amber-500" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-slate-900">4.9</span>
                        <span class="text-xs text-slate-400">/ 5.0 (342 votos)</span>
                    </div>
                    <span class="text-[11px] text-emerald-700 font-medium block mt-1">Classificação Excelente</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Palestras Ministradas</span>
                        <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-slate-900">14</span>
                        <span class="text-xs text-slate-500">eventos</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-1">Simpósios, webinars e lives</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Próximos Confirmados</span>
                        <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-emerald-800">${2 + customCreated.length}</span>
                        <span class="text-xs font-medium text-emerald-700">datas reservadas</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-1">Grade acadêmica 2026/2027</span>
                </div>
            </section>

            <!-- NAVEGAÇÃO DE ABAS DO PALESTRANTE & AÇÃO PRIMÁRIA "+ PROPOR NOVA PALESTRA" -->
            <div class="pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs sm:text-sm font-semibold">
                    <button type="button" onclick="window.switchSpeakerTab('dashboard', this)" id="spk-tab-dash" class="tab-btn px-4 py-2 rounded-xl bg-slate-900 text-white transition-all shadow-sm whitespace-nowrap">
                        Palestras Confirmadas & Próximas
                    </button>
                    <button type="button" onclick="window.switchSpeakerTab('publicadas', this)" id="spk-tab-pub" class="tab-btn px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 whitespace-nowrap">
                        Meus Eventos Publicados
                        <span class="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-200 text-slate-700 font-bold">${Math.max(2, myEvents.length)}</span>
                    </button>
                    <button type="button" onclick="window.switchSpeakerTab('historico', this)" id="spk-tab-hist" class="tab-btn px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap">
                        Histórico / Concluídos
                    </button>
                    <button type="button" onclick="window.openTopicsDrawer()" class="px-4 py-2 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center gap-1.5 whitespace-nowrap">
                        <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        Temas Demandados pelos Associados
                    </button>
                </div>

                <!-- BOTÃO PRIMÁRIO: PROPOR NOVA PALESTRA -->
                <button type="button" onclick="window.openCreateProposalModal()" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0">
                    <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                    Propor Nova Palestra / Evento
                </button>
            </div>

            <!-- ================= SEÇÃO: MEUS EVENTOS PUBLICADOS RECENTEMENTE (VISÃO PALESTRANTE) ================= -->
            <section class="mb-8">
                <div class="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-emerald-600"></div>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Meus Eventos Publicados Recentemente (Gestão do Ministrante)</h2>
                    </div>
                    <span class="text-xs text-slate-500">Transmissão gerenciada pela coordenação SBPS</span>
                </div>

                <!-- Card do Evento Publicado com Ações do Instrutor -->
                <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 custom-shadow relative overflow-hidden transition-all hover:border-slate-300">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        
                        <div class="space-y-3 max-w-2xl">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Inscrições Abertas aos Membros
                                </span>
                                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">Formato: Híbrido (Auditório + Zoom)</span>
                                <span class="text-xs text-slate-400">Você é o Palestrante Principal</span>
                            </div>

                            <h3 class="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                                I Simpósio Nacional de Reforma e Prática Previdenciária Aplicada
                            </h3>

                            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Sua apresentação: <strong>"Teses de Revisão da Vida Toda e Liquidação de Sentença Previdenciária"</strong>. Duração prevista de 90 minutos + 30 minutos para perguntas ao vivo dos associados.
                            </p>

                            <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
                                <div class="flex items-center gap-1.5">
                                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    <span>28 de Novembro, 2026 • Início às 19:00</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                    <span>Link da Sala Técnica do Palestrante Ativo</span>
                                </div>
                            </div>
                        </div>

                        <!-- Métricas e Controles do Palestrante -->
                        <div class="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                            <div class="grid grid-cols-3 gap-3 w-full sm:w-auto">
                                <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                    <span class="text-[10px] text-slate-400 block font-medium">Inscritos</span>
                                    <span class="text-base font-bold text-slate-900">142</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                    <span class="text-[10px] text-slate-400 block font-medium">Vagas Restantes</span>
                                    <span class="text-base font-bold text-amber-700">8</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                    <span class="text-[10px] text-slate-400 block font-medium">Slides</span>
                                    <span class="text-base font-bold text-emerald-700">Enviado</span>
                                </div>
                            </div>

                            <!-- Botões de Ação do Instrutor -->
                            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <button type="button" onclick="window.openAttendeesModal('I Simpósio Nacional de Reforma Previdenciária', 142)" class="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors">
                                    Ver Inscritos (142)
                                </button>
                                <button type="button" onclick="window.openUploadSlidesModal('I Simpósio Nacional de Reforma Previdenciária')" class="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                    Atualizar Slides
                                </button>
                                <button type="button" onclick="window.openSpeakerRoomModal('I Simpósio Nacional')" class="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors">
                                    Acessar Sala do Palestrante &rarr;
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <!-- ================= GRID DE CONTEÚDO PRINCIPAL (2 COLUNAS) ================= -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- COLUNA PRINCIPAL (2/3): PRÓXIMAS PALESTRAS AGENDADAS COM CHECKLIST -->
                <div class="lg:col-span-2 space-y-5">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h2 class="text-lg font-bold text-slate-900">Agenda de Apresentações Confirmadas</h2>
                            <p class="text-xs text-slate-500">Eventos em que sua participação como instrutor ou palestrante já está aprovada.</p>
                        </div>
                        <span class="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Status: Regularizado
                        </span>
                    </div>

                    <!-- LISTA DE CARDS PARA O PALESTRANTE -->
                    <div class="space-y-4">
                        
                        ${customCreated.map(evt => createEventCardHTML(evt, 'palestrante-criado')).join('')}

                        <!-- Apresentação 1 -->
                        <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow custom-shadow-hover transition-all duration-200 flex flex-col sm:flex-row gap-5">
                            <!-- Data -->
                            <div class="w-full sm:w-24 h-24 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">DEZ</span>
                                <span class="text-2xl font-extrabold text-slate-900 leading-none my-0.5">04</span>
                                <span class="text-[10px] text-slate-400 font-medium">SEX • 19:30</span>
                            </div>

                            <!-- Detalhes do Palestrante -->
                            <div class="flex-1 flex flex-col justify-between">
                                <div>
                                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            Palestrante Convidado
                                        </span>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                            Carga Horária: 2h/aula
                                        </span>
                                        <span class="text-[11px] text-slate-400">Plataforma Zoom VIP</span>
                                    </div>
                                    <h3 class="text-base font-bold text-slate-900">
                                        Workshop Prático: Planejamento Previdenciário Estratégico e Cálculos RGPS
                                    </h3>
                                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Tema da sua mesa: <strong>"Simulações de Renda Mensal Inicial (RMI) e descarte de contribuições desfavoráveis"</strong>.
                                    </p>

                                    <!-- Checklist do Palestrante -->
                                    <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                                        <div class="flex items-center gap-1.5 text-emerald-700 font-medium">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                                            <span>Contrato Assinado</span>
                                        </div>
                                        <div class="flex items-center gap-1.5 text-amber-700 font-medium">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            <span>Slides Pendentes</span>
                                        </div>
                                        <div class="flex items-center gap-1.5 text-slate-600">
                                            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            <span>Teste de Som: 03/12</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Ações da Apresentação -->
                                <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                                    <span class="text-xs font-semibold text-slate-700">95 associados inscritos</span>
                                    <div class="flex items-center gap-2">
                                        <button type="button" onclick="window.openUploadSlidesModal('Workshop Prático')" class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all">
                                            Submeter Material (PDF/PPT)
                                        </button>
                                        <button type="button" onclick="window.openAttendeesModal('Workshop Prático', 95)" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all">
                                            Lista de Ouvintes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Apresentação 2 -->
                        <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow custom-shadow-hover transition-all duration-200 flex flex-col sm:flex-row gap-5">
                            <div class="w-full sm:w-24 h-24 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">JAN</span>
                                <span class="text-2xl font-extrabold text-slate-900 leading-none my-0.5">22</span>
                                <span class="text-[10px] text-slate-400 font-medium">SEX • 14:00</span>
                            </div>

                            <div class="flex-1 flex flex-col justify-between">
                                <div>
                                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            Mesa Redonda / Debate
                                        </span>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                            Presencial • Brasília / DF
                                        </span>
                                    </div>
                                    <h3 class="text-base font-bold text-slate-900">
                                        Encontro dos Coordenadores Científicos: Diretrizes de Ensino Previdenciário 2027
                                    </h3>
                                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Participação no painel de abertura ao lado de representantes da Comissão Especial de Previdência Social.
                                    </p>

                                    <div class="mt-3 flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                                        <span>📍 Auditório Principal do Conselho SBPS</span>
                                        <span>•</span>
                                        <span>Certificado de Ministrante emitido automaticamente</span>
                                    </div>
                                </div>

                                <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                                    <span class="text-xs font-medium text-slate-500">Credencial e hospedagem confirmadas</span>
                                    <button type="button" onclick="window.openGenericModal('Detalhes do Painel Brasília', 'Logística de viagem, crachá de palestrante e cronograma da mesa redonda em Brasília/DF.')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all">
                                        Ver Logística do Evento
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- COLUNA LATERAL (1/3): WIDGETS DO PALESTRANTE -->
                <div class="space-y-6">
                    
                    <!-- CARD 1: BANCO DE SUGESTÕES DE TEMAS DA COMUNIDADE -->
                    <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                </div>
                                <h3 class="text-sm font-bold text-slate-900">Temas Mais Votados</h3>
                            </div>
                            <span class="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">Demanda</span>
                        </div>

                        <p class="text-xs text-slate-500 mt-3 leading-relaxed">
                            Temas solicitados pelos associados da SBPS aguardando professores interessados em ministrar:
                        </p>

                        <div class="mt-4 space-y-2.5">
                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer" onclick="window.adoptTopic('Revisão da Vida Toda no STF')">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-emerald-700 uppercase">128 votos</span>
                                    <span class="text-[10px] text-slate-400 font-medium">Urgente</span>
                                </div>
                                <p class="text-xs font-semibold text-slate-800 mt-1">Cálculos práticos pós-julgamento de embargos no STF</p>
                                <button type="button" class="mt-2 text-[11px] font-bold text-emerald-700 hover:underline">Quero ministrar esta aula &rarr;</button>
                            </div>

                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer" onclick="window.adoptTopic('Previdência Complementar e Servidores')">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-blue-700 uppercase">89 votos</span>
                                    <span class="text-[10px] text-slate-400 font-medium">Seminário</span>
                                </div>
                                <p class="text-xs font-semibold text-slate-800 mt-1">Regimes próprios e migração de servidores públicos federais</p>
                                <button type="button" class="mt-2 text-[11px] font-bold text-emerald-700 hover:underline">Quero ministrar esta aula &rarr;</button>
                            </div>
                        </div>

                        <button type="button" onclick="window.openTopicsDrawer()" class="w-full mt-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                            Ver Todas as Pautas Solicitadas &rarr;
                        </button>
                    </div>

                    <!-- CARD 2: KIT DE MATERIAIS & MODELOS DO PALESTRANTE -->
                    <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 custom-shadow">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="p-1.5 bg-white/10 rounded-lg text-emerald-400">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </span>
                            <h3 class="text-sm font-bold">Kit Oficial do Palestrante SBPS</h3>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed">
                            Faça download do modelo oficial de apresentação em slides (PowerPoint/Keynote), manual de marca e termos docentes.
                        </p>

                        <div class="mt-4 space-y-2">
                            <button type="button" onclick="showToast('Baixando Modelo de Slides SBPS (.PPTX)')" class="w-full py-2 px-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium flex items-center justify-between transition-colors">
                                <span>Template de Slides SBPS (.PPTX)</span>
                                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </button>
                            <button type="button" onclick="showToast('Baixando Manual do Palestrante em PDF')" class="w-full py-2 px-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium flex items-center justify-between transition-colors">
                                <span>Manual de Boas Práticas e Transmissão</span>
                                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- CARD 3: EMISSÃO DE CERTIFICADOS DE MINISTRANTE -->
                    <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="10" r="6"/>
                                    <path d="M9 10l2 2 4-4"/>
                                    <path d="M10 16l-2 5 4-2 4 2-2-5"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-900">Certificados de Palestrante</h4>
                                <p class="text-[11px] text-slate-500">14 certificações de docência emitidas</p>
                            </div>
                        </div>
                        <button type="button" onclick="window.openGenericModal('Certificados de Instrutor', 'Acesse e baixe os certificados assinados digitalmente atestando suas 48 horas de aulas ministradas na SBPS.')" class="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                            Acessar
                        </button>
                    </div>

                    <!-- CARD 4: WIDGET DE PLANO & COTA DE PUBLICAÇÕES -->
                    <div id="palestrante-dashboard-quota-widget"></div>

                </div>

            </div>
        `;

        attachCardActionListeners(container);
        renderPalestranteDashboardQuotaWidget();
    }

    function renderParticipanteDashboard() {
        const container = document.getElementById('panel-dashboard');
        if (!container) return;

        const availableEvts = state.events.filter(e => e.status === 'Ativo');
        const enrolledEvts = state.events.filter(e => state.enrollments.includes(e.id));
        const rep = calculateReputation(state.currentUser ? state.currentUser.email : null) + 240;

        container.innerHTML = `
            <!-- CARDS DE MÉTRICAS DO PARTICIPANTE (MESMO PADRÃO EXECUTIVO) -->
            <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Horas Certificadas</span>
                        <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-slate-900">48h</span>
                        <span class="text-xs font-semibold text-emerald-600">+12h este ano</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-1">Cursos, simpósios e workshops</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Inscrições Confirmadas</span>
                        <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-slate-900">${Math.max(2, enrolledEvts.length)}</span>
                        <span class="text-xs font-medium text-emerald-700">eventos ativos</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-1">Vagas garantidas ao vivo</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Eventos Concluídos</span>
                        <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                            <svg class="w-4 h-4 fill-amber-400 stroke-amber-500" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-slate-900">${state.participations.length + 5}</span>
                        <span class="text-xs text-slate-500">participações</span>
                    </div>
                    <span class="text-[11px] text-emerald-700 font-medium block mt-1">100% de frequência validada</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-4 custom-shadow">
                    <div class="flex items-center justify-between text-slate-400 mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Reputação Acadêmica</span>
                        <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-extrabold text-emerald-800">${rep}</span>
                        <span class="text-xs font-medium text-emerald-700">pontos SBPS</span>
                    </div>
                    <span class="text-[11px] text-slate-400 block mt-1">Membro Participante Ativo</span>
                </div>
            </section>

            <!-- NAVEGAÇÃO DE ABAS DO PARTICIPANTE & AÇÃO PRIMÁRIA -->
            <div class="pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs sm:text-sm font-semibold">
                    <button type="button" onclick="window.switchTab('dashboard', true)" class="tab-btn px-4 py-2 rounded-xl bg-slate-900 text-white transition-all shadow-sm whitespace-nowrap">
                        Eventos Confirmados & Próximos
                    </button>
                    <button type="button" onclick="window.switchTab('eventos', true)" class="tab-btn px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 whitespace-nowrap">
                        Eventos Disponíveis
                        <span class="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-200 text-slate-700 font-bold">${availableEvts.length}</span>
                    </button>
                    <button type="button" onclick="window.switchTab('inscricoes', true)" class="tab-btn px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 whitespace-nowrap">
                        Minhas Inscrições
                        <span class="px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-100 text-emerald-800 font-bold">${enrolledEvts.length}</span>
                    </button>
                    <button type="button" onclick="window.switchTab('participacoes', true)" class="tab-btn px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap">
                        Histórico / Certificados
                    </button>
                    <button type="button" onclick="window.switchTab('sugestoes', true)" class="px-4 py-2 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center gap-1.5 whitespace-nowrap">
                        <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        Sugerir Tema / Votar em Pautas
                    </button>
                </div>

                <!-- BOTÃO PRIMÁRIO: INSCREVER-SE EM NOVO EVENTO -->
                <button type="button" onclick="window.switchTab('eventos', true)" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0">
                    <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                    Explorar & Inscrever-se em Evento
                </button>
            </div>

            <!-- ================= SEÇÃO: PRÓXIMA PARTICIPAÇÃO EM DESTAQUE (VISÃO PARTICIPANTE) ================= -->
            <section class="mb-8">
                <div class="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-emerald-600"></div>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Minha Próxima Participação Confirmada (Acesso do Congressista)</h2>
                    </div>
                    <span class="text-xs text-slate-500">Transmissão oficial com certificado automático de presença</span>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 custom-shadow relative overflow-hidden transition-all hover:border-slate-300">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div class="space-y-3 max-w-2xl">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Inscrição Confirmada
                                </span>
                                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">Formato: Híbrido (Auditório + Zoom)</span>
                                <span class="text-xs text-slate-400">Credencial Digital Liberada</span>
                            </div>

                            <h3 class="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                                I Simpósio Nacional de Reforma e Prática Previdenciária Aplicada
                            </h3>

                            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Palestra Magna: <strong>"Teses de Revisão da Vida Toda e Liquidação de Sentença Previdenciária"</strong>. Inclui apostila em PDF, modelos práticos e certificação oficial SBPS.
                            </p>

                            <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
                                <div class="flex items-center gap-1.5">
                                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    <span>28 de Novembro, 2026 • Início às 19:00</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                    <span>Sala de Transmissão do Congressista Ativa</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                            <div class="grid grid-cols-3 gap-3 w-full sm:w-auto">
                                <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                    <span class="text-[10px] text-slate-400 block font-medium">Carga Horária</span>
                                    <span class="text-base font-bold text-slate-900">12h</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                    <span class="text-[10px] text-slate-400 block font-medium">Material</span>
                                    <span class="text-base font-bold text-emerald-700">Liberado</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                    <span class="text-[10px] text-slate-400 block font-medium">Check-in</span>
                                    <span class="text-base font-bold text-emerald-700">Confirmado</span>
                                </div>
                            </div>

                            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <button type="button" onclick="showToast('Baixando Apostila e Slides do Simpósio (.PDF)')" class="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors">
                                    Baixar Apostila (PDF)
                                </button>
                                <button type="button" onclick="window.openGenericModal('Comprovante de Inscrição', 'Sua inscrição no I Simpósio Nacional de Reforma e Prática Previdenciária Aplicada está regularizada e ativa.')" class="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                    Comprovante
                                </button>
                                <button type="button" onclick="window.openGenericModal('Sala de Transmissão Ao Vivo', 'Você está conectado à sala de transmissão da SBPS. O envio de perguntas ao palestrante e o registro automático de presença estão ativos.')" class="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors">
                                    Acessar Transmissão &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ================= GRID DE CONTEÚDO PRINCIPAL (2 COLUNAS) ================= -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-5">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h2 class="text-lg font-bold text-slate-900">Agenda de Eventos & Workshops Disponíveis</h2>
                            <p class="text-xs text-slate-500">Próximos cursos, simpósios e encontros abertos para inscrição imediata.</p>
                        </div>
                        <button type="button" onclick="window.switchTab('eventos', true)" class="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors">
                            Ver Grade Completa &rarr;
                        </button>
                    </div>

                    <div class="space-y-4">
                        ${availableEvts.slice(0, 3).map(e => createEventCardHTML(e, 'disponivel')).join('')}
                    </div>
                </div>

                <!-- COLUNA LATERAL (1/3): WIDGETS DO PARTICIPANTE -->
                <div class="space-y-6">
                    <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                </div>
                                <h3 class="text-sm font-bold text-slate-900">Temas Mais Votados</h3>
                            </div>
                            <span class="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">Comunidade</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-3 leading-relaxed">
                            Vote nas pautas que você deseja assistir nos próximos workshops da SBPS:
                        </p>
                        <div class="mt-4 space-y-2.5">
                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer" onclick="showToast('Voto registrado na pauta!')">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-emerald-700 uppercase">128 votos</span>
                                    <span class="text-[10px] text-slate-400 font-medium">Em Alta</span>
                                </div>
                                <p class="text-xs font-semibold text-slate-800 mt-1">Cálculos práticos pós-julgamento de embargos no STF</p>
                                <span class="mt-2 inline-block text-[11px] font-bold text-emerald-700 hover:underline">Apoiar este tema &rarr;</span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer" onclick="showToast('Voto registrado na pauta!')">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-blue-700 uppercase">89 votos</span>
                                    <span class="text-[10px] text-slate-400 font-medium">Seminário</span>
                                </div>
                                <p class="text-xs font-semibold text-slate-800 mt-1">Regimes próprios e migração de servidores públicos federais</p>
                                <span class="mt-2 inline-block text-[11px] font-bold text-emerald-700 hover:underline">Apoiar este tema &rarr;</span>
                            </div>
                        </div>
                        <button type="button" onclick="window.switchTab('sugestoes', true)" class="w-full mt-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                            Sugerir Nova Pauta &rarr;
                        </button>
                    </div>

                    <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 custom-shadow">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="p-1.5 bg-white/10 rounded-lg text-emerald-400">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </span>
                            <h3 class="text-sm font-bold">Kit do Congressista SBPS</h3>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed">
                            Baixe o guia oficial de participação, programação científica anual e caderno de jurisprudência previdenciária.
                        </p>
                        <div class="mt-4 space-y-2">
                            <button type="button" onclick="showToast('Baixando Guia do Congressista SBPS (.PDF)')" class="w-full py-2 px-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium flex items-center justify-between transition-colors">
                                <span>Guia do Participante & Certificação (.PDF)</span>
                                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </button>
                            <button type="button" onclick="showToast('Baixando Caderno de Teses Previdenciárias (.PDF)')" class="w-full py-2 px-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium flex items-center justify-between transition-colors">
                                <span>Caderno de Teses Previdenciárias 2026</span>
                                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </button>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="10" r="6"/>
                                    <path d="M9 10l2 2 4-4"/>
                                    <path d="M10 16l-2 5 4-2 4 2-2-5"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-900">Meus Certificados</h4>
                                <p class="text-[11px] text-slate-500">${state.participations.length + 5} certificações disponíveis em PDF</p>
                            </div>
                        </div>
                        <button type="button" onclick="window.switchTab('participacoes', true)" class="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                            Acessar
                        </button>
                    </div>
                </div>
            </div>
        `;

        attachCardActionListeners(container);
    }

    function createEventCardHTML(evt, mode) {
        const dParts = extractDateBadgeParts(evt.dateStr);
        const safeTitleAttr = escapeAttr(evt.titulo);
        const isEnrolled = state.enrollments.includes(evt.id);

        let buttonsHTML = '';
        let leftFooterInfo = '';
        let checklistHTML = '';

        if (mode === 'disponivel') {
            leftFooterInfo = `<span class="text-xs font-semibold text-emerald-700">${escapeHTML(evt.valor || 'Gratuito')} • ${escapeHTML(evt.palestrante || 'Corpo Docente SBPS')}</span>`;
            checklistHTML = `
                <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                    <div class="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                        <span>Inscrições Abertas</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-slate-600">
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>Certificado ${escapeHTML(evt.cargaHoraria || '10h')}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-slate-600">
                        <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                        <span>Material PDF Incluso</span>
                    </div>
                </div>
            `;
            buttonsHTML = isEnrolled ? `
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all btn-ver-evento" data-id="${evt.id}">
                    Ver Detalhes
                </button>
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold" disabled>
                    ✓ Inscrito
                </button>
            ` : `
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all btn-ver-evento" data-id="${evt.id}">
                    Detalhes do Evento
                </button>
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold transition-all btn-inscrever" data-id="${evt.id}">
                    Inscrever-se Agora
                </button>
            `;
        } else if (mode === 'inscrito') {
            leftFooterInfo = `<span class="text-xs font-semibold text-emerald-700">Vaga Confirmada • Check-in Liberado</span>`;
            checklistHTML = `
                <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                    <div class="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                        <span>Inscrição Regularizada</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>Link de Acesso Ativo</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-slate-600">
                        <span>📍 ${escapeHTML(evt.local || 'Online via Zoom')}</span>
                    </div>
                </div>
            `;
            buttonsHTML = `
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs font-semibold transition-all btn-cancelar-inscricao" data-id="${evt.id}">
                    Cancelar Inscrição
                </button>
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all btn-ver-inscricao" data-id="${evt.id}">
                    Acessar Evento &rarr;
                </button>
            `;
        } else if (mode === 'participado' || mode === 'palestrante-realizado') {
            leftFooterInfo = `<span class="text-xs font-semibold text-emerald-700">Concluído • Carga Horária: ${escapeHTML(evt.cargaHoraria || '10h')}</span>`;
            checklistHTML = `
                <div class="mt-3 flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <span class="text-emerald-700 font-semibold">✓ Frequência 100% Validada</span>
                    <span>•</span>
                    <span>Certificado Oficial Assinado Digitalmente pela Diretoria Científica SBPS</span>
                </div>
            `;
            buttonsHTML = `
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all btn-ver-evento" data-id="${evt.id}">
                    Ver Resumo
                </button>
                <button type="button" class="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all btn-certificado" data-id="${evt.id}">
                    Emitir Certificado (PDF)
                </button>
            `;
        } else if (mode === 'palestrante-criado') {
            leftFooterInfo = `<span class="text-xs font-semibold text-slate-700">95 associados inscritos</span>`;
            checklistHTML = `
                <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                    <div class="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                        <span>Evento Publicado</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>Inscrições Ativas</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-slate-600">
                        <span>📍 ${escapeHTML(evt.local || 'Plataforma Zoom VIP')}</span>
                    </div>
                </div>
            `;
            buttonsHTML = `
                <button type="button" onclick="window.openUploadSlidesModal('${safeTitleAttr}')" class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all">
                    Submeter Material (PDF/PPT)
                </button>
                <button type="button" onclick="window.openAttendeesModal('${safeTitleAttr}', 95)" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all">
                    Lista de Ouvintes
                </button>
                <button type="button" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all btn-cancelar-palestra" data-id="${evt.id}" title="Remover Evento">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;
        }

        return `
            <div class="evt-event-card bg-white rounded-2xl border border-slate-200 p-5 custom-shadow custom-shadow-hover transition-all duration-200 flex flex-col sm:flex-row gap-5" data-id="${evt.id}" data-mode="${mode}">
                <!-- Caixa de Data Executiva (Padrão Referência) -->
                <div class="w-full sm:w-24 h-24 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">${dParts.month}</span>
                    <span class="text-2xl font-extrabold text-slate-900 leading-none my-0.5">${dParts.day}</span>
                    <span class="text-[10px] text-slate-400 font-medium">${dParts.sub}</span>
                </div>

                <!-- Corpo e Detalhes do Evento -->
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex flex-wrap items-center gap-2 mb-1.5">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                                ${escapeHTML(evt.tipo || 'Workshop SBPS')}
                            </span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                Carga Horária: ${escapeHTML(evt.cargaHoraria || '10h')}
                            </span>
                            <span class="text-[11px] text-slate-400">${escapeHTML(evt.local || 'Plataforma Zoom VIP')}</span>
                        </div>
                        <h3 class="text-base font-bold text-slate-900 leading-snug">
                            ${escapeHTML(evt.titulo)}
                        </h3>
                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                            ${escapeHTML(evt.resumo)}
                        </p>
                        ${checklistHTML}
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                        ${leftFooterInfo}
                        <div class="flex flex-wrap items-center gap-2">
                            ${buttonsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderVisualizarEventoTab(evt, mode) {
        const container = document.getElementById('panel-visualizar-evento');
        if (!container) return;

        const isEnrolled = state.enrollments.includes(evt.id);

        let footerButtonsHTML = '';
        if (mode === 'participado' || mode === 'palestrante-realizado') {
            footerButtonsHTML = `<button class="evt-btn-card-secondary" style="flex:0 0 auto; padding:10px 18px;" disabled><i class="fa-solid fa-check-circle text-emerald-600"></i> Evento Concluído</button>`;
        } else if (mode === 'palestrante-criado') {
            footerButtonsHTML = `<button class="evt-btn-card-secondary" style="flex:0 0 auto; padding:10px 18px;" disabled><i class="fa-solid fa-user-tie text-emerald-600"></i> Evento sob sua Coordenação</button>`;
        } else {
            footerButtonsHTML = isEnrolled ? `
                <button class="evt-btn-card-danger" id="btn-cancel-view-inscricao" data-id="${evt.id}" style="flex:0 0 auto; padding:10px 18px;">Cancelar Inscrição</button>
                <button class="evt-btn-card-secondary" style="flex:0 0 auto; padding:10px 18px;" disabled><i class="fa-solid fa-check text-emerald-600"></i> Inscrito</button>
            ` : `
                <button class="evt-btn-primary" id="btn-do-view-inscricao" data-id="${evt.id}" style="width: auto; margin:0; padding:10px 22px;">Confirmar Inscrição</button>
            `;
        }

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden mb-6">
                <div style="height: 240px; width: 100%; background: url('${evt.img || '../images/ref1.jpg'}') center/cover no-repeat; background-position: ${evt.imgPos || 'center'};" class="relative">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    <div class="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4 flex-wrap">
                        <div>
                            <span class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-white/95 text-slate-900 shadow-sm uppercase">${escapeHTML(evt.tipo)}</span>
                            <h2 class="text-xl sm:text-2xl font-bold text-white mt-2">${escapeHTML(evt.titulo)}</h2>
                        </div>
                    </div>
                </div>
                <div class="p-6 sm:p-8">
                    <div class="flex flex-wrap gap-2.5 pb-6 mb-6 border-b border-slate-100">
                        <span class="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"><i class="fa-regular fa-clock mr-1.5 text-slate-500"></i>Carga Horária: <strong>${escapeHTML(evt.cargaHoraria)}</strong></span>
                        <span class="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"><i class="fa-regular fa-calendar mr-1.5 text-slate-500"></i>Data: <strong>${escapeHTML(evt.dateStr)}</strong></span>
                        <span class="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"><i class="fa-solid fa-location-dot mr-1.5 text-slate-500"></i>Local: <strong>${escapeHTML(evt.local || 'Online')}</strong></span>
                        <span class="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-tag mr-1.5"></i>Inscrição: <strong>${escapeHTML(evt.valor || evt.taxas || 'Gratuito')}</strong></span>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Resumo e Objetivos</h3>
                            <p class="text-sm text-slate-600 leading-relaxed">${escapeHTML(evt.resumo)}</p>
                        </div>

                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Programação / Cronograma</h3>
                            <p class="text-sm text-slate-600 leading-relaxed">${escapeHTML(evt.programacao || 'Programação detalhada enviada aos inscritos.')}</p>
                        </div>

                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Coordenação / Palestrante</h3>
                            <p class="text-sm font-semibold text-slate-800">${escapeHTML(evt.palestrante || 'Corpo Docente SBPS')}</p>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                        <button type="button" class="evt-btn-card-secondary" style="flex:0 0 auto; padding:10px 18px;" onclick="window.switchTab('dashboard', true)">
                            <i class="fa-solid fa-arrow-left"></i> Voltar
                        </button>
                        <div class="flex gap-3">
                            ${footerButtonsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (isEnrolled) {
            const btnCancel = document.getElementById('btn-cancel-view-inscricao');
            if (btnCancel) {
                btnCancel.onclick = () => {
                    state.enrollments = state.enrollments.filter(eId => eId !== evt.id);
                    saveData();
                    showToast('Inscrição cancelada.');
                    window.switchTab('dashboard', true);
                };
            }
        } else {
            const btnInsc = document.getElementById('btn-do-view-inscricao');
            if (btnInsc) {
                btnInsc.onclick = () => {
                    handleEnrollmentClick(evt.id);
                };
            }
        }
    }

    function attachCardActionListeners(container) {
        container.querySelectorAll('.btn-inscrever').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                handleEnrollmentClick(id);
            };
        });

        container.querySelectorAll('.btn-cancelar-inscricao').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                state.enrollments = state.enrollments.filter(eId => eId !== id);
                saveData();
                showToast('Inscrição cancelada.');
                renderTabContent(state.currentTab || 'inscricoes');
            };
        });

        container.querySelectorAll('.btn-ver-inscricao, .btn-ver-evento').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const evt = state.events.find(e => e.id === id);
                const card = btn.closest('.evt-event-card');
                const mode = card ? card.getAttribute('data-mode') : 'disponivel';
                if (evt) {
                    renderVisualizarEventoTab(evt, mode);
                    window.switchTab('visualizar-evento');
                }
            };
        });

        container.querySelectorAll('.btn-certificado').forEach(btn => {
            btn.onclick = () => {
                window.open('https://docs.google.com/forms/d/e/1FAIpQLSdBn7At3hUaj4fiWxXqmEAYo9c-O7FGPNf55JZv4SyFcvuM6A/viewform?usp=header', '_blank');
            };
        });

        container.querySelectorAll('.btn-cancelar-palestra').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                state.events = state.events.filter(e => e.id !== id);
                saveData();
                showToast('Evento removido da sua lista.');
                renderTabContent(state.currentTab || 'meus-eventos');
            };
        });

        container.querySelectorAll('.btn-alterar-palestra').forEach(btn => {
            btn.onclick = () => {
                showToast('Abrindo edição do evento...');
                window.switchTab('criar-eventos', true);
            };
        });
    }

    function renderPerfilTab() {
        const container = document.getElementById('panel-perfil');
        if (!container) return;
        const u = state.currentUser;
        const isPalestrante = state.userRole === 'palestrante';
        const roleBadgeHTML = `<span class="self-start sm:self-auto px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${isPalestrante ? 'Palestrante Oficial' : 'Participante Ativo'}</span>`;

        const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
        const effectivePhoto = u.foto || (!u.fotoRemovida ? defaultAvatar : '');
        const photoPreviewContent = effectivePhoto
            ? `<img src="${effectivePhoto}" alt="Foto de Perfil" class="w-full h-full object-cover" />`
            : `<i class="fa-solid fa-user"></i>`;

        let extraCampos = '';
        if (isPalestrante) {
            extraCampos = `
                <div class="mb-7 mt-7">
                    <div class="evt-section-heading">
                        <h3>Formação e Qualificação Docente</h3>
                    </div>
                    <div class="evt-grid-2">
                        <div class="evt-form-group">
                            <label>Nível de Escolaridade</label>
                            <select id="edit-evt-escolaridade" class="evt-form-control">
                                <option value="">Selecione...</option>
                                <option value="Graduação" ${u.escolaridade==='Graduação'?'selected':''}>Graduação</option>
                                <option value="Pós-Graduação" ${u.escolaridade==='Pós-Graduação'?'selected':''}>Pós-Graduação</option>
                                <option value="Mestrado" ${u.escolaridade==='Mestrado'?'selected':''}>Mestrado</option>
                                <option value="Doutorado" ${u.escolaridade==='Doutorado'?'selected':''}>Doutorado</option>
                                <option value="Pós-Doutorado" ${u.escolaridade==='Pós-Doutorado'?'selected':''}>Pós-Doutorado</option>
                            </select>
                        </div>
                        <div class="evt-form-group">
                            <label>Área de Atuação Principal</label>
                            <input type="text" id="edit-evt-area" class="evt-form-control" value="${escapeHTML(u.area || '')}">
                        </div>
                        <div class="evt-form-group evt-full-width">
                            <label>Profissão Atual & Anos de Experiência</label>
                            <input type="text" id="edit-evt-profissao" class="evt-form-control" value="${escapeHTML(u.profissao || '')}">
                        </div>
                        <div class="evt-form-group evt-full-width">
                            <label>Experiências Profissionais Relevantes</label>
                            <textarea id="edit-evt-experiencia" class="evt-form-control" rows="2">${escapeHTML(u.experiencia || '')}</textarea>
                        </div>
                        <div class="evt-form-group evt-full-width">
                            <label>Resumo "Sobre Mim"</label>
                            <textarea id="edit-evt-sobre" class="evt-form-control" rows="3">${escapeHTML(u.sobre || '')}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="mb-7">
                    <div class="evt-section-heading">
                        <h3>Dados Bancários para Repasse</h3>
                    </div>
                    <div class="evt-grid-2">
                        <div class="evt-form-group">
                            <label>Banco</label>
                            <input type="text" id="edit-evt-banco" class="evt-form-control" value="${escapeHTML(u.banco || '')}" placeholder="Ex: Banco do Brasil">
                        </div>
                        <div class="evt-form-group">
                            <label>Agência</label>
                            <input type="text" id="edit-evt-agencia" class="evt-form-control" value="${escapeHTML(u.agencia || '')}">
                        </div>
                        <div class="evt-form-group">
                            <label>Conta</label>
                            <input type="text" id="edit-evt-conta" class="evt-form-control" value="${escapeHTML(u.conta || '')}">
                        </div>
                        <div class="evt-form-group">
                            <label>Chave PIX</label>
                            <input type="text" id="edit-evt-pix" class="evt-form-control" value="${escapeHTML(u.pix || '')}">
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('perfil', roleBadgeHTML)}

                <form id="form-edit-perfil-evt">
                    <!-- Card com Foto de Perfil e Upload (Idêntico ao Portal do Associado) -->
                    <div class="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 mb-7">
                        <div class="flex items-center justify-between gap-5 flex-wrap">
                            <div class="flex items-center gap-4">
                                <div class="relative shrink-0">
                                    <div id="edit-evt-photo-preview" class="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-2xl text-slate-500">
                                        ${photoPreviewContent}
                                    </div>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">Sua Foto de Perfil</h4>
                                    <p class="text-xs text-slate-500 mt-0.5 mb-3">Formatos recomendados: JPG, PNG ou WEBP. Atualização instantânea no painel.</p>
                                    <div class="flex gap-2.5 items-center flex-wrap">
                                        <label for="edit-evt-foto-input" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer">
                                            <i class="fa-solid fa-camera"></i> Carregar Nova Foto
                                        </label>
                                        <button type="button" id="btn-remove-evt-photo" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer">
                                            <i class="fa-regular fa-trash-can"></i> Remover Foto
                                        </button>
                                        <input type="file" id="edit-evt-foto-input" accept="image/*" style="display: none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-7">
                        <div class="evt-section-heading">
                            <h3>Informações Pessoais</h3>
                        </div>
                        <div class="evt-grid-2">
                            <div class="evt-form-group evt-full-width">
                                <label>Nome Completo</label>
                                <input type="text" id="edit-evt-nome" class="evt-form-control" value="${escapeHTML(u.nome || '')}" required>
                            </div>
                            <div class="evt-form-group">
                                <label>E-mail</label>
                                <input type="email" class="evt-form-control" value="${escapeHTML(u.email || '')}" readonly style="background:#F8FAFC;">
                            </div>
                            <div class="evt-form-group">
                                <label>CPF</label>
                                <input type="text" id="edit-evt-cpf" class="evt-form-control" value="${escapeHTML(u.cpf || '')}" required>
                            </div>
                            <div class="evt-form-group">
                                <label>RG</label>
                                <input type="text" id="edit-evt-rg" class="evt-form-control" value="${escapeHTML(u.rg || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Data de Nascimento</label>
                                <input type="date" id="edit-evt-nasc" class="evt-form-control" value="${escapeHTML(u.nasc || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Gênero</label>
                                <select id="edit-evt-genero" class="evt-form-control">
                                    <option value="">Selecione...</option>
                                    <option value="Masculino" ${u.genero==='Masculino'?'selected':''}>Masculino</option>
                                    <option value="Feminino" ${u.genero==='Feminino'?'selected':''}>Feminino</option>
                                    <option value="Não-binário" ${u.genero==='Não-binário'?'selected':''}>Não-binário</option>
                                    <option value="Prefiro não informar" ${u.genero==='Prefiro não informar'?'selected':''}>Prefiro não informar</option>
                                    <option value="Outro" ${u.genero==='Outro'?'selected':''}>Outro</option>
                                </select>
                            </div>
                            <div class="evt-form-group">
                                <label>Celular / WhatsApp</label>
                                <input type="tel" id="edit-evt-celular" class="evt-form-control" value="${escapeHTML(u.celular || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Telefone Fixo</label>
                                <input type="tel" id="edit-evt-fixo" class="evt-form-control" value="${escapeHTML(u.fixo || '')}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-7">
                        <div class="evt-section-heading">
                            <h3>Endereço</h3>
                        </div>
                        <div class="evt-grid-2">
                            <div class="evt-form-group">
                                <label>CEP</label>
                                <input type="text" id="edit-evt-cep" class="evt-form-control" value="${escapeHTML(u.cep || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Logradouro</label>
                                <input type="text" id="edit-evt-rua" class="evt-form-control" value="${escapeHTML(u.rua || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Número</label>
                                <input type="text" id="edit-evt-numero" class="evt-form-control" value="${escapeHTML(u.numero || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Bairro</label>
                                <input type="text" id="edit-evt-bairro" class="evt-form-control" value="${escapeHTML(u.bairro || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>Cidade</label>
                                <input type="text" id="edit-evt-cidade" class="evt-form-control" value="${escapeHTML(u.cidade || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label>UF</label>
                                <input type="text" id="edit-evt-uf" class="evt-form-control" value="${escapeHTML(u.uf || '')}">
                            </div>
                            <div class="evt-form-group evt-full-width">
                                <label>Complemento</label>
                                <input type="text" id="edit-evt-complemento" class="evt-form-control" value="${escapeHTML(u.complemento || '')}">
                            </div>
                        </div>
                    </div>

                    <div class="mb-7">
                        <div class="evt-section-heading">
                            <h3>Perfil Público na Comunidade</h3>
                        </div>
                        <div class="evt-grid-2">
                            <div class="evt-form-group evt-full-width">
                                <label>Biografia / Sobre Mim (Visível na Comunidade)</label>
                                <textarea id="edit-evt-bio" class="evt-form-control" rows="3">${escapeHTML(u.bio || '')}</textarea>
                            </div>
                            <div class="evt-form-group evt-full-width">
                                <label>Áreas de Interesse (Ex: RPPS, BPC, Cálculos)</label>
                                <input type="text" id="edit-evt-interesses" class="evt-form-control" value="${escapeHTML(u.interesses || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label><i class="fa-brands fa-linkedin text-slate-500 mr-1"></i> Link do LinkedIn</label>
                                <input type="url" id="edit-evt-linkedin" class="evt-form-control" placeholder="https://linkedin.com/in/seu-perfil" value="${escapeHTML(u.linkedin || '')}">
                            </div>
                            <div class="evt-form-group">
                                <label><i class="fa-brands fa-instagram text-slate-500 mr-1"></i> Usuário Instagram</label>
                                <input type="text" id="edit-evt-instagram" class="evt-form-control" placeholder="@seuperfil" value="${escapeHTML(u.instagram || '')}">
                            </div>
                            <div class="evt-form-group evt-full-width flex-row items-center gap-2.5 mt-2">
                                <input type="checkbox" id="edit-evt-exibirlocal" class="w-4 h-4 accent-emerald-600 rounded cursor-pointer" ${u.exibirLocal ? 'checked' : ''}>
                                <label for="edit-evt-exibirlocal" class="m-0 font-semibold text-xs text-slate-700 cursor-pointer">Exibir minha localização profissional no mapa da comunidade</label>
                            </div>
                        </div>
                    </div>

                    ${extraCampos}

                    <div class="mb-7">
                        <div class="evt-section-heading">
                            <h3>Segurança e Senha</h3>
                        </div>
                        <p class="text-xs text-slate-500 mb-4">Para alterar sua senha de acesso, preencha os campos abaixo.</p>
                        <div class="evt-grid-2">
                            <div class="evt-form-group">
                                <label>Nova Senha</label>
                                <input type="password" id="edit-evt-senha" class="evt-form-control" placeholder="Deixe em branco para manter a atual">
                            </div>
                            <div class="evt-form-group">
                                <label>Confirmar Nova Senha</label>
                                <input type="password" id="edit-evt-senha-conf" class="evt-form-control" placeholder="Repita a nova senha">
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button type="submit" class="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer">
                            <i class="fa-solid fa-floppy-disk"></i> Salvar Alterações Cadastrais
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Upload e Remoção de Foto de Perfil
        const fotoInput = document.getElementById('edit-evt-foto-input');
        const photoPreview = document.getElementById('edit-evt-photo-preview');
        const btnRemovePhoto = document.getElementById('btn-remove-evt-photo');

        if (fotoInput && photoPreview) {
            fotoInput.addEventListener('change', (ev) => {
                const file = ev.target.files && ev.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (loadEv) => {
                    const dataUrl = loadEv.target.result;
                    u.foto = dataUrl;
                    u.fotoRemovida = false;
                    photoPreview.innerHTML = `<img src="${dataUrl}" alt="Foto de Perfil" class="w-full h-full object-cover" />`;
                    localStorage.setItem('sbps_evt_session', JSON.stringify(u));
                    updateHeaderUserDisplay();
                    showToast('Foto de perfil atualizada!');
                };
                reader.readAsDataURL(file);
            });
        }

        if (btnRemovePhoto && photoPreview) {
            btnRemovePhoto.addEventListener('click', () => {
                delete u.foto;
                u.fotoRemovida = true;
                photoPreview.innerHTML = `<i class="fa-solid fa-user"></i>`;
                localStorage.setItem('sbps_evt_session', JSON.stringify(u));
                updateHeaderUserDisplay();
                showToast('Foto de perfil removida.');
            });
        }

        document.getElementById('form-edit-perfil-evt').onsubmit = (e) => {
            e.preventDefault();
            u.nome = document.getElementById('edit-evt-nome').value;
            u.cpf = document.getElementById('edit-evt-cpf').value;
            u.rg = document.getElementById('edit-evt-rg').value;
            u.nasc = document.getElementById('edit-evt-nasc').value;
            u.genero = document.getElementById('edit-evt-genero').value;
            u.celular = document.getElementById('edit-evt-celular').value;
            u.fixo = document.getElementById('edit-evt-fixo').value;
            u.cep = document.getElementById('edit-evt-cep').value;
            u.rua = document.getElementById('edit-evt-rua').value;
            u.numero = document.getElementById('edit-evt-numero').value;
            u.bairro = document.getElementById('edit-evt-bairro').value;
            u.cidade = document.getElementById('edit-evt-cidade').value;
            u.uf = document.getElementById('edit-evt-uf').value;
            u.complemento = document.getElementById('edit-evt-complemento').value;
            u.bio = document.getElementById('edit-evt-bio').value;
            u.interesses = document.getElementById('edit-evt-interesses').value;
            u.linkedin = document.getElementById('edit-evt-linkedin').value;
            u.instagram = document.getElementById('edit-evt-instagram').value;
            u.exibirLocal = document.getElementById('edit-evt-exibirlocal').checked;

            if (isPalestrante) {
                u.escolaridade = document.getElementById('edit-evt-escolaridade').value;
                u.area = document.getElementById('edit-evt-area').value;
                u.profissao = document.getElementById('edit-evt-profissao').value;
                u.experiencia = document.getElementById('edit-evt-experiencia').value;
                u.sobre = document.getElementById('edit-evt-sobre').value;
                u.banco = document.getElementById('edit-evt-banco').value;
                u.agencia = document.getElementById('edit-evt-agencia').value;
                u.conta = document.getElementById('edit-evt-conta').value;
                u.pix = document.getElementById('edit-evt-pix').value;
            }

            localStorage.setItem('sbps_evt_session', JSON.stringify(u));
            updateHeaderUserDisplay();
            showToast('Perfil atualizado com sucesso!');
        };
    }

    function calculateReputation(email) {
        if (!email) return 0;
        let points = 0;

        const myPosts = state.communityPosts.filter(p => p.email === email);
        points += myPosts.length * 5;
        points += myPosts.reduce((acc, p) => acc + (p.likes || 0), 0) * 1;

        if (state.currentUser && state.currentUser.email === email) {
            points += state.participations.length * 2;
        }

        const realizedEvents = state.events.filter(e => e.status === 'Realizado' && e.palestrante_email === email);
        points += realizedEvents.length * 3;

        return points;
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
            if (filters.search && filters.search.trim()) {
                const q = filters.search.trim().toLowerCase();
                const fullText = [
                    e.titulo, e.resumo, e.palestrante, e.local, e.palavraChave, e.area, e.tema, e.tipo
                ].filter(Boolean).join(' ').toLowerCase();

                if (!fullText.includes(q)) return false;
            }

            if (filters.tema && filters.tema !== '') {
                const t = filters.tema.toLowerCase();
                const eTema = (e.tema || e.tipo || '').toLowerCase();
                if (!eTema.includes(t)) return false;
            }

            if (filters.area && filters.area !== '') {
                const a = filters.area.toLowerCase();
                const eArea = (e.area || '').toLowerCase();
                if (!eArea.includes(a)) return false;
            }

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

            const hours = parseEventHours(e.cargaHoraria);
            if (filters.carga === 'ate10') {
                if (hours > 10) return false;
            } else if (filters.carga === '10-20') {
                if (hours < 10 || hours > 20) return false;
            } else if (filters.carga === 'acima20') {
                if (hours <= 20) return false;
            }

            if (filters.shift && filters.shift !== '' && filters.shift !== 'todos') {
                const shift = parseEventShift(e.dateStr);
                if (shift !== filters.shift) return false;
            }

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
                <div class="evt-search-box-wrapper">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" class="evt-search-input filter-field" data-field="search" value="${escapeAttr(f.search)}" placeholder="Pesquisa inteligente por título, resumo, palestrante, cidade, palavra-chave...">
                </div>

                <div class="evt-filter-grid">
                    <div class="evt-filter-group">
                        <label>Tema</label>
                        <select class="filter-field" data-field="tema">
                            <option value="">Todos os Temas</option>
                            ${Array.from(temasSet).map(t => `<option value="${escapeAttr(t)}" ${f.tema === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>

                    <div class="evt-filter-group">
                        <label>Área</label>
                        <select class="filter-field" data-field="area">
                            <option value="">Todas as Áreas</option>
                            ${Array.from(areasSet).map(a => `<option value="${escapeAttr(a)}" ${f.area === a ? 'selected' : ''}>${a}</option>`).join('')}
                        </select>
                    </div>

                    <div class="evt-filter-group">
                        <label>Valor</label>
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

                    ${isCustomPrice ? `
                    <div class="evt-filter-group">
                        <label>Faixa (R$ Min - Max)</label>
                        <div class="evt-range-inputs">
                            <input type="number" step="10" class="filter-field" data-field="valorMin" value="${escapeAttr(f.valorMin)}" placeholder="Min">
                            <span>-</span>
                            <input type="number" step="10" class="filter-field" data-field="valorMax" value="${escapeAttr(f.valorMax)}" placeholder="Max">
                        </div>
                    </div>
                    ` : ''}

                    <div class="evt-filter-group">
                        <label>Carga Horária</label>
                        <select class="filter-field" data-field="carga">
                            <option value="">Todas as Cargas</option>
                            <option value="ate10" ${f.carga === 'ate10' ? 'selected' : ''}>Até 10 horas</option>
                            <option value="10-20" ${f.carga === '10-20' ? 'selected' : ''}>10h a 20h</option>
                            <option value="acima20" ${f.carga === 'acima20' ? 'selected' : ''}>Acima de 20h</option>
                        </select>
                    </div>

                    <div class="evt-filter-group">
                        <label>Horário / Turno</label>
                        <select class="filter-field" data-field="shift">
                            <option value="">Todos os Horários</option>
                            <option value="manha" ${f.shift === 'manha' ? 'selected' : ''}>Manhã (06h - 12h)</option>
                            <option value="tarde" ${f.shift === 'tarde' ? 'selected' : ''}>Tarde (12h - 18h)</option>
                            <option value="noite" ${f.shift === 'noite' ? 'selected' : ''}>Noite (18h+)</option>
                        </select>
                    </div>

                    <div class="evt-filter-group">
                        <label>Dia / Período</label>
                        <select class="filter-field" data-field="dataPer">
                            <option value="">Todos os Períodos</option>
                            <option value="7dias" ${f.dataPer === '7dias' ? 'selected' : ''}>Próximos 7 Dias</option>
                            <option value="este-mes" ${f.dataPer === 'este-mes' ? 'selected' : ''}>Este Mês</option>
                            <option value="especifica" ${f.dataPer === 'especifica' ? 'selected' : ''}>Data Específica...</option>
                        </select>
                    </div>

                    ${isExactDate ? `
                    <div class="evt-filter-group">
                        <label>Escolher Data</label>
                        <input type="date" class="filter-field" data-field="dateExact" value="${escapeAttr(f.dateExact)}">
                    </div>
                    ` : ''}
                </div>

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
        const statusBadge = `<span class="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">Status: Inscrições Abertas</span>`;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('eventos', statusBadge)}
                ${filterHTML}
                <div class="space-y-4">
                    ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'disponivel')).join('') : `
                        <div class="evt-empty-results">
                            <i class="fa-solid fa-calendar-xmark"></i>
                            <h4>Nenhum evento encontrado</h4>
                            <p>Nenhum evento corresponde aos filtros ou pesquisa aplicados.</p>
                        </div>
                    `}
                </div>
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
        const btnNovaInsc = `
            <button type="button" onclick="window.switchTab('eventos', true)" class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors self-start sm:self-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Explorar Eventos
            </button>
        `;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('inscricoes', btnNovaInsc)}
                ${filterHTML}
                <div class="space-y-4">
                    ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'inscrito')).join('') : `
                        <div class="evt-empty-results">
                            <i class="fa-solid fa-ticket-simple"></i>
                            <h4>Nenhuma inscrição encontrada</h4>
                            <p>Não há inscrições ativas que correspondam aos filtros pesquisados.</p>
                        </div>
                    `}
                </div>
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
        const certBadge = `<span class="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">Certificados Liberados</span>`;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('participacoes', certBadge)}
                ${filterHTML}
                <div class="space-y-4">
                    ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'participado')).join('') : `
                        <div class="evt-empty-results">
                            <i class="fa-solid fa-award"></i>
                            <h4>Nenhuma participação encontrada</h4>
                            <p>Não foram encontradas participações com os critérios selecionados.</p>
                        </div>
                    `}
                </div>
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
        const btnNovoEvt = `
            <div class="flex flex-wrap gap-2 self-start sm:self-auto">
                <button type="button" onclick="window.openCreateProposalModal()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors">
                    Proposta Rápida
                </button>
                <button type="button" onclick="window.switchTab('criar-eventos', true)" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    Propor Nova Palestra / Evento
                </button>
            </div>
        `;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('meus-eventos', btnNovoEvt)}
                ${filterHTML}
                <div class="space-y-4">
                    ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'palestrante-criado')).join('') : `
                        <div class="evt-empty-results">
                            <i class="fa-solid fa-calendar-minus"></i>
                            <h4>Nenhum evento encontrado</h4>
                            <p>Nenhum dos seus eventos criados corresponde à pesquisa ou filtros.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'meus-eventos');
    }

    function renderRealizadosTab() {
        const container = document.getElementById('panel-realizados');
        if (!container) return;
        const portfolioRealized = [
            {
                id: 'hist-cong-prev-2026',
                tipo: 'Congresso Nacional',
                tema: 'RGPS',
                area: 'Direito Previdenciário',
                titulo: 'III Congresso Brasileiro de Direito Previdenciário',
                resumo: 'Apresentação: "Aposentadoria Especial e Ruído após Tema 1083 do STJ". Avaliação dos participantes: 4.95 / 5.0.',
                cargaHoraria: '20h',
                dateStr: '18/08/2026 - 19:00',
                local: 'Auditório SBPS + Zoom',
                valor: 'Concluído',
                palestrante: state.currentUser ? state.currentUser.nome : 'Dr. Thiago',
                status: 'Realizado'
            },
            {
                id: 'hist-sem-calc-2026',
                tipo: 'Seminário Técnico',
                tema: 'RGPS',
                area: 'Direito Previdenciário',
                titulo: 'Seminário Avançado de Cálculos RGPS e Revisão da Vida Toda',
                resumo: 'Oficina prática de liquidação de sentença previdenciária e apuração de RMI com 310 ouvintes.',
                cargaHoraria: '12h',
                dateStr: '10/05/2026 - 19:00',
                local: 'Plataforma Zoom VIP',
                valor: 'Concluído',
                palestrante: state.currentUser ? state.currentUser.nome : 'Dr. Thiago',
                status: 'Realizado'
            }
        ];
        const stateRealized = state.events.filter(e => e.status === 'Realizado');
        const realized = [...stateRealized, ...portfolioRealized];
        const filters = state.tabFilters['realizados'];
        const filteredEvts = filterEventsList(realized, filters);

        const filterHTML = renderFilterBarHTML('realizados', realized.length, filteredEvts.length);
        const histBadge = `<span class="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">Certificados de Docência Disponíveis</span>`;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('realizados', histBadge)}
                ${filterHTML}
                <div class="space-y-4">
                    ${filteredEvts.length > 0 ? filteredEvts.map(e => createEventCardHTML(e, 'palestrante-realizado')).join('') : `
                        <div class="evt-empty-results">
                            <i class="fa-solid fa-circle-check"></i>
                            <h4>Nenhum evento realizado encontrado</h4>
                            <p>Nenhum evento finalizado corresponde aos filtros selecionados.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        attachCardActionListeners(container);
        attachFilterEventListeners(container, 'realizados');
    }

    function renderComunidadeTab() {
        const container = document.getElementById('panel-comunidade');
        if (!container) return;

        const rep = calculateReputation(state.currentUser ? state.currentUser.email : null);
        const repBadgeHTML = `<div class="evt-reputation-badge self-start sm:self-auto"><i class="fa-solid fa-star text-amber-500"></i> Reputação: ${rep} Pontos</div>`;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('comunidade', repBadgeHTML)}
                
                <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-100">
                    <button type="button" class="com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white transition-all whitespace-nowrap" onclick="window.switchCommunitySubTab('forum', this)">
                        <i class="fa-regular fa-comments mr-1"></i> Fórum & Teses
                    </button>
                    <button type="button" class="com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-all whitespace-nowrap" onclick="window.switchCommunitySubTab('mural', this)">
                        <i class="fa-solid fa-bullhorn mr-1"></i> Mural Oficial
                    </button>
                    <button type="button" class="com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-all whitespace-nowrap" onclick="window.switchCommunitySubTab('grupos', this)">
                        <i class="fa-solid fa-user-group mr-1"></i> Grupos & Chat
                    </button>
                    <button type="button" class="com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-all whitespace-nowrap" onclick="window.switchCommunitySubTab('diretorio', this)">
                        <i class="fa-solid fa-map-location-dot mr-1"></i> Diretório & Mapa
                    </button>
                    <button type="button" class="com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-all whitespace-nowrap" onclick="window.switchCommunitySubTab('agenda', this)">
                        <i class="fa-regular fa-calendar-days mr-1"></i> Agenda
                    </button>
                </div>
                
                <div id="com-subpanel-forum" class="com-subpanel" style="display:block;">
                    ${renderForumHTML()}
                </div>
                <div id="com-subpanel-mural" class="com-subpanel" style="display:none;">
                    ${renderMuralHTML()}
                </div>
                <div id="com-subpanel-grupos" class="com-subpanel" style="display:none;">
                    ${renderChatGruposHTML()}
                </div>
                <div id="com-subpanel-diretorio" class="com-subpanel" style="display:none;">
                    ${renderDiretorioHTML()}
                </div>
                <div id="com-subpanel-agenda" class="com-subpanel" style="display:none;">
                    ${renderAgendaHTML()}
                </div>
            </div>
        `;

        attachCommunityListeners(container);
    }

    window.switchCommunitySubTab = function (subtab, btn) {
        document.querySelectorAll('.com-subpanel').forEach(p => p.style.display = 'none');
        const activePanel = document.getElementById('com-subpanel-' + subtab);
        if (activePanel) activePanel.style.display = 'block';

        if (btn) {
            const parent = btn.parentElement;
            parent.querySelectorAll('.com-nav-pill').forEach(b => {
                b.className = 'com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-all whitespace-nowrap';
            });
            btn.className = 'com-nav-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white transition-all whitespace-nowrap';
        }

        if (subtab === 'diretorio') {
            initCommunityMap();
        }
    };

    function renderForumHTML() {
        return `
            <div class="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 class="text-sm font-bold text-slate-900 m-0">Fóruns de Discussão & Teses Jurídicas</h3>
                    <p class="text-xs text-slate-500 mt-0.5 m-0">Espaço para debate técnico, troca de experiências práticas e teses previdenciárias.</p>
                </div>
                <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors" onclick="window.openNewTopicModal()">
                    <i class="fa-solid fa-plus"></i> Novo Tópico
                </button>
            </div>
            <div class="evt-cards-grid" id="com-forum-grid">
                ${state.communityPosts.map(p => `
                    <div class="bg-white rounded-2xl p-5 border border-slate-200 custom-shadow flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="evt-badge-tag">${escapeHTML(p.categoria)}</span>
                                <span class="text-[11px] text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${escapeHTML(p.created_at)}</span>
                            </div>
                            <h4 class="text-sm font-bold text-slate-900 mb-2 leading-snug">${escapeHTML(p.titulo)}</h4>
                            <p class="text-xs text-slate-500 mb-4 leading-relaxed">${escapeHTML(p.conteudo)}</p>
                        </div>
                        <div class="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                            <div class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">${escapeHTML((p.autor || 'M').charAt(0))}</span>
                                ${escapeHTML(p.autor)}
                            </div>
                            <div class="flex gap-2">
                                <button type="button" class="evt-btn-icon-secondary btn-like-post" data-id="${p.id}" title="Curtir e dar +1 ponto de reputação"><i class="fa-regular fa-thumbs-up"></i> <span>${p.likes || 0}</span></button>
                                <button type="button" class="evt-btn-icon-danger btn-report-post" data-id="${p.id}" title="Denunciar conteúdo"><i class="fa-regular fa-flag"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    window.openNewTopicModal = function () {
        const modal = document.getElementById('com-modal-novo-topico');
        if (modal) {
            modal.style.display = 'flex';
            const input = document.getElementById('topico-titulo');
            if (input) setTimeout(() => input.focus(), 100);
        }
    };

    window.closeNewTopicModal = function () {
        const modal = document.getElementById('com-modal-novo-topico');
        if (modal) modal.style.display = 'none';
    };

    window.submitNewCommunityTopic = function (e) {
        e.preventDefault();
        const tit = document.getElementById('topico-titulo').value.trim();
        const cat = document.getElementById('topico-categoria').value;
        const cont = document.getElementById('topico-conteudo').value.trim();

        if (!tit || !cont) {
            alert('Por favor, preencha o título e o conteúdo do tópico.');
            return;
        }

        const authorName = state.currentUser ? state.currentUser.nome : 'Membro Associado';
        const authorEmail = state.currentUser ? state.currentUser.email : '';

        const newPost = {
            id: 'post-' + Date.now(),
            autor: authorName,
            email: authorEmail,
            categoria: cat,
            titulo: tit,
            conteudo: cont,
            likes: 0,
            created_at: 'Hoje'
        };

        state.communityPosts.unshift(newPost);
        saveData();
        window.closeNewTopicModal();

        document.getElementById('topico-titulo').value = '';
        document.getElementById('topico-conteudo').value = '';

        const forumPanel = document.getElementById('com-subpanel-forum');
        if (forumPanel) forumPanel.innerHTML = renderForumHTML();
        attachCommunityListeners(forumPanel);

        const repBadge = document.querySelector('.evt-reputation-badge');
        if (repBadge) {
            const rep = calculateReputation(authorEmail);
            repBadge.innerHTML = `<i class="fa-solid fa-star text-amber-500"></i> Reputação: ${rep} Pontos`;
        }

        showToast('Tópico publicado com sucesso no fórum! (+5 Pontos de reputação)');
    };

    function renderMuralHTML() {
        return `
            <div class="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 mb-6">
                <h3 class="text-sm font-bold text-slate-900 m-0">Mural de Avisos Oficiais</h3>
                <p class="text-xs text-slate-500 mt-0.5 m-0">Notícias oficiais, editais científicos e comunicados institucionais da diretoria SBPS.</p>
            </div>
            <div class="evt-cards-grid">
                ${state.notices.map(n => `
                    <div class="bg-white rounded-2xl p-5 border border-slate-200 custom-shadow">
                        <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-regular fa-calendar mr-1"></i>${escapeHTML(n.data)}</span>
                        <h4 class="text-sm font-bold text-slate-900 mt-3 mb-2">${escapeHTML(n.titulo)}</h4>
                        <p class="text-xs text-slate-600 leading-relaxed m-0">${escapeHTML(n.conteudo)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderChatGruposHTML() {
        return `
            <div class="com-chat-layout">
                <div class="com-chat-sidebar">
                    <div class="com-chat-sidebar-header">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">Grupos Temáticos</h3>
                    </div>
                    <div class="com-chat-list">
                        ${state.groups.map(g => `
                            <div class="com-chat-item" onclick="window.loadChatGroup('${g.id}')">
                                <div class="com-chat-avatar"><i class="fa-solid fa-user-group"></i></div>
                                <div class="com-chat-info">
                                    <h4>${escapeHTML(g.nome)}</h4>
                                    <p>${g.membrosCount} membros</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="com-chat-main">
                    <div id="com-active-chat-area" class="flex flex-col h-full justify-center items-center text-slate-400 p-8 text-center">
                        <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                            <i class="fa-regular fa-comments text-lg"></i>
                        </div>
                        <h4 class="text-sm font-bold text-slate-800 m-0 mb-1">Salas de Discussão em Grupo</h4>
                        <p class="text-xs text-slate-500 max-w-xs m-0">Selecione um dos grupos temáticos à esquerda para interagir com advogados e especialistas em tempo real.</p>
                    </div>
                </div>
            </div>
        `;
    }

    window.loadChatGroup = function (groupId) {
        const area = document.getElementById('com-active-chat-area');
        if (!area) return;
        const group = state.groups.find(g => g.id === groupId);
        if (!group) return;
        const msgs = (state.chats || []).filter(c => c.tipo === 'group' && c.targetId === groupId);
        const myName = state.currentUser ? state.currentUser.nome : 'Você';

        area.className = 'flex flex-col h-full w-full text-left';
        area.innerHTML = `
            <div class="com-chat-main-header">
                <div class="com-chat-avatar"><i class="fa-solid fa-user-group"></i></div>
                <div>
                    <h3 class="text-sm font-bold text-slate-900 m-0">${escapeHTML(group.nome)}</h3>
                    <p class="text-xs text-slate-500 m-0">${group.membrosCount} membros • ${escapeHTML(group.descricao)}</p>
                </div>
            </div>
            <div class="com-chat-messages-container" id="com-group-messages-container">
                ${msgs.map(m => `
                    <div class="com-chat-message ${m.remetente === myName ? 'sent' : 'received'}">
                        <span class="com-chat-sender">${escapeHTML(m.remetente)}</span>
                        <p style="margin:2px 0;">${escapeHTML(m.mensagem)}</p>
                        <span class="com-chat-time">${escapeHTML(m.timestamp)}</span>
                    </div>
                `).join('')}
            </div>
            <form id="form-send-group-chat" class="com-chat-input-area" onsubmit="window.sendGroupMessage(event, '${groupId}')">
                <input type="text" id="group-msg-input" class="evt-form-control" placeholder="Escreva uma mensagem para o grupo..." required>
                <button type="submit" class="evt-btn-primary" style="width:auto; margin:0; padding:10px 18px;"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
        `;
        const msgsContainer = document.getElementById('com-group-messages-container');
        if (msgsContainer) msgsContainer.scrollTop = msgsContainer.scrollHeight;
        const input = document.getElementById('group-msg-input');
        if (input) input.focus();
    };

    window.sendGroupMessage = function (e, groupId) {
        e.preventDefault();
        const input = document.getElementById('group-msg-input');
        if (!input || !input.value.trim()) return;

        const now = new Date();
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        state.chats.push({
            id: 'msg-' + Date.now(),
            tipo: 'group',
            targetId: groupId,
            remetente: state.currentUser ? state.currentUser.nome : 'Você',
            mensagem: input.value.trim(),
            timestamp: timeStr
        });
        saveData();
        input.value = '';
        window.loadChatGroup(groupId);
    };

    function renderDiretorioHTML() {
        const membersList = state.members || [];
        return `
            <div class="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 class="text-sm font-bold text-slate-900 m-0">Diretório & Mapa de Membros</h3>
                    <p class="text-xs text-slate-500 mt-0.5 m-0">Encontre profissionais da previdência em todo o Brasil para parcerias e conexões.</p>
                </div>
                <div>
                    <input type="text" id="com-member-search" class="evt-form-control" placeholder="Buscar por nome ou área..." oninput="window.filterCommunityMembers(this.value)" style="width:240px; margin:0; padding:8px 12px; font-size:0.8rem;">
                </div>
            </div>
            
            <div class="h-80 rounded-2xl overflow-hidden border border-slate-200 mb-6 bg-slate-100 flex items-center justify-center text-xs text-slate-500" id="community-map">
                Carregando mapa interativo...
            </div>

            <div class="evt-cards-grid" id="com-members-grid">
                ${renderMemberCardsHTML(membersList)}
            </div>
        `;
    }

    function renderMemberCardsHTML(list) {
        if (!list || list.length === 0) {
            return `<div class="evt-empty-results"><p>Nenhum membro encontrado.</p></div>`;
        }
        return list.map(m => `
            <div class="bg-white rounded-2xl p-5 border border-slate-200 custom-shadow text-center flex flex-col justify-between">
                <div>
                    <div class="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-lg font-bold mx-auto mb-3">
                        ${escapeHTML((m.nome || 'M').charAt(0))}
                    </div>
                    <h4 class="text-sm font-bold text-slate-900 mb-1">${escapeHTML(m.nome)}</h4>
                    <span class="evt-badge-tag mb-3">${m.role === 'palestrante' ? 'Palestrante Oficial' : 'Membro Participante'}</span>
                    <p class="text-xs text-slate-500 mb-2 leading-relaxed">${escapeHTML(m.bio || 'Advogado(a) previdenciarista atuante.')}</p>
                    <p class="text-[11px] font-semibold text-emerald-700 mb-4"><i class="fa-solid fa-tag mr-1"></i>${escapeHTML(m.interesses || 'Direito Previdenciário')}</p>
                </div>
                <div>
                    <div class="flex justify-center gap-3 mb-3">
                        ${m.linkedin ? `<a href="${encodeURI(m.linkedin.startsWith('http') ? m.linkedin : 'https://' + m.linkedin)}" target="_blank" rel="noopener" class="text-slate-400 hover:text-blue-600 text-sm"><i class="fa-brands fa-linkedin"></i></a>` : ''}
                        ${m.instagram ? `<a href="https://instagram.com/${encodeURIComponent(m.instagram.replace('@', ''))}" target="_blank" rel="noopener" class="text-slate-400 hover:text-pink-600 text-sm"><i class="fa-brands fa-instagram"></i></a>` : ''}
                    </div>
                    <button type="button" class="evt-btn-card-primary w-full" onclick="window.openPrivateChat('${escapeHTML(m.nome)}', '${escapeHTML(m.email || m.nome)}')">
                        <i class="fa-regular fa-comment"></i> Mensagem Privada
                    </button>
                </div>
            </div>
        `).join('');
    }

    window.filterCommunityMembers = function (term) {
        const clean = (term || '').toLowerCase().trim();
        const filtered = (state.members || []).filter(m => {
            return (m.nome && m.nome.toLowerCase().includes(clean)) ||
                   (m.bio && m.bio.toLowerCase().includes(clean)) ||
                   (m.interesses && m.interesses.toLowerCase().includes(clean));
        });
        const grid = document.getElementById('com-members-grid');
        if (grid) grid.innerHTML = renderMemberCardsHTML(filtered);
    };

    let comMapInstance = null;
    function initCommunityMap() {
        if (!window.L) {
            const mc = document.getElementById('community-map');
            if (mc) mc.innerHTML = "<p class='text-xs text-slate-500 p-4 text-center'>Biblioteca do mapa não carregada.</p>";
            return;
        }

        const mapContainer = document.getElementById('community-map');
        if (!mapContainer) return;

        if (comMapInstance) {
            setTimeout(() => {
                if (comMapInstance) comMapInstance.invalidateSize();
            }, 100);
            return;
        }

        mapContainer.innerHTML = '';

        setTimeout(() => {
            try {
                comMapInstance = L.map('community-map').setView([-14.235, -51.925], 4);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
                    maxZoom: 18
                }).addTo(comMapInstance);

                const mapMembers = (state.members || []).filter(m => m.exibirLocal && m.lat && m.lng);
                const markers = [];
                mapMembers.forEach(m => {
                    const safeName = escapeHTML(m.nome);
                    const safeRole = escapeHTML(m.role === 'palestrante' ? 'Palestrante' : 'Membro Associado');
                    const safeBio = escapeHTML(m.bio || m.interesses || '');
                    const marker = L.marker([m.lat, m.lng]).addTo(comMapInstance);
                    marker.bindPopup(`
                        <div style="font-family:inherit; min-width:160px;">
                            <strong style="color:#0f172a; font-size:0.88rem;">${safeName}</strong><br>
                            <span style="display:inline-block; font-size:0.7rem; background:#ecfdf5; color:#047857; padding:2px 6px; border-radius:999px; margin:4px 0;">${safeRole}</span>
                            <p style="font-size:0.75rem; color:#475569; margin:4px 0 0 0;">${safeBio}</p>
                        </div>
                    `);
                    markers.push(marker);
                });

                if (markers.length > 0) {
                    const group = new L.featureGroup(markers);
                    comMapInstance.fitBounds(group.getBounds().pad(0.5));
                }

                comMapInstance.invalidateSize();
            } catch (err) {
                console.warn('Erro ao inicializar mapa da comunidade:', err);
            }
        }, 150);
    }

    window.openPrivateChat = function (targetName, targetId) {
        const drawer = document.getElementById('chat-private-drawer');
        if (!drawer) return;

        state.activePrivateTarget = { name: targetName, id: targetId };

        const headerTitle = drawer.querySelector('.evt-chat-header span');
        if (headerTitle) {
            headerTitle.innerHTML = `<i class="fa-solid fa-user-circle text-emerald-400"></i> Chat: ${escapeHTML(targetName)}`;
        }

        drawer.classList.add('open');
        renderPrivateChatMessages();

        const input = document.getElementById('chat-privado-input');
        if (input) setTimeout(() => input.focus(), 150);
    };

    function renderPrivateChatMessages() {
        const box = document.getElementById('chat-privado-box');
        if (!box || !state.activePrivateTarget) return;

        const myName = state.currentUser ? state.currentUser.nome : 'Você';
        const targetId = state.activePrivateTarget.id;
        const targetName = state.activePrivateTarget.name;

        const msgs = (state.chats || []).filter(c =>
            c.tipo === 'private' && (
                (c.targetId === targetId) ||
                (c.targetName === targetName) ||
                (c.remetente === targetName)
            )
        );

        if (msgs.length === 0) {
            box.innerHTML = `
                <div class="evt-chat-msg received">
                    Olá, ${escapeHTML(myName)}! Inicie uma conversa com <strong>${escapeHTML(targetName)}</strong> para trocar ideias, jurisprudência e contatos de parceria.
                </div>
            `;
        } else {
            box.innerHTML = msgs.map(m => `
                <div class="evt-chat-msg ${m.remetente === myName ? 'sent' : 'received'}">
                    <div style="font-size:0.68rem; font-weight:700; opacity:0.8; margin-bottom:2px;">${escapeHTML(m.remetente)}</div>
                    <div>${escapeHTML(m.mensagem)}</div>
                    <div style="font-size:0.62rem; text-align:right; opacity:0.7; margin-top:3px;">${escapeHTML(m.timestamp)}</div>
                </div>
            `).join('');
        }
        box.scrollTop = box.scrollHeight;
    }

    function setupPrivateChatForm() {
        const form = document.getElementById('form-chat-privado');
        const input = document.getElementById('chat-privado-input');
        if (form && !form.dataset.bound) {
            form.dataset.bound = 'true';
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!input || !input.value.trim() || !state.activePrivateTarget) return;

                const myName = state.currentUser ? state.currentUser.nome : 'Você';
                const now = new Date();
                const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

                const msgObj = {
                    id: 'msg-priv-' + Date.now(),
                    tipo: 'private',
                    targetId: state.activePrivateTarget.id,
                    targetName: state.activePrivateTarget.name,
                    remetente: myName,
                    mensagem: input.value.trim(),
                    timestamp: timeStr
                };

                state.chats.push(msgObj);
                saveData();
                input.value = '';
                renderPrivateChatMessages();

                const recipientName = state.activePrivateTarget.name;
                setTimeout(() => {
                    if (state.activePrivateTarget && state.activePrivateTarget.name === recipientName) {
                        const reply = {
                            id: 'msg-priv-' + Date.now(),
                            tipo: 'private',
                            targetId: state.currentUser ? state.currentUser.email : 'me',
                            targetName: myName,
                            remetente: recipientName,
                            mensagem: `Olá, ${myName}! Agradeço a mensagem. Estou acompanhando as novidades da SBPS e retorno assim que possível. Forte abraço!`,
                            timestamp: timeStr
                        };
                        state.chats.push(reply);
                        saveData();
                        renderPrivateChatMessages();
                    }
                }, 1800);
            });
        }
    }

    function renderAgendaHTML() {
        return `
            <div class="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 mb-6">
                <h3 class="text-sm font-bold text-slate-900 m-0">Agenda Oficial de Encontros</h3>
                <p class="text-xs text-slate-500 mt-0.5 m-0">Próximos eventos, palestras e reuniões abertas à comunidade previdenciária.</p>
            </div>
            <div class="evt-cards-grid">
                ${state.events.filter(e => e.status === 'Ativo').slice(0, 5).map(e => `
                    <div class="bg-white rounded-2xl p-5 border border-slate-200 custom-shadow flex flex-col justify-between">
                        <div>
                            <span class="evt-badge-tag mb-2.5">${escapeHTML(e.tipo)}</span>
                            <h4 class="text-sm font-bold text-slate-900 mb-1.5">${escapeHTML(e.titulo)}</h4>
                            <p class="text-xs text-slate-500 m-0"><i class="fa-regular fa-clock mr-1 text-emerald-600"></i>${escapeHTML(e.dateStr)} • ${escapeHTML(e.local || 'Online')}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function attachCommunityListeners(container) {
        if (!container) return;

        container.querySelectorAll('.btn-like-post').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const post = state.communityPosts.find(p => p.id === id);
                if (post) {
                    post.likes = (post.likes || 0) + 1;
                    saveData();
                    const span = btn.querySelector('span');
                    if (span) span.textContent = post.likes;
                    btn.classList.remove('evt-btn-icon-secondary');
                    btn.classList.add('evt-btn-icon-primary');
                    showToast('+1 Ponto de reputação concedido ao autor!');
                }
            };
        });

        container.querySelectorAll('.btn-report-post').forEach(btn => {
            btn.onclick = () => {
                showToast('Conteúdo denunciado com sucesso e encaminhado para moderação.');
            };
        });
    }

    function renderSugestoesTab() {
        const container = document.getElementById('panel-sugestoes');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('sugestoes')}

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <!-- Formulário Nova Sugestão -->
                    <div class="lg:col-span-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5">
                        <h3 class="text-sm font-bold text-slate-900 mb-1">Enviar Nova Proposta</h3>
                        <p class="text-xs text-slate-500 mb-4">Sugira novos cursos, eventos ou melhorias para a SBPS.</p>
                        <form id="form-nova-sugestao" class="space-y-3.5">
                            <div class="evt-form-group">
                                <label>Título da Sugestão <span class="text-red-500">*</span></label>
                                <input type="text" id="sug-titulo" class="evt-form-control" placeholder="Ex: Curso de Prática Recursal no CRPS" required>
                            </div>
                            <div class="evt-form-group">
                                <label>Categoria / Tema <span class="text-red-500">*</span></label>
                                <select id="sug-tema" class="evt-form-control" required>
                                    <option value="">Selecione...</option>
                                    <option value="Cursos & Capacitação">Cursos & Capacitação</option>
                                    <option value="Eventos">Eventos & Congressos</option>
                                    <option value="Área de Eventos">Área de Eventos</option>
                                    <option value="Área do Associado">Área do Associado</option>
                                    <option value="Financeiro">Financeiro</option>
                                    <option value="Geral">Geral</option>
                                </select>
                            </div>
                            <div class="evt-form-group">
                                <label>Descrição Detalhada <span class="text-red-500">*</span></label>
                                <textarea id="sug-descricao" class="evt-form-control" rows="4" placeholder="Explique como essa sugestão pode contribuir com os participantes..." required></textarea>
                            </div>
                            <button type="submit" class="evt-btn-primary">
                                <i class="fa-solid fa-paper-plane"></i> Enviar Sugestão
                            </button>
                        </form>
                    </div>

                    <!-- Mural de Votação de Sugestões -->
                    <div class="lg:col-span-7 space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-bold text-slate-900 m-0">Sugestões em Votação na Comunidade</h3>
                            <span class="text-xs text-slate-400">${state.suggestions.length} propostas</span>
                        </div>
                        <div class="space-y-3" id="sugestoes-list-container">
                            ${state.suggestions.map(s => `
                                <div class="bg-white rounded-2xl p-5 border border-slate-200 custom-shadow">
                                    <div class="flex items-center justify-between gap-2 mb-2">
                                        <span class="evt-badge-tag">${escapeHTML(s.categoria || 'Geral')}</span>
                                        <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600">${escapeHTML(s.status || 'Em Análise')}</span>
                                    </div>
                                    <h4 class="text-sm font-bold text-slate-900 mb-1">${escapeHTML(s.titulo)}</h4>
                                    <p class="text-xs text-slate-500 mb-3 leading-relaxed">${escapeHTML(s.descricao)}</p>
                                    <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                                        <span>Por: <strong class="text-slate-700">${escapeHTML(s.is_anonimo ? 'Anônimo' : (s.nome || 'Participante'))}</strong></span>
                                        <button type="button" onclick="window.voteSuggestion('${s.id}')" class="evt-btn-icon-secondary">
                                            <i class="fa-regular fa-thumbs-up text-emerald-600"></i> Apoiar (${s.votos_favor || 0})
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const formSugestao = document.getElementById('form-nova-sugestao');
        if (formSugestao) {
            formSugestao.addEventListener('submit', handleNovaSugestao);
        }
    }

    window.voteSuggestion = function (sugId) {
        const sug = state.suggestions.find(s => s.id === sugId);
        if (!sug) return;
        sug.votos_favor = (sug.votos_favor || 0) + 1;
        saveData();
        renderSugestoesTab();
        showToast('Voto registrado na sugestão!');
    };

    function renderAjudaTab() {
        const container = document.getElementById('panel-ajuda');
        if (!container) return;
        container.innerHTML = `
            <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 custom-shadow mb-6">
                ${renderStandardTabHeader('ajuda')}

                <!-- Seção de FAQ -->
                <div class="mb-8">
                    <div class="evt-section-heading">
                        <h3>Dúvidas Frequentes (FAQ)</h3>
                    </div>
                    <div class="space-y-2.5">
                        <details class="bg-slate-50/80 border border-slate-200/90 px-4 py-3.5 rounded-xl cursor-pointer group">
                            <summary class="text-xs sm:text-sm font-semibold text-slate-800">Como me inscrever em um evento ou curso?</summary>
                            <p class="mt-2 text-xs text-slate-500 leading-relaxed mb-0">Acesse a aba "2. Eventos Disponíveis", escolha a capacitação desejada e clique em "Inscrever-se". Eventos gratuitos têm confirmação instantânea e eventos pagos liberam o checkout via PIX ou Cartão.</p>
                        </details>
                        <details class="bg-slate-50/80 border border-slate-200/90 px-4 py-3.5 rounded-xl cursor-pointer group">
                            <summary class="text-xs sm:text-sm font-semibold text-slate-800">Como emitir meu certificado de participação?</summary>
                            <p class="mt-2 text-xs text-slate-500 leading-relaxed mb-0">Vá até a aba "4. Participações & Certificados", localize o evento concluído e clique em "Certificado" para acessar o formulário oficial de emissão.</p>
                        </details>
                        <details class="bg-slate-50/80 border border-slate-200/90 px-4 py-3.5 rounded-xl cursor-pointer group">
                            <summary class="text-xs sm:text-sm font-semibold text-slate-800">Sou Palestrante, como funciona o limite de publicações?</summary>
                            <p class="mt-2 text-xs text-slate-500 leading-relaxed mb-0">O Plano Base inclui até 5 publicações mensais de eventos ou cursos. Caso necessite de publicações extras, você pode adquirir cotas avulsas ou fazer upgrade do seu pacote na aba "2. Criar Evento".</p>
                        </details>
                    </div>
                </div>

                <!-- Formulário de Suporte Técnico -->
                <div class="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-8">
                    <div class="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 m-0">Abrir Chamado com Suporte Técnico</h3>
                            <p class="text-xs text-slate-500 mt-0.5 m-0">Limite máximo: até 3 chamados ativos simultâneos por usuário.</p>
                        </div>
                        <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Atendimento Prioritário</span>
                    </div>
                    <form id="form-suporte-tecnico" onsubmit="event.preventDefault(); showToast('Chamado de suporte enviado com sucesso!'); this.reset();">
                        <div class="evt-grid-2">
                            <div class="evt-form-group">
                                <label>Assunto do Chamado <span class="text-red-500">*</span></label>
                                <input type="text" class="evt-form-control" placeholder="Resumo da solicitação..." required>
                            </div>
                            <div class="evt-form-group">
                                <label>Categoria do Atendimento <span class="text-red-500">*</span></label>
                                <select class="evt-form-control" required>
                                    <option value="Suporte Técnico">Suporte Técnico</option>
                                    <option value="Inscrições & Certificados">Inscrições & Certificados</option>
                                    <option value="Financeiro">Financeiro / Pagamentos</option>
                                    <option value="Relato de Bug">Relato de Erro</option>
                                </select>
                            </div>
                            <div class="evt-form-group evt-full-width">
                                <label>Descrição Detalhada <span class="text-red-500">*</span></label>
                                <textarea class="evt-form-control" rows="3" placeholder="Descreva sua dúvida ou solicitação com detalhes..." required></textarea>
                            </div>
                            <div class="evt-form-group evt-full-width">
                                <label>E-mail ou WhatsApp para Retorno <span class="text-red-500">*</span></label>
                                <input type="text" class="evt-form-control" placeholder="Ex: (81) 99999-9999 ou email@exemplo.com" required>
                            </div>
                        </div>
                        <div class="mt-4 flex justify-end">
                            <button type="submit" class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer">
                                <i class="fa-solid fa-paper-plane"></i> Enviar Chamado de Suporte
                            </button>
                        </div>
                    </form>

                    <div class="mt-6 pt-5 border-t border-slate-200/80">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Meus Chamados em Aberto</h4>
                        <div class="bg-white border border-dashed border-slate-200 p-4 text-center rounded-xl text-xs text-slate-500">
                            Você não possui chamados pendentes no momento.
                        </div>
                    </div>
                </div>

                <!-- Políticas -->
                <div>
                    <div class="evt-section-heading">
                        <h3>Políticas e Termos da Plataforma</h3>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <a href="javascript:void(0)" onclick="showToast('Abrindo Política de Privacidade')" class="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-white hover:bg-emerald-50/40 transition-colors flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-emerald-700">
                            <span>Política de Privacidade</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-slate-400"></i>
                        </a>
                        <a href="javascript:void(0)" onclick="showToast('Abrindo Política de Inscrição em Eventos')" class="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-white hover:bg-emerald-50/40 transition-colors flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-emerald-700">
                            <span>Política de Inscrição</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-slate-400"></i>
                        </a>
                        <a href="javascript:void(0)" onclick="showToast('Abrindo Política de Cancelamento e Reembolso')" class="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-white hover:bg-emerald-50/40 transition-colors flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-emerald-700">
                            <span>Cancelamento e Reembolso</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-slate-400"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    async function handleNovaSugestao(e) {
        e.preventDefault();

        const titulo = document.getElementById('sug-titulo').value;
        const tema = document.getElementById('sug-tema').value;
        const sugestao = document.getElementById('sug-descricao').value;
        const email = state.currentUser ? state.currentUser.email : 'anonimo@sbps.org.br';
        const nome = state.currentUser ? state.currentUser.nome : 'Participante SBPS';

        state.suggestions.unshift({
            id: 'sug-' + Date.now(),
            nome,
            is_anonimo: false,
            categoria: tema,
            titulo,
            descricao: sugestao,
            status: 'Em Análise',
            votos_favor: 1,
            votos_contra: 0
        });
        saveData();

        const payload = { tema, titulo, sugestao, email };

        try {
            await fetch('https://n8n.motaadv.net/webhook/sugestoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn('Webhook de sugestão offline, salvo localmente:', error);
        }

        showToast('Sugestão enviada e publicada com sucesso!');
        renderSugestoesTab();
    }

    async function handleCriarEvento(e) {
        e.preventDefault();

        const email = state.currentUser ? state.currentUser.email : 'palestrante@sbps.org.br';
        let quota = { pode_publicar: true };
        if (window.SBPS_Supabase && typeof window.SBPS_Supabase.getPalestranteQuota === 'function') {
            quota = await window.SBPS_Supabase.getPalestranteQuota(email);
        }

        if (quota && !quota.pode_publicar) {
            window.abrirModalPagamentoPalestrante();
            showToast('Limite de 5 publicações atingido. Escolha uma opção para continuar publicando.');
            return;
        }

        const titulo = document.getElementById('create-evt-titulo').value;
        const carga = document.getElementById('create-evt-carga').value;
        const dataStr = document.getElementById('create-evt-data').value;
        const palavra = document.getElementById('create-evt-palavra').value;
        const local = document.getElementById('create-evt-local').value;
        const taxas = document.getElementById('create-evt-taxas').value;
        const resumo = document.getElementById('create-evt-resumo') ? document.getElementById('create-evt-resumo').value : '';
        const programacao = document.getElementById('create-evt-programacao') ? document.getElementById('create-evt-programacao').value : '';
        const imgPos = document.getElementById('create-evt-imgpos') ? document.getElementById('create-evt-imgpos').value : 'center';

        let dataFormatada = dataStr;
        if (dataStr && dataStr.includes('-')) {
            const partes = dataStr.split('-');
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        document.getElementById('resumo-evt-titulo').textContent = titulo;
        document.getElementById('resumo-evt-carga').textContent = carga;
        document.getElementById('resumo-evt-data').textContent = dataFormatada;
        document.getElementById('resumo-evt-palavra').textContent = palavra;
        document.getElementById('resumo-evt-local').textContent = local;
        document.getElementById('resumo-evt-taxas').textContent = taxas;

        document.getElementById('evt-modal-confirmar-evento').style.display = 'flex';

        const btnConfirmar = document.getElementById('btn-confirmar-publicacao');
        btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));

        document.getElementById('btn-confirmar-publicacao').addEventListener('click', async function () {
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
                try {
                    await fetch('https://n8n.motaadv.net/webhook/cria-evento', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (_) {}

                const novo = {
                    id: 'evt-' + Date.now(),
                    titulo,
                    dateStr: dataFormatada,
                    cargaHoraria: carga + 'h',
                    palestrante: state.currentUser ? state.currentUser.nome : 'Palestrante',
                    palestrante_email: state.currentUser ? state.currentUser.email : '',
                    status: 'Ativo',
                    tipo: 'curso presencial',
                    resumo: resumo || 'Novo evento publicado e sincronizado.',
                    programacao: programacao || 'Programação oficial SBPS.',
                    local: local,
                    valor: taxas === '0' || taxas === '0.00' ? 'Gratuito' : 'R$ ' + taxas,
                    imgPos: imgPos
                };
                state.events.push(novo);
                saveData();

                if (window.SBPS_Supabase && typeof window.SBPS_Supabase.incrementPalestranteQuotaUsage === 'function') {
                    await window.SBPS_Supabase.incrementPalestranteQuotaUsage(email);
                }

                showToast('Evento publicado com sucesso! (Cota atualizada)');

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

        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'evt-chat-msg sent';
        userMsgDiv.textContent = userQuestion;
        box.appendChild(userMsgDiv);
        box.scrollTop = box.scrollHeight;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'evt-chat-msg received';
        loadingDiv.id = 'ai-loading-indicator';
        loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Digitando resposta...';
        box.appendChild(loadingDiv);
        box.scrollTop = box.scrollHeight;

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
            const response = await fetch('https://n8n.motaadv.net/webhook/mensagem-de-entrada', {
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
            errorDiv.innerHTML = 'Recebi sua dúvida! Caso precise de atendimento imediato, você também pode abrir um chamado na aba <strong>7. Outros & Ajuda</strong>.';
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

        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
        escaped = escaped.replace(/\n/g, '<br>');

        return escaped;
    }

    /* ==========================================================================
       SISTEMA DE PAGAMENTO E GESTÃO DE COTAS (PARTICIPANTE E PALESTRANTE)
       ========================================================================== */

    function generatePixString(valor, descricao, txid) {
        const num = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
        const vStr = num.toFixed(2);
        return `00020126580014BR.GOV.BCB.PIX0136contato@sbps.org.br520400005303986540${vStr.length < 10 ? '0' + vStr.length : vStr.length}${vStr}5802BR5925SBPS PREVIDENCIA SOCIAL6006RECIFE62190515${txid || 'SBPS' + Date.now().toString().slice(-8)}6304`;
    }

    function handleEnrollmentClick(evtId) {
        const evt = state.events.find(e => e.id === evtId);
        if (!evt) return;

        if (state.enrollments.includes(evtId)) {
            showToast('Você já está inscrito neste evento.');
            return;
        }

        const price = parseEventPrice(evt.valor || evt.taxas);
        if (price <= 0) {
            state.enrollments.push(evtId);
            saveData();
            showToast('Inscrição gratuita confirmada com sucesso!');
            renderTabContent(state.currentTab || 'dashboard');
        } else {
            window.abrirModalPagamentoInscricao(evtId);
        }
    }

    window.abrirModalPagamentoInscricao = function (evtId) {
        const evt = state.events.find(e => e.id === evtId);
        if (!evt) return;

        state.pendingInscricao = evt;
        const modal = document.getElementById('modal-pagamento-inscricao');
        if (!modal) return;

        const body = document.getElementById('modal-inscricao-body');
        const success = document.getElementById('modal-inscricao-success');
        const footer = document.getElementById('modal-inscricao-footer');
        if (body) body.style.display = 'block';
        if (success) success.style.display = 'none';
        if (footer) footer.style.display = 'flex';

        const elTitulo = document.getElementById('pay-insc-titulo');
        const elPalestrante = document.getElementById('pay-insc-palestrante');
        const elData = document.getElementById('pay-insc-data');
        const elTipo = document.getElementById('pay-insc-tipo');
        const elValor = document.getElementById('pay-insc-valor');

        if (elTitulo) elTitulo.textContent = evt.titulo;
        if (elPalestrante) elPalestrante.innerHTML = `<i class="fa-solid fa-user-tie"></i> Palestrante: <strong>${escapeHTML(evt.palestrante || 'SBPS')}</strong>`;
        if (elData) elData.innerHTML = `<i class="fa-regular fa-calendar"></i> Data: ${escapeHTML(evt.dateStr || 'Em breve')}`;
        if (elTipo) elTipo.textContent = (evt.tipo || 'Evento').toUpperCase();

        const numPrice = parseEventPrice(evt.valor || evt.taxas);
        const formattedPrice = `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
        if (elValor) elValor.textContent = formattedPrice;

        const pixPayload = generatePixString(numPrice, evt.titulo, 'INSC' + Date.now().toString().slice(-6));
        const qrImg = document.getElementById('pay-insc-qr-img');
        const pixInput = document.getElementById('pay-insc-pix-copia');
        if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixPayload)}`;
        if (pixInput) pixInput.value = pixPayload;

        window.switchInscricaoPaymentMethod('pix');

        modal.style.display = 'flex';
    };

    window.fecharModalPagamentoInscricao = function () {
        const modal = document.getElementById('modal-pagamento-inscricao');
        if (modal) modal.style.display = 'none';
        state.pendingInscricao = null;
    };

    window.switchInscricaoPaymentMethod = function (method) {
        const btnPix = document.getElementById('tab-btn-pay-pix');
        const btnCard = document.getElementById('tab-btn-pay-card');
        const contentPix = document.getElementById('pay-insc-method-pix');
        const contentCard = document.getElementById('pay-insc-method-card');
        const btnProcessarCard = document.getElementById('btn-processar-card-inscricao');

        if (method === 'pix') {
            if (btnPix) btnPix.classList.add('active');
            if (btnCard) btnCard.classList.remove('active');
            if (contentPix) contentPix.style.display = 'block';
            if (contentCard) contentCard.style.display = 'none';
            if (btnProcessarCard) btnProcessarCard.style.display = 'none';
        } else {
            if (btnCard) btnCard.classList.add('active');
            if (btnPix) btnPix.classList.remove('active');
            if (contentPix) contentPix.style.display = 'none';
            if (contentCard) contentCard.style.display = 'block';
            if (btnProcessarCard) btnProcessarCard.style.display = 'inline-flex';
        }
    };

    window.copiarCodigoPixInscricao = function () {
        const input = document.getElementById('pay-insc-pix-copia');
        if (!input) return;
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('Código Pix copiado para a área de transferência!');
        }).catch(() => {
            input.select();
            document.execCommand('copy');
            showToast('Código Pix copiado!');
        });
    };

    window.simularAprovacaoPagamentoInscricao = async function () {
        const evt = state.pendingInscricao;
        if (!evt) return;

        const btnSimular = document.getElementById('btn-simular-pay-inscricao');
        const origText = btnSimular ? btnSimular.innerHTML : '';
        if (btnSimular) {
            btnSimular.disabled = true;
            btnSimular.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando aprovação...';
        }

        try {
            const numPrice = parseEventPrice(evt.valor || evt.taxas);
            const userEmail = state.currentUser ? state.currentUser.email : 'participante@sbps.org.br';
            const userName = state.currentUser ? state.currentUser.nome : 'Participante SBPS';

            let receipt = null;
            if (window.SBPS_Supabase && typeof window.SBPS_Supabase.payEventEnrollment === 'function') {
                receipt = await window.SBPS_Supabase.payEventEnrollment(userEmail, userName, evt.id, evt.titulo, numPrice, 'SIMULADO');
            } else {
                receipt = {
                    payment_id: 'pay_sim_' + Date.now(),
                    valor: numPrice
                };
            }

            if (!state.enrollments.includes(evt.id)) {
                state.enrollments.push(evt.id);
                saveData();
            }

            const detailsContainer = document.getElementById('pay-insc-receipt-details');
            if (detailsContainer) {
                detailsContainer.innerHTML = `
                    <div class="evt-receipt-row"><span>ID do Pagamento:</span> <strong>${receipt.payment_id || 'PAY-CONFIRMED'}</strong></div>
                    <div class="evt-receipt-row"><span>Evento / Curso:</span> <strong>${escapeHTML(evt.titulo)}</strong></div>
                    <div class="evt-receipt-row"><span>Participante:</span> <strong>${escapeHTML(userName)}</strong></div>
                    <div class="evt-receipt-row"><span>Método:</span> <strong>PIX Instantâneo</strong></div>
                    <div class="evt-receipt-row"><span>Status:</span> <strong style="color:#059669;"><i class="fa-solid fa-circle-check"></i> CONFIRMADO</strong></div>
                    <div class="evt-receipt-row"><span>Valor Pago:</span> <strong>R$ ${numPrice.toFixed(2).replace('.', ',')}</strong></div>
                `;
            }

            const body = document.getElementById('modal-inscricao-body');
            const success = document.getElementById('modal-inscricao-success');
            const footer = document.getElementById('modal-inscricao-footer');
            if (body) body.style.display = 'none';
            if (success) success.style.display = 'block';
            if (footer) footer.style.display = 'none';

            showToast('Pagamento aprovado e inscrição confirmada!');
        } catch (err) {
            console.error('Erro ao aprovar pagamento:', err);
            showToast('Erro ao processar pagamento simulado.');
        } finally {
            if (btnSimular) {
                btnSimular.disabled = false;
                btnSimular.innerHTML = origText;
            }
        }
    };

    window.processarCartaoInscricao = function () {
        const num = (document.getElementById('pay-card-num') || {}).value || '';
        const nome = (document.getElementById('pay-card-nome') || {}).value || '';
        if (!num || !nome) {
            alert('Por favor, preencha os dados do cartão de crédito para prosseguir.');
            return;
        }
        window.simularAprovacaoPagamentoInscricao();
    };

    window.concluirInscricaoSucesso = function () {
        window.fecharModalPagamentoInscricao();
        switchTab('inscricoes', true);
    };

    let selectedPalestranteOption = 'avulso';
    let selectedPackage = { plan: 'Pacote 10', valor: 90.00, limite: 10 };

    window.abrirModalPagamentoPalestrante = async function () {
        const modal = document.getElementById('modal-pagamento-palestrante');
        if (!modal) return;

        const body = document.getElementById('modal-palestrante-body');
        const success = document.getElementById('modal-palestrante-success');
        const footer = document.getElementById('modal-palestrante-footer');
        if (body) body.style.display = 'block';
        if (success) success.style.display = 'none';
        if (footer) footer.style.display = 'flex';

        const email = state.currentUser ? state.currentUser.email : 'palestrante@sbps.org.br';
        let quota = { plano_tipo: 'Base', plano_limite: 5, publicacoes_count: 0, publicacoes_extras: 0, limite_total: 5, disponiveis: 5 };
        if (window.SBPS_Supabase && typeof window.SBPS_Supabase.getPalestranteQuota === 'function') {
            quota = await window.SBPS_Supabase.getPalestranteQuota(email);
        }

        const elPlano = document.getElementById('quota-banner-plano');
        const elResumo = document.getElementById('quota-banner-resumo');
        const elDisp = document.getElementById('quota-disponiveis-num');

        if (elPlano) elPlano.textContent = quota.plano_tipo ? `Plano ${quota.plano_tipo}` : 'Plano Base';
        if (elResumo) {
            if (quota.plano_tipo === 'Ilimitado') {
                elResumo.textContent = `Você possui publicações ilimitadas ativas (${quota.publicacoes_count} publicadas).`;
            } else {
                elResumo.textContent = `Você utilizou ${quota.publicacoes_count} de ${quota.limite_total} publicações este mês.`;
            }
        }
        if (elDisp) {
            elDisp.textContent = quota.plano_tipo === 'Ilimitado' ? '∞' : quota.disponiveis;
        }

        window.selecionarOpcaoPalestrante('avulso');
        window.switchPalestrantePaymentMethod('pix');

        modal.style.display = 'flex';
    };

    window.fecharModalPagamentoPalestrante = function () {
        const modal = document.getElementById('modal-pagamento-palestrante');
        if (modal) modal.style.display = 'none';
    };

    window.selecionarOpcaoPalestrante = function (tipo) {
        selectedPalestranteOption = tipo;
        const cardAvulso = document.getElementById('card-choice-avulso');
        const cardUpgrade = document.getElementById('card-choice-upgrade');
        const sectionPackages = document.getElementById('section-packages-grid');
        const itemTitle = document.getElementById('palestrante-selected-item-title');
        const itemPrice = document.getElementById('palestrante-selected-item-price');

        if (tipo === 'avulso') {
            if (cardAvulso) cardAvulso.classList.add('active');
            if (cardUpgrade) cardUpgrade.classList.remove('active');
            if (sectionPackages) sectionPackages.style.display = 'none';
            if (itemTitle) itemTitle.textContent = 'Publicação Avulsa (+1 cota para evento ou curso)';
            if (itemPrice) itemPrice.textContent = 'R$ 10,00';
            atualizarPixPalestrante(10.00, 'Publicação Avulsa SBPS');
        } else {
            if (cardUpgrade) cardUpgrade.classList.add('active');
            if (cardAvulso) cardAvulso.classList.remove('active');
            if (sectionPackages) sectionPackages.style.display = 'block';
            window.escolherPacotePalestrante(selectedPackage.plan, selectedPackage.valor, selectedPackage.limite);
        }
    };

    window.escolherPacotePalestrante = function (plano, valor, limite) {
        selectedPackage = { plan: plano, valor: valor, limite: limite };
        document.querySelectorAll('.evt-pkg-item').forEach(item => {
            if (item.getAttribute('data-plan') === plano) item.classList.add('active');
            else item.classList.remove('active');
        });

        const itemTitle = document.getElementById('palestrante-selected-item-title');
        const itemPrice = document.getElementById('palestrante-selected-item-price');

        const limiteTexto = limite === 999999 ? 'Publicações Ilimitadas' : `${limite} publicações por mês`;
        if (itemTitle) itemTitle.textContent = `Assinatura Mensal: ${plano} (${limiteTexto})`;
        if (itemPrice) itemPrice.textContent = `R$ ${valor.toFixed(2).replace('.', ',')} / mês`;

        atualizarPixPalestrante(valor, `Plano ${plano} SBPS`);
    };

    function atualizarPixPalestrante(valor, descricao) {
        const payload = generatePixString(valor, descricao, 'PAL' + Date.now().toString().slice(-6));
        const qrImg = document.getElementById('pay-pal-qr-img');
        const inputPix = document.getElementById('pay-pal-pix-copia');
        if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(payload)}`;
        if (inputPix) inputPix.value = payload;
    }

    window.switchPalestrantePaymentMethod = function (method) {
        const btnPix = document.getElementById('tab-btn-pal-pix');
        const btnCard = document.getElementById('tab-btn-pal-card');
        const contentPix = document.getElementById('pay-pal-method-pix');
        const contentCard = document.getElementById('pay-pal-method-card');

        if (method === 'pix') {
            if (btnPix) btnPix.classList.add('active');
            if (btnCard) btnCard.classList.remove('active');
            if (contentPix) contentPix.style.display = 'block';
            if (contentCard) contentCard.style.display = 'none';
        } else {
            if (btnCard) btnCard.classList.add('active');
            if (btnPix) btnPix.classList.remove('active');
            if (contentPix) contentPix.style.display = 'none';
            if (contentCard) contentCard.style.display = 'block';
        }
    };

    window.copiarCodigoPixPalestrante = function () {
        const input = document.getElementById('pay-pal-pix-copia');
        if (!input) return;
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('Código Pix copiado para a área de transferência!');
        }).catch(() => {
            input.select();
            document.execCommand('copy');
            showToast('Código Pix copiado!');
        });
    };

    window.simularAprovacaoPagamentoPalestrante = async function () {
        const btnSimular = document.getElementById('btn-simular-pay-palestrante');
        const origText = btnSimular ? btnSimular.innerHTML : '';
        if (btnSimular) {
            btnSimular.disabled = true;
            btnSimular.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aprovando pagamento...';
        }

        try {
            const email = state.currentUser ? state.currentUser.email : 'palestrante@sbps.org.br';
            let res = null;

            if (selectedPalestranteOption === 'avulso') {
                if (window.SBPS_Supabase && typeof window.SBPS_Supabase.buyExtraPublication === 'function') {
                    res = await window.SBPS_Supabase.buyExtraPublication(email, 'SIMULADO');
                } else {
                    res = { success: true, payment_id: 'pay_avulso_' + Date.now() };
                }
            } else {
                if (window.SBPS_Supabase && typeof window.SBPS_Supabase.updatePalestrantePlan === 'function') {
                    res = await window.SBPS_Supabase.updatePalestrantePlan(email, selectedPackage.plan, 'SIMULADO');
                } else {
                    res = { success: true, payment_id: 'pay_plan_' + Date.now() };
                }
            }

            const details = document.getElementById('pay-pal-receipt-details');
            const valorCobrado = selectedPalestranteOption === 'avulso' ? 10.00 : selectedPackage.valor;
            const itemNome = selectedPalestranteOption === 'avulso' ?
                'Publicação Avulsa (+1 cota extra de evento/curso)' :
                `Upgrade Mensal: ${selectedPackage.plan} (${selectedPackage.limite === 999999 ? 'Ilimitado' : selectedPackage.limite + ' publicações/mês'})`;

            if (details) {
                details.innerHTML = `
                    <div class="evt-receipt-row"><span>ID da Transação:</span> <strong>${res.payment_id || 'PAY-CONFIRMED'}</strong></div>
                    <div class="evt-receipt-row"><span>Item Adquirido:</span> <strong>${escapeHTML(itemNome)}</strong></div>
                    <div class="evt-receipt-row"><span>Palestrante:</span> <strong>${escapeHTML(state.currentUser ? state.currentUser.nome : email)}</strong></div>
                    <div class="evt-receipt-row"><span>Status:</span> <strong style="color:#059669;"><i class="fa-solid fa-circle-check"></i> ATIVO / APROVADO</strong></div>
                    <div class="evt-receipt-row"><span>Total Pago:</span> <strong>R$ ${valorCobrado.toFixed(2).replace('.', ',')}</strong></div>
                `;
            }

            const body = document.getElementById('modal-palestrante-body');
            const success = document.getElementById('modal-palestrante-success');
            const footer = document.getElementById('modal-palestrante-footer');
            if (body) body.style.display = 'none';
            if (success) success.style.display = 'block';
            if (footer) footer.style.display = 'none';

            showToast('Pagamento do palestrante aprovado! Sua cota foi atualizada.');
        } catch (err) {
            console.error('Erro na aprovação do palestrante:', err);
            showToast('Erro ao processar simulação de pagamento.');
        } finally {
            if (btnSimular) {
                btnSimular.disabled = false;
                btnSimular.innerHTML = origText;
            }
        }
    };

    window.concluirPagamentoPalestranteSucesso = function () {
        window.fecharModalPagamentoPalestrante();
        if (state.currentTab === 'criar-eventos') {
            atualizarBannerCotaCriarEvento();
        } else {
            renderPalestranteDashboard();
        }
    };

    async function renderPalestranteDashboardQuotaWidget() {
        const widget = document.getElementById('palestrante-dashboard-quota-widget');
        if (!widget || !state.currentUser || state.userRole !== 'palestrante') return;

        let quota = { pode_publicar: true, plano_tipo: 'Base', limite_total: 5, publicacoes_count: 0, disponiveis: 5, plano_valor: 50.00 };
        if (window.SBPS_Supabase && typeof window.SBPS_Supabase.getPalestranteQuota === 'function') {
            quota = await window.SBPS_Supabase.getPalestranteQuota(state.currentUser.email);
        }

        widget.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 custom-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 text-white">Plano ${escapeHTML(quota.plano_tipo || 'Base')}</span>
                        <span class="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Ativo</span>
                    </div>
                    <span class="text-xs font-extrabold text-emerald-600">${quota.plano_tipo === 'Ilimitado' ? '∞' : quota.disponiveis} restantes</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900 mb-1">
                    ${quota.plano_tipo === 'Ilimitado' ? 'Publicações Ilimitadas Ativas' : `${quota.publicacoes_count} de ${quota.limite_total} publicações utilizadas este mês`}
                </h4>
                <p class="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Cota mensal docente para eventos e simpósios. Libere cotas extras ou altere seu pacote.
                </p>
                <button type="button" onclick="window.abrirModalPagamentoPalestrante()" class="w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5">
                    Gerenciar Cota & Planos →
                </button>
            </div>
        `;
    }

    async function atualizarBannerCotaCriarEvento() {
        const container = document.getElementById('quota-criar-evento-banner-container');
        if (!container || !state.currentUser || state.userRole !== 'palestrante') return;

        let quota = { pode_publicar: true, plano_tipo: 'Base', limite_total: 5, publicacoes_count: 0, disponiveis: 5, plano_valor: 50.00 };
        if (window.SBPS_Supabase && typeof window.SBPS_Supabase.getPalestranteQuota === 'function') {
            quota = await window.SBPS_Supabase.getPalestranteQuota(state.currentUser.email);
        }

        if (quota.pode_publicar) {
            container.innerHTML = `
                <div class="evt-quota-status-banner" style="margin:0;">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-900 text-white">Plano ${escapeHTML(quota.plano_tipo || 'Base')}</span>
                            <span class="evt-badge-status-ativo"><i class="fa-solid fa-circle-check"></i> Cota Disponível</span>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 mt-2 mb-0.5">
                            ${quota.plano_tipo === 'Ilimitado' ? 'Publicações Ilimitadas' : `Você utilizou ${quota.publicacoes_count} de ${quota.limite_total} publicações (${quota.disponiveis} restantes)`}
                        </h4>
                        <p class="text-xs text-slate-500 m-0">
                            Mensalidade R$ ${Number(quota.plano_valor || 50).toFixed(2).replace('.', ',')}/mês para até ${quota.plano_tipo === 'Ilimitado' ? 'infinitas' : quota.limite_total} publicações (eventos ou cursos).
                        </p>
                    </div>
                    <button type="button" class="evt-btn-card-secondary" style="flex:0 0 auto; padding:8px 14px;" onclick="window.abrirModalPagamentoPalestrante()">
                        <i class="fa-solid fa-sliders text-emerald-600"></i> Gerenciar Cota
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="evt-quota-alert-box" style="margin:0;">
                    <div class="evt-quota-alert-text">
                        <h4><i class="fa-solid fa-triangle-exclamation"></i> Limite de Publicações Atingido (${quota.publicacoes_count}/${quota.limite_total})</h4>
                        <p>Você atingiu a cota máxima de publicações deste mês. Para publicar mais, adquira uma publicação avulsa por <strong>R$ 10,00</strong> ou aumente seu pacote mensal.</p>
                    </div>
                    <button type="button" class="evt-btn-primary" style="width:auto; margin:0; padding:9px 16px; background:#DC2626;" onclick="window.abrirModalPagamentoPalestrante()">
                        <i class="fa-solid fa-bolt"></i> Liberar Publicação
                    </button>
                </div>
            `;
        }
    }

    window.switchTab = switchTab;

})();
