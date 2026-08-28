"use strict";

/* ==========================================
   VPAY - COMPLETE APP.JS
   Login + Transactions + Bulk Upload
   ========================================== */


/* ==========================================
   SUPABASE
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
   STATE
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

const uploadBulkBtn =
    document.getElementById("uploadBulkBtn");

const bulkFileInput =
    document.getElementById("bulkFileInput");

const bulkTransferArea =
    document.getElementById("bulkTransferArea");


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

if (switchAuth) {

    switchAuth.addEventListener(
        "click",
        function () {

            signupMode = !signupMode;

            if (authMessage) {
                authMessage.textContent = "";
            }

            if (signupMode) {

                authTitle.textContent =
                    "Create your VPay account";

                authSubtitle.textContent =
                    "Start managing your money smarter.";

                nameField.classList.remove(
                    "hidden"
                );

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

                nameField.classList.add(
                    "hidden"
                );

                authButton.textContent =
                    "Login";

                switchText.textContent =
                    "Don't have an account?";

                switchAuth.textContent =
                    "Create account";

            }

        }
    );

}


/* ==========================================
   LOGIN / SIGNUP
   ========================================== */

if (authButton) {

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


            /* ==========================
               SIGN UP
               ========================== */

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


                const {
                    data,
                    error
                } =
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


            /* ==========================
               LOGIN
               ========================== */

            authButton.disabled = true;

            authMessage.textContent =
                "Logging in...";


            const {
                data,
                error
            } =
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

}


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

        console.error(
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

        const {
            data
        } =
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
   BUTTONS
   ========================================== */

if (addMoneyBtn) {

    addMoneyBtn.addEventListener(
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


if (quickAddMoney) {

    quickAddMoney.addEventListener(
        "click",
        openAddMoney
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

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            transactionModal.classList.add(
                "hidden"
            );

        }
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            transactionModal &&
            !transactionModal.classList.contains(
                "hidden"
            )
        ) {

            transactionModal.classList.add(
                "hidden"
            );

        }

    }
);


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


            if (!amount || amount <= 0) {

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


                const {
                    error
                } =
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
            .eq("user_id", user.id)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load transactions:",
            error
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

                    const income =
                        transaction.type ===
                        "income";


                    const sign =
                        income
                            ? "+"
                            : "-";


                    const icon =
                        income
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
                                            income
                                                ? "Money received"
                                                : "Expense"
                                        )
                                    }
                                </strong>

                                <small>
                                    ${date}
                                </small>

                            </div>

                            <div class="
                                transaction-amount
                                ${
                                    income
                                        ? "income"
                                        : "expense"
                                }
                            ">

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
   BULK TRANSFER
   ========================================== */

/*
   The upload button itself is controlled
   by the onclick in index.html.

   This section reads the selected file.
*/


if (bulkFileInput) {

    bulkFileInput.addEventListener(
        "change",
        async function () {

            const file =
                bulkFileInput.files[0];


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
                            Reading recipient information...
                        </p>

                    </div>

                </div>

            `;


            try {

                if (
                    typeof XLSX ===
                    "undefined"
                ) {

                    throw new Error(
                        "Excel reader is not loaded. Please refresh the page."
                    );

                }


                const arrayBuffer =
                    await file.arrayBuffer();


                const workbook =
                    XLSX.read(
                        arrayBuffer,
                        {
                            type: "array"
                        }
                    );


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

                            <div class="empty-icon">
                                📄
                            </div>

                            <h3>
                                File is empty
                            </h3>

                            <p>
                                Please upload a file containing recipients.
                            </p>

                        </div>

                    `;

                    return;

                }


                displayBulkRecipients(
                    rows
                );


            } catch (error) {

                console.error(
                    "Bulk file error:",
                    error
                );


                bulkTransferArea.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Unable to read file
                        </h3>

                        <p>
                            ${error.message}
                        </p>

                    </div>

                `;

            }

        }
    );

}


/* ==========================================
   DISPLAY BULK RECIPIENTS
   ========================================== */

function displayBulkRecipients(
    rows
) {

    const columns =
        Object.keys(rows[0]);


    const total =
        rows.reduce(
            function (
                sum,
                row
            ) {

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


    let html = `

        <div class="bulk-summary">

            <div>
                <span>Recipients</span>
                <strong>
                    ${rows.length}
                </strong>
            </div>

            <div>
                <span>Total Amount</span>
                <strong>
                    ${formatMoney(total)}
                </strong>
            </div>

        </div>


        <div class="bulk-table-wrapper">

            <table class="bulk-table">

                <thead>

                    <tr>
    `;


    columns.forEach(
        function (column) {

            html += `
                <th>
                    ${column}
                </th>
            `;

        }
    );


    html += `

                    </tr>

                </thead>

                <tbody>

    `;


    rows.forEach(
        function (row) {

            html += `<tr>`;


            columns.forEach(
                function (column) {

                    html += `
                        <td>
                            ${row[column] || ""}
                        </td>
                    `;

                }
            );


            html += `</tr>`;

        }
    );


    html += `

                </tbody>

            </table>

        </div>


        <div class="bulk-review-actions">

            <button
                id="removeBulkFile"
                class="bulk-secondary-btn"
                type="button"
            >
                ✕ Remove File
            </button>

            <button
                id="continueBulkTransfer"
                class="bulk-primary-btn"
                type="button"
            >
                Continue to Review →
            </button>

        </div>

    `;


    bulkTransferArea.innerHTML =
        html;


    const removeBulkFile =
        document.getElementById(
            "removeBulkFile"
        );


    if (removeBulkFile) {

        removeBulkFile.addEventListener(
            "click",
            function () {

                bulkFileInput.value = "";

                bulkTransferArea.innerHTML = `

                    <div class="bulk-empty-state">

                        <div class="bulk-empty-icon">
                            📄
                        </div>

                        <h3>
                            No recipient list yet
                        </h3>

                        <p>
                            Upload an Excel or CSV file containing your recipients to start a bulk transfer.
                        </p>

                    </div>

                `;

            }
        );

    }


    const continueBulkTransfer =
        document.getElementById(
            "continueBulkTransfer"
        );


    if (continueBulkTransfer) {

        continueBulkTransfer.addEventListener(
            "click",
            function () {

                alert(
                    "Recipient review is ready. Bank transfer processing will be connected next."
                );

            }
        );

    }

}


/* ==========================================
   AUTH SESSION
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


supabaseClient.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            showDashboard(
                session.user
            );

        }

    }
);


/* ==========================================
   START
   ========================================== */

checkSession();


console.log(
    "VPay complete app loaded successfully."
);
/* ==========================================
   TEST BULK UPLOAD
   ========================================== */

const uploadBulkBtn =
    document.getElementById("uploadBulkBtn");

const bulkFileInput =
    document.getElementById("bulkFileInput");

console.log("Upload button:", uploadBulkBtn);
console.log("File input:", bulkFileInput);


if (uploadBulkBtn && bulkFileInput) {

    uploadBulkBtn.onclick = function () {

        console.log("UPLOAD CLICKED");

        bulkFileInput.click();

    };


    bulkFileInput.onchange = function () {

        const file =
            bulkFileInput.files[0];

        if (!file) return;

        alert(
            "File selected: " + file.name
        );

        console.log(
            "Selected file:",
            file.name
        );

    };

}
