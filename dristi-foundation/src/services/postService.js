import { supabase } from "./supabaseClient";

const maxPostImageSize = 5 * 1024 * 1024;
const postImageTypes = {
  "image/jpeg": {
    extension: "jpg",
    matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    matches: (bytes) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  "image/webp": {
    extension: "webp",
    matches: (bytes) =>
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
};

async function validatePostImage(file) {
  if (!file || typeof file.slice !== "function") {
    throw new Error("Choose a JPEG, PNG, or WebP image to upload.");
  }
  if (file.size === 0 || file.size > maxPostImageSize) {
    throw new Error("Images must be smaller than 5 MB.");
  }

  const imageType = postImageTypes[file.type];
  if (!imageType) {
    throw new Error("Only JPEG, PNG, and WebP images are supported.");
  }

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!imageType.matches(signature)) {
    throw new Error("The selected file does not match its image type.");
  }

  return imageType;
}

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
  const imageType = await validatePostImage(file);
  const fileId = globalThis.crypto?.randomUUID?.();
  if (!fileId) {
    throw new Error("Secure image upload is not supported by this browser.");
  }

  const fileName = `${fileId}.${imageType.extension}`;
  const { data, error } = await supabase.storage
    .from("post-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}
