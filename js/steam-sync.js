// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ STEAM-SYNC.JS - VERSÃO CORRIGIDA E FUNCIONAL ║
// ║ Sincroniza dados do Steam com auth.js ║
// ╚════════════════════════════════════════════════════════════════════════════╝

class SteamSync {

    static sincronizar() {
        console.log('🔄 Sincronizando dados do Steam com auth.js...');

        if (typeof auth === 'undefined') {
            console.warn('⚠️ auth.js não carregado ainda');
            return;
        }

        // Dados salvos pelo steam-callback
        const steamId = localStorage.getItem('steamId');
        const steamUsername = localStorage.getItem('steamUsername');
        const steamAvatar = localStorage.getItem('steamAvatar');
        const bibliotecaSteam = localStorage.getItem('bibliotecaSteam');

        console.log('📦 Dados recuperados do localStorage:');
        console.log(' steamId:', steamId);
        console.log(' steamUsername:', steamUsername);
        console.log(' biblioteca:', bibliotecaSteam ? 'SIM' : 'NÃO');

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
                usuarioLogado.steamUsername = steamUsername;
                usuarioLogado.steamAvatar = steamAvatar;

                // Salvar de volta em localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
                localStorage.setItem('usuarioAtualizado', JSON.stringify(usuarioLogado));
                localStorage.setItem(`usuario_${usuarioLogado.email}`, JSON.stringify(usuarioLogado));

                console.log('✅ Conexão Steam atualizada');
                console.log('🎮 Steam ID:', steamId);

            } else {
                console.warn('⚠️ Nenhum usuário logado');
            }
        } else {
            console.log('ℹ️ Nenhuma conexão Steam para sincronizar');
        }

        console.log('✓ Sincronização concluída');
    }

    static obterDadosSteam() {
        const steamId = localStorage.getItem('steamId');
        const steamUsername = localStorage.getItem('steamUsername');
        const steamAvatar = localStorage.getItem('steamAvatar');

        if (!steamId || steamId === 'null') {
            return null;
        }

        return {
            id: steamId,
            username: steamUsername,
            avatar: steamAvatar
        };
    }

    static obterBiblioteca() {
        const bibliotecaSteam = localStorage.getItem('bibliotecaSteam');

        if (!bibliotecaSteam || bibliotecaSteam === 'null') {
            return [];
        }

        try {
            return JSON.parse(bibliotecaSteam);
        } catch (e) {
            console.error('❌ Erro ao parsear biblioteca Steam:', e);
            return [];
        }
    }

    static desconectar() {
        console.log('🚪 Desconectando Steam...');

        if (typeof auth === 'undefined') {
            console.warn('⚠️ auth.js não carregado');
            return;
        }

        const usuarioLogado = auth.getUsuarioLogado();

        if (usuarioLogado) {
            if (!usuarioLogado.conexoes) {
                usuarioLogado.conexoes = {};
            }

            usuarioLogado.conexoes.steam = null;
            usuarioLogado.steamUsername = null;
            usuarioLogado.steamAvatar = null;

            // Atualizar localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            localStorage.setItem('usuarioAtualizado', JSON.stringify(usuarioLogado));
            localStorage.setItem(`usuario_${usuarioLogado.email}`, JSON.stringify(usuarioLogado));

            console.log('✅ Steam desconectado');
        }

        // Limpar localStorage de Steam
        localStorage.removeItem('steamId');
        localStorage.removeItem('steamUsername');
        localStorage.removeItem('steamAvatar');
        localStorage.removeItem('bibliotecaSteam');

        console.log('🗑️ Dados Steam removidos do localStorage');
    }

    static conectarSteam() {
        console.log('🔗 Iniciando conexão com Steam...');
        window.location.href = './steam-auth.html';
    }

    static atualizarAposConexao() {
        console.log('📝 Atualizando após conexão Steam...');

        // Sincronizar
        SteamSync.sincronizar();

        // Recarregar página do perfil
        setTimeout(() => {
            window.location.href = './perfil.html';
        }, 1000);
    }
}

// Auto-sincronizar quando documento carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔗 DOM Carregado - Verificando sincronização Steam...');

    setTimeout(() => {
        if (typeof auth !== 'undefined' && typeof SteamSync !== 'undefined') {
            SteamSync.sincronizar();
        } else {
            console.warn('⚠️ Dependências não carregadas');
        }
    }, 100);
});
