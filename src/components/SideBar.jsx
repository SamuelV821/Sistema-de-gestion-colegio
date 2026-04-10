import { useState } from 'react';

export default function SideBar({ setActiveSection, activeSection }) {
    const sections = [
        { id: 'alumnos', label: 'Alumnos', icon: '👤' },
        { id: 'profesores', label: 'Profesores', icon: '👨‍🏫' },
        { id: 'materias', label: 'Materias', icon: '📚' },
    ];

    return (
        <>
            {/* ── SIDEBAR VERTICAL (Desktop: >= 768px) ── */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col shadow-xl sticky top-0 h-screen">
                <div className="p-8 border-b border-slate-800">
                    <h1 className="text-xl font-black text-indigo-400 tracking-tighter italic">LOS PINOS</h1>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">Admin Dashboard</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                                activeSection === section.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-105' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-lg">{section.icon}</span>
                            <span className="font-bold text-sm uppercase tracking-tight">{section.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── NAVIGATION BAR INFERIOR (Mobile: < 768px) ── */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 py-1 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
                {sections.map(section => {
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex flex-col items-center justify-center flex-1 py-3 px-1 transition-all ${
                                isActive ? 'text-indigo-400' : 'text-slate-500'
                            }`}
                        >
                            <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-125 -translate-y-1' : ''}`}>
                                {section.icon}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                {section.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}