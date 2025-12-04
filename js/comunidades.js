// ═══════════════════════════════════════════════════════════════════════════
// COMUNIDADES - SISTEMA REESTRUTURADO E OTIMIZADO
// ═══════════════════════════════════════════════════════════════════════════

class SistemaComunidades {
    constructor() {
        this.comunidades = [];
        this.usuarioAtual = null;
        this.comunidadeDestaque = null;
        this.cache = {
            comunidades: null,
            timestamp: null,
            ttl: 5 * 60 * 1000 // 5 minutos
        };
        this.loading = false;
        this.init();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INICIALIZAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════

    async init() {
        console.log('🚀 Inicializando Sistema de Comunidades');

        try {
            await this.carregarUsuario();
            await this.carregarComunidadesComCache();
            this.calcularComunidadeDestaque();
            await this.renderizar();
            this.setupEventos();
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.mostrarErro('Erro ao carregar comunidades');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CARREGAMENTO DE DADOS
    // ═══════════════════════════════════════════════════════════════════════════

    async carregarUsuario() {
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

    async carregarComunidadesComCache() {
        // Verificar cache
        const agora = Date.now();
        if (this.cache.comunidades && this.cache.timestamp && (agora - this.cache.timestamp < this.cache.ttl)) {
            console.log('✅ Usando cache de comunidades');
            this.comunidades = this.cache.comunidades;
            return;
        }

        // Carregar do localStorage
        try {
            this.mostrarLoading(true);
            const dados = localStorage.getItem('comunidades_dados');
            this.comunidades = dados ? JSON.parse(dados) : [];

            // Atualizar cache
            this.cache.comunidades = this.comunidades;
            this.cache.timestamp = agora;

            console.log(`✅ Comunidades carregadas: ${this.comunidades.length}`);
        } catch (error) {
            console.error('❌ Erro ao carregar comunidades:', error);
            this.comunidades = [];
        } finally {
            this.mostrarLoading(false);
        }
    }

    calcularComunidadeDestaque() {
        if (this.comunidades.length === 0) {
            this.comunidadeDestaque = null;
            return;
        }

        // Comunidade com mais membros
        this.comunidadeDestaque = this.comunidades.reduce((prev, current) => {
            return (current.membros?.length || 0) > (prev.membros?.length || 0) ? current : prev;
        });

        console.log('⭐ Comunidade em destaque:', this.comunidadeDestaque.nome);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERIZAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════

    async renderizar() {
        await Promise.all([
            this.renderDestaque(),
            this.renderMinhas(),
            this.renderExplorar()
        ]);
    }

    renderDestaque() {
        const container = document.getElementById('comunidade-destaque');
        if (!container) return;

        if (!this.comunidadeDestaque) {
            container.innerHTML = '<p style="color: #9d5fd4;">Nenhuma comunidade disponível</p>';
            return;
        }

        const com = this.comunidadeDestaque;
        const bannerUrl = com.banner || 'https://via.placeholder.com/400x180/7e30ff/ffffff?text=' + encodeURIComponent(com.nome);

        container.innerHTML = `
            <div class="card-destaque" onclick="irParaComunidade('${com.id}')">
                <div class="destaque-imagem" style="background-image: url('${bannerUrl}')">
                    <div class="destaque-badge">${com.membros?.length || 0} membros</div>
                </div>
                <div class="destaque-info">
                    <div class="destaque-header">
                        <h3 class="destaque-titulo">${this.escapeHtml(com.nome)}</h3>
                        <span class="destaque-verificado">✓</span>
                    </div>
                    <p class="destaque-descricao">${this.escapeHtml(com.biografia || com.descricao || 'Comunidade incrível!')}</p>
                </div>
            </div>
        `;
    }

    renderMinhas() {
        const container = document.getElementById('minhas-comunidades');
        if (!container) return;

        if (!this.usuarioAtual) {
            container.innerHTML = '<p style="color: #9d5fd4;">Faça login para ver suas comunidades</p>';
            return;
        }

        const minhas = this.comunidades.filter(c => {
            return c.membros && Array.isArray(c.membros) && c.membros.includes(this.usuarioAtual.email);
        });

        console.log(`✅ Minhas comunidades: ${minhas.length}`);

        if (minhas.length === 0) {
            container.innerHTML = '<p style="color: #9d5fd4;">Você não é membro de nenhuma comunidade</p>';
            return;
        }

        const html = minhas.map(com => {
            const totalMembros = com.membros?.length || 0;
            const foto = com.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(com.nome)}&background=7e30ff&color=fff&bold=true`;

            // Membros online: Simular usando localStorage persistente
            const onlineKey = `comunidade_${com.id}_online`;
            let onlineCount = localStorage.getItem(onlineKey);

            if (!onlineCount) {
                // Primeira vez: calcular e salvar
                const percentualOnline = Math.random() * 0.4 + 0.3; // 30% a 70%
                onlineCount = Math.max(1, Math.ceil(totalMembros * percentualOnline));
                localStorage.setItem(onlineKey, onlineCount);
            }

            return `
                <div class="item-comunidade" onclick="irParaComunidade('${com.id}')">
                    <div class="avatar-comunidade">
                        <img src="${foto}" alt="${this.escapeHtml(com.nome)}" onerror="this.src='https://via.placeholder.com/50/7e30ff/ffffff?text=${com.nome.charAt(0)}'">
                    </div>
                    <div class="info-comunidade">
                        <div class="nome-comunidade">${this.escapeHtml(com.nome)}</div>
                        <div class="stats-comunidade">
                            <span class="online-indicator"></span>${onlineCount} online • ${totalMembros} membros
                        </div>
                    </div>
                    <button class="sair-btn" onclick="event.stopPropagation(); sairComunidade('${com.id}', '${this.usuarioAtual.email}')">
                        Sair
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderExplorar() {
        const container = document.getElementById('grid-explorar');
        if (!container) return;

        if (this.comunidades.length === 0) {
            container.innerHTML = '<p style="color: #9d5fd4;">Nenhuma comunidade disponível</p>';
            return;
        }

        const html = this.comunidades.map(com => {
            const bannerUrl = com.banner || `https://via.placeholder.com/200x150/7e30ff/ffffff?text=${encodeURIComponent(com.nome)}`;
            const temMembro = this.usuarioAtual &&
                com.membros &&
                Array.isArray(com.membros) &&
                com.membros.includes(this.usuarioAtual.email);

            const badge = temMembro ? '✓ Membro' : '+ Entrar';
            const badgeClass = temMembro ? 'badge-membro' : 'badge-entrar';

            return `
                <div class="card-comunidade" onclick="irParaComunidade('${com.id}')">
                    <div class="card-imagem" style="background-image: url('${bannerUrl}')">
                        <span class="card-badge ${badgeClass}">${badge}</span>
                    </div>
                    <div class="card-info">
                        <h3 class="card-nome">${this.escapeHtml(com.nome)}</h3>
                        <div class="card-stats">
                            <span class="card-tipo">${this.escapeHtml(com.tipo || 'Geral')}</span> • 
                            <span class="card-membros">${com.membros?.length || 0} membros</span>
                        </div>
                        <p class="card-descricao" title="${this.escapeHtml(com.biografia || com.descricao || '')}">${this.escapeHtml((com.biografia || com.descricao || 'Comunidade incrível').substring(0, 50))}...</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log(`✅ Cards de explorar renderizados: ${this.comunidades.length}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENTOS E UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════════════════════

    setupEventos() {
        console.log('⚙️ Setup de eventos');

        // Pode adicionar eventos de busca aqui no futuro
    }

    mostrarLoading(exibir) {
        this.loading = exibir;
        const containers = ['comunidade-destaque', 'minhas-comunidades', 'grid-explorar'];

        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container && exibir) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #9d5fd4;">Carregando...</div>';
            }
        });
    }

    mostrarErro(mensagem) {
        console.error('❌', mensagem);
        const containers = ['comunidade-destaque', 'minhas-comunidades', 'grid-explorar'];

        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">${this.escapeHtml(mensagem)}</p>`;
            }
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Método público para forçar recarga
    async recarregar() {
        this.cache.comunidades = null;
        this.cache.timestamp = null;
        await this.carregarComunidadesComCache();
        this.calcularComunidadeDestaque();
        await this.renderizar();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

let sistemaComunidades;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado');
    sistemaComunidades = new SistemaComunidades();
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS
// ═══════════════════════════════════════════════════════════════════════════

function irParaComunidade(comunidadeId) {
    console.log('🔗 Redirecionando para comunidade:', comunidadeId);

    if (!comunidadeId) {
        console.error('❌ ID da comunidade não fornecido');
        return;
    }

    sessionStorage.setItem('comunidadeAtual', comunidadeId);
    window.location.href = '/pages/comunidade-detalhes.html?id=' + comunidadeId;
}

function sairComunidade(comunidadeId, email) {
    console.log('🚪 Saindo da comunidade:', comunidadeId);

    if (!confirm('Tem certeza que quer sair desta comunidade?')) {
        return;
    }

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const comunidade = comunidades.find(c => c.id === comunidadeId);

        if (!comunidade) {
            console.error('❌ Comunidade não encontrada');
            alert('Comunidade não encontrada');
            return;
        }

        // Remover do array de membros
        comunidade.membros = comunidade.membros.filter(m => m !== email);

        // Remover de membrosInfo se existir
        if (comunidade.membrosInfo) {
            comunidade.membrosInfo = comunidade.membrosInfo.filter(m => m.email !== email);
        }

        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
        console.log('✅ Saiu da comunidade com sucesso');

        // Recarregar página
        location.reload();
    } catch (error) {
        console.error('❌ Erro ao sair da comunidade:', error);
        alert('Erro ao sair da comunidade');
    }
}

function entrarComunidade(comunidadeId, email, nome) {
    console.log('👥 Entrando na comunidade:', comunidadeId);

    try {
        let comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        const comunidade = comunidades.find(c => c.id === comunidadeId);

        if (!comunidade) {
            console.error('❌ Comunidade não encontrada');
            alert('Comunidade não encontrada');
            return;
        }

        if (comunidade.membros?.includes(email)) {
            console.warn('⚠️ Já é membro da comunidade');
            return;
        }

        // Adicionar no array de membros
        if (!comunidade.membros) comunidade.membros = [];
        comunidade.membros.push(email);

        // Adicionar em membrosInfo
        if (!comunidade.membrosInfo) comunidade.membrosInfo = [];
        comunidade.membrosInfo.push({
            email: email,
            nome: nome,
            role: 'membro',
            dataEntrada: new Date().toISOString()
        });

        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));
        console.log('✅ Entrou na comunidade com sucesso');

        // Recarregar página
        location.reload();
    } catch (error) {
        console.error('❌ Erro ao entrar na comunidade:', error);
        alert('Erro ao entrar na comunidade');
    }
}
