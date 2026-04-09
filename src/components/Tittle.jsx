
export default function Tittle({titulo,descripcion}) {
    return (
        <div className="mb-8 flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="h-8 w-1.5 rounded-full bg-indigo-600"></span>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {titulo}
                </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium ml-3.5">
                {descripcion}
            </p>
        </div>
    )
}