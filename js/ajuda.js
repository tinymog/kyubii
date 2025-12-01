const ajudaButton = document.querySelector('.button-send');
if (ajudaButton) {
  ajudaButton.addEventListener('click', (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value.trim();
    const usuario = document.querySelector('input[type="text"]').value.trim();
    const mensagem = document.querySelector('.textarea').value.trim();

    if (!email || !usuario || !mensagem) {
      alert('⚠️ Por favor, preencha todos os campos antes de enviar.');
      return;
    }

    alert(`✅ Obrigado ${usuario}! Sua mensagem foi enviada com sucesso.`);
  
    document.querySelector('.textarea').value = "";
  });
}
