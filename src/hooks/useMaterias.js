import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useMaterias() {
    const [materias, setMaterias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMaterias = async () => {
        try {
            setLoading(true);
            const [materiasRes, gruposMateriasRes, gruposRes] = await Promise.all([
                supabase.from('materias').select('*').order('nombre', { ascending: true }),
                supabase.from('grupos_materias').select('*'),
                supabase.from('grupos').select('*').order('nombre', { ascending: true })
            ]);

            if (materiasRes.error) throw materiasRes.error;
            if (gruposMateriasRes.error) throw gruposMateriasRes.error;
            if (gruposRes.error) throw gruposRes.error;

            // Enriquecemos cada materia con sus grupo_ids asociados
            const materiasEnriquecidas = materiasRes.data.map(materia => ({
                ...materia,
                grupo_ids: gruposMateriasRes.data
                    .filter(gm => gm.materia_id === materia.id)
                    .map(gm => gm.grupo_id)
            }));

            setMaterias(materiasEnriquecidas);
            setGrupos(gruposRes.data);
        } catch (error) {
            console.error('❌ Error en materias:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addMateria = async (nuevaMateria) => {
        try {
            const { grupo_ids, ...materiaData } = nuevaMateria;

            const { data, error } = await supabase.from('materias').insert([materiaData]).select();
            if (error) throw error;

            const nuevaMateriaId = data[0].id;

            // Insertamos las relaciones en grupos_materias
            if (grupo_ids && grupo_ids.length > 0) {
                const relaciones = grupo_ids.map(gid => ({
                    grupo_id: gid,
                    materia_id: nuevaMateriaId
                }));
                const { error: relError } = await supabase.from('grupos_materias').insert(relaciones);
                if (relError) throw relError;
            }

            setMaterias(prev => [...prev, { ...data[0], grupo_ids: grupo_ids || [] }]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateMateria = async (id, cambios) => {
        try {
            const { grupo_ids, ...materiaData } = cambios;

            const { data, error } = await supabase
                .from('materias')
                .update(materiaData)
                .eq('id', id)
                .select();

            if (error) throw error;

            // Reemplazamos las relaciones: borramos las viejas e insertamos las nuevas
            if (grupo_ids !== undefined) {
                const { error: delError } = await supabase
                    .from('grupos_materias')
                    .delete()
                    .eq('materia_id', id);
                if (delError) throw delError;

                if (grupo_ids.length > 0) {
                    const relaciones = grupo_ids.map(gid => ({
                        grupo_id: gid,
                        materia_id: id
                    }));
                    const { error: insError } = await supabase.from('grupos_materias').insert(relaciones);
                    if (insError) throw insError;
                }
            }

            setMaterias(prev =>
                prev.map(mat =>
                    mat.id === id
                        ? { ...data[0], grupo_ids: grupo_ids ?? mat.grupo_ids }
                        : mat
                )
            );

            return { success: true };
        } catch (error) {
            console.error('❌ Error al editar materia:', error.message);
            return { success: false, error: error.message };
        }
    };

    useEffect(() => { fetchMaterias(); }, []);

    return { materias, grupos, loadingMateria: loading, addMateria, updateMateria, refetch: fetchMaterias };
}