// ================ SYNC STEAM COM AUTH ================

/**
 * Este arquivo sincroniza os dados retornados pelo Steam callback com auth.js
 * Execute APÓS o callback da Steam e ANTES de biblioteca.js
 */

class SteamSync {
  static sincronizar() {
    console.log('🔄 Sincronizando dados do Steam com auth.js...');

    // Dados salvos pelo steam-callback
    const steamId = localStorage.getItem('steamId');
    const steamUsername = localStorage.getItem('steamUsername');
    const steamAvatar = localStorage.getItem('steamAvatar');
    const bibliotecaSteam = localStorage.getItem('bibliotecaSteam');

    console.log('📦 Dados recuperados do localStorage:');
    console.log('  steamId:', steamId);
    console.log('  steamUsername:', steamUsername);
    console.log('  biblioteca:', bibliotecaSteam ? 'SIM' : 'NÃO');

    // Se tem dados do Steam
    if (steamId && steamId !== 'null' && steamId !== '') {
      console.log('✅ Dados do Steam encontrados!');

      // Atualizar usuário logado com conexão Steam
      const usuarioLogado = auth.getUsuarioLogado();

      if (usuarioLogado) {
        console.log('👤 Atualizando conexão do usuário:', usuarioLogado.nome);

        // Atualizar conexões
        if (!usuarioLogado.conexoes) {
          usuarioLogado.conexoes = {};
        }

        usuarioLogado.conexoes.steam = steamId;

        // Salvar de volta no auth
        const resultado = auth.atualizarPerfil(usuarioLogado.id, {
          conexoes: usuarioLogado.conexoes
        });

        if (resultado.sucesso) {
          console.log('✅ Conexão Steam atualizada em auth.js');
          console.log('🎮 Steam ID agora:', auth.getUsuarioLogado().conexoes.steam);

          // Limpar localStorage temporário (opcional)
          // localStorage.removeItem('steamId');
          // localStorage.removeItem('steamUsername');
        } else {
          console.error('❌ Erro ao atualizar:', resultado.erro);
        }
      } else {
        console.warn('⚠️ Nenhum usuário logado');
      }
    } else {
      console.log('ℹ️ Nenhuma conexão Steam para sincronizar');
    }

    console.log('✓ Sincronização concluída');
  }
}

// ================ AUTO-SINCRONIZAR ================

// Sincronizar automaticamente quando documento carregar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔗 DOM Carregado - Verificando sincronização Steam...');

  // Esperar um pouco para auth.js carregar
  setTimeout(() => {
    if (typeof auth !== 'undefined') {
      SteamSync.sincronizar();
    } else {
      console.warn('⚠️ auth.js não carregado ainda');
    }
  }, 100);
});
