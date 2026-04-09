
export default function Card({datos}) {
    return (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
                {datos.map((value, index) => (
                    <div 
                        key={index} 
                        className='group relative flex flex-col p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500 transition-all duration-300 cursor-pointer overflow-hidden'
                    >
                        {/* Un detalle de color lateral para dar jerarquía */}
                        <div className='absolute left-0 top-0 h-full w-1.5 bg-indigo-500 group-hover:w-2 transition-all'></div>
                                            
                        <div className='flex flex-col'>
                            <span className='text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors'>
                                {value.nombre}
                            </span>
                            <span className='text-sm font-medium text-slate-400 uppercase tracking-wider mt-1'>
                                {value.texto}
                                </span>
                        </div>

                        {/* Icono sutil al fondo o acciones que aparecen al hacer hover */}
                        <div className='mt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity'>
                            <span className='text-xs font-semibold text-indigo-500 hover:text-indigo-300'>Eliminar</span>
                            <span className='text-xs font-semibold text-indigo-500 hover:text-indigo-300'>Editar</span>
                        </div>
                    </div>
                ))}
            </div>
    )
}