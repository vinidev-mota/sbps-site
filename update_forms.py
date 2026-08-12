import re

with open('pages/eventos.html', 'r', encoding='utf-8') as f:
    content = f.read()

# form-register-participante
new_participante = '''                    <!-- Form Cadastro Participante -->
                    <form id="form-register-participante" style="display: none;">
                        <h2 class="evt-form-title">Cadastro de Participante</h2>
                        <p class="evt-form-desc">Preencha seus dados para se inscrever nos eventos e cursos SBPS.</p>
                        
                        <div class="evt-notice-box" style="background:#FFFBEB; border-color:#F59E0B; color:#B45309;">
                            <i class="fa-solid fa-triangle-exclamation"></i> O participante cadastrado nesta área terá acesso exclusivo aos eventos, não possuindo acesso à Área de Associados a menos que efetue a associação oficial.
                        </div>

                        <!-- SEÇÃO 1: Informações Pessoais -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">INFORMAÇÕES PESSOAIS</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group evt-full-width">
                                    <label>Nome Completo <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-nome" class="evt-form-control" placeholder="Digite seu nome completo" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>CPF <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-cpf" class="evt-form-control" placeholder="000.000.000-00" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>RG <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-rg" class="evt-form-control" placeholder="00.000.000-0" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Data de Nascimento <span style="color:red;">*</span></label>
                                    <input type="date" id="reg-part-nasc" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Gênero <span style="color:red;">*</span></label>
                                    <select id="reg-part-genero" class="evt-form-control" required>
                                        <option value="">Selecione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Não-binário">Não-binário</option>
                                        <option value="Prefiro não informar">Prefiro não informar</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 2: Informações de Contato -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">INFORMAÇÕES DE CONTATO</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group">
                                    <label>Celular / WhatsApp <span style="color:red;">*</span></label>
                                    <input type="tel" id="reg-part-celular" class="evt-form-control" placeholder="(00) 90000-0000" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Telefone Fixo</label>
                                    <input type="tel" id="reg-part-fixo" class="evt-form-control" placeholder="(00) 0000-0000">
                                </div>
                                <div class="evt-form-group">
                                    <label>E-mail Principal <span style="color:red;">*</span></label>
                                    <input type="email" id="reg-part-email" class="evt-form-control" placeholder="seu.email@exemplo.com" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Confirmação do E-mail <span style="color:red;">*</span></label>
                                    <input type="email" id="reg-part-email-confirm" class="evt-form-control" placeholder="Repita seu e-mail" required>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 3: Endereço Residencial -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">ENDEREÇO RESIDENCIAL</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group">
                                    <label>CEP <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-cep" class="evt-form-control" placeholder="00000-000" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Logradouro <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-rua" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Número <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-numero" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Bairro <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-bairro" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>UF <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-uf" class="evt-form-control" readonly required style="background:#F1F5F9;">
                                </div>
                                <div class="evt-form-group">
                                    <label>Cidade <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-cidade" class="evt-form-control" readonly required style="background:#F1F5F9;">
                                </div>
                                <div class="evt-form-group evt-full-width">
                                    <label>Complemento <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-complemento" class="evt-form-control" required>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 4: Acesso -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">ACESSO</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group evt-full-width">
                                    <label>Login / Usuário <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-part-login-user" class="evt-form-control" placeholder="Ex: seunome" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Senha <span style="color:red;">*</span></label>
                                    <input type="password" id="reg-part-password" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Confirmar Senha <span style="color:red;">*</span></label>
                                    <input type="password" id="reg-part-password-confirm" class="evt-form-control" required>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="evt-btn-primary"><i class="fa-solid fa-user-plus"></i> Concluir Cadastro de Participante</button>
                    </form>'''

# form-register-palestrante
new_palestrante = '''                    <!-- Form Cadastro Palestrante -->
                    <form id="form-register-palestrante" style="display: none;">
                        <h2 class="evt-form-title">Cadastro Completo de Palestrante</h2>
                        <p class="evt-form-desc">Preencha seus dados acadêmicos, profissionais e bancários para ministrar eventos na SBPS.</p>

                        <!-- SEÇÃO 1: Informações Pessoais -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">INFORMAÇÕES PESSOAIS</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group evt-full-width">
                                    <label>Nome Completo <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-nome" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>CPF <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-cpf" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>RG <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-rg" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Data de Nascimento <span style="color:red;">*</span></label>
                                    <input type="date" id="reg-pal-nasc" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Gênero <span style="color:red;">*</span></label>
                                    <select id="reg-pal-genero" class="evt-form-control" required>
                                        <option value="">Selecione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Não-binário">Não-binário</option>
                                        <option value="Prefiro não informar">Prefiro não informar</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 2: Informações de Contato e Endereço -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">CONTATO E ENDEREÇO</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group">
                                    <label>Celular / WhatsApp <span style="color:red;">*</span></label>
                                    <input type="tel" id="reg-pal-celular" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>E-mail Principal <span style="color:red;">*</span></label>
                                    <input type="email" id="reg-pal-email" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>CEP <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-cep" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>UF <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-uf" class="evt-form-control" readonly required style="background:#F1F5F9;">
                                </div>
                                <div class="evt-form-group evt-full-width">
                                    <label>Endereço Completo <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-endereco" class="evt-form-control" required>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 3: Formação e Qualificação -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;"><i class="fa-solid fa-graduation-cap"></i> FORMAÇÃO E QUALIFICAÇÃO</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group">
                                    <label>Nível de Escolaridade <span style="color:red;">*</span></label>
                                    <select id="reg-pal-escolaridade" class="evt-form-control" required>
                                        <option value="">Selecione...</option>
                                        <option value="Graduação">Graduação</option>
                                        <option value="Pós-Graduação">Pós-Graduação</option>
                                        <option value="Mestrado">Mestrado</option>
                                        <option value="Doutorado">Doutorado</option>
                                        <option value="Pós-Doutorado">Pós-Doutorado</option>
                                    </select>
                                </div>
                                <div class="evt-form-group">
                                    <label>Área de Atuação Principal <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-area" class="evt-form-control" placeholder="Ex: Direito Previdenciário RGPS / RPPS" required>
                                </div>
                                <div class="evt-form-group evt-full-width">
                                    <label>Cursos de Formação (com Ano de Início e Conclusão) <span style="color:red;">*</span></label>
                                    <div id="edu-courses-container">
                                        <div class="evt-edu-row">
                                            <input type="text" class="evt-form-control edu-nome" placeholder="Ex: Direito Previdenciário - USP" required>
                                            <input type="number" class="evt-form-control edu-inicio" placeholder="Ano Início" style="width:110px;" required>
                                            <input type="number" class="evt-form-control edu-fim" placeholder="Ano Fim" style="width:110px;" required>
                                        </div>
                                    </div>
                                    <button type="button" id="btn-add-edu-item" class="evt-btn-add-item"><i class="fa-solid fa-plus"></i> Adicionar Mais um Curso</button>
                                </div>
                                <div class="evt-form-group evt-full-width">
                                    <label>Profissão Atual & Anos de Experiência <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-profissao" class="evt-form-control" placeholder="Ex: Advogado e Professor (12 anos de experiência)" required>
                                </div>
                                <div class="evt-form-group evt-full-width">
                                    <label>Experiências Profissionais Relevantes (Opcional)</label>
                                    <textarea id="reg-pal-experiencia" class="evt-form-control" rows="2" placeholder="Descreva brevemente suas principais atuações..."></textarea>
                                </div>
                                <div class="evt-form-group evt-full-width">
                                    <label>Resumo "Sobre Mim" <span style="color:red;">*</span></label>
                                    <textarea id="reg-pal-sobre" class="evt-form-control" rows="3" placeholder="Apresentação curta para os participantes do evento..." required></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 4: Dados Bancários -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;"><i class="fa-solid fa-building-columns"></i> DADOS BANCÁRIOS</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group evt-full-width">
                                    <label>Chave PIX / Dados Bancários (Agência, Conta, Banco) <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-pix" class="evt-form-control" placeholder="Ex: Chave PIX E-mail ou Ag: 0001 C/C: 12345-6 Banco do BB" required>
                                </div>
                            </div>
                        </div>

                        <!-- SEÇÃO 5: Acesso -->
                        <div style="margin-bottom: 28px;">
                            <div style="border-bottom: 2px solid var(--evt-primary); padding-bottom: 6px; margin-bottom: 18px;">
                                <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--evt-primary); text-transform: uppercase; margin: 0;">ACESSO</h3>
                            </div>
                            <div class="evt-grid-2">
                                <div class="evt-form-group evt-full-width">
                                    <label>Login / Usuário <span style="color:red;">*</span></label>
                                    <input type="text" id="reg-pal-login-user" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Senha <span style="color:red;">*</span></label>
                                    <input type="password" id="reg-pal-password" class="evt-form-control" required>
                                </div>
                                <div class="evt-form-group">
                                    <label>Confirmar Senha <span style="color:red;">*</span></label>
                                    <input type="password" id="reg-pal-password-confirm" class="evt-form-control" required>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="evt-btn-primary" style="background:linear-gradient(135deg, #0F3B5F, #8B5CF6);"><i class="fa-solid fa-user-check"></i> Finalizar Cadastro de Palestrante</button>
                    </form>'''

content = re.sub(r'<!-- Form Cadastro Participante -->\s*<form id="form-register-participante".*?</form>', new_participante, content, flags=re.DOTALL)
content = re.sub(r'<!-- Form Cadastro Palestrante -->\s*<form id="form-register-palestrante".*?</form>', new_palestrante, content, flags=re.DOTALL)

with open('pages/eventos.html', 'w', encoding='utf-8') as f:
    f.write(content)
