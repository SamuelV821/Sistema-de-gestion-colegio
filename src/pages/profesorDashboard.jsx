import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';
import BimestreSelector from '../components/BimestreSelector';
import Tittle from '../components/Tittle';
import { useNotas } from '../hooks/useNotas';
import { supabase } from '../lib/supabaseClient';

export default function ProfesorDashboard() {
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [listaTareas, setListaTareas] = useState([]);
    const [bimestreActivo, setBimestreActivo] = useState(1); 
    const [isBimestreCerrado, setIsBimestreCerrado] = useState(false);
    const [notificacionEmail, setNotificacionEmail] = useState(null);
    
    const { guardarCalificaciones, obtenerCalificaciones, loadingNotas } = useNotas();
    const [profesor, setProfesor] = useState(null);
    const [misMaterias, setMisMaterias] = useState([]);
    const [alumnosMateria, setAlumnosMateria] = useState([]);
    const [planilla, setPlanilla] = useState({});

    // ── LÓGICA DE TAREAS ───────────────────────────────────────────────────
    const actualizarTareas = useCallback(async (materiasActuales) => {
        if (!materiasActuales || materiasActuales.length === 0) return;
        const { data: notasCerradas } = await supabase
            .from('calificaciones')
            .select('materia_id')
            .eq('bimestre', 1)
            .eq('cerrada', true);

        const idsCerrados = new Set(notasCerradas?.map(n => n.materia_id));
        const pendientes = materiasActuales
            .filter(m => !idsCerrados.has(m.id))
            .map(m => ({
                id: m.id,
                materia: m.nombre,
                descripcion: "Falta cerrar el 1er Bimestre",
                materiaOriginal: m 
            }));
        setListaTareas(pendientes);
    }, []);

    const enviarNotificacionesBajas = (loteEnviado) => {
        const alumnosEnRiesgo = loteEnviado.filter(a => a.promedio != null && a.promedio < 7);
        if (alumnosEnRiesgo.length > 0) {
            const listaParaEmail = alumnosEnRiesgo.map(item => {
                const alumnoInfo = alumnosMateria.find(a => a.id === item.alumno_id);
                return { nombre: alumnoInfo?.nombre, promedio: item.promedio };
            });
            setNotificacionEmail(listaParaEmail);
            setTimeout(() => setNotificacionEmail(null), 6000);
        }
    };

    // ── CARGAS INICIALES ──────────────────────────────────────────────────
    useEffect(() => {
        const cargarDatosProfesor = async () => {
            // Nota: Aquí usarías el ID del usuario autenticado
            const { data: profData } = await supabase.from('profesores').select('*').eq('id', 1).single();
            if (profData?.materias_ids?.length > 0) {
                setProfesor(profData);
                const { data: matData } = await supabase.from('materias').select('*').in('id', profData.materias_ids);
                setMisMaterias(matData || []);
                actualizarTareas(matData || []);
            }
        };
        cargarDatosProfesor();
    }, [actualizarTareas]);

    useEffect(() => {
        const cargarAlumnosYNotas = async () => {
            if (selectedMateria) {
                try {
                    const { data: grupos } = await supabase.from('grupos_materias').select('grupo_id').eq('materia_id', selectedMateria.id);
                    const idsGrupos = grupos?.map(g => g.grupo_id) || [];
                    if (idsGrupos.length > 0) {
                        const { data: alData } = await supabase.from('alumnos').select('*').eq('estado', true).in('grupo_id', idsGrupos); 
                        setAlumnosMateria(alData || []);
                    }
                    const { success, data: notas } = await obtenerCalificaciones(selectedMateria.id, bimestreActivo);
                    if (success && notas.length > 0) {
                        const pRecuperada = {};
                        let cerrado = false;
                        notas.forEach(reg => {
                            pRecuperada[reg.alumno_id] = { p1: reg.p1, p2: reg.p2, p3: reg.p3, p4: reg.p4, p5: reg.p5 };
                            if (reg.cerrada) cerrado = true;
                        });
                        setPlanilla(pRecuperada);
                        setIsBimestreCerrado(cerrado);
                    } else {
                        setPlanilla({});
                        setIsBimestreCerrado(false);
                    }
                } catch (e) { console.error(e); }
            }
        };
        cargarAlumnosYNotas();
    }, [selectedMateria, bimestreActivo]);

    const handleNotaChange = (alumnoId, campo, valor) => {
        if (isBimestreCerrado) return;
        setPlanilla(prev => ({
            ...prev,
            [alumnoId]: { ...prev[alumnoId], [campo]: valor === '' ? null : Number(valor) }
        }));
    };

    const handleProcesarPlanilla = async (accion) => {
        if (alumnosMateria.length === 0) return;
        if (accion === 'CERRAR') {
            const incompletos = alumnosMateria.filter(a => {
                const n = ['p1', 'p2', 'p3', 'p4', 'p5'].map(p => planilla[a.id]?.[p]).filter(v => v != null);
                return n.length < 3;
            });
            if (incompletos.length > 0) return alert("Faltan notas en: " + incompletos.map(i => i.nombre).join(', '));
            if (!window.confirm("¿Cerrar definitivamente?")) return;
        }

        const lote = alumnosMateria.map(alumno => {
            const d = planilla[alumno.id] || {};
            const n = ['p1', 'p2', 'p3', 'p4', 'p5'].map(p => d[p]).filter(v => v != null);
            if (n.length === 0 && accion === 'GUARDAR') return null;
            const prom = n.length > 0 ? parseFloat((n.reduce((a, b) => a + b, 0) / n.length).toFixed(2)) : null;
            return {
                alumno_id: alumno.id, materia_id: selectedMateria.id, bimestre: bimestreActivo,
                p1: d.p1 || null, p2: d.p2 || null, p3: d.p3 || null, p4: d.p4 || null, p5: d.p5 || null,
                promedio: prom, cerrada: accion === 'CERRAR'
            };
        }).filter(Boolean);

        const { success } = await guardarCalificaciones(lote);
        if (success) {
            enviarNotificacionesBajas(lote);
            if (accion === 'CERRAR') {
                setIsBimestreCerrado(true);
                actualizarTareas(misMaterias);
            }
            alert(accion === 'CERRAR' ? "🔒 Cerrado" : "✅ Guardado");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
                
                {/* HEADER RESPONSIVO */}
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-slate-400 font-bold">Bienvenido, Prof.</p>
                        <h2 className="text-xl font-black text-slate-800">{profesor?.nombre || '...'}</h2>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Ciclo Lectivo 2026
                    </span>
                </header>

                {/* SECCIÓN TAREAS (CARD GRID) */}
                <section className="mb-10">
                    <Tittle titulo={'Tareas'} descripcion={'Pendientes de cierre (1er Bimestre)'}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <AnimatePresence mode='popLayout'>
                            {listaTareas.length > 0 ? (
                                listaTareas.map((tarea) => (
                                    <motion.div key={tarea.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:border-orange-400 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 font-black text-lg">{tarea.materia[0]}</div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm leading-none mb-1">{tarea.materia}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{tarea.descripcion}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedMateria(tarea.materiaOriginal); setBimestreActivo(1); }} 
                                            className="h-10 px-4 bg-slate-50 hover:bg-orange-500 hover:text-white rounded-xl text-[10px] font-black transition-all">
                                            REVISAR
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 text-center p-10 bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-[2rem]">
                                    <span className="text-4xl block mb-2">🎉</span>
                                    <p className="text-slate-500 font-bold text-sm">Todas las planillas están al día.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* PLANILLA O MATERIAS */}
                <section>
                    <AnimatePresence mode="wait">
                        <motion.div key={selectedMateria ? 'planilla' : 'materias'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {!selectedMateria ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div className="sm:col-span-2">
                                        <Tittle titulo={'Materias'} descripcion={'Gestión de calificaciones por asignatura'}/>
                                    </div>
                                    {misMaterias.map((m) => (
                                        <div key={m.id} className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] flex flex-col gap-4 hover:border-indigo-500 transition-all shadow-sm">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">📚</div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tighter">{m.nombre}</h3>
                                            <Button text={'GESTIONAR NOTAS'} onClick={()=> { setSelectedMateria(m); setBimestreActivo(1); }} className="w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='flex flex-col gap-6'>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setSelectedMateria(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">←</button>
                                            <Tittle titulo={'Planilla'} descripcion={selectedMateria.nombre}/>
                                        </div>
                                        {isBimestreCerrado && <span className="w-full sm:w-auto text-center bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">🔒 PERÍODO CERRADO</span>}
                                    </div>
                                    
                                    <BimestreSelector valor={bimestreActivo} onChange={setBimestreActivo} />

                                    {/* CONTENEDOR DE TABLA CON SCROLL LATERAL */}
                                    <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm min-w-[600px]">
                                                <thead className="bg-slate-900 text-white">
                                                    <tr>
                                                        <th className="sticky left-0 bg-slate-900 z-10 px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest">Alumno</th>
                                                        {['P1','P2','P3','P4','P5'].map(p => <th key={p} className="px-2 py-5 text-center text-[10px] font-black uppercase tracking-widest">{p}</th>)}
                                                        <th className="px-6 py-5 text-center bg-indigo-600 text-[10px] font-black uppercase tracking-widest">PROM</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-slate-50'>
                                                    {alumnosMateria.map((a) => {
                                                        const d = planilla[a.id] || {};
                                                        const n = ['p1','p2','p3','p4','p5'].map(p => d[p]).filter(v => v != null);
                                                        const prom = n.length > 0 ? (n.reduce((x,y)=>x+y,0)/n.length).toFixed(2) : '-';
                                                        return (
                                                            <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                                                                {/* Columna Sticky para Móviles */}
                                                                <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 px-6 py-4 font-bold text-slate-700 border-r border-slate-100">
                                                                    {a.nombre}
                                                                </td>
                                                                {['p1','p2','p3','p4','p5'].map(p => (
                                                                    <td key={p} className="px-2 py-4 text-center">
                                                                        <input 
                                                                            type="number" 
                                                                            value={d[p] || ''} 
                                                                            disabled={isBimestreCerrado} 
                                                                            onChange={(e)=>handleNotaChange(a.id, p, e.target.value)}
                                                                            className="w-12 h-12 sm:w-14 sm:h-14 text-center bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold transition-all disabled:opacity-50"
                                                                        />
                                                                    </td>
                                                                ))}
                                                                <td className="px-6 py-4 text-center font-black text-indigo-600 bg-indigo-50/30 text-base">{prom}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {/* ACCIONES DE PLANILLA */}
                                        <div className="p-6 bg-slate-50 border-t-2 border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                                            {!isBimestreCerrado ? (
                                                <>
                                                    <button onClick={() => handleProcesarPlanilla('CERRAR')} className="w-full sm:w-auto px-8 py-4 text-red-600 font-black text-xs border-2 border-red-100 rounded-2xl hover:bg-red-50 active:scale-95 transition-all">
                                                        🔒 FINALIZAR BIMESTRE
                                                    </button>
                                                    <button onClick={() => handleProcesarPlanilla('GUARDAR')} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
                                                        {loadingNotas ? 'PROCESANDO...' : 'GUARDAR CAMBIOS'}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full text-center p-4 bg-slate-200/50 rounded-2xl">
                                                    <p className="text-slate-500 text-xs font-bold italic tracking-wide">
                                                        ESTA PLANILLA SE ENCUENTRA EN MODO SÓLO LECTURA.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* NOTIFICACIÓN FLOTANTE (ADAPTADA A MOBILE) */}
                <AnimatePresence>
                    {notificacionEmail && (
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-10 z-50 max-w-sm mx-auto bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-slate-700">
                            <div className="flex gap-4 mb-4">
                                <span className="text-3xl">📧</span>
                                <div>
                                    <h4 className="font-black text-xs uppercase text-indigo-400 tracking-widest">Aviso de Riesgo</h4>
                                    <p className="text-[10px] text-slate-400 font-bold">Reporte enviado a tutores</p>
                                </div>
                            </div>
                            <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {notificacionEmail.map((al, i) => (
                                    <li key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                        <span className="text-[11px] font-bold">{al.nombre}</span>
                                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-[10px] font-black">{al.promedio}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => setNotificacionEmail(null)} className="w-full py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                                ENTENDIDO
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}