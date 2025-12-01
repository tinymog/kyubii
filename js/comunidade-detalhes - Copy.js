// COMUNIDADE-DETALHES.JS - TOTALMENTE FUNCIONAL

class ComunidadeDetalhes {
    constructor() {
        this.comunidadeId = new URLSearchParams(window.location.search).get('id');
        this.comunidade = null;
        this.usuarioAtual = null;
        this.isMembro = false;
        this.isCriador = false;
        console.log('Iniciando - ID:', this.comunidadeId);
        this.init();
    }

    init() {
        this.carregarDados();
        if (this.comunidade) {
            this.renderizarTudo();
            this.setupAbas();
        }
    }

    carregarDados() {
        try {
            this.usuarioAtual = JSON.parse(localStorage.getItem('usuarioLogado'));
            const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
            console.log('Comunidades no localStorage:', comunidades.length);

            this.comunidade = comunidades.find(c => c.id === this.comunidadeId);

            if (!this.comunidade) {
                console.error('Comunidade nao encontrada:', this.comunidadeId);
                alert('Comunidade nao encontrada');
                window.location.href = 'comunidades.html';
                return;
            }

            this.isMembro = this.comunidade.membros.includes(this.usuarioAtual.email);
            this.isCriador = this.comunidade.criador === this.usuarioAtual.email;

            console.log('Comunidade carregada:', this.comunidade);
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }

    renderizarTudo() {
        this.renderizarBanner();
        this.renderizarHeader();
        this.renderizarPosts();
        this.renderizarMembros();
        this.renderizarInfo();
    }

    renderizarBanner() {
        const banner = document.querySelector('.comunidade-banner');
        if (banner && this.comunidade.banner) {
            banner.style.backgroundImage = 'url("' + this.comunidade.banner + '")';
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }

    renderizarHeader() {
        const header = document.querySelector('.comunidade-header');
        if (!header) return;

        const foto = this.comunidade.foto || 'https://via.placeholder.com/60';
        const nome = this.comunidade.nome || 'Sem nome';
        const descricao = this.comunidade.descricao || 'Sem descricao';
        const membros = this.comunidade.membros ? this.comunidade.membros.length : 0;
        const posts = this.comunidade.posts ? this.comunidade.posts.length : 0;
        const data = this.comunidade.dataCriacao ? new Date(this.comunidade.dataCriacao).toLocaleDateString('pt-BR') : 'Data nao definida';

        let html = '<img src="' + foto + '" alt="Foto" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 15px; border: 2px solid #7e30ff; object-fit: cover;">';
        html += '<h1>' + nome + '</h1>';
        html += '<p>' + descricao + '</p>';
        html += '<div style="color: #9d5fd4; margin-bottom: 15px;">';
        html += '<span>👥 ' + membros + ' membros</span>';
        html += '<span style="margin-left: 20px;">📝 ' + posts + ' posts</span>';
        html += '<span style="margin-left: 20px;">📅 ' + data + '</span>';
        html += '</div>';

        if (this.isMembro) {
            const disabled = this.isCriador ? 'disabled' : '';
            const texto = this.isCriador ? 'Voce e o criador' : 'SAIR';
            html += '<button class="btn-acao" onclick="detalhes.sair()" ' + disabled + '>' + texto + '</button>';
        } else {
            html += '<button class="btn-acao" onclick="detalhes.entrar()">ENTRAR</button>';
        }

        header.innerHTML = html;
    }

    renderizarPosts() {
        const container = document.getElementById('posts');
        if (!container) return;

        let html = '';

        if (this.isMembro) {
            html += '<div class="novo-post">';
            html += '<input type="text" id="input-novo-post" placeholder="Escreva uma mensagem...">';
            html += '<button onclick="detalhes.adicionarPost()">Enviar</button>';
            html += '</div>';
        }

        html += '<div class="posts-container">';

        if (!this.comunidade.posts || this.comunidade.posts.length === 0) {
            html += '<p class="vazio">Nenhuma mensagem ainda. Comece a conversar!</p>';
        } else {
            this.comunidade.posts.forEach(p => {
                const data = new Date(p.data).toLocaleDateString('pt-BR');
                html += '<div class="post">';
                html += '<div class="post-header">';
                html += '<img src="' + (p.avatar || 'https://via.placeholder.com/40') + '" alt="Avatar" class="post-avatar">';
                html += '<div class="post-info">';
                html += '<strong>' + (p.autor || 'Desconhecido') + '</strong>';
                html += '<small>' + data + '</small>';
                html += '</div>';
                html += '</div>';
                html += '<p class="post-conteudo">' + (p.conteudo || '') + '</p>';
                html += '</div>';
            });
        }

        html += '</div>';
        container.innerHTML = html;
    }

    renderizarMembros() {
        const container = document.getElementById('membros');
        if (!container) return;

        let html = '<div class="membros-container">';

        if (!this.comunidade.membrosInfo || this.comunidade.membrosInfo.length === 0) {
            if (this.comunidade.membros && this.comunidade.membros.length > 0) {
                this.comunidade.membros.forEach(email => {
                    html += '<div class="membro">';
                    html += '<img src="https://via.placeholder.com/60" alt="Avatar" class="membro-avatar">';
                    html += '<strong>' + email + '</strong>';
                    html += '<small>Membro</small>';
                    html += '</div>';
                });
            } else {
                html += '<p class="vazio" style="grid-column: 1 / -1;">Carregando membros...</p>';
            }
        } else {
            this.comunidade.membrosInfo.forEach(m => {
                html += '<div class="membro">';
                html += '<img src="' + (m.avatar || 'https://via.placeholder.com/60') + '" alt="Avatar" class="membro-avatar">';
                html += '<strong>' + (m.nome || m.email) + '</strong>';
                html += '<small>' + (m.role === 'criador' ? 'Criador' : 'Membro') + '</small>';
                html += '</div>';
            });
        }

        html += '</div>';
        container.innerHTML = html;
    }

    renderizarInfo() {
        const container = document.getElementById('info');
        if (!container) return;

        const data = this.comunidade.dataCriacao ? new Date(this.comunidade.dataCriacao).toLocaleDateString('pt-BR') : '--/--/----';

        let html = '<div style="padding: 20px; background: rgba(45, 0, 80, 0.5); border-radius: 12px; border: 1px solid #7e30ff;">';
        html += '<h3 style="color: #c699ff; margin-bottom: 15px;">Sobre a Comunidade</h3>';
        html += '<p style="color: #e6ccff; line-height: 1.6;">' + (this.comunidade.descricao || 'Descricao completa da comunidade ira aparecer aqui...') + '</p>';
        html += '<h3 style="color: #c699ff; margin-top: 20px; margin-bottom: 15px;">Informacoes Gerais</h3>';
        html += '<p style="color: #9d5fd4;">📅 Criada em: ' + data + '</p>';
        html += '<p style="color: #9d5fd4; margin-top: 10px;">👤 Criador: ' + (this.comunidade.criadorNome || this.comunidade.criador || '--') + '</p>';
        html += '<p style="color: #9d5fd4; margin-top: 10px;">📊 Total de Mensagens: ' + (this.comunidade.posts ? this.comunidade.posts.length : 0) + '</p>';
        html += '<p style="color: #9d5fd4; margin-top: 10px;">✅ Status: Ativa</p>';
        html += '</div>';

        container.innerHTML = html;
    }

    adicionarPost() {
        const input = document.getElementById('input-novo-post');
        if (!input || !input.value.trim()) {
            alert('Escreva algo');
            return;
        }

        const post = {
            id: 'post_' + Date.now(),
            autor: this.usuarioAtual.nome || this.usuarioAtual.email,
            avatar: this.usuarioAtual.avatar || 'https://via.placeholder.com/40',
            conteudo: input.value.trim(),
            data: new Date().toISOString()
        };

        this.comunidade.posts.push(post);
        this.salvar();
        input.value = '';
        this.renderizarPosts();
        this.renderizarHeader();
    }

    entrar() {
        this.comunidade.membros.push(this.usuarioAtual.email);
        this.comunidade.membrosInfo = this.comunidade.membrosInfo || [];
        this.comunidade.membrosInfo.push({
            email: this.usuarioAtual.email,
            nome: this.usuarioAtual.nome || this.usuarioAtual.email,
            avatar: this.usuarioAtual.avatar || 'https://via.placeholder.com/60',
            role: 'membro'
        });

        this.salvar();
        this.isMembro = true;
        this.renderizarTudo();
        alert('Você entrou na comunidade!');
    }

    sair() {
        this.comunidade.membros = this.comunidade.membros.filter(m => m !== this.usuarioAtual.email);
        this.comunidade.membrosInfo = (this.comunidade.membrosInfo || []).filter(m => m.email !== this.usuarioAtual.email);

        this.salvar();
        this.isMembro = false;
        this.renderizarTudo();
        alert('Voce saiu da comunidade');
    }

    salvar() {
        try {
            const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
            const index = comunidades.findIndex(c => c.id === this.comunidadeId);

            if (index !== -1) {
                comunidades[index] = this.comunidade;
                localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
                console.log('Comunidade salva');
            }
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }
    }

    setupAbas() {
        const abasBotoes = document.querySelectorAll('.aba-btn');

        abasBotoes.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                abasBotoes.forEach(b => b.classList.remove('ativa'));
                document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));

                btn.classList.add('ativa');

                if (index === 0) {
                    document.getElementById('posts').classList.add('ativa');
                } else if (index === 1) {
                    document.getElementById('membros').classList.add('ativa');
                } else if (index === 2) {
                    document.getElementById('info').classList.add('ativa');
                }
            });
        });
    }
}

window.addEventListener('load', () => {
    window.detalhes = new ComunidadeDetalhes();
});
