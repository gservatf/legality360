import { supabase } from "./supabaseClient";

// Crear perfil si no existe
export async function createProfileIfNotExists(user: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error buscando perfil:", error);
      return;
    }

    if (!data) {
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          role: "pending",
        },
      ]);

      if (insertError) {
        console.error("Error creando perfil:", insertError);
      } else {
        console.log("Perfil creado para:", user.email);
      }
    }
  } catch (err) {
    console.error("Excepción al crear perfil:", err);
  }
}

// Registro
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) {
    console.error("Error en signUp:", error.message);
    return null;
  }

  if (data.user) {
    await createProfileIfNotExists(data.user);
  }

  return data.user;
}

// Login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error en signIn:", error.message);
    return null;
  }

  if (data.user) {
    await createProfileIfNotExists(data.user);
  }

  return data.user;
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error en signOut:", error.message);
}

// Export authService object that groups all functions
export const authService = {
  signIn,
  signUp,
  signOut,
  createProfileIfNotExists,
};