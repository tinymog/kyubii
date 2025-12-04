// ================ BIBLIOTECA STEAM - IMAGENS CloudFlare CDN (FUNCIONA!) ================

class BibliotecaSteam {
  constructor() {
    this.jogos = [];
    this.jogosFiltrados = [];
    this.filtroAtual = 'todos';
    this.usuarioLogado = auth.getUsuarioLogado();
    this.steamId = this.usuarioLogado?.conexoes?.steam || null;

    // Checar localStorage primeiro (após conectar Steam)
    const steamIdLocalStorage = localStorage.getItem('steamId');
    if (steamIdLocalStorage && steamIdLocalStorage !== 'null') {
      this.steamId = steamIdLocalStorage;
      console.log('✓ Steam ID do localStorage:', this.steamId);
    }

    console.log('🚀 Biblioteca Steam Iniciando');
    console.log('👤 Usuário logado:', this.usuarioLogado?.nome);
    console.log('🎮 Steam ID:', this.steamId);

    this.init();
  }

  init() {
    console.log('📚 Inicializando Biblioteca Steam...');

    if (!this.usuarioLogado) {
      console.log('❌ Nenhum usuário logado');
      this.mostrarFazerLogin();
      return;
    }

    // Carregar favoritos do backend antes de tudo
    this.carregarFavoritosBackend();

    if (this.steamId && this.steamId !== 'undefined' && this.steamId !== '' && this.steamId !== 'null') {
      console.log('✓ Steam conectada. Carregando biblioteca...');
      this.carregarBibliotecaSteam();
    } else {
      console.log('❌ Steam não conectada');
      this.mostrarConectarSteam();
    }

    this.setupEventos();
  }

  async carregarFavoritosBackend() {
    if (!this.usuarioLogado || !this.usuarioLogado.email) {
      console.warn('⚠️ Email não disponível para carregar favoritos');
      return;
    }

    try {
      if (typeof favoritesSystem !== 'undefined') {
        await favoritesSystem.loadFavorites(this.usuarioLogado.email);
        console.log('✅ Favoritos carregados do backend');
      }
    } catch (erro) {
      console.warn('⚠️ Erro ao carregar favoritos:', erro);
    }
  }

  setupEventos() {
    const btnConectar = document.getElementById('btnConectarSteam');
    if (btnConectar) {
      btnConectar.addEventListener('click', () => this.conectarSteam());
    }

    const radios = document.querySelectorAll('input[name="filtro"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => this.filtrar(e.target.value));
    });

    const buscaInput = document.getElementById('buscaJogos');
    if (buscaInput) {
      buscaInput.addEventListener('input', (e) => this.buscar(e.target.value));
    }
  }

  conectarSteam() {
    console.log('🔗 Redirecionando para Steam');
    window.location.href = '/steam-login';
  }

  carregarBibliotecaSteam() {
    const loading = document.getElementById('loading');
    const steamConnect = document.getElementById('steamConnect');

    if (loading) loading.style.display = 'flex';
    if (steamConnect) steamConnect.style.display = 'none';

    console.log('📡 Chamando API: /api/steam/library/' + this.steamId);

    fetch(`/api/steam/library/${this.steamId}`)
      .then(res => {
        console.log('📊 Resposta da API:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('✓ Dados recebidos:', data.length, 'jogos');

        if (Array.isArray(data) && data.length > 0) {
          this.jogos = data.map(game => {
            const horas = Math.round((game.playtime_forever || 0) / 60);
            const horasRecentes = Math.round((game.playtime_2weeks || 0) / 60);

            // ✅ CLOUDFLARE CDN - SEM CORS BLOQUEADO
            // Tenta: library_600x900 → header → capsule
            const imagem = this.gerarURLImagemCDN(game.appid);

            console.log(`📦 ${game.name} (${game.appid}): ${horas}h | Imagem: ${imagem.substring(0, 80)}`);

            return {
              id: game.appid,
              appid: game.appid,
              nome: game.name,
              name: game.name,
              imagem: imagem,
              horas: horas,
              horasRecentes: horasRecentes,
              playtime_forever: game.playtime_forever || 0,
              playtime_2weeks: game.playtime_2weeks || 0,
            };
          });

          console.log(`✓ ${this.jogos.length} jogos carregados`);
          this.salvarBiblioteca();

          if (loading) loading.style.display = 'none';
          this.renderizarBiblioteca();
        } else {
          console.warn('⚠️ Biblioteca vazia');
          if (loading) loading.style.display = 'none';
        }
      })
      .catch(err => {
        console.error('❌ Erro:', err);
        if (loading) loading.style.display = 'none';
      });
  }

  gerarURLImagemCDN(appid) {
    // ✅ USAR CLOUDFLARE CDN (sem CORS bloqueado)
    // Prioridade: 
    // 1. library_600x900 (tamanho maior, melhor qualidade)
    // 2. header (alternativa)
    // 3. capsule_616x353 (alternativa)

    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`;
  }

  salvarBiblioteca() {
    const chave = `biblioteca_steam_${this.usuarioLogado.id}`;
    localStorage.setItem(chave, JSON.stringify(this.jogos));
    console.log('💾 Biblioteca salva');
  }

  renderizarBiblioteca() {
    console.log('🎨 Renderizando biblioteca com', this.jogos.length, 'jogos');

    const steamConnect = document.getElementById('steamConnect');
    const bibliotecaContainer = document.getElementById('bibliotecaContainer');
    const stats = document.getElementById('stats');

    if (steamConnect) steamConnect.style.display = 'none';
    if (bibliotecaContainer) bibliotecaContainer.style.display = 'block';
    if (stats) stats.style.display = 'grid';

    this.atualizarStats();
    this.filtrar('todos');
  }

  filtrar(tipo) {
    this.filtroAtual = tipo;

    if (tipo === 'todos') {
      this.jogosFiltrados = this.jogos;
    } else if (tipo === 'recent') {
      this.jogosFiltrados = this.jogos
        .filter(j => (j.horasRecentes || 0) > 0)
        .sort((a, b) => (b.horasRecentes || 0) - (a.horasRecentes || 0))
        .slice(0, 10);
    } else if (tipo === 'favoritos') {
      // Usar sistema global de favoritos se disponível
      let favoritos = [];

      if (typeof favoritesSystem !== 'undefined' && favoritesSystem.favoritos) {
        favoritos = favoritesSystem.favoritos;
      } else {
        // Fallback para localStorage
        const chave = `favoritos_${this.usuarioLogado.id}`;
        const favoritosStr = localStorage.getItem(chave);
        if (favoritosStr && favoritosStr !== 'null') {
          try {
            favoritos = JSON.parse(favoritosStr);
          } catch (e) {
            console.error('❌ Erro ao carregar favoritos:', e);
          }
        }
      }

      // Filtrar apenas jogos favoritados (converter ambos para string)
      this.jogosFiltrados = this.jogos.filter(j => {
        const jogoId = String(j.appid || j.id);
        return favoritos.some(fav => String(fav) === jogoId);
      });

      console.log('⭐ Favoritos:', favoritos.length, 'jogos | Filtrados:', this.jogosFiltrados.length);
    }

    console.log(`🔍 Filtrando: ${this.jogosFiltrados.length} jogos`);
    this.renderizarJogos();
  }

  buscar(termo) {
    this.jogosFiltrados = this.jogos.filter(j =>
      (j.nome || '').toLowerCase().includes(termo.toLowerCase())
    );
    this.renderizarJogos();
  }

  renderizarJogos() {
    const cats = {
      mais50: this.jogosFiltrados.filter(j => (j.horas || 0) > 50),
      mais20: this.jogosFiltrados.filter(j => (j.horas || 0) > 20 && (j.horas || 0) <= 50),
      menos20: this.jogosFiltrados.filter(j => (j.horas || 0) <= 20),
    };

    const c50 = document.getElementById('categoriaMais50');
    const c20 = document.getElementById('categoriaMais20');
    const cM20 = document.getElementById('categoriaMenos20');

    if (c50) c50.innerHTML = cats.mais50.map(j => this.criarCardJogo(j)).join('');
    if (c20) c20.innerHTML = cats.mais20.map(j => this.criarCardJogo(j)).join('');
    if (cM20) cM20.innerHTML = cats.menos20.map(j => this.criarCardJogo(j)).join('');

    console.log(`✓ Renderizados: ${cats.mais50.length} >50h | ${cats.mais20.length} 20-50h | ${cats.menos20.length} <20h`);
  }

  criarCardJogo(jogo) {
    const id = jogo.id || jogo.appid;
    const nome = jogo.nome || jogo.name || 'Unknown';
    const imagem = jogo.imagem;
    const horas = jogo.horas || 0;

    // Verificar se está nos favoritos usando sistema global
    let isFavorito = false;

    if (typeof favoritesSystem !== 'undefined' && favoritesSystem.favoritos) {
      isFavorito = favoritesSystem.favoritos.includes(String(id));
    } else {
      // Fallback para localStorage
      const chave = `favoritos_${this.usuarioLogado.id}`;
      const favoritosStr = localStorage.getItem(chave);
      let favoritos = [];
      if (favoritosStr && favoritosStr !== 'null') {
        try {
          favoritos = JSON.parse(favoritosStr);
          isFavorito = favoritos.includes(String(id)) || favoritos.includes(id);
        } catch (e) {
          console.warn('⚠️ Erro ao ler favoritos:', e);
        }
      }
    }

    return `
  <div class="jogo-card" data-jogo-id="${id}" style="position: relative; cursor: pointer;" onclick="window.open('https://store.steampowered.com/app/${id}', '_blank')">
        <button 
          onclick="event.stopPropagation(); toggleFavoritoBiblioteca('${id}'); return false;" 
          class="btn-favoritar ${isFavorito ? 'favoritado' : ''}"
          id="fav-lib-${id}"
          style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: ${isFavorito ? 'rgba(126, 48, 255, 0.5)' : 'rgba(0, 0, 0, 0.7)'};
            border: 2px solid ${isFavorito ? '#ffd700' : '#7e30ff'};
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.1rem;
            z-index: 10;
            transition: all 0.3s ease;
          "
        >
          ${isFavorito ? '⭐' : '☆'}
        </button>
        <img src="${imagem}" alt="${nome}" class="jogo-imagem" loading="lazy">
        <div class="jogo-info">
          <div class="jogo-nome">${nome}</div>
          <div class="jogo-horas">⏱️ ${horas}h</div>
        </div>
      </div>
    `;
  }

  atualizarStats() {
    const totalJogos = this.jogos.length;
    const horasTotais = this.jogos.reduce((sum, j) => sum + (j.horas || 0), 0);
    const jogoMaisJogado = this.jogos.reduce((max, j) => (j.horas || 0) > (max.horas || 0) ? j : max, {});
    const tempoMedio = totalJogos > 0 ? Math.round(horasTotais / totalJogos) : 0;

    const el1 = document.getElementById('totalJogos');
    const el2 = document.getElementById('horasTotais');
    const el3 = document.getElementById('jogoMaisJogado');
    const el4 = document.getElementById('tempoMedio');

    if (el1) el1.textContent = totalJogos;
    if (el2) el2.textContent = `${horasTotais}h`;
    if (el3) el3.textContent = jogoMaisJogado?.nome || '-';
    if (el4) el4.textContent = `${tempoMedio}h`;

    console.log(`📊 Stats: ${totalJogos} jogos | ${horasTotais}h total`);
  }

  mostrarConectarSteam() {
    const steamConnect = document.getElementById('steamConnect');
    const bibliotecaContainer = document.getElementById('bibliotecaContainer');

    if (steamConnect) steamConnect.style.display = 'block';
    if (bibliotecaContainer) bibliotecaContainer.style.display = 'none';
  }

  mostrarFazerLogin() {
    const loginRequired = document.getElementById('loginRequired');
    const steamConnect = document.getElementById('steamConnect');
    const bibliotecaContainer = document.getElementById('bibliotecaContainer');

    if (loginRequired) loginRequired.style.display = 'block';
    if (steamConnect) steamConnect.style.display = 'none';
    if (bibliotecaContainer) bibliotecaContainer.style.display = 'none';
  }
}

// Função global para toggle de favoritos na biblioteca
window.toggleFavoritoBiblioteca = async function (appid) {
  const usuario = auth.getUsuarioLogado();
  if (!usuario || !usuario.email) {
    console.warn('⚠️ Usuário não logado');
    return;
  }

  // Usar sistema global de favoritos
  if (typeof favoritesSystem !== 'undefined') {
    const added = await favoritesSystem.toggleFavorite(usuario.email, appid);

    // Atualizar visual do botão
    const btn = document.getElementById(`fav-lib-${appid}`);
    if (btn) {
      btn.innerHTML = added ? '⭐' : '☆';
      btn.style.background = added ? 'rgba(126, 48, 255, 0.5)' : 'rgba(0, 0, 0, 0.7)';
      btn.style.borderColor = added ? '#ffd700' : '#7e30ff';
      btn.classList.toggle('favoritado', added);
    }

    // Se estiver no filtro de favoritos, re-renderizar sem reload
    const radioFavoritos = document.querySelector('input[name="filtro"][value="favoritos"]');
    if (radioFavoritos && radioFavoritos.checked) {
      // Re-filtrar a biblioteca
      const bibliotecaInstance = window.bibliotecaInstance;
      if (bibliotecaInstance) {
        bibliotecaInstance.filtrar('favoritos');
      }
    }
  } else {
    // Fallback para sistema antigo
    const chave = `favoritos_${usuario.id}`;
    let favoritos = JSON.parse(localStorage.getItem(chave) || '[]');

    const index = favoritos.indexOf(appid);
    if (index >= 0) {
      favoritos.splice(index, 1);
    } else {
      favoritos.push(appid);
    }

    localStorage.setItem(chave, JSON.stringify(favoritos));

    const btn = document.getElementById(`fav-lib-${appid}`);
    if (btn) {
      const isFavorito = favoritos.includes(appid);
      btn.innerHTML = isFavorito ? '⭐' : '☆';
      btn.style.background = isFavorito ? 'rgba(126, 48, 255, 0.5)' : 'rgba(0, 0, 0, 0.7)';
      btn.style.borderColor = isFavorito ? '#ffd700' : '#7e30ff';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 DOM Carregado');
  if (typeof auth !== 'undefined') {
    const biblioteca = new BibliotecaSteam();
    window.bibliotecaInstance = biblioteca; // Guardar instância global
  } else {
    console.error('❌ auth.js não carregado');
  }
});
// Escutar atualizações globais de favoritos
document.addEventListener('favoritesUpdated', (e) => {
  const { appid, added } = e.detail;
  console.log(`🔄 Atualizando estrela na biblioteca: ${appid} -> ${added}`);

  const btn = document.getElementById(`fav-lib-${appid}`);
  if (btn) {
    btn.innerHTML = added ? '⭐' : '☆';
    btn.style.background = added ? 'rgba(126, 48, 255, 0.5)' : 'rgba(0, 0, 0, 0.7)';
    btn.style.borderColor = added ? '#ffd700' : '#7e30ff';
    btn.classList.toggle('favoritado', added);
  }

  // Se estiver no filtro de favoritos e removeu, re-renderizar
  if (!added && window.bibliotecaInstance && window.bibliotecaInstance.filtroAtual === 'favoritos') {
    window.bibliotecaInstance.filtrar('favoritos');
  }
});
