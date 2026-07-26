document.addEventListener("DOMContentLoaded", async () => {
  const welcomeMessage = document.getElementById("welcomeMessage");
  const productTable = document.getElementById("customerProductTable");
  const cartTable = document.getElementById("cartTable");
  const grandTotalEl = document.getElementById("grandTotal");
  const paymentInput = document.getElementById("payment");
  const paymentResult = document.getElementById("paymentResult");
  const receiptOutput = document.getElementById("receiptOutput");

  const adminInfo = {
    name: "Oyerinde B Venture",
    address: "No 17 Balogun Street, Ijoko road, Sango, Ogun State.",
    phone: "+2348056139847,+2348065053524"
  };

  let currentUser = null;
  let products = [];
  let cart = [];

  const logoutLink = document.querySelector('a[href="index.html"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (event) => {
      event.preventDefault();
      await signOut();
    });
  }

  async function loadUser() {
    const profile = await requireRole('customer');
    if (!profile) return null;
    currentUser = profile;
    welcomeMessage.textContent = `Welcome, ${currentUser.full_name || currentUser.email}`;
    return currentUser;
  }

  async function loadProducts() {
    const { data, error } = await window.supabaseClient.from('products').select('*').order('created_at', { ascending: false });
    if (!error) {
      products = data || [];
      renderProducts();
    }
  }

  function renderProducts() {
    productTable.innerHTML = "";
    products.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.variant}</td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td><input type="number" min="1" max="${p.stock}" value="1" class="qty-input"></td>
        <td><button data-id="${p.id}">Add to Cart</button></td>
      `;
      productTable.appendChild(row);
    });
  }

  const profile = await loadUser();
  if (!profile) return;

  await loadProducts();

  productTable.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const id = e.target.getAttribute("data-id");
      const product = products.find(p => p.id === id);
      const qtyInput = e.target.closest("tr").querySelector(".qty-input");
      const qty = parseInt(qtyInput.value, 10);

      if (qty > 0 && qty <= Number(product.stock)) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
          existing.qty += qty;
        } else {
          cart.push({ ...product, qty });
        }
        const newStock = Number(product.stock) - qty;
        await window.supabaseClient.from('products').update({ stock: newStock }).eq('id', id);
        await loadProducts();
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

  cartTable.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const index = e.target.getAttribute("data-index");
      const item = cart[index];
      const product = products.find(p => p.id === item.id);
      const restoredStock = Number(product.stock) + item.qty;
      await window.supabaseClient.from('products').update({ stock: restoredStock }).eq('id', item.id);
      cart.splice(index, 1);
      await loadProducts();
      renderCart();
    }
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const grandTotal = parseInt(grandTotalEl.textContent, 10);
    const payment = parseInt(paymentInput.value, 10);

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
      receipt += `Customer: ${currentUser.full_name || currentUser.email}\n`;
      receipt += `Email: ${currentUser.email}\n`;
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
