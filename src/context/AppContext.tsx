"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Business,
  Customer,
  Visit,
  Opportunity,
  WhatsAppTemplate,
  WhatsAppLog,
  StaffMember,
  SubscriptionPlan,
  SubscriptionPlanId,
  User,
  UserRole,
} from "@/lib/types";
import { store } from "@/lib/store";
import { SUBSCRIPTION_PLANS } from "@/lib/seedData";
import { getSupabase } from "@/lib/supabase/client";

interface AppContextType {
  activeBusiness: Business;
  businesses: Business[];
  customers: Customer[];
  visits: Visit[];
  opportunities: Opportunity[];
  templates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  staffMembers: StaffMember[];
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isReadOnly: boolean;
  currentPlan: SubscriptionPlan;
  currentUser: User;
  isLoading: boolean;
  setActiveBusinessId: (id: string) => void;
  createBusiness: (data: any) => Business;
  updateBusiness: (data: Partial<Business>) => void;
  addCustomer: (data: any) => Customer;
  updateCustomer: (data: Customer) => void;
  deleteCustomer: (id: string) => void;
  addVisit: (data: any) => Visit;
  logWhatsAppSend: (data: any) => WhatsAppLog;
  resolveOpportunity: (id: string, status: "pending" | "contacted" | "dismissed" | "sent") => void;
  addTemplate: (data: any) => WhatsAppTemplate;
  addStaffMember: (data: any) => StaffMember;
  upgradePlan: (planId: SubscriptionPlanId) => void;
  extendTrial: (days?: number) => void;
  toggleSuspendBusiness: (bizId: string) => void;
  adminExtendTrial: (businessId: string, days?: number) => void;
  adminUpdateSubscription: (businessId: string, planId: SubscriptionPlanId, status: "trialing" | "active" | "canceled" | "expired") => void;
  adminToggleSuspend: (businessId: string) => void;
  switchRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [storeState, setStoreState] = useState<{
    activeBusiness: Business;
    businesses: Business[];
    customers: Customer[];
    visits: Visit[];
    opportunities: Opportunity[];
    templates: WhatsAppTemplate[];
    whatsappLogs: WhatsAppLog[];
    staffMembers: StaffMember[];
  }>(() => ({
    activeBusiness: {} as Business,
    businesses: [],
    customers: [],
    visits: [],
    opportunities: [],
    templates: [],
    whatsappLogs: [],
    staffMembers: [],
  }));

  const [currentUser, setCurrentUser] = useState<User>({
    id: "",
    email: "",
    full_name: "",
    role: "owner",
    business_id: "",
    created_at: new Date().toISOString(),
  });

  // Sync store state
  const syncFromStore = useCallback(() => {
    const biz = store.getActiveBusiness();
    setStoreState({
      activeBusiness: biz,
      businesses: store.getBusinesses(),
      customers: store.getCustomers(biz.id),
      visits: store.getVisits(biz.id),
      opportunities: store.getOpportunities(biz.id),
      templates: store.getTemplates(biz.id),
      whatsappLogs: store.getWhatsAppLogs(biz.id),
      staffMembers: store.getStaffMembers(biz.id),
    });
  }, []);

  useEffect(() => {
    const unsubscribe = store.subscribe(syncFromStore);
    return () => unsubscribe();
  }, [syncFromStore]);

  // Load data on mount - check for existing Supabase session
  useEffect(() => {
    const supabase = getSupabase();

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user profile from public.users table
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              business_id: profile.business_id,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
            });
            await store.loadForBusiness(profile.business_id);
          } else {
            // Auth user exists but no profile - load all businesses for admin
            await store.loadAllBusinesses();
          }
        } else {
          // No session - load all businesses (for phone-based login)
          await store.loadAllBusinesses();
        }
      } catch (e) {
        console.error("Auth init error:", e);
        // Try loading all businesses as fallback
        try {
          await store.loadAllBusinesses();
        } catch (e2) {
          console.error("Failed to load businesses:", e2);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            business_id: profile.business_id,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
          });
          await store.loadForBusiness(profile.business_id);
        }
      } else if (event === "SIGNED_OUT") {
        store.resetState();
        setCurrentUser({
          id: "",
          email: "",
          full_name: "",
          role: "owner",
          business_id: "",
          created_at: new Date().toISOString(),
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { activeBusiness } = storeState;

  // Calculate trial state
  const trialEnd = activeBusiness?.trial_end_date
    ? new Date(activeBusiness.trial_end_date).getTime()
    : Date.now();
  const now = Date.now();
  const trialDaysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
  const isTrialActive = activeBusiness?.subscription_status === "trialing" && trialDaysRemaining > 0;
  const isReadOnly =
    activeBusiness?.subscription_status === "expired" ||
    (activeBusiness?.subscription_status === "trialing" && trialDaysRemaining <= 0) ||
    activeBusiness?.is_suspended === true;

  const currentPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === activeBusiness?.subscription_plan) ||
    SUBSCRIPTION_PLANS[1];

  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  return (
    <AppContext.Provider
      value={{
        activeBusiness: storeState.activeBusiness,
        businesses: storeState.businesses,
        customers: storeState.customers,
        visits: storeState.visits,
        opportunities: storeState.opportunities,
        templates: storeState.templates,
        whatsappLogs: storeState.whatsappLogs,
        staffMembers: storeState.staffMembers,
        isTrialActive,
        trialDaysRemaining,
        isReadOnly,
        currentPlan,
        currentUser,
        isLoading,
        setActiveBusinessId: (id) => store.setActiveBusinessId(id),
        createBusiness: (data) => store.createBusiness(data) as any,
        updateBusiness: (data) => store.updateBusiness(data),
        addCustomer: (data) => store.addCustomer(data) as any,
        updateCustomer: (data) => store.updateCustomer(data),
        deleteCustomer: (id) => store.deleteCustomer(id),
        addVisit: (data) => store.addVisit(data) as any,
        logWhatsAppSend: (data) => store.logWhatsAppSend(data) as any,
        resolveOpportunity: (id, status) => store.resolveOpportunity(id, status as any),
        addTemplate: (data) => store.addTemplate(data) as any,
        addStaffMember: (data) => store.addStaffMember(data) as any,
        upgradePlan: (planId) => store.upgradePlan(activeBusiness.id, planId),
        extendTrial: (days = 14) => store.extendTrial(activeBusiness.id, days),
        toggleSuspendBusiness: (bizId) => store.toggleSuspendBusiness(bizId),
        adminExtendTrial: (businessId: string, days = 14) => store.extendTrial(businessId, days),
        adminUpdateSubscription: (businessId: string, planId: SubscriptionPlanId, status: "trialing" | "active" | "canceled" | "expired") =>
          store.updateBusinessSubscription(businessId, planId, status),
        adminToggleSuspend: (businessId: string) => store.toggleSuspendBusiness(businessId),
        switchRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
