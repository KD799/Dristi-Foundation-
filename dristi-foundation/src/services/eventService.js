import { supabase } from "./supabaseClient";

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getEvent(id) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getOpenEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("registration_open", true)
    .order("event_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createEvent(event) {
  const { data, error } = await supabase.from("events").insert(event).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
