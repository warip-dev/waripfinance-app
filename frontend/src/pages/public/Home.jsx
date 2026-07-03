import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gold mb-4">Warip Finance</h1>
        <p className="text-xl text-gray-400 mb-8">La banque qui réinvente la crypto</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-8 py-3 bg-gold text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition">
            Se connecter
          </Link>
          <Link to="/register" className="px-8 py-3 border border-gold text-gold rounded-lg font-semibold hover:bg-gold hover:text-gray-900 transition">
            S'inscrire
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 p-6 rounded-2xl">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white">Sécurité maximale</h3>
            <p className="text-gray-400 text-sm">Protection de vos fonds avec authentification forte</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white">Transactions instantanées</h3>
            <p className="text-gray-400 text-sm">Envoyez et recevez des cryptos en quelques secondes</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-lg font-semibold text-white">100% mobile</h3>
            <p className="text-gray-400 text-sm">Gérez votre compte partout, tout le temps</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;