import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmaiszsqlkapfkbvttjv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYWlzenNxbGthcGZrYnZ0dGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDg0NDUsImV4cCI6MjA3MDc4NDQ0NX0.zPXxj2FFnaymo6x9l3uLlC6VdOkH3L58Du-lP7PZRAo';


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          picture: string;
          updated_at: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          picture?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          picture?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Relationships: []
      }
      user_data: {
        Row: {
          user_id: string;
          app_data: Json | null;
          settings: Json | null;
          updated_at: string;
          created_at: string;
        }
        Insert: {
          user_id: string;
          app_data?: Json | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          user_id?: string;
          app_data?: Json | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "user_data_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      friendships: {
        Row: {
          user_id_1: string;
          user_id_2: string;
          status: "pending" | "accepted";
          action_by_user_id: string;
          created_at: string;
        }
        Insert: {
          user_id_1: string;
          user_id_2: string;
          status: "pending" | "accepted";
          action_by_user_id: string;
          created_at?: string;
        }
        Update: {
          user_id_1?: string;
          user_id_2?: string;
          status?: "pending" | "accepted";
          action_by_user_id?: string;
          created_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "friendships_action_by_user_id_fkey"
            columns: ["action_by_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_1_fkey"
            columns: ["user_id_1"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_2_fkey"
            columns: ["user_id_2"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          id: string;
          name: string;
          type: "family" | "friends";
          created_by: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          name: string;
          type: "family" | "friends";
          created_by: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          name?: string;
          type?: "family" | "friends";
          created_by?: string;
          created_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          sharing_settings: Json | null;
          joined_at: string;
        }
        Insert: {
          group_id: string;
          user_id: string;
          sharing_settings?: Json | null;
          joined_at?: string;
        }
        Update: {
          group_id?: string;
          user_id?: string;
          sharing_settings?: Json | null;
          joined_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_invitations: {
        Row: {
          id: string;
          group_id: string;
          inviter_id: string;
          invitee_id: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          inviter_id: string;
          invitee_id: string;
          status: "pending" | "accepted" | "declined";
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          inviter_id?: string;
          invitee_id?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
        };
        Relationships: [
            {
                foreignKeyName: "group_invitations_group_id_fkey",
                columns: ["group_id"],
                referencedRelation: "groups",
                referencedColumns: ["id"],
            },
            {
                foreignKeyName: "group_invitations_inviter_id_fkey",
                columns: ["inviter_id"],
                referencedRelation: "profiles",
                referencedColumns: ["id"],
            },
            {
                foreignKeyName: "group_invitations_invitee_id_fkey",
                columns: ["invitee_id"],
                referencedRelation: "profiles",
                referencedColumns: ["id"],
            }
        ];
      }
      group_activity: {
        Row: {
          id: string;
          created_at: string;
          group_id: string;
          icon: string | null;
          message: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          group_id: string;
          icon?: string | null;
          message: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          group_id?: string;
          icon?: string | null;
          message?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_activity_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_activity_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: Record<string, never>
        Returns: undefined
      }
      get_discoverable_users: {
        Args: Record<string, never>
        Returns: { id: string; name: string | null; picture: string | null; }[]
      }
      get_user_friends: {
        Args: Record<string, never>
        Returns: {
            id: string,
            name: string,
            picture: string,
            status: "pending" | "accepted",
            action_by_user_id: string
        }[]
      }
      get_user_groups: {
        Args: Record<string, never>
        Returns: {
          id: string
          name: string
          type: "family" | "friends"
          created_by: string
          members: { id: string; name: string; picture: string; }[]
        }[]
      }
      get_user_invitations: {
        Args: Record<string, never>
        Returns: { id: string; group_id: string; group_name: string; inviter_id: string; inviter_name: string | null; status: "pending" | "accepted" | "declined"; }[]
      }
      get_shared_user_data: {
        Args: {
          target_user_id: string;
          group_id_context: string;
        };
        Returns: Json;
      };
      is_member_of_group: {
        Args: {
            group_id_to_check: string;
        };
        Returns: boolean;
      };
    }
    Enums: {
      friendship_status: "pending" | "accepted"
      invitation_status: "pending" | "accepted" | "declined"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);