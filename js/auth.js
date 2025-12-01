class AuthLocal {
  constructor() {
    this.usuarioAtual = localStorage.getItem('usuarioLogado');
    this.init();
  }


  init() {
    console.log('🔐 Inicializando sistema de autenticação');
    this.verificarLogin();
  }


  verificarLogin() {
    const usuario = this.getUsuarioLogado();
    console.log('👤 Usuário atual:', usuario ? usuario.nome : 'Nenhum');
    return usuario;
  }


  fazerLogin(email, senha) {
    try {
      email = email.toLowerCase().trim();
      const usuarios = this.carregarUsuarios();
      
      const usuario = Object.values(usuarios).find(u => u.email === email);
      
      if (!usuario) {
        return { sucesso: false, erro: 'Usuário não encontrado' };
      }


      if (!this.verificarSenha(senha, usuario.senha)) {
        return { sucesso: false, erro: 'Senha incorreta' };
      }


      const usuarioSessao = {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        nivel: usuario.nivel,
        avatar: usuario.avatar,
        conexoes: usuario.conexoes,
        comunidades: usuario.comunidades,
        amigos: usuario.amigos,
        bio: usuario.bio
      };


      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioSessao));
      localStorage.setItem('emailAtivo', email);
      localStorage.setItem(`usuario_${email}`, JSON.stringify(usuarioSessao));
      
      console.log('✅ Login realizado:', usuario.nome);
      return { sucesso: true, usuario: usuarioSessao };


    } catch (erro) {
      console.error('❌ Erro no login:', erro);
      return { sucesso: false, erro: erro.message };
    }
  }


  fazerCadastro(nome, email, senha) {
    try {
      email = email.toLowerCase().trim();
      const usuarios = this.carregarUsuarios();


      const existe = Object.values(usuarios).find(u => u.email === email);
      if (existe) {
        return { sucesso: false, erro: 'Email já registrado' };
      }


      const novoUsuario = {
        id: 'user_' + Date.now(),
        nome: nome.trim(),
        email: email,
        senha: this.hashSenha(senha),
        nivel: 1,
        experiencia: 0,
        avatar: this.gerarAvatarUrl(nome),
        dataCriacao: new Date().toISOString(),
        ultimoAcesso: new Date().toISOString(),
        conexoes: {
          steam: null,
          discord: null,
          spotify: null
        },
        comunidades: [],
        amigos: [],
        bio: '',
        jogosOtimistas: [],
        atividades: []
      };


      usuarios[novoUsuario.id] = novoUsuario;
      this.salvarUsuarios(usuarios);


      console.log('✅ Cadastro realizado:', nome);
      return { sucesso: true, usuario: novoUsuario };


    } catch (erro) {
      console.error('❌ Erro no cadastro:', erro);
      return { sucesso: false, erro: erro.message };
    }
  }


  fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('emailAtivo');
    console.log('🚪 Logout realizado');
    return true;
  }


  getUsuarioLogado() {
    const dados = localStorage.getItem('usuarioLogado');
    return dados ? JSON.parse(dados) : null;
  }


  hashSenha(senha) {
    let hash = 0;
    for (let i = 0; i < senha.length; i++) {
      const char = senha.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }


  verificarSenha(senha, hashArmazenado) {
    return this.hashSenha(senha) === hashArmazenado;
  }


  gerarAvatarUrl(nome) {
    const letra = nome.charAt(0).toUpperCase();
    const cores = ['7a3df5', 'a64eff', 'c699ff', '4800bd'];
    const cor = cores[Math.floor(Math.random() * cores.length)];
    return `https://ui-avatars.com/api/?name=${letra}&background=${cor}&color=fff&bold=true`;
  }


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
    localStorage.setItem('usuarios_dados', JSON.stringify(usuarios));
    console.log('💾 Usuários salvos');
  }


  atualizarPerfil(idUsuario, dados) {
    try {
      const usuarios = this.carregarUsuarios();
      if (!usuarios[idUsuario]) {
        return { sucesso: false, erro: 'Usuário não encontrado' };
      }


      usuarios[idUsuario] = {
        ...usuarios[idUsuario],
        ...dados,
        ultimoAcesso: new Date().toISOString()
      };


      this.salvarUsuarios(usuarios);


      const usuarioAtual = this.getUsuarioLogado();
      if (usuarioAtual && usuarioAtual.id === idUsuario) {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarios[idUsuario]));
        localStorage.setItem(`usuario_${usuarioAtual.email}`, JSON.stringify(usuarios[idUsuario]));
      }


      console.log('✅ Perfil atualizado');
      return { sucesso: true, usuario: usuarios[idUsuario] };


    } catch (erro) {
      console.error('❌ Erro ao atualizar perfil:', erro);
      return { sucesso: false, erro: erro.message };
    }
  }


  // ============ NOVAS FUNÇÕES PARA SINCRONIZAÇÃO ============

  /**
   * Atualizar usuário com dados do perfil (foto, bio, etc)
   * @param {Object} usuarioAtualizado - Objeto com dados do usuário
   */
  atualizarUsuario(usuarioAtualizado) {
    console.log('🔄 Atualizando usuário em auth.js...');
    
    if (!usuarioAtualizado || !usuarioAtualizado.email) {
      console.warn('❌ Usuário inválido');
      return false;
    }

    try {
      const email = usuarioAtualizado.email;
      
      // Salvar em múltiplas chaves para garantir persistência
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      localStorage.setItem(`usuario_${email}`, JSON.stringify(usuarioAtualizado));
      
      // Também atualizar no banco de usuarios_dados
      const usuarios = this.carregarUsuarios();
      const usuarioEncontrado = Object.values(usuarios).find(u => u.email === email);
      
      if (usuarioEncontrado) {
        usuarioEncontrado.nome = usuarioAtualizado.nome || usuarioEncontrado.nome;
        usuarioEncontrado.bio = usuarioAtualizado.bio || usuarioEncontrado.bio;
        usuarioEncontrado.avatar = usuarioAtualizado.avatar || usuarioEncontrado.avatar;
        this.salvarUsuarios(usuarios);
        console.log('✅ Usuário também atualizado em usuarios_dados');
      }
      
      console.log('✅ Usuário atualizado com sucesso');
      console.log('   Nome:', usuarioAtualizado.nome);
      console.log('   Bio:', usuarioAtualizado.bio);
      console.log('   Avatar: ', usuarioAtualizado.avatar ? 'SIM' : 'NÃO');
      
      return true;
    } catch (e) {
      console.error('❌ Erro ao atualizar usuário:', e);
      return false;
    }
  }

  /**
   * Recuperar usuário atualizado do localStorage
   * @param {String} email - Email do usuário
   */
  recuperarUsuarioAtualizado(email) {
    console.log('🔍 Recuperando usuário atualizado...');
    
    if (!email) {
      console.warn('❌ Email não fornecido');
      return null;
    }

    // Tentar buscar com email específico primeiro
    const chaveEspecifica = `usuario_${email}`;
    let usuarioSalvo = localStorage.getItem(chaveEspecifica);
    
    if (usuarioSalvo) {
      console.log('✅ Encontrado com chave específica:', chaveEspecifica);
      try {
        const usuario = JSON.parse(usuarioSalvo);
        console.log('   Nome:', usuario.nome);
        console.log('   Bio:', usuario.bio);
        console.log('   Avatar:', usuario.avatar ? 'SIM' : 'NÃO');
        return usuario;
      } catch (e) {
        console.warn('⚠️ Erro ao parsear:', e);
      }
    }

    // Se não, tentar chaves antigas
    usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      console.log('✅ Encontrado em usuarioLogado');
      try {
        return JSON.parse(usuarioSalvo);
      } catch (e) {
        console.warn('⚠️ Erro ao parsear:', e);
      }
    }

    console.warn('⚠️ Nenhum usuário atualizado encontrado');
    return null;
  }


  adicionarAmigo(idUsuario, idAmigo) {
    try {
      const usuarios = this.carregarUsuarios();
      
      if (!usuarios[idUsuario] || !usuarios[idAmigo]) {
        return { sucesso: false, erro: 'Usuário não encontrado' };
      }


      if (usuarios[idUsuario].amigos.includes(idAmigo)) {
        return { sucesso: false, erro: 'Já é amigo' };
      }


      usuarios[idUsuario].amigos.push(idAmigo);
      usuarios[idAmigo].amigos.push(idUsuario);
      
      this.salvarUsuarios(usuarios);
      console.log('✅ Amigo adicionado');
      return { sucesso: true };


    } catch (erro) {
      console.error('❌ Erro ao adicionar amigo:', erro);
      return { sucesso: false, erro: erro.message };
    }
  }


  removerAmigo(idUsuario, idAmigo) {
    try {
      const usuarios = this.carregarUsuarios();
      
      if (!usuarios[idUsuario] || !usuarios[idAmigo]) {
        return { sucesso: false, erro: 'Usuário não encontrado' };
      }


      usuarios[idUsuario].amigos = usuarios[idUsuario].amigos.filter(id => id !== idAmigo);
      usuarios[idAmigo].amigos = usuarios[idAmigo].amigos.filter(id => id !== idUsuario);
      
      this.salvarUsuarios(usuarios);
      console.log('✅ Amigo removido');
      return { sucesso: true };


    } catch (erro) {
      console.error('❌ Erro ao remover amigo:', erro);
      return { sucesso: false, erro: erro.message };
    }
  }


  listarAmigos(idUsuario) {
    try {
      const usuarios = this.carregarUsuarios();
      const usuario = usuarios[idUsuario];
      
      if (!usuario) return [];


      return usuario.amigos.map(idAmigo => ({
        id: idAmigo,
        nome: usuarios[idAmigo]?.nome,
        avatar: usuarios[idAmigo]?.avatar,
        nivel: usuarios[idAmigo]?.nivel,
        online: this.estaOnline(idAmigo)
      }));


    } catch (erro) {
      console.error('Erro ao listar amigos:', erro);
      return [];
    }
  }


  estaOnline(idUsuario) {
    try {
      const usuarios = this.carregarUsuarios();
      const usuario = usuarios[idUsuario];
      if (!usuario) return false;


      const ultimoAcesso = new Date(usuario.ultimoAcesso);
      const agora = new Date();
      const minutos = (agora - ultimoAcesso) / (1000 * 60);


      return minutos < 5;


    } catch (erro) {
      return false;
    }
  }


  registrarAtividade(idUsuario, tipo, dados) {
    try {
      const usuarios = this.carregarUsuarios();
      if (!usuarios[idUsuario]) return false;


      const atividade = {
        id: 'ativ_' + Date.now(),
        tipo: tipo,
        dados: dados,
        timestamp: new Date().toISOString()
      };


      usuarios[idUsuario].atividades.push(atividade);
      
      if (usuarios[idUsuario].atividades.length > 50) {
        usuarios[idUsuario].atividades = usuarios[idUsuario].atividades.slice(-50);
      }


      this.salvarUsuarios(usuarios);
      console.log('📝 Atividade registrada:', tipo);
      return true;


    } catch (erro) {
      console.error('Erro ao registrar atividade:', erro);
      return false;
    }
  }
}


const auth = new AuthLocal();
