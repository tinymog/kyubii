import requests
import json
from typing import List, Dict, Optional
import time
import os
from urllib.parse import urlencode, parse_qs
from datetime import datetime
from flask import Flask, jsonify, send_file, request, render_template_string, redirect
from flask_cors import CORS
import traceback
import re
import html
import hashlib
import xml.etree.ElementTree as ET


# ================ STEAM CONFIG ================
STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
STEAM_API_KEY = "6078DE6C888938259D97D394965383C8"
STEAM_API_URL = "https://api.steampowered.com"


# ================ CRIAR PASTAS SE NÃO EXISTIREM ================
os.makedirs("pages", exist_ok=True)
os.makedirs("css", exist_ok=True)
os.makedirs("js", exist_ok=True)
os.makedirs("img", exist_ok=True)


# ================ FLASK APP ================
app = Flask(__name__, static_folder=".")
CORS(app)

@app.route("/api/status")
def status():
    return jsonify({"status": "online", "version": "discord-oauth-enabled"})


# ================ JSON FILES ================
COMUNIDADES_FILE = "comunidades.json"
POSTAGENS_FILE = "postagens.json"
USUARIOS_FILE = "usuarios.json"
ATIVIDADES_FILE = "atividades.json"
AMIGOS_FILE = "amigos.json"

# ================ PERFIL - CARREGAR/SALVAR DADOS ================
PERFIL_FILE = "perfil_dados.json"

def carregar_perfil_dados():
    try:
        with open(PERFIL_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def salvar_perfil_dados(dados):
    with open(PERFIL_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


# ================ CARREGAR/SALVAR COMUNIDADES ================
def carregar_comunidades():
    try:
        with open(COMUNIDADES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def salvar_comunidades(comunidades):
    with open(COMUNIDADES_FILE, "w", encoding="utf-8") as f:
        json.dump(comunidades, f, ensure_ascii=False, indent=2)


# ================ CARREGAR/SALVAR POSTAGENS ================
def carregar_postagens():
    try:
        with open(POSTAGENS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def salvar_postagens(postagens):
    with open(POSTAGENS_FILE, "w", encoding="utf-8") as f:
        json.dump(postagens, f, ensure_ascii=False, indent=2)


# ================ CARREGAR/SALVAR USUÁRIOS ================
def carregar_usuarios():
    try:
        with open(USUARIOS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def salvar_usuarios(usuarios):
    with open(USUARIOS_FILE, "w", encoding="utf-8") as f:
        json.dump(usuarios, f, ensure_ascii=False, indent=2)


# ================ CARREGAR/SALVAR ATIVIDADES ================
def carregar_atividades():
    try:
        with open(ATIVIDADES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def salvar_atividades(atividades):
    with open(ATIVIDADES_FILE, "w", encoding="utf-8") as f:
        json.dump(atividades, f, ensure_ascii=False, indent=2)


# ================ CARREGAR/SALVAR AMIGOS ================
def carregar_amigos():
    try:
        with open(AMIGOS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def salvar_amigos(amigos):
    with open(AMIGOS_FILE, "w", encoding="utf-8") as f:
        json.dump(amigos, f, ensure_ascii=False, indent=2)


# ================ HASH SENHA ================
def hash_senha(senha):
    return hashlib.sha256(senha.encode()).hexdigest()


# ================ DISCORD AUTHENTICATION ================
DISCORD_CLIENT_ID = "1433249939127013560"
DISCORD_CLIENT_SECRET = "IhbvXn74ysZ5BRJxyEqguZ0E4c_ZkAaY"
DISCORD_REDIRECT_URI = "http://localhost:5500/pages/perfil.html"
DISCORD_API_URL = "https://discord.com/api"

@app.route("/auth/discord/login")
def discord_login():
    """Redireciona para o OAuth2 do Discord"""
    params = {
        "client_id": DISCORD_CLIENT_ID,
        "redirect_uri": DISCORD_REDIRECT_URI,
        "response_type": "code",
        "scope": "identify",
    }
    login_url = f"{DISCORD_API_URL}/oauth2/authorize?{urlencode(params)}"
    print(f"🔗 Redirecionando para Discord: {login_url}")
    return redirect(login_url)

@app.route("/auth/discord/callback")
def discord_callback():
    """Troca o code pelo token e busca dados do usuário"""
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    try:
        # 1. Trocar code por token
        data = {
            "client_id": DISCORD_CLIENT_ID,
            "client_secret": DISCORD_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": DISCORD_REDIRECT_URI,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        
        print("🔄 Trocando code por token...")
        token_response = requests.post(
            f"{DISCORD_API_URL}/oauth2/token", 
            data=data, 
            headers=headers,
            timeout=10
        )
        token_response.raise_for_status()
        token_data = token_response.json()
        access_token = token_data.get("access_token")

        # 2. Buscar dados do usuário
        print("👤 Buscando dados do usuário...")
        user_headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(
            f"{DISCORD_API_URL}/users/@me", 
            headers=user_headers,
            timeout=10
        )
        user_response.raise_for_status()
        user_data = user_response.json()

        print(f"✅ Usuário Discord: {user_data.get('username')}")
        
        return jsonify({
            "id": user_data.get("id"),
            "username": user_data.get("username"),
            "discriminator": user_data.get("discriminator"),
            "avatar": user_data.get("avatar"),
            "global_name": user_data.get("global_name")
        })

    except Exception as e:
        print(f"❌ Erro no login Discord: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ================ STEAM AUTHENTICATION ================
@app.route("/steam-login")
def steam_login():
    return_to = "http://localhost:5500/steam-callback"
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.mode": "checkid_setup",
        "openid.return_to": return_to,
        "openid.realm": "http://localhost:5500/",
        "openid.ns.sreg": "http://openid.net/extensions/sreg/1.1",
    }
    login_url = STEAM_OPENID_URL + "?" + urlencode(params)
    print(f"Redirecionando para Steam: {login_url}")
    return redirect(login_url)


def get_steam_user_info(steam_id_64):
    try:
        params = {"key": STEAM_API_KEY, "steamids": steam_id_64, "format": "json"}

        response = requests.get(
            f"{STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v0002",
            params=params,
            timeout=10,
        )

        data = response.json()
        if data.get("response", {}).get("players"):
            return data["response"]["players"][0]

        return None

    except Exception as e:
        print(f"Erro ao buscar user info: {str(e)}")
        return None


@app.route("/steam-callback")
def steam_callback():
    try:
        print("\n=== CALLBACK STEAM ===")
        claimed_id = request.args.get("openid.claimed_id")
        if not claimed_id:
            print("❌ Não recebeu claimed_id")
            return redirect("/pages/biblioteca.html?error=no_claimed_id")

        steam_id_64 = claimed_id.split("/")[-1]
        print(f"✓ Steam ID: {steam_id_64}")

        user_info = get_steam_user_info(steam_id_64)
        username = user_info.get("personaname", "User") if user_info else "User"
        avatar = user_info.get("avatarfull", "") if user_info else ""

        print(f"✓ Usuário: {username}")
        print(f"📚 Buscando biblioteca...")
        games_data = []

        try:
            params = {
                "key": STEAM_API_KEY,
                "steamid": steam_id_64,
                "format": "json",
                "include_appinfo": True,
                "include_played_free_games": True,
            }

            response = requests.get(
                f"{STEAM_API_URL}/IPlayerService/GetOwnedGames/v1",
                params=params,
                timeout=15,
            )

            data = response.json()

            if data.get("response", {}).get("games"):
                games = data["response"]["games"]
                print(f"✓ Encontrados {len(games)} jogos!")

                for game in games:
                    app_id = game.get("appid")
                    name = game.get("name", "Unknown")
                    playtime = game.get("playtime_forever", 0)
                    playtime_2weeks = game.get("playtime_2weeks", 0)
                    icon_hash = game.get("img_icon_url", "")
                    img_url = (
                        f"https://media.steampowered.com/steamcommunity/public/images/apps/{app_id}/{icon_hash}.jpg"
                        if icon_hash
                        else ""
                    )

                    games_data.append(
                        {
                            "id": app_id,
                            "appid": app_id,
                            "nome": name,
                            "name": name,
                            "imagem": img_url,
                            "horas": round(playtime / 60) if playtime > 0 else 0,
                            "horasRecentes": (
                                round(playtime_2weeks / 60)
                                if playtime_2weeks > 0
                                else 0
                            ),
                            "playtime_forever": playtime,
                            "playtime_2weeks": playtime_2weeks,
                        }
                    )
        except Exception as e:
            print(f"⚠️ Erro ao buscar biblioteca: {str(e)}")

        games_json = json.dumps(games_data)

        html_response = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Autenticando...</title>
            <style>
                body {{ background: linear-gradient(135deg, #1d064d, #4800bd); display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Poppins; }}
                .container {{ text-align: center; }}
                .spinner {{ border: 4px solid #7a3df5; border-top: 4px solid #a64eff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }}
                h1 {{ color: white; margin: 0; }}
                p {{ color: #aaa; }}
                @keyframes spin {{ 0% {{ transform: rotate(0deg); }} 100% {{ transform: rotate(360deg); }} }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="spinner"></div>
                <h1>✓ Login realizado!</h1>
                <p>Carregando sua biblioteca...</p>
            </div>
            <script>
                try {{
                    console.log('Salvando dados no localStorage...');
                    localStorage.setItem('steamId', '{steam_id_64}');
                    localStorage.setItem('steamUsername', '{username}');
                    localStorage.setItem('steamAvatar', '{avatar}');
                    const games = {games_json};
                    localStorage.setItem('bibliotecaSteam', JSON.stringify(games));
                    console.log('✓ Steam ID salvo:', localStorage.getItem('steamId'));
                    console.log('✓ Jogos salvos:', games.length);
                    setTimeout(() => {{
                        window.location.href = '/pages/biblioteca.html';
                    }}, 500);
                }} catch (err) {{
                    console.error('Erro ao salvar localStorage:', err);
                    setTimeout(() => {{
                        window.location.href = '/pages/biblioteca.html';
                    }}, 1000);
                }}
            </script>
        </body>
        </html>
        """

        return html_response

    except Exception as e:
        print(f"❌ Erro no callback: {str(e)}")
        traceback.print_exc()
        return redirect("/pages/biblioteca.html?error=" + str(e))




@app.route("/api/steam/library/<steam_id>")
def get_steam_library(steam_id):
    try:
        print(f"Buscando biblioteca para Steam ID: {steam_id}")

        params = {
            "key": STEAM_API_KEY,
            "steamid": steam_id,
            "format": "json",
            "include_appinfo": True,
            "include_played_free_games": True,
        }

        response = requests.get(
            f"{STEAM_API_URL}/IPlayerService/GetOwnedGames/v1",
            params=params,
            timeout=15,
        )

        data = response.json()

        if data.get("response", {}).get("games"):
            games = data["response"]["games"]
            print(f"Encontrados {len(games)} jogos!")

            processed_games = []
            for game in games:
                app_id = game.get("appid")
                name = game.get("name", "Unknown")
                playtime = game.get("playtime_forever", 0)
                playtime_2weeks = game.get("playtime_2weeks", 0)

                icon_hash = game.get("img_icon_url", "")
                img_url = (
                    f"https://media.steampowered.com/steamcommunity/public/images/apps/{app_id}/{icon_hash}.jpg"
                    if icon_hash
                    else ""
                )

                processed_games.append(
                    {
                        "id": app_id,
                        "appid": app_id,
                        "nome": name,
                        "name": name,
                        "imagem": img_url,
                        "horas": round(playtime / 60) if playtime > 0 else 0,
                        "horasRecentes": (
                            round(playtime_2weeks / 60) if playtime_2weeks > 0 else 0
                        ),
                        "playtime_forever": playtime,
                        "playtime_2weeks": playtime_2weeks,
                    }
                )

            return jsonify(processed_games)
        else:
            print("Biblioteca vazia ou privada")
            return jsonify([])

    except Exception as e:
        print(f"Erro ao buscar biblioteca: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/steam/user/<steam_id>")
def get_steam_user(steam_id):
    try:
        user_info = get_steam_user_info(steam_id)
        if user_info:
            return jsonify(
                {
                    "steamid": user_info.get("steamid"),
                    "personaname": user_info.get("personaname"),
                    "profileurl": user_info.get("profileurl"),
                    "avatar": user_info.get("avatarfull"),
                    "realname": user_info.get("realname", ""),
                }
            )
        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== PARSE RSS COM EXTRAÇÃO DE IMAGENS ==========
def parse_rss_feed(feed_url: str):
    """Parse RSS feed e retorna artigos COM IMAGENS"""
    try:
        response = requests.get(feed_url, timeout=10)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        
        # Remover namespace
        for elem in root.iter():
            if '}' in elem.tag:
                elem.tag = elem.tag.split('}', 1)[1]
        
        noticias = []
        
        # Iterar sobre items do RSS
        for item in root.findall('.//item'):
            titulo = item.findtext('title', 'Sem título')
            descricao = item.findtext('description', 'Sem descrição')
            link = item.findtext('link', '#')
            pub_date = item.findtext('pubDate', datetime.now().isoformat())
            
            # Limpar HTML da descrição
            descricao = descricao.replace('<p>', '').replace('</p>', '')
            descricao = descricao.replace('<![CDATA[', '').replace(']]>', '')
            
            # ========== EXTRAIR IMAGEM ==========
            imagem = None
            
            # Tentar extrair de media:content (comum em feeds)
            media_content = item.find('media:content')
            if media_content is not None and 'url' in media_content.attrib:
                imagem = media_content.attrib['url']
            
            # Tentar extrair de image tag
            if not imagem:
                image_tag = item.find('image')
                if image_tag is not None:
                    image_url = image_tag.findtext('url')
                    if image_url:
                        imagem = image_url
            
            # Tentar extrair de enclosure (para RSS com imagens)
            if not imagem:
                enclosure = item.find('enclosure')
                if enclosure is not None and 'url' in enclosure.attrib:
                    url = enclosure.attrib['url']
                    tipo = enclosure.attrib.get('type', '')
                    if 'image' in tipo:
                        imagem = url
            
            # Tentar extrair da descrição (imagem inline em HTML)
            if not imagem:
                img_match = re.search(r'<img[^>]+src="([^"]+)"', descricao)
                if img_match:
                    imagem = img_match.group(1)
            
            # Extrair primeiro link de imagem da descrição
            if not imagem:
                urls = re.findall(r'https?://[^\s<>"]*\.(?:jpg|jpeg|png|gif|webp)', descricao)
                if urls:
                    imagem = urls[0]
            
            # ✅ SÓ ADICIONA SE CONSEGUIR IMAGEM
            if imagem:
                noticia = {
                    "titulo": titulo,
                    "descricao": descricao,
                    "link": link,
                    "data": pub_date,
                    "imagem": imagem,
                    "autor": "EUROGAMER"
                }
                
                noticias.append(noticia)
                print(f"✅ Notícia adicionada: {titulo[:50]}...")
        
        print(f"\n✅ TOTAL: {len(noticias)} notícias carregadas\n")
        return noticias[:15]
        
    except Exception as e:
        print(f"❌ Erro ao parsear RSS: {str(e)}")
        traceback.print_exc()
        return []


# ========== ROTA NOTICIAS RSS - APENAS EUROGAMER ==========
@app.route('/api/noticias')
def get_noticias():
    """
    ⚠️ EUROGAMER APENAS - NÃO ADICIONE MAIS FEEDS!
    """
    try:
        print("\n" + "="*60)
        print("🔄 CARREGANDO NOTÍCIAS DO EUROGAMER")
        print("="*60 + "\n")
        
        # ⚠️ ÚNICA FONTE: EUROGAMER
        feed_url = "https://www.eurogamer.pt/feed/news"
        
        print(f"📡 Conectando a: {feed_url}\n")
        noticias = parse_rss_feed(feed_url)
        
        if not noticias:
            print("❌ Nenhuma notícia encontrada")
            return jsonify([]), 200
        
        print(f"✅ Retornando {len(noticias)} notícias\n")
        return jsonify(noticias), 200
        
    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500


@app.route('/api/noticias/feeds', methods=['GET'])
def get_feeds_config():
    """Retorna feeds configurados"""
    return jsonify([{
        "id": "eurogamer",
        "url": "https://www.eurogamer.pt/feed/news",
        "nome": "EUROGAMER",
        "ativo": True
    }]), 200
    
    
# ================ STEAM GAMES API ================
class SteamGamesAPI:
    STEAM_STORE_URL = "https://store.steampowered.com/api/appdetails"

    def __init__(self, country_code: str = "br"):
        self.country_code = country_code
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Kyubii-Store/1.0 (+Python)"})

    def fetch_game(self, app_id: int) -> Optional[Dict]:
        try:
            params = {"appids": app_id, "cc": self.country_code, "format": "json"}

            response = self.session.get(self.STEAM_STORE_URL, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if str(app_id) not in data:
                return None

            app_data = data.get(str(app_id), {})

            if not app_data.get("success"):
                return None

            game_data = app_data.get("data")

            if not isinstance(game_data, dict):
                return None

            name = game_data.get("name", "Unknown")
            header_image = game_data.get("header_image", "")

            price_overview = game_data.get("price_overview")

            if not isinstance(price_overview, dict):
                return {
                    "app_id": app_id,
                    "name": name,
                    "image": header_image,
                    "discount": 0,
                    "final_price": 0,
                    "initial_price": 0,
                    "currency": "BRL",
                    "is_free": game_data.get("is_free", False),
                }

            discount = price_overview.get("discount_percent", 0)
            final_price = price_overview.get("final", 0)
            initial_price = price_overview.get("initial", 0)
            currency = price_overview.get("currency", "BRL")

            return {
                "app_id": app_id,
                "name": name,
                "image": header_image,
                "discount": discount,
                "final_price": final_price / 100 if final_price else 0,
                "initial_price": initial_price / 100 if initial_price else 0,
                "currency": currency,
                "is_free": game_data.get("is_free", False),
            }

        except requests.RequestException as e:
            return None
        except (KeyError, TypeError, ValueError) as e:
            return None

    def fetch_multiple_games(
        self, app_ids: List[int], delay: float = 0.3
    ) -> List[Dict]:
        games = []
        total = len(app_ids)

        for idx, app_id in enumerate(app_ids, 1):
            game = self.fetch_game(app_id)
            if game:
                games.append(game)

            if idx < total:
                time.sleep(delay)

        return games

    def get_discounted_popular_games(self, sort_by: str = "discount") -> List[Dict]:
        popular_app_ids = [
            730,
            570,
            578080,
            1091500,
            1444200,
            1599720,
            1222140,
            1455840,
            92970,
            1286900,
            1307560,
            1385540,
            1286520,
            252490,
            107410,
            386360,
            1291150,
            1702680,
            1140120,
            397340,
            359320,
            814380,
            1289110,
            211420,
            413150,
            4000,
            40970,
            41070,
            200720,
            1346110,
            1348310,
            1203220,
            1446780,
            1328080,
            322330,
            239200,
            200260,
            209650,
            1391110,
            204880,
            238010,
            1366540,
            1190560,
            1265470,
            218230,
            220200,
            1358720,
            1349230,
            1289130,
        ]

        popular_app_ids = list(dict.fromkeys(popular_app_ids))

        print(f"Buscando {len(popular_app_ids)} jogos populares...")
        games = self.fetch_multiple_games(popular_app_ids)

        discounted_games = [g for g in games if g and g.get("discount", 0) > 0]

        seen_names = set()
        unique_games = []
        for game in discounted_games:
            name = game.get("name", "").lower()
            if name not in seen_names:
                seen_names.add(name)
                unique_games.append(game)

        if sort_by == "discount":
            unique_games = sorted(
                unique_games, key=lambda x: x.get("discount", 0), reverse=True
            )
        elif sort_by == "price":
            unique_games = sorted(unique_games, key=lambda x: x.get("final_price", 0))
        else:
            unique_games = sorted(unique_games, key=lambda x: x.get("name", "").lower())

        return unique_games


steam_api = SteamGamesAPI(country_code="br")
games_cache = None
cache_time = None


# ================ ROTAS PAGES ================
@app.route("/")
def index():
    try:
        with open("pages/index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return jsonify({"error": "pages/index.html não encontrado"}), 404
    except Exception as e:
        print(f"Erro: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/<path:filename>")
def serve_static(filename):
    try:
        if filename.endswith(".css"):
            return send_file(filename, mimetype="text/css")
        elif filename.endswith(".js"):
            return send_file(filename, mimetype="application/javascript")
        else:
            return send_file(filename)
    except FileNotFoundError:
        return jsonify({"error": f"Arquivo não encontrado: {filename}"}), 404


@app.route("/api/games/discounted")
def get_discounted_games():
    global games_cache, cache_time

    try:
        sort_by = request.args.get("sort", "discount")
        current_time = time.time()

        if games_cache and cache_time and (current_time - cache_time) < 3600:
            print("Retornando do cache")
            if sort_by == "price":
                cached = sorted(games_cache, key=lambda x: x.get("final_price", 0))
            elif sort_by == "name":
                cached = sorted(games_cache, key=lambda x: x.get("name", "").lower())
            else:
                cached = games_cache
            return jsonify(cached)

        print(f"Buscando jogos populares COM DESCONTO (ordenado por {sort_by})...")
        games = steam_api.get_discounted_popular_games(sort_by=sort_by)

        games_cache = games
        cache_time = current_time

        print(f"Encontrados {len(games)} jogos em desconto")
        return jsonify(games)

    except Exception as e:
        print(f"Erro: {str(e)}")
        return jsonify({"error": str(e), "message": "Erro ao buscar jogos"}), 500


@app.route("/api/games")
@app.route("/api/games/popular")
def get_popular_games():
    global games_cache, cache_time

    try:
        sort_by = request.args.get("sort", "name")
        current_time = time.time()

        if games_cache and cache_time and (current_time - cache_time) < 3600:
            print("Retornando do cache (popular)")
            if sort_by == "discount":
                cached = sorted(
                    games_cache, key=lambda x: x.get("discount", 0), reverse=True
                )
            elif sort_by == "price":
                cached = sorted(games_cache, key=lambda x: x.get("final_price", 0))
            else:
                cached = sorted(games_cache, key=lambda x: x.get("name", "").lower())
            return jsonify(cached)

        print(f"Buscando TODOS os jogos populares (ordenado por {sort_by})...")
        games = steam_api.get_discounted_popular_games(sort_by=sort_by)

        games_cache = games
        cache_time = current_time

        print(f"Encontrados {len(games)} jogos")
        return jsonify(games)

    except Exception as e:
        print(f"Erro: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/games/<int:app_id>")
def get_game(app_id):
    try:
        game = steam_api.fetch_game(app_id)
        if game:
            return jsonify(game)
        return jsonify({"error": "Jogo não encontrado"}), 404
    except Exception as e:
        print(f"Erro: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ================ AUTENTICAÇÃO ================
@app.route("/api/auth/cadastro", methods=["POST"])
def cadastro():
    try:
        data = request.json
        email = data.get("email", "").strip().lower()
        senha = data.get("senha", "")
        nome = data.get("nome", "").strip()

        if not email or not senha or not nome:
            return jsonify({"error": "Email, senha e nome são obrigatórios"}), 400

        if len(senha) < 6:
            return jsonify({"error": "Senha deve ter pelo menos 6 caracteres"}), 400

        if "@" not in email:
            return jsonify({"error": "Email inválido"}), 400

        usuarios = carregar_usuarios()

        if email in usuarios:
            return jsonify({"error": "Email já cadastrado"}), 400

        usuarios[email] = {
            "nome": nome,
            "senha": hash_senha(senha),
            "dataCriacao": datetime.now().isoformat(),
            "avatar": "https://via.placeholder.com/100?text=" + nome.split()[0],
            "steamId": None,
            "steamUsername": None,
            "spotifyId": None,
            "spotifyUsername": None,
            "discordId": None,
            "discordUsername": None,
        }

        salvar_usuarios(usuarios)

        print(f"✓ Usuário cadastrado: {email}")

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Cadastro realizado com sucesso!",
                    "usuario": {
                        "email": email,
                        "nome": nome,
                        "avatar": usuarios[email]["avatar"],
                    },
                }
            ),
            201,
        )

    except Exception as e:
        print(f"Erro no cadastro: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email", "").strip().lower()
        senha = data.get("senha", "")

        if not email or not senha:
            return jsonify({"error": "Email e senha são obrigatórios"}), 400

        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Email ou senha incorretos"}), 401

        usuario = usuarios[email]

        if usuario["senha"] != hash_senha(senha):
            return jsonify({"error": "Email ou senha incorretos"}), 401

        print(f"✓ Login realizado: {email}")

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Login realizado com sucesso!",
                    "usuario": {
                        "email": email,
                        "nome": usuario["nome"],
                        "avatar": usuario["avatar"],
                    },
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ================ CONECTAR STEAM ================
@app.route("/api/auth/conectar-steam", methods=["POST"])
def conectar_steam():
    """Salva conexão Steam do usuário"""
    try:
        data = request.json
        email = data.get("email", "").lower()
        steam_id = data.get("steamId")
        steam_username = data.get("steamUsername")

        if not email or not steam_id:
            return jsonify({"error": "Email e Steam ID obrigatórios"}), 400

        usuarios = carregar_usuarios()
        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["steamId"] = steam_id
        usuarios[email]["steamUsername"] = steam_username
        salvar_usuarios(usuarios)

        print(f"✓ Steam conectada para {email}")

        return jsonify({"success": True, "message": "Steam conectada!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================ PERFIL - DADOS DINÂMICOS ================
# ✅ ROTA ATUALIZADA PARA EDITAR PERFIL COM FOTO
@app.route('/api/perfil/editar/<email>', methods=['POST'])
def editar_perfil(email):
    """Edita perfil com suporte a foto Base64"""
    try:
        data = request.get_json()
        
        nome = data.get('nome')
        bio = data.get('bio')
        avatar = data.get('avatar')  # ✅ Base64
        
        if not nome:
            return jsonify({'erro': 'Nome é obrigatório'}), 400
        
        print(f"✅ Editando perfil de {email}")
        print(f"   Nome: {nome}")
        print(f"   Bio: {bio}")
        if avatar:
            print(f"   Foto: Base64 ({len(avatar)} caracteres)")
        
        # ✅ SE USAR BANCO DE DADOS (MongoDB):
        # from pymongo import MongoClient
        # client = MongoClient('mongodb://localhost:27017/')
        # db = client['seu_banco']
        # 
        # update_data = {'nome': nome, 'bio': bio}
        # if avatar:
        #     update_data['avatar'] = avatar
        # 
        # db.usuarios.update_one(
        #     {'email': email},
        #     {'$set': update_data}
        # )
        
        # ✅ SE USAR ARQUIVO JSON:
        # import json
        # import os
        # 
        # arquivo = 'usuarios.json'
        # if os.path.exists(arquivo):
        #     with open(arquivo, 'r') as f:
        #         usuarios = json.load(f)
        # else:
        #     usuarios = []
        # 
        # for user in usuarios:
        #     if user['email'] == email:
        #         user['nome'] = nome
        #         user['bio'] = bio
        #         if avatar:
        #             user['avatar'] = avatar
        #         break
        # 
        # with open(arquivo, 'w') as f:
        #     json.dump(usuarios, f, indent=2)
        
        return jsonify({
            'sucesso': True,
            'message': 'Perfil atualizado!',
            'usuario': {
                'email': email,
                'nome': nome,
                'bio': bio,
                'avatar': avatar
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Erro ao editar perfil: {str(e)}")
        return jsonify({'erro': str(e)}), 500




# ================ DISCORD ROUTES ================


@app.route("/api/discord/presence/<discord_id>", methods=["GET"])
def obter_presenca_discord(discord_id):
    """Obtém a presença atual do usuário no Discord"""
    try:
        presence = {
            "status": "online",
            "activity": {
                "name": "Jogando um jogo",
                "type": "PLAYING",
                "details": "Explorando mundos",
                "state": "Em uma aventura",
            },
        }
        return jsonify(presence)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/discord/conectar", methods=["POST"])
def conectar_discord():
    """Conecta Discord ao perfil do usuário"""
    try:
        data = request.json
        email = data.get("email", "").lower()
        discord_id = data.get("discordId")
        discord_username = data.get("discordUsername")

        if not email or not discord_id:
            return jsonify({"error": "Email e Discord ID obrigatórios"}), 400

        usuarios = carregar_usuarios()
        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["discordId"] = discord_id
        usuarios[email]["discordUsername"] = discord_username
        salvar_usuarios(usuarios)

        print(f"✓ Discord conectada para {email}")
        return jsonify({"success": True, "message": "Discord conectada!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/discord/desconectar/<email>", methods=["POST"])
def desconectar_discord(email):
    """Desconecta Discord do perfil"""
    try:
        email = email.lower()
        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["discordId"] = None
        usuarios[email]["discordUsername"] = None
        salvar_usuarios(usuarios)

        print(f"✓ Discord desconectada para {email}")
        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================ SPOTIFY ROUTES ================


@app.route("/api/spotify/conectar", methods=["POST"])
def conectar_spotify():
    """Conecta Spotify ao perfil do usuário"""
    try:
        data = request.json
        email = data.get("email", "").lower()
        spotify_id = data.get("spotifyId")
        spotify_username = data.get("spotifyUsername")

        if not email or not spotify_id:
            return jsonify({"error": "Email e Spotify ID obrigatórios"}), 400

        usuarios = carregar_usuarios()
        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["spotifyId"] = spotify_id
        usuarios[email]["spotifyUsername"] = spotify_username
        salvar_usuarios(usuarios)

        print(f"✓ Spotify conectada para {email}")
        return jsonify({"success": True, "message": "Spotify conectada!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/spotify/desconectar/<email>", methods=["POST"])
def desconectar_spotify(email):
    """Desconecta Spotify do perfil"""
    try:
        email = email.lower()
        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["spotifyId"] = None
        usuarios[email]["spotifyUsername"] = None
        salvar_usuarios(usuarios)

        print(f"✓ Spotify desconectada para {email}")
        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/spotify/now-playing/<email>", methods=["GET"])
def obter_musica_atual(email):
    """Obtém a música atual sendo tocada no Spotify"""
    try:
        email = email.lower()
        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuario = usuarios[email]

        if not usuario.get("spotifyId"):
            return jsonify({"error": "Spotify não conectado"}), 400

        # Aqui você integraria com Spotify Web API
        # Por enquanto, retornaremos um placeholder
        return jsonify(
            {
                "musica": "Nome da Música",
                "artista": "Nome do Artista",
                "album": "Nome do Álbum",
                "duracao": 240,
                "progresso": 120,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================ STEAM ROUTES MELHORADAS ================


@app.route("/api/steam/conectar", methods=["POST"])
def conectar_steam_api():
    """Conecta Steam ao perfil do usuário (via API)"""
    try:
        data = request.json
        email = data.get("email", "").lower()
        steam_id = data.get("steamId")
        steam_username = data.get("steamUsername")

        if not email or not steam_id:
            return jsonify({"error": "Email e Steam ID obrigatórios"}), 400

        usuarios = carregar_usuarios()
        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["steamId"] = steam_id
        usuarios[email]["steamUsername"] = steam_username
        salvar_usuarios(usuarios)

        print(f"✓ Steam conectada para {email}")
        return jsonify({"success": True, "message": "Steam conectada!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/steam/desconectar/<email>", methods=["POST"])
def desconectar_steam_api(email):
    """Desconecta Steam do perfil"""
    try:
        email = email.lower()
        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuarios[email]["steamId"] = None
        usuarios[email]["steamUsername"] = None
        salvar_usuarios(usuarios)

        print(f"✓ Steam desconectada para {email}")
        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================ PERFIL UNIFICADA ================


@app.route("/api/perfil/completo/<email>", methods=["GET"])
def obter_perfil_completo(email):
    """Retorna perfil completo com todas as integrações"""
    try:
        email = email.lower()
        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        usuario = usuarios[email]

        # Comunidades
        comunidades = carregar_comunidades()
        comunidades_usuario = [
            {"id": c["id"], "nome": c["nome"], "membros": len(c.get("membros", []))}
            for c in comunidades
            if email in c.get("membros", [])
        ]

        # Atividades
        atividades = carregar_atividades().get(
            email, {"atividade_atual": None, "jogos_recentes": []}
        )

        # Histórico Steam
        jogos_steam = []
        if usuario.get("steamId"):
            try:
                response = requests.get(
                    f"http://localhost:5500/api/steam/library/{usuario.get('steamId')}",
                    timeout=5,
                )
                if response.status_code == 200:
                    jogos_steam = response.json()
            except:
                pass

        perfil = {
            "nome": usuario.get("nome"),
            "email": email,
            "avatar": usuario.get("avatar"),
            "dataCriacao": usuario.get("dataCriacao"),
            "bio": usuario.get("bio", ""),
            "conexoes": {
                "steam": (
                    {
                        "conectado": True,
                        "username": usuario.get("steamUsername"),
                        "id": usuario.get("steamId"),
                    }
                    if usuario.get("steamId")
                    else None
                ),
                "spotify": (
                    {
                        "conectado": True,
                        "username": usuario.get("spotifyUsername"),
                        "id": usuario.get("spotifyId"),
                    }
                    if usuario.get("spotifyId")
                    else None
                ),
                "discord": (
                    {
                        "conectado": True,
                        "username": usuario.get("discordUsername"),
                        "id": usuario.get("discordId"),
                    }
                    if usuario.get("discordId")
                    else None
                ),
            },
            "atividade_atual": atividades.get("atividade_atual"),
            "jogos_recentes": atividades.get("jogos_recentes", [])[:5],
            "historico_steam": jogos_steam[:10] if jogos_steam else [],
            "comunidades": comunidades_usuario,
        }

        return jsonify(perfil)

    except Exception as e:
        print(f"Erro ao obter perfil completo: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/perfil/atualizar/<email>", methods=["POST"])
def atualizar_perfil_completo(email):
    """Atualiza dados do perfil"""
    try:
        email = email.lower()
        data = request.json
        usuarios = carregar_usuarios()

        if email not in usuarios:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Atualizar apenas campos permitidos
        campos_permitidos = ["nome", "bio", "avatar"]
        for campo in campos_permitidos:
            if campo in data:
                usuarios[email][campo] = data[campo]

        usuarios[email]["ultimoAcesso"] = datetime.now().isoformat()
        salvar_usuarios(usuarios)

        print(f"✓ Perfil atualizado: {email}")
        return jsonify({"success": True, "usuario": usuarios[email]})

    except Exception as e:
        print(f"Erro ao atualizar perfil: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ✅ GET BANNER DO USUÁRIO
@app.route('/api/perfil/banner/<email>', methods=['GET'])
def get_perfil_banner(email):
    """Retorna o banner salvo do usuário"""
    try:
        dados = carregar_perfil_dados()
        
        if email in dados and 'banner' in dados[email]:
            return jsonify({'banner': dados[email]['banner']}), 200
        
        # Banner padrão se não existe
        return jsonify({
            'banner': 'linear-gradient(135deg, #7a3df5, #a64eff)'
        }), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


# ✅ POST SALVAR BANNER DO USUÁRIO
@app.route('/api/perfil/banner/<email>', methods=['POST'])
def update_perfil_banner(email):
    """Salva o banner do usuário"""
    try:
        data = request.get_json()
        banner = data.get('banner')
        
        if not banner:
            return jsonify({'erro': 'Banner não fornecido'}), 400
        
        dados = carregar_perfil_dados()
        
        if email not in dados:
            dados[email] = {}
        
        dados[email]['banner'] = banner
        salvar_perfil_dados(dados)
        
        print(f"✅ Banner salvo para {email}")
        return jsonify({'sucesso': True, 'message': 'Banner salvo!'}), 200
        
    except Exception as e:
        print(f"❌ Erro ao salvar banner: {str(e)}")
        return jsonify({'erro': str(e)}), 500


# ✅ POST EDITAR PERFIL (NOME, BIO, FOTO)
@app.route('/api/perfil/editar/<email>', methods=['POST'])
def update_perfil(email):
    """Edita perfil do usuário (nome, bio, foto)"""
    try:
        data = request.get_json()
        
        nome = data.get('nome')
        bio = data.get('bio')
        avatar = data.get('avatar')  # Base64
        
        if not nome:
            return jsonify({'erro': 'Nome é obrigatório'}), 400
        
        # Atualizar usuários.json
        usuarios = carregar_usuarios()
        
        if email not in usuarios:
            return jsonify({'erro': 'Usuário não encontrado'}), 404
        
        usuarios[email]['nome'] = nome
        usuarios[email]['bio'] = bio or ''
        if avatar:
            usuarios[email]['avatar'] = avatar
        
        salvar_usuarios(usuarios)
        
        # Também salvar em perfil_dados.json para persistência
        dados = carregar_perfil_dados()
        if email not in dados:
            dados[email] = {}
        
        dados[email]['nome'] = nome
        dados[email]['bio'] = bio or ''
        if avatar:
            dados[email]['avatar'] = avatar
        
        salvar_perfil_dados(dados)
        
        print(f"✅ Perfil atualizado para {email}: {nome}")
        
        return jsonify({
            'sucesso': True,
            'message': 'Perfil atualizado!',
            'usuario': {
                'email': email,
                'nome': nome,
                'bio': bio,
                'avatar': avatar
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Erro ao editar perfil: {str(e)}")
        return jsonify({'erro': str(e)}), 500


# ✅ GET PERFIL COMPLETO - INCLUINDO BANNER
@app.route('/api/perfil/completo/<email>', methods=['GET'])
def get_perfil_user(email):
    """Retorna perfil completo com banner"""
    print(f"\n🔍 [GET /api/perfil/completo/{email}]")
    
    try:
        usuarios = carregar_usuarios()
        
        if email not in usuarios:
            print(f"❌ Email {email} não encontrado")
            return jsonify({'erro': 'Usuário não encontrado'}), 404
        
        usuario = usuarios[email]
        
        # ✅ CARREGAR DADOS SALVOS
        dados_salvos = carregar_perfil_dados()
        banner_salvo = dados_salvos.get(email, {}).get('banner')
        
        print(f"📊 Dados salvos: {dados_salvos.get(email, {})}")
        print(f"🎨 Banner: {banner_salvo}")
        
        # ✅ RETORNAR PERFIL COM BANNER
        perfil = {
            'email': email,
            'nome': usuario.get('nome', 'Usuário'),
            'avatar': usuario.get('avatar', 'https://via.placeholder.com/150'),
            'bio': usuario.get('bio', ''),
            'banner': banner_salvo,  # ✅ BANNER AQUI!
            'conexoes': usuario.get('conexoes', {}),
            'jogos': usuario.get('jogos', []),
            'comunidades': usuario.get('comunidades', []),
            'atividades': usuario.get('atividades', []),
            'amigos': usuario.get('amigos', [])
        }
        
        print(f"✅ Retornando perfil: {perfil}")
        return jsonify(perfil), 200
        
    except Exception as e:
        print(f"❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'erro': str(e)}), 500


# ================ INICIAR SERVIDOR ================
if __name__ == "__main__":
    print(
        """
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ✓ Kyubii Store - Steam API Server                     ║
║     ✓ Sistema de Perfil e Integrações                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

APIs Disponíveis:
  - GET  /api/games/discounted
  - GET  /api/games/popular
  - POST /api/auth/cadastro
  - POST /api/auth/login
  - GET  /api/perfil/<email>
  - GET  /api/perfil/completo/<email>
  - POST /api/discord/conectar
  - POST /api/spotify/conectar
  - POST /api/steam/conectar
"""
    )
    app.run(debug=True, host="localhost", port=5500, use_reloader=False)
