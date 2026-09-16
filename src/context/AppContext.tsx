// Importers/Callers: Root layout in src/app/layout.tsx, all app pages, navigation headers, and components.
// Affected API: AppContext provider state, authentication state currentUser, staff login, store sync, unified email & Google login sync, UPI subscription payments, platform core settings.
// Data Schemas: AppContextType, User, Business, StaffMember, SubscriptionPaymentRecord, PlatformCoreSettings from src/lib/types.ts.
// User's Verbatim Instruction: "There is a problem I seen When I use my Gmail Google for login I don't get directly logged into Existent account in Website Say that's the normal big company do right if we log in using Google with existing email It should be login into our Website with our data right Fix And push it to Github"

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
  SubscriptionStatus,
  SubscriptionPaymentRecord,
  PlatformCoreSettings,
  User,
  UserRole,
} from "@/lib/types";
import { store, DEFAULT_PLATFORM_SETTINGS } from "@/lib/store";
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
  subscriptionPayments: SubscriptionPaymentRecord[];
  platformSettings: PlatformCoreSettings;
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
  adminUpdateSubscription: (businessId: string, planId: SubscriptionPlanId, status: SubscriptionStatus) => void;
  adminToggleSuspend: (businessId: string) => void;
  submitSubscriptionPayment: (data: Omit<SubscriptionPaymentRecord, "id" | "created_at" | "status">) => Promise<SubscriptionPaymentRecord>;
  approveSubscriptionPayment: (paymentId: string, method?: "manual_founder" | "auto_sms_matched" | "provisional_auto") => Promise<void>;
  rejectSubscriptionPayment: (paymentId: string, remarks?: string) => Promise<void>;
  autoReconcileFromBankSms: (smsOrStatementText: string) => Promise<{ matchedCount: number; approvedIds: string[]; parsedRecords: any[] }>;
  updatePlatformSettings: (settings: Partial<PlatformCoreSettings>) => void;
  switchRole: (role: UserRole) => void;
  loginAsStaffUser: (user: User) => Promise<void>;
  loginAsFounderAdmin: () => Promise<void>;
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
    subscriptionPayments: SubscriptionPaymentRecord[];
    platformSettings: PlatformCoreSettings;
  }>(() => ({
    activeBusiness: {} as Business,
    businesses: [],
    customers: [],
    visits: [],
    opportunities: [],
    templates: [],
    whatsappLogs: [],
    staffMembers: [],
    subscriptionPayments: [],
    platformSettings: { ...DEFAULT_PLATFORM_SETTINGS },
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
      subscriptionPayments: store.getSubscriptionPayments(),
      platformSettings: store.getPlatformSettings(),
    });
  }, []);

  useEffect(() => {
    const unsubscribe = store.subscribe(syncFromStore);
    return () => unsubscribe();
  }, [syncFromStore]);

  // Load data on mount - check for existing Supabase session & auto-reconcile Google OAuth accounts
  useEffect(() => {
    const supabase = getSupabase();

    const resolveUserProfile = async (sessionUser: any) => {
      const cleanEmail = sessionUser.email?.toLowerCase().trim() || "";
      const userName =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        cleanEmail.split("@")[0];

      // 1. Check direct lookup by auth user ID
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (profile?.business_id) {
        setCurrentUser({
          id: profile.id,
          email: profile.email || cleanEmail,
          full_name: profile.full_name || userName,
          role: profile.role || "owner",
          business_id: profile.business_id,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at || new Date().toISOString(),
        });
        await store.loadForBusiness(profile.business_id);
        return true;
      }

      // 2. Big-Tech Automatic Account Reconciliation (Google OAuth + Email linking)
      if (cleanEmail) {
        try {
          const syncRes = await fetch("/api/auth/sync-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: sessionUser.id,
              email: cleanEmail,
              fullName: userName,
            }),
          });

          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.linked && syncData.business_id) {
              setCurrentUser({
                id: sessionUser.id,
                email: cleanEmail,
                full_name: syncData.user?.full_name || userName,
                role: syncData.user?.role || "owner",
                business_id: syncData.business_id,
                created_at: syncData.user?.created_at || new Date().toISOString(),
              });
              await store.loadForBusiness(syncData.business_id);
              return true;
            }
          }
        } catch (syncErr) {
          console.error("Account sync error:", syncErr);
        }
      }

      return false;
    };

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const resolved = await resolveUserProfile(session.user);
          if (!resolved) {
            await store.loadAllBusinesses();
          }
        } else {
          // No session - load businesses
          await store.loadAllBusinesses();
        }
      } catch (e) {
        console.error("Auth init error:", e);
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

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") && session?.user) {
        await resolveUserProfile(session.user);
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
        subscriptionPayments: storeState.subscriptionPayments,
        platformSettings: storeState.platformSettings,
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
        adminUpdateSubscription: (businessId: string, planId: SubscriptionPlanId, status: SubscriptionStatus) =>
          store.updateBusinessSubscription(businessId, planId, status),
        adminToggleSuspend: (businessId: string) => store.toggleSuspendBusiness(businessId),
        submitSubscriptionPayment: (data) => store.submitSubscriptionPayment(data),
        approveSubscriptionPayment: (id, method) => store.approveSubscriptionPayment(id, method),
        rejectSubscriptionPayment: (id, remarks) => store.rejectSubscriptionPayment(id, remarks),
        autoReconcileFromBankSms: (sms) => store.autoReconcileFromBankSms(sms),
        updatePlatformSettings: (settings) => store.updatePlatformSettings(settings),
        switchRole,
        loginAsStaffUser: async (user: User) => {
          setCurrentUser(user);
          if (user.business_id) {
            await store.loadForBusiness(user.business_id);
          }
        },
        loginAsFounderAdmin: async () => {
          setCurrentUser({
            id: "founder-admin",
            email: "founder@revia.app",
            full_name: "Platform Founder",
            role: "superadmin",
            business_id: storeState.businesses[0]?.id || "",
            created_at: new Date().toISOString(),
          });
          await store.loadAllBusinesses();
        },
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
