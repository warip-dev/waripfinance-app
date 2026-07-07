<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mot de passe oublié - Warip Finance</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #111827; }
        .gold { color: #e9b64a; }
        .bg-gold { background: #e9b64a; }
        .hover-bg-gold:hover { background: #d4a03a; }
    </style>
</head>
<body>
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold gold">🔑 Mot de passe oublié</h1>
                <p class="text-gray-400 mt-2">Saisissez votre email pour recevoir un lien de réinitialisation.</p>
            </div>

            <div id="message" class="text-sm mb-4"></div>

            <form id="forgot-form" class="space-y-4">
                <input type="email" id="email" placeholder="Email" class="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" required>

                <button type="submit" id="submit-btn" class="w-full py-3 rounded-lg font-semibold text-lg transition bg-gold text-gray-900 hover-bg-gold">
                    📧 Envoyer le lien
                </button>
            </form>

            <div class="text-center mt-4">
                <a href="/" class="text-gray-400 hover:text-yellow-500 text-sm transition">← Retour à l'accueil</a>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('forgot-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const message = document.getElementById('message');
            const btn = document.getElementById('submit-btn');

            message.innerHTML = '';
            btn.textContent = '⏳ Envoi...';
            btn.disabled = true;

            try {
                // Utiliser l'URL absolue pour l'API
                const apiUrl = window.location.origin + '/api/auth/forgot-password';
                console.log('📡 Envoi vers:', apiUrl);

                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();
                console.log('📩 Réponse:', data);

                if (res.ok) {
                    message.innerHTML = `<span style="color: #34d399;">✅ ${data.message}</span>`;
                    document.getElementById('email').value = '';
                } else {
                    message.innerHTML = `<span style="color: #f87171;">❌ ${data.error || 'Erreur'}</span>`;
                }
            } catch (err) {
                console.error('❌ Erreur:', err);
                message.innerHTML = `<span style="color: #f87171;">❌ Erreur de connexion au serveur: ${err.message}</span>`;
            } finally {
                btn.textContent = '📧 Envoyer le lien';
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>