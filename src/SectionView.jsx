import { resolveMediaUrl } from "./mediaUrl";
import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Handshake,
  Layers,
  Pause,
  Play,
  HardHat,
  CalendarDays,
  Ship,
  Zap,
  Cable,
  Flame,
} from "lucide-react";
import Photo from "./Photo";
const valueIcons = [Handshake, Users, ShieldCheck, HardHat];
const serviceIcons = [Flame, Cable, Zap, Ship];
export default function SectionView({
  s,
  config,
  edit,
  setSelected,
  editable,
  video,
  setNotice,
  paused,
  setPaused,
  jump,
  setJobs,
  links,
}) {
  return (
    <section
      id={s.id}
      className={"section section-" + s.id}
      style={{
        height:
          s.id === "home"
            ? `calc(${s.height}px * var(--hero-height-scale,1))`
            : undefined,
        minHeight:
          s.id === "home"
            ? `calc(${s.height}px * var(--hero-height-scale,1))`
            : s.height || undefined,
        paddingTop: s.id === "home" ? 0 : s.padding,
        paddingBottom: s.id === "home" ? 0 : s.padding,
      }}
      onClick={() => edit && setSelected(s.id)}
    >
      {s.id === "home" && (
        <>
          <Photo image={s.image} className="hero-media">
            {s.video && (
              <video
                ref={video}
                src={resolveMediaUrl(s.video)}
                poster={resolveMediaUrl(s.image)}
                autoPlay
                muted
                loop
                playsInline
                onPlay={() => setPaused(false)}
                onPause={() => setPaused(true)}
                onError={() =>
                  setNotice(
                    "Film jest niedostępny — wyświetlono zdjęcie zastępcze.",
                  )
                }
              />
            )}
          </Photo>
          <div className="hero-shade" />
          <div className="hero-accent" />
          <div
            className="hero-copy"
            style={{
              left: config.heroX + "%",
              top: config.heroY + "%",
              "--hero-size": config.heroSize + "px",
            }}
          >
            <div className="eyebrow light">
              <span />
              NORWEGIAN INDUSTRIAL PARTNER
            </div>
            {editable(s, "title", "h1", {
              style: { marginBottom: s.padding * 0.45 },
            })}
            {editable(s, "text", "p")}
            <div className="hero-buttons">
              <button className="btn" onClick={() => jump("services")}>
                Our Services <ArrowRight size={20} />
              </button>
              <button className="btn outline" onClick={() => jump("careers")}>
                Join Our Team <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <button
            className="film-toggle"
            aria-label={paused ? "Odtwórz film" : "Wstrzymaj film"}
            onClick={() => {
              if (video.current) {
                paused
                  ? video.current
                      .play()
                      .catch(() =>
                        setNotice(
                          "Nie udało się odtworzyć filmu. Sprawdź plik lub adres URL.",
                        ),
                      )
                  : video.current.pause();
              } else
                setNotice(
                  "Wgraj film w panelu edycji. Obecnie wyświetlane jest zdjęcie.",
                );
            }}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </>
      )}
      {s.id === "values" && (
        <div className="values-grid">
          {config.values.map((title, i) => {
            const Icon = valueIcons[i];
            return (
              <div className="value" key={i}>
                <Icon strokeWidth={1.5} />
                <div>
                  <h3>{title}</h3>
                  <p>{config.valueDescriptions?.[i]}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {s.id === "services" && (
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span />
                OUR SERVICES
              </div>
              {editable(s, "title")}
            </div>
            {editable(s, "text", "p")}
          </div>
          <div id="service-cards" className="service-grid">
            {config.services.map((a, i) => {
              const Icon = serviceIcons[i];
              return (
                <article id={"service-" + i} className="service-card" key={i}>
                  <button
                    className="service-open"
                    aria-label={"Informacje: " + a.title.replaceAll("\n", " ")}
                    onClick={() =>
                      setNotice(a.title.replaceAll("\n", " ") + ": " + a.text)
                    }
                  >
                    <Photo image={a.image} className="service-image" />
                    <div className="service-caption">
                      <span className="card-accent" />
                      <Icon
                        className="service-icon"
                        size={33}
                        strokeWidth={1.4}
                      />
                      <h3>{a.title}</h3>
                      <ArrowRight className="service-arrow" size={21} />
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}
      {s.id === "about" && (
        <>
          <Photo image={s.image} className="about-landscape" />
          <div className="about-shade" />
          <div className="about-copy">
            <div className="eyebrow light">
              <span />
              ABOUT REM-POL RESOURCES
            </div>
            {editable(s, "title")}
            {editable(s, "text", "p")}
            <button
              className="btn"
              onClick={() =>
                setNotice(
                  "Pełna prezentacja firmy powstanie po akceptacji makiety strony głównej.",
                )
              }
            >
              Learn More About Us <ArrowRight size={20} />
            </button>
          </div>
          <div className="stats">
            {[
              [CalendarDays, "Years in Norway"],
              [Users, "Skilled Professionals"],
              [Layers, "Completed Projects"],
            ].map(([Icon, label]) => (
              <div key={label}>
                <div>
                  <Icon size={29} strokeWidth={1.5} />
                  <strong>—</strong>
                </div>
                <span>{label}</span>
                <small>Do uzupełnienia</small>
              </div>
            ))}
          </div>
        </>
      )}
      {s.id === "careers" && (
        <>
          <Photo image={s.image} className="careers-image" />
          <div className="careers-copy">
            <div className="eyebrow">
              <span />
              CAREERS AT REM-POL
            </div>
            {editable(s, "title")}
            {editable(s, "text", "p")}
            <button className="btn" onClick={() => setJobs(true)}>
              View Job Opportunities <ArrowRight size={20} />
            </button>
          </div>
          <div className="careers-stripes" />
        </>
      )}
      {s.id === "contact" && (
        <footer className="container">
          <div className="footer-top">
            <div>
              <div className="eyebrow">
                <span />
                LET’S TALK
              </div>
              {editable(s, "title")}
              {editable(s, "text", "p")}
            </div>
            <button
              className="round-arrow"
              aria-label="Dane kontaktowe"
              onClick={() =>
                setNotice(
                  s.email ||
                    "Dane kontaktowe należy uzupełnić w panelu edycji.",
                )
              }
            >
              <ArrowRight size={30} />
            </button>
          </div>
          <div className="footer-grid">
            <div>
              {config.logo ? (
                <img
                  className="footer-logo"
                  src={resolveMediaUrl(config.logo)}
                  alt="Rem-Pol Resources"
                />
              ) : (
                <h3>Rem-Pol Resources Norway AS</h3>
              )}
              <p>Skilled People. Strong Projects.</p>
            </div>
            <div>
              <small>EXPLORE</small>
              {links
                .filter((x) => x[1] !== "projects")
                .map(([n, id]) => (
                  <a key={id} href={"#" + id}>
                    {n}
                  </a>
                ))}
            </div>
            <div>
              <small>CONTACT</small>
              {s.email ? (
                <a href={"mailto:" + s.email}>{s.email}</a>
              ) : (
                <p>Email — do uzupełnienia</p>
              )}
              {s.phone ? (
                <a href={"tel:" + s.phone}>{s.phone}</a>
              ) : (
                <p>Telefon — do uzupełnienia</p>
              )}
              <p>{s.address}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Rem-Pol Resources Norway AS
            </span>
            <span>Homepage concept · Visual prototype</span>
            <a href="#home">Back to top ↑</a>
          </div>
        </footer>
      )}
    </section>
  );
}
