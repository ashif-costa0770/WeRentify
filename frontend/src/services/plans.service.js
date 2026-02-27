import api from "@/lib/api";

export const createPlan = (planData) =>  api.post("/plans", planData);
export const getAllPlans = () =>  api.get("/plans");
export const updatePlan = (planId, planData) =>  api.put(`/plans/${planId}`, planData);
export const deactivatePlan = (planId) =>  api.patch(`/plans/${planId}/deactivate`);
