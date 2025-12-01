
/**
 * Oculta botões de edição quando visualizando perfil de outro usuário
 */
function ocultarBotoesEdicao() {
    const botoesEdicao = document.querySelectorAll('.btn-editar-banner, .btn-editar, .btn-logout');
    botoesEdicao.forEach(btn => {
        if (btn) btn.style.display = 'none';
    });

    // Adicionar mensagem de perfil público
    const cardPerfil = document.querySelector('.card-perfil');
    if (cardPerfil) {
        const aviso = document.createElement('div');
        aviso.className = 'aviso-perfil-publico';
        aviso.innerHTML = `
            <i class="fa-solid fa-eye"></i>
            <span>Você está visualizando um perfil público</span>
            <a href="/pages/perfil.html" class="btn-voltar-perfil">Voltar para meu perfil</a>
        `;
        aviso.style.cssText = `
            background: linear-gradient(135deg, rgba(126, 48, 255, 0.2), rgba(198, 153, 255, 0.1));
            border: 2px solid #7e30ff;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.9rem;
            color: #c699ff;
        `;
        cardPerfil.insertBefore(aviso, cardPerfil.firstChild);
    }
}
