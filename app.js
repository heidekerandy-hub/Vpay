"use strict";

/* ==========================================
   SUPABASE CONNECTION
   ========================================== */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* ==========================================
   VARIABLES
   ========================================== */

let signupMode = false;
let transactionType = "income";


/* ==========================================
   ELEMENTS
   ========================================== */

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

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");

const transactionList =
    document.getElementById("transactionList");

const transactionModal =
    document.getElementById("transactionModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalDescription =
    document.getElementById("modalDescription");

const transactionAmount =
    document.getElementById("transactionAmount");

const transactionDescription =
    document.getElementById("transactionDescription");

const saveTransaction =
    document.getElementById("saveTransaction");

const transactionMessage =
    document.getElementById("transactionMessage");

const closeModal =
    document.getElementById("closeModal");


/* ==========================================
   MONEY FORMAT
   ========================================== */

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2
        }
    ).format(amount || 0);

}


/* ==========================================
   SHOW LOGIN / SIGNUP
   ========================================== */

switchAuth.addEventListener(
    "click",
    function () {

        signupMode = !signupMode;

        authMessage.textContent = "";

        if (signupMode) {

            authTitle.textContent =
                "Create your VPay account";

            authSubtitle.textContent =
                "Start managing your money smarter.";

            nameField.classList.remove("hidden");

            authButton.textContent =
                "Create Account";

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

    }
);


/* ==========================================
   LOGIN / SIGNUP
   ========================================== */

authButton.addEventListener(
    "click",
    async function () {

        const userEmail =
            email.value.trim();

        const userPassword =
            password.value;

        const name =
            fullName.value.trim();


        authMessage.textContent = "";


        if (!userEmail || !userPassword) {

            authMessage.textContent =
                "Please enter your email and password.";

            return;

        }


        /* SIGNUP */

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


            authButton.disabled = false;


            if (data.session) {

                await createProfile(
                    data.user,
                    name
                );

                showDashboard(data.user);

            } else {

                authMessage.textContent =
                    "Account created. Please check your email to confirm your account.";

            }

            return;

        }


        /* LOGIN */

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

    }
);


/* ==========================================
   CREATE PROFILE
   ========================================== */

async function createProfile(user, name) {

    if (!user) return;


    const { error } =
        await supabaseClient
            .from("profiles")
            .upsert({

                id: user.id,

                full_name:
                    name ||
                    user.user_metadata?.full_name ||
                    "VPay User"

            });


    if (error) {

        console.log(
            "Profile setup:",
            error.message
        );

    }

}


/* ==========================================
   SHOW DASHBOARD
   ========================================== */

async function showDashboard(user) {

    if (!user) return;


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
                .maybeSingle();


        if (data) {

            name = data.full_name;

        }

    }


    userName.textContent =
        name || "VPay User";


    await loadTransactions();

}


/* ==========================================
   OPEN ADD MONEY
   ========================================== */

function openAddMoney() {

    transactionType = "income";

    modalTitle.textContent =
        "Add Money";

    modalDescription.textContent =
        "Record money received.";

    transactionAmount.value = "";

    transactionDescription.value = "";

    transactionMessage.textContent = "";

    transactionModal.classList.remove("hidden");

}


/* ==========================================
   OPEN EXPENSE
   ========================================== */

function openAddExpense() {

    transactionType = "expense";

    modalTitle.textContent =
        "Add Expense";

    modalDescription.textContent =
        "Record money you spent.";

    transactionAmount.value = "";

    transactionDescription.value = "";

    transactionMessage.textContent = "";

    transactionModal.classList.remove("hidden");

}


/* ==========================================
   BUTTONS
   ========================================== */

document
    .getElementById("addMoneyBtn")
    .addEventListener(
        "click",
        openAddMoney
    );


document
    .getElementById("quickAddMoney")
    .addEventListener(
        "click",
        openAddMoney
    );


document
    .getElementById("addExpenseBtn")
    .addEventListener(
        "click",
        openAddExpense
    );


document
    .getElementById("quickAddExpense")
    .addEventListener(
        "click",
        openAddExpense
    );


/* ==========================================
   CLOSE MODAL
   ========================================== */

closeModal.addEventListener(
    "click",
    function () {

        transactionModal.classList.add(
            "hidden"
        );

    }
);


/* ==========================================
   SAVE TRANSACTION
   ========================================== */

saveTransaction.addEventListener(
    "click",
    async function () {

        const amount =
            Number(transactionAmount.value);

        const description =
            transactionDescription.value.trim();


        transactionMessage.textContent = "";


        if (!amount || amount <= 0) {

            transactionMessage.textContent =
                "Enter a valid amount.";

            return;

        }


        saveTransaction.disabled = true;

        saveTransaction.textContent =
            "Saving...";


        const {
            data: {
                user
            }
        } = await supabaseClient.auth.getUser();


        if (!user) {

            transactionMessage.textContent =
                "Your session has expired. Please login again.";

            saveTransaction.disabled = false;

            saveTransaction.textContent =
                "Save Transaction";

            return;

        }


        const { error } =
            await supabaseClient
                .from("transactions")
                .insert({

                    user_id: user.id,

                    type: transactionType,

                    amount: amount,

                    description:
                        description ||
                        (
                            transactionType === "income"
                                ? "Money received"
                                : "Expense"
                        )

                });


        if (error) {

            console.error(error);

            transactionMessage.textContent =
                error.message;

            saveTransaction.disabled = false;

            saveTransaction.textContent =
                "Save Transaction";

            return;

        }


        saveTransaction.disabled = false;

        saveTransaction.textContent =
            "Save Transaction";


        transactionMessage.textContent =
            "Transaction saved successfully.";


        await loadTransactions();


        setTimeout(
            function () {

                transactionModal.classList.add(
                    "hidden"
                );

            },
            700
        );

    }
);


/* ==========================================
   LOAD TRANSACTIONS
   ========================================== */

async function loadTransactions() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) return;


    const { data, error } =
        await supabaseClient
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Transaction loading error:",
            error.message
        );

        return;

    }


    calculateBalance(data || []);

    displayTransactions(data || []);

}


/* ==========================================
   CALCULATE BALANCE
   ========================================== */

function calculateBalance(transactions) {

    let income = 0;

    let expenses = 0;


    transactions.forEach(
        function (transaction) {

            const amount =
                Number(transaction.amount) || 0;


            if (transaction.type === "income") {

                income += amount;

            }


            if (transaction.type === "expense") {

                expenses += amount;

            }

        }
    );


    const balance =
        income - expenses;


    totalIncome.textContent =
        formatMoney(income);

    totalExpenses.textContent =
        formatMoney(expenses);

    totalBalance.textContent =
        formatMoney(balance);

}


/* ==========================================
   DISPLAY TRANSACTIONS
   ========================================== */

function displayTransactions(transactions) {

    if (!transactions.length) {

        transactionList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    💳
                </div>

                <h3>
                    No transactions yet
                </h3>

                <p>
                    Add your first income or expense.
                </p>

            </div>

        `;

        return;

    }


    transactionList.innerHTML =
        transactions
            .slice(0, 10)
            .map(
                function (transaction) {

                    const isIncome =
                        transaction.type === "income";


                    const sign =
                        isIncome ? "+" : "-";


                    const icon =
                        isIncome ? "🟢" : "🔴";


                    const date =
                        new Date(
                            transaction.created_at
                        ).toLocaleDateString(
                            "en-NG",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        );


                    return `

                        <div class="transaction-item">

                            <div class="transaction-icon">
                                ${icon}
                            </div>

                            <div class="transaction-info">

                                <strong>
                                    ${
                                        transaction.description ||
                                        (
                                            isIncome
                                                ? "Money received"
                                                : "Expense"
                                        )
                                    }
                                </strong>

                                <small>
                                    ${date}
                                </small>

                            </div>

                            <div
                                class="transaction-amount ${
                                    isIncome
                                        ? "income"
                                        : "expense"
                                }"
                            >
                                ${sign}${formatMoney(
                                    transaction.amount
                                )}
                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ==========================================
   REFRESH
   ========================================== */

document
    .getElementById("refreshTransactions")
    .addEventListener(
        "click",
        loadTransactions
    );


document
    .getElementById("refreshTransactions2")
    .addEventListener(
        "click",
        loadTransactions
    );


/* ==========================================
   LOGOUT
   ========================================== */

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        dashboard.classList.add("hidden");

        authScreen.classList.remove("hidden");

        email.value = "";

        password.value = "";

        fullName.value = "";

    }
);


/* ==========================================
   SESSION CHECK
   ========================================== */

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


/* ==========================================
   AUTH STATE
   ========================================== */

supabaseClient.auth.onAuthStateChange(
    function (event, session) {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            showDashboard(session.user);

        }

    }
);


/* ==========================================
   START
   ========================================== */

checkSession();

console.log(
    "VPay wallet system loaded"
);
