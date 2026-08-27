"use strict";

/* =========================
   SUPABASE CONNECTION
   ========================= */

const SUPABASE_URL ="https://kjkxqrjbchnonbncnzni.supabase.co";
const SUPABASE_PUBLISHABLE_KEY ="sb_publishable_yd2PC23MRQsBvOBeE9Sr3g_Bo6_9J3j";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================
   ELEMENTS
   ========================= */

const authScreen = document.getElementById("authScreen");
const dashboard = document.getElementById("dashboard");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const nameField = document.getElementById("nameField");
const fullName = document.getElementById("fullName");

const email = document.getElementById("email");
const password = document.getElementById("password");

const authButton = document.getElementById("authButton");
const switchAuth = document.getElementById("switchAuth");

const switchText = document.getElementById("switchText");
const authMessage = document.getElementById("authMessage");

const logoutButton = document.getElementById("logoutButton");
const userName = document.getElementById("userName");


/* =========================
   MODE
   ========================= */

let signupMode = false;


/* =========================
   SWITCH LOGIN / SIGNUP
   ========================= */

switchAuth.addEventListener("click", function () {

    signupMode = !signupMode;

    authMessage.textContent = "";

    if (signupMode) {

        authTitle.textContent = "Create your VPay account";

        authSubtitle.textContent =
            "Start managing your money smarter.";

        nameField.classList.remove("hidden");

        authButton.textContent = "Create Account";

        switchText.textContent =
            "Already have an account?";

        switchAuth.textContent =
            "Login";

    } else {

        authTitle.textContent =
            "Welcome to VPay";

        authSubtitle.textContent =
            "Manage your money smarter.";

        nameField.classList.add("hidden");

        authButton.textContent =
            "Login";

        switchText.textContent =
            "Don't have an account?";

        switchAuth.textContent =
            "Create account";
    }
});


/* =========================
   AUTH BUTTON
   ========================= */

authButton.addEventListener("click", async function () {

    const userEmail = email.value.trim();
    const userPassword = password.value;
    const name = fullName.value.trim();

    authMessage.textContent = "";

    if (!userEmail || !userPassword) {

        authMessage.textContent =
            "Please enter your email and password.";

        return;
    }


    /* =========================
       SIGNUP
       ========================= */

    if (signupMode) {

        if (!name) {

            authMessage.textContent =
                "Please enter your full name.";

            return;
        }

        if (userPassword.length < 6) {

            authMessage.textContent =
                "Password must be at least 6 characters.";

            return;
        }


        authButton.disabled = true;

        authMessage.textContent =
            "Creating your account...";


        const { data, error } =
            await supabaseClient.auth.signUp({

                email: userEmail,

                password: userPassword,

                options: {

                    data: {
                        full_name: name
                    }

                }

            });


        if (error) {

            authMessage.textContent =
                error.message;

            authButton.disabled = false;

            return;
        }


        /* Create profile */

        if (data.user) {

            const { error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .insert({

                        id: data.user.id,

                        full_name: name

                    });


            if (profileError) {

                console.error(
                    "Profile error:",
                    profileError.message
                );

            }

        }


        authMessage.textContent =
            "Account created successfully. Check your email if confirmation is required.";

        authButton.disabled = false;

        return;
    }


    /* =========================
       LOGIN
       ========================= */

    authButton.disabled = true;

    authMessage.textContent =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: userEmail,

            password: userPassword

        });


    if (error) {

        authMessage.textContent =
            error.message;

        authButton.disabled = false;

        return;
    }


    authButton.disabled = false;

    showDashboard(data.user);

});


/* =========================
   SHOW DASHBOARD
   ========================= */

async function showDashboard(user) {

    authScreen.classList.add("hidden");

    dashboard.classList.remove("hidden");


    let name =
        user.user_metadata?.full_name;


    if (!name) {

        const { data } =
            await supabaseClient
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

        if (data) {
            name = data.full_name;
        }

    }


    userName.textContent =
        name || "VPay User";

}


/* =========================
   LOGOUT
   ========================= */

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        dashboard.classList.add("hidden");

        authScreen.classList.remove("hidden");

        email.value = "";

        password.value = "";

    }
);


/* =========================
   CHECK LOGIN SESSION
   ========================= */

async function checkSession() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {
        showDashboard(session.user);
    }
}


/* Detect login after email confirmation */

supabaseClient.auth.onAuthStateChange(
    async function (event, session) {

        console.log("Auth event:", event);

        if (
            event === "SIGNED_IN" &&
            session
        ) {
            showDashboard(session.user);
        }

    }
);


checkSession();
