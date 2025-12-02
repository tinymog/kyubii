// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ DISCORD-SYNC.JS - CONEXÃO REAL COM OAUTH2 ║
// ╚════════════════════════════════════════════════════════════════════════════╝

class DiscordSync {

    static conectarDiscord() {
        console.log('🔗 Iniciando conexão com Discord...');
        // Redireciona para a rota do backend que inicia o OAuth2
        window.location.href = 'http://localhost:5500/auth/discord/login';
    }

    static async sincronizar() {
        console.log('🔄 Verificando retorno do Discord...');

        // Verificar se tem ?code= na URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            console.log('✅ Código de autorização encontrado:', code);

            try {
                // Chamar backend para trocar code por token
                const response = await fetch(`http://localhost:5500/auth/discord/callback?code=${code}`);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                console.log('✅ Dados recebidos do backend:', data);

                // Salvar no localStorage
                localStorage.setItem('discordConnected', 'true');
                localStorage.setItem('discordId', data.id);
                localStorage.setItem('discordUsername', `${data.username}#${data.discriminator || '0000'}`);
                if (data.avatar) {
                    localStorage.setItem('discordAvatar', `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`);
                }

                // Atualizar usuário logado no auth.js
                if (typeof auth !== 'undefined') {
                    const usuario = auth.getUsuarioLogado();
                    if (usuario) {
                        if (!usuario.conexoes) usuario.conexoes = {};
                        usuario.conexoes.discord = data.id;
                        usuario.discordUsername = `${data.username}#${data.discriminator || '0000'}`;

                        auth.atualizarUsuario(usuario);
                    }
                }

                // Limpar URL
                window.history.replaceState({}, document.title, window.location.pathname);

                alert('✅ Discord conectado com sucesso!');
                window.location.reload();

            } catch (error) {
                console.error('❌ Erro ao conectar Discord:', error);
                alert('Erro ao conectar Discord: ' + error.message);
            }
        }
    }

    static desconectar() {
        console.log('🚪 Desconectando Discord...');

        localStorage.removeItem('discordConnected');
        localStorage.removeItem('discordId');
        localStorage.removeItem('discordUsername');
        localStorage.removeItem('discordAvatar');

        if (typeof auth !== 'undefined') {
            const usuario = auth.getUsuarioLogado();
            if (usuario && usuario.conexoes) {
                usuario.conexoes.discord = null;
                delete usuario.discordUsername;
                auth.atualizarUsuario(usuario);
            }
        }

        console.log('✅ Discord desconectado');
        window.location.reload();
    }
}

// Auto-executar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    DiscordSync.sincronizar();
});
