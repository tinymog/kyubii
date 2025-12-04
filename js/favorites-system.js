// ================ SISTEMA GLOBAL DE FAVORITOS ================
/**
 * Gerencia favoritos de jogos com sincronização backend
 */

class FavoritesSystem {
    constructor() {
        this.favoritos = [];
        this.isLoading = false;
        console.log('⭐ Sistema de Favoritos Iniciado');
    }

    /**
     * Carrega favoritos do usuário (localStorage + backend)
     * @param {string} email - Email do usuário
     */
    async loadFavorites(email) {
        if (!email) {
            console.warn('⚠️ Email não fornecido para carregar favoritos');
            return [];
        }

        try {
            this.isLoading = true;

            // 1. Carregar do localStorage primeiro (rápido)
            const localFavorites = this.getLocalFavorites(email);
            this.favoritos = localFavorites;
            console.log(`📦 Favoritos locais: ${localFavorites.length}`);

            // 2. Sincronizar com backend
            const response = await fetch(`/api/favoritos/${encodeURIComponent(email)}`);

            if (response.ok) {
                const data = await response.json();
                const serverFavorites = data.favoritos || [];

                console.log(`📊 Favoritos do servidor: ${serverFavorites.length}`);

                // Se servidor tem dados diferentes, usar servidor como verdade
                if (JSON.stringify(serverFavorites) !== JSON.stringify(localFavorites)) {
                    this.favoritos = serverFavorites;
                    this.saveLocalFavorites(email, serverFavorites);
                    console.log('🔄 Favoritos sincronizados do servidor');
                }
            }

            return this.favoritos;

        } catch (erro) {
            console.warn('⚠️ Erro ao carregar favoritos do servidor:', erro);
            // Usar localStorage como fallback
            return this.getLocalFavorites(email);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Adiciona ou remove um jogo dos favoritos
     * @param {string} email - Email do usuário
     * @param {string|number} appid - ID do jogo
     */
    async toggleFavorite(email, appid) {
        if (!email || !appid) {
            console.error('❌ Email e appid são obrigatórios');
            return false;
        }

        appid = String(appid);

        try {
            // Atualizar localStorage imediatamente
            let localFavorites = this.getLocalFavorites(email);
            const index = localFavorites.indexOf(appid);
            let added = false;

            if (index >= 0) {
                localFavorites.splice(index, 1);
                added = false;
                console.log(`❌ Removido dos favoritos: ${appid}`);
            } else {
                localFavorites.push(appid);
                added = true;
                console.log(`⭐ Adicionado aos favoritos: ${appid}`);
            }

            this.favoritos = localFavorites;
            this.saveLocalFavorites(email, localFavorites);

            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('favoritesUpdated', {
                detail: { email, appid, added, favoritos: localFavorites }
            }));

            // Sincronizar com backend (assíncrono)
            this.syncToggleWithBackend(email, appid);

            return added;

        } catch (erro) {
            console.error('❌ Erro ao toggle favorito:', erro);
            return false;
        }
    }

    /**
     * Sincroniza toggle com backend
     */
    async syncToggleWithBackend(email, appid) {
        try {
            const response = await fetch(`/api/favoritos/${encodeURIComponent(email)}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appid })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Favorito sincronizado com servidor: ${data.added ? 'adicionado' : 'removido'}`);

                // Atualizar lista local com resposta do servidor
                this.favoritos = data.favoritos || [];
                this.saveLocalFavorites(email, this.favoritos);
            }
        } catch (erro) {
            console.warn('⚠️ Erro ao sincronizar com backend:', erro);
        }
    }

    /**
     * Sincroniza lista completa com backend
     */
    async syncWithBackend(email, favoritos) {
        try {
            const response = await fetch(`/api/favoritos/${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favoritos })
            });

            if (response.ok) {
                console.log('✅ Favoritos sincronizados com servidor');
                return true;
            }
        } catch (erro) {
            console.warn('⚠️ Erro ao sincronizar favoritos:', erro);
        }
        return false;
    }

    /**
     * Verifica se um jogo está favoritado
     */
    isFavorite(appid) {
        return this.favoritos.includes(String(appid));
    }

    /**
     * Retorna lista de favoritos
     */
    getFavorites() {
        return [...this.favoritos];
    }

    /**
     * Carrega favoritos do localStorage
     */
    getLocalFavorites(email) {
        try {
            const userId = this.getUserIdFromEmail(email);
            const key = `favoritos_${userId}`;
            const stored = localStorage.getItem(key);

            if (stored && stored !== 'null') {
                const favoritos = JSON.parse(stored);
                return Array.isArray(favoritos) ? favoritos.map(String) : [];
            }
        } catch (erro) {
            console.warn('⚠️ Erro ao ler favoritos locais:', erro);
        }
        return [];
    }

    /**
     * Salva favoritos no localStorage
     */
    saveLocalFavorites(email, favoritos) {
        try {
            const userId = this.getUserIdFromEmail(email);
            const key = `favoritos_${userId}`;
            localStorage.setItem(key, JSON.stringify(favoritos));
            console.log(`💾 Favoritos salvos localmente: ${favoritos.length}`);
        } catch (erro) {
            console.error('❌ Erro ao salvar favoritos locais:', erro);
        }
    }

    /**
     * Extrai userId do email ou usa o próprio email
     */
    getUserIdFromEmail(email) {
        // Tentar pegar ID do usuário logado
        try {
            const userData = localStorage.getItem('usuarioLogado');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id || email;
            }
        } catch (e) { }
        return email;
    }

    /**
     * Limpa favoritos ao fazer logout
     */
    clearFavorites() {
        this.favoritos = [];
        console.log('🚪 Favoritos limpos (logout)');
    }
}

// ================ INSTÂNCIA GLOBAL ================
let favoritesSystem;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        favoritesSystem = new FavoritesSystem();
    });
} else {
    favoritesSystem = new FavoritesSystem();
}

// ================ FUNÇÕES AUXILIARES GLOBAIS ================

/**
 * Carrega favoritos do usuário
 */
async function carregarFavoritos(email) {
    if (favoritesSystem) {
        return await favoritesSystem.loadFavorites(email);
    }
    return [];
}

/**
 * Toggle favorito
 */
async function toggleFavorito(email, appid) {
    if (favoritesSystem) {
        return await favoritesSystem.toggleFavorite(email, appid);
    }
    return false;
}

/**
 * Verifica se jogo está favoritado
 */
function isFavorito(appid) {
    if (favoritesSystem) {
        return favoritesSystem.isFavorite(appid);
    }
    return false;
}

/**
 * Retorna lista de favoritos
 */
function getFavoritos() {
    if (favoritesSystem) {
        return favoritesSystem.getFavorites();
    }
    return [];
}
