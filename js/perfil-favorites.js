// ================ FAVORITOS NO PERFIL ================
/**
 * Renderiza jogos favoritos na página de perfil
 */

class PerfilFavoritos {
    constructor() {
        this.favoritos = [];
        this.jogos = [];
        this.usuario = null;
        console.log('⭐ Perfil Favoritos Iniciado');
        this.init();
    }

    async init() {
        // Aguardar auth estar available
        let attempts = 0;
        while ((!window.auth || !auth.getUsuarioLogado) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        this.usuario = auth?.getUsuarioLogado?.();
        if (this.usuario) {
            await this.carregarFavoritos();
        }
    }

    async carregarFavoritos() {
        if (!this.usuario || !this.usuario.email) {
            console.warn('⚠️ Usuário não logado');
            return;
        }

        try {
            // Carregar favoritos do backend
            if (typeof favoritesSystem !== 'undefined') {
                this.favoritos = await favoritesSystem.loadFavorites(this.usuario.email);
            } else {
                // Fallback para localStorage
                const chave = `favoritos_${this.usuario.id}`;
                const stored = localStorage.getItem(chave);
                this.favoritos = stored ? JSON.parse(stored) : [];
            }

            console.log(`⭐ Favoritos carregados: ${this.favoritos.length}`);

            if (this.favoritos.length > 0) {
                await this.renderizarFavoritos();
            }

        } catch (erro) {
            console.error('❌ Erro ao carregar favoritos:', erro);
        }
    }

    async renderizarFavoritos() {
        const container = document.getElementById('jogos-favoritos-grid');
        const secao = document.getElementById('favoritos-secao');

        if (!container) {
            console.warn('⚠️ Container de favoritos não encontrado');
            return;
        }

        // SEMPRE pegar favoritos do sistema global (estado mais recente)
        if (typeof favoritesSystem !== 'undefined' && favoritesSystem.favoritos) {
            this.favoritos = [...favoritesSystem.favoritos]; // Cópia para evitar referência
        } else {
            // Fallback: carregar do localStorage diretamente
            const chave = `favoritos_${this.usuario.id}`;
            const stored = localStorage.getItem(chave);
            this.favoritos = (stored && stored !== 'null') ? JSON.parse(stored) : [];
        }

        console.log(`⭐ Favoritos atuais: ${this.favoritos.length}`);

        // Carregar dados dos jogos da biblioteca Steam (apenas se necessário)
        if (this.jogos.length === 0) {
            await this.carregarJogos();
        }

        if (this.jogos.length === 0) {
            console.warn('⚠️ Nenhum jogo na biblioteca');
            if (secao) secao.style.display = 'none';
            return;
        }

        // Filtrar apenas os favoritos (converter para string)
        const jogosFavoritos = this.jogos.filter(jogo =>
            this.favoritos.includes(String(jogo.appid || jogo.id))
        );

        console.log(`🎮 Renderizando ${jogosFavoritos.length} favoritos`);

        if (jogosFavoritos.length > 0) {
            // Mostrar seção
            if (secao) secao.style.display = 'block';

            // Renderizar cards
            container.innerHTML = jogosFavoritos.map(jogo => this.criarCardJogo(jogo)).join('');
        } else {
            // Nenhum favorito - esconder seção
            if (secao) secao.style.display = 'none';
            container.innerHTML = '<p style="color: #999;">Nenhum jogo favoritado ainda.</p>';
        }
    }

    async carregarJogos() {
        try {
            // Tentar carregar do localStorage primeiro
            const chave = `biblioteca_steam_${this.usuario.id}`;
            const stored = localStorage.getItem(chave);

            if (stored && stored !== 'null') {
                this.jogos = JSON.parse(stored);
                console.log(`📚 Jogos carregados do cache: ${this.jogos.length}`);
                return;
            }

            // Se não tem no localStorage, tentar buscar do Steam
            const steamId = localStorage.getItem('steamId');
            if (steamId && steamId !== 'null') {
                const response = await fetch(`/api/steam/library/${steamId}`);
                if (response.ok) {
                    const data = await response.json();
                    this.jogos = data.map(game => ({
                        id: game.appid,
                        appid: game.appid,
                        nome: game.name,
                        name: game.name,
                        imagem: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
                        horas: Math.round((game.playtime_forever || 0) / 60)
                    }));
                    console.log(`📚 Jogos carregados da API: ${this.jogos.length}`);
                }
            }
        } catch (erro) {
            console.error('❌ Erro ao carregar jogos:', erro);
        }
    }

    criarCardJogo(jogo) {
        const id = jogo.id || jogo.appid;
        const nome = jogo.nome || jogo.name || 'Unknown';
        const imagem = jogo.imagem;
        const horas = jogo.horas || 0;

        return `
            <div class="card-jogo" onclick="window.open('https://store.steampowered.com/app/${id}', '_blank')">
                <button 
                    onclick="event.stopPropagation(); toggleFavoritoPerfil('${id}');" 
                    class="btn-favoritar btn-favoritar-perfil favoritado"
                    id="fav-perfil-${id}"
                >
                    ⭐
                </button>
                <img src="${imagem}" alt="${nome}" class="jogo-imagem" loading="lazy">
                <div class="jogo-info">
                    <p class="jogo-nome">${nome}</p>
                    <div class="jogo-horas">⏱️ ${horas}h jogadas</div>
                </div>
            </div>
        `;
    }

}

// Função global para toggle de favoritos no perfil
window.toggleFavoritoPerfil = async function (appid) {
    const usuario = auth?.getUsuarioLogado?.();
    if (!usuario || !usuario.email) {
        console.warn('⚠️ Usuário não logado');
        return;
    }

    console.log(`🔄 Toggle favorito do perfil: ${appid}`);

    // Usar sistema global de favoritos
    if (typeof favoritesSystem !== 'undefined') {
        const added = await favoritesSystem.toggleFavorite(usuario.email, appid);

        console.log(`✅ Toggle favorito: ${added ? 'adicionado' : 'removido'}`);

        // IMEDIATAMENTE remover o card do DOM se foi desfavoritado
        if (!added) {
            const cardElement = document.querySelector(`#fav-perfil-${appid}`);
            if (cardElement) {
                const jogoCard = cardElement.closest('.card-jogo');
                if (jogoCard) {
                    // Remover visualmente com animação suave
                    jogoCard.style.opacity = '0';
                    jogoCard.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        jogoCard.remove();

                        // Verificar se ainda há favoritos, se não, esconder seção
                        const container = document.getElementById('jogos-favoritos-grid');
                        const secao = document.getElementById('favoritos-secao');
                        if (container && container.children.length === 0 && secao) {
                            secao.style.display = 'none';
                        }
                    }, 200);
                }
            }
        }

        // Recarregar a lista completa após um pequeno delay
        // (garante que o sistema global está atualizado)
        setTimeout(async () => {
            const perfilFavoritosInstance = window.perfilFavoritosInstance;
            if (perfilFavoritosInstance) {
                await perfilFavoritosInstance.renderizarFavoritos();
            }
        }, 300);
    } else {
        console.error('❌ Sistema de favoritos não disponível');
    }
};

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para auth.js carregar
    setTimeout(() => {
        const perfilFavoritos = new PerfilFavoritos();
        window.perfilFavoritosInstance = perfilFavoritos;
    }, 1000);
});

// Escutar mudanças nos favoritos
document.addEventListener('favoritesUpdated', () => {
    console.log('🔄 Favoritos atualizados, re-renderizando perfil');
    const perfilFavoritosInstance = window.perfilFavoritosInstance;
    if (perfilFavoritosInstance) {
        perfilFavoritosInstance.renderizarFavoritos();
    }
});
