import { useState } from 'react';

export default function PadreDashBoard() {
    const [hijo] = useState({
        nombre: "Facundo Gómez",
        materias: [
            { 
                id: 1, 
                nombre: 'Matemáticas', 
                bimestres: [
                    { parciales: [8, 7, 9, 10, 8], final: 8.4 }, // Bim 1
                    { parciales: [7, 6, 8, 7, 9], final: 7.4 },  // Bim 2
                    { parciales: [0, 0, 0, 0, 0], final: 0 },    // Bim 3 (Pendiente)
                    { parciales: [0, 0, 0, 0, 0], final: 0 }     // Bim 4 (Pendiente)
                ],
                promedioAnual: 7.9
            },
            { 
                id: 1, 
                nombre: 'Matemáticas', 
                bimestres: [
                    { parciales: [8, 7, 9, 10, 8], final: 8.4 }, // Bim 1
                    { parciales: [7, 6, 8, 7, 9], final: 7.4 },  // Bim 2
                    { parciales: [0, 0, 0, 0, 0], final: 0 },    // Bim 3 (Pendiente)
                    { parciales: [0, 0, 0, 0, 0], final: 0 }     // Bim 4 (Pendiente)
                ],
                promedioAnual: 7.9
            },
            { 
                id: 1, 
                nombre: 'Matemáticas', 
                bimestres: [
                    { parciales: [8, 5, 9, 10, 8], final: 6 }, // Bim 1
                    { parciales: [7, 6, 8, 7, 9], final: 5 },  // Bim 2
                    { parciales: [0, 0, 0, 0, 0], final: 7 },    // Bim 3 (Pendiente)
                    { parciales: [0, 0, 0, 0, 0], final: 8 }     // Bim 4 (Pendiente)
                ],
                promedioAnual: 7.9
            }
            // ... más materias
        ]
    });

    return (
        <div className="min-h-screen bg-slate-50 flex p-8">
            <main className="flex-1 max-w-7xl mx-auto">

                <header className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900">Boletín Digital: {hijo.nombre}</h1>
                    <p className="text-slate-500 font-medium">Sede Central Los Pinos - Ciclo 2026</p>
                </header>

                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-6 py-4 font-black text-white uppercase tracking-wider">Materia</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">B1</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">B2</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">B3</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">B4</th>
                                <th className="px-6 py-4 font-black text-indigo-400 text-center uppercase tracking-wider bg-slate-800">Final</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {hijo.materias.map((materia) => (
                                <tr 
                                    key={materia.id} 
                                    className="hover:bg-indigo-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-extrabold text-slate-700 border-r border-slate-50">
                                        {materia.nombre}
                                    </td>
                                    {[0, 1, 2, 3].map((i) => (
                                        <td key={i} className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                                                materia.bimestres[i].final >= 7 
                                                ? 'text-emerald-600 bg-emerald-50' 
                                                : materia.bimestres[i].final > 0 
                                                    ? 'text-red-500 bg-red-50' 
                                                    : 'text-slate-300'
                                            }`}>
                                                {materia.bimestres[i].final || '-'}
                                            </span>
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center bg-indigo-50/30">
                                        <span className="text-lg font-black text-indigo-600">
                                            {materia.promedioAnual}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>               
            </main>
        </div>
    );
}