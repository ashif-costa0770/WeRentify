"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, Zap, ArrowRight, Crown } from "lucide-react";

import { createPlanCheckoutSession } from "@/services/payments.service";
import { getAllPlans } from "@/services/plans.service";

export default function PricingModal({
  isOpen,
  onClose,
  currentPlan = "",
  onPlanSelect,
}) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  const getPlanId = (plan) => plan?._id || plan?.id;

  const getCurrentPlanValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object")
      return value._id || value.id || value.name || "";
    return "";
  };

  const isPopularPlan = (plan) =>
    plan?.popular === true || String(plan?.popular).toLowerCase() === "true";

  const isProPlan = (plan) =>
    String(plan?.name || "").toLowerCase().includes("pro");

  const getPriceLabel = (plan) => {
    const price = Number(plan?.price ?? 0);
    const currency = (plan?.currency || "usd").toUpperCase();
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `$${price.toFixed(2)}`;
    }
  };

  const isCurrentPlan = (plan) => {
    const planId = getPlanId(plan);
    const normalizedSelected = String(selectedPlan || "").toLowerCase();
    const normalizedName = String(plan?.name || "").toLowerCase();
    return selectedPlan === planId || normalizedSelected === normalizedName;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        setPlansError("");
        const res = await getAllPlans();
        setPlans(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setPlansError("Could not load plans. Please try again.");
      } finally {
        setIsLoadingPlans(false);
      }
    };
    if (isOpen) fetchPlans();
  }, [isOpen]);

  useEffect(() => {
    const normalizedCurrentPlan = getCurrentPlanValue(currentPlan);
    if (!normalizedCurrentPlan) return;
    const matched = plans.find((plan) => {
      const planId = getPlanId(plan);
      const normalizedCurrent = String(normalizedCurrentPlan).toLowerCase();
      return (
        planId === normalizedCurrentPlan ||
        String(plan?.name || "").toLowerCase() === normalizedCurrent
      );
    });
    setSelectedPlan(matched ? getPlanId(matched) : normalizedCurrentPlan);
  }, [currentPlan, plans]);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan) => {
    const planId = getPlanId(plan);
    if (!planId || isCurrentPlan(plan)) return;
    try {
      setProcessingPlan(planId);
      setIsProcessing(true);
      if (Number(plan?.price) <= 0) {
        setSelectedPlan(planId);
        onPlanSelect?.(planId);
        if (typeof window !== "undefined") {
          localStorage.setItem("userPlan", planId);
          window.dispatchEvent(
            new CustomEvent("plan-updated", { detail: { plan: planId } }),
          );
        }
        setIsProcessing(false);
        setProcessingPlan(null);
        onClose?.();
        return;
      }
      const res = await createPlanCheckoutSession(planId);
      const checkoutUrl = res?.data?.data?.url;
      if (!checkoutUrl) throw new Error("Checkout URL not found in response");
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Stripe Redirect Error:", err);
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  const getButtonState = (planId) => {
    if (selectedPlan === planId)
      return { text: "Current Plan", disabled: true };
    if (isProcessing && processingPlan === planId)
      return { text: "Processing...", disabled: true };
    return { text: "Get Started", disabled: false };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      {/* Modal shell */}
      <div className="relative w-full max-w-5xl bg-[#f9fafb] rounded-[28px] shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="px-8 pt-4 pb-7 text-center">
          <h2 className="text-[1.9rem] font-extrabold tracking-tight text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-1 text-[13px] text-gray-500">
            No hidden fees. Pay less on every transaction as you grow.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-4 px-6 pb-8 items-stretch">

          {isLoadingPlans && (
            <div className="md:col-span-3 flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading plans…</span>
            </div>
          )}

          {!isLoadingPlans && plansError && (
            <div className="md:col-span-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 text-center">
              {plansError}
            </div>
          )}

          {!isLoadingPlans && !plansError && plans.length === 0 && (
            <div className="md:col-span-3 rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
              No plans available right now.
            </div>
          )}

          {plans.map((plan) => {
            const planId = getPlanId(plan);
            const isCurrent = isCurrentPlan(plan);
            const isPopular = isPopularPlan(plan);
            const isProcessingThis = isProcessing && processingPlan === planId;
            const btnState = getButtonState(planId);
            const fee = plan?.platformFeePercent !== undefined
              ? `${plan.platformFeePercent}% platform fee`
              : null;

            /* ── POPULAR / PRO CARD ── */
            if (isPopular) {
              return (
                <div
                  key={planId}
                  className="relative flex flex-col rounded-[22px] overflow-hidden
                    bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]
                    shadow-[0_20px_60px_rgba(99,102,241,0.4)] md:-translate-y-2.5 md:scale-[1.02] z-10"
                >
                  {/* top shimmer line */}
                  <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-indigo-500" />

                  {/* badge */}
                  <div className="flex justify-center pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-950 shadow-sm">
                      <Zap className="w-3 h-3 fill-amber-900" />
                      Most Popular
                    </span>
                  </div>

                  {/* body */}
                  <div className="flex flex-col flex-1 px-6 pt-4 pb-6">

                    {/* name */}
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>

                    {/* fee subtitle */}
                    {fee && (
                      <p className="text-[12px] text-violet-300/80 mb-3">{fee}</p>
                    )}

                    {/* price */}
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-[2.65rem] font-black leading-none text-white tracking-tight">
                        {getPriceLabel(plan)}
                      </span>
                      <span className="text-sm text-white/40 mb-1.5">/mo</span>
                    </div>

                    {/* divider */}
                    <div className="h-px bg-white/10 mb-5" />

                    {/* features */}
                    <ul className="space-y-3 flex-1 mb-7">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-violet-300">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                          <span className="text-[13.5px] leading-snug text-white/75">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={btnState.disabled}
                      className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isCurrent
                          ? "bg-white/10 text-white/40 cursor-default"
                          : isProcessingThis
                            ? "bg-indigo-400/30 text-white cursor-wait"
                            : "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {/* shimmer on hover */}
                      {!isCurrent && !isProcessingThis && (
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                      )}
                      {isProcessingThis ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          {btnState.text}
                          {!isCurrent && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            /* ── PRO CARD ── */
            if (isProPlan(plan)) {
              return (
                <div
                  key={planId}
                  className="relative flex flex-col rounded-[22px] overflow-hidden
                    bg-gradient-to-br from-[#1a1208] via-[#2a1f0e] to-[#1c1710]
                    shadow-[0_16px_50px_rgba(180,130,30,0.25)] border border-amber-900/30"
                >
                  {/* gold shimmer top line */}
                  <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500" />

                  {/* subtle glow blobs */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
                  <div className="pointer-events-none absolute -left-6 bottom-12 h-28 w-28 rounded-full bg-yellow-300/8 blur-2xl" />

                  <div className="flex flex-col flex-1 px-6 pt-5 pb-6">
                    {/* name row */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      <h3 className="text-lg font-bold text-amber-100">{plan.name}</h3>
                    </div>

                    {/* fee */}
                    {fee && (
                      <p className="text-[12px] text-amber-600/80 mb-3">{fee}</p>
                    )}

                    {/* price */}
                    <div className="flex items-end gap-1 my-4">
                      <span className="text-[2.65rem] font-black leading-none text-white tracking-tight">
                        {getPriceLabel(plan)}
                      </span>
                      <span className="text-sm text-amber-400/60 mb-1.5">/mo</span>
                    </div>

                    {/* divider */}
                    <div className="h-px bg-amber-900/40 mb-5" />

                    {/* features */}
                    <ul className="space-y-3 flex-1 mb-7">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                          <span className="text-[13.5px] leading-snug text-amber-100/70">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={btnState.disabled}
                      className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isCurrent
                          ? "bg-amber-900/30 text-amber-400/50 cursor-default"
                          : isProcessingThis
                            ? "bg-amber-800/40 text-amber-200 cursor-wait"
                            : "bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_28px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {/* shimmer sweep */}
                      {!isCurrent && !isProcessingThis && (
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                      )}
                      {isProcessingThis ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          {btnState.text}
                          {!isCurrent && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            /* ── BASIC / REGULAR CARD ── */
            return (
              <div
                key={planId}
                className="relative flex flex-col rounded-[22px] bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* top accent line */}
                <div className="h-[3px] w-full bg-gray-100" />

                {/* body */}
                <div className="flex flex-col flex-1 px-6 pt-5 pb-6">

                  {/* name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">{plan.name}</h3>

                  {/* fee */}
                  {fee && (
                    <p className="text-[12px] text-gray-400 mb-3">{fee}</p>
                  )}

                  {/* price */}
                  <div className="flex items-end gap-1 my-4">
                    <span className="text-[2.65rem] font-black leading-none text-gray-900 tracking-tight">
                      {getPriceLabel(plan)}
                    </span>
                    <span className="text-sm text-gray-400 mb-1.5">/mo</span>
                  </div>

                  {/* divider */}
                  <div className="h-px bg-gray-100 mb-5" />

                  {/* features */}
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        <span className="text-[13.5px] leading-snug text-gray-500">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={btnState.disabled}
                    className={`group w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? "bg-gray-100 text-gray-400 cursor-default"
                        : isProcessingThis
                          ? "bg-gray-800 text-white cursor-wait"
                          : "bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md"
                    }`}
                  >
                    {isProcessingThis ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        {btnState.text}
                        {!isCurrent && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer note */}
        <p className="pb-6 text-center text-xs text-gray-400">
          Billed monthly · Cancel anytime · Secure payments via Stripe
        </p>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-3xl bg-white p-10 text-center shadow-2xl">
            <div className="relative mx-auto mb-5 h-14 w-14">
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <p className="font-bold text-gray-900">Setting up payment…</p>
            <p className="mt-1 text-xs text-gray-400">Redirecting to Stripe</p>
          </div>
        </div>
      )}
    </div>
  );
}
