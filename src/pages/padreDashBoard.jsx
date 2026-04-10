import { useRef } from 'react';
import { usePadreDashboard } from '../hooks/usePadreDashboard';

const colorNota = (nota) => {
    if (nota === null || nota === undefined || nota === 0) return 'text-slate-300';
    if (nota >= 7) return 'text-emerald-600 bg-emerald-50';
    if (nota > 0)  return 'text-red-500 bg-red-50';
    return 'text-slate-300';
};

const formatNota = (nota) =>
    nota === null || nota === undefined || nota === 0 ? '—' : nota;

export default function PadreDashBoard() {
    // Nota: Samuel, aquí podrías obtener el ID del usuario desde tu AuthContext
    const ALUMNO_ID = 1; 
    const { alumno, materias, loading, error } = usePadreDashboard(ALUMNO_ID);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <div className="relative w-12 h-12 mx-auto">
                        <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0" />
                    </div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Cargando boletín...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white border-2 border-red-100 rounded-3xl p-8 text-center max-w-sm shadow-xl shadow-red-100/50">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
                    <p className="text-slate-900 font-black text-lg">Error de conexión</p>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">{error}</p>
                </div>
            </div>
        );
    }

    if (!alumno) return null;

    const promedioGeneral = (() => {
        const conNota = materias.filter(m => m.promedioAnual !== null);
        if (!conNota.length) return null;
        return parseFloat((conNota.reduce((acc, m) => acc + m.promedioAnual, 0) / conNota.length).toFixed(1));
    })();

    const materiasAprobadas    = materias.filter(m => m.promedioAnual !== null && m.promedioAnual >= 7).length;
    const materiasDesaprobadas = materias.filter(m => m.promedioAnual !== null && m.promedioAnual < 7).length;
    const materiasEnCurso      = materias.filter(m => m.promedioAnual === null).length;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { background: white; }
                    .no-print { display: none !important; }
                    #boletin-print { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .bg-slate-50 { background-color: white !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            <main className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-10" id="boletin-print">
                
                {/* Cabecera Responsiva */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Oficial</span>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic">Boletín Digital</h1>
                        <p className="text-slate-500 font-medium text-sm sm:text-base">Instituto Los Pinos · Gestión Académica 2026</p>
                    </div>
                    
                    <button
                        onClick={handlePrint}
                        className="no-print w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl hover:bg-indigo-600 active:scale-95 transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        EXPORTAR PDF
                    </button>
                </header>

                {/* Perfil del Alumno */}
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-200 flex items-center justify-center text-white text-4xl font-black">
                        {alumno.nombre.charAt(0)}
                    </div>
                    <div className="text-center sm:text-left space-y-2 flex-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">{alumno.nombre}</h2>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-y-2 gap-x-6 text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <p>DNI <span className="text-slate-900 ml-1">{alumno.dni || '—'}</span></p>
                            <p>Grupo <span className="text-indigo-600 ml-1">{alumno.grupo}</span></p>
                            <p className="hidden xs:block text-slate-300">|</p>
                            <p>Estado <span className="text-emerald-600 ml-1">Regular</span></p>
                        </div>
                    </div>
                </section>

                {/* Grid de Métricas Responsivo */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {[
                        { label: 'Promedio Gral', value: promedioGeneral ?? '—', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                        { label: 'Aprobadas', value: materiasAprobadas, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                        { label: 'Pendientes', value: materiasDesaprobadas, color: 'text-red-500', bg: 'bg-red-50/50' },
                        { label: 'En Curso', value: materiasEnCurso, color: 'text-slate-400', bg: 'bg-slate-100/50' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} rounded-[1.5rem] p-5 sm:p-7 border border-white flex flex-col items-center justify-center`}>
                            <p className={`text-3xl sm:text-4xl font-black ${color}`}>{value}</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 text-center">{label}</p>
                        </div>
                    ))}
                </section>

                {/* Contenedor de Tabla con Scroll */}
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse text-left min-w-[700px]">
                            <thead className="bg-slate-900">
                                <tr>
                                    <th className="sticky left-0 bg-slate-900 z-10 px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800">Materia</th>
                                    {[1, 2, 3, 4].map(b => (
                                        <th key={b} className="px-6 py-5 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest border-b border-slate-800">
                                            Bimestre {b}
                                        </th>
                                    ))}
                                    <th className="px-6 py-5 text-[10px] font-black text-white text-center uppercase tracking-widest border-b border-slate-800 bg-indigo-600">
                                        Prom. Anual
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {materias.map((materia) => (
                                    <tr key={materia.id} className="hover:bg-slate-50/80 transition-colors group">
                                        {/* Materia Fija al hacer scroll horizontal */}
                                        <td className="sticky left-0 bg-white group-hover:bg-slate-50/80 z-10 px-6 py-5 font-black text-slate-700 text-sm border-r border-slate-100 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] uppercase">
                                            {materia.nombre}
                                        </td>
                                        {[1, 2, 3, 4].map((b) => {
                                            const nota = materia.bimestres[b]?.promedio ?? null;
                                            return (
                                                <td key={b} className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black transition-transform hover:scale-110 ${colorNota(nota)}`}>
                                                        {formatNota(nota)}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-5 text-center bg-indigo-50/30">
                                            <span className={`text-lg font-black ${
                                                materia.promedioAnual === null ? 'text-slate-300' :
                                                materia.promedioAnual >= 7 ? 'text-indigo-600' : 'text-red-500'
                                            }`}>
                                                {materia.promedioAnual ?? '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="text-center space-y-2 no-print">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        Documento oficial · Sistema Los Pinos
                    </p>
                </footer>
            </main>
        </div>
    );
}