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
/* ==========================================
   VPAY BULK FILE UPLOAD
   ========================================== */

const uploadBulkBtn = document.getElementById("uploadBulkBtn");
const bulkFileInput = document.getElementById("bulkFileInput");

if (uploadBulkBtn && bulkFileInput) {

    uploadBulkBtn.addEventListener("click", function () {

        console.log("Upload button clicked");

        bulkFileInput.click();

    });

    bulkFileInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        console.log("File selected:", file.name);

        alert("File selected: " + file.name);

    });

}

console.log("VPAY BULK UPLOAD LOADED");
/* ==========================================
   VPAY BULK TRANSFER
   ========================================== */

let bulkRecipients = [];


/* ELEMENTS */

const bulkFileInput =
    document.getElementById("bulkFileInput");

const bulkSummary =
    document.getElementById("bulkSummary");

const recipientCount =
    document.getElementById("recipientCount");

const bulkTotalAmount =
    document.getElementById("bulkTotalAmount");

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


/* ==========================================
   READ FILE
   ========================================== */

if (bulkFileInput) {

    bulkFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) return;


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


                /* CONVERT RECIPIENTS */

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
                                recipient.name ||
                                recipient.accountNumber
                            ) &&
                            recipient.amount > 0;

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


/* ==========================================
   DISPLAY RECIPIENTS
   ========================================== */

function renderBulkRecipients() {

    if (!recipientTableContainer)
        return;


    const total =
        bulkRecipients.reduce(
            function (
                sum,
                recipient
            ) {

                return sum +
                    Number(
                        recipient.amount
                    );

            },
            0
        );


    /* SUMMARY */

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


    /* EMPTY */

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


    /* TABLE */

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


/* ==========================================
   REMOVE RECIPIENT
   ========================================== */

function removeBulkRecipient(index) {

    bulkRecipients.splice(
        index,
        1
    );

    renderBulkRecipients();

}


/* ==========================================
   CLEAR ALL
   ========================================== */

if (clearRecipientsBtn) {

    clearRecipientsBtn.addEventListener(
        "click",
        function () {

            if (!bulkRecipients.length)
                return;


            if (
                !confirm(
                    "Remove all recipients?"
                )
            ) {

                return;

            }


            bulkRecipients = [];

            bulkFileInput.value = "";

            renderBulkRecipients();

        }
    );

}


/* ==========================================
   ESCAPE HTML
   ========================================== */

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


console.log(
    "VPAY BULK TRANSFER READY"
);
