```javascript
"use strict";

/* =========================================================
   VPAY SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL =
    "https://kjkxqrjbchnonbncnzni.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_yd2PC23MRQsBvOBeE9Sr3g_Bo6_9J3j";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let signupMode = false;
let transactionType = "income";
let bulkRecipients = [];


/* =========================================================
   AUTH ELEMENTS
   ========================================================= */

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

const fullName =
    document.getElementById("fullName");

const nameField =
    document.getElementById("nameField");

const switchAuth =
    document.getElementById("switchAuth");

const switchText =
    document.getElementById("switchText");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================================
   AUTH MESSAGE
   ========================================================= */

function showAuthMessage(message) {

    if (authMessage) {
        authMessage.textContent = message;
    }

}


/* =========================================================
   LOGIN / SIGNUP
   ========================================================= */

if (authButton) {

    authButton.addEventListener(
        "click",
        async function () {

            const userEmail =
                email.value.trim();

            const userPassword =
                password.value;

            if (!userEmail || !userPassword) {

                showAuthMessage(
                    "Please enter your email and password."
                );

                return;
            }


            if (
                signupMode &&
                fullName &&
                !fullName.value.trim()
            ) {

                showAuthMessage(
                    "Please enter your full name."
                );

                return;
            }


            authButton.disabled = true;

            showAuthMessage(
                signupMode
                    ? "Creating account..."
                    : "Logging in..."
            );


            try {

                /* =========================================
                   SIGN UP
                   ========================================= */

                if (signupMode) {

                    const name =
                        fullName.value.trim();


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


                    if (error) {

                        console.error(
                            "Signup error:",
                            error
                        );

                        showAuthMessage(
                            error.message
                        );

                        authButton.disabled = false;

                        return;
                    }


                    /*
                     Supabase may require email confirmation.
                    */

                    if (
                        data.user &&
                        !data.session
                    ) {

                        showAuthMessage(
                            "Account created. Please check your email to confirm your account."
                        );

                        authButton.disabled = false;

                        return;
                    }


                    if (data.session) {

                        showDashboard(
                            data.user
                        );

                    }

                    return;
                }


                /* =========================================
                   LOGIN
                   ========================================= */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({

                        email: userEmail,

                        password: userPassword

                    });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    showAuthMessage(
                        error.message
                    );

                    authButton.disabled = false;

                    return;
                }


                if (
                    data &&
                    data.user
                ) {

                    showDashboard(
                        data.user
                    );

                }


            } catch (error) {

                console.error(
                    "Authentication error:",
                    error
                );

                showAuthMessage(
                    "Unable to connect to VPay. Please try again."
                );

            }


            authButton.disabled = false;

        }
    );

}


/* =========================================================
   SHOW DASHBOARD
   ========================================================= */

function showDashboard(user) {

    if (authScreen) {

        authScreen.classList.add(
            "hidden"
        );

    }


    if (dashboard) {

        dashboard.classList.remove(
            "hidden"
        );

    }


    if (
        userName &&
        user
    ) {

        const name =
            user.user_metadata?.full_name ||
            user.email ||
            "VPay User";

        userName.textContent =
            name;

    }


    showAuthMessage("");

}


/* =========================================================
   SWITCH LOGIN / SIGNUP
   ========================================================= */

if (switchAuth) {

    switchAuth.addEventListener(
        "click",
        function () {

            signupMode =
                !signupMode;


            if (signupMode) {

                if (nameField) {

                    nameField.classList.remove(
                        "hidden"
                    );

                }


                if (authTitle) {

                    authTitle.textContent =
                        "Create your VPay account";

                }


                if (authSubtitle) {

                    authSubtitle.textContent =
                        "Start managing your money smarter.";

                }


                if (authButton) {

                    authButton.textContent =
                        "Create Account";

                }


                if (switchText) {

                    switchText.textContent =
                        "Already have an account?";

                }


                switchAuth.textContent =
                    "Login";


            } else {

                if (nameField) {

                    nameField.classList.add(
                        "hidden"
                    );

                }


                if (authTitle) {

                    authTitle.textContent =
                        "Welcome to VPay";

                }


                if (authSubtitle) {

                    authSubtitle.textContent =
                        "Manage your money smarter.";

                }


                if (authButton) {

                    authButton.textContent =
                        "Login";

                }


                if (switchText) {

                    switchText.textContent =
                        "Don't have an account?";

                }


                switchAuth.textContent =
                    "Create account";

            }


            showAuthMessage("");

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    return;
                }


                if (dashboard) {

                    dashboard.classList.add(
                        "hidden"
                    );

                }


                if (authScreen) {

                    authScreen.classList.remove(
                        "hidden"
                    );

                }


                if (email) {

                    email.value = "";

                }


                if (password) {

                    password.value = "";

                }


            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   CHECK EXISTING SESSION
   ========================================================= */

async function checkSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return;
        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            showDashboard(
                data.session.user
            );

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }

}


checkSession();


/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        console.log(
            "Auth event:",
            event
        );


        if (
            session &&
            session.user
        ) {

            showDashboard(
                session.user
            );

        }

    }
);


/* =========================================================
   VPAY BULK TRANSFER
   ========================================================= */


/* ELEMENTS */

const bulkFileInput =
    document.getElementById(
        "bulkFileInput"
    );

const bulkSummary =
    document.getElementById(
        "bulkSummary"
    );

const recipientCount =
    document.getElementById(
        "recipientCount"
    );

const bulkTotalAmount =
    document.getElementById(
        "bulkTotalAmount"
    );

const recipientTableContainer =
    document.getElementById(
        "recipientTableContainer"
    );

const bulkFileStatus =
    document.getElementById(
        "bulkFileStatus"
    );

const bulkTransferActions =
    document.getElementById(
        "bulkTransferActions"
    );

const clearRecipientsBtn =
    document.getElementById(
        "clearRecipientsBtn"
    );


/* =========================================================
   FORMAT MONEY
   ========================================================= */

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN"
        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   READ BULK FILE
   ========================================================= */

if (bulkFileInput) {

    bulkFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) {

                return;

            }


            try {

                if (bulkFileStatus) {

                    bulkFileStatus.classList.remove(
                        "hidden"
                    );

                    bulkFileStatus.textContent =
                        "Reading " +
                        file.name +
                        "...";

                }


                const buffer =
                    await file.arrayBuffer();


                const workbook =
                    XLSX.read(
                        buffer,
                        {
                            type: "array"
                        }
                    );


                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            defval: ""
                        }
                    );


                if (!rows.length) {

                    alert(
                        "The file contains no data."
                    );

                    return;

                }


                /* =========================================
                   CONVERT RECIPIENTS
                   ========================================= */

                bulkRecipients =
                    rows.map(
                        function (row) {

                            return {

                                name:
                                    row.Name ||
                                    row.name ||
                                    row[
                                        "Recipient Name"
                                    ] ||
                                    "",

                                accountNumber:
                                    row[
                                        "Account Number"
                                    ] ||
                                    row.accountNumber ||
                                    row.AccountNumber ||
                                    "",

                                bank:
                                    row.Bank ||
                                    row.bank ||
                                    "",

                                amount:
                                    Number(
                                        row.Amount ||
                                        row.amount ||
                                        0
                                    )

                            };

                        }
                    ).filter(
                        function (recipient) {

                            return (
                                (
                                    recipient.name ||
                                    recipient.accountNumber
                                ) &&
                                recipient.amount > 0
                            );

                        }
                    );


                if (!bulkRecipients.length) {

                    alert(
                        "No valid recipients found.\n\n" +
                        "Your file should contain:\n" +
                        "Name, Account Number, Bank, Amount"
                    );

                    return;

                }


                renderBulkRecipients();


                if (bulkFileStatus) {

                    bulkFileStatus.textContent =
                        file.name +
                        " loaded successfully.";

                }


            } catch (error) {

                console.error(
                    "Bulk upload error:",
                    error
                );

                alert(
                    "Unable to read this file."
                );

            }

        }
    );

}


/* =========================================================
   DISPLAY RECIPIENTS
   ========================================================= */

function renderBulkRecipients() {

    if (!recipientTableContainer) {

        return;

    }


    const total =
        bulkRecipients.reduce(
            function (
                sum,
                recipient
            ) {

                return (
                    sum +
                    Number(
                        recipient.amount
                    )
                );

            },
            0
        );


    if (bulkSummary) {

        bulkSummary.classList.remove(
            "hidden"
        );

    }


    if (recipientCount) {

        recipientCount.textContent =
            bulkRecipients.length;

    }


    if (bulkTotalAmount) {

        bulkTotalAmount.textContent =
            formatMoney(total);

    }


    if (!bulkRecipients.length) {

        recipientTableContainer.innerHTML = `

            <div class="bulk-empty-state">

                <div class="bulk-empty-icon">
                    📄
                </div>

                <h3>
                    No recipient list yet
                </h3>

                <p>
                    Add recipients to begin.
                </p>

            </div>

        `;


        if (bulkTransferActions) {

            bulkTransferActions.classList.add(
                "hidden"
            );

        }

        return;

    }


    recipientTableContainer.innerHTML = `

        <div class="recipient-table-wrapper">

            <table class="recipient-table">

                <thead>

                    <tr>

                        <th>#</th>

                        <th>Recipient</th>

                        <th>Account Number</th>

                        <th>Bank</th>

                        <th>Amount</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    ${bulkRecipients.map(
                        function (
                            recipient,
                            index
                        ) {

                            return `

                                <tr>

                                    <td>
                                        ${index + 1}
                                    </td>

                                    <td>

                                        <strong>
                                            ${
                                                escapeHTML(
                                                    recipient.name
                                                )
                                            }
                                        </strong>

                                    </td>

                                    <td>
                                        ${
                                            escapeHTML(
                                                String(
                                                    recipient.accountNumber
                                                )
                                            )
                                        }
                                    </td>

                                    <td>
                                        ${
                                            escapeHTML(
                                                recipient.bank
                                            )
                                        }
                                    </td>

                                    <td>

                                        <strong>
                                            ${
                                                formatMoney(
                                                    recipient.amount
                                                )
                                            }
                                        </strong>

                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            class="remove-recipient-btn"
                                            onclick="removeBulkRecipient(${index})"
                                        >
                                            Remove
                                        </button>

                                    </td>

                                </tr>

                            `;

                        }
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;


    if (bulkTransferActions) {

        bulkTransferActions.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   REMOVE RECIPIENT
   ========================================================= */

function removeBulkRecipient(index) {

    bulkRecipients.splice(
        index,
        1
    );

    renderBulkRecipients();

}


/* Make function available to inline onclick */

window.removeBulkRecipient =
    removeBulkRecipient;


/* =========================================================
   CLEAR ALL
   ========================================================= */

if (clearRecipientsBtn) {

    clearRecipientsBtn.addEventListener(
        "click",
        function () {

            if (!bulkRecipients.length) {

                return;

            }


            if (
                !confirm(
                    "Remove all recipients?"
                )
            ) {

                return;

            }


            bulkRecipients = [];


            if (bulkFileInput) {

                bulkFileInput.value = "";

            }


            renderBulkRecipients();

        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   VPAY APP LOADED
   ========================================================= */

console.log(
    "VPay application loaded successfully."
);
```
