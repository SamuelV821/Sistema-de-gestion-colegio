import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ModalForm({ isOpen, onClose, tipo, herramientas, itemAEditar }) {
    const [formData, setFormData] = useState({});
    const [grupos, setGrupos] = useState([]);
    const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // 1. CARGA DE DATOS AUXILIARES (GRUPOS Y MATERIAS)
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Alumnos y Materias necesitan ver los Grupos disponibles
                if (tipo === 'materia' || tipo === 'alumno') {
                    const { data, error } = await supabase
                        .from('grupos')
                        .select('*')
                        .order('nombre', { ascending: true });
                    if (error) throw error;
                    setGrupos(data);
                } 
                
                // Profesores necesitan ver todas las Materias para asignarse
                if (tipo === 'profesor') {
                    const { data, error } = await supabase
                        .from('materias')
                        .select('id, nombre, estado')
                        .order('nombre', { ascending: true });
                    if (error) throw error;
                    setMateriasDisponibles(data);
                }
            } catch (error) {
                console.error('❌ Error en fetchData:', error.message);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [isOpen, tipo]);

    // 2. CARGA DE RELACIÓN EXISTENTE (Para edición de Materia)
    useEffect(() => {
        const cargarRelacionMateria = async () => {
            if (isOpen && tipo === 'materia' && itemAEditar?.id) {
                const { data, error } = await supabase
                    .from('grupos_materias')
                    .select('grupo_id')
                    .eq('materia_id', itemAEditar.id);
                
                if (!error && data && data.length > 0) {
                    // Cargamos el ID del grupo en el array (aunque sea uno solo)
                    setFormData(prev => ({ ...prev, grupo_ids: [data[0].grupo_id] }));
                }
            }
        };
        cargarRelacionMateria();
    }, [isOpen, tipo, itemAEditar]);

    // 3. INICIALIZACIÓN DEL ESTADO DEL FORMULARIO
    useEffect(() => {
        if (isOpen) {
            if (itemAEditar) {
                setFormData({
                    ...itemAEditar,
                    materias_ids: itemAEditar.materias_ids || [],
                    // Si es materia, respetamos lo que traiga el efecto de carga de relaciones
                    grupo_ids: tipo === 'materia' ? (formData.grupo_ids || []) : []
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

    // PROTECCIÓN DE RENDERIZADO
    if (!isOpen) return null;

    // DEFINICIÓN DE TÍTULOS (Ubicación segura para evitar ReferenceError)
    const esEdicion = Boolean(formData.id);
    const titulos = {
        alumno: esEdicion ? "Editar Alumno" : "Inscribir Nuevo Alumno",
        profesor: esEdicion ? "Editar Docente" : "Registrar Personal Docente",
        materia: esEdicion ? "Editar Asignatura" : "Crear Nueva Asignatura"
    };

    // 4. HANDLERS DE INTERACCIÓN
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
        const actuales = formData.grupo_ids || [];
        
        // LÓGICA DE SELECCIÓN ÚNICA:
        // Si ya está seleccionado, lo quita. Si no, reemplaza todo por el nuevo.
        const nuevosIds = actuales.includes(idNum) ? [] : [idNum];
        setFormData({ ...formData, grupo_ids: nuevosIds });
    };

    const Guardar = async (e) => {
        e.preventDefault();
        
        const copiaDatos = { ...formData };
        // Extraemos campos que no van directo a las tablas de Supabase para evitar errores
        const { grupo_ids, materias_ids, ...datosLimpios } = copiaDatos;

        let payload;
        
        if (tipo === 'profesor') {
            payload = { ...datosLimpios, materias_ids };
        } else if (tipo === 'alumno') {
            // Alumnos usan la columna directa grupo_id (singular)
            payload = { ...datosLimpios, grupo_id: formData.grupo_id };
        } else if (tipo === 'materia') {
            // Pasamos grupo_ids para que el hook useMaterias maneje la tabla grupos_materias
            payload = { ...datosLimpios, grupo_ids }; 
        }

        const { success, error } = esEdicion 
            ? await herramientas.update(formData.id, payload)
            : await herramientas.add(payload);
        
        if (success) onClose();
        else alert("Error al procesar: " + error);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col border border-white">
                
                {/* Header Estilo Los Pinos */}
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter italic">
                            {titulos[tipo] || "Formulario"}
                        </h2>
                        <p className="text-indigo-400 text-[10px] uppercase font-black tracking-[0.2em]">
                            Gestión Académica
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors text-2xl font-light"
                    >
                        ×
                    </button>
                </div>

                <form className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar" onSubmit={Guardar}>
                    
                    {/* CAMPO NOMBRE (Común a todos) */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Nombre Completo / Descripción
                        </label>
                        <input
                            type="text" name="nombre" required
                            value={formData.nombre || ''}
                            onChange={capturarDatos}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                            placeholder="Ingrese nombre..."
                        />
                    </div>

                    {/* SECCIÓN ALUMNOS */}
                    {tipo === 'alumno' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número de DNI</label>
                                <input
                                    type="number" name="dni" required
                                    value={formData.dni || ''}
                                    onChange={capturarDatos}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Grupo / Grado Asignado</label>
                                <select 
                                    name="grupo_id" 
                                    value={formData.grupo_id || ''} 
                                    onChange={capturarDatos}
                                    required
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                                >
                                    <option value="">Seleccionar grupo...</option>
                                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* SECCIÓN PROFESOR */}
                    {tipo === 'profesor' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Especialidad Docente</label>
                                <input
                                    type="text" name="especialidad" required
                                    value={formData.especialidad || ''}
                                    onChange={capturarDatos}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
                                    placeholder="Ej: Lic. en Matemáticas"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-indigo-500">Materias Asignadas (Multiselección)</label>
                                <div className="space-y-2 bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                                    {materiasDisponibles.map(m => (
                                        <label key={m.id} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-200">
                                            <input 
                                                type="checkbox"
                                                checked={formData.materias_ids?.includes(m.id)}
                                                onChange={() => toggleMateria(m.id)}
                                                className="w-5 h-5 rounded-lg border-2 text-indigo-600 focus:ring-indigo-500 transition-all"
                                            />
                                            <span className="text-sm font-bold text-slate-600">{m.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* SECCIÓN MATERIA */}
                    {tipo === 'materia' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Carga Horaria Semanal (Horas)</label>
                                <input
                                    type="number" name="carga_horaria" required
                                    value={formData.carga_horaria || ''}
                                    onChange={capturarDatos}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-indigo-500">
                                    Asignar a Grupo <span className="lowercase font-normal">(Selección única)</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {grupos.map(g => {
                                        const isSelected = formData.grupo_ids?.includes(g.id);
                                        return (
                                            <button
                                                key={g.id} type="button"
                                                onClick={() => toggleGrupo(g.id)}
                                                className={`p-4 rounded-2xl border-2 font-black text-xs transition-all duration-300 ${
                                                    isSelected 
                                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' 
                                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                                }`}
                                            >
                                                {g.nombre}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ESTADO DE REGISTRO (Solo en edición) */}
                    {esEdicion && (
                        <div className="pt-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado del Registro</label>
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, estado: true})}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${formData.estado ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    ACTIVO
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, estado: false})}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${!formData.estado ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                                >
                                    INACTIVO
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ACCIONES FINALES */}
                    <div className="pt-6 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl text-xs uppercase tracking-widest transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all text-xs uppercase tracking-widest"
                        >
                            {esEdicion ? 'Actualizar Datos' : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}