import { supabase } from "@/lib/supabase";

/**
 * Universal entity adapter for Supabase that mimics Base44 entity methods:
 * .list(sort, limit)
 * .filter(query, sort, limit)
 * .create(data)
 * .update(id, data)
 * .delete(id)
 */
function createEntityAdapter(tableName) {
  return {
    async list(sort = "-created_date", limit = 100) {
      let query = supabase.from(tableName).select("*");

      if (sort) {
        const isDesc = sort.startsWith("-");
        const column = isDesc ? sort.slice(1) : sort;
        query = query.order(column, { ascending: !isDesc });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[Supabase ${tableName}.list error]:`, error.message);
        throw error;
      }
      return data || [];
    },

    async filter(conditions = {}, sort = "-created_date", limit = 50) {
      let query = supabase.from(tableName).select("*");

      for (const [key, value] of Object.entries(conditions)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }

      if (sort) {
        const isDesc = sort.startsWith("-");
        const column = isDesc ? sort.slice(1) : sort;
        query = query.order(column, { ascending: !isDesc });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[Supabase ${tableName}.filter error]:`, error.message);
        throw error;
      }
      return data || [];
    },

    async create(recordData) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(recordData)
        .select()
        .single();

      if (error) {
        console.error(`[Supabase ${tableName}.create error]:`, error.message);
        throw error;
      }
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[Supabase ${tableName}.update error]:`, error.message);
        throw error;
      }
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) {
        console.error(`[Supabase ${tableName}.delete error]:`, error.message);
        throw error;
      }
      return true;
    },
  };
}

export const entities = {
  Product: createEntityAdapter("products"),
  Category: createEntityAdapter("categories"),
  ShippingRate: createEntityAdapter("shipping_rates"),
  Coupon: createEntityAdapter("coupons"),
  Order: createEntityAdapter("orders"),
  Review: createEntityAdapter("reviews"),
  ProductEvent: createEntityAdapter("product_events"),
};

export const functions = {
  async invoke(functionName, payload) {
    if (functionName === "LogProductEvent") {
      try {
        await supabase.from("product_events").insert(payload);
      } catch (e) {
        // Non-blocking telemetry
      }
    }
    return { success: true };
  },
};

export const auth = {
  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async loginWithProvider(provider, returnTo) {
    const redirectUrl = new URL(returnTo || "/", window.location.origin).toString();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) throw error;
    return data;
  },

  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "signup",
    });
    if (error) throw error;
    return data;
  },

  async resendOtp(email) {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw error;
    return data;
  },

  async resetPasswordRequest(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  async resetPassword({ newPassword }) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  async me() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch user profile role
    let role = user.user_metadata?.role || "customer";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    } catch (e) {
      // ignore
    }

    return {
      ...user,
      role,
    };
  },

  setToken(_token) {
    // Supabase handles session token persistence internally
  },

  isAuthenticated() {
    return !!supabase.auth.getSession();
  },

  redirectToLogin(returnTo) {
    const target = returnTo
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/login";
    window.location.href = target;
  },
};
