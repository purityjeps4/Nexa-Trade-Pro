
"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Wallet,
  Settings,
  RefreshCw,
  Wifi,
  ShieldCheck,
  Menu,
  ChevronDown,
  CircleDot,
  Zap
} from "lucide-react";

export default function Home() {
  const [market, setMarket] = useState("R_100");
  const [account, setAccount] = useState("Demo");
  const [tab, setTab] = useState("Overview");

  const markets = [
    { name: "Volatility 10", value: "R_10" },
    { name: "Volatility 25", value: "R_25" },
    { name: "Volatility 50", value: "R_50" },
    { name: "Volatility 75", value: "R_75" },
    { name: "Volatility 100", value: "R_100" },
    { name: "Volatility 100 (1s)", value: "1HZ100V" }
  ];

  return (
    <main className="container">
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 15,
        marginBottom: 30
      }}>
        <div>
          <h1 style={{fontSize: 25, fontWeight: 800}}>
            <span style={{color: "#168cff"}}>NEXA</span> TRADE PRO
          </h1>
          <p style={{color: "#91a4bd", fontSize: 12}}>
            SMART TRADING • MARKET INTELLIGENCE
          </p>
        </div>
        <div style={{display: "flex", gap: 10}}>
          <button className="blue-button">
            <Menu size={18} />
          </button>
          <button className="blue-button">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <section className="card" style={{marginBottom: 20}}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 15
        }}>
          <div>
            <p style={{color: "#91a4bd", fontSize: 13}}>
              CONNECTION STATUS
            </p>
            <h3 style={{marginTop: 8}}>
              <Wifi size={18} style={{display: "inline", color: "#f5b942"}} />
              {" "}Waiting for Deriv connection
            </h3>
          </div>
          <span style={{
            color: "#f5b942",
            fontSize: 12,
            alignSelf: "center"
          }}>
            OFFLINE
          </span>
        </div>
      </section>

      <section className="card" style={{marginBottom: 20}}>
        <h2 style={{fontSize: 17, marginBottom: 18}}>
          Trading Control Center
        </h2>

        <label style={{color: "#91a4bd", fontSize: 13}}>
          SELECT MARKET
        </label>

        <div style={{position: "relative", marginTop: 8}}>
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              background: "#172943",
              color: "white",
              border: "1px solid #243750",
              borderRadius: 9
            }}
          >
            {markets.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{marginTop: 22}}>
          <label style={{color: "#91a4bd", fontSize: 13}}>
            ACCOUNT MODE
          </label>
          <div style={{display: "flex", gap: 10, marginTop: 10}}>
            {["Demo", "Real"].map((mode) => (
              <button
                key={mode}
                onClick={() => setAccount(mode)}
                className="blue-button"
                style={{
                  flex: 1,
                  background: account === mode ? "#168cff" : "#172943",
                  border: "1px solid #243750"
                }}
              >
                {mode === "Demo" ? "Demo Account" : "Real Account"}
              </button>
            ))}
          </div>
          <p style={{color: "#91a4bd", fontSize: 11, marginTop: 10}}>
            Interface selection only. Account authentication is not
            connected yet.
          </p>
        </div>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 20
      }}>
        {[
          {title: "Market Price", value: "--", icon: TrendingUp},
          {title: "Last Digit", value: "--", icon: CircleDot},
          {title: "Total Ticks", value: "0", icon: Activity},
          {title: "Trading Balance", value: "--", icon: Wallet}
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div className="card" key={item.title}>
              <Icon color="#168cff" size={22}/>
              <p style={{
                color: "#91a4bd",
                fontSize: 12,
                marginTop: 12
              }}>
                {item.title}
              </p>
              <h2 style={{fontSize: 23, marginTop: 6}}>
                {item.value}
              </h2>
            </div>
          );
        })}
      </section>

      <section className="card" style={{marginBottom: 20}}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18
        }}>
          <h2 style={{fontSize: 17}}>Digit Analysis</h2>
          <BarChart3 color="#168cff"/>
        </div>

        <p style={{color: "#91a4bd", fontSize: 13, marginBottom: 18}}>
          Last digit distribution (0–9)
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10
        }}>
          {Array.from({length: 10}, (_, i) => (
            <div key={i} style={{
              background: "#172943",
              borderRadius: 9,
              padding: 12,
              textAlign: "center"
            }}>
              <h3 style={{color: "#42b4ff", fontSize: 19}}>
                {i}
              </h3>
              <p style={{fontSize: 11, color: "#91a4bd"}}>
                --
              </p>
            </div>
          ))}
        </div>

        <p style={{
          color: "#91a4bd",
          fontSize: 12,
          marginTop: 18
        }}>
          Waiting for live tick data to calculate digit statistics.
        </p>
      </section>

      <section className="card" style={{marginBottom: 20}}>
        <h2 style={{fontSize: 17, marginBottom: 18}}>
          Analysis Tools
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12
        }}>
          {[
            "Even / Odd",
            "Over / Under",
            "Matches / Differs",
            "Rise / Fall"
          ].map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              style={{
                padding: 16,
                background: tab === name ? "#173d67" : "#172943",
                color: "white",
                border: "1px solid #243750",
                borderRadius: 10,
                textAlign: "left"
              }}
            >
              <Zap color="#42b4ff" size={18}/>
              <p style={{marginTop: 8}}>{name}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{fontSize: 17}}>Account & Security</h2>
        <p style={{
          color: "#91a4bd",
          fontSize: 13,
          marginTop: 12,
          lineHeight: 1.7
        }}>
          <ShieldCheck color="#00d68f" size={17}
            style={{display: "inline"}} />
          {" "}Secure Deriv account connection will be configured
          in the next development stage.
        </p>
        <button
          className="blue-button"
          style={{marginTop: 18, width: "100%"}}
          onClick={() => setTab("Overview")}
        >
          <RefreshCw size={16}
            style={{display: "inline"}} />
          {" "}Refresh Dashboard
        </button>
      </section>

      <footer style={{
        textAlign: "center",
        color: "#91a4bd",
        fontSize: 12,
        padding: 25
      }}>
        NEXA TRADE PRO © 2026
        <p style={{marginTop: 6}}>Intelligent Market Analysis</p>
      </footer>
    </main>
  );
      }
      
