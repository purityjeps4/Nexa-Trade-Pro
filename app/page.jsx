
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
  const [priceHistory, setPriceHistory] = useState([]);
  const [error, setError] = useState("");
  const [barrier, setBarrier] = useState("4");
  const [selectedDigit, setSelectedDigit] = useState("7");

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
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setError(data.error.message);
            setStatus("API Error");
            return;
          }

          if (data.tick) {
            const quote = Number(data.tick.quote);
            const precision = data.tick.pip_size ?? 2;
            const formatted = quote.toFixed(precision);
            const lastDigit = Number(formatted.slice(-1));

            setPrice(formatted);
            setDigit(lastDigit);

            setTicks(previous =>
              [...previous, lastDigit].slice(-100)
            );

            setPriceHistory(previous =>
              [...previous, {
                price: quote,
                formatted: formatted,
                digit: lastDigit
              }].slice(-100)
            );

            setStatus("Connected");
          }
        } catch {
          setError("Could not read server response.");
        }
      };

      socket.onerror = () => {
        if (!cancelled) setStatus("Connection error");
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

  const counts = Array.from({ length: 10 }, (_, n) =>
    ticks.filter(value => value === n).length
  );

  const percentage = (count, total) =>
    total ? ((count / total) * 100).toFixed(1) : "0.0";

  // EVEN AND ODD
  const even = ticks.filter(n => n % 2 === 0).length;
  const odd = ticks.length - even;

  // OVER AND UNDER
  const barrierNumber = Number(barrier);
  const over = ticks.filter(n => n > barrierNumber).length;
  const under = ticks.filter(n => n < barrierNumber).length;
  const equalBarrier = ticks.filter(n => n === barrierNumber).length;
  const overUnderTotal = over + under;

  // MATCHES AND DIFFERS
  const matchNumber = Number(selectedDigit);
  const matches = ticks.filter(n => n === matchNumber).length;
  const differs = ticks.length - matches;

  // RISE AND FALL
  let rises = 0;
  let falls = 0;
  let unchanged = 0;

  for (let i = 1; i < priceHistory.length; i++) {
    if (priceHistory[i].price > priceHistory[i - 1].price) {
      rises++;
    } else if (priceHistory[i].price < priceHistory[i - 1].price) {
      falls++;
    } else {
      unchanged++;
    }
  }

  const movementTotal = rises + falls + unchanged;
  const recentTicks = [...priceHistory].slice(-10).reverse();

  const card = {
    background: "#10233d",
    border: "1px solid #203957",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18
  };

  const heading = {
    fontSize: 18,
    marginBottom: 15,
    color: "#ffffff"
  };

  const muted = {
    color: "#91a4bd",
    fontSize: 12
  };

  const input = {
    width: "100%",
    padding: 12,
    marginTop: 8,
    background: "#172943",
    color: "white",
    border: "1px solid #315071",
    borderRadius: 8,
    fontSize: 16
  };

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
          <p style={{ ...muted, marginTop: 5 }}>
            SMART TRADING • MARKET INTELLIGENCE
          </p>
        </div>

        <span style={{
          color: status === "Connected" ? "#00d68f" : "#f5b942"
        }}>
          ● {status}
        </span>
      </header>

      <section style={card}>
        <h2 style={heading}>Trading Control Center</h2>

        <label style={muted}>SELECT MARKET</label>

        <select
          value={market}
          onChange={e => {
            setTicks([]);
            setPriceHistory([]);
            setPrice("--");
            setDigit("--");
            setMarket(e.target.value);
          }}
          style={input}
        >
          {MARKETS.map(m => (
            <option key={m.symbol} value={m.symbol}>
              {m.name}
            </option>
          ))}
        </select>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
        gap: 12,
        marginBottom: 18
      }}>
        <div style={card}>
          <p style={muted}>LIVE PRICE</p>
          <h2 style={{ fontSize: 23, marginTop: 10 }}>{price}</h2>
        </div>

        <div style={card}>
          <p style={muted}>LAST DIGIT</p>
          <h2 style={{
            color: "#42b4ff",
            fontSize: 30,
            marginTop: 10
          }}>
            {digit}
          </h2>
        </div>

        <div style={card}>
          <p style={muted}>TOTAL TICKS</p>
          <h2 style={{ fontSize: 23, marginTop: 10 }}>
            {ticks.length}
          </h2>
        </div>
      </section>

      <section style={card}>
        <h2 style={heading}>Digit Analysis</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 9
        }}>
          {counts.map((count, number) => (
            <div key={number} style={{
              background: "#172943",
              borderRadius: 9,
              padding: 10,
              textAlign: "center"
            }}>
              <h3 style={{ color: "#42b4ff", fontSize: 20 }}>
                {number}
              </h3>
              <p style={{ marginTop: 5 }}>{count}</p>
              <p style={{ ...muted, marginTop: 4 }}>
                {percentage(count, ticks.length)}%
              </p>
            </div>
          ))}
        </div>

        <p style={{ ...muted, marginTop: 15 }}>
          Based on the latest 100 received ticks.
        </p>
      </section>

      <section style={card}>
        <h2 style={heading}>Even / Odd Analysis</h2>

        <p style={{ marginBottom: 12 }}>
          Even: <strong style={{ color: "#00d68f" }}>{even}</strong>
          {" "}({percentage(even, ticks.length)}%)
        </p>

        <p>
          Odd: <strong style={{ color: "#42b4ff" }}>{odd}</strong>
          {" "}({percentage(odd, ticks.length)}%)
        </p>
      </section>

      <section style={card}>
        <h2 style={heading}>Over / Under Analysis</h2>

        <label style={muted}>CHOOSE BARRIER DIGIT</label>
        <select
          value={barrier}
          onChange={e => setBarrier(e.target.value)}
          style={input}
        >
          {Array.from({ length: 10 }, (_, n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <div style={{ marginTop: 18 }}>
          <p style={{ marginBottom: 12 }}>
            Over {barrier}: <strong style={{ color: "#00d68f" }}>{over}</strong>
            {" "}({percentage(over, overUnderTotal)}%)
          </p>

          <p style={{ marginBottom: 12 }}>
            Under {barrier}: <strong style={{ color: "#42b4ff" }}>{under}</strong>
            {" "}({percentage(under, overUnderTotal)}%)
          </p>

          <p style={muted}>
            Equal to barrier: {equalBarrier}
          </p>

          <p style={{ ...muted, marginTop: 8 }}>
            Over means greater than the barrier. Under means less than it.
          </p>
        </div>
      </section>

      <section style={card}>
        <h2 style={heading}>Matches / Differs Analysis</h2>

        <label style={muted}>SELECT DIGIT TO TRACK</label>
        <select
          value={selectedDigit}
          onChange={e => setSelectedDigit(e.target.value)}
          style={input}
        >
          {Array.from({ length: 10 }, (_, n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <div style={{ marginTop: 18 }}>
          <p style={{ marginBottom: 12 }}>
            Matches {selectedDigit}:{" "}
            <strong style={{ color: "#00d68f" }}>{matches}</strong>
            {" "}({percentage(matches, ticks.length)}%)
          </p>

          <p>
            Differs: <strong style={{ color: "#42b4ff" }}>{differs}</strong>
            {" "}({percentage(differs, ticks.length)}%)
          </p>
        </div>
      </section>

      <section style={card}>
        <h2 style={heading}>Rise / Fall Analysis</h2>

        <p style={{ marginBottom: 12 }}>
          Rise: <strong style={{ color: "#00d68f" }}>{rises}</strong>
          {" "}({percentage(rises, movementTotal)}%)
        </p>

        <p style={{ marginBottom: 12 }}>
          Fall: <strong style={{ color: "#ff647c" }}>{falls}</strong>
          {" "}({percentage(falls, movementTotal)}%)
        </p>

        <p>
          Unchanged: <strong style={{ color: "#42b4ff" }}>{unchanged}</strong>
          {" "}({percentage(unchanged, movementTotal)}%)
        </p>
      </section>

      <section style={card}>
        <h2 style={heading}>Recent Tick History</h2>

        {recentTicks.length === 0 ? (
          <p style={muted}>Waiting for live ticks...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left"
            }}>
              <thead>
                <tr style={{ color: "#91a4bd" }}>
                  <th style={{ padding: 9 }}>No.</th>
                  <th style={{ padding: 9 }}>Price</th>
                  <th style={{ padding: 9 }}>Digit</th>
                </tr>
              </thead>
              <tbody>
                {recentTicks.map((tick, index) => (
                  <tr key={index} style={{
                    borderTop: "1px solid #203957"
                  }}>
                    <td style={{ padding: 9 }}>{index + 1}</td>
                    <td style={{ padding: 9 }}>{tick.formatted}</td>
                    <td style={{
                      padding: 9,
                      color: "#42b4ff",
                      fontWeight: "bold"
                    }}>
                      {tick.digit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={heading}>Connection Diagnostics</h2>

        <p style={muted}>Market: {market}</p>
        <p style={{ ...muted, marginTop: 8 }}>
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
    
