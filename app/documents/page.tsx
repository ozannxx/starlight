"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileText, Image as ImageIcon, Link2, Plus, Trash2, Upload } from "lucide-react";
import { DOCS_KEY, SEED_DOCS, useLocalState, type DocItem } from "@/lib/storage";

const MAX_SIZE = 400_000;

export default function DocumentsPage() {
  const [docs, setDocs] = useLocalState<DocItem[]>(DOCS_KEY, SEED_DOCS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ name: "", url: "", subject: "" });
  const [meta, setMeta] = useState({ subject: "", year: "2025-2026" });
  const fileRef = useRef<HTMLInputElement>(null);

  const subjects = useMemo(
    () => [...new Set(docs.map((d) => d.subject).filter(Boolean))] as string[],
    [docs]
  );

  const filtered = docs.filter(
    (d) =>
      (!filter || d.subject === filter) &&
      (!query || d.name.toLowerCase().includes(query.toLowerCase()))
  );

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    let skipped = false;
    Array.from(files).forEach((f) => {
      if (f.size > MAX_SIZE) {
        skipped = true;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDocs((p) => [
          ...p,
          {
            id: crypto.randomUUID(),
            name: f.name,
            subject: meta.subject.trim() || undefined,
            year: meta.year,
            dataUrl: String(reader.result),
            size: f.size,
            addedAt: Date.now(),
          },
        ]);
      };
      reader.readAsDataURL(f);
    });
    if (skipped)
      alert(
        "Certains fichiers dépassent 400 Ko et n'ont pas été ajoutés (limite du stockage navigateur)."
      );
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <section className="glass rounded-[1.75rem] p-6">
        <h2 className="font-semibold tracking-tight text-text">Coffre-fort documents</h2>
        <p className="mt-1 text-xs text-subtle">
          Bulletins, autorisations, photos de tableaux… tout au même endroit. (Fichiers jusqu&apos;à
          400 Ko — stockage local.)
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input
            className="field sm:col-span-2"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="field" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Toutes les matières</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => fileRef.current?.click()} className="btn-primary">
              <Upload size={15} /> Fichier
            </button>
            <button onClick={() => setShowLink((v) => !v)} className="btn-ghost !w-full">
              <Link2 size={15} /> Lien
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(e) => onFiles(e.target.files)}
          />
          <input
            className="field"
            placeholder="Matière des prochains fichiers"
            value={meta.subject}
            onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
          />
          <input
            className="field"
            placeholder="Année"
            value={meta.year}
            onChange={(e) => setMeta({ ...meta, year: e.target.value })}
          />
        </div>

        {showLink && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!linkForm.name.trim() || !linkForm.url.trim()) return;
              setDocs((p) => [
                ...p,
                {
                  id: crypto.randomUUID(),
                  name: linkForm.name.trim(),
                  subject: linkForm.subject.trim() || undefined,
                  url: linkForm.url.trim(),
                  addedAt: Date.now(),
                },
              ]);
              setLinkForm({ name: "", url: "", subject: "" });
              setShowLink(false);
            }}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4"
          >
            <input
              className="field"
              placeholder="Nom"
              value={linkForm.name}
              onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
            />
            <input
              className="field"
              placeholder="https://…"
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
            />
            <input
              className="field"
              placeholder="Matière"
              value={linkForm.subject}
              onChange={(e) => setLinkForm({ ...linkForm, subject: e.target.value })}
            />
            <button type="submit" className="btn-primary">
              <Plus size={15} /> Ajouter le lien
            </button>
          </form>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {filtered.length === 0 && (
          <p className="glass rounded-[1.75rem] py-10 text-center text-sm text-subtle sm:col-span-2 lg:col-span-3">
            Aucun document
          </p>
        )}
        {filtered.map((d) => {
          const isImage = d.dataUrl?.startsWith("data:image");
          return (
            <article key={d.id} className="glass glass-hover flex flex-col rounded-[1.75rem] p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="icon-chip">
                  {isImage ? <ImageIcon size={18} /> : d.url ? <Link2 size={18} /> : <FileText size={18} />}
                </span>
                <button
                  onClick={() => setDocs((p) => p.filter((x) => x.id !== d.id))}
                  aria-label="Supprimer"
                  className="rounded-xl p-1.5 text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {isImage && (
                <img src={d.dataUrl} alt={d.name} className="mt-4 max-h-36 w-full rounded-2xl object-cover" />
              )}
              <p className="mt-3 line-clamp-2 text-sm font-semibold text-text">{d.name}</p>
              <p className="mt-1 text-xs text-subtle">
                {[d.subject, d.year, d.size ? `${Math.round(d.size / 1024)} Ko` : d.url ? "Lien" : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {(d.dataUrl || d.url) && (
                <a
                  href={d.dataUrl ?? d.url}
                  download={d.dataUrl ? d.name : undefined}
                  target={d.url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="btn-ghost mt-4"
                >
                  <Download size={14} /> {d.dataUrl ? "Télécharger" : "Ouvrir"}
                </a>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}