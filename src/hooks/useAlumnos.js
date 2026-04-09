import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para traer los datos (READ)
    const fetchAlumnos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('alumnos') // Asegurate de que la tabla se llame así en Supabase
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setAlumnos(data);
        } catch (error) {
            console.error('Error extrayendo alumnos:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta una vez al montar el componente
    useEffect(() => {
        fetchAlumnos();
    }, []);

    const addAlumno = async (nuevoAlumno) => {
        try {
            const { data, error } = await supabase
                .from('alumnos')
                .insert([nuevoAlumno]) // nuevoAlumno debe ser { nombre, dni, grado, grupo_id }
                .select(); // Importante para que nos devuelva el registro creado con su ID

            if (error) throw error;
            
            // Actualización: Lo agregamos al estado local
            setAlumnos((prev) => [...prev, data[0]]);
            return { success: true };
        } catch (error) {
            console.error('Error al insertar:', error.message);
            return { success: false, error: error.message };
        }
    };

    const updateAlumno = async (id, cambios) => {
        try {
            const { data, error } = await supabase
                .from('alumnos')
                .update(cambios)
                .eq('id', id)
                .select();

            if (error) throw error;

            // Actualizamos el estado local buscando al alumno por ID
            setAlumnos((prev) => 
                prev.map((alum) => alum.id === id ? data[0] : alum)
            );
            return { success: true };
        } catch (error) {
            console.error('Error al editar:', error.message);
            return { success: false, error: error.message };
        }
    };

    useEffect(() => { fetchAlumnos(); }, []);

    return { alumnos, loadingAlumno: loading, addAlumno, updateAlumno, refetch: fetchAlumnos };
}