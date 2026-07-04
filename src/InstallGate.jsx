import { useEffect, useState } from "react";

// Checks if the app is already running as an installed PWA
function isAppInstalled() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = window.navigator.standalone === true;
  return isStandalone || isIOSStandalone;
}

export default function InstallGate({ children }) {
  const [installed, setInstalled] = useState(isAppInstalled());
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed) {
    return children;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background: "#f7f8fa",
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/logo512.png`}
        alt="DOSS&CO Resume Analysis"
        style={{ width: 120, height: 120, marginBottom: 24, borderRadius: 16 }}
      />
      <h2 style={{ color: "#1a2744", marginBottom: 8 }}>
        Install DOSS&CO Resume Analysis
      </h2>
      <p style={{ color: "#555", maxWidth: 380, marginBottom: 24 }}>
        Please install this app on your device to continue. Installing gives
        you faster access and an app-like experience.
      </p>

      {deferredPrompt ? (
        <button
          onClick={handleInstallClick}
          style={{
            background: "#1a2744",
            color: "#fff",
            border: "none",
            padding: "12px 28px",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Install App
        </button>
      ) : (
        <p style={{ color: "#888", fontSize: 14, maxWidth: 380 }}>
          If you don't see an install button, open your browser menu and
          choose "Add to Home Screen" or "Install App". On iPhone, tap the
          Share icon, then "Add to Home Screen".
        </p>
      )}
    </div>
  );
}
