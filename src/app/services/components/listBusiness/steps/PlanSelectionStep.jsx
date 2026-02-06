"use client";

import { useListBusiness } from "@/context/ListBusinessContext";
import PlanCard from "../components/PlanCard";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    features: [
      "List 1 service",
      "Basic visibility",
      "Email support",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 29,
    features: [
      "Up to 5 services",
      "Higher visibility",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    features: [
      "Unlimited services",
      "Top visibility",
      "Dedicated support",
    ],
  },
];

export default function PlanSelectionStep() {
  const {
    formData,
    updateFormData
  } = useListBusiness();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Choose a Plan
        </h2>
        <p className="text-sm text-gray-500">
          Select a plan that fits your business needs
        </p>
      </div>

      {/* PLANS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan.name}
            price={plan.price}
            features={plan.features}
            selected={formData.plan === plan.id}
            onSelect={() => updateFormData({ plan: plan.id })}
          />
        ))}
      </div>

    </div>
  );
}
