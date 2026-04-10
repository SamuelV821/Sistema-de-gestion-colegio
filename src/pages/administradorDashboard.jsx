import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import SideBar from '../components/SideBar';
import Tittle from '../components/Tittle';
import Button from '../components/Button';
import ModalForm from '../components/ModalForm';
import { useAlumnos } from '../hooks/useAlumnos';
import { useMaterias } from '../hooks/useMaterias';
import { useProfesores } from '../hooks/useProfesores';

export default function AdministradorDashboard() {
    // 1. HOOKS DE DATOS
    const { alumnos, loadingAlumno, addAlumno, updateAlumno } = useAlumnos();
    const { materias, loadingMateria, addMateria, updateMateria }  = useMaterias();
    const { profesores, loadingProfesor, addProfesor, updateProfesor } = useProfesores();
    
    // 2. ESTADOS DE UI
    const [activeSection, setActiveSection] = useState('alumnos');
    const [modalConfig, setModalConfig] = useState({ open: false, tipo: '' });
    const [herramientas, setHerramientas] = useState({});
    const [itemAEditar, setItemAEditar] = useState(null);

    // Mapeo de funciones según la sección activa
    const funcionesGuardado = {
        alumno: { data: alumnos, loading: loadingAlumno, add: addAlumno, update: updateAlumno },
        profesor: { data: profesores, loading: loadingProfesor, add: addProfesor, update: updateProfesor },
        materia: { data: materias, loading: loadingMateria, add: addMateria, update: updateMateria }
    };

    // 3. HANDLERS DE MODAL
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
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Estilos inyectados para scrollbars finos en mobile */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            <ModalForm 
                isOpen={modalConfig.open} 
                onClose={cerrarModal} 
                tipo={modalConfig.tipo} 
                herramientas={herramientas}
                itemAEditar={itemAEditar}
                listaMaterias={materias} 
            />

            {/* Sidebar responsivo (Barra inferior en mobile, lateral en desktop) */}
            <SideBar setActiveSection={setActiveSection} activeSection={activeSection}/>

            <main className="flex-1 p-4 sm:p-10 pb-28 md:pb-10 overflow-x-hidden">
                {/* HEADER: Adaptable a mobile */}
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
                    <div className="space-y-1">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Panel Administrativo
                        </span>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                            Gestión de {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                        </h2>
                    </div>
                    <Button 
                        text={`+ Nuevo ${activeSection.slice(0, -1)}`} 
                        onClick={() => abrirModalNuevo(activeSection === 'profesores' ? 'profesor' : activeSection === 'alumnos' ? 'alumno' : 'materia')}
                        className="w-full sm:w-auto px-8 h-14 shadow-2xl shadow-indigo-200 font-black text-xs"
                    />
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* CONTENEDOR DE TABLA CON SCROLL Y BORDES REDONDEADOS */}
                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                
                                {/* ── TABLA ALUMNOS ── */}
                                {activeSection === 'alumnos' && (
                                    <div className="min-w-[850px]">
                                        <div className="grid grid-cols-5 gap-4 px-8 py-5 bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span className="sticky left-0 bg-slate-900 z-10">Nombre</span>
                                            <span>Grupo</span>
                                            <span>DNI</span>
                                            <span>Estado</span>
                                            <span className="text-right">Acciones</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {alumnos.map((value) => (
                                                <div key={value.id} className="grid grid-cols-5 gap-4 px-8 py-6 items-center hover:bg-slate-50 transition-colors group">
                                                    <span className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-sm font-black text-slate-700 uppercase tracking-tighter">
                                                        {value.nombre}
                                                    </span>
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl w-fit">
                                                        ID: {value.grupo_id || '—'}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono tracking-tighter italic">
                                                        {value.dni}
                                                    </span>
                                                    <div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${value.estado !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {value.estado !== false ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={() => abrirModalEditar('alumno', value)} 
                                                            className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black active:scale-90 transition-all shadow-lg hover:bg-indigo-600"
                                                        >
                                                            EDITAR
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── TABLA PROFESORES ── */}
                                {activeSection === 'profesores' && (
                                    <div className="min-w-[700px]">
                                        <div className="grid grid-cols-3 gap-4 px-8 py-5 bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span className="sticky left-0 bg-slate-900 z-10">Docente</span>
                                            <span>Especialidad</span>
                                            <span className="text-right">Acciones</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {profesores.filter(v => v.estado !== false).map((value) => (
                                                <div key={value.id} className="grid grid-cols-3 gap-4 px-8 py-6 items-center hover:bg-slate-50 transition-colors group">
                                                    <span className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-sm font-black text-slate-700 uppercase tracking-tighter">
                                                        {value.nombre}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase">{value.especialidad}</span>
                                                    <div className="flex justify-end">
                                                        <button onClick={() => abrirModalEditar('profesor', value)} className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black active:scale-90 transition-all shadow-lg hover:bg-indigo-600">EDITAR</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── TABLA MATERIAS ── */}
                                {activeSection === 'materias' && (
                                    <div className="min-w-[700px]">
                                        <div className="grid grid-cols-3 gap-4 px-8 py-5 bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span className="sticky left-0 bg-slate-900 z-10">Asignatura</span>
                                            <span>Carga Semanal</span>
                                            <span className="text-right">Acciones</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {materias.map((value) => (
                                                <div key={value.id} className="grid grid-cols-3 gap-4 px-8 py-6 items-center hover:bg-slate-50 transition-colors group">
                                                    <span className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-sm font-black text-slate-700 uppercase tracking-tighter">
                                                        {value.nombre}
                                                    </span>
                                                    <span className="text-xs font-black text-indigo-600 tracking-widest italic">{value.carga_horaria} HS/SEM</span>
                                                    <div className="flex justify-end">
                                                        <button onClick={() => abrirModalEditar('materia', value)} className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black active:scale-90 transition-all shadow-lg hover:bg-indigo-600">EDITAR</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ESTADOS VACÍOS */}
                            {((activeSection === 'alumnos' && alumnos.length === 0) || 
                              (activeSection === 'profesores' && profesores.filter(v => v.estado !== false).length === 0) || 
                              (activeSection === 'materias' && materias.length === 0)) && (
                                <div className="p-20 text-center text-slate-300">
                                    <span className="text-5xl block mb-4">📂</span>
                                    <p className="font-black text-xs uppercase tracking-[0.3em]">Sin registros cargados</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}