document.addEventListener("DOMContentLoaded", async () => {
  const productTable = document.getElementById("productTable");
  const alerts = document.getElementById("alerts");
  const historyLog = document.getElementById("historyLog");

  const modal = document.getElementById("historyModal");
  const closeBtn = modal.querySelector(".close");
  const modalTitle = document.getElementById("modalTitle");
  const productHistoryList = document.getElementById("productHistoryList");

  let products = [];
  let productHistory = [];

  const logoutLink = document.querySelector('a[href="index.html"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (event) => {
      event.preventDefault();
      await signOut();
    });
  }

  async function loadProducts() {
    const { data, error } = await window.supabaseClient.from('products').select('*').order('created_at', { ascending: false });
    if (!error) {
      products = data || [];
    }
    renderProducts();
  }

  async function loadHistory() {
    const { data, error } = await window.supabaseClient.from('inventory_history').select('*').order('created_at', { ascending: false });
    if (!error) {
      productHistory = data || [];
      renderHistory();
    }
  }

  function renderHistory() {
    historyLog.innerHTML = "";
    productHistory.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.created_at} - ${entry.action}`;
      historyLog.appendChild(li);
    });
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
        <td>${Number(p.price) * Number(p.stock)}</td>
        <td>
          <input type="number" min="1" placeholder="Qty" class="qty-input">
          <button class="btn add" data-id="${p.id}">Add</button>
          <button class="btn danger sell" data-id="${p.id}">Sell</button>
          <button class="btn remove" data-id="${p.id}">Remove</button>
          <button class="btn view-history" data-id="${p.id}">View History</button>
        </td>
      `;
      productTable.appendChild(row);
    });
    checkAlerts();
  }

  const profile = await requireRole('admin');
  if (!profile) return;

  await loadProducts();
  await loadHistory();

  document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value.trim();
    const variant = document.getElementById("variant").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const stock = parseInt(document.getElementById("stock").value, 10);

    const { data, error } = await window.supabaseClient.from('products').insert([{ name, variant, price, stock }]).select();
    if (!error && data && data[0]) {
      await window.supabaseClient.from('inventory_history').insert([{ product_id: data[0].id, action: `Product added with stock ${stock}`, quantity: stock }]);
      await loadProducts();
      await loadHistory();
      e.target.reset();
    }
  });

  productTable.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const id = e.target.getAttribute("data-id");
      const product = products.find(p => p.id === id);
      const row = e.target.closest("tr");
      const qtyInput = row.querySelector(".qty-input");
      let qty = parseInt(qtyInput.value, 10) || 1;

      if (e.target.classList.contains("add")) {
        const newStock = Number(product.stock) + qty;
        await window.supabaseClient.from('products').update({ stock: newStock }).eq('id', id);
        await window.supabaseClient.from('inventory_history').insert([{ product_id: id, action: `${qty} stock added`, quantity: qty }]);
      } else if (e.target.classList.contains("sell")) {
        if (Number(product.stock) >= qty) {
          const newStock = Number(product.stock) - qty;
          await window.supabaseClient.from('products').update({ stock: newStock }).eq('id', id);
          await window.supabaseClient.from('inventory_history').insert([{ product_id: id, action: `${qty} stock sold`, quantity: qty }]);
        } else {
          alert(`Not enough stock to sell ${qty} units of ${product.name}.`);
        }
      } else if (e.target.classList.contains("remove")) {
        await window.supabaseClient.from('inventory_history').insert([{ product_id: id, action: 'Product removed', quantity: 0 }]);
        await window.supabaseClient.from('products').delete().eq('id', id);
      } else if (e.target.classList.contains("view-history")) {
        showProductHistory(id);
      }

      await loadProducts();
      await loadHistory();
      if (qtyInput) qtyInput.value = "";
    }
  });

  async function showProductHistory(id) {
    modal.style.display = "block";
    const { data } = await window.supabaseClient.from('inventory_history').select('*').eq('product_id', id).order('created_at', { ascending: false });
    const product = products.find(p => p.id === id);
    modalTitle.textContent = `${product?.name || 'Product'} (${product?.variant || ''}) History`;
    productHistoryList.innerHTML = "";

    (data || []).forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.created_at} - ${entry.action}`;
      productHistoryList.appendChild(li);
    });
  }

  function checkAlerts() {
    alerts.innerHTML = "";
    products.forEach(p => {
      if (Number(p.stock) < 5) {
        alerts.innerHTML += `<p style="color:red; font-weight:bold;">⚠️ Low stock: ${p.name} (${p.variant}) has only ${p.stock} left!</p>`;
      }
    });
  }

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
});
