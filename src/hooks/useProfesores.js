import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProfesores() {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfesores = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profesores')
                .select('*')
                .order('apellido', { ascending: true });

            if (error) throw error;
            setProfesores(data);
        } catch (error) {
            console.error('Error en profesores:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addProfesor = async (nuevoProfe) => {
        try {
            const { data, error } = await supabase.from('profesores').insert([nuevoProfe]).select();
            if (error) throw error;
            setProfesores((prev) => [...prev, data[0]]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => { fetchProfesores(); }, []);


    const updateProfesor = async (id, cambios) => {
        try {
            const { data, error } = await supabase
                .from('profesores')
                .update(cambios) // cambios puede ser { especialidad: 'Ingeniero en IA' }
                .eq('id', id)
                .select();

            if (error) throw error;

            // Sincronización: Actualizamos solo el docente afectado
            setProfesores((prev) => 
                prev.map((profe) => profe.id === id ? data[0] : profe)
            );
            
            return { success: true };
        } catch (error) {
            console.error('Error al editar profesor:', error.message);
            return { success: false, error: error.message };
        }
    };

    return { profesores, loadingProfesor: loading, addProfesor, updateProfesor, refetch: fetchProfesores };
}