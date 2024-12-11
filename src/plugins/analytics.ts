import { supabase } from '../config/supabase';

export const analyticsPlugin = {
  async logEvent(
    userId: string,
    eventName: string,
    eventData: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('analytics_events')
      .insert([{
        user_id: userId,
        event_name: eventName,
        event_data: eventData,
        timestamp: new Date().toISOString()
      }]);

    if (error) throw error;
  },

  async getUserEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};