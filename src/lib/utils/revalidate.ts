export async function revalidateLicense() {
  try {
    const activeLicense = localStorage.getItem("active_license");
    if (!activeLicense) return;

    const res = await fetch(`/api/license/revalidate-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: activeLicense }),
    });

    const data = await res.json();

    if (!data.valid) {
      console.warn("❌ License no longer valid:", data.error);
      localStorage.removeItem("active_license");
      window.location.href = "/license-expired"; // Or custom page
    } else {
      console.log("✅ License revalidation OK");
    }
  } catch (err) {
    console.log("Revalidation skipped (offline)");
  }
}
