import { supabase } from '../config/supabase';
import type { UserProfile, UserSettings } from '../types/auth';

const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: {
    mode: 'light',
    primary: '#AB39D2',
    secondary: '#4F46E5',
    chatBackground: 'solid'
  },
  language: 'en',
  notifications: {
    messages: {
      messagePreview: true,
      messageSound: true,
      messageLED: true
    },
    groups: {
      groupPreview: true,
      groupSound: true,
      groupVibrate: true
    },
    calls: {
      callRingtone: 'default',
      callVibrate: true,
      missedCalls: true,
      ringtone: 'default'
    },
    volume: 100
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false
  }
};

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (signInError) throw signInError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', authData.user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      const userProfile: UserProfile = {
        uid: authData.user.id,
        email: authData.user.email!,
        displayName: authData.user.user_metadata.display_name || email.split('@')[0],
        settings: DEFAULT_USER_SETTINGS,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        status: 'online',
        contacts: [],
        blockedUsers: [],
        emailVerified: authData.user.email_confirmed_at !== null,
        apiKey: await this.generateApiKey(authData.user.id)
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([userProfile]);

      if (insertError) throw insertError;
      return userProfile;
    }

    return profile as UserProfile;
  },

  async createUser(email: string, password: string, displayName: string): Promise<UserProfile> {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('User creation failed');

    const userProfile: UserProfile = {
      uid: user.id,
      email: user.email!,
      displayName,
      settings: DEFAULT_USER_SETTINGS,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      status: 'online',
      contacts: [],
      blockedUsers: [],
      emailVerified: false,
      apiKey: await this.generateApiKey(user.id)
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([userProfile]);

    if (profileError) throw profileError;

    return userProfile;
  },

  async signInWithGoogle(): Promise<UserProfile> {
    const { data: { user }, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    if (!user) throw new Error('Google sign in failed');

    return this.getUserProfile(user.id);
  },

  async signInWithFacebook(): Promise<UserProfile> {
    const { data: { user }, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email,public_profile'
      }
    });

    if (error) throw error;
    if (!user) throw new Error('Facebook sign in failed');

    return this.getUserProfile(user.id);
  },

  async verifyEmail(token: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw error;
  },

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('uid', uid);

    if (error) throw error;
  },

  async updateUserAvatar(uid: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${uid}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await this.updateUserProfile(uid, { photoURL: publicUrl });

    return publicUrl;
  },

  async updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('uid', uid);

    if (error) throw error;
  },

  async getUserProfile(uid: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error) throw error;
    if (!data) throw new Error('User profile not found');

    return data as UserProfile;
  },

  async generateApiKey(userId: string): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 11);
    return `user-${userId}-${timestamp}-${randomString}`;
  }
};