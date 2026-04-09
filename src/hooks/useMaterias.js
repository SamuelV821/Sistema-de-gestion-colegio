import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useMaterias() {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMaterias = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('materias')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setMaterias(data);
        } catch (error) {
            console.error('Error en materias:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addMateria = async (nuevaMateria) => {
        try {
            const { data, error } = await supabase.from('materias').insert([nuevaMateria]).select();
            if (error) throw error;
            setMaterias((prev) => [...prev, data[0]]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => { fetchMaterias(); }, []);

    const updateMateria = async (id, cambios) => {
        try {
            const { data, error } = await supabase
                .from('materias')
                .update(cambios) // cambios es un objeto, ej: { nombre: 'Física II' }
                .eq('id', id)
                .select();

            if (error) throw error;

            // Sincronización: Actualizamos el estado local inmediatamente
            setMaterias((prev) => 
                prev.map((mat) => mat.id === id ? data[0] : mat)
            );
            
            return { success: true };
        } catch (error) {
            console.error('Error al editar materia:', error.message);
            return { success: false, error: error.message };
        }
    };

    return { materias, loadingMateria: loading, addMateria, updateMateria, refetch: fetchMaterias };
}