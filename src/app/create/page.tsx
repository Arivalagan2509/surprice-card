"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, Check, Copy, Share2,
  Trash2, Eye, Upload, X, GripVertical, Lock, Music,
  Image as ImageIcon, FileText, Palette, Heart, Users,
} from "lucide-react";
import { SceneRunner } from "@/components/SceneRunner";
import { CardConfig } from "@/lib/schema";
import { getThemeStyles } from "@/lib/themes";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PhotoDraft {
  id: string;
  file?: File;
  previewUrl: string;
  caption: string;
  uploadedPath?: string;
}

interface WizardData {
  occasion: "birthday" | "anniversary" | "sorry" | "friends";
  theme: "sunset" | "garden" | "pink-cloud";
  recipientName: string;
  senderName: string;
  photos: PhotoDraft[];
  letter: string;
  musicFile?: File;
  passcode: string;
}

interface ShareInfo {
  slug: string;
  cardId: string;
  managementToken: string;
  publicUrl: string;
  deleteUrl: string;
}

const STEPS = [
  { id: "occasion",   label: "Occasion",  icon: Heart },
  { id: "theme",      label: "Theme",     icon: Palette },
  { id: "names",      label: "Names",     icon: Users },
  { id: "photos",     label: "Photos",    icon: ImageIcon },
  { id: "letter",     label: "Letter",    icon: FileText },
  { id: "music",      label: "Music",     icon: Music },
  { id: "passcode",   label: "Lock",      icon: Lock },
  { id: "preview",    label: "Preview",   icon: Eye },
  { id: "share",      label: "Share",     icon: Share2 },
] as const;

type StepId = typeof STEPS[number]["id"];

const OCCASIONS = [
  { value: "birthday",    label: "🎂 Birthday",    desc: "Celebrate another trip around the sun!" },
  { value: "anniversary", label: "💍 Anniversary",  desc: "Cheers to another year together!" },
  { value: "sorry",       label: "🌸 Apology",      desc: "Sometimes sorry needs a little magic." },
  { value: "friends",     label: "🤗 Just Because", desc: "Friends don't need a reason." },
] as const;

const THEMES = [
  { value: "sunset",     label: "🌅 Sunset",      gradient: "from-orange-400 via-pink-500 to-purple-600", desc: "Warm golden vibes" },
  { value: "garden",     label: "🌿 Garden",      gradient: "from-green-400 via-emerald-500 to-teal-600",  desc: "Fresh & serene" },
  { value: "pink-cloud", label: "🌸 Pink Cloud",  gradient: "from-pink-300 via-rose-400 to-fuchsia-500",  desc: "Dreamy & romantic" },
] as const;

// ─── Image resize helper ──────────────────────────────────────────────────────

async function resizeImage(file: File, maxDim = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/jpeg", quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function CreatePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<WizardData>({
    occasion: "birthday", theme: "pink-cloud",
    recipientName: "", senderName: "",
    photos: [], letter: "", passcode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);

  const currentStep = STEPS[stepIndex];
  const themeStyles = getThemeStyles(data.theme);

  // ── Validation ───────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (currentStep.id === "names") {
      if (!data.recipientName.trim()) e.recipientName = "Recipient name is required.";
      else if (data.recipientName.length > 60) e.recipientName = "Max 60 characters.";
      if (!data.senderName.trim()) e.senderName = "Your name is required.";
      else if (data.senderName.length > 60) e.senderName = "Max 60 characters.";
    }
    if (currentStep.id === "passcode" && data.passcode) {
      if (!/^\d{4,6}$/.test(data.passcode)) e.passcode = "Passcode must be 4–6 digits.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    if (stepIndex < STEPS.length - 1) setStepIndex(s => s + 1);
  }
  function back() {
    setErrors({});
    if (stepIndex > 0) setStepIndex(s => s - 1);
  }

  // ── Photo handling ───────────────────────────────────────────────────────

  const handlePhotoFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const remaining = 8 - data.photos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newPhotos: PhotoDraft[] = await Promise.all(toAdd.map(async (file) => {
      const resized = await resizeImage(file);
      const previewUrl = URL.createObjectURL(resized);
      return { id: `${Date.now()}-${Math.random()}`, file: new File([resized], file.name, { type: "image/jpeg" }), previewUrl, caption: "" };
    }));
    setData(d => ({ ...d, photos: [...d.photos, ...newPhotos] }));
  }, [data.photos.length]);

  function removePhoto(id: string) {
    setData(d => ({ ...d, photos: d.photos.filter(p => p.id !== id) }));
  }

  function updateCaption(id: string, caption: string) {
    setData(d => ({ ...d, photos: d.photos.map(p => p.id === id ? { ...p, caption } : p) }));
  }

  // Drag reorder
  function onDragEnd(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setData(d => {
      const photos = [...d.photos];
      const [moved] = photos.splice(dragIndex, 1);
      photos.splice(targetIndex, 0, moved);
      return { ...d, photos };
    });
    setDragIndex(null);
  }

  // ── Publish ──────────────────────────────────────────────────────────────

  async function publish() {
    setIsPublishing(true);
    try {
      // 1. Create card record
      const cardRes = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: data.occasion, theme: data.theme,
          recipientName: data.recipientName.trim(),
          senderName: data.senderName.trim(),
          letter: data.letter,
          passcode: data.passcode || undefined,
        }),
      });
      if (!cardRes.ok) {
        const err = await cardRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create card.");
      }
      const { slug, managementToken, cardId } = await cardRes.json();

      // 2. Upload photos
      const uploadedPaths: { path: string; caption: string }[] = [];
      for (let i = 0; i < data.photos.length; i++) {
        const photo = data.photos[i];
        if (!photo.file) continue;
        const urlRes = await fetch("/api/cards/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: photo.file.name, fileType: "image/jpeg",
            fileSize: photo.file.size, cardId, photoCount: i,
          }),
        });
        if (!urlRes.ok) continue;
        const { signedUrl, path } = await urlRes.json();
        await fetch(signedUrl, { method: "PUT", body: photo.file, headers: { "Content-Type": "image/jpeg" } });
        uploadedPaths.push({ path, caption: photo.caption });
      }

      // 3. Upload music if any
      let musicPath: string | undefined;
      if (data.musicFile) {
        const urlRes = await fetch("/api/cards/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: data.musicFile.name, fileType: "audio/mpeg",
            fileSize: data.musicFile.size, cardId, photoCount: 0,
          }),
        });
        if (urlRes.ok) {
          const { signedUrl, path } = await urlRes.json();
          await fetch(signedUrl, { method: "PUT", body: data.musicFile, headers: { "Content-Type": "audio/mpeg" } });
          musicPath = path;
        }
      }

      // 4. Update card with photo + music paths
      if (uploadedPaths.length > 0 || musicPath) {
        await fetch(`/api/cards/${slug}/assets`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${managementToken}`,
          },
          body: JSON.stringify({ photos: uploadedPaths, musicPath }),
        });
      }

      const origin = window.location.origin;
      setShareInfo({
        slug, cardId, managementToken,
        publicUrl: `${origin}/c/${slug}`,
        deleteUrl: `${origin}/c/${slug}`,
      });
      setStepIndex(STEPS.length - 1); // go to share step
    } catch (err) {
      setErrors({ publish: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setIsPublishing(false);
    }
  }

  async function copyLink() {
    if (!shareInfo) return;
    await navigator.clipboard.writeText(shareInfo.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Preview card config ──────────────────────────────────────────────────

  const previewCard: CardConfig = {
    occasion: data.occasion, theme: data.theme,
    recipientName: data.recipientName || "Friend",
    senderName: data.senderName || "Someone Special",
    scenes: [
      "start",
      "balloons",
      "candle",
      "heartCatch",
      "bouquet",
      "photoStack",
      "letter",
      "gift",
      "finale",
    ],
    photos: data.photos.map(p => ({ url: p.previewUrl, caption: p.caption })),
    letter: data.letter,
    music: null, isLocked: false,
  };

  // ── Preview mode ─────────────────────────────────────────────────────────

  if (previewMode) {
    return (
      <div className="relative">
        <button
          onClick={() => setPreviewMode(false)}
          className="fixed top-4 left-4 z-[9999] bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-lg"
        >
          ← Back to Editor
        </button>
        <SceneRunner card={previewCard} />
      </div>
    );
  }

  // ── Share screen ─────────────────────────────────────────────────────────

  if (currentStep.id === "share" && shareInfo) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col items-center justify-center p-6" style={themeStyles}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-6 text-center text-white">
            <div className="text-5xl mb-2">🎉</div>
            <h1 className="text-2xl font-black">Card Published!</h1>
            <p className="text-pink-100 text-sm mt-1">Your surprise is ready to share</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Link */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card Link</label>
              <div className="flex mt-1 gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 truncate font-mono">
                  {shareInfo.publicUrl}
                </div>
                <button onClick={copyLink}
                  className="flex-shrink-0 px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-purple-700 transition">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            <a href={`https://wa.me/?text=${encodeURIComponent(`🎉 I made something special for you! Open this surprise: ${shareInfo.publicUrl}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition shadow-md">
              <span>📱</span> Share on WhatsApp
            </a>

            {/* Passcode reminder */}
            {data.passcode && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm">
                <p className="font-bold text-amber-800">🔐 Remember your passcode</p>
                <p className="text-amber-700 mt-1">Send the passcode <strong>{data.passcode}</strong> to {data.recipientName || "the recipient"} separately — don&apos;t include it with the link!</p>
              </div>
            )}

            {/* Delete */}
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-600 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Delete this card later
              </summary>
              <div className="mt-2 bg-gray-50 rounded-xl p-3 font-mono text-xs break-all text-gray-600 select-all">
                {shareInfo.managementToken}
              </div>
              <p className="mt-1 text-gray-400">Save this token. Use it with <code>DELETE /api/cards/{shareInfo.slug}</code> (Authorization: Bearer …)</p>
            </details>

            {/* Preview */}
            <button onClick={() => setPreviewMode(true)}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-purple-200 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition">
              <Eye className="w-4 h-4" /> Preview Card
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Wizard layout ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh flex flex-col" style={themeStyles}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[var(--theme-accent)]/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <a href="/" className="text-2xl">🎀</a>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="font-semibold text-[var(--theme-accent)]">{currentStep.label}</span>
            <span>Step {stepIndex + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-purple-500"
              animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }} />
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 py-3 bg-white/60 backdrop-blur-sm">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? "w-6 bg-[var(--theme-accent)]" : i < stepIndex ? "w-3 bg-[var(--theme-accent)]/40" : "w-3 bg-gray-200"}`} />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep.id}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="max-w-lg mx-auto px-4 py-6"
          >
            {/* ── Occasion ── */}
            {currentStep.id === "occasion" && (
              <StepWrapper title="What's the occasion?" emoji="🎉">
                <div className="space-y-3">
                  {OCCASIONS.map(o => (
                    <button key={o.value} onClick={() => setData(d => ({ ...d, occasion: o.value }))}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${data.occasion === o.value ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/5 shadow-md" : "border-gray-200 bg-white/80 hover:border-[var(--theme-accent)]/40"}`}>
                      <div className="text-lg font-bold">{o.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{o.desc}</div>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* ── Theme ── */}
            {currentStep.id === "theme" && (
              <StepWrapper title="Pick a theme" emoji="🎨">
                <div className="space-y-3">
                  {THEMES.map(t => (
                    <button key={t.value} onClick={() => setData(d => ({ ...d, theme: t.value }))}
                      className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all ${data.theme === t.value ? "border-[var(--theme-accent)] shadow-lg" : "border-transparent hover:border-gray-300"}`}>
                      <div className={`bg-gradient-to-r ${t.gradient} h-14 flex items-center px-5`}>
                        <span className="text-white font-black text-lg drop-shadow">{t.label}</span>
                      </div>
                      <div className={`bg-white/90 px-5 py-2 text-sm text-gray-500 flex items-center justify-between ${data.theme === t.value ? "text-[var(--theme-accent)]" : ""}`}>
                        <span>{t.desc}</span>
                        {data.theme === t.value && <Check className="w-4 h-4 text-[var(--theme-accent)]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* ── Names ── */}
            {currentStep.id === "names" && (
              <StepWrapper title="Who's this for?" emoji="💌">
                <div className="space-y-5">
                  <Field label="Recipient's name" error={errors.recipientName}>
                    <input value={data.recipientName} onChange={e => setData(d => ({ ...d, recipientName: e.target.value }))}
                      maxLength={60} placeholder="e.g. Priya, Arjun, Mom…"
                      className="field-input" autoFocus />
                    <CharCount val={data.recipientName.length} max={60} />
                  </Field>
                  <Field label="Your name (from)" error={errors.senderName}>
                    <input value={data.senderName} onChange={e => setData(d => ({ ...d, senderName: e.target.value }))}
                      maxLength={60} placeholder="e.g. Your name or nickname"
                      className="field-input" />
                    <CharCount val={data.senderName.length} max={60} />
                  </Field>
                </div>
              </StepWrapper>
            )}

            {/* ── Photos ── */}
            {currentStep.id === "photos" && (
              <StepWrapper title="Add photos" emoji="📸" subtitle={`${data.photos.length}/8 photos · drag to reorder`}>
                <div className="space-y-3">
                  {data.photos.map((photo, i) => (
                    <div key={photo.id} draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDragEnd(i)}
                      className="flex items-center gap-3 bg-white/90 rounded-2xl p-3 shadow-sm border border-gray-100">
                      <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0 cursor-grab" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.previewUrl} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                      <input value={photo.caption} onChange={e => updateCaption(photo.id, e.target.value)}
                        maxLength={120} placeholder="Caption (optional)"
                        className="flex-1 text-sm bg-transparent border-b border-gray-200 focus:border-[var(--theme-accent)] outline-none py-1" />
                      <button onClick={() => removePhoto(photo.id)} className="text-gray-300 hover:text-rose-400 transition flex-shrink-0">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {data.photos.length < 8 && (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-[var(--theme-accent)]/40 rounded-2xl flex flex-col items-center justify-center gap-1 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/5 transition">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">Add photos</span>
                      <span className="text-xs text-gray-400">JPEG, PNG, WebP · max 3MB each</span>
                    </button>
                  )}

                  <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                    className="hidden" onChange={e => handlePhotoFiles(e.target.files)} />
                </div>
              </StepWrapper>
            )}

            {/* ── Letter ── */}
            {currentStep.id === "letter" && (
              <StepWrapper title="Write a letter" emoji="✉️" subtitle="Optional · typewriter effect on the card">
                <div>
                  <textarea value={data.letter}
                    onChange={e => setData(d => ({ ...d, letter: e.target.value }))}
                    maxLength={2000} rows={10} placeholder={`Dear ${data.recipientName || "Friend"},\n\nWrite something heartfelt here…`}
                    className="w-full bg-white/90 border-2 border-gray-200 focus:border-[var(--theme-accent)] rounded-2xl p-4 text-base outline-none resize-none font-[Caveat,cursive] text-lg leading-relaxed"
                  />
                  <CharCount val={data.letter.length} max={2000} />
                </div>
              </StepWrapper>
            )}

            {/* ── Music ── */}
            {currentStep.id === "music" && (
              <StepWrapper title="Background music" emoji="🎵" subtitle="Optional MP3 · max 5MB">
                <div className="space-y-4">
                  {data.musicFile ? (
                    <div className="flex items-center gap-3 bg-white/90 rounded-2xl p-4 border border-gray-100">
                      <Music className="w-8 h-8 text-[var(--theme-accent)]" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{data.musicFile.name}</div>
                        <div className="text-xs text-gray-400">{(data.musicFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button onClick={() => setData(d => ({ ...d, musicFile: undefined }))}
                        className="text-gray-300 hover:text-rose-400 transition">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => musicRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-[var(--theme-accent)]/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/5 transition">
                      <Music className="w-7 h-7" />
                      <span className="text-sm font-medium">Upload MP3</span>
                      <span className="text-xs text-gray-400">Max 5MB</span>
                    </button>
                  )}
                  <input ref={musicRef} type="file" accept="audio/mpeg"
                    className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f && f.size <= 5 * 1024 * 1024) setData(d => ({ ...d, musicFile: f }));
                      else if (f) setErrors({ music: "File must be under 5MB." });
                    }} />
                  {errors.music && <p className="text-rose-500 text-sm">{errors.music}</p>}
                  <p className="text-sm text-gray-500 bg-white/60 rounded-xl p-3">
                    💡 Tip: If you skip this, the card plays a synthesized Happy Birthday melody automatically.
                  </p>
                </div>
              </StepWrapper>
            )}

            {/* ── Passcode ── */}
            {currentStep.id === "passcode" && (
              <StepWrapper title="Add a passcode?" emoji="🔐" subtitle="Optional · 4–6 digits · lock the surprise">
                <div className="space-y-4">
                  <Field label="Passcode (leave blank for no lock)" error={errors.passcode}>
                    <input type="password" inputMode="numeric" pattern="[0-9]*"
                      value={data.passcode} onChange={e => setData(d => ({ ...d, passcode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                      maxLength={6} placeholder="e.g. 1234"
                      className="field-input tracking-widest font-mono text-2xl text-center" />
                  </Field>
                  {data.passcode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
                      ⚠️ Send the passcode to <strong>{data.recipientName || "the recipient"}</strong> separately — not with the card link!
                    </div>
                  )}
                </div>
              </StepWrapper>
            )}

            {/* ── Preview ── */}
            {currentStep.id === "preview" && (
              <StepWrapper title="Preview your card" emoji="👀">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">This is exactly what {data.recipientName || "your recipient"} will see. Play through all scenes before publishing.</p>
                  <button onClick={() => setPreviewMode(true)}
                    className="w-full h-32 bg-gradient-to-br from-[var(--theme-accent)] to-purple-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transition">
                    <Eye className="w-8 h-8" />
                    <span className="font-black text-lg">Play Preview</span>
                  </button>
                  <div className="text-xs text-gray-400 text-center">Opens the full card in preview mode ↑</div>
                  {errors.publish && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-sm text-rose-700">
                      ❌ {errors.publish}
                    </div>
                  )}
                  <button onClick={publish} disabled={isPublishing}
                    className="w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isPublishing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Publishing…
                      </>
                    ) : (
                      <>🚀 Publish Card</>
                    )}
                  </button>
                </div>
              </StepWrapper>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      {currentStep.id !== "share" && currentStep.id !== "preview" && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4 flex gap-3">
          {stepIndex > 0 && (
            <button onClick={back}
              className="flex-shrink-0 h-12 w-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-[var(--theme-accent)]/40 transition text-gray-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button onClick={next}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition">
            {stepIndex === STEPS.length - 2 ? "Review & Publish" : "Continue"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {currentStep.id === "preview" && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4 flex gap-3">
          <button onClick={back}
            className="flex-shrink-0 h-12 w-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function StepWrapper({ title, emoji, subtitle, children }: {
  title: string; emoji: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-4xl mb-2">{emoji}</div>
        <h2 className="text-2xl font-black text-[var(--theme-text)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--theme-text-muted)] mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">{label}</label>
      {children}
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function CharCount({ val, max }: { val: number; max: number }) {
  const pct = val / max;
  return (
    <div className={`text-xs text-right mt-1 ${pct > 0.9 ? "text-rose-500" : "text-gray-400"}`}>
      {val}/{max}
    </div>
  );
}
