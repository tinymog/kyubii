// Página de Detalhes da Comunidade

class ComunidadeDetalhes {
    constructor() {
        // Pega o ID da comunidade da URL ou do sessionStorage
        this.comunidadeId = new URLSearchParams(window.location.search).get('id')
            || sessionStorage.getItem('comunidadeAtual');
        this.comunidade = null;
        this.usuario = null;
        this.criadorNome = null;
        this.init();
    }

    // Inicializa a página

    async init() {
        console.log('🚀 Carregando comunidade:', this.comunidadeId);

        // Verifica se o usuário tá logado
        this.usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
        if (!this.usuario) {
            window.location.href = '/pages/login.html';
            return;
        }

        // Carrega os dados da comunidade
        if (!await this.carregarComunidade()) {
            return;
        }

        // Busca o nome do criador
        await this.carregarCriadorNome();

        // Mostra tudo na tela
        this.renderizar();
    }

    // Carrega os dados da comunidade do localStorage

    async carregarComunidade() {
        try {
            const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
            this.comunidade = comunidades.find(c => c.id === this.comunidadeId);

            if (!this.comunidade) {
                console.error('❌ Comunidade não encontrada');
                alert('Comunidade não encontrada');
                window.location.href = '/pages/comunidades.html';
                return false;
            }

            console.log('✅ Comunidade:', this.comunidade.nome);
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar comunidade:', error);
            alert('Erro ao carregar comunidade');
            window.location.href = '/pages/comunidades.html';
            return false;
        }
    }

    // Busca o nome do criador da comunidade
    async carregarCriadorNome() {
        try {
            // Tenta buscar da API primeiro
            const response = await fetch(`/api/comunidades/${this.comunidadeId}`);

            if (response.ok) {
                const data = await response.json();
                this.criadorNome = data.criador_nome || this.comunidade.criador;
                console.log('✅ Criador da API:', this.criadorNome);
            } else {
                throw new Error('API não disponível');
            }
        } catch (error) {
            // Se a API não tiver disponível, busca do localStorage
            console.warn('⚠️ API indisponível, usando localStorage');

            try {
                const usuarios = JSON.parse(localStorage.getItem('usuarios_dados') || '{}');
                const criador = Object.values(usuarios).find(u => u.email === this.comunidade.criador);
                this.criadorNome = criador?.nome || this.comunidade.criador;
            } catch (e) {
                this.criadorNome = this.comunidade.criador;
            }
        }
    }

    // Renderiza todos os elementos da página
    renderizar() {
        this.renderBanner();
        this.renderHeader();
        this.renderBotoes();
        this.renderPosts();
        this.renderMembros();
        this.renderInfo();
    }

    renderBanner() {
        const banner = document.querySelector('.comunidade-banner');
        if (banner && this.comunidade.banner) {
            banner.style.backgroundImage = `url('${this.comunidade.banner}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }

    renderHeader() {
        // Nome
        const nome = document.getElementById('com-nome');
        if (nome) nome.textContent = this.comunidade.nome;

        // Tipo
        const tipo = document.getElementById('com-tipo');
        if (tipo) tipo.textContent = this.comunidade.tipo || 'Geral';

        // Descrição
        const desc = document.getElementById('com-descricao');
        if (desc) desc.textContent = this.comunidade.descricao || this.comunidade.biografia || 'Comunidade';

        // Avatar
        const avatar = document.getElementById('comunidade-avatar');
        if (avatar) avatar.textContent = this.comunidade.nome.charAt(0).toUpperCase();

        // Stats
        const membros = document.getElementById('stat-membros');
        if (membros) membros.textContent = this.comunidade.membros?.length || 0;

        const posts = document.getElementById('stat-posts');
        if (posts) posts.textContent = this.comunidade.posts?.length || 0;
    }

    renderBotoes() {
        const botoes = document.getElementById('botoes-container');
        if (!botoes) return;

        const isMembro = this.comunidade.membros?.includes(this.usuario.email);
        const isCriador = this.comunidade.criador === this.usuario.email;

        if (isCriador) {
            botoes.innerHTML = `
                <button onclick="editarComunidade()" class="btn">✏️ Editar</button>
                <button onclick="deletarComunidade()" class="btn">🗑️ Deletar</button>
            `;
        } else if (isMembro) {
            botoes.innerHTML = `<button onclick="sairComunidade()" class="btn">🚪 Sair</button>`;
        } else {
            botoes.innerHTML = `<button onclick="entrarComunidade()" class="btn">➕ Entrar</button>`;
        }
    }

    renderPosts() {
        const isMembro = this.comunidade.membros?.includes(this.usuario.email);
        const postsList = document.getElementById('posts-lista');
        if (!postsList) return;

        let html = '';

        // Formulário para criar post (apenas membros)
        if (isMembro) {
            html += this.criarFormularioPost();
        }

        // Listar posts
        const posts = this.comunidade.posts || [];
        if (posts.length === 0) {
            html += '<p style="color: #9d5fd4; padding: 20px;">Nenhum post ainda</p>';
        } else {
            html += posts.map((post, index) => this.criarTemplatePost(post, index)).join('');
        }

        postsList.innerHTML = html;
    }

    criarFormularioPost() {
        return `
            <div class="form-novo-post">
                <textarea id="novo-post-texto" placeholder="Escreva algo..." maxlength="500"></textarea>
                <button onclick="adicionarPost()" class="btn">📤 Postar</button>
            </div>
        `;
    }

    criarTemplatePost(post, index) {
        const dataPost = new Date(post.data).toLocaleDateString('pt-BR');
        const horaPost = new Date(post.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const curtidas = post.curtidas || [];
        const temCurtida = curtidas.includes(this.usuario.email);
        const numCurtidas = curtidas.length;
        const comentarios = post.comentarios || [];

        return `
            <div class="post-item" id="post-${index}">
                <div class="post-header">
                    <div class="post-autor">
                        <div class="avatar-post">${this.escapeHtml(post.autor.charAt(0).toUpperCase())}</div>
                        <div class="post-info">
                            <strong>${this.escapeHtml(post.autor)}</strong>
                            <span class="post-data">${dataPost} ${horaPost}</span>
                        </div>
                    </div>
                </div>
                <div class="post-conteudo">${this.escapeHtml(post.conteudo)}</div>
                <div class="post-actions">
                    <button onclick="curtirPost(${index})" class="action-btn ${temCurtida ? 'curtido' : ''}">
                        ${temCurtida ? '❤️' : '🤍'} ${numCurtidas}
                    </button>
                    <button onclick="mostrarComentarios(${index})" class="action-btn">
                        💬 ${comentarios.length}
                    </button>
                </div>
                <div id="comentarios-${index}" class="comentarios" style="display: none;">
                    ${this.criarTemplateComentarios(comentarios, index)}
                </div>
            </div>
        `;
    }

    criarTemplateComentarios(comentarios, postIndex) {
        let html = '<div class="lista-comentarios">';

        if (comentarios.length > 0) {
            html += comentarios.map(com => `
                <div class="comentario">
                    <strong>${this.escapeHtml(com.autor)}</strong>: ${this.escapeHtml(com.texto)}
                    <small>${new Date(com.data).toLocaleDateString('pt-BR')}</small>
                </div>
            `).join('');
        }

        html += '</div>';
        html += `
            <div class="form-comentario">
                <input type="text" id="com-texto-${postIndex}" placeholder="Comentar..." maxlength="200">
                <button onclick="adicionarComentario(${postIndex})" class="btn-pequeno">Enviar</button>
            </div>
        `;

        return html;
    }

    renderMembros() {
        const membrosList = document.getElementById('membros-lista');
        if (!membrosList) return;

        // Recarregar dados frescos do localStorage
        const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
        const comunidadeAtualizada = comunidades.find(c => c.id === this.comunidadeId);

        if (!comunidadeAtualizada) {
            membrosList.innerHTML = '<p style="color: #9d5fd4;">Nenhum membro</p>';
            return;
        }

        const membros = comunidadeAtualizada.membrosInfo || [];

        if (membros.length === 0) {
            membrosList.innerHTML = '<p style="color: #9d5fd4;">Nenhum membro</p>';
        } else {
            membrosList.innerHTML = membros.map(m => `
                <div class="membro-item">${this.escapeHtml(m.nome)}</div>
            `).join('');
        }

        console.log('👥 Membros atualizados:', membros.length);
    }

    renderInfo() {
        // Data de criação
        const infoData = document.getElementById('info-data');
        if (infoData && this.comunidade.dataCriacao) {
            infoData.textContent = new Date(this.comunidade.dataCriacao).toLocaleDateString('pt-BR');
        }

        // Tipo
        const infoTipo = document.getElementById('info-tipo');
        if (infoTipo) {
            infoTipo.textContent = this.comunidade.tipo || 'Geral';
        }

        // Criador
        const infoCriador = document.getElementById('info-criador');
        if (infoCriador) {
            infoCriador.textContent = this.criadorNome || this.comunidade.criador;
            infoCriador.style.color = '#c699ff';
            infoCriador.style.fontWeight = '600';
        }
    }

    // Escapa caracteres especiais HTML

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    recarregarDados() {
        const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
        this.comunidade = comunidades.find(c => c.id === this.comunidadeId);
    }
}

// Variável global da instância
let instance;

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    instance = new ComunidadeDetalhes();
});

// Funções globais para gerenciar posts

function adicionarPost() {
    const textarea = document.getElementById('novo-post-texto');

    if (!textarea || !textarea.value.trim()) {
        alert('Escreva algo antes de postar!');
        return;
    }

    if (textarea.value.trim().length > 500) {
        alert('Post muito longo! Máximo 500 caracteres.');
        return;
    }

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);

        if (idx >= 0) {
            if (!comunidades[idx].posts) comunidades[idx].posts = [];

            comunidades[idx].posts.push({
                autor: instance.usuario.nome,
                email: instance.usuario.email,
                conteudo: textarea.value.trim(),
                data: new Date().toISOString(),
                curtidas: [],
                comentarios: []
            });

            localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
            instance.comunidade.posts = comunidades[idx].posts;
            instance.renderPosts();
            textarea.value = '';
            console.log('✅ Post adicionado');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar post:', error);
        alert('Erro ao adicionar post');
    }
}

function curtirPost(index) {
    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);

        if (idx >= 0 && comunidades[idx].posts && comunidades[idx].posts[index]) {
            const post = comunidades[idx].posts[index];
            if (!post.curtidas) post.curtidas = [];

            const idxCurtida = post.curtidas.indexOf(instance.usuario.email);

            if (idxCurtida >= 0) {
                post.curtidas.splice(idxCurtida, 1);
                console.log('❌ Curtida removida');
            } else {
                post.curtidas.push(instance.usuario.email);
                console.log('❤️ Post curtido');
            }

            localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
            instance.comunidade.posts = comunidades[idx].posts;
            instance.renderPosts();
        }
    } catch (error) {
        console.error('❌ Erro ao curtir post:', error);
    }
}

function mostrarComentarios(index) {
    const comentariosDiv = document.getElementById(`comentarios-${index}`);
    if (comentariosDiv) {
        comentariosDiv.style.display = comentariosDiv.style.display === 'none' ? 'block' : 'none';
    }
}

function adicionarComentario(index) {
    const input = document.getElementById(`com-texto-${index}`);

    if (!input || !input.value.trim()) {
        alert('Escreva algo antes de comentar!');
        return;
    }

    if (input.value.trim().length > 200) {
        alert('Comentário muito longo! Máximo 200 caracteres.');
        return;
    }

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);

        if (idx >= 0 && comunidades[idx].posts && comunidades[idx].posts[index]) {
            const post = comunidades[idx].posts[index];
            if (!post.comentarios) post.comentarios = [];

            post.comentarios.push({
                autor: instance.usuario.nome,
                email: instance.usuario.email,
                texto: input.value.trim(),
                data: new Date().toISOString()
            });

            console.log('💬 Comentário adicionado. Total:', post.comentarios.length);
            localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
            instance.comunidade.posts = comunidades[idx].posts;
            instance.renderPosts();

            // Reabrir comentários após adicionar
            setTimeout(() => {
                mostrarComentarios(index);
            }, 100);
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar comentário:', error);
        alert('Erro ao adicionar comentário');
    }
}

// Funções globais para ações da comunidade

function entrarComunidade() {
    if (!instance.comunidade) return;

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);

        if (idx >= 0) {
            if (!comunidades[idx].membros) comunidades[idx].membros = [];

            if (!comunidades[idx].membros.includes(instance.usuario.email)) {
                comunidades[idx].membros.push(instance.usuario.email);
            }

            if (!comunidades[idx].membrosInfo) comunidades[idx].membrosInfo = [];
            comunidades[idx].membrosInfo.push({
                email: instance.usuario.email,
                nome: instance.usuario.nome,
                role: 'membro',
                dataEntrada: new Date().toISOString()
            });

            localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
            location.reload();
        }
    } catch (error) {
        console.error('❌ Erro ao entrar na comunidade:', error);
        alert('Erro ao entrar na comunidade');
    }
}

function sairComunidade() {
    if (!confirm('Sair da comunidade?')) return;

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);

        if (idx >= 0) {
            comunidades[idx].membros = comunidades[idx].membros.filter(m => m !== instance.usuario.email);

            if (comunidades[idx].membrosInfo) {
                comunidades[idx].membrosInfo = comunidades[idx].membrosInfo.filter(m => m.email !== instance.usuario.email);
            }

            localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
            window.location.href = '/pages/comunidades.html';
        }
    } catch (error) {
        console.error('❌ Erro ao sair da comunidade:', error);
        alert('Erro ao sair da comunidade');
    }
}

function editarComunidade() {
    if (!editorInstance) {
        inicializarEditor(instance);
    }
    editorInstance.ativarModoEdicao();
}

function deletarComunidade() {
    if (!confirm('Deletar comunidade? Esta ação não pode ser desfeita!')) return;

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        comunidades = comunidades.filter(c => c.id !== instance.comunidade.id);
        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
        window.location.href = '/pages/comunidades.html';
    } catch (error) {
        console.error('❌ Erro ao deletar comunidade:', error);
        alert('Erro ao deletar comunidade');
    }
}
