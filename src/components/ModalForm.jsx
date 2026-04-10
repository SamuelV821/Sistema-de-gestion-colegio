import { useState, useEffect } from 'react';

// Se agregó listaMaterias a las props
export default function ModalForm({ isOpen, onClose, tipo, herramientas, itemAEditar, listaMaterias }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (itemAEditar) {
                setFormData(itemAEditar);
            } else {
                setFormData({});
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
        
        // Conversión estricta para el booleano del estado
        if (e.target.name === 'estado') {
            valor = valor === 'true';
        }

        setFormData({
            ...formData,
            [e.target.name]: valor
        });
    };

    // Función exclusiva para los checkboxes de materias
    const handleCheckboxMateria = (materiaId) => {
        const seleccionadas = formData.materias_ids || [];
        
        const nuevasMaterias = seleccionadas.includes(materiaId)
            ? seleccionadas.filter(id => id !== materiaId)
            : [...seleccionadas, materiaId];

        setFormData({
            ...formData,
            materias_ids: nuevasMaterias
        });
    };

    const Guardar = async (e) => {
        e.preventDefault();
        
        if (esEdicion && herramientas.update) {
            const { success, error } = await herramientas.update(formData.id, formData);
            if (success) {
                onClose();
            } else {
                alert("Error al actualizar: " + error);
            }
        } else if (!esEdicion && herramientas.add) {
            const { success, error } = await herramientas.add(formData);
            if (success) {
                onClose();
            } else {
                alert("Error al guardar: " + error);
            }
        }
    };

    const handleEliminarProfesor = async () => {
        if (window.confirm("¿Está seguro que desea eliminar a este docente del sistema?")) {
            const { success, error } = await herramientas.update(formData.id, { ...formData, estado: false });
            if (success) {
                onClose();
            } else {
                alert("Error al eliminar: " + error);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black">{titulos[tipo]}</h2>
                        <p className="text-slate-400 text-xs uppercase font-bold mt-1">Sistema Los Pinos</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
                </div>

                <form className="p-8 space-y-5" onSubmit={Guardar}>
                    
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
                        <>
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

                            <div className="mt-4">
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Asignar Materias</label>
                                {/* Contenedor con scroll para evitar que el modal crezca desproporcionadamente */}
                                <div className="max-h-48 overflow-y-auto bg-slate-50 border-2 border-slate-100 rounded-xl p-3 space-y-1">
                                    {listaMaterias && listaMaterias.length > 0 ? (
                                        listaMaterias.map((materia) => (
                                            <label 
                                                key={materia.id} 
                                                className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={(formData.materias_ids || []).includes(materia.id)}
                                                    onChange={() => handleCheckboxMateria(materia.id)}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">{materia.nombre}</span>
                                                <span className="text-xs text-slate-400 ml-auto">{materia.carga_horaria}h</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 text-center py-4">No hay materias creadas aún.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {tipo === 'materia' && (
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