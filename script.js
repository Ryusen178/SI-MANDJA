// === Supabase Init ===
const { createClient } = supabase;
const SUPABASE_URL = "https://utsyujgdlahuegjwpiab.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c3l1amdkbGFodWVnandwaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMzOTMsImV4cCI6MjA3Mzg2OTM5M30.mNNJOlgYdYIYarrbu8CLALqQrfVEWd9eDZp1MN_x-Ls";
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

// === Login ===
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supa.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      document.getElementById("error-message").innerText = error.message;
      return;
    }

    // cek role di tabel users
    const { data: userData } = await supa
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    if (userData?.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "client.html";
    }
  });
}

// === Tampilkan Links di Client ===
const linksContainer = document.getElementById("links");
if (linksContainer) {
  loadLinks();
}
async function loadLinks() {
  const { data } = await supa.from("links").select("*");
  linksContainer.innerHTML = data
    .map(
      (l) => `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-bold">${l.title}</h3>
        <a href="${l.url}" target="_blank" class="text-blue-500 underline">${l.url}</a>
        <p class="text-sm text-gray-500">Kategori: ${l.category}</p>
      </div>
    `
    )
    .join("");
}

// === Admin Tambah Link ===
const addForm = document.getElementById("add-link-form");
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const category = document.getElementById("category").value;

    await supa.from("links").insert([{ title, url, category }]);
    loadAdminLinks();
    addForm.reset();
  });

  loadAdminLinks();
}
async function loadAdminLinks() {
  const { data } = await supa.from("links").select("*");
  const adminLinks = document.getElementById("admin-links");
  adminLinks.innerHTML = data
    .map(
      (l) => `
      <div class="bg-white p-4 rounded shadow flex justify-between items-center">
        <div>
          <h3 class="font-bold">${l.title}</h3>
          <a href="${l.url}" target="_blank" class="text-blue-500 underline">${l.url}</a>
          <p class="text-sm text-gray-500">Kategori: ${l.category}</p>
        </div>
        <button onclick="deleteLink(${l.id})" class="bg-red-500 text-white px-3 py-1 rounded">Hapus</button>
      </div>
    `
    )
    .join("");
}
async function deleteLink(id) {
  await supa.from("links").delete().eq("id", id);
  loadAdminLinks();
}

// === Logout ===
async function logout() {
  await supa.auth.signOut();
  window.location.href = "index.html";
}
