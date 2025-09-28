import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://utsyujgdlahuegjwpiab.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c3l1amdkbGFodWVnandwaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMzOTMsImV4cCI6MjA3Mzg2OTM5M30.mNNJOlgYdYIYarrbu8CLALqQrfVEWd9eDZp1MN_x-Ls";

export const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

// === LOGIN ===
export async function handleLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // 1. Login
      const { data, error } = await supa.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("User login berhasil:", data.user);

      // 2. Ambil role dari tabel profiles
      const { data: profileData, error: profileError } = await supa
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      console.log("Profile data:", profileData);

      if (!profileData) {
        alert("Akun ini belum memiliki profil. Hubungi admin.");
        return;
      }

      // 3. Simpan role di localStorage
      localStorage.setItem("role", profileData.role);

      // 4. Redirect sesuai role
      if (profileData.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "client.html";
      }
    } catch (err) {
      alert("Login gagal: " + err.message);
      console.error(err);
    }
  });
}

// === CEK HALAMAN BERDASARKAN ROLE ===
export async function checkAdminPage() {
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const { data: profile } = await supa
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    window.location.href = "client.html";
  }
}

export async function checkClientPage() {
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
}

// === LOGOUT ===
export async function logout() {
  await supa.auth.signOut();
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// === LOAD LINKS UNTUK CLIENT ===
export async function loadLinks() {
  const linksContainer = document.getElementById("links");
  if (!linksContainer) return;

  const { data, error } = await supa
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal ambil links:", error);
    return;
  }

  linksContainer.innerHTML = data
    .map(
      (l) => `
      <a href="${l.url}" target="_blank" class="link-card">
        <span class="link-icon">📑</span>
        <div>
          <div>${l.title}</div>
          <small style="color:#6b7280">${l.category ?? "Umum"}</small>
        </div>
      </a>
    `
    )
    .join("");
}

// === ADMIN - TAMBAH & TAMPILKAN LINK ===
export async function loadAdminLinks() {
  const tbody = document.querySelector("#links-table tbody");
  if (!tbody) return;

  const { data, error } = await supa
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal ambil data link:", error);
    return;
  }

  tbody.innerHTML = data
    .map(
      (l) => `
      <tr>
        <td>${l.title}</td>
        <td><a href="${l.url}" target="_blank">${l.url}</a></td>
        <td>${l.category ?? "-"}</td>
        <td><button onclick="deleteLink(${l.id})" class="btn-danger">Hapus</button></td>
      </tr>
    `
    )
    .join("");
}

export async function addLink(title, url, category) {
  const { error } = await supa.from("links").insert([{ title, url, category }]);
  if (error) throw error;
  await loadAdminLinks();
}

export async function deleteLink(id) {
  const { error } = await supa.from("links").delete().eq("id", id);
  if (error) {
    alert("Gagal hapus link: " + error.message);
    return;
  }
  await loadAdminLinks();
}




