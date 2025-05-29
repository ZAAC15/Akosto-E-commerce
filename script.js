document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://fakestoreapi.com";
  const productsContainer = document.getElementById("products");
  const categoryFilter = document.getElementById("category-filter");
  const modal = document.getElementById("product-modal");
  const modalDetails = document.getElementById("modal-details");
  const closeModal = document.querySelector(".close-btn");
  const cartModal = document.getElementById("cart-modal");
  const closeCart = document.querySelector(".close-cart");
  const cartIcon = document.getElementById("cart-icon");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const clearCartBtn = document.getElementById("clear-cart");


  // Mostrar cantidad de productos en el carrito en cualquier página
const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
const contadorHeader = document.getElementById("cart-count");
if (contadorHeader) {
  const cantidadTotal = carritoGuardado.reduce((total, p) => total + p.qty, 0);
  contadorHeader.textContent = cantidadTotal;
}
  // Recuperar carrito guardado
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];

  if (productsContainer && categoryFilter) {
    async function fetchProducts(category = "all") {
      let url = category === "all" ? `${API_URL}/products` : `${API_URL}/products/category/${category}`;
      const res = await fetch(url);
      const data = await res.json();
      displayProducts(data);
    }

    function displayProducts(products) {
      productsContainer.innerHTML = "";
      products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p>$${product.price}</p>
          <button onclick="showDetails(${product.id})">Ver detalles</button>
          <button onclick="addToCart(${product.id})">Añadir al carrito</button>
        `;
        productsContainer.appendChild(card);
      });
    }

    window.showDetails = async function (id) {
      const res = await fetch(`${API_URL}/products/${id}`);
      const product = await res.json();
      modalDetails.innerHTML = `
        <h2>${product.title}</h2>
        <img src="${product.image}" style="max-width: 100%; height: 200px; object-fit: contain;">
        <p>${product.description}</p>
        <p><strong>Precio:</strong> $${product.price}</p>
        <p><strong>Stock:</strong> ${Math.floor(Math.random() * 10) + 1}</p>
        <button onclick="addToCart(${product.id})">Añadir al carrito</button>
      `;
      modal.classList.remove("hidden");
    };

    window.addToCart = function (id) {
      const exists = cart.find(p => p.id === id);
      if (exists) {
        exists.qty++;
      } else {
        cart.push({ id, qty: 1 });
      }
      updateCartDisplay();
    };

    async function updateCartDisplay() {
      cartItems.innerHTML = "";
      let total = 0;
      for (const item of cart) {
        const res = await fetch(`${API_URL}/products/${item.id}`);
        const product = await res.json();
        total += product.price * item.qty;
        const li = document.createElement("li");
        li.classList.add("cart-item");
        li.innerHTML = `
          <span>${product.title} x${item.qty}</span>
          <span>$${(product.price * item.qty).toFixed(2)}</span>
          <button class="remove-item">Eliminar</button>
        `;
        li.querySelector(".remove-item").onclick = () => {
          cart = cart.filter(p => p.id !== item.id);
          updateCartDisplay();
        };
        cartItems.appendChild(li);
      }
      cartTotal.textContent = total.toFixed(2);
      cartCount.textContent = cart.reduce((sum, p) => sum + p.qty, 0);
      // Guardar carrito actualizado
      localStorage.setItem("carrito", JSON.stringify(cart));
    }

    async function loadCategories() {
      const res = await fetch(`${API_URL}/products/categories`);
      const categories = await res.json();
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(option);
      });
    }

    categoryFilter.onchange = () => {
      fetchProducts(categoryFilter.value);
    };

    cartIcon.onclick = () => {
      cartModal.classList.remove("hidden");
    };

    closeModal.onclick = () => {
      modal.classList.add("hidden");
    };

    closeCart.onclick = () => {
      cartModal.classList.add("hidden");
    };

    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        if (cart.length > 0) {
          window.location.href = "pasarela.html";
        } else {
          alert("Tu carrito está vacío.");
        }
      };
    }

    if (clearCartBtn) {
      clearCartBtn.onclick = () => {
        cart = [];
        updateCartDisplay();
      };
    }

    fetchProducts();
    loadCategories();
    updateCartDisplay(); // Muestra el carrito al cargar
  }

  // PASARELA
  const paymentForm = document.getElementById("payment-form");
  const successMessage = document.getElementById("success-msg");

  if (paymentForm && successMessage) {
    paymentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      successMessage.style.display = "block";
      setTimeout(() => {
        localStorage.removeItem("carrito");
        window.location.href = "index.html";
      }, 3000);
    });
  }
});
// Mostrar carrito en pasarela
const summaryList = document.getElementById("summary-items");
const summaryTotal = document.getElementById("summary-total");

if (summaryList && summaryTotal) {
  const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carritoGuardado.length === 0) {
    summaryList.innerHTML = "<li>No hay productos en el carrito.</li>";
    summaryTotal.textContent = "0.00";
  } else {
    let total = 0;
    Promise.all(
      carritoGuardado.map(async item => {
        const res = await fetch(`https://fakestoreapi.com/products/${item.id}`);
        const product = await res.json();
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${product.title} x${item.qty}</span>
          <span>$${(product.price * item.qty).toFixed(2)}</span>
        `;
        summaryList.appendChild(li);
        total += product.price * item.qty;
      })
    ).then(() => {
      summaryTotal.textContent = total.toFixed(2);
    });
  }
}

