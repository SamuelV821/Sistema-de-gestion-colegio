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
    
    // ESTADO PARA NOTIFICACIONES (MOCK EMAIL)
    const [notificacionEmail, setNotificacionEmail] = useState(null);
    
    const { guardarCalificaciones, obtenerCalificaciones, loadingNotas } = useNotas();

    const [profesor, setProfesor] = useState(null);
    const [misMaterias, setMisMaterias] = useState([]);
    const [alumnosMateria, setAlumnosMateria] = useState([]);
    const [planilla, setPlanilla] = useState({});

    // ==========================================
    // 1. LÓGICA DE TAREAS Y NOTIFICACIONES
    // ==========================================
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
        // Filtramos alumnos con promedio < 7
        const alumnosEnRiesgo = loteEnviado.filter(a => a.promedio != null && a.promedio < 7);

        if (alumnosEnRiesgo.length > 0) {
            const listaParaEmail = alumnosEnRiesgo.map(item => {
                const alumnoInfo = alumnosMateria.find(a => a.id === item.alumno_id);
                return { nombre: alumnoInfo?.nombre, promedio: item.promedio };
            });
            setNotificacionEmail(listaParaEmail);
            // Desaparece solo tras 6 segundos
            setTimeout(() => setNotificacionEmail(null), 6000);
        }
    };

    // ==========================================
    // 2. CARGAS INICIALES
    // ==========================================
    useEffect(() => {
        const cargarDatosProfesor = async () => {
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
    }, [selectedMateria, bimestreActivo]); // <--- SIN obtenerCalificaciones para evitar el bucle

    // ==========================================
    // 3. HANDLERS
    // ==========================================
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
            // DISPARAR MOCK EMAIL
            enviarNotificacionesBajas(lote);
            if (accion === 'CERRAR') {
                setIsBimestreCerrado(true);
                actualizarTareas(misMaterias);
            }
            alert(accion === 'CERRAR' ? "🔒 Cerrado" : "✅ Guardado");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <p className="text-slate-400 font-bold">Bienvenido, Prof. {profesor?.nombre || '...'}</p>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Ciclo 2026</span>
                </header>

                {/* SECCIÓN TAREAS */}
                <section className='m-4 p-4'>
                    <Tittle titulo={'Tareas'} descripcion={'Pendientes de cierre (1er Bimestre)'}/>
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {listaTareas.length > 0 ? (
                                listaTareas.map((tarea) => (
                                    <motion.div key={tarea.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-orange-500 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">{tarea.materia[0]}</div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{tarea.materia}</h3>
                                                <p className="text-xs text-slate-500">{tarea.descripcion}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedMateria(tarea.materiaOriginal); setBimestreActivo(1); }} className="text-xs font-black text-indigo-600 hover:underline uppercase">Revisar →</button>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 py-8 border-2 border-dashed rounded-3xl">🎉 Todas las materias del 1er bimestre están cerradas.</motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* PLANILLA O MATERIAS */}
                <section className='m-4'>
                    <AnimatePresence mode="wait">
                        <motion.div key={selectedMateria ? 'planilla' : 'materias'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {!selectedMateria ? (
                                <div className='flex flex-col gap-4'>
                                    <Tittle titulo={'Materias'} descripcion={'Seleccione para gestionar'}/>
                                    {misMaterias.map((m) => (
                                        <div key={m.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex justify-between items-center hover:border-indigo-500 transition-all">
                                            <h3 className="text-xl font-bold text-slate-800">{m.nombre}</h3>
                                            <Button text={'GESTIONAR NOTAS →'} onClick={()=> { setSelectedMateria(m); setBimestreActivo(1); }}/>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='flex flex-col gap-6'>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Tittle titulo={'Planilla'} descripcion={selectedMateria.nombre}/>
                                            {isBimestreCerrado && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase">🔒 CERRADO</span>}
                                        </div>
                                        <Button text={'← Volver'} onClick={() => setSelectedMateria(null)}/>
                                    </div>
                                    <BimestreSelector valor={bimestreActivo} onChange={setBimestreActivo} />
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-900 text-white uppercase text-xs">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">Alumno</th>
                                                    {['p1','p2','p3','p4','p5'].map(p => <th key={p} className="text-center">{p}</th>)}
                                                    <th className="px-6 py-4 text-center bg-slate-800">Promedio</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y'>
                                                {alumnosMateria.map((a) => {
                                                    const d = planilla[a.id] || {};
                                                    const n = ['p1','p2','p3','p4','p5'].map(p => d[p]).filter(v => v != null);
                                                    const prom = n.length > 0 ? (n.reduce((x,y)=>x+y,0)/n.length).toFixed(2) : '-';
                                                    return (
                                                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-700">{a.nombre}</td>
                                                            {['p1','p2','p3','p4','p5'].map(p => (
                                                                <td key={p} className="text-center">
                                                                    <input type="number" value={d[p] || ''} disabled={isBimestreCerrado} onChange={(e)=>handleNotaChange(a.id, p, e.target.value)}
                                                                        className="w-12 h-10 text-center border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none disabled:bg-slate-100"/>
                                                                </td>
                                                            ))}
                                                            <td className="px-6 py-4 text-center font-black text-indigo-600 bg-indigo-50/30">{prom}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        <div className="p-6 bg-slate-50 border-t flex justify-end gap-4">
                                            {!isBimestreCerrado ? (
                                                <>
                                                    <button onClick={() => handleProcesarPlanilla('CERRAR')} className="px-6 py-3 text-red-600 font-bold border-2 border-red-100 rounded-xl hover:bg-red-50">🔒 CERRAR</button>
                                                    <Button text={loadingNotas ? '...' : 'GUARDAR'} onClick={() => handleProcesarPlanilla('GUARDAR')} />
                                                </>
                                            ) : <p className="text-slate-500 italic">🔒 Esta planilla ya no admite cambios.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* NOTIFICACIÓN MOCK EMAIL */}
                <AnimatePresence>
                    {notificacionEmail && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="fixed bottom-10 right-10 z-50 max-w-sm w-full bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-700">
                            <div className="flex gap-3 mb-4"><span className="text-2xl animate-bounce">📩</span>
                                <div><h4 className="font-bold text-xs uppercase text-indigo-400">Alerta de Rendimiento</h4><p className="text-[10px] text-slate-400">Correos enviados automáticamente</p></div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {notificacionEmail.map((al, i) => (
                                    <li key={i} className="flex justify-between text-[11px] bg-white/5 p-2 rounded-lg"><span>{al.nombre}</span><span className="text-orange-400 font-bold">{al.promedio}</span></li>
                                ))}
                            </ul>
                            <button onClick={() => setNotificacionEmail(null)} className="w-full py-2 bg-slate-800 rounded-xl text-[10px] font-black hover:bg-slate-700">ENTENDIDO</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}