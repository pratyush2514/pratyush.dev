"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Film,
  ImageIcon,
  Loader2,
  LogOut,
  Pencil,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ThemeToggleButton } from "@/components/theme-toggle";
import { MotionShell } from "@/components/design/motion-shell";
import { MEDIA_TYPES, type DesignKind, type PublicDesign } from "@/lib/designs/types";
import { cn } from "@/lib/utils";

// ---------- types and helpers ----------

type Meta = {
  title: string;
  summary: string;
  category: string;
  tools: string;
  year: string;
  link: string;
  featured: boolean;
};

type Draft = {
  key: string;
  file: File;
  preview: string;
  kind: DesignKind;
  width: number;
  height: number;
  poster?: Blob;
  meta: Meta;
  status: "ready" | "uploading" | "saving" | "error";
  progress: number;
  error?: string;
};

const emptyMeta = (file?: File): Meta => ({
  title: file ? file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() : "",
  summary: "",
  category: "",
  tools: "",
  year: String(new Date().getFullYear()),
  link: "",
  featured: false,
});

const toMeta = (d: PublicDesign): Meta => ({
  title: d.title,
  summary: d.summary,
  category: d.category,
  tools: d.tools.join(", "),
  year: d.year,
  link: d.link ?? "",
  featured: d.featured,
});

const toPayload = (m: Meta) => ({
  title: m.title,
  summary: m.summary,
  category: m.category,
  tools: m.tools
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
  year: m.year,
  link: m.link,
  featured: m.featured,
});

async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Signed out");
  }
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

/** Reads the size of an image or video, and grabs a poster frame from videos. */
async function probe(file: File, url: string): Promise<{ width: number; height: number; poster?: Blob }> {
  if (!file.type.startsWith("video/")) {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("This browser can't play that video. Export it as MP4 (H.264)."));
  });
  video.currentTime = Math.min(1, (video.duration || 0) / 4);
  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve();
    setTimeout(resolve, 3000);
  });
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0);
  const poster = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  return { width: video.videoWidth, height: video.videoHeight, poster: poster ?? undefined };
}

/** Sends one file straight to Storage through a signed URL, reporting progress. */
async function uploadFile(file: Blob, onProgress?: (p: number) => void): Promise<string> {
  const { path, uploadUrl } = await api<{ path: string; uploadUrl: string }>("/api/admin/upload-url", {
    method: "POST",
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const form = new FormData();
  form.append("cacheControl", "31536000"); // names are unique, so cache for a year
  form.append("", file);
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 160)}`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(form);
  });
  return path;
}

// ---------- small pieces ----------

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L1 2h6.3l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L6.3 3.8H4.5l13.3 16.3Z" />
  </svg>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">{children}</span>
);

const input =
  "w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-text-tertiary focus:border-text-tertiary";

function MetaFields({
  value,
  onChange,
  categories,
  idPrefix,
}: {
  value: Meta;
  onChange: (m: Meta) => void;
  categories: string[];
  idPrefix: string;
}) {
  const set = <K extends keyof Meta>(k: K, v: Meta[K]) => onChange({ ...value, [k]: v });
  const id = (k: string) => `${idPrefix}-${k}`;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={id("title")} className="mb-1.5 block text-[13px] font-medium">
          Title
        </label>
        <input id={id("title")} className={input} value={value.title} maxLength={120} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div>
        <label htmlFor={id("category")} className="mb-1.5 block text-[13px] font-medium">
          Category
        </label>
        <input
          id={id("category")}
          className={input}
          list="design-categories"
          placeholder="Dashboard, Mobile app, Landing page…"
          maxLength={40}
          value={value.category}
          onChange={(e) => set("category", e.target.value)}
        />
        <datalist id="design-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div>
        <label htmlFor={id("year")} className="mb-1.5 block text-[13px] font-medium">
          Year
        </label>
        <input id={id("year")} className={input} maxLength={12} value={value.year} onChange={(e) => set("year", e.target.value)} />
      </div>
      <div>
        <label htmlFor={id("tools")} className="mb-1.5 block text-[13px] font-medium">
          Tools <span className="font-normal text-text-tertiary">· comma separated</span>
        </label>
        <input
          id={id("tools")}
          className={input}
          placeholder="Figma, Framer, Rive"
          value={value.tools}
          onChange={(e) => set("tools", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={id("link")} className="mb-1.5 block text-[13px] font-medium">
          Link <span className="font-normal text-text-tertiary">· optional</span>
        </label>
        <input
          id={id("link")}
          className={input}
          type="url"
          placeholder="https://figma.com/…"
          value={value.link}
          onChange={(e) => set("link", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={id("summary")} className="mb-1.5 block text-[13px] font-medium">
          What it is <span className="font-normal text-text-tertiary">· shown in the full view</span>
        </label>
        <textarea
          id={id("summary")}
          rows={3}
          maxLength={1000}
          className={cn(input, "resize-y")}
          placeholder="The problem, what you designed, and what changed."
          value={value.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-[13px] sm:col-span-2">
        <input
          type="checkbox"
          checked={value.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="size-4 accent-[var(--color-text)]"
        />
        Feature it: featured pieces show first, and on the home page
      </label>
    </div>
  );
}

function Thumb({ src, poster, kind, className }: { src: string; poster?: string; kind: DesignKind; className?: string }) {
  return kind === "video" ? (
    <video src={src} poster={poster} muted loop playsInline preload="metadata" className={cn("object-cover", className)} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={cn("object-cover", className)} />
  );
}

// ---------- the dashboard ----------

export function AdminDashboard({ initial, setupError }: { initial: PublicDesign[]; setupError: string | null }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editing, setEditing] = useState<{ id: string; meta: Meta } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [xUrl, setXUrl] = useState("");
  const [xFeatured, setXFeatured] = useState(false);
  const [importing, setImporting] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(items.map((d) => d.category).filter(Boolean))),
    [items]
  );

  const reload = useCallback(async () => {
    const { items } = await api<{ items: PublicDesign[] }>("/api/admin/designs");
    setItems(items);
  }, []);

  // Free the local previews when drafts go away.
  useEffect(() => () => drafts.forEach((d) => URL.revokeObjectURL(d.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const patchDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const removeDraft = (key: string) =>
    setDrafts((ds) => {
      const d = ds.find((x) => x.key === key);
      if (d) URL.revokeObjectURL(d.preview);
      return ds.filter((x) => x.key !== key);
    });

  const onDrop = useCallback(async (files: File[]) => {
    for (const file of files) {
      const type = MEDIA_TYPES[file.type];
      if (!type) {
        toast.error(`${file.name}: use PNG, JPG, WebP, AVIF, GIF, MP4, WebM or MOV.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      try {
        const { width, height, poster } = await probe(file, preview);
        setDrafts((ds) => [
          ...ds,
          {
            key: crypto.randomUUID(),
            file,
            preview,
            kind: type.kind,
            width,
            height,
            poster,
            meta: emptyMeta(file),
            status: "ready",
            progress: 0,
          },
        ]);
      } catch (error) {
        URL.revokeObjectURL(preview);
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "could not read the file."}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(Object.entries(MEDIA_TYPES).map(([mime, t]) => [mime, [`.${t.ext}`]])),
    disabled: !!setupError,
  });

  async function publish(draft: Draft) {
    if (!draft.meta.title.trim()) {
      patchDraft(draft.key, { status: "error", error: "Give it a title first." });
      return;
    }
    patchDraft(draft.key, { status: "uploading", progress: 0, error: undefined });
    try {
      const path = await uploadFile(draft.file, (p) => patchDraft(draft.key, { progress: p }));
      const posterPath = draft.poster ? await uploadFile(draft.poster) : undefined;
      patchDraft(draft.key, { status: "saving" });
      await api("/api/admin/designs", {
        method: "POST",
        body: JSON.stringify({
          ...toPayload(draft.meta),
          media: { path, kind: draft.kind, width: draft.width, height: draft.height, posterPath },
        }),
      });
      removeDraft(draft.key);
      await reload();
      toast.success(`“${draft.meta.title}” is live`);
    } catch (error) {
      patchDraft(draft.key, { status: "error", error: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  async function runImport(url: string) {
    if (importing) return;
    setImporting(true);
    const pending = toast.loading("Downloading from X…");
    try {
      const { items: added } = await api<{ items: PublicDesign[] }>("/api/admin/designs/import-x", {
        method: "POST",
        body: JSON.stringify({ url, featured: xFeatured }),
      });
      await reload();
      setXUrl("");
      const what = added.length === 1 ? (added[0].media.kind === "video" ? "video" : "image") : `${added.length} files`;
      toast.success(`Imported ${what} from X. It's live.`, { id: pending });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.", { id: pending });
    } finally {
      setImporting(false);
    }
  }

  function importFromX(event: React.FormEvent) {
    event.preventDefault();
    void runImport(xUrl.trim());
  }

  async function saveEdit() {
    if (!editing) return;
    setBusy(editing.id);
    try {
      await api(`/api/admin/designs/${editing.id}`, { method: "PATCH", body: JSON.stringify(toPayload(editing.meta)) });
      await reload();
      setEditing(null);
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleFeatured(d: PublicDesign) {
    setItems((xs) => xs.map((x) => (x.id === d.id ? { ...x, featured: !d.featured } : x)));
    try {
      await api(`/api/admin/designs/${d.id}`, { method: "PATCH", body: JSON.stringify({ featured: !d.featured }) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update.");
      await reload();
    }
  }

  async function move(index: number, by: number) {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + by, 0, moved);
    setItems(next);
    try {
      await api("/api/admin/designs/order", { method: "PUT", body: JSON.stringify({ ids: next.map((d) => d.id) }) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder.");
      await reload();
    }
  }

  async function remove(d: PublicDesign) {
    setBusy(d.id);
    try {
      await api(`/api/admin/designs/${d.id}`, { method: "DELETE" });
      setItems((xs) => xs.filter((x) => x.id !== d.id));
      toast.success(`Deleted “${d.title}”`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete.");
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <MotionShell>
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-6 md:px-8">
        {/* Top bar */}
        <header className="sticky top-3 z-40 flex items-center justify-between gap-3 rounded-full border border-border/80 bg-bg/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl">
          <span className="text-sm font-semibold tracking-tight">
            pratyush<span className="text-text-tertiary">.dev</span>
            <span className="ml-2 rounded-full bg-bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              admin
            </span>
          </span>
          <div className="flex items-center gap-1">
            <a
              href="/design"
              target="_blank"
              className="hidden items-center gap-1 rounded-full px-3.5 py-2 text-[13px] text-text-secondary hover:text-text sm:inline-flex"
            >
              View gallery <ArrowUpRight size={13} />
            </a>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] text-text-secondary hover:text-text"
            >
              <LogOut size={13} /> Sign out
            </button>
            <ThemeToggleButton className="size-10" />
          </div>
        </header>

        <div className="mt-14 md:mt-20">
          <Label>UI / UX library</Label>
          <h1 className="mt-3 font-serif text-5xl tracking-tight md:text-6xl">
            Add new <span className="italic text-text-secondary">work</span>
          </h1>
          <p className="mt-3 max-w-lg text-text-secondary">
            Drop screen recordings, GIFs or images. Add a few details, publish, and it shows up on
            the home page and the gallery within seconds.
          </p>
        </div>

        {setupError && (
          <div role="alert" className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm">
            <p className="font-medium">Storage is not set up</p>
            <p className="mt-1 text-text-secondary">{setupError}</p>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-14 text-center transition-colors duration-300",
            isDragActive ? "border-text bg-bg-secondary" : "border-border hover:border-text-tertiary",
            setupError && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <span className="flex size-12 items-center justify-center rounded-full border border-border bg-bg">
            <UploadCloud size={20} aria-hidden="true" />
          </span>
          <p className="mt-4 font-medium">{isDragActive ? "Drop to add" : "Drag files here, or click to choose"}</p>
          <p className="mt-1 text-sm text-text-tertiary">MP4, WebM, MOV, GIF, PNG, JPG, WebP, AVIF</p>
          <p className="mt-3 max-w-md text-xs text-text-tertiary">
            Tip: MP4 (H.264) recordings play everywhere and are much smaller than GIFs.
          </p>
        </div>

        {/* Import from X */}
        <form
          onSubmit={importFromX}
          className={cn(
            "mt-4 flex flex-col gap-3 rounded-3xl border border-border px-5 py-5 sm:flex-row sm:items-center",
            setupError && "pointer-events-none opacity-50"
          )}
        >
          <label htmlFor="x-url" className="flex shrink-0 items-center gap-2 text-sm font-medium">
            <span className="flex size-8 items-center justify-center rounded-full border border-border bg-bg">
              <XLogo className="size-3.5" />
            </span>
            Import from X
          </label>
          <input
            id="x-url"
            type="url"
            inputMode="url"
            required
            value={xUrl}
            onChange={(e) => setXUrl(e.target.value)}
            onPaste={(e) => {
              // Pasting a link is the whole interaction: import right away.
              const pasted = e.clipboardData.getData("text").trim();
              if (/^https:\/\/(www\.|mobile\.)?(x|twitter)\.com\/.+\/status(es)?\/\d+/i.test(pasted)) {
                e.preventDefault();
                setXUrl(pasted);
                void runImport(pasted);
              }
            }}
            placeholder="Paste a post link: https://x.com/you/status/…"
            disabled={importing}
            className={cn(input, "flex-1")}
          />
          <label className="flex shrink-0 items-center gap-2 text-[13px] text-text-secondary">
            <input
              type="checkbox"
              checked={xFeatured}
              onChange={(e) => setXFeatured(e.target.checked)}
              className="size-4 accent-current"
            />
            Feature
          </label>
          <button
            type="submit"
            disabled={importing || !xUrl.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-text px-4 py-2.5 text-[13px] font-medium text-bg disabled:opacity-50"
          >
            {importing ? <Loader2 size={14} className="animate-spin" /> : null}
            {importing ? "Importing…" : "Import"}
          </button>
        </form>
        <p className="mt-2 px-1 text-xs text-text-tertiary">
          Downloads the post&apos;s photos and videos at full quality and publishes them right away. The post
          text becomes the title and summary, which you can edit below.
        </p>

        {/* Drafts */}
        {drafts.length > 0 && (
          <section className="mt-10 space-y-5" aria-label="Ready to publish">
            <div className="flex items-center justify-between">
              <Label>Ready to publish · {drafts.length}</Label>
              {drafts.length > 1 && (
                <button
                  type="button"
                  onClick={() => drafts.filter((d) => d.status === "ready" || d.status === "error").forEach(publish)}
                  className="rounded-full bg-text px-4 py-2 text-[13px] font-medium text-bg"
                >
                  Publish all
                </button>
              )}
            </div>
            {drafts.map((d) => {
              const working = d.status === "uploading" || d.status === "saving";
              return (
                <article key={d.key} className="grid gap-6 rounded-3xl border border-border bg-bg p-4 md:grid-cols-5 md:p-5">
                  <div className="md:col-span-2">
                    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-secondary">
                      <Thumb
                        src={d.preview}
                        kind={d.kind}
                        className="aspect-[4/3] w-full !object-contain"
                      />
                      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white backdrop-blur">
                        {d.kind === "video" ? <Film size={10} /> : <ImageIcon size={10} />}
                        {d.kind}
                      </span>
                    </div>
                    <p className="mt-2 truncate font-mono text-[11px] text-text-tertiary">
                      {d.width}×{d.height} · {(d.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex flex-col md:col-span-3">
                    <MetaFields
                      idPrefix={d.key}
                      value={d.meta}
                      categories={categories}
                      onChange={(meta) => patchDraft(d.key, { meta })}
                    />
                    {working && (
                      <div className="mt-5" aria-live="polite">
                        <div className="h-1 overflow-hidden rounded-full bg-bg-secondary">
                          <div
                            className="h-full rounded-full bg-text transition-[width] duration-200"
                            style={{ width: `${d.status === "saving" ? 100 : Math.round(d.progress * 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 font-mono text-[11px] text-text-tertiary">
                          {d.status === "saving" ? "Saving…" : `Uploading ${Math.round(d.progress * 100)}%`}
                        </p>
                      </div>
                    )}
                    {d.error && (
                      <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
                        {d.error}
                      </p>
                    )}
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => publish(d)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg disabled:opacity-60"
                      >
                        {working ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {working ? "Publishing" : "Publish"}
                      </button>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => removeDraft(d.key)}
                        className="rounded-full border border-border px-5 py-2.5 text-sm disabled:opacity-60"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Library */}
        <section className="mt-16" aria-label="Published">
          <div className="mb-4 flex items-center justify-between border-t border-border pt-5">
            <Label>Published · {items.length}</Label>
            <span className="text-xs text-text-tertiary">Order here is the order on the site</span>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-border px-6 py-12 text-center text-sm text-text-secondary">
              Nothing published yet. The Design section stays hidden on the home page until you add something.
            </p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {items.map((d, i) => (
                <li key={d.id} className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-bg-secondary">
                      <Thumb src={d.src} poster={d.poster} kind={d.media.kind} className="h-16 w-24" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{d.title}</p>
                      <p className="truncate text-sm text-text-tertiary">
                        {[d.category, d.year, d.media.kind].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <IconButton
                        label={d.featured ? "Unfeature" : "Feature"}
                        onClick={() => toggleFeatured(d)}
                        active={d.featured}
                      >
                        <Star size={15} className={d.featured ? "fill-current" : ""} />
                      </IconButton>
                      <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                        <ArrowUp size={15} />
                      </IconButton>
                      <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                        <ArrowDown size={15} />
                      </IconButton>
                      <IconButton
                        label="Edit"
                        onClick={() => setEditing(editing?.id === d.id ? null : { id: d.id, meta: toMeta(d) })}
                        active={editing?.id === d.id}
                      >
                        <Pencil size={15} />
                      </IconButton>
                      {confirmDelete === d.id ? (
                        <span className="ml-1 inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => remove(d)}
                            disabled={busy === d.id}
                            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            {busy === d.id ? "Deleting…" : "Delete"}
                          </button>
                          <IconButton label="Cancel" onClick={() => setConfirmDelete(null)}>
                            <X size={15} />
                          </IconButton>
                        </span>
                      ) : (
                        <IconButton label="Delete" onClick={() => setConfirmDelete(d.id)}>
                          <Trash2 size={15} />
                        </IconButton>
                      )}
                    </div>
                  </div>
                  {editing?.id === d.id && (
                    <div className="mt-5 rounded-2xl border border-border bg-bg-secondary/50 p-4 md:p-5">
                      <MetaFields
                        idPrefix={`edit-${d.id}`}
                        value={editing.meta}
                        categories={categories}
                        onChange={(meta) => setEditing({ id: d.id, meta })}
                      />
                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={busy === d.id || !editing.meta.title.trim()}
                          className="inline-flex items-center gap-1.5 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg disabled:opacity-60"
                        >
                          {busy === d.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="rounded-full border border-border px-5 py-2.5 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </MotionShell>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full transition-colors disabled:opacity-30",
        active ? "bg-bg-secondary text-text" : "text-text-tertiary hover:bg-bg-secondary hover:text-text"
      )}
    >
      {children}
    </button>
  );
}
