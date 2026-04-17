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
});