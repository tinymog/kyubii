// ================ NAVEGAÇÃO ================

const menuIcon = document.querySelector('.ic-menu');
const navCentro = document.querySelector('.nav-centro');

if (menuIcon && navCentro) {
  menuIcon.addEventListener('click', () => {
    navCentro.classList.toggle('ativo');
  });
}

const userIcon = document.querySelector('.ic-usr');
if (userIcon) {
  userIcon.addEventListener('click', () => {
    window.location.href = "/pages/perfil.html";
  });
}

// ================ BUSCA ================

const buscaInput = document.querySelector('.busca input');
if (buscaInput) {
  buscaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      console.log('Buscar por:', buscaInput.value);
    }
  });
}

// ================ CARRINHO ================

let carrinhoInstance = null;

// Carregar carrinho do localStorage
function carregarCarrinho() {
  const saved = localStorage.getItem('carrinho');
  return saved ? JSON.parse(saved) : [];
}

// Salvar carrinho no localStorage
function salvarCarrinho(items) {
  localStorage.setItem('carrinho', JSON.stringify(items));
}

// Adicionar produto ao carrinho
function adicionarAoCarrinho(id, nome, preco) {
  let carrinho = carregarCarrinho();

  const produtoExistente = carrinho.find(item => item.id === id);

  if (produtoExistente) {
    produtoExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: id,
      nome: nome,
      preco: preco,
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarBadgeCarrinho();

  // ✅ NOVO: Disparar evento global para sincronizar em todas as páginas
  document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Atualizar badge do carrinho
function atualizarBadgeCarrinho() {
  const carrinho = carregarCarrinho();
  const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  let badge = document.querySelector('.carrinho-badge');
  if (!badge && total > 0) {
    badge = document.createElement('span');
    badge.className = 'carrinho-badge';
    document.querySelector('.nav-dir').appendChild(badge);
  }

  if (badge) {
    badge.textContent = total;
    // ✅ Usa visibility para manter flexbox
    badge.style.visibility = total > 0 ? 'visible' : 'hidden';
    badge.style.opacity = total > 0 ? '1' : '0';
  }
}

// ================ BOTÃO COMPRAR ================

const botoesComprar = document.querySelectorAll('.btn-comprar');
botoesComprar.forEach((btn, index) => {
  btn.addEventListener('click', function () {
    const card = this.closest('.produto-card');
    const nomeProduto = card.querySelector('h3').textContent;
    const precoProduto = card.querySelector('.preco').textContent;

    // Extrair preço numérico
    const preco = parseFloat(precoProduto.replace('R$', '').replace(',', '.'));
    const id = index;

    // Adicionar ao carrinho
    adicionarAoCarrinho(id, nomeProduto, preco);

    // Visual feedback
    const textOriginal = this.textContent;
    this.textContent = 'Adicionado!';
    this.style.background = 'linear-gradient(135deg, #00b869, #00d084)';

    setTimeout(() => {
      this.textContent = textOriginal;
      this.style.background = 'linear-gradient(135deg, #7a3df5, #a64eff)';
    }, 2000);
  });
});

// Atualizar badge quando página carrega
document.addEventListener('DOMContentLoaded', () => {
  atualizarBadgeCarrinho();
});