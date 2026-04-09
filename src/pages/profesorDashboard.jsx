import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';
import BimestreSelector from '../components/BimestreSelector';
import Tittle from '../components/Tittle';
import { div } from 'motion/react-client';

export default function ProfesorDashboard() {
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [listaTareas, setListaTareas] = useState([]);

    const misMaterias = [
        { id: 1, nombre: 'Matemáticas', curso: '6to Primaria - A', alumnosCount: 25 },
        { id: 2, nombre: 'Física', curso: '5to Secundaria - B', alumnosCount: 18 },
    ];

    const misAlumnos = [
        { id: 1, nombre: 'Juan', apellido: 'Pérez', edad: 12, dni: '12345678A', activo: true, materias: [1,2] },
        { id: 2, nombre: 'María', apellido: 'García', edad: 11, dni: '87654321B', activo: false, materias: [1,2] },
        { id: 3, nombre: 'Luis', apellido: 'Pérez', edad: 12, dni: '12345678A', activo: true, materias: [1,2] },
        { id: 4, nombre: 'Alberto', apellido: 'Gómez', edad: 11, dni: '87654321B', activo: false, materias: [1,2] }
    ];






    return (
        <div className="min-h-screen bg-slate-50 flex">
            <main className="flex-1 p-8">
                
                <header className="mb-8 flex justify-between items-center">
                    <p className="text-slate-400 font-bold">Bienvenido, Prof. Samuel</p>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Ciclo Lectivo 2026
                    </span>
                </header>
                {/*Pendientes*/}
                <section className='m-4 p-4'>
                    <Tittle titulo={'Tareas'} descripcion={'Lista de tareas pendientes'}/>
{listaTareas.length > 0 ? (
    <div className="grid grid-cols-1 gap-4">
        {listaTareas.map((tarea) => (
            <div 
                key={tarea.id} 
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-orange-500 transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {tarea.materia[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{tarea.materia}</h3>
                        <p className="text-xs text-slate-500">{tarea.descripcion}</p>
                    </div>
                </div>
                <button className="text-xs font-black text-indigo-600 hover:underline uppercase">
                    Revisar →
                </button>
            </div>
        ))}
    </div>
) : (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
        <h1 className="text-xl font-black text-slate-800">¡Todo al día, Profe!</h1>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-200px">
            No hay tareas pendientes de calificación por ahora.
        </p>
    </div>
)}
                </section>

                {/*Materias y planillas*/}
                <section className='m-4'>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedMateria} // Clave para que Framer sepa que cambió el contenido
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                {!selectedMateria ? 
                <div className='flex flex-col gap-4 '>
                    <Tittle titulo={'Materias'} descripcion={'Materias a su cargo'}/>
                    {misMaterias.map((materia) => (

                        <div className="group relative flex flex-col p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500 transition-all duration-300">
                            {/* Detalle visual lateral*/}
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-500 rounded-l-2xl group-hover:w-2 transition-all"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        {materia.nombre}
                                    </h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        Planificación 2026
                                    </span>
                                </div>
                                
                                {/* Badge de Alumnos */}
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                    <span className="text-sm">👤</span>
                                    <span className="text-xs font-black text-slate-600">{materia.alumnosCount}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-xs text-slate-500 font-medium italic">
                                    Captura de notas pendiente
                                </p>
                                
                                <Button text={'GESTIONAR NOTAS →'} onClick={()=> setSelectedMateria(materia)}/>

                            </div>
                        </div>

                    ))}
                </div>
                : 
                <div className='flex flex-col gap-6'>
                    <Tittle titulo={'Planilla'} descripcion={selectedMateria.nombre}/>
                    <Button text={'Volver al inicio'} onClick={() => setSelectedMateria(null)}/>
                    <BimestreSelector/>

                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-6 py-4 font-black text-white uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">P1</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">P2</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">P3</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">P4</th>
                                <th className="px-6 py-4 font-black text-white text-center uppercase tracking-wider">P5</th>
                                <th className="px-6 py-4 font-black text-indigo-400 text-center uppercase tracking-wider bg-slate-800">Promedio</th>
                            </tr>
                        </thead>
                        <tbody className='bg-slate-300/20 divide-y divide-slate-100'>
                            
<tr className="hover:bg-slate-200 transition-colors group border-b border-slate-100">
    {/* Nombre del Alumno*/}
    <td className="px-4 py-3 text-left">
        <span className="font-bold text-slate-700 block">Samuel Vega</span>
    </td>

    {/* Celdas de Notas Parciales*/}
    {[1, 2, 3, 4, 5].map((nota) => (
        <td key={nota} className="px-2 py-3">
            <input 
                type="number" 
                placeholder="-" 
                className="w-14 h-10 text-center font-bold text-slate-700 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 appearance-none"
            />
        </td>
    ))}

    {/* Nota Final del Bimestre (Solo lectura o automática) */}
    <td className="px-4 py-3 text-center">
        <div className="w-14 h-10 flex items-center justify-center rounded-xl bg-indigo-50 border-2 border-indigo-100 text-indigo-700 font-black text-lg shadow-sm">
            -
        </div>
    </td>
</tr>
                            
                        </tbody>
                    </table>
                </div>
                }
                        </motion.div>
                    </AnimatePresence>
                </section>

            </main>
        </div>
    )
}