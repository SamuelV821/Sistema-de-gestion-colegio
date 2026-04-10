// Ya no necesitamos importar useState aquí, este componente ahora es un "soldado"
export default function BimestreSelector({ valor, onChange }) {
    const bimestres = [1, 2, 3, 4];

    return (
        <div className="inline-flex p-1.5 bg-slate-200/50 rounded-2xl backdrop-blur-sm border border-slate-200 shadow-inner">
            {bimestres.map((num) => (
                <button
                    key={num}
                    // Cuando hacen clic, mandamos la señal nerviosa hacia el Dashboard
                    onClick={() => onChange(num)} 
                    className={`
                        relative px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300
                        ${valor === num // Comparamos con el 'valor' que nos manda el Dashboard
                            ? 'bg-white text-indigo-600 shadow-md scale-105' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'
                        }
                    `}
                >
                    <span className="flex items-center gap-2">
                        {num}° <span className="hidden md:inline text-[10px] uppercase">Bimestre</span>
                    </span>
                </button>
            ))}
        </div>
    );
}