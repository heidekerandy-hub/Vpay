"use strict";

/* =========================
   VPAY SUPABASE CONNECTION
   ========================= */

const SUPABASE_URL = "supabase_url";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yd2PC23MRQsBvOBeE9Sr3g_Bo6_9J3j";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* =========================
   VPAY APP
   ========================= */

console.log("VPay connected to Supabase");

/* Get current user */
async function getCurrentUser() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.log("No logged-in user");
        return null;
    }

    return data.user;
}

/* =========================
   SIGN UP
   ========================= */

async function signupUser(email, password, fullName) {

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) {
        console.error("Signup error:", error.message);
        return {
            success: false,
            message: error.message
        };
    }

    /* Create profile */
    if (data.user) {

        const { error: profileError } = await supabaseClient
            .from("profiles")
            .insert({
                id: data.user.id,
                full_name: fullName
            });

        if (profileError) {
            console.error("Profile error:", profileError.message);
        }
    }

    return {
        success: true,
        message: "Account created successfully."
    };
}

/* =========================
   LOGIN
   ========================= */

async function loginUser(email, password) {

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        console.error("Login error:", error.message);

        return {
            success: false,
            message: error.message
        };
    }

    return {
        success: true,
        user: data.user
    };
}

/* =========================
   LOGOUT
   ========================= */

async function logoutUser() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        return false;
    }

    return true;
}

/* =========================
   PAGE START
   ========================= */

async function initializeVPay() {

    const user = await getCurrentUser();

    if (user) {
        console.log("Logged in:", user.email);
    } else {
        console.log("No user logged in.");
    }
}

initializeVPay();
