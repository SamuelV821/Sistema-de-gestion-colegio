import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function usePadreDashboard(alumnoId) {
    const [alumno, setAlumno] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!alumnoId) return;

        const fetchDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Datos del alumno + grupo
                const { data: alumnoData, error: alumnoError } = await supabase
                    .from('alumnos')
                    .select('id, nombre, dni, grupo_id, grupos(nombre)')
                    .eq('id', alumnoId)
                    .single();

                if (alumnoError) throw alumnoError;

                // 2. Calificaciones del alumno con datos de la materia
                const { data: califs, error: califsError } = await supabase
                    .from('calificaciones')
                    .select('*, materias(id, nombre)')
                    .eq('alumno_id', alumnoId)
                    .order('materia_id')
                    .order('bimestre');

                if (califsError) throw califsError;

                // 3. Agrupamos por materia
                const materiasMap = {};
                califs.forEach(c => {
                    const materiaId = c.materias.id;
                    if (!materiasMap[materiaId]) {
                        materiasMap[materiaId] = {
                            id: materiaId,
                            nombre: c.materias.nombre,
                            bimestres: { 1: null, 2: null, 3: null, 4: null }
                        };
                    }
                    materiasMap[materiaId].bimestres[c.bimestre] = {
                        parciales: [c.p1, c.p2, c.p3, c.p4, c.p5],
                        promedio: c.promedio,
                        comentario: c.comentario,
                        cerrada: c.cerrada
                    };
                });

                // 4. Calculamos promedio anual por materia
                const materiasFinales = Object.values(materiasMap).map(mat => {
                    const bimestresConNota = [1, 2, 3, 4]
                        .map(b => mat.bimestres[b])
                        .filter(b => b && b.promedio > 0);

                    const promedioAnual = bimestresConNota.length > 0
                        ? parseFloat(
                            (bimestresConNota.reduce((acc, b) => acc + b.promedio, 0) / 4)
                            .toFixed(1)
                          )
                        : null;

                    return { ...mat, promedioAnual };
                });

                setAlumno({
                    ...alumnoData,
                    grupo: alumnoData.grupos?.nombre ?? '—'
                });
                setMaterias(materiasFinales);

            } catch (err) {
                console.error('❌ Error en usePadreDashboard:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDatos();
    }, [alumnoId]);

    return { alumno, materias, loading, error };
}