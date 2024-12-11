import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const realtimePlugin = {
  subscribeToChannel(
    channelName: string,
    eventHandlers: Record<string, (payload: any) => void>
  ): RealtimeChannel {
    const channel = supabase.channel(channelName);

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      channel.on('broadcast', { event }, ({ payload }) => handler(payload));
    });

    return channel.subscribe();
  },

  async broadcastMessage(
    channel: RealtimeChannel,
    event: string,
    payload: any
  ): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event,
      payload
    });
  },

  unsubscribe(channel: RealtimeChannel): void {
    channel.unsubscribe();
  }
};