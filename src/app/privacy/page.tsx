import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Clock, EyeOff, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SurpriseCard",
  description: "How SurpriseCard protects your private memories, photos, and messages.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-pink-100">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-600 hover:text-pink-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
        </div>

        <p className="text-xs text-slate-400 mb-8">Last updated: November 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-pink-500" />
              1. Your Privacy Comes First
            </h2>
            <p>
              SurpriseCard was built to celebrate intimate, personal moments between loved ones. We do
              not sell your data, do not display third-party advertisements, and do not track you across
              the web.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              2. Passcode Protection & Encryption
            </h2>
            <p>
              When a creator sets an optional passcode, the card&apos;s photos, handwritten letters, and music
              remain locked on the server. The client browser cannot read private card data until the
              correct passcode is verified on the server. Passcodes and management tokens are hashed using
              industry-standard bcrypt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              3. Automatic 180-Day Expiration
            </h2>
            <p>
              Cards automatically expire after 180 days. Once expired, card records and all uploaded photos
              and audio files in storage are permanently purged via automated cleanup cron tasks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Your Right to Delete</h2>
            <p>
              Creators receive a private management token upon publishing. Using this token, a card and all
              associated uploaded assets can be instantly and irreversibly deleted at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">5. Photo Processing</h2>
            <p>
              Photos are resized directly inside your browser before upload, stripping EXIF metadata such
              as camera details and GPS coordinates.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
