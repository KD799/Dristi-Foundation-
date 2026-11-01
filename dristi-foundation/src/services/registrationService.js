import { supabase } from "./supabaseClient";

export async function createRegistration(registration) {
  const { data, error } = await supabase
    .from("registrations")
    .insert(registration)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyRegistrations(userId) {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, events(*), posts(id, title, work_category, application_category, application_category_label)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, events(*), posts(id, title, work_category, application_category, application_category_label), profiles(full_name, phone)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateRegistrationStatus(id, status) {
  const { data, error } = await supabase
    .from("registrations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
