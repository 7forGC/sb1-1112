import { supabase } from '../config/supabase';

interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    browser: string;
    os: string;
    ip: string;
    location?: string;
  };
  createdAt: number;
  lastActive: number;
  active: boolean;
}

export const sessionService = {
  async createSession(userId: string): Promise<string> {
    const deviceInfo = {
      browser: navigator.userAgent,
      os: navigator.platform,
      ip: await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
    };

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        device_info: deviceInfo,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async getSessions(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (error) throw error;
    return data as Session[];
  },

  async updateSession(sessionId: string) {
    const { error } = await supabase
      .from('sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  },

  async terminateSession(sessionId: string) {
    const { error } = await supabase
      .from('sessions')
      .update({
        active: false,
        terminated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
  },

  async terminateAllOtherSessions(userId: string, currentSessionId: string) {
    const { error } = await supabase
      .from('sessions')
      .update({
        active: false,
        terminated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .neq('id', currentSessionId)
      .eq('active', true);

    if (error) throw error;
  }
};