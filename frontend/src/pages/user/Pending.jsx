import React from 'react';
import { Link } from 'react-router-dom';

const Pending = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 md:p-10 rounded-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-2xl font-bold text-gold mb-4">Compte en attente de validation</h2>
        
        <div className="space-y-3 text-gray-300">
          <p className="text-lg">✅ Votre inscription a bien été enregistrée !</p>
          
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          <p className="text-gray-400">
            Vérification en cours par notre équipe...
          </p>
          <p className="text-gray-400">
            Vous recevrez un email une fois votre inscription validée.
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400">
            En attendant, vous pouvez consulter notre{' '}
            <Link to="/" className="text-gold hover:underline">
              page d'accueil
            </Link>
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Merci de votre confiance, L'équipe Warip Bank
        </p>
      </div>
    </div>
  );
};

export default Pending;