import { supabase } from '../config/supabase';
import OpenAI from 'openai';
import type { UserProfile, Message, Group, Story } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const migrateToSupabase = {
  async migrateUsers(users: UserProfile[]) {
    const { error } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'securepassword',
      email_confirm: true
    });

    if (error) throw error;

    for (const user of users) {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'temporaryPassword123!', // Users will need to reset
        email_confirm: true,
        user_metadata: {
          displayName: user.displayName
        }
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          uid: authData.user.id,
          email: user.email,
          display_name: user.displayName,
          photo_url: user.photoURL,
          settings: user.settings,
          created_at: new Date(user.createdAt).toISOString(),
          last_login: new Date(user.lastLogin).toISOString(),
          status: user.status,
          bio: user.bio,
          contacts: user.contacts,
          blocked_users: user.blockedUsers,
          email_verified: user.emailVerified,
          api_key: user.apiKey
        }]);

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      }
    }
  },

  async migrateMessages(messages: Message[]) {
    for (const msg of messages) {
      // Check content with OpenAI moderation
      const moderation = await openai.moderations.create({
        input: msg.content
      });

      if (moderation.results[0].flagged) {
        console.log(`Skipping flagged message ${msg.id}`);
        continue;
      }

      const { error } = await supabase
        .from('messages')
        .insert([{
          id: msg.id,
          sender_id: msg.senderId,
          receiver_id: msg.receiverId,
          content: msg.content,
          language: msg.language,
          created_at: new Date(msg.timestamp).toISOString(),
          translations: msg.translations || {}
        }]);

      if (error) {
        console.error(`Error migrating message ${msg.id}:`, error);
      }
    }
  },

  async migrateGroups(groups: Group[]) {
    for (const group of groups) {
      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{
          id: group.id,
          name: group.name,
          description: group.description,
          avatar_url: group.avatar,
          created_by: group.createdBy,
          created_at: new Date(group.createdAt).toISOString()
        }])
        .select()
        .single();

      if (groupError) {
        console.error(`Error creating group ${group.id}:`, groupError);
        continue;
      }

      // Add members
      for (const member of group.members) {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert([{
            group_id: groupData.id,
            user_id: member.id,
            role: member.role,
            joined_at: new Date(member.joinedAt).toISOString()
          }]);

        if (memberError) {
          console.error(`Error adding member ${member.id} to group ${group.id}:`, memberError);
        }
      }
    }
  },

  async migrateStories(stories: Story[]) {
    for (const story of stories) {
      // Upload media to Supabase storage
      const response = await fetch(story.mediaUrl);
      const blob = await response.blob();
      const fileExt = story.mediaType === 'image' ? 'jpg' : 'mp4';
      const filePath = `stories/${story.userId}/${story.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, blob);

      if (uploadError) {
        console.error(`Error uploading story media ${story.id}:`, uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      // Create story record
      const { error } = await supabase
        .from('stories')
        .insert([{
          id: story.id,
          user_id: story.userId,
          media_url: publicUrl,
          media_type: story.mediaType,
          created_at: new Date(story.createdAt).toISOString(),
          expires_at: new Date(story.expiresAt).toISOString(),
          views: story.views,
          likes: story.likes
        }]);

      if (error) {
        console.error(`Error creating story ${story.id}:`, error);
      }
    }
  },

  async migrateAll(data: {
    users: UserProfile[];
    messages: Message[];
    groups: Group[];
    stories: Story[];
  }) {
    try {
      console.log('Starting migration...');
      
      console.log('Migrating users...');
      await this.migrateUsers(data.users);
      
      console.log('Migrating messages...');
      await this.migrateMessages(data.messages);
      
      console.log('Migrating groups...');
      await this.migrateGroups(data.groups);
      
      console.log('Migrating stories...');
      await this.migrateStories(data.stories);
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
};