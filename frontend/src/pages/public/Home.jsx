import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    country: 'FR',
    city: '',
    postal_code: '',
    street_name: '',
    street_number: '',
    profession: '',
    gender: '',
    marital_status: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // ============================================
        // CONNEXION
        // ============================================
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (response.data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (response.data.user.status === 'PENDING') {
          navigate('/pending');
        } else {
          navigate('/dashboard');
        }
      } else {
        // ============================================
        // INSCRIPTION
        // ============================================
        if (step === 1) {
          if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
            setError('Tous les champs sont obligatoires');
            setLoading(false);
            return;
          }
          if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
          }
          setStep(2);
          setLoading(false);
          return;
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
        navigate('/pending');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full">
        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold">🏦 Warip Finance</h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte bancaire'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ========================================== */}
          {/* INSCRIPTION - ÉTAPE 1 */}
          {/* ========================================== */}
          {!isLogin && step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Prénom"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Nom"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                />
              </div>
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
                placeholder="Mot de passe (min 8 caractères)"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                onChange={handleChange}
                required
                minLength="8"
              />
            </>
          )}

          {/* ========================================== */}
          {/* INSCRIPTION - ÉTAPE 2 */}
          {/* ========================================== */}
          {!isLogin && step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="phone"
                  placeholder="Téléphone"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="Ville"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="postal_code"
                  placeholder="Code postal"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="street_name"
                  placeholder="Nom de rue"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="text"
                name="street_number"
                placeholder="Numéro de rue"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="profession"
                placeholder="Profession"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="gender"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                >
                  <option value="">Sexe</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="OTHER">Autre</option>
                </select>
                <select
                  name="marital_status"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  onChange={handleChange}
                  required
                >
                  <option value="">Situation</option>
                  <option value="SINGLE">Célibataire</option>
                  <option value="MARRIED">Marié(e)</option>
                  <option value="DIVORCED">Divorcé(e)</option>
                  <option value="WIDOWED">Veuf(ve)</option>
                  <option value="PACSED">Pacsé(e)</option>
                </select>
              </div>
            </>
          )}

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
        </form>

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

        {/* ========================================== */}
        {/* BAS CULER ENTRE CONNEXION ET INSCRIPTION */}
        {/* ========================================== */}
        <div className="text-center mt-4">
          <p className="text-gray-400">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            <button
              onClick={toggleMode}
              className="text-gold ml-2 hover:underline font-semibold"
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>

        {/* ========================================== */}
        {/* LIEN VERS ADMIN */}
        {/* ========================================== */}
        <div className="text-center mt-4">
          <a href="/admin" className="text-gray-500 text-sm hover:text-gold transition">
            🔑 Espace administrateur
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;