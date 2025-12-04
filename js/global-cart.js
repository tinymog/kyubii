// ================ SISTEMA GLOBAL DE CARRINHO ================
/**
 * Este arquivo gerencia o contador do carrinho em todas as páginas
 * Sincroniza com o backend e mantém consistência global
 */

class GlobalCart {
    constructor() {
        this.currentCount = 0;
        this.isUpdating = false;
        this.init();
    }

    /**
     * Inicializa o sistema de carrinho
     */
    init() {
        console.log('🛒 Iniciando sistema global de carrinho...');
        this.loadCartCount();
        this.setupEventListeners();
    }

    /**
     * Carrega o contador do carrinho (localStorage e backend)
     */
    async loadCartCount() {
        try {
            // 1. Carregar do localStorage primeiro (rápido)
            const carrinho = this.getLocalCart();
            const localCount = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

            // Atualizar UI imediatamente
            this.updateBadgeUI(localCount);
            this.currentCount = localCount;

            // 2. Verificar se há usuário logado
            const usuario = this.getLoggedUser();

            if (usuario && usuario.email) {
                // 3. Sincronizar com backend
                await this.syncWithBackend(usuario.email, localCount);
            }

        } catch (erro) {
            console.warn('⚠️ Erro ao carregar carrinho:', erro);
            // Em caso de erro, usar apenas localStorage
            const carrinho = this.getLocalCart();
            const count = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
            this.updateBadgeUI(count);
        }
    }

    /**
     * Sincroniza o contador com o backend
     * @param {string} email - Email do usuário logado
     * @param {number} localCount - Contador local
     */
    async syncWithBackend(email, localCount) {
        try {
            // Buscar contador do servidor
            const response = await fetch(`/api/cart/count?email=${encodeURIComponent(email)}`);
            const data = await response.json();
            const serverCount = data.count || 0;

            console.log(`📊 Local: ${localCount} | Servidor: ${serverCount}`);

            // Se o servidor tem um valor diferente, usar o maior (mais recente)
            if (serverCount !== localCount) {
                const finalCount = Math.max(localCount, serverCount);
                this.updateBadgeUI(finalCount);
                this.currentCount = finalCount;

                // Atualizar servidor com o valor final
                if (finalCount !== serverCount) {
                    await this.saveToBackend(email, finalCount);
                }
            }

        } catch (erro) {
            console.warn('⚠️ Erro ao sincronizar com backend:', erro);
        }
    }

    /**
     * Salva o contador no backend
     * @param {string} email - Email do usuário
     * @param {number} count - Número de itens
     */
    async saveToBackend(email, count) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    count: count
                })
            });

            if (response.ok) {
                console.log(`✅ Contador salvo no servidor: ${count}`);
            }
        } catch (erro) {
            console.warn('⚠️ Erro ao salvar no backend:', erro);
        }
    }

    /**
     * Atualiza o contador globalmente
     * Chamado quando itens são adicionados/removidos
     */
    async updateCount() {
        if (this.isUpdating) return;

        this.isUpdating = true;

        try {
            const carrinho = this.getLocalCart();
            const count = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

            this.updateBadgeUI(count);
            this.currentCount = count;

            // Sincronizar com backend se usuário estiver logado
            const usuario = this.getLoggedUser();
            if (usuario && usuario.email) {
                await this.saveToBackend(usuario.email, count);
            }

        } catch (erro) {
            console.warn('⚠️ Erro ao atualizar contador:', erro);
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Atualiza visualmente o badge do carrinho
     * @param {number} count - Número de itens
     */
    updateBadgeUI(count) {
        const badges = document.querySelectorAll('.carrinho-badge, #cartBadge');

        badges.forEach(badge => {
            if (badge) {
                badge.textContent = count;
                // ✅ Usa visibility ao invés de display para manter flexbox
                badge.style.visibility = count > 0 ? 'visible' : 'hidden';
                badge.style.opacity = count > 0 ? '1' : '0';
            }
        });

        console.log(`🔄 Badge atualizado: ${count} itens`);
    }

    /**
     * Recupera o carrinho do localStorage
     * @returns {Array} Array de itens do carrinho
     */
    getLocalCart() {
        try {
            const saved = localStorage.getItem('carrinho');
            return saved ? JSON.parse(saved) : [];
        } catch (erro) {
            console.warn('⚠️ Erro ao ler carrinho:', erro);
            return [];
        }
    }

    /**
     * Recupera o usuário logado
     * @returns {Object|null} Dados do usuário ou null
     */
    getLoggedUser() {
        try {
            const userData = localStorage.getItem('usuarioLogado');
            return userData ? JSON.parse(userData) : null;
        } catch (erro) {
            return null;
        }
    }

    /**
     * Limpa o carrinho ao fazer logout
     */
    clearCartOnLogout() {
        console.log('🚪 Limpando carrinho (logout)...');
        localStorage.removeItem('carrinho');
        this.updateBadgeUI(0);
        this.currentCount = 0;
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Listener para mudanças no localStorage (sincronização entre abas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'carrinho') {
                console.log('🔄 Carrinho atualizado em outra aba');
                this.loadCartCount();
            }
        });

        // Listener personalizado para atualizações do carrinho
        document.addEventListener('cartUpdated', () => {
            console.log('🔔 Evento cartUpdated recebido');
            this.updateCount();
        });

        // Listener para logout
        document.addEventListener('userLoggedOut', () => {
            console.log('🔔 Evento userLoggedOut recebido');
            this.clearCartOnLogout();
        });
    }

    /**
     * Força uma atualização manual
     */
    forceUpdate() {
        this.updateCount();
    }
}

// ================ INSTÂNCIA GLOBAL ================
let globalCart;

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalCart = new GlobalCart();
    });
} else {
    globalCart = new GlobalCart();
}

// ================ FUNÇÕES AUXILIARES GLOBAIS ================

/**
 * Atualiza o carrinho globalmente (chamada por outras páginas)
 */
function atualizarCarrinhoGlobal() {
    if (globalCart) {
        globalCart.forceUpdate();
    }
}

/**
 * Limpa o carrinho (para uso em logout)
 */
function limparCarrinhoGlobal() {
    if (globalCart) {
        globalCart.clearCartOnLogout();
    }
}
