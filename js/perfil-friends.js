
// ============================================
// 🤝 SISTEMA DE AMIZADE - FUNÇÕES DE UI
// ============================================

/**
 * Carrega todas as seções do sistema de amigos
 * @param {Object} usuario - O usuário do perfil sendo visualizado
 * @param {boolean} modoVisualizacao - Se true, estamos vendo o perfil de outra pessoa
 */
function carregarAmigos(usuario, modoVisualizacao) {
    console.log('🤝 Carregando sistema de amigos para:', usuario.nome, '| Modo Visualização:', modoVisualizacao);

    // Elementos de UI
    const secaoBusca = document.querySelector('.busca-usuarios');
    const secaoRecebidas = document.querySelector('.solicitacoes-recebidas');
    const secaoEnviadas = document.querySelector('.solicitacoes-enviadas');
    const secaoLista = document.querySelector('.lista-amigos');
    const tituloLista = secaoLista ? secaoLista.querySelector('h4') : null;

    if (modoVisualizacao) {
        // MODO VISUALIZAÇÃO (Outro Usuário)
        // Ocultar seções de gerenciamento
        if (secaoBusca) secaoBusca.style.display = 'none';
        if (secaoRecebidas) secaoRecebidas.style.display = 'none';
        if (secaoEnviadas) secaoEnviadas.style.display = 'none';

        // Ajustar título da lista
        if (tituloLista) {
            tituloLista.innerHTML = `💚 Amigos de ${usuario.nome.split(' ')[0]} <span id="badge-amigos" class="badge-count">0</span>`;
        }

        // Carregar apenas lista de amigos (read-only)
        carregarListaAmigos(usuario, true);
    } else {
        // MODO PROPRIETÁRIO (Meu Perfil)
        // Mostrar tudo
        if (secaoBusca) secaoBusca.style.display = 'block';
        if (secaoRecebidas) secaoRecebidas.style.display = 'block';
        if (secaoEnviadas) secaoEnviadas.style.display = 'block';

        if (tituloLista) {
            tituloLista.innerHTML = `💚 Meus Amigos <span id="badge-amigos" class="badge-count">0</span>`;
        }

        carregarSolicitacoesRecebidas(usuario);
        carregarSolicitacoesEnviadas(usuario);
        carregarListaAmigos(usuario, false);
    }
}

/**
 * Carrega solicitações de amizade recebidas
 */
function carregarSolicitacoesRecebidas(usuario) {
    const container = document.getElementById('lista-solicitacoes-recebidas');
    const badge = document.getElementById('badge-recebidas');

    if (!container || !usuario) return;

    // Garante que estamos pegando solicitações do usuário logado
    const solicitacoes = friendsSystem.listarSolicitacoesRecebidas(usuario.id);

    // Atualizar badge
    if (badge) {
        badge.textContent = solicitacoes.length;
        badge.style.display = solicitacoes.length > 0 ? 'inline' : 'none';
    }

    if (!solicitacoes || solicitacoes.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p>📭 Nenhuma solicitação pendente</p>
            </div>
        `;
        return;
    }

    // Restaurando estrutura .card-amigo
    container.className = 'lista-cards';

    let html = '';
    solicitacoes.forEach(sol => {
        html += `
        <div class="card-amigo">
            <img src="${sol.avatar || 'https://via.placeholder.com/80'}" 
                 alt="${sol.nome}" 
                 class="avatar-amigo"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="info-amigo">
                <h5>${sol.nome}</h5>
                <p class="nivel-amigo">Nível ${sol.nivel}</p>
                ${sol.bio ? `<p class="bio-amigo">${sol.bio.substring(0, 50)}...</p>` : ''}
            </div>
            <div class="acoes-amigo">
                <button onclick="aceitarSolicitacaoAmizade('${sol.id}')" 
                        class="btn-acao btn-aceitar" title="Aceitar">
                    ✓
                </button>
                <button onclick="recusarSolicitacaoAmizade('${sol.id}')" 
                        class="btn-acao btn-recusar" title="Recusar">
                    ✕
                </button>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Carrega solicitações enviadas
 */
function carregarSolicitacoesEnviadas(usuario) {
    const container = document.getElementById('lista-solicitacoes-enviadas');
    const badge = document.getElementById('badge-enviadas');

    if (!container || !usuario) return;

    const solicitacoes = friendsSystem.listarSolicitacoesEnviadas(usuario.id);

    // Atualizar badge
    if (badge) {
        badge.textContent = solicitacoes.length;
        badge.style.display = solicitacoes.length > 0 ? 'inline' : 'none';
    }

    if (!solicitacoes || solicitacoes.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p>📭 Nenhuma solicitação enviada</p>
            </div>
        `;
        return;
    }

    container.className = 'lista-cards';

    let html = '';
    solicitacoes.forEach(sol => {
        html += `
        <div class="card-amigo">
            <img src="${sol.avatar || 'https://via.placeholder.com/80'}" 
                 alt="${sol.nome}" 
                 class="avatar-amigo"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="info-amigo">
                <h5>${sol.nome}</h5>
                <p class="nivel-amigo">Nível ${sol.nivel}</p>
                ${sol.bio ? `<p class="bio-amigo">${sol.bio.substring(0, 50)}...</p>` : ''}
            </div>
            <div class="acoes-amigo">
                <button onclick="cancelarSolicitacaoAmizade('${sol.id}')" 
                        class="btn-acao btn-cancelar" title="Cancelar">
                    ❌ Cancelar
                </button>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Carrega lista de amigos confirmados
 */
function carregarListaAmigos(usuario, readOnly) {
    const container = document.getElementById('lista-amigos-confirmados');
    const badge = document.getElementById('badge-amigos');

    if (!container || !usuario) return;

    // IMPORTANTE: Usa o ID do usuário passado (seja o logado ou o visualizado)
    const amigos = friendsSystem.listarAmigos(usuario.id);

    // Atualizar badge
    if (badge) {
        badge.textContent = amigos.length;
        badge.style.display = amigos.length > 0 ? 'inline' : 'none';
    }

    if (!amigos || amigos.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p>👥 ${readOnly ? 'Este usuário ainda não tem amigos' : 'Você ainda não tem amigos'}</p>
                ${!readOnly ? `<p style="font-size: 0.9rem; color: #9d5fd4; margin-top: 10px;">
                    Use a busca acima para encontrar e adicionar amigos!
                </p>` : ''}
            </div>
        `;
        return;
    }

    container.className = 'lista-cards';

    let html = '';
    amigos.forEach(amigo => {
        const statusOnline = amigo.online ? '🟢' : '⚫';

        // Botão Ver Perfil (Estilo antigo .btn-ver-perfil)
        const btnVerPerfil = `
            <a href="/pages/perfil.html?user=${amigo.id}" class="btn-acao btn-ver-perfil" title="Ver Perfil">
                Ver Perfil
            </a>
        `;

        let acoesHtml = '';
        if (!readOnly) {
            // Meu Perfil: Ver + Remover
            acoesHtml = `
            <div class="acoes-amigo">
                ${btnVerPerfil}
                <button onclick="confirmarRemoverAmigo('${amigo.id}', '${amigo.nome}')" 
                        class="btn-acao btn-remover" title="Remover amigo">
                    Remover
                </button>
            </div>`;
        } else {
            // Outro Perfil: Apenas Ver
            acoesHtml = `
            <div class="acoes-amigo">
                ${btnVerPerfil}
            </div>`;
        }

        html += `
        <div class="card-amigo">
            <div class="status-online">${statusOnline}</div>
            <img src="${amigo.avatar || 'https://via.placeholder.com/80'}" 
                 alt="${amigo.nome}" 
                 class="avatar-amigo"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="info-amigo">
                <h5>${amigo.nome}</h5>
                <p class="nivel-amigo">Nível ${amigo.nivel} ${amigo.online ? '• Online' : ''}</p>
                ${amigo.bio ? `<p class="bio-amigo">${amigo.bio.substring(0, 50)}...</p>` : ''}
            </div>
            ${acoesHtml}
        </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Busca usuários por nome (dentro da aba amigos)
 */
function buscarUsuariosNome() {
    const input = document.getElementById('inputBuscarUsuario');
    const container = document.getElementById('resultados-busca');

    if (!input || !container) return;

    const termo = input.value.trim();

    if (termo.length < 2) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p>Digite pelo menos 2 caracteres para buscar</p>
            </div>
        `;
        return;
    }

    const usuario = auth.getUsuarioLogado();
    if (!usuario) return;

    const resultados = friendsSystem.buscarUsuarios(termo, usuario.id);

    if (!resultados || resultados.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p>❌ Nenhum usuário encontrado com "${termo}"</p>
            </div>
        `;
        return;
    }

    container.className = 'lista-cards';

    let html = '';
    resultados.forEach(user => {
        let botaoHtml = '';

        if (user.jaAmigo) {
            botaoHtml = '<span class="ja-amigo">✅ Amigo</span>';
        } else if (user.solicitacaoPendente === 'enviada') {
            botaoHtml = `
                <button onclick="cancelarSolicitacaoAmizade('${user.id}')" 
                        class="btn-acao btn-pendente">
                    ⏳ Pendente
                </button>
            `;
        } else if (user.solicitacaoPendente === 'recebida') {
            botaoHtml = `
                <button onclick="aceitarSolicitacaoAmizade('${user.id}')" 
                        class="btn-acao btn-aceitar">
                    ✓ Aceitar
                </button>
            `;
        } else {
            botaoHtml = `
                <button onclick="enviarSolicitacaoAmizade('${user.id}')" 
                        class="btn-acao btn-adicionar">
                    ➕ Adicionar
                </button>
            `;
        }

        html += `
        <div class="card-amigo resultado-busca">
            <img src="${user.avatar || 'https://via.placeholder.com/80'}" 
                 alt="${user.nome}" 
                 class="avatar-amigo"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="info-amigo">
                <h5>${user.nome}</h5>
                <p class="nivel-amigo">Nível ${user.nivel}</p>
                ${user.bio ? `<p class="bio-amigo">${user.bio.substring(0, 50)}...</p>` : ''}
            </div>
            <div class="acoes-amigo">
                ${botaoHtml}
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// 🎯 HANDLERS DE AÇÕES
// ============================================

/**
 * Envia solicitação de amizade
 */
function enviarSolicitacaoAmizade(idDestinatario) {
    const usuario = auth.getUsuarioLogado();
    if (!usuario) return;

    const resultado = friendsSystem.enviarSolicitacao(usuario.id, idDestinatario);

    if (resultado.sucesso) {
        alert('✅ ' + resultado.mensagem);
        buscarUsuariosNome(); // Atualizar resultados
    } else {
        alert('❌ ' + resultado.erro);
    }
}

/**
 * Cancela solicitação enviada
 */
function cancelarSolicitacaoAmizade(idDestinatario) {
    const usuario = auth.getUsuarioLogado();
    if (!usuario) return;

    if (!confirm('Deseja cancelar esta solicitação?')) return;

    const resultado = friendsSystem.cancelarSolicitacao(usuario.id, idDestinatario);

    if (resultado.sucesso) {
        alert('✅ ' + resultado.mensagem);
        carregarSolicitacoesEnviadas(usuario);
        // Se estiver em resultados de busca, atualizar também
        const inputBusca = document.getElementById('inputBuscarUsuario');
        if (inputBusca && inputBusca.value) {
            buscarUsuariosNome();
        }
    } else {
        alert('❌ ' + resultado.erro);
    }
}

/**
 * Aceita solicitação de amizade
 */
function aceitarSolicitacaoAmizade(idSolicitante) {
    const usuario = auth.getUsuarioLogado();
    if (!usuario) return;

    const resultado = friendsSystem.aceitarSolicitacao(usuario.id, idSolicitante);

    if (resultado.sucesso) {
        alert('✅ ' + resultado.mensagem);
        // Atualizar todas as listas
        carregarSolicitacoesRecebidas(usuario);
        carregarListaAmigos(usuario, false);
        // Atualizar sessão
        const usuarioAtualizado = auth.getUsuarioLogado();
        preencherPerfil(usuarioAtualizado);
    } else {
        alert('❌ ' + resultado.erro);
    }
}

/**
 * Recusa solicitação de amizade
 */
function recusarSolicitacaoAmizade(idSolicitante) {
    const usuario = auth.getUsuarioLogado();
    if (!usuario) return;

    if (!confirm('Deseja recusar esta solicitação?')) return;

    const resultado = friendsSystem.recusarSolicitacao(usuario.id, idSolicitante);

    if (resultado.sucesso) {
        alert('✅ ' + resultado.mensagem);
        carregarSolicitacoesRecebidas(usuario);
    } else {
        alert('❌ ' + resultado.erro);
    }
}

/**
 * Confirma e remove amigo
 */
function confirmarRemoverAmigo(idAmigo, nomeAmigo) {
    const usuario = auth.getUsuarioLogado();
    if (!usuario) return;

    if (!confirm(`Tem certeza que deseja remover ${nomeAmigo} dos seus amigos?`)) return;

    const resultado = friendsSystem.removerAmigo(usuario.id, idAmigo);

    if (resultado.sucesso) {
        alert('✅ ' + resultado.mensagem);
        carregarListaAmigos(usuario, false);
        // Atualizar sessão
        const usuarioAtualizado = auth.getUsuarioLogado();
        preencherPerfil(usuarioAtualizado);
    } else {
        alert('❌ ' + resultado.erro);
    }
}

// Permitir busca ao pressionar Enter
document.addEventListener('DOMContentLoaded', function () {
    const inputBusca = document.getElementById('inputBuscarUsuario');
    if (inputBusca) {
        inputBusca.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                buscarUsuariosNome();
            }
        });
    }
});
