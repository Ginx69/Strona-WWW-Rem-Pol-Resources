import SectionView from "./SectionView";
import SiteHeader from "./SiteHeader";
import { migrateSettings } from "./projectSettings";
import Editor from "./Editor";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, X, SlidersHorizontal } from "lucide-react";
import { defaults } from "./defaults";
import "@fontsource-variable/inter";
import "./editor.css";
import "./style.css";
const KEY = "rempol-prototype-v1";
const clone = (x) => JSON.parse(JSON.stringify(x));
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    return valid(d) ? migrateSettings(d) : clone(defaults);
  } catch {
    return clone(defaults);
  }
}
function valid(d) {
  if (
    !d ||
    d.version !== 1 ||
    !Array.isArray(d.sections) ||
    d.sections.length !== 6 ||
    !Array.isArray(d.services) ||
    d.services.length !== 4
  )
    return false;
  if (!["logo", "navy", "red"].every((k) => typeof d[k] === "string"))
    return false;
  if (
    !["fontSize", "buttonSize", "heroSize", "heroX", "heroY"].every((k) =>
      Number.isFinite(d[k]),
    )
  )
    return false;
  if (!/^#[0-9a-f]{6}$/i.test(d.navy) || !/^#[0-9a-f]{6}$/i.test(d.red))
    return false;
  if (
    !defaults.sections.every((base) =>
      d.sections.some(
        (s) =>
          s &&
          s.id === base.id &&
          ["id", "name", "title", "text"].every(
            (k) => typeof s[k] === "string",
          ) &&
          typeof s.visible === "boolean" &&
          Number.isFinite(s.height) &&
          Number.isFinite(s.padding) &&
          (!("image" in base) || typeof s.image === "string") &&
          (!("video" in base) || typeof s.video === "string"),
      ),
    )
  )
    return false;
  if (
    !d.services.every(
      (s) =>
        s && ["title", "text", "image"].every((k) => typeof s[k] === "string"),
    )
  )
    return false;
  return (
    !d.values ||
    (Array.isArray(d.values) &&
      d.values.length === 4 &&
      d.values.every((v) => typeof v === "string"))
  );
}
function download(data, name, type) {
  const u = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
function App() {
  const [history, setHistory] = useState(() => [load()]),
    [index, setIndex] = useState(0),
    [edit, setEdit] = useState(false),
    [device, setDevice] = useState("desktop"),
    [selected, setSelected] = useState("home"),
    [tab, setTab] = useState("sections"),
    [saved, setSaved] = useState(true),
    [notice, setNotice] = useState(""),
    [lang, setLang] = useState("EN"),
    [paused, setPaused] = useState(false),
    [jobs, setJobs] = useState(false);
  const video = useRef(),
    drag = useRef();
  const config = history[index];
  const section = config.sections.find((s) => s.id === selected);
  function change(fn) {
    const next = clone(config);
    fn(next);
    setHistory((h) => [...h.slice(0, index + 1), next]);
    setIndex(index + 1);
  }
  function update(key, value) {
    change((c) => {
      c.sections.find((s) => s.id === selected)[key] = value;
    });
  }
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(config));
      setSaved(true);
    } catch {
      setSaved(false);
      setNotice(
        "Brak miejsca w localStorage. Wyeksportuj projekt, aby zachować media.",
      );
    }
  }, [config]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  async function upload(file, fn) {
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) {
      setNotice(
        "Maksymalny rozmiar pliku to 40 MB. Dla dużego wideo użyj adresu URL.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => fn(reader.result);
    reader.readAsDataURL(file);
  }
  function reorder(from, to) {
    if (!from || from === to) return;
    change((c) => {
      const a = c.sections.findIndex((s) => s.id === from),
        b = c.sections.findIndex((s) => s.id === to);
      c.sections.splice(b, 0, c.sections.splice(a, 1)[0]);
    });
  }
  function jsonExport() {
    download(
      JSON.stringify(config, null, 2),
      "rempol-settings.json",
      "application/json",
    );
  }
  async function exportProject() {
    try {
      const { createProjectArchive } = await import("./projectExport");
      download(
        await createProjectArchive(config),
        "rempol-project.zip",
        "application/zip",
      );
    } catch (error) {
      setNotice(error.message || "Eksport nie powiódł się. Spróbuj ponownie.");
    }
  }
  async function importSettings(f) {
    try {
      const d = JSON.parse(await f.text());
      if (!valid(d)) throw Error();
      change((c) => Object.assign(c, migrateSettings(d)));
      setNotice("Projekt zaimportowany.");
    } catch {
      setNotice(
        "Nieprawidłowy plik ustawień. Wybierz eksport JSON tej makiety.",
      );
    }
  }
  const editable = (s, key, tag = "h2", props = {}) =>
    React.createElement(
      tag,
      {
        ...props,
        contentEditable: edit,
        suppressContentEditableWarning: true,
        onBlur: (e) => {
          if (e.currentTarget.innerText !== s[key])
            change((c) => {
              c.sections.find((x) => x.id === s.id)[key] =
                e.currentTarget.innerText;
            });
        },
      },
      tag === "h1" && !edit && s[key].endsWith(".") ? (
        <>
          {s[key].slice(0, -1)}
          <span className="red-period">.</span>
        </>
      ) : (
        s[key]
      ),
    );
  const jump = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const links = [
    ["Home", "home"],
    ["About Us", "about"],
    ["Our Services", "services"],
    ["Projects", "projects"],
    ["Careers", "careers"],
    ["Contact", "contact"],
  ];
  return (
    <div
      className={edit ? "app editing" : "app"}
      style={{
        "--navy": config.navy,
        "--red": config.red,
        "--body-size": config.fontSize + "px",
        "--button-size": config.buttonSize + "px",
      }}
    >
      <div className="studio-bar">
        <span>
          <span className="status-dot" /> REM-POL{" "}
          <span className="muted">/ Homepage concept</span>
        </span>
        <div>
          <span className="prototype-label">VISUAL PROTOTYPE · 01</span>
          <button
            className={edit ? "edit-toggle active" : "edit-toggle"}
            onClick={() => setEdit(!edit)}
          >
            <SlidersHorizontal size={14} />
            {edit ? "Zamknij edytor" : "Edit Mode"}
          </button>
        </div>
      </div>
      <main className={"canvas " + device}>
        <SiteHeader {...{ config, lang, setLang, setNotice, jump, links }} />

        {config.sections
          .filter((s) => s.visible)
          .map((s) => (
            <SectionView
              key={s.id}
              {...{
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
              }}
            />
          ))}
        <div className="photo-note">
          Wizualizacje poglądowe AI — nie przedstawiają pracowników ani
          realizacji Rem-Pol.
        </div>
      </main>
      {edit && (
        <Editor
          {...{
            config,
            section,
            setEdit,
            device,
            setDevice,
            index,
            setIndex,
            history,
            tab,
            setTab,
            drag,
            reorder,
            selected,
            setSelected,
            jump,
            change,
            update,
            upload,
            saved,
            setSaved,
            setNotice,
            jsonExport,
            exportProject,
            importSettings,
            KEY,
          }}
        />
      )}
      {notice && (
        <div role="status" className="toast">
          {notice}
          <button aria-label="Zamknij komunikat" onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {jobs && (
        <div className="modal-backdrop" onClick={() => setJobs(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="jobs-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Zamknij oferty"
              onClick={() => setJobs(false)}
            >
              <X />
            </button>
            <div className="eyebrow">
              <span /> CAREERS
            </div>
            <h2 id="jobs-title">Your next chapter starts here.</h2>
            <p>
              To miejsce na aktualne oferty pracy. Lista stanowisk i sposób
              aplikowania zostaną uzupełnione po zatwierdzeniu projektu.
            </p>
            <button
              className="btn"
              onClick={() => {
                setJobs(false);
                jump("contact");
              }}
            >
              Contact our team <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
