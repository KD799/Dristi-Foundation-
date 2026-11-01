import { supabase } from "./supabaseClient";

export async function getPosts(type = null) {
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUpdatePosts() {
  return getPosts("update");
}

export async function getWorkPosts() {
  return getPosts("our_work");
}

export async function getPost(id) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPost(post) {
  const { data, error } = await supabase.from("posts").insert(post).select().single();
  if (error) throw error;
  return data;
}

export async function updatePost(id, updates) {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPostImage(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("post-images")
    .upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}
