import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface UpdateProfileParams {
  username: string;
  avatar: string;
  password?: string;
  currentUserMetadata: any;
}

export const accountService = {
  async updateProfile({ username, avatar, password, currentUserMetadata }: UpdateProfileParams): Promise<Session | null> {
    const updates: any = {
      data: {
        ...currentUserMetadata,
        username,
        avatar
      }
    };

    if (password && password.trim()) {
      updates.password = password;
    }

    const { error: updateError } = await supabase.auth.updateUser(updates);
    if (updateError) throw updateError;

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    return session;
  }
};