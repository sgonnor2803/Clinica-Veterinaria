import { supabase } from "../config/supabase.js";

export async function registerUser(req, res) {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      error: "Email, password y fullName son requeridos",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signUpWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message,
      });
    }

    const userId = authData.user.id;

    // Crear perfil en la tabla profiles
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        email,
        full_name: fullName,
        role: "client",
      },
    ]);

    if (profileError) {
      return res.status(500).json({
        success: false,
        error: "Error al crear el perfil: " + profileError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: userId,
        email,
        fullName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error en el servidor: " + error.message,
    });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  // Validar datos
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email y password son requeridos",
    });
  }

  try {
    // Login en Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    // Obtener datos del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({
        success: false,
        error: "Error al obtener perfil: " + profileError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name,
        role: profile?.role,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error en el servidor: " + error.message,
    });
  }
}
