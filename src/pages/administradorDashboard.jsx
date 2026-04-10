import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react"
import SideBar from '../components/SideBar';
import Tittle from '../components/Tittle';
import Button from '../components/Button';
import ModalForm from '../components/ModalForm';
import { useAlumnos } from '../hooks/useAlumnos';
import { useMaterias } from '../hooks/useMaterias';
import { useProfesores } from '../hooks/useProfesores';

export default function AdministradorDashboard() {
    const { alumnos, loadingAlumno, addAlumno, updateAlumno } = useAlumnos();
    const { materias, loadingMateria, addMateria, updateMateria }  = useMaterias();
    const { profesores, loadingProfesor, addProfesor, updateProfesor } = useProfesores();
    
    const [activeSection, setActiveSection] = useState('alumnos');
    const [modalConfig, setModalConfig] = useState({ open: false, tipo: '' });
    const [herramientas, setHerramientas] = useState({});
    
    const [itemAEditar, setItemAEditar] = useState(null);

    const funcionesGuardado = {
        alumno: { data: alumnos, loading: loadingAlumno, add: addAlumno, update: updateAlumno },
        profesor: { data: profesores, loading: loadingProfesor, add: addProfesor, update: updateProfesor },
        materia: { data: materias, loading: loadingMateria, add: addMateria, update: updateMateria }
    };

    const abrirModalNuevo = (tipo) => {
        setItemAEditar(null);
        setModalConfig({ open: true, tipo });
        setHerramientas(funcionesGuardado[tipo]);
    };

    const abrirModalEditar = (tipo, item) => {
        setItemAEditar(item);
        setModalConfig({ open: true, tipo });
        setHerramientas(funcionesGuardado[tipo]);
    };

    const cerrarModal = () => {
        setModalConfig({ open: false, tipo: '' });
        setHerramientas({});
        setItemAEditar(null);
    };
    
    return (
        <div className="min-h-screen bg-slate-50 flex">

            <ModalForm 
                isOpen={modalConfig.open} 
                onClose={cerrarModal} 
                tipo={modalConfig.tipo} 
                herramientas={herramientas}
                itemAEditar={itemAEditar}
                listaMaterias={materias} /* <-- CONEXIÓN VITAL PARA LOS CHECKBOXES */
            />

            <SideBar setActiveSection={setActiveSection} activeSection={activeSection}/>

            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-center items-center">
                    <p className="text-slate-400 font-bold">Bienvenido, Administrador</p>
                </header>

                <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >

                    {/* SECCIÓN ALUMNOS */}
                    {activeSection === 'alumnos' && (
                        <div>
                            <Tittle titulo='Lista de Alumnos' descripcion='Información de los alumnos del colegio.' />
                            <Button text={'+ Inscribir Alumno'} onClick={() => abrirModalNuevo('alumno')}/>

                            <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-3">
                                <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <span>Nombre</span>
                                    <span>Grupo (ID)</span>
                                    <span>DNI</span>
                                    <span>Estado</span>
                                    <span className="text-right">Acciones</span>
                                </div>

                                <div className="divide-y divide-slate-200">
                                    {alumnos.map((value) => (
                                        <div key={value.id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors duration-150">
                                            <span className="text-sm font-medium text-slate-700">{value.nombre}</span>
                                            <span className="text-sm text-slate-600">{value.grupo_id || 'Sin Asignar'}</span>
                                            <span className="text-sm text-slate-500 font-mono">{value.dni}</span>
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value.estado !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {value.estado !== false ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="flex flex-row justify-end gap-3">
                                                <Button text="Editar" onClick={() => abrirModalEditar('alumno', value)} />
                                            </div>
                                        </div>
                                    ))}
                                    {alumnos.length === 0 && !loadingAlumno && (
                                        <div className="p-6 text-center text-slate-500">No hay alumnos registrados.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN PROFESORES */}
                    {activeSection === 'profesores' && (
                        <div>
                            <Tittle titulo='Lista de Docentes' descripcion='Información de los profesores del colegio.' />
                            <Button text={'+ Agregar Profesor'} onClick={() => abrirModalNuevo('profesor')}/>

                            <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-3">
                                <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <span>Nombre</span>
                                    <span>Especialidad</span>
                                    <span className="text-right">Acciones</span>
                                </div>
                                <div className="divide-y divide-slate-200">
                                    {profesores.filter(value => value.estado !== false).map((value) => (
                                        <div key={value.id} className="grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors duration-150">
                                            <span className="text-sm font-medium text-slate-700">{value.nombre}</span>
                                            <span className="text-sm text-slate-600">{value.especialidad}</span>
                                            <div className="flex flex-row justify-end gap-3">
                                                <Button text="Editar" onClick={() => abrirModalEditar('profesor', value)} />
                                            </div>
                                        </div>
                                    ))}
                                    {profesores.filter(value => value.estado !== false).length === 0 && !loadingProfesor && (
                                        <div className="p-6 text-center text-slate-500">No hay docentes registrados activos.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MATERIAS */}
                    {activeSection === 'materias' && (
                        <div>
                            <Tittle titulo='Plan de Estudios' descripcion='Gestión de materias y programas académicos del ciclo lectivo.' />
                            <Button text={'+ Nueva Materia'} onClick={() => abrirModalNuevo('materia')}/>

                            <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-3">
                                <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <span>Nombre de la Asignatura</span>
                                    <span>Carga Horaria</span>
                                    <span className="text-right">Acciones</span>
                                </div>
                                <div className="divide-y divide-slate-200">
                                    {materias.map((value) => (
                                        <div key={value.id} className="grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors duration-150">
                                            <span className="text-sm font-medium text-slate-700">{value.nombre}</span>
                                            <span className="text-sm text-slate-600">{value.carga_horaria} horas/sem</span>
                                            <div className="flex flex-row justify-end gap-3">
                                                <Button text="Editar" onClick={() => abrirModalEditar('materia', value)} />
                                            </div>
                                        </div>
                                    ))}
                                    {materias.length === 0 && !loadingMateria && (
                                        <div className="p-6 text-center text-slate-500">No hay materias registradas.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}