const API = "http://localhost:8080";
const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");

const state = {
  route: "home",
  goods: [],
  user: JSON.parse(localStorage.getItem("gh_user") || "null"),
  cart: JSON.parse(localStorage.getItem("gh_cart") || "{}"),
  filters: { min: "", max: "", categories: [], colors: [] },
  sort: "new-desc",
  page: 1,
  cartTab: "cart",
  orderDone: false,
};

const money = (value) => `${Number(value).toLocaleString("ru-RU")} ₽`;
const cartTotalCount = () => Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
const cartItems = () => Object.entries(state.cart)
  .map(([id, qty]) => ({ product: state.goods.find((item) => item.id === Number(id)), qty }))
  .filter((item) => item.product);

function saveCart() {
  localStorage.setItem("gh_cart", JSON.stringify(state.cart));
  updateHeader();
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

async function init() {
  bindChrome();
  await loadGoods();
  route(location.hash.replace("#/", "") || "home", true);
}

async function loadGoods() {
  try {
    state.goods = await api("/goods");
  } catch {
    app.innerHTML = `<section class="section"><div class="container panel empty-state">Запустите бекенд на http://localhost:8080</div></section>`;
  }
}

function bindChrome() {
  document.body.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      const next = routeButton.dataset.route;
      if (next === "login" && state.user) return logout();
      route(next);
    }
  });

  window.addEventListener("hashchange", () => route(location.hash.replace("#/", "") || "home", true));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function requireAuth(next) {
  if (!state.user && ["catalog", "cart"].includes(next)) {
    route("login");
    return false;
  }
  return true;
}

function route(next, fromHash = false) {
  if (!requireAuth(next)) return;
  state.route = next;
  if (!fromHash) location.hash = `/${next}`;
  updateHeader();
  closeModal();
  if (next === "home") renderHome();
  if (next === "login") renderLogin();
  if (next === "catalog") renderCatalog();
  if (next === "cart") renderCart();
}

function updateHeader() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === state.route);
  });
  document.querySelector(".auth-text").textContent = state.user ? "Выйти" : "Войти";
  document.querySelector(".cart-link").classList.toggle("hidden", !state.user);
  const count = cartTotalCount();
  const badge = document.querySelector(".cart-count");
  badge.textContent = count;
  badge.classList.toggle("hidden", !count);
}

async function logout() {
  await api("/logout", { method: "POST", body: "{}" }).catch(() => null);
  state.user = null;
  localStorage.removeItem("gh_user");
  route("home");
}

function productCard(product) {
  const qty = state.cart[product.id] || 0;
  return `
    <article class="product-card">
      <div class="labels">${product.isNew ? `<span class="label">Новинка</span>` : ""}${product.isHit ? `<span class="label hit">Хит</span>` : ""}</div>
      <button class="image-button" data-product="${product.id}" aria-label="${product.name}">
        <img src="${product.image}" alt="${product.name}" />
      </button>
      <div class="card-bottom">
        <h3 class="product-title">${product.name}</h3>
        <div class="rating">${"★".repeat(Math.round(product.rating))}<span> ${product.rating}</span></div>
        <div class="price">${money(product.price)}</div>
        ${qty ? qtyControl(product.id, qty) : `<button class="btn" data-add="${product.id}">В корзину</button>`}
      </div>
    </article>
  `;
}

function qtyControl(id, qty) {
  return `
    <div class="qty">
      <button data-dec="${id}" aria-label="Уменьшить">−</button>
      <span>${qty}</span>
      <button data-inc="${id}" aria-label="Увеличить">+</button>
    </div>
  `;
}

function renderHome() {
  const hits = state.goods.filter((item) => item.isHit);
  const newest = state.goods.filter((item) => item.isNew);
  app.innerHTML = `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <h1>Gadget Hub</h1>
          <p>Магазин практичных гаджетов для работы, дома, поездок и умного ежедневного ритма.</p>
          <button class="btn secondary" data-route="catalog">Перейти в каталог</button>
        </div>
        <div class="hero-collage">
          ${state.goods.slice(5, 9).map((item) => `<img src="${item.image}" alt="${item.name}" />`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${carousel("Хиты продаж", "hit", hits)}
        ${carousel("Новинки", "new", newest)}
        <div class="advantages">
          ${["Доставка в день заказа", "Оригинальные товары", "Гарантия на каждый гаджет", "Помощь с выбором"].map((text) => `
            <div class="advantage"><strong>${text}</strong><span>Быстро, понятно и без лишних шагов.</span></div>
          `).join("")}
        </div>
        <div class="contact-band">
          <h2>Контакты</h2>
          <p>Санкт-Петербург, Политехническая ул., 29. Работаем ежедневно с 10:00 до 21:00.</p>
        </div>
      </div>
    </section>
  `;
  bindProductActions();
  bindCarousels({ hit: hits, new: newest });
}

function carousel(title, key, items) {
  const visible = items.slice(0, 4);
  return `
    <div class="carousel" data-carousel="${key}" data-offset="0">
      <div class="carousel-head">
        <h2 class="page-title">${title}</h2>
        <div>
          <button class="icon-btn" data-prev="${key}" aria-label="Назад">‹</button>
          <button class="icon-btn" data-next="${key}" aria-label="Вперед">›</button>
        </div>
      </div>
      <div class="carousel-track">${visible.map(productCard).join("")}</div>
    </div>
  `;
}

function bindCarousels(source) {
  app.querySelectorAll("[data-prev],[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.prev || button.dataset.next;
      const root = app.querySelector(`[data-carousel="${key}"]`);
      const list = source[key];
      const direction = button.dataset.next ? 1 : -1;
      const offset = (Number(root.dataset.offset) + direction + list.length) % list.length;
      root.dataset.offset = offset;
      const visible = [...list, ...list].slice(offset, offset + 4);
      root.querySelector(".carousel-track").innerHTML = visible.map(productCard).join("");
      bindProductActions(root);
    });
  });
}

function renderLogin() {
  app.innerHTML = `
    <section class="section login-wrap">
      <div class="panel login-card">
        <h1 class="page-title">Вход</h1>
        <form id="login-form" novalidate>
          ${field("username", "Имя пользователя")}
          ${field("password", "Пароль", "password")}
          <button class="btn" type="submit">Войти</button>
        </form>
        <p class="muted">Тестовый пользователь: admin / admin</p>
      </div>
    </section>
  `;
  document.querySelector("#login-form").addEventListener("submit", submitLogin);
}

function field(name, label, type = "text") {
  return `<label data-field="${name}">${label}<input name="${name}" type="${type}" /><span class="error-text"></span></label>`;
}

async function submitLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateRequired(form, ["username", "password"])) return;
  try {
    state.user = await api("/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    localStorage.setItem("gh_user", JSON.stringify(state.user));
    route("home");
  } catch (error) {
    alert(error.message || "Не удалось войти");
  }
}

function validateRequired(form, names) {
  let ok = true;
  names.forEach((name) => {
    const input = form.elements[name];
    const holder = form.querySelector(`[data-field="${name}"]`);
    const invalid = !String(input.value).trim();
    holder.classList.toggle("field-error", invalid);
    holder.querySelector(".error-text").textContent = invalid ? "Заполните обязательное поле" : "";
    if (invalid) ok = false;
  });
  return ok;
}

function renderCatalog() {
  const categories = unique("category");
  const colors = unique("color");
  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="catalog-head">
          <h1 class="page-title">Каталог товаров</h1>
        </div>
        <div class="catalog-layout">
          <div>
            <div class="panel toolbar">
              <div class="toolbar-row">
                <label>Сортировка
                  <select id="sort">
                    <option value="new-desc">Сначала новинки</option>
                    <option value="price-asc">Цена по возрастанию</option>
                    <option value="price-desc">Цена по убыванию</option>
                    <option value="popular-desc">Популярные</option>
                  </select>
                </label>
              </div>
            </div>
            <div id="products" class="products-grid"></div>
            <div id="pagination" class="pagination"></div>
          </div>
          <aside class="panel filters">
            <h3>Фильтры</h3>
            <div class="filter-group">
              <strong>Цена</strong>
              <div class="price-grid">
                <label>От<input id="min-price" type="number" min="0" /></label>
                <label>До<input id="max-price" type="number" min="0" /></label>
              </div>
            </div>
            ${checkGroup("Тип", "category", categories)}
            ${checkGroup("Цвет", "color", colors)}
            <div class="form-actions">
              <button class="btn" id="apply-filters">Показать</button>
              <button class="btn ghost" id="reset-filters">Сбросить</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `;
  document.querySelector("#sort").value = state.sort;
  document.querySelector("#sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.page = 1;
    renderProducts();
  });
  document.querySelector("#apply-filters").addEventListener("click", applyFilters);
  document.querySelector("#reset-filters").addEventListener("click", resetFilters);
  renderProducts();
}

function unique(key) {
  return [...new Set(state.goods.map((item) => item[key]))].sort();
}

function checkGroup(title, key, values) {
  return `
    <div class="filter-group" data-check-group="${key}">
      <strong>${title}</strong>
      ${values.map((value) => `
        <label class="check"><input type="checkbox" value="${value}" />${value}</label>
      `).join("")}
    </div>
  `;
}

function applyFilters() {
  state.filters.min = document.querySelector("#min-price").value;
  state.filters.max = document.querySelector("#max-price").value;
  state.filters.categories = checked("category");
  state.filters.colors = checked("color");
  state.page = 1;
  renderProducts();
}

function resetFilters() {
  state.filters = { min: "", max: "", categories: [], colors: [] };
  state.page = 1;
  document.querySelectorAll(".filters input").forEach((input) => {
    if (input.type === "checkbox") input.checked = false;
    else input.value = "";
  });
  renderProducts();
}

function checked(key) {
  return [...document.querySelectorAll(`[data-check-group="${key}"] input:checked`)].map((input) => input.value);
}

function filteredGoods() {
  let list = [...state.goods];
  const { min, max, categories, colors } = state.filters;
  if (min) list = list.filter((item) => item.price >= Number(min));
  if (max) list = list.filter((item) => item.price <= Number(max));
  if (categories.length) list = list.filter((item) => categories.includes(item.category));
  if (colors.length) list = list.filter((item) => colors.includes(item.color));
  const [key, direction] = state.sort.split("-");
  list.sort((a, b) => {
    const left = key === "popular" ? a.popularity : key === "new" ? Number(a.isNew) * 1000 + a.id : a[key];
    const right = key === "popular" ? b.popularity : key === "new" ? Number(b.isNew) * 1000 + b.id : b[key];
    return direction === "desc" ? right - left : left - right;
  });
  return list;
}

function renderProducts() {
  const list = filteredGoods();
  const pageSize = 9;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  state.page = Math.min(state.page, pages);
  const visible = list.slice((state.page - 1) * pageSize, state.page * pageSize);
  document.querySelector("#products").innerHTML = visible.length
    ? visible.map(productCard).join("")
    : `<div class="panel empty-state" style="grid-column: 1 / -1;">Товары по вашему запросу не найдены</div>`;
  renderPagination(pages);
  bindProductActions();
}

function renderPagination(pages) {
  const holder = document.querySelector("#pagination");
  if (pages <= 1) {
    holder.innerHTML = "";
    return;
  }
  const nums = pages > 3 ? [1, 2, 3, "...", pages] : Array.from({ length: pages }, (_, i) => i + 1);
  holder.innerHTML = nums.map((num) => num === "..."
    ? `<span>...</span>`
    : `<button class="${num === state.page ? "active" : ""}" data-page="${num}">${num}</button>`).join("");
  holder.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = Number(button.dataset.page);
      renderProducts();
    });
  });
}

function bindProductActions(root = app) {
  root.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => openProduct(Number(button.dataset.product)));
  });
  root.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => changeQty(Number(button.dataset.add), 1));
  });
  root.querySelectorAll("[data-inc]").forEach((button) => {
    button.addEventListener("click", () => changeQty(Number(button.dataset.inc), 1));
  });
  root.querySelectorAll("[data-dec]").forEach((button) => {
    button.addEventListener("click", () => changeQty(Number(button.dataset.dec), -1));
  });
}

function changeQty(id, diff) {
  const next = (state.cart[id] || 0) + diff;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  saveCart();
  if (state.route === "catalog") renderProducts();
  if (state.route === "home") renderHome();
  if (state.route === "cart") renderCart();
  const product = state.goods.find((item) => item.id === id);
  if (modalRoot.innerHTML && product) openProduct(id);
}

function openProduct(id) {
  const product = state.goods.find((item) => item.id === id);
  const qty = state.cart[id] || 0;
  openModal(`
    <div class="modal-head">
      <h2>${product.name}</h2>
      <button class="modal-close" data-close>&times;</button>
    </div>
    <div class="product-modal">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <div class="labels" style="position: static; margin-bottom: 12px;">${product.isNew ? `<span class="label">Новинка</span>` : ""}${product.isHit ? `<span class="label hit">Хит</span>` : ""}</div>
        <p>${product.description}</p>
        <ul>${product.specs.map((spec) => `<li>${spec}</li>`).join("")}</ul>
        <p class="rating">${"★".repeat(Math.round(product.rating))} ${product.rating}</p>
        <p class="price">${money(product.price)}</p>
        ${qty ? `<p>В корзине: ${qty}</p>${qtyControl(product.id, qty)}` : `<button class="btn" data-add="${product.id}">В корзину</button>`}
      </div>
    </div>
  `);
  bindProductActions(modalRoot);
}

function openModal(html) {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
  modalRoot.querySelector("[data-close]")?.addEventListener("click", closeModal);
  modalRoot.querySelector(".modal-backdrop").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) closeModal();
  });
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function renderCart() {
  app.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 class="page-title">Оформление заказа</h1>
        <div class="tabs">
          <button class="tab ${state.cartTab === "cart" ? "active" : ""}" data-tab="cart">Корзина</button>
          <button class="tab ${state.cartTab === "orders" ? "active" : ""}" data-tab="orders">История заказов</button>
        </div>
        <div id="cart-content"></div>
      </div>
    </section>
  `;
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.cartTab = button.dataset.tab;
      renderCart();
    });
  });
  state.cartTab === "cart" ? renderCartTab() : renderOrdersTab();
}

function renderCartTab() {
  const items = cartItems();
  const content = document.querySelector("#cart-content");
  if (state.orderDone) {
    content.innerHTML = `<div class="panel success-state"><h2>Спасибо, ваш заказ успешно оформлен</h2></div>`;
    return;
  }
  if (!items.length) {
    content.innerHTML = `<div class="panel empty-state">Ознакомьтесь с новинками и хитами на главной или найдите нужное в каталоге<br /><br /><button class="btn" data-route="catalog">В каталог</button></div>`;
    return;
  }
  content.innerHTML = `
    <div class="cart-layout">
      <div>
        <div class="form-actions" style="margin-bottom: 14px;">
          <label class="check"><input id="select-all" type="checkbox" />Выбрать все</label>
          <button class="btn danger" id="delete-selected">Удалить отмеченные</button>
        </div>
        <div class="cart-list">
          ${items.map(({ product, qty }) => cartRow(product, qty)).join("")}
        </div>
      </div>
      ${orderForm(items)}
    </div>
  `;
  bindCartActions();
}

function cartRow(product, qty) {
  return `
    <article class="cart-item">
      <input class="cart-check" type="checkbox" value="${product.id}" />
      <img src="${product.image}" alt="${product.name}" />
      <div><h3>${product.name}</h3><p>${money(product.price * qty)}</p></div>
      ${qtyControl(product.id, qty)}
      <button class="icon-btn" data-delete="${product.id}" aria-label="Удалить">×</button>
    </article>
  `;
}

function orderForm(items) {
  const total = items.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  return `
    <form id="order-form" class="panel order-form" novalidate>
      <h2>Оформление заказа</h2>
      <p class="price">Итого: ${money(total)}</p>
      <label data-field="email">Почта<input name="email" type="email" /></label>
      <label data-field="phone">Номер телефона<input name="phone" type="tel" /><span class="error-text"></span></label>
      <div class="filter-group">
        <strong>Получение</strong>
        <label class="check"><input name="deliveryType" type="radio" value="pickup" checked />Самовывоз</label>
        <label class="check"><input name="deliveryType" type="radio" value="delivery" />Доставка</label>
      </div>
      <label data-field="address" class="hidden" id="address-field">Адрес<input name="address" /><span class="error-text"></span></label>
      <label>Оплата
        <select name="payment">
          <option>По карте</option>
          <option>Наличными</option>
        </select>
      </label>
      <label class="check"><input name="package" type="checkbox" />Нужна упаковка</label>
      <button class="btn" type="submit">Оформить заказ</button>
    </form>
  `;
}

function bindCartActions() {
  bindProductActions(app);
  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => confirmDelete([Number(button.dataset.delete)]));
  });
  document.querySelector("#delete-selected").addEventListener("click", () => {
    const ids = [...document.querySelectorAll(".cart-check:checked")].map((input) => Number(input.value));
    if (ids.length) confirmDelete(ids);
  });
  document.querySelector("#select-all").addEventListener("change", (event) => {
    document.querySelectorAll(".cart-check").forEach((input) => {
      input.checked = event.target.checked;
    });
  });
  document.querySelectorAll("[name='deliveryType']").forEach((input) => {
    input.addEventListener("change", toggleAddress);
  });
  document.querySelector("#order-form").addEventListener("submit", submitOrder);
}

function toggleAddress() {
  const delivery = document.querySelector("[name='deliveryType']:checked").value === "delivery";
  document.querySelector("#address-field").classList.toggle("hidden", !delivery);
}

function confirmDelete(ids) {
  openModal(`
    <div class="modal-head">
      <h2>Удаление товара</h2>
      <button class="modal-close" data-close>&times;</button>
    </div>
    <p>Вы уверены, что хотите удалить?</p>
    <div class="modal-actions">
      <button class="btn danger" id="confirm-delete">Удалить</button>
      <button class="btn ghost" data-close>Отмена</button>
    </div>
  `);
  modalRoot.querySelector("#confirm-delete").addEventListener("click", () => {
    ids.forEach((id) => delete state.cart[id]);
    saveCart();
    closeModal();
    renderCart();
  });
  modalRoot.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
}

async function submitOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const required = ["phone"];
  if (form.elements.deliveryType.value === "delivery") required.push("address");
  if (!validateRequired(form, required)) return;
  const items = cartItems().map(({ product, qty }) => ({ id: product.id, name: product.name, price: product.price, qty }));
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  await api("/orders", {
    method: "POST",
    body: JSON.stringify({ customer: Object.fromEntries(new FormData(form)), items, total }),
  });
  state.cart = {};
  state.orderDone = true;
  saveCart();
  renderCart();
}

async function renderOrdersTab() {
  const orders = await api("/orders").catch(() => []);
  document.querySelector("#cart-content").innerHTML = orders.length
    ? `<div class="cart-list">${orders.map((order) => `
      <div class="order-row">
        <strong>№ ${order.id}</strong>
        <span>${order.date}</span>
        <span>${order.items.reduce((sum, item) => sum + item.qty, 0)} товаров</span>
        <strong>${money(order.total)}</strong>
      </div>
    `).join("")}</div>`
    : `<div class="panel empty-state">История заказов пока пуста</div>`;
}

init();
