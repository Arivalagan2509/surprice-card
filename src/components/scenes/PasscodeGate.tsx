"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

interface PasscodeGateProps {
  recipientName: string;
  /** Return null on success, or an error string on failure. */
  onUnlock: (passcode: string) => Promise<string | null> | string | null;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ recipientName, onUnlock }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setError("Please enter a valid 4 to 6 digit passcode");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const errorMsg = await onUnlock(passcode);
      if (errorMsg !== null && errorMsg !== undefined) {
        setError(errorMsg);
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 text-center select-none">
      {/* Top Header */}
      <div className="mt-8 z-10">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-[var(--theme-accent)] shadow-sm backdrop-blur-md border border-[var(--theme-accent)]/20 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          Private Surprise
        </span>
      </div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="my-auto z-10 w-full max-w-xs flex flex-col items-center bg-white/90 rounded-3xl p-6 shadow-xl border border-[var(--theme-accent)]/20 backdrop-blur-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--theme-accent-light)] flex items-center justify-center mb-4 text-[var(--theme-accent)]">
          <KeyRound className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-[var(--theme-text)]">
          Protected Surprise
        </h1>

        <p className="text-xs text-[var(--theme-text-muted)] mt-1 mb-6">
          This card for <span className="font-semibold text-[var(--theme-text)]">{recipientName}</span> is protected with a passcode.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              placeholder="Enter passcode"
              className="w-full text-center text-2xl tracking-[0.35em] font-mono py-3 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent bg-white shadow-inner"
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-rose-600 justify-center font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || passcode.length < 4}
            className="w-full gap-2 shadow-lg"
          >
            <span>{isSubmitting ? "Unlocking..." : "Unlock Surprise"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </motion.div>

      {/* Footer hint */}
      <div className="mb-8 z-10 text-xs text-[var(--theme-text-muted)]">
        Ask the sender if you don&apos;t know the code 💌
      </div>
    </div>
  );
};
