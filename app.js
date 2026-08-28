"use strict";

const SUPABASE_URL =
    "https://kjkxqrjbchnonbncnzni.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_yd2PC23MRQsBvOBeE9Sr3g_Bo6_9J3j";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const authButton =
    document.getElementById("authButton");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const authMessage =
    document.getElementById("authMessage");

const authScreen =
    document.getElementById("authScreen");

const dashboard =
    document.getElementById("dashboard");

const userName =
    document.getElementById("userName");


authButton.addEventListener("click", async function () {

    const userEmail =
        email.value.trim();

    const userPassword =
        password.value;

    if (!userEmail || !userPassword) {

        authMessage.textContent =
            "Please enter your email and password.";

        return;

    }

    authButton.disabled = true;

    authMessage.textContent =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: userEmail,

            password: userPassword

        });


    if (error) {

        console.error(error);

        authMessage.textContent =
            error.message;

        authButton.disabled = false;

        return;

    }


    authMessage.textContent =
        "Login successful!";


    authScreen.classList.add("hidden");

    dashboard.classList.remove("hidden");


    const name =
        data.user.user_metadata?.full_name ||
        "VPay User";


    if (userName) {

        userName.textContent =
            name;

    }


    authButton.disabled = false;

});


console.log("VPay Login System Loaded");
