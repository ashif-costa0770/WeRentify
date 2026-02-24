"use client";

import { useState, useEffect } from "react";
import { X, Check, Package, Star, Crown, Loader2 } from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Basic",
    icon: "📦",
    price: 0,
    priceLabel: "$0",
    features: [
      "Browse all items",
      "Book rentals",
      "5% platform fee",
      "Standard support"
    ],
    buttonText: "Select Plan",
    popular: false
  },
  {
    id: "plus",
    name: "Plus",
    icon: "⭐",
    price: 7.99,
    priceLabel: "$7.99",
    features: [
      "Everything in Basic",
      "3% platform fee",
      "Priority listings",
      "Priority support",
      "Verified badge"
    ],
    buttonText: "Select Plan",
    popular: true
  },
  {
    id: "pro",
    name: "Pro",
    icon: "👑",
    price: 19.99,
    priceLabel: "$19.99",
    features: [
      "Everything in Plus",
      "1% platform fee",
      "Featured listings",
      "Analytics dashboard",
      "Dedicated support",
      "Insurance coverage"
    ],
    buttonText: "Select Plan",
    popular: false
  }
];

export default function PricingModal({ isOpen, onClose, currentPlan = "basic", onPlanSelect }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  // Update selected plan when currentPlan prop changes
  useEffect(() => {
    setSelectedPlan(currentPlan);
  }, [currentPlan]);

  if (!isOpen) return null;

  const handleSelectPlan = async (planId) => {
    if (planId === selectedPlan) return;
    
    setProcessingPlan(planId);
    setIsProcessing(true);

    // Simulate API call / Stripe payment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save to localStorage (or your backend)
    localStorage.setItem("userPlan", planId);
    
    setSelectedPlan(planId);
    setIsProcessing(false);
    setProcessingPlan(null);
    
    onPlanSelect?.(planId);
    onClose();
  };

  const getButtonState = (planId) => {
    if (selectedPlan === planId) {
      return { text: "Current Plan", disabled: true, style: "bg-gray-300 text-gray-600 cursor-default" };
    }
    if (isProcessing && processingPlan === planId) {
      return { text: "Processing...", disabled: true, style: "bg-gray-800 text-white cursor-wait" };
    }
    return { text: "Select Plan", disabled: false, style: "bg-gray-900 text-white hover:bg-gray-800" };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Main Modal */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 cursor-pointer right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center pt-6 pb-6">
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-500 mt-2">Save more on platform fees with a membership</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 px-8 pb-8">
          {plans.map((plan) => {
            const isCurrent = selectedPlan === plan.id;
            const isProcessingThis = isProcessing && processingPlan === plan.id;
            const buttonState = getButtonState(plan.id);

            return (
              <div 
                key={plan.id}
                className={`relative rounded-2xl p-4 border-2 transition-all ${
                  plan.popular 
                    ? "border-purple-200 bg-purple-50/30 shadow-lg scale-105" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 tex text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="text-4xl mb-3">{plan.icon}</div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>

                {/* Price */}
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.priceLabel}</span>
                  <span className="text-gray-500">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={buttonState.disabled}
                  className={`w-full cursor-pointer py-3 rounded-xl font-semibold transition-all ${
                    isCurrent 
                      ? "bg-gray-300 text-gray-600 cursor-default"
                      : isProcessingThis
                      ? "bg-gray-800 text-white cursor-wait"
                      : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                  }`}
                >
                  {isProcessingThis ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    buttonState.text
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Processing payment...</h3>
            <p className="text-sm text-gray-500 mt-1">Powered by Stripe</p>
          </div>
        </div>
      )}
    </div>
  );
}