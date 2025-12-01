// ================ CARREGAR CARRINHO ================

function carregarCarrinho() {
  const saved = localStorage.getItem('carrinho');
  return saved ? JSON.parse(saved) : [];
}

// ================ CALCULAR TOTAIS ================

function calcularTotais(carrinho) {
  const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  const frete = subtotal > 100 ? 0 : 15;
  const desconto = subtotal >= 200 ? subtotal * 0.1 : 0;
  const total = subtotal + frete - desconto;

  return { subtotal, frete, desconto, total };
}

// ================ RENDERIZAR RESUMO ================

function renderizarResumo() {
  const carrinho = carregarCarrinho();
  const { subtotal, frete, desconto, total } = calcularTotais(carrinho);

  const resumoProdutos = document.getElementById('resumoProdutos');
  resumoProdutos.innerHTML = carrinho.map(item => `
    <div class="resumo-produto">
      <span>${item.nome} (x${item.quantidade})</span>
      <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('resumoSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('resumoFrete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`;
  document.getElementById('resumoDesconto').textContent = `-R$ ${desconto.toFixed(2)}`;
  document.getElementById('resumoTotal').textContent = `R$ ${total.toFixed(2)}`;
}

// ================ MÉTODOS DE PAGAMENTO ================

const pagamentoRadios = document.querySelectorAll('input[name="pagamento"]');

pagamentoRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    document.getElementById('formCartao').style.display = 'none';
    document.getElementById('formPix').style.display = 'none';
    document.getElementById('formBoleto').style.display = 'none';

    if (e.target.value === 'cartao') {
      document.getElementById('formCartao').style.display = 'block';
    } else if (e.target.value === 'pix') {
      document.getElementById('formPix').style.display = 'block';
    } else if (e.target.value === 'boleto') {
      document.getElementById('formBoleto').style.display = 'block';
    }
  });
});

// ================ FORMATAÇÃO DE CARTÃO ================

const numeroCartao = document.getElementById('numeroCartao');
if (numeroCartao) {
  numeroCartao.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\\s/g, '');
    let formattedValue = value.replace(/(\\d{4})(?=\\d)/g, '$1 ');
    e.target.value = formattedValue;
  });
}

const validade = document.getElementById('validade');
if (validade) {
  validade.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });
}

const cvv = document.getElementById('cvv');
if (cvv) {
  cvv.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\\D/g, '').slice(0, 3);
  });
}

// ================ FINALIZAR COMPRA ================

const btnFinalizar = document.getElementById('btnFinalizar');

btnFinalizar.addEventListener('click', () => {
  // Validar formulário
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const telefone = document.getElementById('telefone').value;
  const cep = document.getElementById('cep').value;
  const endereco = document.getElementById('endereco').value;
  const numero = document.getElementById('numero').value;
  const cidade = document.getElementById('cidade').value;
  const estado = document.getElementById('estado').value;

  if (!nome || !email || !telefone || !cep || !endereco || !numero || !cidade || !estado) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  const pagamento = document.querySelector('input[name="pagamento"]:checked').value;

  // Validar pagamento específico
  if (pagamento === 'cartao') {
    const nomeTitular = document.getElementById('nomeTitular').value;
    const numeroCartaoVal = document.getElementById('numeroCartao').value;
    const validadeVal = document.getElementById('validade').value;
    const cvvVal = document.getElementById('cvv').value;

    if (!nomeTitular || !numeroCartaoVal || !validadeVal || !cvvVal) {
      alert('Por favor, preencha os dados do cartão!');
      return;
    }

    if (numeroCartaoVal.replace(/\\s/g, '').length !== 16) {
      alert('Número do cartão inválido!');
      return;
    }

    if (cvvVal.length !== 3) {
      alert('CVV inválido!');
      return;
    }
  }

  // Simular processamento
  const btnOriginal = btnFinalizar.textContent;
  btnFinalizar.textContent = 'Processando...';
  btnFinalizar.disabled = true;

  setTimeout(() => {
    // Mostrar modal de sucesso
    const modal = document.getElementById('modalSucesso');
    const mensagem = document.getElementById('modalMensagem');

    if (pagamento === 'pix') {
      mensagem.textContent = 'Escaneie o QR Code enviado para você!';
    } else if (pagamento === 'boleto') {
      mensagem.textContent = 'Boleto enviado para seu email. Prazo: até 3 dias úteis.';
    } else {
      mensagem.textContent = 'Compra realizada com sucesso!';
    }

    modal.classList.add('show');

    // Limpar carrinho
    localStorage.removeItem('carrinho');
  }, 1500);
});

// ================ BOTÃO OK DO MODAL ================

const btnOk = document.getElementById('btnOk');
btnOk.addEventListener('click', () => {
  window.location.href = '/pages/loja.html';
});

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

// ================ INICIALIZAR ================

document.addEventListener('DOMContentLoaded', () => {
  renderizarResumo();
});