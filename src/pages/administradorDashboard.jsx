import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react"
import SideBar from '../components/SideBar';
import Tittle from '../components/Tittle';
import Card from '../components/Card';
import Button from '../components/Button';

export default function AdministradorDashboard() {

    const [activeSection, setActiveSection] = useState('alumnos');

    const [materias, setMaterias] = useState([
        { id: 1, nombre: 'Matemáticas', texto:'Materia Curricular' },
        { id: 2, nombre: 'Español', texto:'Materia Curricular' },
        { id: 3, nombre: 'Ciencias', texto:'Materia Curricular' },
        { id: 4, nombre: 'Historia', texto:'Materia Curricular' }
    ]);

    const [profesores, setProfesores] = useState([
        { id: 1, nombre: 'Alberto Gómez', texto: 'Matemáticas' },
        { id: 2, nombre: 'Juan Pérez', texto: 'Matemáticas' },
        { id: 3, nombre: 'María García', texto: 'Ciencias' },
        { id: 4, nombre: 'Luis Pérez', texto: 'Ciencias' }
    ]);

    const [alumnos, setAlumnos] = useState([
        { id: 1, nombre: 'Juan', apellido: 'Pérez', edad: 12, dni: '12345678A', activo: true },
        { id: 2, nombre: 'María', apellido: 'García', edad: 11, dni: '87654321B', activo: false },
        { id: 3, nombre: 'Luis', apellido: 'Pérez', edad: 12, dni: '12345678A', activo: true },
        { id: 4, nombre: 'Alberto', apellido: 'Gómez', edad: 11, dni: '87654321B', activo: false }
    ]);

    return (
        <div className="min-h-screen bg-slate-50 flex">

            <SideBar setActiveSection={setActiveSection} activeSection={activeSection}/>

            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-center items-center">
                    <p className="text-slate-400 font-bold">Bienvenido, Administrador</p>
                </header>

                <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection} // Clave para que Framer sepa que cambió el contenido
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

                            <Button text={'+ Inscribir Alumno'}/>

                            <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            {/* Cabecera - Usamos grid para alineación perfecta */}
                            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <span>Nombre</span>
                                <span>Edad</span>
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
                                    <span className="text-sm text-slate-600">{value.edad} años</span>

                                    {/* DNI */}
                                    <span className="text-sm text-slate-500 font-mono">{value.dni}</span>

                                    {/* Estado con Badge */}
                                    <div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        value.activo
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {value.activo ? 'Activo' : 'Inactivo'}
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

                            <Button text={'+ Agregar Profesor'}/>

                            <Card datos={profesores}/>
                        </div>
                    )}

                    {activeSection === 'materias' && (
                        <div>
                            <Tittle 
                            titulo='Plan de Estudios' 
                            descripcion='Gestión de materias y programas académicos del ciclo lectivo.'
                            />
                            
                            <Button text={'+ Nueva Materia'}/>

                            <Card datos={materias}/>
                        </div>
                    )}

                </motion.div>
                </AnimatePresence>
                
            </main>
        </div>
    )
}
