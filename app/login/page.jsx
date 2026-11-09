
"use client";

import { useState } from "react";

const APP_ID = "34UEnttAbUxMiDV0ZbDCf";
const REDIRECT_URI =
  "https://nexa-trade-pro.vercel.app/login/callback";

export default function LoginPage() {
  const [accountType, setAccountType] = useState("demo");
  const [loading, setLoading] = useState(false);

  async function connectDeriv() {
    try {
      setLoading(true);

      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

      const randomBytes = crypto.getRandomValues(
        new Uint8Array(64)
      );

      const verifier = Array.from(randomBytes)
        .map(byte => characters[byte % characters.length])
        .join("");

      const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(verifier)
      );

      const challenge = btoa(
        String.fromCharCode(...new Uint8Array(hash))
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const stateBytes = crypto.getRandomValues(
        new Uint8Array(16)
      );

      const state = Array.from(stateBytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

      sessionStorage.setItem("nexa_pkce_verifier", verifier);
      sessionStorage.setItem("nexa_oauth_state", state);
      sessionStorage.setItem("nexa_account_mode", accountType);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: APP_ID,
        redirect_uri: REDIRECT_URI,
        scope: "trade account_manage",
        state,
        code_challenge: challenge,
        code_challenge_method: "S256"
      });

      window.location.href =
        "https://auth.deriv.com/oauth2/auth?" +
        params.toString();

    } catch (error) {
      setLoading(false);
      alert("Could not start Deriv login. Please try again.");
    }
  }

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
        borderRadius: 18,
        padding: 25,
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 8
        }}>
          <span style={{ color: "#168cff" }}>NEXA</span>
          {" "}TRADE PRO
        </h1>

        <p style={{
          color: "#91a4bd",
          marginBottom: 28
        }}>
          Securely connect your Deriv account
        </p>

        <h2 style={{
          fontSize: 19,
          marginBottom: 18
        }}>
          Choose your account
        </h2>

        <button
          onClick={() => setAccountType("demo")}
          style={{
            width: "100%",
            padding: 15,
            marginBottom: 12,
            borderRadius: 9,
            border: accountType === "demo"
              ? "2px solid #168cff"
              : "1px solid #315071",
            background: accountType === "demo"
              ? "#173e68"
              : "#172943",
            color: "white",
            fontSize: 16
          }}
        >
          Demo Account
          {accountType === "demo" ? " ✓" : ""}
        </button>

        <button
          onClick={() => setAccountType("real")}
          style={{
            width: "100%",
            padding: 15,
            marginBottom: 22,
            borderRadius: 9,
            border: accountType === "real"
              ? "2px solid #168cff"
              : "1px solid #315071",
            background: accountType === "real"
              ? "#173e68"
              : "#172943",
            color: "white",
            fontSize: 16
          }}
        >
          Real Account
          {accountType === "real" ? " ✓" : ""}
        </button>

        <button
          onClick={connectDeriv}
          disabled={loading}
          style={{
            width: "100%",
            padding: 16,
            border: "none",
            borderRadius: 9,
            background: "#168cff",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Connecting..." : "Continue with Deriv"}
        </button>

        <p style={{
          color: "#91a4bd",
          fontSize: 12,
          marginTop: 20,
          lineHeight: 1.6
        }}>
          Your password is entered only on Deriv's
          official secure login page.
        </p>
      </section>
    </main>
  );
}
