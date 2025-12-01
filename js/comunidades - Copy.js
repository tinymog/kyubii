// ╔════════════════════════════════════════════════════════════════════════════╗
// ║            COMUNIDADES - NOVO LAYOUT COM FUNCIONALIDADE COMPLETA           ║
// ╚════════════════════════════════════════════════════════════════════════════╝

class SistemaComunidades {
    constructor() {
        this.comunidades = [];
        this.usuarioAtual = null;
        this.comunidadeDestaque = null;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Sistema de Comunidades');
        this.carregarUsuario();
        this.carregarComunidades();
        this.renderizar();
        this.setupEventos();
    }

    carregarUsuario() {
        try {
            this.usuarioAtual = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (!this.usuarioAtual) {
                console.warn('⚠️ Usuário não logado');
                window.location.href = '/pages/login.html';
                return;
            }
            console.log('👤 Usuário:', this.usuarioAtual.nome);
        } catch (error) {
            console.error('❌ Erro ao carregar usuário:', error);
            window.location.href = '/pages/login.html';
        }
    }

    carregarComunidades() {
        try {
            const dados = localStorage.getItem('comunidades_dados');
            this.comunidades = dados ? JSON.parse(dados) : [];
            console.log('✅ Comunidades carregadas:', this.comunidades.length);

            if (this.comunidades.length > 0) {
                this.comunidadeDestaque = this.comunidades.reduce((prev, current) => {
                    return (current.membros?.length || 0) > (prev.membros?.length || 0) ? current : prev;
                });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar comunidades:', error);
            this.comunidades = [];
        }
    }

    renderizar() {
        this.renderDestaque();
        this.renderMinhas();
        this.renderOutras();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERIZAR DESTAQUE
    // ═══════════════════════════════════════════════════════════════════════════
    renderDestaque() {
        const container = document.getElementById('comunidade-destaque');
        if (!container || !this.comunidadeDestaque) {
            if (container) {
                container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">Nenhuma comunidade disponível</p>';
            }
            return;
        }

        const com = this.comunidadeDestaque;
        const isMembro = com.membros?.includes(this.usuarioAtual.email);

        const html = `
            <div class="destaque-imagem" style="background-image: url('${com.banner || 'https://via.placeholder.com/400x250'}');">
                <div class="destaque-badge">✨ Destaque</div>
            </div>
            <div class="destaque-info">
                <div class="destaque-header">
                    <span class="destaque-titulo">${com.nome}</span>
                    <span class="destaque-verificado">✓</span>
                </div>
                <p class="destaque-descricao">${com.biografia || com.descricao || 'Comunidade incrível!'}</p>
            </div>
        `;

        container.innerHTML = html;
        container.addEventListener('click', () => {
            window.location.href = '/pages/comunidade-detalhes.html?id=' + com.id;
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERIZAR MINHAS COMUNIDADES
    // ═══════════════════════════════════════════════════════════════════════════
    renderMinhas() {
        const container = document.getElementById('minhas-comunidades-lista');
        if (!container) return;

        const minhas = this.comunidades.filter(c => c.membros?.includes(this.usuarioAtual.email));

        if (minhas.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">Você não é membro de nenhuma comunidade</p>';
            return;
        }

        const html = minhas.map(com => {
            const onlineCount = Math.floor(Math.random() * 50) + 10; // Simulado
            const foto = com.foto || 'https://via.placeholder.com/50?text=' + com.nome.charAt(0);

            return `
                <div class="item-comunidade" onclick="window.location.href='/pages/comunidade-detalhes.html?id=${com.id}'">
                    <div class="avatar-comunidade">
                        <img src="${foto}" alt="${com.nome}" onerror="this.src='https://via.placeholder.com/50'">
                    </div>
                    <div class="info-comunidade">
                        <div class="nome-comunidade">${com.nome}</div>
                        <div class="stats-comunidade">
                            <span class="online-indicator"></span>
                            ${onlineCount} online • ${com.membros?.length || 0} membros
                        </div>
                    </div>
                    <button class="sair-btn" onclick="event.stopPropagation(); sistema.sairComunidade('${com.id}')">
                        Sair
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERIZAR OUTRAS COMUNIDADES
    // ═══════════════════════════════════════════════════════════════════════════
    renderOutras() {
        const container = document.getElementById('outras-comunidades-lista');
        if (!container) return;

        const outras = this.comunidades.filter(c => !c.membros?.includes(this.usuarioAtual.email));

        if (outras.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">Nenhuma outra comunidade disponível</p>';
            return;
        }

        const html = outras.map(com => {
            const bannerUrl = com.banner || 'https://via.placeholder.com/200x150';

            return `
                <div class="card-outra-comunidade" onclick="window.location.href='/pages/comunidade-detalhes.html?id=${com.id}'">
                    <div class="outra-imagem" style="background-image: url('${bannerUrl}'); background-size: cover;">
                        <img src="${bannerUrl}" alt="${com.nome}" style="opacity:0;" onerror="this.style.opacity='0'">
                    </div>
                    <div class="outra-info">
                        <div class="outra-nome">${com.nome}</div>
                        <div class="outra-stats">
                            👥 ${com.membros?.length || 0} membros • 📝 ${com.posts?.length || 0} posts
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AÇÕES
    // ═══════════════════════════════════════════════════════════════════════════
    sairComunidade(id) {
        const comunidade = this.comunidades.find(c => c.id === id);
        if (!comunidade) {
            alert('❌ Comunidade não encontrada');
            return;
        }

        if (comunidade.criador === this.usuarioAtual.email) {
            alert('❌ Você é o criador. Vá para detalhes para deletar.');
            return;
        }

        if (!confirm('Deseja sair de ' + comunidade.nome + '?')) {
            return;
        }

        comunidade.membros = comunidade.membros?.filter(e => e !== this.usuarioAtual.email) || [];
        comunidade.membrosInfo = comunidade.membrosInfo?.filter(m => m.email !== this.usuarioAtual.email) || [];

        this.salvarComunidades();
        alert('✅ Você saiu de ' + comunidade.nome);

        this.carregarComunidades();
        this.renderizar();
    }

    salvarComunidades() {
        try {
            localStorage.setItem('comunidades_dados', JSON.stringify(this.comunidades));
            console.log('✅ Comunidades salvas');
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            alert('❌ Erro ao salvar');
        }
    }

    setupEventos() {
        const btnCriar = document.getElementById('btn-criar-comunidade');
        if (btnCriar) {
            btnCriar.addEventListener('click', () => {
                window.location.href = '/pages/criar-comunidade.html';
            });
        }
    }
}

let sistema;
document.addEventListener('DOMContentLoaded', () => {
    sistema = new SistemaComunidades();
});
