import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ModalForm({ isOpen, onClose, tipo, herramientas, itemAEditar }) {
    const [formData, setFormData] = useState({});
    const [grupos, setGrupos] = useState([]);
    const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // 1. CARGA DE DATOS AUXILIARES
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Si es Alumno o Materia, necesitamos los Grupos
                if (tipo === 'materia' || tipo === 'alumno') {
                    const { data, error } = await supabase
                        .from('grupos')
                        .select('*')
                        .order('nombre', { ascending: true });
                    if (error) throw error;
                    setGrupos(data);
                } 
                
                // Si es Profesor, necesitamos todas las Materias
                if (tipo === 'profesor') {
                    const { data, error } = await supabase
                        .from('materias')
                        .select('id, nombre, estado')
                        // He quitado el filtro .eq('estado', true) para que veas todas. 
                        // Si quieres filtrar, vuelve a agregarlo.
                        .order('nombre', { ascending: true });
                    if (error) throw error;
                    setMateriasDisponibles(data);
                }
            } catch (error) {
                console.error('❌ Error:', error.message);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [isOpen, tipo]);

    // 2. INICIALIZACIÓN DE FORMULARIO
    useEffect(() => {
        if (isOpen) {
            if (itemAEditar) {
                setFormData({
                    ...itemAEditar,
                    materias_ids: itemAEditar.materias_ids || [],
                    grupo_ids: itemAEditar.grupo_ids || []
                });
            } else {
                setFormData({
                    estado: true,
                    materias_ids: [],
                    grupo_ids: []
                });
            }
        }
    }, [isOpen, itemAEditar]);

    if (!isOpen) return null;

    const esEdicion = Boolean(formData.id);
    const titulos = {
        alumno: esEdicion ? "Editar Alumno" : "Inscribir Nuevo Alumno",
        profesor: esEdicion ? "Editar Docente" : "Registrar Personal Docente",
        materia: esEdicion ? "Editar Asignatura" : "Crear Nueva Asignatura"
    };

    // 3. HANDLERS
    const capturarDatos = (e) => {
        let valor = e.target.value;
        if (e.target.name === 'estado') valor = valor === 'true';
        setFormData({ ...formData, [e.target.name]: valor });
    };

    const toggleMateria = (materiaId) => {
        const idNum = Number(materiaId);
        const actuales = formData.materias_ids || [];
        const nuevosIds = actuales.includes(idNum)
            ? actuales.filter(id => id !== idNum)
            : [...actuales, idNum];
        setFormData({ ...formData, materias_ids: nuevosIds });
    };

    const toggleGrupo = (grupoId) => {
        const idNum = Number(grupoId);
        // Para materias/alumnos solemos usar un solo grupo, pero lo guardamos en array
        setFormData({ ...formData, grupo_ids: [idNum] });
    };

    const Guardar = async (e) => {
        e.preventDefault();
        
        // 1. Clonamos el formData para no romper la UI
        const copiaDatos = { ...formData };

        // 2. Extraemos los datos que NO son columnas de la tabla 'materias'
        // Esto evita el error de "columna no existe"
        const { grupo_ids, materias_ids, ...datosLimpios } = copiaDatos;

        // 3. Dependiendo del tipo, decidimos qué enviar
        let dataToSend = datosLimpios;
        
        // Si es profesor, conservamos materias_ids porque esa columna SÍ existe en 'profesores'
        if (tipo === 'profesor') {
            dataToSend = { ...datosLimpios, materias_ids };
        }

        // Si es alumno, nos aseguramos de usar grupo_id (singular) si así está en tu DB
        if (tipo === 'alumno') {
            dataToSend = { ...datosLimpios, grupo_id: formData.grupo_id };
        }

        // 4. Ejecutamos la acción (Aquí pasamos grupo_ids por fuera si el hook lo necesita)
        const payload = tipo === 'materia' ? { ...datosLimpios, grupo_id: grupo_ids?.[0] } : dataToSend;

        const { success, error } = esEdicion 
            ? await herramientas.update(formData.id, payload)
            : await herramientas.add(payload);
        
        if (success) onClose();
        else alert("Error: " + error);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">{titulos[tipo]}</h2>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Sistema Los Pinos</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
                </div>

                <form className="p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar" onSubmit={Guardar}>
                    
                    {/* NOMBRE - Común */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nombre / Descripción</label>
                        <input
                            type="text" name="nombre" required
                            value={formData.nombre || ''}
                            onChange={capturarDatos}
                            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold"
                        />
                    </div>

                    {/* LÓGICA ALUMNO */}
                    {tipo === 'alumno' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">DNI</label>
                                <input
                                    type="number" name="dni" required
                                    value={formData.dni || ''}
                                    onChange={capturarDatos}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Grupo / Año</label>
                                <select 
                                    name="grupo_id" 
                                    value={formData.grupo_id || ''} 
                                    onChange={capturarDatos}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700"
                                >
                                    <option value="">Seleccionar grupo...</option>
                                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* LÓGICA PROFESOR */}
                    {tipo === 'profesor' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Especialidad</label>
                                <input
                                    type="text" name="especialidad" required
                                    value={formData.especialidad || ''}
                                    onChange={capturarDatos}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Materias Asignadas</label>
                                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 max-h-40 overflow-y-auto">
                                    {materiasDisponibles.map(m => (
                                        <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all">
                                            <input 
                                                type="checkbox"
                                                checked={formData.materias_ids?.includes(m.id)}
                                                onChange={() => toggleMateria(m.id)}
                                                className="w-5 h-5 rounded border-2 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-bold text-slate-600">{m.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* LÓGICA MATERIA */}
                    {tipo === 'materia' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Carga Horaria</label>
                                <input
                                    type="number" name="carga_horaria" required
                                    value={formData.carga_horaria || ''}
                                    onChange={capturarDatos}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Grupo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {grupos.map(g => (
                                        <button
                                            key={g.id} type="button"
                                            onClick={() => toggleGrupo(g.id)}
                                            className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.grupo_ids?.includes(g.id) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                                        >
                                            {g.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ESTADO - Para edición */}
                    {esEdicion && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Estado</label>
                            <select
                                name="estado"
                                value={formData.estado ? 'true' : 'false'}
                                onChange={capturarDatos}
                                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                        <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-100 rounded-xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                            {esEdicion ? 'ACTUALIZAR' : 'GUARDAR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}