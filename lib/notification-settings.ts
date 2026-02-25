import { NotificationSettings } from "@/types/notification";
import { supabase } from "./supabase";

export async function getNotificationSettings(userId: string) {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function createNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>,
) {
  const { data, error } = await supabase
    .from("notification_settings")
    .insert({
      user_id: userId,
      ...settings,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>,
) {
  const { data, error } = await supabase
    .from("notification_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}

export async function upsertNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>,
) {
  const { data, error } = await supabase
    .from("notification_settings")
    .upsert(
      {
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  return { data, error };
}
