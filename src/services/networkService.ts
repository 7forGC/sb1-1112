import { supabase } from '../config/supabase';

export const networkService = {
  async getNetworkUsage(userId: string) {
    const { data, error } = await supabase
      .from('network_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (!data) {
      // Return default stats if none exist
      const defaultStats = {
        wifi: { downloaded: 0, uploaded: 0, total: 0 },
        mobile: { downloaded: 0, uploaded: 0, total: 0 },
        features: {
          messages: { downloaded: 1024 * 1024 * 5, uploaded: 1024 * 1024 * 2, total: 1024 * 1024 * 7 },
          calls: { downloaded: 1024 * 1024 * 15, uploaded: 1024 * 1024 * 15, total: 1024 * 1024 * 30 },
          media: { downloaded: 1024 * 1024 * 50, uploaded: 1024 * 1024 * 20, total: 1024 * 1024 * 70 }
        },
        total: 1024 * 1024 * 107 // Sum of all features
      };

      await supabase
        .from('network_stats')
        .insert([{
          user_id: userId,
          ...defaultStats
        }]);

      return defaultStats;
    }

    return data;
  },

  async updateNetworkStats(userId: string, stats: any) {
    const { error } = await supabase
      .from('network_stats')
      .upsert({
        user_id: userId,
        ...stats,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async resetNetworkStats(userId: string) {
    const { error } = await supabase
      .from('network_stats')
      .update({
        wifi: { downloaded: 0, uploaded: 0, total: 0 },
        mobile: { downloaded: 0, uploaded: 0, total: 0 },
        features: {},
        total: 0,
        reset_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  },

  async trackDataUsage(userId: string, type: 'wifi' | 'mobile', bytes: number, direction: 'upload' | 'download', feature: string) {
    const { data: stats, error: fetchError } = await supabase
      .from('network_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const updatedStats = {
      ...stats,
      [type]: {
        ...stats[type],
        [direction === 'upload' ? 'uploaded' : 'downloaded']: stats[type][direction === 'upload' ? 'uploaded' : 'downloaded'] + bytes,
        total: stats[type].total + bytes
      },
      features: {
        ...stats.features,
        [feature]: {
          ...stats.features[feature],
          [direction === 'upload' ? 'uploaded' : 'downloaded']: (stats.features[feature]?.[direction === 'upload' ? 'uploaded' : 'downloaded'] || 0) + bytes,
          total: (stats.features[feature]?.total || 0) + bytes
        }
      },
      total: stats.total + bytes
    };

    const { error: updateError } = await supabase
      .from('network_stats')
      .update(updatedStats)
      .eq('user_id', userId);

    if (updateError) throw updateError;
  }
};