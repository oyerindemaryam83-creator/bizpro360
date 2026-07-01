document.addEventListener("DOMContentLoaded", () => {
  const productTable = document.getElementById("productTable");
  const alerts = document.getElementById("alerts");
  const historyLog = document.getElementById("historyLog");

  const modal = document.getElementById("historyModal");
  const closeBtn = modal.querySelector(".close");
  const modalTitle = document.getElementById("modalTitle");
  const productHistoryList = document.getElementById("productHistoryList");

  let products = JSON.parse(localStorage.getItem("inventory")) || [];

  // Render products
  function renderProducts() {
    productTable.innerHTML = "";
    products.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.variant}</td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.price * p.stock}</td>
        <td>
          <input type="number" min="1" placeholder="Qty" class="qty-input">
          <button class="btn add" data-index="${index}">Add</button>
          <button class="btn danger sell" data-index="${index}">Sell</button>
          <button class="btn remove" data-index="${index}">Remove</button>
          <button class="btn view-history" data-index="${index}">View History</button>
        </td>
      `;
      productTable.appendChild(row);
    });
    checkAlerts();
  }

  renderProducts();

  // Add new product
  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value;
    const variant = document.getElementById("variant").value;
    const price = parseInt(document.getElementById("price").value);
    const stock = parseInt(document.getElementById("stock").value);

    const newProduct = { name, variant, price, stock, history: [] };
    products.push(newProduct);
    logHistory(newProduct, `Product added with stock ${stock}`);
    localStorage.setItem("inventory", JSON.stringify(products));
    renderProducts();
    e.target.reset();
  });

  // Handle actions
  productTable.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const index = e.target.getAttribute("data-index");
      const product = products[index];
      const row = e.target.closest("tr");
      const qtyInput = row.querySelector(".qty-input");
      let qty = parseInt(qtyInput.value) || 1;

      if (e.target.classList.contains("add")) {
        product.stock += qty;
        logHistory(product, `${qty} stock added`);
      } else if (e.target.classList.contains("sell")) {
        if (product.stock >= qty) {
          product.stock -= qty;
          logHistory(product, `${qty} stock sold`);
        } else {
          alert(`Not enough stock to sell ${qty} units of ${product.name}.`);
        }
      } else if (e.target.classList.contains("remove")) {
        logHistory(product, "Product removed");
        products.splice(index, 1);
      } else if (e.target.classList.contains("view-history")) {
        showProductHistory(product);
      }

      localStorage.setItem("inventory", JSON.stringify(products));
      renderProducts();
      qtyInput.value = "";
    }
  });

  // Log history globally and per product
  function logHistory(product, action) {
    const entry = `${new Date().toLocaleString()} - ${action} for ${product.name} (${product.variant})`;
    product.history = product.history || [];
    product.history.push(entry);

    const li = document.createElement("li");
    li.textContent = entry;
    historyLog.prepend(li);

    localStorage.setItem("inventory", JSON.stringify(products));
  }

  // Show product-specific history
  function showProductHistory(product) {
    modal.style.display = "block";
    modalTitle.textContent = `${product.name} (${product.variant}) History`;
    productHistoryList.innerHTML = "";

    (product.history || []).forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      productHistoryList.appendChild(li);
    });
  }

  // Alerts
  function checkAlerts() {
    alerts.innerHTML = "";
    products.forEach(p => {
      if (p.stock < 5) {
        alerts.innerHTML += `<p style="color:red; font-weight:bold;">⚠️ Low stock: ${p.name} (${p.variant}) has only ${p.stock} left!</p>`;
      }
    });
  }

  // Modal close
  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
});
