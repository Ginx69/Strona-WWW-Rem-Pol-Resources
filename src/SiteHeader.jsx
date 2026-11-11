import { resolveMediaUrl } from "./mediaUrl";
import React, { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
export default function SiteHeader({
  config,
  lang,
  setLang,
  setNotice,
  jump,
  links,
}) {
  const [menu, setMenu] = useState(false),
    [services, setServices] = useState(false);
  function navigate(id) {
    jump(id);
    setMenu(false);
    setServices(false);
  }
  return (
    <header className="site-header">
      <a href="#home" className="brand" aria-label="Rem-Pol Resources home">
        {config.logo ? (
          <img
            src={resolveMediaUrl(config.logo)}
            alt="Rem-Pol Resources — original logo"
          />
        ) : (
          <span className="brand-placeholder">
            Rem-Pol Resources<small>MIEJSCE NA ORYGINALNE LOGO</small>
          </span>
        )}
      </a>
      <nav
        className={menu ? "navigation expanded" : "navigation"}
        aria-label="Main navigation"
      >
        {links.map(([name, id]) =>
          id === "services" ? (
            <div className="nav-services" key={id}>
              <button
                onClick={() => setServices(!services)}
                aria-expanded={services}
              >
                {name}
                <ChevronDown size={13} />
              </button>
              {services && (
                <div className="services-dropdown">
                  {config.services.map((s, i) => (
                    <button key={i} onClick={() => navigate("service-" + i)}>
                      {s.title.replaceAll("\n", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              key={id}
              className={id === "home" ? "current" : ""}
              onClick={() =>
                id === "projects"
                  ? setNotice(
                      "Sekcja Projects zostanie zaprojektowana po akceptacji strony głównej.",
                    )
                  : navigate(id)
              }
            >
              {name}
            </button>
          ),
        )}
      </nav>
      <div className="header-actions">
        <svg
          className="norway-flag"
          aria-label="Norway"
          role="img"
          viewBox="0 0 22 16"
        >
          <path fill="#BA0C2F" d="M0 0h22v16H0z" />
          <path fill="#fff" d="M6 0h4v16H6zM0 6h22v4H0z" />
          <path fill="#00205B" d="M7 0h2v16H7zM0 7h22v2H0z" />
        </svg>
        <select
          aria-label="Język makiety"
          value={lang}
          onChange={(e) => {
            setLang(e.target.value);
            setNotice(
              "EN/NO/PL: wybór demonstracyjny. Tłumaczenia do opracowania po akceptacji treści.",
            );
          }}
        >
          {["EN", "NO", "PL"].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button
          className="mobile-menu"
          aria-label="Menu"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
