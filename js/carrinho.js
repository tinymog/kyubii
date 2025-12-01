// ================ CARRINHO DE COMPRAS ================

class Carrinho {
  constructor() {
    this.items = this.carregarDoStorage();
    this.renderizar();
    this.atualizarResumo();
  }

  carregarDoStorage() {
    const saved = localStorage.getItem('carrinho');
    return saved ? JSON.parse(saved) : [];
  }

  salvarNoStorage() {
    localStorage.setItem('carrinho', JSON.stringify(this.items));
  }

  adicionarItem(produto) {
    const itemExistente = this.items.find(item => item.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade += produto.quantidade || 1;
    } else {
      this.items.push({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: produto.quantidade || 1,
        imagem: produto.imagem
      });
    }

    this.salvarNoStorage();
    this.renderizar();
    this.atualizarResumo();
  }

  removerItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.salvarNoStorage();
    this.renderizar();
    this.atualizarResumo();
  }

  atualizarQuantidade(id, quantidade) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantidade = Math.max(1, quantidade);
      this.salvarNoStorage();
      this.renderizar();
      this.atualizarResumo();
    }
  }

  renderizar() {
    const lista = document.getElementById('carrinhoLista');

    if (this.items.length === 0) {
      lista.innerHTML = `
        <div class="carrinho-vazio">
          <i class="fa-solid fa-shopping-cart"></i>
          <p>Seu carrinho está vazio</p>
          <a href="/pages/loja.html" class="btn-continuar">Continuar Comprando</a>
        </div>
      `;
      return;
    }

    lista.innerHTML = this.items.map(item => `
      <div class="carrinho-item">
        <span class="item-nome">${item.nome}</span>
        <span class="item-preco">R$ ${item.preco.toFixed(2)}</span>
        <div class="item-quantidade">
          <button onclick="carrinho.atualizarQuantidade(${item.id}, ${item.quantidade - 1})">-</button>
          <input type="number" value="${item.quantidade}" readonly>
          <button onclick="carrinho.atualizarQuantidade(${item.id}, ${item.quantidade + 1})">+</button>
        </div>
        <span class="item-total">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        <button class="item-remover" onclick="carrinho.removerItem(${item.id})">
          <i class="fa-solid fa-trash"></i> Remover
        </button>
      </div>
    `).join('');
  }

  atualizarResumo() {
    const subtotal = this.items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const frete = subtotal > 100 ? 0 : 15;
    const desconto = subtotal >= 200 ? subtotal * 0.1 : 0;
    const total = subtotal + frete - desconto;

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('frete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`;
    document.getElementById('desconto').textContent = `-R$ ${desconto.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
  }

  irParaCheckout() {
    if (this.items.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    window.location.href = '/pages/checkout.html';
  }
}

// ================ INICIALIZAÇÃO ================

let carrinho;

document.addEventListener('DOMContentLoaded', () => {
  carrinho = new Carrinho();

  // Botão Checkout
  const btnCheckout = document.getElementById('btnCheckout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => carrinho.irParaCheckout());
  }

  // Menu Mobile
  const menuIcon = document.querySelector('.ic-menu');
  const navCentro = document.querySelector('.nav-centro');

  if (menuIcon && navCentro) {
    menuIcon.addEventListener('click', () => {
      navCentro.classList.toggle('ativo');
    });
  }

  // Usuário
  const userIcon = document.querySelector('.ic-usr');
  if (userIcon) {
    userIcon.addEventListener('click', () => {
      window.location.href = "/pages/perfil.html";
    });
  }
});

// ================ ADICIONAR AO CARRINHO (EM OUTRAS PÁGINAS) ================

function adicionarAoCarrinho(produto) {
  if (!carrinho) {
    carrinho = new Carrinho();
  }
  carrinho.adicionarItem(produto);
  alert(`${produto.nome} adicionado ao carrinho!`);
}