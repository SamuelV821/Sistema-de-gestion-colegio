import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import AdministradorDashboard from "./pages/administradorDashboard";
import ProfesorDashboard from "./pages/profesorDashboard";
import PadreDashBoard from "./pages/padreDashBoard";

const VISTAS = [
    { path: '/admin',    label: 'Administrador', emoji: '🛠️' },
    { path: '/profesor', label: 'Profesor',       emoji: '📚' },
    { path: '/padre',    label: 'Padre / Alumno', emoji: '👨‍👦' },
];

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50">

                {/* Barra de navegación */}
                <nav className="bg-slate-900 px-6 py-3 flex items-center gap-3 shadow-lg no-print">
                    <span className="text-white font-black text-lg mr-4 tracking-tight">
                        Los Pinos
                    </span>
                    <div className="flex gap-2">
                        {VISTAS.map(({ path, label, emoji }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`
                                }
                            >
                                <span>{emoji}</span>
                                {label}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Rutas */}
                <Routes>
                    <Route path="/"         element={<AdministradorDashboard />} />
                    <Route path="/admin"    element={<AdministradorDashboard />} />
                    <Route path="/profesor" element={<ProfesorDashboard />} />
                    <Route path="/padre"    element={<PadreDashBoard />} />
                </Routes>

            </div>
        </BrowserRouter>
    );
}

export default App;
