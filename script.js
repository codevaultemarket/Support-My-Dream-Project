"use strict";

let selectedAmount = 1;

const amountButtons = document.querySelectorAll(".amount-btn");
const customAmountInput = document.getElementById("customAmount");
const selectedAmountText = document.getElementById("selectedAmountText");

const progressBox = document.getElementById("mainProgress");
const raisedText = document.getElementById("raisedText");
const manualRaisedText = document.getElementById("manualRaisedText");
const percentText = document.getElementById("percentText");
const progressFill = document.getElementById("progressFill");

const paypalContainer = document.getElementById("paypal-button-container");
const paypalDirectLink = document.getElementById("paypalDirectLink");

/* =========================
   PROGRESS BAR
========================= */

function updateProgress() {
  if (!progressBox) return;

  const raised = Number(progressBox.dataset.raised || 0);
  const goal = Number(progressBox.dataset.goal || 2000);

  const percent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  if (raisedText) raisedText.textContent = `$${raised.toLocaleString()}`;
  if (manualRaisedText) manualRaisedText.textContent = `$${raised.toLocaleString()}`;
  if (percentText) percentText.textContent = `${percent.toFixed(1)}%`;

  if (progressFill) {
    setTimeout(() => {
      progressFill.style.width = `${percent}%`;
    }, 250);
  }
}

updateProgress();

/* =========================
   SELECT AMOUNT
========================= */

function setSelectedAmount(amount) {
  const cleanAmount = Number(amount);

  if (!cleanAmount || cleanAmount < 1) {
    selectedAmount = 1;
  } else {
    selectedAmount = cleanAmount;
  }

  selectedAmountText.textContent = `$${selectedAmount}`;

  renderPayPalButtons();
}

amountButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    amountButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    customAmountInput.value = "";

    setSelectedAmount(btn.dataset.amount);
  });
});

customAmountInput.addEventListener("input", () => {
  amountButtons.forEach((b) => b.classList.remove("active"));

  let value = Number(customAmountInput.value);

  if (value > 2000) {
    value = 2000;
    customAmountInput.value = 2000;
  }

  if (value < 1 || !value) {
    selectedAmountText.textContent = "$1";
    selectedAmount = 1;
    renderPayPalButtons();
    return;
  }

  setSelectedAmount(value);
});

/* =========================
   PAYPAL DIRECT LINK
========================= */

function updatePayPalDirectLink() {
  /*
    ضع رابط PayPal.me الخاص بك هنا:
    مثال:
    const paypalMeUsername = "FouadKassi";
  */

  const paypalMeUsername = "YOUR_PAYPAL_USERNAME";

  if (!paypalDirectLink) return;

  paypalDirectLink.href = `https://www.paypal.com/paypalme/${paypalMeUsername}/${selectedAmount}`;
}

/* =========================
   PAYPAL BUTTONS
========================= */

function renderPayPalButtons() {
  updatePayPalDirectLink();

  if (!paypalContainer) return;

  paypalContainer.innerHTML = "";

  if (typeof paypal === "undefined") {
    paypalContainer.innerHTML = `
      <p class="paypal-placeholder">
        PayPal is not loaded yet. Add your PayPal Client ID in index.html.
      </p>
    `;
    return;
  }

  paypal.Buttons({
    style: {
      layout: "vertical",
      color: "gold",
      shape: "pill",
      label: "paypal"
    },

    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            description: "Support for building my real business project",
            amount: {
              currency_code: "USD",
              value: selectedAmount.toFixed(2)
            }
          }
        ]
      });
    },

    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        const payerName =
          details?.payer?.name?.given_name ||
          details?.payer?.email_address ||
          "Supporter";

        showSuccessMessage(payerName, selectedAmount);
      });
    },

    onCancel: function () {
      showToast("Payment cancelled. You can try again anytime.", "warning");
    },

    onError: function () {
      showToast("Something went wrong with PayPal. Please try again.", "error");
    }
  }).render("#paypal-button-container");
}

renderPayPalButtons();

/* =========================
   SUCCESS MESSAGE
========================= */

function showSuccessMessage(name, amount) {
  paypalContainer.innerHTML = `
    <div class="success-payment-box">
      <div class="success-icon">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3>Thank you, ${escapeHTML(name)}!</h3>
      <p>Your support of <strong>$${amount}</strong> means a lot.</p>
      <small>
        The total raised amount will be updated manually on the website.
      </small>
    </div>
  `;

  showToast(`Thank you for your support: $${amount}`, "success");
}

/* =========================
   TOAST MESSAGE
========================= */

function showToast(message, type = "success") {
  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

/* =========================
   SECURITY
========================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   SCROLL ANIMATION
========================= */

const animatedElements = document.querySelectorAll(
  ".story-card, .goal-card, .update-card, .donation-panel, .impact-panel, .manual-update-card"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.16
  }
);

animatedElements.forEach((el) => {
  el.classList.add("hidden-animate");
  observer.observe(el);
});
