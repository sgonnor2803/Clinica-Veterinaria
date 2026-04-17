import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rrmatjtqugrmjurbwrxz.supabase.co",
  "sb_publishable_8EWHi1ME2H68VplEc35aag_A7EhXEgj"
);

// 🎯 Utilidades UI
function showAlert(type, message) {
  const alertId = `${type}Alert`;
  const alert = document.getElementById(alertId);
  alert.textContent = message;
  alert.classList.add("show");

  if (type !== "error") {
    setTimeout(() => alert.classList.remove("show"), 3000);
  }
}

function clearAlert(type) {
  const alert = document.getElementById(`${type}Alert`);
  alert.classList.remove("show");
  alert.textContent = "";
}

// Modal functions
function openSignupModal() {
  document.getElementById("signupModal").classList.add("show");
  document.getElementById("signupError").classList.remove("show");
}

function closeSignupModal() {
  document.getElementById("signupModal").classList.remove("show");
  document.getElementById("signupError").classList.remove("show");
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("fullName").value = "";
  document.getElementById("role").value = "";
}

window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;

function clearOutput() {
  document.getElementById("output").textContent = "Esperando consultas...";
}

function setOutput(data) {
  const output = document.getElementById("output");
  if (typeof data === "string") {
    output.textContent = data;
  } else {
    output.textContent = JSON.stringify(data, null, 2);
  }
}

function setLoading(isLoading) {
  document.querySelectorAll(".btn-action").forEach(btn => {
    btn.disabled = isLoading;
  });
}

// 🔐 AUTENTICACIÓN
window.login = async () => {
  try {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "https://clinica-veterinaria-frontend-1ydn.onrender.com"
      }
    });
  } catch (error) {
    showAlert("error", "Error al iniciar sesión: " + error.message);
    console.error(error);
    setLoading(false);
  }
};

// 🔴 LOGOUT
window.logout = async () => {
  try {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    updateStatusIndicator();
    clearOutput();
    showAlert("success", "Sesión cerrada correctamente");
    setLoading(false);
  } catch (error) {
    showAlert("error", "Error al cerrar sesión: " + error.message);
    console.error(error);
    setLoading(false);
  }
};

// ✏️ REGISTRARSE
window.handleSignup = async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const fullName = document.getElementById("fullName").value;
  const role = document.getElementById("role").value;
  const errorDiv = document.getElementById("signupError");

  // Limpiar error previo
  errorDiv.classList.remove("show");
  errorDiv.textContent = "";

  // Validaciones
  if (!email || !password || !confirmPassword || !fullName || !role) {
    errorDiv.textContent = "Por favor completa todos los campos";
    errorDiv.classList.add("show");
    return;
  }

  if (password !== confirmPassword) {
    errorDiv.textContent = "Las contraseñas no coinciden";
    errorDiv.classList.add("show");
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = "La contraseña debe tener al menos 6 caracteres";
    errorDiv.classList.add("show");
    return;
  }

  try {
    setLoading(true);

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario");
    }

    // 2. Crear perfil en la tabla profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          created_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error("Error creando perfil:", profileError);
      // Nota: El usuario se creó pero el perfil falló
      // Esto puede ocurrir si ya existe un perfil
    }

    // Limpiar formulario
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("confirmPassword").value = "";
    document.getElementById("fullName").value = "";
    document.getElementById("role").value = "";

    closeSignupModal();
    showAlert("success", `✓ Cuenta creada! Bienvenido ${fullName}. Por favor inicia sesión.`);

  } catch (error) {
    console.error("Error en signup:", error);
    errorDiv.textContent = error.message || "Error al registrarse. Intenta más tarde.";
    errorDiv.classList.add("show");
  } finally {
    setLoading(false);
  }
};

// 🔐 OBTENER SESIÓN
async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session;
  } catch (error) {
    console.error("Error obteniendo sesión:", error);
    return null;
  }
}

// 📊 ACTUALIZAR INDICADOR DE ESTADO
async function updateStatusIndicator() {
  const session = await getSession();
  const indicator = document.getElementById("statusIndicator");

  if (session) {
    indicator.textContent = `🟢 Autenticado como: ${session.user?.email || "Usuario"}`;
    indicator.className = "status authenticated";
  } else {
    indicator.textContent = "🔴 No autenticado";
    indicator.className = "status unauthenticated";
  }
}

// 🟢 FETCH HELP
async function apiCall(url, method = "GET") {
  clearAlert("error");
  clearAlert("success");
  clearAlert("info");

  const session = await getSession();

  if (!session) {
    showAlert("error", "Debes iniciar sesión para acceder a los datos");
    clearOutput();
    return null;
  }

  try {
    setLoading(true);
    setOutput("Cargando... ⏳");

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
    }

    setOutput(data);
    showAlert("success", "Datos obtenidos correctamente ✓");
    return data;
  } catch (error) {
    console.error("Error en apiCall:", error);
    setOutput("Error: " + error.message);
    showAlert("error", "No se pudieron obtener los datos: " + error.message);
    return null;
  } finally {
    setLoading(false);
  }
}

// 🟡 ENDPOINTS BACKEND
window.getProducts = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/products");

window.getPets = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/pets");

window.getOrders = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/orders");

window.getAppointments = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/appointments");

// 🎬 INICIALIZAR AL CARGAR LA PÁGINA
window.addEventListener("load", async () => {
  await updateStatusIndicator();

  // Cerrar modal al hacer clic fuera
  const modal = document.getElementById("signupModal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeSignupModal();
    }
  });
});
