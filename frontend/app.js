import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rrmatjtqugrmjurbwrxz.supabase.co",
  "sb_publishable_8EWHi1ME2H68VplEc35aag_A7EhXEgj"
);

// 🟢 LOGIN (GITHUB OAUTH)
window.login = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: window.location.origin
    }
  });
};

// 🔴 LOGOUT
window.logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("token");
};

// 🔐 OBTENER SESIÓN
async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    console.log("No hay sesión activa");
    return null;
  }

  return data.session;
}

// 🟢 FETCH HELP
async function apiCall(url) {
  const session = await getSession();

  if (!session) {
    alert("No estás logueado");
    return;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  const data = await res.json();

  document.getElementById("output").textContent =
    JSON.stringify(data, null, 2);
}

// 🟡 ENDPOINTS BACKEND
window.getProducts = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/products");

window.getPets = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/pets");

window.getOrders = () =>
  apiCall("https://clinica-veterinaria-4iyb.onrender.com/orders");