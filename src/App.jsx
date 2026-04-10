import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import AdministradorDashboard from "./pages/administradorDashboard";
import ProfesorDashboard from "./pages/profesorDashboard";
import PadreDashBoard from "./pages/padreDashBoard";
import Login from "./pages/Login";

const VISTAS = [
    { path: '/admin',    label: 'Administrador', emoji: '🛠️' },
    { path: '/profesor', label: 'Profesor',       emoji: '📚' },
    { path: '/padre',    label: 'Padre / Alumno', emoji: '👨‍👦' },
];

function App() {
    return (
        <Login/>
    );
}

export default App;
