import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas
import Login from './pages/Login';
import AdministradorDashboard from './pages/administradorDashboard';
import ProfesorDashboard from './pages/profesorDashboard';
import PadreDashBoard from './pages/padreDashBoard';

// ── CONFIGURACIÓN DE ROLES ───────────────────────────────────────────────────
const RUTA_POR_ROL = {
    'Administrador': '/admin',
    'Profesor':      '/profesor',
    'Padre':         '/padre',
};

// ── COMPONENTES DE INTERFAZ ──────────────────────────────────────────────────

const Cargando = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Verificando Identidad...</p>
        </div>
    </div>
);

/**
 * Layout con Navbar y Botón de Cerrar Sesión
 */
function Layout({ children }) {
    const { perfil, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-slate-900 text-white shadow-xl px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🌲</span>
                    <span className="font-black tracking-tighter text-xl hidden xs:block">LOS PINOS</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* Info del Perfil */}
                    <div className="text-right hidden sm:block border-r border-slate-700 pr-6">
                        <p className="text-xs font-black uppercase leading-none">{perfil?.nombre_completo}</p>
                        <p className="text-[10px] text-indigo-400 font-bold tracking-widest mt-1 uppercase">{perfil?.rol}</p>
                    </div>

                    {/* BOTÓN CERRAR SESIÓN */}
                    <button 
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-400 rounded-xl text-xs font-black transition-all group"
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                        <span className="hidden md:inline">CERRAR SESIÓN</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-4 sm:p-8">
                {children}
            </main>
        </div>
    );
}

// ── COMPONENTES DE PROTECCIÓN ────────────────────────────────────────────────

function RutaProtegida({ children, rolRequerido }) {
    const { sesion, perfil, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Cargando />;
    if (!sesion) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!perfil) return <Cargando />;

    if (rolRequerido && perfil.rol !== rolRequerido) {
        return <Navigate to={RUTA_POR_ROL[perfil.rol] || '/login'} replace />;
    }

    // Envolvemos el contenido en el Layout si el acceso es concedido
    return <Layout>{children}</Layout>;
}

function RutaPublica({ children }) {
    const { sesion, perfil, loading } = useAuth();
    if (loading) return <Cargando />;
    if (sesion && perfil) return <Navigate to={RUTA_POR_ROL[perfil.rol] || '/'} replace />;
    return children;
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

function AppRoutes() {
    const { sesion, perfil, loading } = useAuth();

    if (loading) return <Cargando />;

    return (
        <Routes>
            <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

            <Route path="/" element={
                !sesion 
                    ? <Navigate to="/login" replace /> 
                    : <Navigate to={RUTA_POR_ROL[perfil?.rol] || '/login'} replace />
            } />

            <Route path="/admin" element={
                <RutaProtegida rolRequerido="Administrador">
                    <AdministradorDashboard />
                </RutaProtegida>
            } />

            <Route path="/profesor" element={
                <RutaProtegida rolRequerido="Profesor">
                    <ProfesorDashboard />
                </RutaProtegida>
            } />

            <Route path="/padre" element={
                <RutaProtegida rolRequerido="Padre">
                    <PadreDashBoard />
                </RutaProtegida>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;