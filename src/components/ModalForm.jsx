import { useState } from 'react';

export default function ModalForm({ isOpen, onClose, tipo }) {
    if (!isOpen) return null;

    const titulos = {
        alumno: "Inscribir Nuevo Alumno",
        profesor: "Registrar Personal Docente",
        materia: "Crear Nueva Asignatura"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header del Modal */}
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black">{titulos[tipo]}</h2>
                        <p className="text-slate-400 text-xs uppercase font-bold mt-1">Sistema Los Pinos</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
                </div>

                {/* Formulario Dinámico */}
                <form className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nombre</label>
                        <input type="text" placeholder="..." className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                    </div>

                    {tipo === 'alumno' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">DNI</label>
                                <input type="number" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            
                            <div className="mt-4">
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Año / Grado</label>
                                <div className="relative">
                                    <select className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none appearance-none transition-all font-bold text-slate-700 cursor-pointer">
                                        <option value="" disabled selected>Seleccionar año...</option>
                                        <option value="1">1er Año</option>
                                        <option value="2">2do Año</option>
                                        <option value="3">3er Año</option>
                                        <option value="4">4to Año</option>
                                        <option value="5">5to Año</option>
                                        <option value="6">6to Año</option>
                                    </select>
                                    {/* Flechita decorativa de 125 kg */}
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                        <span className="text-xs">▼</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {tipo === 'profesor' && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Especialidad (Título)</label>
                            <input type="text" placeholder="Ej. Ing. en Sistemas" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none" />
                        </div>
                    )}



                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                            GUARDAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}