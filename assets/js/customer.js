document.addEventListener("DOMContentLoaded", () => {
  const welcomeMessage = document.getElementById("welcomeMessage");
  const productTable = document.getElementById("customerProductTable");
  const cartTable = document.getElementById("cartTable");
  const grandTotalEl = document.getElementById("grandTotal");
  const paymentInput = document.getElementById("payment");
  const paymentResult = document.getElementById("paymentResult");
  const receiptOutput = document.getElementById("receiptOutput");

  
  const adminInfo = {
    name: "Oyerinde B Venture",
    address: "No 17 Balogun Street, Ijoko road, Sango, Ogun State. ",
    phone: "+2348056139847,+2348065053524"
  };


  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUserEmail = sessionStorage.getItem("currentUserEmail");
  let currentUser = users.find(u => u.email === currentUserEmail);
  if (currentUser) {
    welcomeMessage.textContent = `Welcome, ${currentUser.name}`;
  }

  let products = JSON.parse(localStorage.getItem("inventory")) || [];
  let cart = [];

  renderProducts();

  function renderProducts() {
    productTable.innerHTML = "";
    products.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.variant}</td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td><input type="number" min="1" max="${p.stock}" value="1" class="qty-input"></td>
        <td><button data-index="${index}">Add to Cart</button></td>
      `;
      productTable.appendChild(row);
    });
  }

  productTable.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const index = e.target.getAttribute("data-index");
      const product = products[index];
      const qtyInput = e.target.closest("tr").querySelector(".qty-input");
      const qty = parseInt(qtyInput.value);

      if (qty > 0 && qty <= product.stock) {
        const existing = cart.find(item => item.name === product.name && item.variant === product.variant);
        if (existing) {
          existing.qty += qty;
        } else {
          cart.push({ ...product, qty });
        }
        product.stock -= qty;
        localStorage.setItem("inventory", JSON.stringify(products));
        renderProducts();
        renderCart();
      } else {
        alert("Invalid quantity.");
      }
    }
  });

  function renderCart() {
    cartTable.innerHTML = "";
    let grandTotal = 0;
    cart.forEach((item, index) => {
      const total = item.qty * item.price;
      grandTotal += total;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.variant}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
        <td>${total}</td>
        <td><button data-index="${index}">Remove</button></td>
      `;
      cartTable.appendChild(row);
    });
    grandTotalEl.textContent = grandTotal;
  }

  cartTable.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const index = e.target.getAttribute("data-index");
      const item = cart[index];
      const product = products.find(p => p.name === item.name && p.variant === item.variant);
      product.stock += item.qty;
      cart.splice(index, 1);
      localStorage.setItem("inventory", JSON.stringify(products));
      renderProducts();
      renderCart();
    }
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const grandTotal = parseInt(grandTotalEl.textContent);
    const payment = parseInt(paymentInput.value);

    if (isNaN(payment) || payment <= 0) {
      paymentResult.textContent = "Enter a valid payment amount.";
      return;
    }

    if (payment >= grandTotal) {
      const change = payment - grandTotal;
      paymentResult.textContent = `Payment successful! Change: ₦${change}`;
    } else {
      const debt = grandTotal - payment;
      paymentResult.textContent = `Payment incomplete. Debt left: ₦${debt}`;
    }

    generateReceipt(grandTotal, payment);
  });

  function generateReceipt(grandTotal, payment) {
    let receipt = "=== BizPro Manager Receipt ===\n";
    receipt += new Date().toLocaleString() + "\n\n";

   
    receipt += `Admin: ${adminInfo.name}\n`;
    receipt += `Address: ${adminInfo.address}\n`;
    receipt += `Phone: ${adminInfo.phone}\n\n`;

    if (currentUser) {
      receipt += `Customer: ${currentUser.name}\n`;
      receipt += `Email: ${currentUser.email}\n`;
      if (currentUser.phone) {
        receipt += `Phone: ${currentUser.phone}\n`;
      }
      receipt += "\n";
    }

    cart.forEach(item => {
      receipt += `${item.name} (${item.variant}) x${item.qty} - ₦${item.qty * item.price}\n`;
    });

   
    receipt += `\nGrand Total: ₦${grandTotal}\n`;
    receipt += `Payment: ₦${payment}\n`;
    if (payment >= grandTotal) {
      receipt += `Change: ₦${payment - grandTotal}\n`;
    } else {
      receipt += `Debt: ₦${grandTotal - payment}\n`;
    }

    receipt += "\nThank you for shopping!\n=============================";

    receiptOutput.textContent = receipt;
  }
});
