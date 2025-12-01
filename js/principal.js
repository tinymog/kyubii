// ================ NAVBAR MOBILE MENU ================

document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.querySelector('.ic-menu');
  const navCentro = document.querySelector('.nav-centro');
  
  if (menuIcon && navCentro) {
    // Abrir/fechar menu mobile
    menuIcon.addEventListener('click', () => {
      navCentro.classList.toggle('ativo');
      console.log('Menu mobile toggled');
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navCentro.classList.remove('ativo');
      });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        navCentro.classList.remove('ativo');
      }
    });
  }

  // ================ BUSCA ================
  const buscaInput = document.getElementById('buscaInput');
  if (buscaInput) {
    buscaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        buscarJogo(buscaInput.value);
      }
    });

    // Ícone da lupa
    document.querySelector('.busca .fa-magnifying-glass')?.addEventListener('click', () => {
      buscarJogo(buscaInput.value);
    });
  }

  function buscarJogo(termo) {
    if (!termo.trim()) {
      alert('Digite o nome de um jogo para buscar!');
      return;
    }
    console.log('Buscando:', termo);
    alert('Busca por: ' + termo + '\n(Funcionalidade em desenvolvimento)');
  }

  // ================ CAROUSEL ================
  const carousel = document.getElementById('carousel');
  let currentIndex = 0;
  let games = [];

  // Carregar jogos com desconto
  fetch('/api/games/discounted')
    .then(res => res.json())
    .then(data => {
      games = data;
      console.log(`✓ ${games.length} jogos carregados`);
      renderCarousel();
    })
    .catch(err => {
      console.error('Erro ao carregar jogos:', err);
      carousel.innerHTML = '<p style="color: #a64eff;">Erro ao carregar jogos</p>';
    });

function renderCarousel() {
  if (games.length === 0) {
    carousel.innerHTML = '<p style="color: #a64eff;">Nenhum jogo encontrado</p>';
    return;
  }

  carousel.innerHTML = games.map((game, index) => `
    <div class="card" data-index="${index}" data-app-id="${game.app_id}">
      <img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/240x200'">
      <h3>${game.name}</h3>
      <div class="info">
        <span class="tag">${game.discount}%</span>
        <span class="price">R$${(game.final_price || 0).toFixed(2)}</span>
      </div>
    </div>
  `).join('');

  updateCarouselPositions();

  // ================ CLIQUE ABRE STEAM ================
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const appId = card.dataset.appId;
      if (appId) {
        const steamUrl = `https://store.steampowered.com/app/${appId}`;
        console.log(`🎮 Abrindo Steam: ${steamUrl}`);
        window.open(steamUrl, '_blank');
      }
    });
  });
}


  function updateCarouselPositions() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.classList.remove('center', 'left', 'right', 'far-left', 'far-right');
      
      const position = (index - currentIndex + cards.length) % cards.length;
      
      if (position === 0) {
        card.classList.add('center');
      } else if (position === 1) {
        card.classList.add('right');
      } else if (position === cards.length - 1) {
        card.classList.add('left');
      } else if (position < cards.length / 2) {
        card.classList.add('far-right');
      } else {
        card.classList.add('far-left');
      }
    });
  }

  
  // Botões do carousel
  document.querySelector('.carousel-btn.prev')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + games.length) % games.length;
    updateCarouselPositions();
  });

  document.querySelector('.carousel-btn.next')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % games.length;
    updateCarouselPositions();
  });

  // Navegar com setas do teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      document.querySelector('.carousel-btn.prev')?.click();
    } else if (e.key === 'ArrowRight') {
      document.querySelector('.carousel-btn.next')?.click();
    }
  });
});
