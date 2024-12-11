import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';
import type { Group } from '../types';

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Subscribe to groups changes
    const subscription = supabase
      .channel('groups')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
          filter: `created_by=eq.${user.uid}`
        },
        () => {
          // Fetch updated groups when changes occur
          fetchGroups();
        }
      )
      .subscribe();

    // Initial fetch
    fetchGroups();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;

    try {
      // Fetch groups where user is either creator or member
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner (
            user_id,
            role
          )
        `)
        .or(`created_by.eq.${user.uid},group_members.user_id.eq.${user.uid}`)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Fetch members for each group
      const groupsWithMembers = await Promise.all(
        groupsData.map(async (group) => {
          const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select(`
              user_id,
              role,
              profiles:user_id (
                display_name,
                photo_url,
                status
              )
            `)
            .eq('group_id', group.id);

          if (membersError) throw membersError;

          return {
            ...group,
            members: members.map(member => ({
              id: member.user_id,
              role: member.role,
              name: member.profiles.display_name,
              avatar: member.profiles.photo_url,
              status: member.profiles.status
            }))
          };
        })
      );

      setGroups(groupsWithMembers);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: Partial<Group>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name: groupData.name,
        description: groupData.description,
        avatar_url: groupData.avatar,
        created_by: user.uid
      }])
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: data.id,
        user_id: user.uid,
        role: 'admin'
      }]);

    if (memberError) throw memberError;

    return data.id;
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('groups')
      .update({
        name: updates.name,
        description: updates.description,
        avatar_url: updates.avatar
      })
      .eq('id', groupId)
      .eq('created_by', user.uid);

    if (error) throw error;
  };

  const deleteGroup = async (groupId: string) => {
    if (!user) throw new Error('Not authenticated');

    // Delete group members first (due to foreign key constraint)
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    // Delete group messages
    const { error: messagesError } = await supabase
      .from('group_messages')
      .delete()
      .eq('group_id', groupId);

    if (messagesError) throw messagesError;

    // Delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .eq('created_by', user.uid);

    if (error) throw error;
  };

  const addMember = async (groupId: string, userId: string, role: string = 'member') => {
    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userId,
        role
      }]);

    if (error) throw error;
  };

  const removeMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  };

  const updateMemberRole = async (groupId: string, userId: string, role: string) => {
    const { error } = await supabase
      .from('group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  };

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    updateMemberRole
  };
};