{/* ========================================== */}
{/* CONNEXION */}
{/* ========================================== */}
{isLogin && (
  <>
    <input
      type="email"
      name="email"
      placeholder="Email"
      className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
      onChange={handleChange}
      required
    />
    <input
      type="password"
      name="password"
      placeholder="Mot de passe"
      className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
      onChange={handleChange}
      required
    />
  </>
)}

{/* ========================================== */}
{/* BOUTON */}
{/* ========================================== */}
<button
  type="submit"
  disabled={loading}
  className={`w-full py-3 rounded-lg font-semibold text-lg transition ${
    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold text-gray-900 hover:bg-yellow-500'
  }`}
>
  {loading
    ? '⏳ Chargement...'
    : isLogin
    ? 'Se connecter'
    : step === 1
    ? 'Suivant →'
    : 'Créer mon compte'}
</button>

{/* ========================================== */}
{/* MOT DE PASSE OUBLIÉ - UNIQUEMENT EN CONNEXION */}
{/* ========================================== */}
{isLogin && (
  <div className="text-center mt-3">
    <a href="/forgot-password" className="text-sm text-gray-400 hover:text-gold transition">
      🔑 Mot de passe oublié ?
    </a>
  </div>
)}