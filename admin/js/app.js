(() => {
  const API = window.APP_CONFIG.WORKER_BASE_URL;
  const $ = id => document.getElementById(id);
  let sessionToken = null;
  const status = message => $("status").textContent = message;
  async function api(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }
  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault(); status("Signing in…");
    try {
      const result = await api("/api/login", { method:"POST", body:JSON.stringify({ email:$("email").value, password:$("password").value }) });
      sessionToken = result.token;
      $("loginForm").hidden = true; $("updateForm").hidden = false;
      $("password").value = "";
      const current = await api("/api/destination");
      $("currentUrl").textContent = current.url;
      $("destination").value = current.url;
      status("Signed in. Session expires in 30 minutes.");
    } catch (error) { status(error.message); }
  });
  $("updateForm").addEventListener("submit", async event => {
    event.preventDefault(); status("Saving…");
    try {
      const result = await api("/api/update", { method:"POST", body:JSON.stringify({ url:$("destination").value.trim() }) });
      $("currentUrl").textContent = result.url; status("Saved. GitHub is updating the destination file.");
    } catch (error) { status(error.message); }
  });
  $("logout").addEventListener("click", () => {
    sessionToken = null; $("updateForm").hidden = true; $("loginForm").hidden = false; status("Logged out.");
  });
})();
