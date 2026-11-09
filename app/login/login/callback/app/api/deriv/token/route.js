import { NextResponse } from "next/server";

const CLIENT_ID = "34UEnttAbUxMiDV0ZbDCf";

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, codeVerifier, redirectUri } = body || {};

    if (
      !code ||
      !codeVerifier ||
      redirectUri !== "https://nexa-trade-pro.vercel.app/login/callback"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid login details." },
        { status: 400 }
      );
    }

    const form = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri
    });

    const tokenResponse = await fetch(
      "https://auth.deriv.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form.toString(),
        cache: "no-store"
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return NextResponse.json(
        {
          error:
            tokenData.error_description ||
            tokenData.error ||
            "Deriv token exchange failed."
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      expires_in: tokenData.expires_in
    });

    response.cookies.set(
      "nexa_deriv_access_token",
      tokenData.access_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: Number(tokenData.expires_in) || 3600
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to complete Deriv login." },
      { status: 500 }
    );
  }
}
