import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
    const [sesion, setSesion]   = useState(undefined); // undefined = cargando
    const [perfil, setPerfil]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // Carga el perfil (rol) desde la tabla perfiles
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
        // Sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSesion(session);
            if (session?.user) {
                fetchPerfil(session.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Escucha cambios de sesión (login / logout)
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
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return { sesion, perfil, loading, error, login, logout };
}