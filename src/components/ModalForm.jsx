import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ModalForm({ isOpen, onClose, tipo, herramientas, itemAEditar }) {
    const [formData, setFormData] = useState({});
    const [grupos, setGrupos] = useState([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);

    useEffect(() => {
        if (isOpen && tipo === 'materia') {
            const fetchGrupos = async () => {
                setLoadingGrupos(true);
                try {
                    const { data, error } = await supabase
                        .from('grupos')
                        .select('*')
                        .order('nombre', { ascending: true });
                    if (error) throw error;
                    setGrupos(data);
                } catch (error) {
                    console.error('❌ Error al cargar grupos:', error.message);
                } finally {
                    setLoadingGrupos(false);
                }
            };
            fetchGrupos();
        }
    }, [isOpen, tipo]);

    useEffect(() => {
        if (isOpen) {
            if (itemAEditar) {
                setFormData(itemAEditar);
            } else {
                setFormData(tipo === 'materia' ? { grupo_ids: [] } : {});
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

    const capturarDatos = (e) => {
        let valor = e.target.value;
        if (e.target.name === 'estado') valor = valor === 'true';
        setFormData({ ...formData, [e.target.name]: valor });
    };

    // Solo permite 1 grupo: si ya está seleccionado lo deselecciona, si no reemplaza
    const toggleGrupo = (grupoId) => {
        const grupoIdNum = Number(grupoId);
        const actual = formData.grupo_ids?.[0];
        setFormData({
            ...formData,
            grupo_ids: actual === grupoIdNum ? [] : [grupoIdNum]
        });
    };

    const Guardar = async (e) => {
        e.preventDefault();
        if (esEdicion && herramientas.update) {
            const { success, error } = await herramientas.update(formData.id, formData);
            if (success) onClose();
            else alert("Error al actualizar: " + error);
        } else if (!esEdicion && herramientas.add) {
            const { success, error } = await herramientas.add(formData);
            if (success) onClose();
            else alert("Error al guardar: " + error);
        }
    };

    const handleEliminarProfesor = async () => {
        if (window.confirm("¿Está seguro que desea eliminar a este docente del sistema?")) {
            const { success, error } = await herramientas.update(formData.id, { ...formData, estado: false });
            if (success) onClose();
            else alert("Error al eliminar: " + error);
        }
    };

    const grupoSeleccionado = formData.grupo_ids?.[0] ?? null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">

                <div className="bg-slate-900 p-6 text-white flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black">{titulos[tipo]}</h2>
                        <p className="text-slate-400 text-xs uppercase font-bold mt-1">Sistema Los Pinos</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
                </div>

                <form className="p-8 space-y-5 overflow-y-auto flex-1" onSubmit={Guardar}>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nombre Completo / Materia</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre || ''}
                            onChange={capturarDatos}
                            required
                            placeholder="Ej. Juan Pérez / Matemáticas"
                            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    {tipo === 'alumno' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">DNI</label>
                                <input
                                    type="number"
                                    name="dni"
                                    value={formData.dni || ''}
                                    onChange={capturarDatos}
                                    required
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Año / Grado</label>
                                <div className="relative">
                                    <select
                                        name="grupo_id"
                                        value={formData.grupo_id || ''}
                                        onChange={capturarDatos}
                                        required
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none appearance-none transition-all font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="" disabled>Seleccionar grupo...</option>
                                        <option value="1">1er Año</option>
                                        <option value="2">2do Año</option>
                                        <option value="3">3er Año</option>
                                        <option value="4">4to Año</option>
                                        <option value="5">5to Año</option>
                                        <option value="6">6to Año</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                        <span className="text-xs">▼</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {tipo === 'profesor' && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Especialidad (Título)</label>
                            <input
                                type="text"
                                name="especialidad"
                                value={formData.especialidad || ''}
                                onChange={capturarDatos}
                                required
                                placeholder="Ej. Ing. en Sistemas"
                                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none"
                            />
                        </div>
                    )}

                    {tipo === 'materia' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Carga Horaria Semanal</label>
                                <input
                                    type="number"
                                    name="carga_horaria"
                                    value={formData.carga_horaria || ''}
                                    onChange={capturarDatos}
                                    required
                                    placeholder="Ej. 4"
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-3">
                                    Grupo Asignado
                                    {grupoSeleccionado && (
                                        <span className="ml-2 bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs normal-case font-bold">
                                            1 seleccionado
                                        </span>
                                    )}
                                </label>

                                {loadingGrupos ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : grupos.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                                        No hay grupos disponibles
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {grupos.map(grupo => {
                                            const seleccionado = grupoSeleccionado === grupo.id;
                                            return (
                                                <button
                                                    key={grupo.id}
                                                    type="button"
                                                    onClick={() => toggleGrupo(grupo.id)}
                                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all font-bold text-sm cursor-pointer
                                                        ${seleccionado
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {/* Radio visual en lugar de checkbox */}
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                                                        ${seleccionado
                                                            ? 'border-indigo-600 bg-indigo-600'
                                                            : 'border-slate-300'
                                                        }`}
                                                    >
                                                        {seleccionado && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                                                        )}
                                                    </span>
                                                    {grupo.nombre}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {esEdicion && (tipo === 'alumno' || tipo === 'materia') && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Estado del Registro</label>
                            <div className="relative">
                                <select
                                    name="estado"
                                    value={formData.estado !== false ? 'true' : 'false'}
                                    onChange={capturarDatos}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none appearance-none transition-all font-bold text-slate-700 cursor-pointer"
                                >
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                    <span className="text-xs">▼</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>

                        {esEdicion && tipo === 'profesor' && (
                            <button
                                type="button"
                                onClick={handleEliminarProfesor}
                                className="flex-1 py-3 font-black text-red-600 bg-red-100 hover:bg-red-200 rounded-xl transition-all"
                            >
                                ELIMINAR
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={herramientas?.loading}
                            className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {herramientas?.loading ? 'GUARDANDO...' : (esEdicion ? 'ACTUALIZAR' : 'GUARDAR')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}