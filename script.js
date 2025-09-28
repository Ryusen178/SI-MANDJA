import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://utsyujgdlahuegjwpiab.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c3l1amdkbGFodWVnandwaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMzOTMsImV4cCI6MjA3Mzg2OTM5M30.mNNJOlgYdYIYarrbu8CLALqQrfVEWd9eDZp1MN_x-Ls";
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

// === LOGIN ===
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Login dengan email & password
    const { data, error } = await supa.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login gagal: " + error.message);
      return;
    }

    const userId = data.user.id;

    // Ambil role user dari tabel users berdasarkan UID
    const { data: userData, error: userError } = await supa
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !userData) {
      alert("Role user tidak ditemukan, pastikan tabel users sudah diisi!");
      return;
    }

    localStorage.setItem("role", userData.role);

    // Redirect sesuai role
    if (userData.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "client.html";
    }
  });
}

// === LOAD LINKS UNTUK CLIENT ===
const linksContainer = document.getElementById("links");
if (linksContainer) {
  loadLinks();
}

async function loadLinks() {
  const { data, error } = await supa.from("links").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }

  linksContainer.innerHTML = data.map(l => `
    <a href="${l.url}" target="_blank" class="link-card">
      <span class="link-icon">📑</span>
      <div>
        <div>${l.title}</div>
        <small style="color:#6b7280">${l.category ?? "Umum"}</small>
      </div>
    </a>
  `).join("");
}

// === ADMIN - TAMBAH LINK ===
const addLinkForm = document.getElementById("add-link-form");
if (addLinkForm) {
  addLinkForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const category = document.getElementById("category").value;

    const { error } = await supa.from("links").insert([{ title, url, category }]);
    if (error) {
      alert("Gagal tambah link: " + error.message);
      return;
    }
    loadAdminLinks();
    addLinkForm.reset();
  });

  loadAdminLinks();
}

async function loadAdminLinks() {
  const { data, error } = await supa.from("links").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.querySelector("#links-table tbody");
  tbody.innerHTML = data.map(l => `
    <tr>
      <td>${l.title}</td>
      <td><a href="${l.url}" target="_blank">${l.url}</a></td>
      <td>${l.category ?? "-"}</td>
      <td><button onclick="deleteLink(${l.id})" class="btn-danger">Hapus</button></td>
    </tr>
  `).join("");
}

async function deleteLink(id) {
  const { error } = await supa.from("links").delete().eq("id", id);
  if (error) {
    alert("Gagal hapus link: " + error.message);
    return;
  }
  loadAdminLinks();
}

// === LOGOUT ===
async function logout() {
  await supa.auth.signOut();
  localStorage.removeItem("role");
  window.location.href = "index.html";
}

// === RENDER MENU DI INDEX ===
document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role"); 
  const menuDiv = document.getElementById("menu");

  if (menuDiv) {
    if (role === "admin") {
      menuDiv.innerHTML = `
        <a href="admin.html" class="btn">Kelola Data (CRUD)</a>
        <a href="laporan.html" class="btn">Laporan</a>
        <a href="formulir.html" class="btn">Formulir</a>
      `;
    } else if (role === "client") {
      menuDiv.innerHTML = `
        <a href="client.html" class="btn">Lihat Data</a>
        <a href="formulir.html" class="btn">Formulir</a>
      `;
    } else {
      menuDiv.innerHTML = `<p>Silakan login untuk melihat menu.</p>`;
    }
  }
});


