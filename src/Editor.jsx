import React from "react";
import {
  X,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Download,
  Check,
  GripVertical,
  Eye,
  EyeOff,
  Upload,
  Save,
  RotateCcw,
} from "lucide-react";
import { defaults } from "./defaults";
const clone = (x) => JSON.parse(JSON.stringify(x));
export default function Editor({
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
}) {
  return (
    <aside className="editor">
      <div className="editor-title">
        <div>
          <span className="eyebrow">VISUAL STUDIO</span>
          <h2>Edytuj swoją wizję.</h2>
        </div>
        <button aria-label="Zamknij" onClick={() => setEdit(false)}>
          <X size={18} />
        </button>
      </div>
      <div className="editor-tools">
        <div>
          {[
            [Monitor, "desktop"],
            [Tablet, "tablet"],
            [Smartphone, "mobile"],
          ].map(([I, d]) => (
            <button
              title={d}
              aria-label={d}
              key={d}
              className={device === d ? "selected" : ""}
              onClick={() => setDevice(d)}
            >
              <I size={17} />
            </button>
          ))}
        </div>
        <div>
          <button
            aria-label="Cofnij"
            disabled={!index}
            onClick={() => setIndex(index - 1)}
          >
            <Undo2 size={17} />
          </button>
          <button
            aria-label="Ponów"
            disabled={index === history.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            <Redo2 size={17} />
          </button>
        </div>
      </div>
      <div className="editor-tabs">
        {[
          ["sections", "Sekcje"],
          ["style", "Styl"],
          ["project", "Projekt"],
        ].map(([id, n]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="editor-scroll">
        {tab === "sections" && (
          <>
            <p className="editor-hint">
              Przeciągnij sekcje, aby zmienić kolejność. Teksty możesz edytować
              bezpośrednio na stronie.
            </p>
            <div className="section-list">
              {config.sections.map((s, position) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => (drag.current = s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => reorder(drag.current, s.id)}
                  className={selected === s.id ? "selected" : ""}
                >
                  <GripVertical size={15} />
                  <button
                    onClick={() => {
                      setSelected(s.id);
                      jump(s.id);
                    }}
                  >
                    {s.name}
                  </button>
                  <button
                    aria-label={"Przesuń w górę: " + s.name}
                    disabled={position === 0}
                    onClick={() =>
                      reorder(s.id, config.sections[position - 1].id)
                    }
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    aria-label={"Przesuń w dół: " + s.name}
                    disabled={position === config.sections.length - 1}
                    onClick={() =>
                      reorder(s.id, config.sections[position + 1].id)
                    }
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    aria-label={(s.visible ? "Ukryj " : "Pokaż ") + s.name}
                    onClick={() =>
                      change((c) => {
                        c.sections.find((x) => x.id === s.id).visible =
                          !s.visible;
                      })
                    }
                  >
                    {s.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              ))}
            </div>
            <h3>{section.name}</h3>
            <Field label="Nagłówek">
              <textarea
                value={section.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>
            <Field label="Opis">
              <textarea
                value={section.text}
                onChange={(e) => update("text", e.target.value)}
              />
            </Field>
            <Range
              label="Minimalna wysokość"
              min={section.id === "home" ? 280 : 0}
              max={1000}
              value={section.height}
              unit="px"
              onChange={(v) => update("height", v)}
            />
            <Range
              label={
                section.id === "home"
                  ? "Odstęp pod nagłówkiem"
                  : "Odstępy pionowe"
              }
              min={0}
              max={180}
              value={section.padding}
              unit="px"
              onChange={(v) => update("padding", v)}
            />
            {section.id === "values" &&
              (config.values || defaults.values).map((value, i) => (
                <React.Fragment key={i}>
                  <Field label={"Wartość " + (i + 1)}>
                    <input
                      value={value}
                      onChange={(e) =>
                        change((c) => {
                          c.values ||= clone(defaults.values);
                          c.values[i] = e.target.value;
                        })
                      }
                    />
                  </Field>
                  <Field label={"Opis wartości " + (i + 1)}>
                    <input
                      value={config.valueDescriptions?.[i] || ""}
                      onChange={(e) =>
                        change((c) => {
                          c.valueDescriptions ||= clone(
                            defaults.valueDescriptions,
                          );
                          c.valueDescriptions[i] = e.target.value;
                        })
                      }
                    />
                  </Field>
                </React.Fragment>
              ))}
            {"image" in section && (
              <Media
                label="Zdjęcie / zdjęcie zastępcze"
                value={section.image}
                onChange={(v) => update("image", v)}
                onUpload={(f) => upload(f, (v) => update("image", v))}
              />
            )}
            {section.id === "home" && (
              <>
                <Media
                  label="Film hero (MP4 / WebM)"
                  video
                  value={section.video}
                  onChange={(v) => update("video", v)}
                  onUpload={(f) => upload(f, (v) => update("video", v))}
                />
                <Range
                  label="Wielkość nagłówka"
                  min={32}
                  max={110}
                  value={config.heroSize}
                  unit="px"
                  onChange={(v) => change((c) => (c.heroSize = v))}
                />
                <Range
                  label="Położenie poziome"
                  min={3}
                  max={35}
                  value={config.heroX}
                  unit="%"
                  onChange={(v) => change((c) => (c.heroX = v))}
                />
                <Range
                  label="Położenie pionowe"
                  min={25}
                  max={70}
                  value={config.heroY}
                  unit="%"
                  onChange={(v) => change((c) => (c.heroY = v))}
                />
              </>
            )}
            {section.id === "services" &&
              config.services.map((a, i) => (
                <details key={i}>
                  <summary>Karta {i + 1}</summary>
                  <Field label="Nazwa usługi">
                    <input
                      value={a.title}
                      onChange={(e) =>
                        change((c) => (c.services[i].title = e.target.value))
                      }
                    />
                  </Field>
                  <Field label="Opis">
                    <textarea
                      value={a.text}
                      onChange={(e) =>
                        change((c) => (c.services[i].text = e.target.value))
                      }
                    />
                  </Field>
                  <Media
                    label="Zdjęcie"
                    value={a.image}
                    onChange={(v) => change((c) => (c.services[i].image = v))}
                    onUpload={(f) =>
                      upload(f, (v) => change((c) => (c.services[i].image = v)))
                    }
                  />
                </details>
              ))}
            {section.id === "contact" &&
              ["email", "phone", "address"].map((k) => (
                <Field
                  key={k}
                  label={
                    { email: "Email", phone: "Telefon", address: "Adres" }[k]
                  }
                >
                  <input
                    value={section[k]}
                    onChange={(e) => update(k, e.target.value)}
                  />
                </Field>
              ))}
          </>
        )}
        {tab === "style" && (
          <>
            <h3>Identyfikacja wizualna</h3>
            <p className="editor-hint">
              Wgraj oryginalny plik logo. Jego proporcje zostaną zachowane.
            </p>
            <Media
              label="Oryginalne logo"
              value={config.logo}
              onChange={(v) => change((c) => (c.logo = v))}
              onUpload={(f) => upload(f, (v) => change((c) => (c.logo = v)))}
            />
            {[
              ["navy", "Granat"],
              ["red", "Czerwień"],
            ].map(([k, n]) => (
              <Field key={k} label={n}>
                <div className="color-field">
                  <input
                    type="color"
                    value={config[k]}
                    onChange={(e) => change((c) => (c[k] = e.target.value))}
                  />
                  <span>{config[k]}</span>
                </div>
              </Field>
            ))}
            <Range
              label="Tekst podstawowy"
              min={13}
              max={22}
              value={config.fontSize}
              unit="px"
              onChange={(v) => change((c) => (c.fontSize = v))}
            />
            <Range
              label="Wielkość przycisków"
              min={12}
              max={22}
              value={config.buttonSize}
              unit="px"
              onChange={(v) => change((c) => (c.buttonSize = v))}
            />
          </>
        )}
        {tab === "project" && (
          <>
            <h3>Twój projekt</h3>
            <p className="editor-hint">
              Zmiany zapisują się automatycznie w tej przeglądarce. Eksport JSON
              zawiera również wgrane media. Duże pliki mogą przekroczyć limit
              localStorage.
            </p>
            <button
              className="editor-action"
              onClick={() => {
                try {
                  localStorage.setItem(KEY, JSON.stringify(config));
                  setSaved(true);
                  setNotice("Projekt zapisany.");
                } catch {
                  setNotice("Brak miejsca. Wyeksportuj projekt JSON.");
                }
              }}
            >
              <Save size={16} />
              Zapisz projekt
            </button>
            <button className="editor-action" onClick={jsonExport}>
              <Download size={16} />
              Eksportuj ustawienia JSON
            </button>
            <button className="editor-action" onClick={exportProject}>
              <Download size={16} />
              Eksportuj projekt ZIP
            </button>
            <label className="editor-action">
              <Upload size={16} />
              Importuj ustawienia
              <input
                hidden
                type="file"
                accept="application/json"
                onChange={(e) =>
                  e.target.files[0] && importSettings(e.target.files[0])
                }
              />
            </label>
            <button
              className="editor-action"
              onClick={() => {
                change((c) => Object.assign(c, clone(defaults)));
                setNotice(
                  "Przywrócono ustawienia początkowe. Możesz cofnąć tę zmianę.",
                );
              }}
            >
              <RotateCcw size={16} />
              Przywróć ustawienia początkowe
            </button>
          </>
        )}
      </div>
      <div className="editor-bottom">
        <span className={"status-dot " + (!saved ? "warning" : "")} />
        {saved ? "Zmiany zapisane lokalnie" : "Zapis lokalny nieudany"}
        <Check size={14} />
      </div>
    </aside>
  );
}
function Field({ label, children }) {
  const id = React.useId();
  const controls = React.Children.toArray(children).map((child, i) =>
    React.isValidElement(child) && i === 0
      ? React.cloneElement(child, {
          id,
          ...(!child.props["aria-label"]
            ? { "aria-labelledby": id + "-label" }
            : {}),
        })
      : child,
  );
  return (
    <div className="field">
      <label id={id + "-label"} htmlFor={id}>
        {label}
      </label>
      {controls}
    </div>
  );
}
function Range({ label, value, min, max, onChange, unit }) {
  return (
    <Field
      label={
        <>
          {label}
          <b>
            {value}
            {unit}
          </b>
        </>
      }
    >
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
function Media({ label, value, onChange, onUpload, video }) {
  return (
    <Field label={label}>
      <input
        aria-label={label + " URL"}
        placeholder="Adres URL lub wgraj plik"
        value={value?.startsWith("data:") ? "[Wgrany plik]" : value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="upload-row">
        <label>
          <Upload size={13} />
          Wgraj plik
          <input
            type="file"
            hidden
            accept={video ? "video/mp4,video/webm" : "image/*"}
            onChange={(e) => onUpload(e.target.files[0])}
          />
        </label>
        <button onClick={() => onChange("")}>Usuń</button>
      </span>
    </Field>
  );
}
