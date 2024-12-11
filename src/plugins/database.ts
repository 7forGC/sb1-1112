import { supabase } from '../config/supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export const databasePlugin = {
  async query<T>(
    table: string,
    query: (builder: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>
  ): Promise<T[]> {
    const { data, error } = await query(
      supabase.from(table).select('*')
    );

    if (error) throw error;
    return data as T[];
  },

  async insert<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as T;
  },

  async update<T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  },

  async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  onDatabaseChange<T>(
    table: string,
    callback: (payload: T) => void
  ) {
    return supabase
      .channel(`changes_${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => callback(payload.new as T)
      )
      .subscribe();
  }
};