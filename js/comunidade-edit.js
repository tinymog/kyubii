// Editor de Comunidade - Cuida de toda a edição de comunidades

class ComunidadeEditor {
    constructor(comunidadeInstance) {
        this.instance = comunidadeInstance;
        this.originalData = null; // Guarda os dados originais pra poder cancelar
        this.isEditMode = false;  // Controla se tá em modo de edição ou não
    }

    // Ativa o modo de edição
    ativarModoEdicao() {
        console.log('✏️ Ativando modo de edição...');

        // Se já tá editando, não faz nada
        if (this.isEditMode) {
            console.warn('⚠️ Modo de edição já está ativo');
            return;
        }

        // Salva os dados atuais pra caso o usuário queira cancelar depois
        this.originalData = {
            nome: this.instance.comunidade.nome,
            descricao: this.instance.comunidade.descricao || this.instance.comunidade.biografia || '',
            tipo: this.instance.comunidade.tipo || 'Geral',
            banner: this.instance.comunidade.banner || ''
        };

        this.isEditMode = true;

        // Transforma os textos em campos editáveis
        this.criarInputNome();
        this.criarInputDescricao();
        this.criarInputTipo();
        this.criarInputBanner();
        this.atualizarBotoes();

        console.log('✅ Modo de edição ativado');
    }

    // Cria o input de nome
    criarInputNome() {
        const nomeEl = document.getElementById('com-nome');
        if (!nomeEl) return;

        const valor = nomeEl.textContent;
        nomeEl.innerHTML = `
            <input 
                type="text" 
                id="edit-nome" 
                class="editable-input" 
                value="${this.escapeHtml(valor)}" 
                maxlength="100"
                placeholder="Nome da comunidade"
            >
        `;
    }

    // Cria o input de descrição
    criarInputDescricao() {
        const descEl = document.getElementById('com-descricao');
        if (!descEl) return;

        const valor = descEl.textContent;
        descEl.innerHTML = `
            <textarea 
                id="edit-descricao" 
                class="editable-textarea" 
                maxlength="500"
                placeholder="Descrição da comunidade"
                rows="3"
            >${this.escapeHtml(valor)}</textarea>
        `;
    }

    // Cria o select de tipo
    criarInputTipo() {
        const tipoEl = document.getElementById('com-tipo');
        if (!tipoEl) return;

        const valorAtual = tipoEl.textContent;
        const tipos = ['Geral', 'Gaming', 'Jogos', 'Tecnologia', 'Arte', 'Música', 'Esportes', 'Educação', 'Entretenimento', 'Outro'];

        // Cria as opções do select, marcando a atual como selecionada
        let options = tipos.map(tipo => {
            const selected = tipo === valorAtual ? 'selected' : '';
            return `<option value="${tipo}" ${selected}>${tipo}</option>`;
        }).join('');

        tipoEl.innerHTML = `
            <select id="edit-tipo" class="editable-select">
                ${options}
            </select>
        `;
    }

    // Cria a seção de upload de banner
    criarInputBanner() {
        const bannerEl = document.querySelector('.comunidade-banner');
        if (!bannerEl) return;

        const container = bannerEl.parentElement;
        let uploadSection = document.getElementById('banner-upload-section');

        // Cria a seção de upload se não existir
        if (!uploadSection) {
            uploadSection = document.createElement('div');
            uploadSection.id = 'banner-upload-section';
            uploadSection.className = 'banner-upload-section';
            uploadSection.innerHTML = `
                <label for="edit-banner-input" class="banner-upload-label">
                    📷 Alterar Banner
                    <input 
                        type="file" 
                        id="edit-banner-input" 
                        accept="image/*" 
                        style="display: none;"
                    >
                </label>
                <span id="banner-filename" class="banner-filename"></span>
            `;
            container.insertBefore(uploadSection, bannerEl);
        }

        // Adiciona o evento de quando selecionar um arquivo
        const input = document.getElementById('edit-banner-input');
        if (input) {
            input.addEventListener('change', (e) => this.handleBannerUpload(e));
        }
    }

    // Lida com o upload do banner
    handleBannerUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Verifica se é uma imagem
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida');
            return;
        }

        // Verifica o tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Imagem muito grande! Tamanho máximo: 5MB');
            return;
        }

        // Mostra o nome do arquivo
        const filenameEl = document.getElementById('banner-filename');
        if (filenameEl) {
            filenameEl.textContent = file.name;
        }

        // Converte a imagem pra Base64 pra salvar no localStorage
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            this.originalData.newBanner = base64;

            // Mostra um preview do novo banner
            const bannerEl = document.querySelector('.comunidade-banner');
            if (bannerEl) {
                bannerEl.style.backgroundImage = `url('${base64}')`;
            }

            console.log('✅ Banner carregado:', file.name);
        };
        reader.readAsDataURL(file);
    }

    // Atualiza os botões pra mostrar Salvar e Cancelar
    atualizarBotoes() {
        const botoesContainer = document.getElementById('botoes-container');
        if (!botoesContainer) return;

        botoesContainer.innerHTML = `
            <button onclick="editorInstance.salvarEdicoes()" class="btn btn-salvar">💾 Salvar</button>
            <button onclick="editorInstance.cancelarEdicao()" class="btn btn-cancelar">❌ Cancelar</button>
        `;
    }

    // Cancela a edição e volta tudo ao normal
    cancelarEdicao() {
        if (!confirm('Cancelar edição? As alterações não serão salvas.')) {
            return;
        }

        console.log('❌ Cancelando edição...');
        this.isEditMode = false;

        // Remove a seção de upload
        const uploadSection = document.getElementById('banner-upload-section');
        if (uploadSection) {
            uploadSection.remove();
        }

        // Volta tudo pro estado original
        this.instance.renderizar();
        console.log('✅ Edição cancelada');
    }

    // Valida os dados antes de salvar
    validarDados(dados) {
        const erros = [];

        // Valida o nome
        if (!dados.nome || dados.nome.trim().length === 0) {
            erros.push('Nome é obrigatório');
        } else if (dados.nome.trim().length < 3) {
            erros.push('Nome deve ter pelo menos 3 caracteres');
        } else if (dados.nome.trim().length > 100) {
            erros.push('Nome deve ter no máximo 100 caracteres');
        }

        // Valida a descrição (opcional, mas tem limite)
        if (dados.descricao && dados.descricao.length > 500) {
            erros.push('Descrição deve ter no máximo 500 caracteres');
        }

        // Valida o tipo
        if (!dados.tipo || dados.tipo.trim().length === 0) {
            erros.push('Tipo é obrigatório');
        }

        return erros;
    }

    // Salva as edições no localStorage
    salvarEdicoes() {
        console.log('💾 Salvando edições...');

        // Pega os valores dos campos editados
        const nomeInput = document.getElementById('edit-nome');
        const descricaoInput = document.getElementById('edit-descricao');
        const tipoInput = document.getElementById('edit-tipo');

        if (!nomeInput || !descricaoInput || !tipoInput) {
            alert('Erro ao coletar dados dos campos');
            return;
        }

        // Organiza os dados num objeto
        const dadosNovos = {
            nome: nomeInput.value.trim(),
            descricao: descricaoInput.value.trim(),
            tipo: tipoInput.value.trim(),
            banner: this.originalData.newBanner || this.originalData.banner
        };

        // Valida antes de salvar
        const erros = this.validarDados(dadosNovos);
        if (erros.length > 0) {
            alert('Erros de validação:\n\n' + erros.join('\n'));
            return;
        }

        // Salva no localStorage
        try {
            let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
            const idx = comunidades.findIndex(c => c.id === this.instance.comunidade.id);

            if (idx >= 0) {
                // Atualiza os dados da comunidade
                comunidades[idx].nome = dadosNovos.nome;
                comunidades[idx].descricao = dadosNovos.descricao;
                comunidades[idx].biografia = dadosNovos.descricao; // Mantém os dois pra compatibilidade
                comunidades[idx].tipo = dadosNovos.tipo;

                // Atualiza o banner se tiver um novo
                if (dadosNovos.banner) {
                    comunidades[idx].banner = dadosNovos.banner;
                }

                // Salva tudo de volta no localStorage
                localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));

                console.log('✅ Comunidade atualizada no localStorage');

                // Desativa o modo de edição
                this.isEditMode = false;

                // Remove a seção de upload
                const uploadSection = document.getElementById('banner-upload-section');
                if (uploadSection) {
                    uploadSection.remove();
                }

                // Recarrega os dados e atualiza a tela
                this.instance.recarregarDados();
                this.instance.renderizar();

                alert('✅ Comunidade atualizada com sucesso!');
            } else {
                throw new Error('Comunidade não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            alert('Erro ao salvar alterações: ' + error.message);
        }
    }

    // Escapa caracteres especiais HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Variável global do editor
let editorInstance = null;

// Cria o editor quando for necessário
function inicializarEditor(comunidadeInstance) {
    editorInstance = new ComunidadeEditor(comunidadeInstance);
    console.log('✅ Editor de comunidade inicializado');
}
