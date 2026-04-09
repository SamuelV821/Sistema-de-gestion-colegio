import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react"
import { supabase } from '../lib/supabaseClient';
import SideBar from '../components/SideBar';
import Tittle from '../components/Tittle';
import Card from '../components/Card';
import Button from '../components/Button';
import ModalForm from '../components/ModalForm';
import { useAlumnos } from '../hooks/useAlumnos';
import { useMaterias } from '../hooks/useMaterias';
import { useProfesores } from '../hooks/useProfesores';

export default function AdministradorDashboard() {
    const { alumnos, loadingAlumno, addAlumno, updateAlumno} = useAlumnos();
    const { materias, loadingMateria, addMateria, updateMateria}  = useMaterias();
    const { profesores, loadingProfesor, addProfesor, updateProfesor } = useProfesores();
    const [activeSection, setActiveSection] = useState('alumnos');
    const [modalConfig, setModalConfig] = useState({ open: false, tipo: '' });



    const abrirModal = (tipo) => setModalConfig({ open: true, tipo });
    const cerrarModal = () => setModalConfig({ open: false, tipo: '' });

    return (
        <div className="min-h-screen bg-slate-50 flex">

            <ModalForm isOpen={modalConfig.open} onClose={cerrarModal} tipo={modalConfig.tipo}/>

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

                    {activeSection === 'alumnos' && (
                        <div>
                            
                            <Tittle 
                            titulo='Lista de Alumnos'
                            descripcion='Informacion de los alumnos del colegio.'
                            />

                            <Button text={'+ Inscribir Alumno'} onClick={() => abrirModal('alumno')}/>

                            <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-3">
                            {/* Cabecera - Usamos grid para alineación perfecta */}
                            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <span>Nombre</span>
                                <span>Grupo</span>
                                <span>DNI</span>
                                <span>Estado</span>
                                <span className="text-right">Acciones</span>
                            </div>

                            {/* Cuerpo de la lista */}
                            <div className="divide-y divide-slate-200">
                                {alumnos.map((value, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors duration-150 group"
                                >
                                    {/* Nombre */}
                                    <span className="text-sm font-medium text-slate-700">{value.nombre}</span>

                                    {/* Edad */}
                                    <span className="text-sm text-slate-600">{value.grupo_id}</span>

                                    {/* DNI */}
                                    <span className="text-sm text-slate-500 font-mono">{value.dni}</span>

                                    {/* Estado con Badge */}
                                    <div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        value.estado
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {value.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-row justify-end gap-3">
                                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                        Editar
                                    </button>
                                    <button className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                                        Deshabilitar
                                    </button>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>

                        </div>
                    )}

                    {activeSection === 'profesores' && (
                        <div>
                            <Tittle 
                            titulo='Lista de Docentes'
                            descripcion='Informacion de los profesores del colegio.'
                            />

                            <Button text={'+ Agregar Profesor'} onClick={() => abrirModal('profesor')}/>

                            <Card datos={profesores}/>
                        </div>
                    )}

                    {activeSection === 'materias' && (
                        <div>
                            <Tittle 
                            titulo='Plan de Estudios' 
                            descripcion='Gestión de materias y programas académicos del ciclo lectivo.'
                            />
                            
                            <Button text={'+ Nueva Materia'} onClick={() => abrirModal('materia')}/>

                            <Card datos={materias}/>
                        </div>
                    )}

                </motion.div>
                </AnimatePresence>
                
            </main>
        </div>
    )
}
