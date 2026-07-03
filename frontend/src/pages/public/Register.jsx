import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtherProfession, setShowOtherProfession] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'FR',
    city: '',
    postal_code: '',
    street_name: '',
    street_number: '',
    profession: '',
    profession_other: '',
    gender: '',
    marital_status: ''
  });

  const professionList = [
    'Agent immobilier', 'Agriculteur', 'Artiste', 'Artisan', 'Avocat',
    'Cadre dirigeant', 'Cadre supérieur', 'Commerçant', 'Comptable',
    'Consultant', 'Conseiller financier', 'Développeur', 'Dirigeant',
    'Économiste', 'Employé de bureau', 'Enseignant', 'Entrepreneur',
    'Étudiant', 'Fonctionnaire', 'Gestionnaire de patrimoine',
    'Ingénieur', 'Journaliste', 'Médecin', 'Notaire', 'Ouvrier',
    'Pharmacien', 'Profession libérale', 'Retraité', 'Sans emploi',
    'Scientifique', 'Sportif', 'Traducteur', 'Transporteur',
    'Vendeur', 'Autre'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'postal_code') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 5) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return;
    }

    if (name === 'profession') {
      setShowOtherProfession(value === 'Autre');
      setFormData({ ...formData, [name]: value, profession_other: '' });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (formData.country === 'FR' && formData.postal_code.length !== 5) {
      setError('Le code postal français doit contenir exactement 5 chiffres');
      return;
    }

    if (!formData.phone || !formData.city || !formData.postal_code || 
        !formData.street_name || !formData.street_number || !formData.gender || !formData.marital_status) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (!formData.profession) {
      setError('Veuillez sélectionner une profession');
      return;
    }

    if (formData.profession === 'Autre' && !formData.profession_other.trim()) {
      setError('Veuillez préciser votre profession');
      return;
    }

    const submitData = {
      ...formData,
      profession: formData.profession === 'Autre' ? formData.profession_other : formData.profession
    };

    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, submitData);
      setRegistrationSuccess(true);
      setTimeout(() => navigate('/pending'), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 md:p-10 rounded-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-2xl font-bold text-gold mb-4">Inscription en cours</h2>
          <div className="space-y-3 text-gray-300">
            <p className="text-lg">✅ Votre compte a été créé avec succès !</p>
            <div className="flex items-center justify-center gap-2 my-4">
              <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-400">Vérification en cours...</p>
            <p className="text-gray-400">Vous recevrez un email une fois votre inscription validée.</p>
          </div>
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-400">⏳ Redirection vers la page d'attente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 md:p-8 rounded-2xl max-w-lg w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gold text-center mb-6">
          Création de compte {step}/2
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Prénom</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Nom</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Mot de passe</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required minLength="8" />
              <p className="text-xs text-gray-500 mt-1">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre</p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
            </div>

            <button type="submit" className="w-full py-3 bg-gold text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition text-lg">
              Suivant →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Pays</label>
              <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="FR">🇫🇷 France (+33)</option>
                <option value="BE">🇧🇪 Belgique (+32)</option>
                <option value="CH">🇨🇭 Suisse (+41)</option>
                <option value="CA">🇨🇦 Canada (+1)</option>
                <option value="US">🇺🇸 États-Unis (+1)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Téléphone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="612345678" className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" required />
              <p className="text-xs text-gray-500 mt-1">Saisir uniquement les chiffres locaux (sans indicatif)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Ville</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Code postal</label>
                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="75001" className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" required maxLength="5" />
                <p className="text-xs text-gray-500 mt-1">Uniquement des chiffres</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Nom de rue</label>
              <input type="text" name="street_name" value={formData.street_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Numéro de rue</label>
              <input type="text" name="street_number" value={formData.street_number} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">Profession</label>
              <select name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required>
                <option value="">Sélectionner une profession</option>
                {professionList.map((prof) => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            {showOtherProfession && (
              <div className="animate-fade-in">
                <label className="block text-gray-300 mb-2 text-sm">Précisez votre profession</label>
                <input type="text" name="profession_other" value={formData.profession_other} onChange={handleChange} placeholder="Ex: Designer UX" className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" required />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Sexe</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required>
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Situation</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold" required>
                  <option value="">Sélectionner</option>
                  <option value="SINGLE">Célibataire</option>
                  <option value="MARRIED">Marié(e)</option>
                  <option value="DIVORCED">Divorcé(e)</option>
                  <option value="WIDOWED">Veuf(ve)</option>
                  <option value="PACSED">Pacsé(e)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition">
                ← Retour
              </button>
              <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-lg font-semibold text-lg transition ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold text-gray-900 hover:bg-yellow-500'}`}>
                {loading ? '⏳ Envoi...' : 'Valider'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-400 mt-4 text-sm">
          Déjà un compte ? <Link to="/login" className="text-gold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;