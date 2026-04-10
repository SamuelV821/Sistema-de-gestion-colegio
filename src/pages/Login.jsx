import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const { login, error, loading } = useAuth();
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [showPass, setShowPass]   = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8">

                {/* Logo / Header */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-900/50">
                        <span className="text-3xl">🌲</span>
                    </div>
                    <h1 className="text-3xl font-black text-white">Los Pinos</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Sistema de Gestión Escolar</p>
                </div>

                {/* Tarjeta de login */}
                <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800">
                    <h2 className="text-white font-black text-xl mb-6">Iniciar Sesión</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="usuario@lospinos.edu.ar"
                                className="w-full p-3 bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-indigo-500 focus:bg-slate-800 outline-none transition-all"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full p-3 bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-indigo-500 outline-none transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3">
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Ingresando...
                                </span>
                            ) : 'Ingresar'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-600 text-xs">
                    Ciclo 2026 · Sede Central Los Pinos
                </p>
            </div>
        </div>
    );
}