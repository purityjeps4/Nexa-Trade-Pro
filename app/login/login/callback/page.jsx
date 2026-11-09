"use client";

import { useEffect, useState } from "react";

export default function DerivCallback() {
  const [message, setMessage] = useState("Verifying your Deriv login...");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function finishLogin() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const returnedState = params.get("state");
        const providerError = params.get("error");

        if (providerError) {
          throw new Error("Deriv login was cancelled or denied.");
        }

        const savedState = sessionStorage.getItem("nexa_oauth_state");
        const verifier = sessionStorage.getItem("nexa_pkce_verifier");

        if (!code || !returnedState || returnedState !== savedState) {
          throw new Error("Login verification failed. Please try again.");
        }

        if (!verifier) {
          throw new Error("Login session expired. Please try again.");
        }

        setMessage("Connecting your Deriv account...");

        const response = await fetch("/api/deriv/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            code,
            codeVerifier: verifier,
            redirectUri: "https://nexa-trade-pro.vercel.app/login/callback"
          })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Could not connect your account.");
        }

        sessionStorage.removeItem("nexa_pkce_verifier");
        sessionStorage.removeItem("nexa_oauth_state");

        window.history.replaceState({}, "", "/login/callback");

        setMessage("Deriv account connected successfully!");

      } catch (err) {
        setError(true);
        setMessage(err.message || "Login failed. Please try again.");
      }
    }

    finishLogin();
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#071426",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>
      <section style={{
        width: "100%",
        maxWidth: 430,
        background: "#10233d",
        border: "1px solid #203957",
        borderRadius: 16,
        padding: 28,
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: 25, marginBottom: 18 }}>
          <span style={{ color: "#168cff" }}>NEXA</span> TRADE PRO
        </h1>

        <p style={{
          color: error ? "#ff647c" : "#00d68f",
          lineHeight: 1.6
        }}>
          {message}
        </p>

        {error && (
          <button
            onClick={() => window.location.href = "/login"}
            style={{
              marginTop: 20,
              padding: 13,
              background: "#168cff",
              color: "white",
              border: "none",
              borderRadius: 8
            }}
          >
            Return to Login
          </button>
        )}

        {!error && message.includes("successfully") && (
          <button
            onClick={() => window.location.href = "/"}
            style={{
              marginTop: 20,
              padding: 13,
              background: "#168cff",
              color: "white",
              border: "none",
              borderRadius: 8
            }}
          >
            Go to Dashboard
          </button>
        )}
      </section>
    </main>
  );
}
