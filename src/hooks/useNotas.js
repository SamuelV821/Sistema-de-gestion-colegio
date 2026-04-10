import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useNotas() {
    const [loadingNotas, setLoadingNotas] = useState(false);

    const obtenerCalificaciones = async (materiaId, bimestre) => {
        try {
            setLoadingNotas(true);
            const { data, error } = await supabase
                .from('calificaciones')
                .select('*')
                .eq('materia_id', materiaId)
                .eq('bimestre', bimestre);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al obtener calificaciones:', error.message);
            return { success: false, data: [] };
        } finally {
            setLoadingNotas(false);
        }
    };

    const guardarCalificaciones = async (loteDeNotas) => {
        try {
            setLoadingNotas(true);
            const { error } = await supabase
                .from('calificaciones')
                .upsert(loteDeNotas, { onConflict: 'alumno_id,materia_id,bimestre' }); 

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error al guardar la planilla:', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotas(false);
        }
    };

    return { guardarCalificaciones, obtenerCalificaciones, loadingNotas };
}