
"use client";

import { useEffect, useState } from "react";

const MARKETS = [
  { name: "Volatility 10", symbol: "R_10" },
  { name: "Volatility 25", symbol: "R_25" },
  { name: "Volatility 50", symbol: "R_50" },
  { name: "Volatility 75", symbol: "R_75" },
  { name: "Volatility 100", symbol: "R_100" },
  { name: "Volatility 100 (1s)", symbol: "1HZ100V" }
];

export default function Home() {
  const [market, setMarket] = useState("1HZ100V");
  const [status, setStatus] = useState("Connecting...");
  const [price, setPrice] = useState("--");
  const [digit, setDigit] = useState("--");
  const [ticks, setTicks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      setStatus("Connecting...");
      setError("");

      socket = new WebSocket(
        "wss://api.derivws.com/trading/v1/options/ws/public"
      );

      socket.onopen = () => {
        if (cancelled) return;

        setStatus("Connected");
        socket.send(JSON.stringify({
          ticks: market,
          subscribe: 1
        }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          setError(data.error.message);
          setStatus("API Error");
          return;
        }

        if (data.tick) {
          const quote = data.tick.quote;
          const precision = data.tick.pip_size ?? 2;
          const formatted = Number(quote).toFixed(precision);
          const lastDigit = Number(formatted.slice(-1));

          setPrice(formatted);
          setDigit(lastDigit);

          setTicks((previous) =>
            [...previous, lastDigit].slice(-100)
          );
        }
      };

      socket.onerror = () => {
        if (!cancelled) {
          setStatus("Connection error");
        }
      };

      socket.onclose = () => {
        if (cancelled) return;

        setStatus("Disconnected");
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);

      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [market]);

  const counts = Array.from({ length: 10 }, (_, number) =>
    ticks.filter((value) => value === number).length
  );

  const percentage = (count) =>
    ticks.length
      ? ((count / ticks.length) * 100).toFixed(1)
      : "0.0";

  const even = ticks.filter((n) => n % 2 === 0).length;
  const odd = ticks.length - even;

  return (
    <main className="container">
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 15,
        marginBottom: 25
      }}>
        <div>
          <h1 style={{ fontSize: 25, fontWeight: 800 }}>
            <span style={{ color: "#168cff" }}>NEXA</span> TRADE PRO
          </h1>
          <p style={{ color: "#91a4bd", fontSize: 12 }}>
            SMART TRADING • MARKET INTELLIGENCE
          </p>
        </div>
        <span style={{
          color: status === "Connected" ? "#00d68f" : "#f5b942"
        }}>
          ● {status}
        </span>
      </header>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 15 }}>
          Trading Control Center
        </h2>

        <label style={{ color: "#91a4bd", fontSize: 13 }}>
          SELECT MARKET
        </label>

        <select
          value={market}
          onChange={(e) => {
            setTicks([]);
            setPrice("--");
            setDigit("--");
            setMarket(e.target.value);
          }}
          style={{
            display: "block",
            width: "100%",
            marginTop: 10,
            padding: 14,
            background: "#172943",
            color: "white",
            border: "1px solid #243750",
            borderRadius: 9
          }}
        >
          {MARKETS.map((m) => (
            <option key={m.symbol} value={m.symbol}>
              {m.name}
            </option>
          ))}
        </select>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
        gap: 12,
        marginBottom: 20
      }}>
        <div className="card">
          <p style={{ color: "#91a4bd", fontSize: 12 }}>LIVE PRICE</p>
          <h2 style={{ fontSize: 23, marginTop: 10 }}>{price}</h2>
        </div>

        <div className="card">
          <p style={{ color: "#91a4bd", fontSize: 12 }}>LAST DIGIT</p>
          <h2 style={{ color: "#42b4ff", fontSize: 30, marginTop: 10 }}>
            {digit}
          </h2>
        </div>

        <div className="card">
          <p style={{ color: "#91a4bd", fontSize: 12 }}>TOTAL TICKS</p>
          <h2 style={{ fontSize: 23, marginTop: 10 }}>{ticks.length}</h2>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 18 }}>
          Digit Analysis
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10
        }}>
          {counts.map((count, number) => (
            <div key={number} style={{
              background: "#172943",
              borderRadius: 9,
              padding: 12,
              textAlign: "center"
            }}>
              <h3 style={{ color: "#42b4ff", fontSize: 20 }}>
                {number}
              </h3>
              <p style={{ marginTop: 5 }}>{count}</p>
              <p style={{ color: "#91a4bd", fontSize: 11 }}>
                {percentage(count)}%
              </p>
            </div>
          ))}
        </div>

        <p style={{
          color: "#91a4bd",
          fontSize: 12,
          marginTop: 15
        }}>
          Calculations use the latest 100 received ticks.
        </p>
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 15 }}>
          Even / Odd Analysis
        </h2>

        <p style={{ marginBottom: 12 }}>
          Even: <strong style={{ color: "#00d68f" }}>{even}</strong>
          {"  "}({percentage(even)}%)
        </p>

        <p>
          Odd: <strong style={{ color: "#42b4ff" }}>{odd}</strong>
          {"  "}({percentage(odd)}%)
        </p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 17 }}>Connection Diagnostics</h2>
        <p style={{ color: "#91a4bd", fontSize: 13, marginTop: 12 }}>
          Market: {market}
        </p>
        <p style={{ color: "#91a4bd", fontSize: 13, marginTop: 8 }}>
          Connection: {status}
        </p>
        {error && (
          <p style={{ color: "#ff5368", marginTop: 12 }}>
            API message: {error}
          </p>
        )}
      </section>

      <footer style={{
        textAlign: "center",
        color: "#91a4bd",
        padding: 25,
        fontSize: 12
      }}>
        NEXA TRADE PRO © 2026
      </footer>
    </main>
  );
  }
    
