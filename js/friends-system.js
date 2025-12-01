/**
 * ========================================
 * 🤝 SISTEMA DE AMIZADE - KYUBII
 * ========================================
 * 
 * Gerencia todas as operações relacionadas a amizades:
 * - Envio de solicitações
 * - Aceitar/Recusar pedidos
 * - Listagem de amigos
 * - Remoção de amigos
 * - Validações
 */

class FriendsSystem {
    constructor() {
        this.init();
    }

    init() {
        console.log('🤝 Sistema de Amizade inicializado');
    }

    // ============================================
    // 📤 ENVIAR SOLICITAÇÃO DE AMIZADE
    // ============================================

    /**
     * Envia uma solicitação de amizade
     * @param {String} idRemetente - ID de quem envia
     * @param {String} idDestinatario - ID de quem recebe
     * @returns {Object} { sucesso, erro?, mensagem }
     */
    enviarSolicitacao(idRemetente, idDestinatario) {
        try {
            console.log(`📤 Enviando solicitação: ${idRemetente} → ${idDestinatario}`);

            // Validar solicitação
            const validacao = this.validarSolicitacao(idRemetente, idDestinatario);
            if (!validacao.valido) {
                return { sucesso: false, erro: validacao.erro };
            }

            const usuarios = this.carregarUsuarios();

            // Adicionar à lista de enviadas do remetente
            if (!usuarios[idRemetente].solicitacoesEnviadas) {
                usuarios[idRemetente].solicitacoesEnviadas = [];
            }
            usuarios[idRemetente].solicitacoesEnviadas.push(idDestinatario);

            // Adicionar à lista de recebidas do destinatário
            if (!usuarios[idDestinatario].solicitacoesRecebidas) {
                usuarios[idDestinatario].solicitacoesRecebidas = [];
            }
            usuarios[idDestinatario].solicitacoesRecebidas.push(idRemetente);

            this.salvarUsuarios(usuarios);

            console.log('✅ Solicitação enviada com sucesso');
            return {
                sucesso: true,
                mensagem: 'Solicitação de amizade enviada!'
            };

        } catch (erro) {
            console.error('❌ Erro ao enviar solicitação:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    // ============================================
    // ❌ CANCELAR SOLICITAÇÃO ENVIADA
    // ============================================

    /**
     * Cancela uma solicitação enviada
     * @param {String} idRemetente - ID de quem enviou
     * @param {String} idDestinatario - ID de quem ia receber
     */
    cancelarSolicitacao(idRemetente, idDestinatario) {
        try {
            console.log(`❌ Cancelando solicitação: ${idRemetente} ↛ ${idDestinatario}`);

            const usuarios = this.carregarUsuarios();

            if (!usuarios[idRemetente] || !usuarios[idDestinatario]) {
                return { sucesso: false, erro: 'Usuário não encontrado' };
            }

            // Remover da lista de enviadas
            if (usuarios[idRemetente].solicitacoesEnviadas) {
                usuarios[idRemetente].solicitacoesEnviadas =
                    usuarios[idRemetente].solicitacoesEnviadas.filter(id => id !== idDestinatario);
            }

            // Remover da lista de recebidas
            if (usuarios[idDestinatario].solicitacoesRecebidas) {
                usuarios[idDestinatario].solicitacoesRecebidas =
                    usuarios[idDestinatario].solicitacoesRecebidas.filter(id => id !== idRemetente);
            }

            this.salvarUsuarios(usuarios);

            console.log('✅ Solicitação cancelada');
            return { sucesso: true, mensagem: 'Solicitação cancelada' };

        } catch (erro) {
            console.error('❌ Erro ao cancelar solicitação:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    // ============================================
    // ✅ ACEITAR SOLICITAÇÃO
    // ============================================

    /**
     * Aceita uma solicitação de amizade
     * @param {String} idUsuario - ID de quem aceita
     * @param {String} idSolicitante - ID de quem solicitou
     */
    aceitarSolicitacao(idUsuario, idSolicitante) {
        try {
            console.log(`✅ Aceitando solicitação: ${idUsuario} aceita ${idSolicitante}`);

            const usuarios = this.carregarUsuarios();

            if (!usuarios[idUsuario] || !usuarios[idSolicitante]) {
                return { sucesso: false, erro: 'Usuário não encontrado' };
            }

            // Verificar se a solicitação existe
            if (!usuarios[idUsuario].solicitacoesRecebidas?.includes(idSolicitante)) {
                return { sucesso: false, erro: 'Solicitação não encontrada' };
            }

            // Remover das listas de solicitações
            usuarios[idUsuario].solicitacoesRecebidas =
                usuarios[idUsuario].solicitacoesRecebidas.filter(id => id !== idSolicitante);

            usuarios[idSolicitante].solicitacoesEnviadas =
                usuarios[idSolicitante].solicitacoesEnviadas.filter(id => id !== idUsuario);

            // Adicionar à lista de amigos de ambos
            if (!usuarios[idUsuario].amigos) {
                usuarios[idUsuario].amigos = [];
            }
            if (!usuarios[idSolicitante].amigos) {
                usuarios[idSolicitante].amigos = [];
            }

            usuarios[idUsuario].amigos.push(idSolicitante);
            usuarios[idSolicitante].amigos.push(idUsuario);

            this.salvarUsuarios(usuarios);

            // Atualizar sessão se for o usuário logado
            this.atualizarSessao(idUsuario);

            console.log('✅ Solicitação aceita - Agora são amigos!');
            return {
                sucesso: true,
                mensagem: 'Agora vocês são amigos!'
            };

        } catch (erro) {
            console.error('❌ Erro ao aceitar solicitação:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    // ============================================
    // ❌ RECUSAR SOLICITAÇÃO
    // ============================================

    /**
     * Recusa uma solicitação de amizade
     * @param {String} idUsuario - ID de quem recusa
     * @param {String} idSolicitante - ID de quem solicitou
     */
    recusarSolicitacao(idUsuario, idSolicitante) {
        try {
            console.log(`❌ Recusando solicitação: ${idUsuario} recusa ${idSolicitante}`);

            const usuarios = this.carregarUsuarios();

            if (!usuarios[idUsuario] || !usuarios[idSolicitante]) {
                return { sucesso: false, erro: 'Usuário não encontrado' };
            }

            // Remover das listas de solicitações
            if (usuarios[idUsuario].solicitacoesRecebidas) {
                usuarios[idUsuario].solicitacoesRecebidas =
                    usuarios[idUsuario].solicitacoesRecebidas.filter(id => id !== idSolicitante);
            }

            if (usuarios[idSolicitante].solicitacoesEnviadas) {
                usuarios[idSolicitante].solicitacoesEnviadas =
                    usuarios[idSolicitante].solicitacoesEnviadas.filter(id => id !== idUsuario);
            }

            this.salvarUsuarios(usuarios);

            console.log('✅ Solicitação recusada');
            return { sucesso: true, mensagem: 'Solicitação recusada' };

        } catch (erro) {
            console.error('❌ Erro ao recusar solicitação:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    // ============================================
    // 🗑️ REMOVER AMIGO
    // ============================================

    /**
     * Remove um amigo (bidirecional)
     * @param {String} idUsuario - ID do usuário
     * @param {String} idAmigo - ID do amigo a remover
     */
    removerAmigo(idUsuario, idAmigo) {
        try {
            console.log(`🗑️ Removendo amizade: ${idUsuario} ↔️ ${idAmigo}`);

            const usuarios = this.carregarUsuarios();

            if (!usuarios[idUsuario] || !usuarios[idAmigo]) {
                return { sucesso: false, erro: 'Usuário não encontrado' };
            }

            // Remover de ambas as listas
            if (usuarios[idUsuario].amigos) {
                usuarios[idUsuario].amigos =
                    usuarios[idUsuario].amigos.filter(id => id !== idAmigo);
            }

            if (usuarios[idAmigo].amigos) {
                usuarios[idAmigo].amigos =
                    usuarios[idAmigo].amigos.filter(id => id !== idUsuario);
            }

            this.salvarUsuarios(usuarios);

            // Atualizar sessão se for o usuário logado
            this.atualizarSessao(idUsuario);

            console.log('✅ Amigo removido');
            return { sucesso: true, mensagem: 'Amigo removido' };

        } catch (erro) {
            console.error('❌ Erro ao remover amigo:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    // ============================================
    // 📋 LISTAGENS
    // ============================================

    /**
     * Lista solicitações recebidas com informações dos usuários
     */
    listarSolicitacoesRecebidas(idUsuario) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario = usuarios[idUsuario];

            if (!usuario || !usuario.solicitacoesRecebidas) {
                return [];
            }

            return usuario.solicitacoesRecebidas
                .map(idSolicitante => {
                    const solicitante = usuarios[idSolicitante];
                    if (!solicitante) return null;

                    return {
                        id: idSolicitante,
                        nome: solicitante.nome,
                        avatar: solicitante.avatar,
                        nivel: solicitante.nivel,
                        bio: solicitante.bio
                    };
                })
                .filter(s => s !== null);

        } catch (erro) {
            console.error('Erro ao listar solicitações recebidas:', erro);
            return [];
        }
    }

    /**
     * Lista solicitações enviadas com informações dos usuários
     */
    listarSolicitacoesEnviadas(idUsuario) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario = usuarios[idUsuario];

            if (!usuario || !usuario.solicitacoesEnviadas) {
                return [];
            }

            return usuario.solicitacoesEnviadas
                .map(idDestinatario => {
                    const destinatario = usuarios[idDestinatario];
                    if (!destinatario) return null;

                    return {
                        id: idDestinatario,
                        nome: destinatario.nome,
                        avatar: destinatario.avatar,
                        nivel: destinatario.nivel,
                        bio: destinatario.bio
                    };
                })
                .filter(d => d !== null);

        } catch (erro) {
            console.error('Erro ao listar solicitações enviadas:', erro);
            return [];
        }
    }

    /**
     * Lista amigos confirmados com informações
     */
    listarAmigos(idUsuario) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario = usuarios[idUsuario];

            if (!usuario || !usuario.amigos) {
                return [];
            }

            return usuario.amigos
                .map(idAmigo => {
                    const amigo = usuarios[idAmigo];
                    if (!amigo) return null;

                    return {
                        id: idAmigo,
                        nome: amigo.nome,
                        avatar: amigo.avatar,
                        nivel: amigo.nivel,
                        bio: amigo.bio,
                        online: this.estaOnline(idAmigo)
                    };
                })
                .filter(a => a !== null);

        } catch (erro) {
            console.error('Erro ao listar amigos:', erro);
            return [];
        }
    }

    /**
     * Busca usuários por nome
     */
    buscarUsuarios(termo, idUsuarioAtual) {
        try {
            const usuarios = this.carregarUsuarios();
            const termoLower = termo.toLowerCase().trim();

            return Object.values(usuarios)
                .filter(u => {
                    // Não mostrar o próprio usuário
                    if (u.id === idUsuarioAtual) return false;

                    // Buscar por nome
                    return u.nome.toLowerCase().includes(termoLower);
                })
                .map(u => ({
                    id: u.id,
                    nome: u.nome,
                    avatar: u.avatar,
                    nivel: u.nivel,
                    bio: u.bio,
                    jaAmigo: this.verificarJaSaoAmigos(idUsuarioAtual, u.id),
                    solicitacaoPendente: this.verificarSolicitacaoPendente(idUsuarioAtual, u.id)
                }))
                .slice(0, 20); // Limitar a 20 resultados

        } catch (erro) {
            console.error('Erro ao buscar usuários:', erro);
            return [];
        }
    }

    // ============================================
    // ✔️ VALIDAÇÕES E VERIFICAÇÕES
    // ============================================

    /**
     * Valida se pode enviar solicitação
     */
    validarSolicitacao(idRemetente, idDestinatario) {
        const usuarios = this.carregarUsuarios();

        // Verificar se usuários existem
        if (!usuarios[idRemetente] || !usuarios[idDestinatario]) {
            return { valido: false, erro: 'Usuário não encontrado' };
        }

        // Não pode enviar para si mesmo
        if (idRemetente === idDestinatario) {
            return { valido: false, erro: 'Você não pode adicionar a si mesmo' };
        }

        // Verificar se já são amigos
        if (this.verificarJaSaoAmigos(idRemetente, idDestinatario)) {
            return { valido: false, erro: 'Vocês já são amigos' };
        }

        // Verificar se já há solicitação pendente
        const pendente = this.verificarSolicitacaoPendente(idRemetente, idDestinatario);
        if (pendente === 'enviada') {
            return { valido: false, erro: 'Solicitação já enviada' };
        }
        if (pendente === 'recebida') {
            return { valido: false, erro: 'Este usuário já te enviou uma solicitação' };
        }

        return { valido: true };
    }

    /**
     * Verifica se dois usuários já são amigos
     */
    verificarJaSaoAmigos(id1, id2) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario1 = usuarios[id1];

            if (!usuario1 || !usuario1.amigos) return false;

            return usuario1.amigos.includes(id2);
        } catch (erro) {
            return false;
        }
    }

    /**
     * Verifica se há solicitação pendente
     * @returns {String|null} 'enviada', 'recebida', ou null
     */
    verificarSolicitacaoPendente(idUsuario, idOutro) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario = usuarios[idUsuario];

            if (!usuario) return null;

            // Verificar se enviou
            if (usuario.solicitacoesEnviadas?.includes(idOutro)) {
                return 'enviada';
            }

            // Verificar se recebeu
            if (usuario.solicitacoesRecebidas?.includes(idOutro)) {
                return 'recebida';
            }

            return null;
        } catch (erro) {
            return null;
        }
    }

    /**
     * Verifica se usuário está online (últimos 5 minutos)
     */
    estaOnline(idUsuario) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario = usuarios[idUsuario];

            if (!usuario || !usuario.ultimoAcesso) return false;

            const ultimoAcesso = new Date(usuario.ultimoAcesso);
            const agora = new Date();
            const minutos = (agora - ultimoAcesso) / (1000 * 60);

            return minutos < 5;
        } catch (erro) {
            return false;
        }
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

    salvarUsuarios(usuarios) {
        try {
            localStorage.setItem('usuarios_dados', JSON.stringify(usuarios));
            console.log('💾 Usuários salvos');
        } catch (erro) {
            console.error('Erro ao salvar usuários:', erro);
        }
    }

    atualizarSessao(idUsuario) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuarioAtualizado = usuarios[idUsuario];

            if (!usuarioAtualizado) return;

            // Atualizar localStorage do usuário logado
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
            if (usuarioLogado.id === idUsuario) {
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
            }
        } catch (erro) {
            console.error('Erro ao atualizar sessão:', erro);
        }
    }

    // ============================================
    // 📊 ESTATÍSTICAS
    // ============================================

    /**
     * Retorna estatísticas de amizade do usuário
     */
    obterEstatisticas(idUsuario) {
        try {
            const usuarios = this.carregarUsuarios();
            const usuario = usuarios[idUsuario];

            if (!usuario) return null;

            return {
                totalAmigos: usuario.amigos?.length || 0,
                solicitacoesRecebidas: usuario.solicitacoesRecebidas?.length || 0,
                solicitacoesEnviadas: usuario.solicitacoesEnviadas?.length || 0,
                amigosOnline: usuario.amigos?.filter(idAmigo => this.estaOnline(idAmigo)).length || 0
            };
        } catch (erro) {
            console.error('Erro ao obter estatísticas:', erro);
            return null;
        }
    }
}

// Instanciar sistema globalmente
const friendsSystem = new FriendsSystem();
