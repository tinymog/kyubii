/**
 * ========================================
 * 🔍 SISTEMA DE BUSCA GLOBAL - KYUBII
 * ========================================
 * 
 * Busca usuários e comunidades em tempo real
 * Exibe resultados organizados em dropdown
 * Permite navegação para perfis e comunidades
 */

class GlobalSearch {
    constructor() {
        this.debounceTimer = null;
        this.debounceDelay = 300; // ms
        this.maxResultados = 5; // por categoria
        this.init();
    }

    init() {
        console.log('🔍 Sistema de Busca Global inicializado');
        this.setupEventListeners();
    }

    /**
     * Configura event listeners para todas as barras de busca
     */
    setupEventListeners() {
        // Esperar DOM carregar
        document.addEventListener('DOMContentLoaded', () => {
            const searchInputs = document.querySelectorAll('.busca input[type="text"]');

            searchInputs.forEach(input => {
                // Adicionar ID se não tiver
                if (!input.id) {
                    input.id = 'globalSearchInput';
                }

                // Busca em tempo real com debounce
                input.addEventListener('input', (e) => {
                    this.handleSearch(e.target.value, input);
                });

                // Busca ao pressionar Enter
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        clearTimeout(this.debounceTimer);
                        this.handleSearch(e.target.value, input);
                    }
                });

                // Fechar dropdown ao perder foco
                input.addEventListener('blur', (e) => {
                    // Timeout para permitir clique nos resultados
                    setTimeout(() => {
                        this.fecharDropdown(input);
                    }, 200);
                });
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.busca')) {
                    this.fecharTodosDropdowns();
                }
            });
        });
    }

    /**
     * Handler principal de busca com debounce
     */
    handleSearch(termo, inputElement) {
        clearTimeout(this.debounceTimer);

        // Limpar se termo muito curto
        if (termo.trim().length < 2) {
            this.fecharDropdown(inputElement);
            return;
        }

        // Debounce
        this.debounceTimer = setTimeout(() => {
            this.executarBusca(termo, inputElement);
        }, this.debounceDelay);
    }

    /**
     * Executa a busca e exibe resultados
     */
    executarBusca(termo, inputElement) {
        console.log(`🔍 Buscando por: "${termo}"`);

        const usuarios = this.buscarUsuarios(termo);
        const comunidades = this.buscarComunidades(termo);

        this.renderizarResultados(usuarios, comunidades, inputElement);
    }

    /**
     * Busca usuários que correspondem ao termo
     */
    buscarUsuarios(termo) {
        try {
            const usuarios = this.carregarUsuarios();
            const termoNormalizado = this.normalizarTexto(termo);

            return Object.values(usuarios)
                .filter(usuario => {
                    const nomeNormalizado = this.normalizarTexto(usuario.nome);
                    return nomeNormalizado.includes(termoNormalizado);
                })
                .map(usuario => ({
                    tipo: 'usuario',
                    id: usuario.id,
                    nome: usuario.nome,
                    avatar: usuario.avatar,
                    info: `Nível ${usuario.nivel || 1}`,
                    relevancia: this.calcularRelevancia(usuario.nome, termo)
                }))
                .sort((a, b) => b.relevancia - a.relevancia)
                .slice(0, this.maxResultados);

        } catch (erro) {
            console.error('Erro ao buscar usuários:', erro);
            return [];
        }
    }

    /**
     * Busca comunidades que correspondem ao termo
     */
    buscarComunidades(termo) {
        try {
            const comunidades = this.carregarComunidades();
            const termoNormalizado = this.normalizarTexto(termo);

            return comunidades
                .filter(comunidade => {
                    const nomeNormalizado = this.normalizarTexto(comunidade.nome);
                    return nomeNormalizado.includes(termoNormalizado);
                })
                .map(comunidade => ({
                    tipo: 'comunidade',
                    id: comunidade.id,
                    nome: comunidade.nome,
                    avatar: comunidade.imagemUrl,
                    info: `${comunidade.membros?.length || 0} membros`,
                    relevancia: this.calcularRelevancia(comunidade.nome, termo)
                }))
                .sort((a, b) => b.relevancia - a.relevancia)
                .slice(0, this.maxResultados);

        } catch (erro) {
            console.error('Erro ao buscar comunidades:', erro);
            return [];
        }
    }

    /**
     * Normaliza texto removendo acentos e convertendo para lowercase
     */
    normalizarTexto(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    /**
     * Calcula relevância do resultado (0-100)
     */
    calcularRelevancia(nome, termo) {
        const nomeNorm = this.normalizarTexto(nome);
        const termoNorm = this.normalizarTexto(termo);

        // Correspondência exata = 100
        if (nomeNorm === termoNorm) return 100;

        // Começa com termo = 80
        if (nomeNorm.startsWith(termoNorm)) return 80;

        // Contém termo = 60
        if (nomeNorm.includes(termoNorm)) return 60;

        // Palavras individuais = 40
        const palavras = nomeNorm.split(' ');
        for (const palavra of palavras) {
            if (palavra.startsWith(termoNorm)) return 40;
        }

        return 20;
    }

    /**
     * Renderiza dropdown com resultados
     */
    renderizarResultados(usuarios, comunidades, inputElement) {
        // Criar ou obter dropdown
        let dropdown = this.getDropdown(inputElement);

        // Nenhum resultado
        if (usuarios.length === 0 && comunidades.length === 0) {
            dropdown.innerHTML = `
        <div class="search-empty">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>Nenhum resultado encontrado</p>
        </div>
      `;
            dropdown.classList.add('active');
            return;
        }

        // Construir HTML
        let html = '';

        // Usuários
        if (usuarios.length > 0) {
            html += `
        <div class="search-section">
          <div class="search-section-title">
            <i class="fa-solid fa-user"></i>
            Usuários (${usuarios.length})
          </div>
          ${usuarios.map(u => this.criarItemResultado(u)).join('')}
        </div>
      `;
        }

        // Comunidades
        if (comunidades.length > 0) {
            html += `
        <div class="search-section">
          <div class="search-section-title">
            <i class="fa-solid fa-users"></i>
            Comunidades (${comunidades.length})
          </div>
          ${comunidades.map(c => this.criarItemResultado(c)).join('')}
        </div>
      `;
        }

        dropdown.innerHTML = html;
        dropdown.classList.add('active');

        // Adicionar event listeners aos itens
        this.setupResultadoListeners(dropdown);
    }

    /**
     * Cria HTML para item de resultado (RESTAURADO)
     */
    criarItemResultado(item) {
        const avatarUrl = item.avatar || 'https://via.placeholder.com/80';

        return `
      <div class="search-item" data-tipo="${item.tipo}" data-id="${item.id}">
        <img src="${avatarUrl}" 
             alt="${item.nome}" 
             class="search-item-avatar"
             onerror="this.src='https://via.placeholder.com/80'">
        <div class="search-item-info">
          <div class="search-item-nome">${item.nome}</div>
          <div class="search-item-meta">${item.info}</div>
        </div>
        <i class="fa-solid fa-chevron-right search-item-arrow"></i>
      </div>
    `;
    }

    /**
     * Adiciona listeners aos itens de resultado
     */
    setupResultadoListeners(dropdown) {
        const items = dropdown.querySelectorAll('.search-item');

        items.forEach(item => {
            item.addEventListener('click', () => {
                const tipo = item.dataset.tipo;
                const id = item.dataset.id;
                this.navegarPara(tipo, id);
            });
        });
    }

    /**
     * Navega para o resultado selecionado
     */
    navegarPara(tipo, id) {
        console.log(`🔗 Navegando para ${tipo}: ${id}`);

        if (tipo === 'usuario') {
            // Verificar se é o próprio usuário logado
            const usuarioLogado = auth.getUsuarioLogado();
            if (usuarioLogado && usuarioLogado.id === id) {
                window.location.href = '/pages/perfil.html';
            } else {
                window.location.href = `/pages/perfil.html?user=${id}`;
            }
        } else if (tipo === 'comunidade') {
            window.location.href = `/pages/comunidade-detalhes.html?id=${id}`;
        }
    }

    /**
     * Obtém ou cria dropdown para o input
     */
    getDropdown(inputElement) {
        const container = inputElement.closest('.busca');
        let dropdown = container.querySelector('.search-dropdown');

        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown';
            container.appendChild(dropdown);
        }

        return dropdown;
    }

    /**
     * Fecha dropdown específico
     */
    fecharDropdown(inputElement) {
        const dropdown = this.getDropdown(inputElement);
        dropdown.classList.remove('active');
    }

    /**
     * Fecha todos os dropdowns
     */
    fecharTodosDropdowns() {
        const dropdowns = document.querySelectorAll('.search-dropdown');
        dropdowns.forEach(dd => dd.classList.remove('active'));
    }

    // ============================================
    // 💾 HELPERS DE PERSISTÊNCIA
    // ============================================

    carregarUsuarios() {
        try {
            const dados = localStorage.getItem('usuarios_dados');
            return dados ? JSON.parse(dados) : {};
        } catch (erro) {
            console.error('Erro ao carregar usuários:', erro);
            return {};
        }
    }

    carregarComunidades() {
        try {
            const dados = localStorage.getItem('comunidades_dados');
            return dados ? JSON.parse(dados) : [];
        } catch (erro) {
            console.error('Erro ao carregar comunidades:', erro);
            return [];
        }
    }
}

// Instanciar sistema globalmente
const globalSearch = new GlobalSearch();
