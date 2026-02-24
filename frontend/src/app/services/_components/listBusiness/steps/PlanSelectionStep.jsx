"use client";

import { useListBusiness } from "@/context/ListBusinessContext";
import PlanCard from "../components/PlanCard";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    features: ["List 1 service", "Basic visibility", "Email support"],
  },
  {
    id: "plus",
    name: "Plus",
    price: 29,
    features: ["Up to 5 services", "Higher visibility", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    features: ["Unlimited services", "Top visibility", "Dedicated support"],
  },
];

export default function PlanSelectionStep() {
  const { formData, updateFormData, errors, setErrors } = useListBusiness();

  const handleSelect = (planId) => {
    updateFormData({ plan: planId });
    if (errors?.plan) {
      setErrors((prev) => ({ ...prev, plan: undefined }));
    }
  };

  return (
    <div className="space-y-5">
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl p-1 ${
          errors?.plan ? "ring-2 ring-rose-100" : ""
        }`}
      >
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan.name}
            price={plan.price}
            features={plan.features}
            selected={formData.plan === plan.id}
            onSelect={() => handleSelect(plan.id)}
          />
        ))}
      </div>
      {errors?.plan && <p className="text-xs text-rose-600">{errors.plan}</p>}
    </div>
  );
}
