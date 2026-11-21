import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SurpriseCard",
  description: "Terms and conditions for using the SurpriseCard platform.",
};

export default function TermsPage() {
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
          <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Terms of Service</h1>
        </div>

        <p className="text-xs text-slate-400 mb-8">Last updated: November 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Acceptable Use</h2>
            <p>
              SurpriseCard is intended for sending greetings, celebratory wishes, and heartfelt surprises.
              You agree not to use the service to send abusive, harassing, illegal, copyright-infringing,
              or malicious content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. User Content & Ownership</h2>
            <p>
              You retain all ownership of the images, text, and audio you submit. By uploading content, you
              grant SurpriseCard a limited, non-exclusive license solely to host and deliver your card to
              its intended recipient.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. Storage & Availability</h2>
            <p>
              Cards are ephemeral by nature and are scheduled for deletion 180 days after creation.
              SurpriseCard is not an archival storage service; please retain local copies of important
              memories.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Disclaimers</h2>
            <p>
              The service is provided &quot;as is&quot; without warranties of any kind. We strive for 99.9%
              uptime but are not liable for temporary service interruptions or network delays.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>By using SurpriseCard, you agree to these simple terms.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
