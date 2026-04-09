import { useState } from 'react';

export default function SideBar({setActiveSection, activeSection}) {


    const sections = [
            { id: 'alumnos', label: 'Alumnos', icon: '👤' },
            { id: 'profesores', label: 'Profesores', icon: '👨‍🏫' },
            { id: 'materias', label: 'Materias', icon: '📚' },
        ];


    return (
        <>
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">

                <div className="p-8 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-indigo-400">Los Pinos</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Admin Dashboard</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                                activeSection === section.id 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span>{section.icon}</span>
                            <span className="font-medium">{section.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

        </>
    )
    
}