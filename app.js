"use strict";

/* ==========================================
   VPAY - COMPLETE APP.JS
   ========================================== */

const SUPABASE_URL =
    "https://kjkxqrjbchnonbncnzni.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_yd2PC23MRQsBvOBeE9Sr3g_Bo6_9J3j";

const supabaseClient =
    window.supabase.createClient(
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

const authScreen =
    document.getElementById("authScreen");

const dashboard =
    document.getElementById("dashboard");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const nameField =
    document.getElementById("nameField");

const fullName =
    document.getElementById("fullName");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const authButton =
    document.getElementById("authButton");

const switchAuth =
    document.getElementById("switchAuth");

const switchText =
    document.getElementById("switchText");

const authMessage =
    document.getElementById("authMessage");

const logoutButton =
    document.getElementById("logoutButton");

const userName =
    document.getElementById("userName");

const totalBalance =
    document.getElementById("totalBalance");

const totalIncome =
    document.getElementById("totalIncome");

const totalExpenses =
    document.getElementById("totalExpenses");

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

const addMoneyBtn =
    document.getElementById("addMoneyBtn");

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const quickAddMoney =
    document.getElementById("quickAddMoney");

const quickAddExpense =
    document.getElementById("quickAddExpense");

const refreshTransactions =
    document.getElementById("refreshTransactions");

const refreshTransactions2 =
    document.getElementById("refreshTransactions2");


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
    ).format(Number(amount) || 0);

}


/* ==========================================
   LOGIN / SIGNUP SWITCH
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


        /* ==============================
           SIGN UP
           ============================== */

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


            authButton.disabled = false;


            if (error) {

                authMessage.textContent =
                    error.message;

                return;

            }


            if (data.session) {

                await createProfile(
                    data.user,
                    name
                );

                await showDashboard(
                    data.user
                );

            } else {

                authMessage.textContent =
                    "Account created successfully. Check your email if confirmation is required.";

            }

            return;

        }


        /* ==============================
           LOGIN
           ============================== */

        authButton.disabled = true;

        authMessage.textContent =
            "Logging in...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: userEmail,

                password: userPassword

            });


        authButton.disabled = false;


        if (error) {

            authMessage.textContent =
                error.message;

            return;

        }


        await showDashboard(
            data.user
        );

    }
);


/* ==========================================
   CREATE PROFILE
   ========================================== */

async function createProfile(
    user,
    name
) {

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
            "Profile error:",
            error.message
        );

    }

}


/* ==========================================
   SHOW DASHBOARD
   ========================================== */

async function showDashboard(user) {

    if (!user) return;


    authScreen.classList.add(
        "hidden"
    );

    dashboard.classList.remove(
        "hidden"
    );


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

            name =
                data.full_name;

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

    transactionType =
        "income";

    modalTitle.textContent =
        "Add Money";

    modalDescription.textContent =
        "Record money received.";

    transactionAmount.value =
        "";

    transactionDescription.value =
        "";

    transactionMessage.textContent =
        "";

    transactionModal.classList.remove(
        "hidden"
    );

    setTimeout(
        function () {

            transactionAmount.focus();

        },
        100
    );

}


/* ==========================================
   OPEN ADD EXPENSE
   ========================================== */

function openAddExpense() {

    transactionType =
        "expense";

    modalTitle.textContent =
        "Add Expense";

    modalDescription.textContent =
        "Record money you spent.";

    transactionAmount.value =
        "";

    transactionDescription.value =
        "";

    transactionMessage.textContent =
        "";

    transactionModal.classList.remove(
        "hidden"
    );

    setTimeout(
        function () {

            transactionAmount.focus();

        },
        100
    );

}


/* ==========================================
   BUTTON EVENTS
   ========================================== */

if (addMoneyBtn) {

    addMoneyBtn.addEventListener(
        "click",
        openAddMoney
    );

}


if (quickAddMoney) {

    quickAddMoney.addEventListener(
        "click",
        openAddMoney
    );

}


if (addExpenseBtn) {

    addExpenseBtn.addEventListener(
        "click",
        openAddExpense
    );

}


if (quickAddExpense) {

    quickAddExpense.addEventListener(
        "click",
        openAddExpense
    );

}


/* ==========================================
   CLOSE MODAL
   ========================================== */

if (closeModal && transactionModal) {

    closeModal.onclick = function () {

        transactionModal.classList.add("hidden");

        transactionMessage.textContent = "";

        transactionAmount.value = "";

        transactionDescription.value = "";

    };

}
document.addEventListener("keydown", function (event) {

    if (
        event.key === "Escape" &&
        transactionModal &&
        !transactionModal.classList.contains("hidden")
    ) {

        transactionModal.classList.add("hidden");

    }

});
/* ==========================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ========================================== */

if (transactionModal) {

    transactionModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                transactionModal
            ) {

                transactionModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* ==========================================
   SAVE TRANSACTION
   ========================================== */

if (saveTransaction) {

    saveTransaction.addEventListener(
        "click",
        async function () {

            const amount =
                Number(
                    transactionAmount.value
                );

            const description =
                transactionDescription.value.trim();


            transactionMessage.textContent =
                "";


            if (
                !amount ||
                amount <= 0
            ) {

                transactionMessage.textContent =
                    "Please enter a valid amount.";

                return;

            }


            saveTransaction.disabled =
                true;

            saveTransaction.textContent =
                "Saving...";


            try {

                const {
                    data: {
                        user
                    }
                } =
                    await supabaseClient.auth.getUser();


                if (!user) {

                    throw new Error(
                        "Your session has expired. Please login again."
                    );

                }


                const { error } =
                    await supabaseClient
                        .from("transactions")
                        .insert({

                            user_id:
                                user.id,

                            amount:
                                amount,

                            type:
                                transactionType,

                            description:
                                description ||
                                (
                                    transactionType ===
                                    "income"
                                        ? "Money received"
                                        : "Expense"
                                )

                        });


                if (error) {

                    throw error;

                }


                transactionMessage.textContent =
                    "Transaction saved successfully ✓";


                await loadTransactions();


                setTimeout(
                    function () {

                        transactionModal.classList.add(
                            "hidden"
                        );

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Transaction error:",
                    error
                );

                transactionMessage.textContent =
                    error.message ||
                    "Unable to save transaction.";

            }


            saveTransaction.disabled =
                false;

            saveTransaction.textContent =
                "Save Transaction";

        }
    );

}


/* ==========================================
   LOAD TRANSACTIONS
   ========================================== */

async function loadTransactions() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("transactions")
            .select("*")
            .eq(
                "user_id",
                user.id
            )
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


    calculateBalance(
        data || []
    );

    displayTransactions(
        data || []
    );

}


/* ==========================================
   CALCULATE BALANCE
   ========================================== */

function calculateBalance(
    transactions
) {

    let income = 0;

    let expenses = 0;


    transactions.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            }


            if (
                transaction.type ===
                "expense"
            ) {

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

function displayTransactions(
    transactions
) {

    if (!transactionList) return;


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
                        transaction.type ===
                        "income";


                    const sign =
                        isIncome
                            ? "+"
                            : "-";


                    const icon =
                        isIncome
                            ? "💰"
                            : "💸";


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

                            <div class="transaction-amount ${
                                isIncome
                                    ? "income"
                                    : "expense"
                            }">

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

if (refreshTransactions) {

    refreshTransactions.addEventListener(
        "click",
        loadTransactions
    );

}


if (refreshTransactions2) {

    refreshTransactions2.addEventListener(
        "click",
        loadTransactions
    );

}


/* ==========================================
   LOGOUT
   ========================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            await supabaseClient.auth.signOut();

            dashboard.classList.add(
                "hidden"
            );

            authScreen.classList.remove(
                "hidden"
            );

            email.value = "";

            password.value = "";

            fullName.value = "";

        }
    );

}


/* ==========================================
   CHECK EXISTING SESSION
   ========================================== */

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    if (session) {

        await showDashboard(
            session.user
        );

    }

}


/* ==========================================
   AUTH STATE
   ========================================== */

supabaseClient.auth.onAuthStateChange(
    async function (
        event,
        session
    ) {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            await showDashboard(
                session.user
            );

        }

    }
);


/* ==========================================
   START APP
   ========================================== */

checkSession();

console.log(
    "VPay application loaded successfully"
);
/* ==========================================
   VPAY BULK TRANSFER - FILE UPLOAD
   ========================================== */

const uploadBulkBtn =
    document.getElementById("uploadBulkBtn");

const bulkFileInput =
    document.getElementById("bulkFileInput");

const bulkTransferArea =
    document.getElementById("bulkTransferArea");


if (uploadBulkBtn && bulkFileInput) {

    uploadBulkBtn.addEventListener("click", function () {

        bulkFileInput.click();

    });

}


if (bulkFileInput) {

    bulkFileInput.addEventListener("change", function () {

        const file = bulkFileInput.files[0];

        if (!file) return;

        bulkTransferArea.innerHTML = `

            <div class="bulk-file-selected">

                <div class="bulk-file-icon">
                    📄
                </div>

                <div>

                    <strong>
                        ${file.name}
                    </strong>

                    <p>
                        File selected successfully.
                    </p>

                </div>

            </div>

            <button
                id="processBulkFile"
                class="bulk-primary-btn"
                type="button"
            >
                🔍 Review Recipients
            </button>

        `;

    });

}
/* ==========================================
   VPAY BULK TRANSFER FILE READER
   ========================================== */

const bulkFileInput =
    document.getElementById("bulkFileInput");

const bulkTransferArea =
    document.getElementById("bulkTransferArea");


if (bulkFileInput) {

    bulkFileInput.addEventListener("change", async function () {

        const file = this.files[0];

        if (!file) return;

        bulkTransferArea.innerHTML = `
            <div class="bulk-file-selected">
                <div class="bulk-file-icon">📄</div>

                <div>
                    <strong>${file.name}</strong>
                    <p>Reading recipient information...</p>
                </div>
            </div>
        `;

        try {

            const arrayBuffer =
                await file.arrayBuffer();

            const workbook =
                XLSX.read(arrayBuffer, {
                    type: "array"
                });

            const firstSheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];

            const rows =
                XLSX.utils.sheet_to_json(
                    firstSheet,
                    {
                        defval: ""
                    }
                );

            if (!rows.length) {

                bulkTransferArea.innerHTML = `
                    <div class="empty-state">
                        <h3>File is empty</h3>
                        <p>Please upload a file containing recipients.</p>
                    </div>
                `;

                return;

            }

            displayBulkRecipients(rows);

        } catch (error) {

            console.error(
                "Bulk file error:",
                error
            );

            bulkTransferArea.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to read file</h3>
                    <p>Please check your Excel or CSV file.</p>
                </div>
            `;

        }

    });

}


/* ==========================================
   DISPLAY RECIPIENTS
   ========================================== */

function displayBulkRecipients(rows) {

    const columns =
        Object.keys(rows[0]);

    const total =
        rows.reduce(
            function (sum, row) {

                const amount =
                    Number(
                        row.amount ||
                        row.Amount ||
                        0
                    );

                return sum + amount;

            },
            0
        );


    let tableHTML = `

        <div class="bulk-summary">

            <div>
                <span>Recipients</span>
                <strong>${rows.length}</strong>
            </div>

            <div>
                <span>Total Amount</span>
                <strong>
                    ${formatVPayMoney(total)}
                </strong>
            </div>

        </div>

        <div class="bulk-table-wrapper">

            <table class="bulk-table">

                <thead>
                    <tr>
    `;


    columns.forEach(function (column) {

        tableHTML += `
            <th>${column}</th>
        `;

    });


    tableHTML += `
                    </tr>
                </thead>

                <tbody>
    `;


    rows.forEach(function (row) {

        tableHTML += `<tr>`;

        columns.forEach(function (column) {

            tableHTML += `
                <td>${row[column] || ""}</td>
            `;

        });

        tableHTML += `</tr>`;

    });


    tableHTML += `

                </tbody>

            </table>

        </div>

        <button
            id="continueBulkTransfer"
            class="bulk-primary-btn"
            type="button"
        >
            Continue to Review →
        </button>

    `;


    bulkTransferArea.innerHTML =
        tableHTML;

}
