// COMUNIDADE DETALHES - COMPLETO E FUNCIONAL

class ComunidadeDetalhes {
    constructor() {
        this.comunidadeId = new URLSearchParams(window.location.search).get('id')
                          || sessionStorage.getItem('comunidadeAtual');
        this.comunidade = null;
        this.usuario = null;
        this.init();
    }

    init() {
        console.log('🚀 Carregando comunidade:', this.comunidadeId);
        this.usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

        if (!this.usuario) {
            window.location.href = '/pages/login.html';
            return;
        }

        const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
        this.comunidade = comunidades.find(c => c.id === this.comunidadeId);

        if (!this.comunidade) {
            console.error('❌ Comunidade não encontrada');
            alert('Comunidade não encontrada');
            window.location.href = '/pages/comunidades.html';
            return;
        }

        console.log('✅ Comunidade:', this.comunidade.nome);
        this.renderizar();
    }

    renderizar() {
        // Banner
        const banner = document.querySelector('.comunidade-banner');
        if (banner && this.comunidade.banner) {
            banner.style.backgroundImage = `url('${this.comunidade.banner}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }

        // Nome
        const nome = document.getElementById('com-nome');
        if (nome) nome.textContent = this.comunidade.nome;

        // Tipo
        const tipo = document.getElementById('com-tipo');
        if (tipo) tipo.textContent = this.comunidade.tipo || 'Geral';

        // Descrição
        const desc = document.getElementById('com-descricao');
        if (desc) desc.textContent = this.comunidade.descricao || 'Comunidade';

        // Avatar
        const avatar = document.getElementById('comunidade-avatar');
        if (avatar) avatar.textContent = this.comunidade.nome.charAt(0).toUpperCase();

        // Stats
        const membros = document.getElementById('stat-membros');
        if (membros) membros.textContent = this.comunidade.membros?.length || 0;

        const posts = document.getElementById('stat-posts');
        if (posts) posts.textContent = this.comunidade.posts?.length || 0;

        // Botões
        const botoes = document.getElementById('botoes-container');
        if (botoes) {
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

        // Verificar se é membro
        const isMembro = this.comunidade.membros?.includes(this.usuario.email);

        // Posts
        this.renderPosts(isMembro);

        // Membros
        this.renderMembros();

        // Info
        const infoData = document.getElementById('info-data');
        if (infoData) infoData.textContent = new Date(this.comunidade.dataCriacao).toLocaleDateString('pt-BR');

        const infoTipo = document.getElementById('info-tipo');
        if (infoTipo) infoTipo.textContent = this.comunidade.tipo || 'Geral';

        const infoCriador = document.getElementById('info-criador');
        if (infoCriador) infoCriador.textContent = this.comunidade.criador || '-';
    }

    renderPosts(isMembro) {
        const postsList = document.getElementById('posts-lista');
        if (!postsList) return;

        let html = '';

        // Form de novo post (só se for membro)
        if (isMembro) {
            html += `
                <div class="form-novo-post">
                    <textarea id="novo-post-texto" placeholder="Escreva algo..."></textarea>
                    <button onclick="adicionarPost()" class="btn">📤 Postar</button>
                </div>
            `;
        }

        const posts = this.comunidade.posts || [];
        if (posts.length === 0) {
            html += '<p>Nenhum post ainda</p>';
        } else {
            html += posts.map((post, index) => this.renderPost(post, index)).join('');
        }

        postsList.innerHTML = html;
    }

    renderPost(post, index) {
        const dataPost = new Date(post.data).toLocaleDateString('pt-BR');
        const horaPost = new Date(post.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});

        const curtidas = post.curtidas || [];
        const temCurtida = curtidas.includes(this.usuario.email);
        const numCurtidas = curtidas.length;

        const comentarios = post.comentarios || [];

        return `
            <div class="post-item" id="post-${index}">
                <div class="post-header">
                    <div class="post-autor">
                        <div class="avatar-post">${post.autor.charAt(0).toUpperCase()}</div>
                        <div class="post-info">
                            <strong>${post.autor}</strong>
                            <span class="post-data">${dataPost} ${horaPost}</span>
                        </div>
                    </div>
                </div>

                <div class="post-conteudo">${post.conteudo}</div>

                <div class="post-actions">
                    <button onclick="curtirPost(${index})" class="action-btn ${temCurtida ? 'curtido' : ''}">
                        ${temCurtida ? '❤️' : '🤍'} ${numCurtidas}
                    </button>
                    <button onclick="mostrarComentarios(${index})" class="action-btn">
                        💬 ${comentarios.length}
                    </button>
                </div>

                <div id="comentarios-${index}" class="comentarios" style="display: none;">
                    <div class="lista-comentarios">
                        ${comentarios.map((com, i) => `
                            <div class="comentario">
                                <strong>${com.autor}</strong>: ${com.texto}
                                <small>${new Date(com.data).toLocaleDateString('pt-BR')}</small>
                            </div>
                        `).join('')}
                    </div>

                    <div class="form-comentario">
                        <input type="text" id="com-texto-${index}" placeholder="Comentar...">
                        <button onclick="adicionarComentario(${index})" class="btn-pequeno">Enviar</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMembros() {
        const membrosList = document.getElementById('membros-lista');
        if (!membrosList) return;

        const membros = this.comunidade.membrosInfo || [];
        if (membros.length === 0) {
            membrosList.innerHTML = '<p>Nenhum membro</p>';
        } else {
            membrosList.innerHTML = membros.map(m => `
                <div class="membro-item">${m.nome}</div>
            `).join('');
        }
    }
}

let instance;
document.addEventListener('DOMContentLoaded', () => {
    instance = new ComunidadeDetalhes();
});

// FUNÇÕES GLOBAIS - CORRIGIDAS

function adicionarPost() {
    const textarea = document.getElementById('novo-post-texto');
    if (!textarea || !textarea.value.trim()) {
        alert('Escreva algo antes de postar!');
        return;
    }

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
        instance.renderPosts(true);
        textarea.value = '';
        console.log('✅ Post adicionado');
    }
}

function curtirPost(index) {
    let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
    const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);

    if (idx >= 0 && comunidades[idx].posts && comunidades[idx].posts[index]) {
        const post = comunidades[idx].posts[index];
        if (!post.curtidas) post.curtidas = [];

        const idxCurtida = post.curtidas.indexOf(instance.usuario.email);

        if (idxCurtida >= 0) {
            // Remove curtida
            post.curtidas.splice(idxCurtida, 1);
            console.log('❌ Curtida removida');
        } else {
            // Adiciona curtida (máximo 1 por usuário)
            post.curtidas.push(instance.usuario.email);
            console.log('❤️ Post curtido');
        }

        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
        instance.comunidade.posts = comunidades[idx].posts;

        // Renderiza novamente os posts
        const isMembro = instance.comunidade.membros?.includes(instance.usuario.email);
        instance.renderPosts(isMembro);

        console.log('Posts atualizados. Total curtidas:', post.curtidas.length);
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

        // Renderiza novamente
        const isMembro = instance.comunidade.membros?.includes(instance.usuario.email);
        instance.renderPosts(isMembro);

        // Abre a seção de comentários
        setTimeout(() => {
            document.getElementById(`com-texto-${index}`).value = '';
            mostrarComentarios(index);
        }, 100);
    }
}

function entrarComunidade() {
    if (!instance.comunidade) return;
    let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
    const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);
    if (idx >= 0) {
        if (!comunidades[idx].membros) comunidades[idx].membros = [];
        if (!comunidades[idx].membros.includes(instance.usuario.email)) {
            comunidades[idx].membros.push(instance.usuario.email);
        }
        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
        location.reload();
    }
}

function sairComunidade() {
    if (!confirm('Sair da comunidade?')) return;
    let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
    const idx = comunidades.findIndex(c => c.id === instance.comunidade.id);
    if (idx >= 0) {
        comunidades[idx].membros = comunidades[idx].membros.filter(m => m !== instance.usuario.email);
        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
        location.reload();
    }
}

function editarComunidade() {
    alert('Em desenvolvimento');
}

function deletarComunidade() {
    if (!confirm('Deletar comunidade?')) return;
    let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
    comunidades = comunidades.filter(c => c.id !== instance.comunidade.id);
    localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
    window.location.href = '/pages/comunidades.html';
}
