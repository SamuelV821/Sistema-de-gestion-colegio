import { useState } from 'react';

export default function BimestreSelector() {
    const [bimestreActivo, setBimestreActivo] = useState(1);
    const bimestres = [1, 2, 3, 4];

    return (
        <div className="inline-flex p-1.5 bg-slate-200/50 rounded-2xl backdrop-blur-sm border border-slate-200 shadow-inner">
            {bimestres.map((num) => (
                <button
                    key={num}
                    onClick={() => setBimestreActivo(num)}
                    className={`
                        relative px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300
                        ${bimestreActivo === num 
                            ? 'bg-white text-indigo-600 shadow-md scale-105' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'
                        }
                    `}
                >
                    {/* Indicador visual de "Activo" */}
                    <span className="flex items-center gap-2">
                        {num}° <span className="hidden md:inline text-[10px] uppercase">Bimestre</span>
                    </span>
                    
                    
                </button>
            ))}
        </div>
    );
}