import { useRef } from 'react';
import { usePadreDashboard } from '../hooks/usePadreDashboard';

const colorNota = (nota) => {
    if (nota === null || nota === undefined) return 'text-slate-300';
    if (nota >= 7) return 'text-emerald-600 bg-emerald-50';
    if (nota > 0)  return 'text-red-500 bg-red-50';
    return 'text-slate-300';
};

const formatNota = (nota) =>
    nota === null || nota === undefined || nota === 0 ? '—' : nota;

export default function PadreDashBoard() {
    const ALUMNO_ID = 1;
    const { alumno, materias, loading, error } = usePadreDashboard(ALUMNO_ID);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Cargando boletín...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-sm">
                    <p className="text-red-600 font-black text-lg">Error al cargar</p>
                    <p className="text-red-400 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!alumno) return null;

    const promedioGeneral = (() => {
        const conNota = materias.filter(m => m.promedioAnual !== null);
        if (!conNota.length) return null;
        return parseFloat(
            (conNota.reduce((acc, m) => acc + m.promedioAnual, 0) / conNota.length).toFixed(1)
        );
    })();

    const materiasAprobadas    = materias.filter(m => m.promedioAnual !== null && m.promedioAnual >= 7).length;
    const materiasDesaprobadas = materias.filter(m => m.promedioAnual !== null && m.promedioAnual < 7).length;
    const materiasEnCurso      = materias.filter(m => m.promedioAnual === null).length;

    return (
        <>
            {/* ── Estilos de impresión ── */}
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 16mm; }
                    body * { visibility: hidden; }
                    #boletin-print, #boletin-print * { visibility: visible; }
                    #boletin-print { position: absolute; top: 0; left: 0; width: 100%; }
                    .no-print { display: none !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <main className="max-w-5xl mx-auto space-y-8">

                    {/* Encabezado — no se imprime */}
                    <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Boletín Digital</h1>
                            <p className="text-slate-500 font-medium mt-1">Sede Central Los Pinos · Ciclo 2026</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671l-.72 5.671M3 8.25V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25M3 8.25h18M3 8.25a2.25 2.25 0 00-2.25 2.25V18a2.25 2.25 0 002.25 2.25h.75m16.5 0h.75a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0021 8.25" />
                            </svg>
                            Imprimir PDF
                        </button>
                    </div>

                    {/* ── Contenido imprimible ── */}
                    <div id="boletin-print" className="space-y-8">

                        {/* Header solo visible al imprimir */}
                        <div className="hidden print:flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-2">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Boletín de Calificaciones</h1>
                                <p className="text-slate-500 text-sm">Sede Central Los Pinos · Ciclo 2026</p>
                            </div>
                            <p className="text-xs text-slate-400">
                                Emitido: {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Tarjeta alumno */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-wrap gap-6 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                                {alumno.nombre.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-black text-slate-900">{alumno.nombre}</h2>
                                <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-500 font-medium">
                                    <span>DNI: <span className="text-slate-700 font-bold">{alumno.dni ?? '—'}</span></span>
                                    <span>Grupo: <span className="text-slate-700 font-bold">{alumno.grupo}</span></span>
                                    <span>Ciclo: <span className="text-slate-700 font-bold">2026</span></span>
                                    <span>Materias: <span className="text-slate-700 font-bold">{materias.length}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Promedio General', value: promedioGeneral ?? '—', color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
                                { label: 'Aprobadas',        value: materiasAprobadas,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Desaprobadas',     value: materiasDesaprobadas,    color: 'text-red-500',     bg: 'bg-red-50'     },
                                { label: 'En Curso',         value: materiasEnCurso,         color: 'text-slate-400',   bg: 'bg-slate-100'  },
                            ].map(({ label, value, color, bg }) => (
                                <div key={label} className={`${bg} rounded-2xl p-5 text-center`}>
                                    <p className={`text-3xl font-black ${color}`}>{value}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tabla de notas */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-white uppercase tracking-wider">Materia</th>
                                        {[1, 2, 3, 4].map(b => (
                                            <th key={b} className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">
                                                Bim. {b}
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 font-black text-indigo-400 text-center uppercase tracking-wider bg-slate-800">
                                            Anual
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {materias.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                                                No hay calificaciones registradas
                                            </td>
                                        </tr>
                                    ) : (
                                        materias.map((materia) => (
                                            <tr key={materia.id} className="hover:bg-indigo-50/50 transition-colors">
                                                <td className="px-6 py-4 font-extrabold text-slate-700 border-r border-slate-100">
                                                    {materia.nombre}
                                                </td>
                                                {[1, 2, 3, 4].map((b) => {
                                                    const nota = materia.bimestres[b]?.promedio ?? null;
                                                    return (
                                                        <td key={b} className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-bold ${colorNota(nota)}`}>
                                                                {formatNota(nota)}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-4 text-center bg-indigo-50/30">
                                                    <span className={`text-lg font-black ${
                                                        materia.promedioAnual === null
                                                            ? 'text-slate-300'
                                                            : materia.promedioAnual >= 7
                                                                ? 'text-indigo-600'
                                                                : 'text-red-500'
                                                    }`}>
                                                        {materia.promedioAnual ?? '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pie del PDF */}
                        <p className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200">
                            Documento generado automáticamente por Sistema Los Pinos · No requiere firma
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}