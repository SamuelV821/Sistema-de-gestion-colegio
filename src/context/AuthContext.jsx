import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sesion, setSesion]   = useState(undefined);
    const [perfil, setPerfil]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetchPerfil = async (userId) => {
        const { data, error } = await supabase
            .from('perfiles')
            .select('id, nombre_completo, rol')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('❌ Error al obtener perfil:', error.message);
            setPerfil(null);
        } else {
            setPerfil(data);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSesion(session);
            if (session?.user) {
                fetchPerfil(session.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSesion(session);
            if (session?.user) {
                fetchPerfil(session.user.id).finally(() => setLoading(false));
            } else {
                setPerfil(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        setError(null);
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError('Credenciales incorrectas. Verificá tu email y contraseña.');
            setLoading(false);
        }
        // Si tiene éxito, onAuthStateChange actualiza sesion/perfil automáticamente
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ sesion, perfil, loading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook que consumen todos los componentes
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}