const API = '/jokebook';

const el = (sel) => document.querySelector(sel);
const randomBox = el('#random-joke');
const btnRefresh = el('#btn-refresh');
const btnLoadCats = el('#btn-load-cats');
const catList = el('#category-list');
const jokeGrid = el('#joke-list');
const catTitle = el('#cat-title');
const searchInput = el('#search-input');
const limitInput = el('#limit-input');
const btnSearch = el('#btn-search');
const addForm = el('#add-form');
const formStatus = el('#form-status');

function renderJokeCard({ setup, delivery, category }) {
  const div = document.createElement('div');
  div.className = 'card';
  const cat = category ? `<p class="muted">Category: <b>${category}</b></p>` : '';
  div.innerHTML = `<p><b>${setup}</b></p><p>${delivery}</p>${cat}`;
  return div;
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    throw new Error(problem.error || res.statusText);
  }
  return res.json();
}

async function loadRandom() {
  try {
    const data = await fetchJSON(`${API}/random`);
    randomBox.replaceChildren(renderJokeCard(data));
  } catch (e) {
    randomBox.textContent = `Error: ${e.message}`;
  }
}

async function loadCategories() {
  try {
    const data = await fetchJSON(`${API}/categories`);
    catList.replaceChildren();
    data.categories.forEach((name) => {
      const li = document.createElement('li');
      li.textContent = name;
      li.addEventListener('click', () => loadCategory(name));
      catList.appendChild(li);
    });
  } catch (e) {
    alert(e.message);
  }
}

async function loadCategory(category) {
  const limit = limitInput.value ? `?limit=${encodeURIComponent(limitInput.value)}` : '';
  try {
    const data = await fetchJSON(`${API}/category/${encodeURIComponent(category)}${limit}`);
    catTitle.textContent = `Jokes — ${category} (${data.count})`;
    jokeGrid.replaceChildren();
    data.jokes.forEach(j => jokeGrid.appendChild(renderJokeCard({ ...j, category })));
  } catch (e) {
    jokeGrid.replaceChildren();
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = e.message;
    jokeGrid.appendChild(div);
  }
}

btnRefresh.addEventListener('click', loadRandom);
btnLoadCats.addEventListener('click', loadCategories);
btnSearch.addEventListener('click', () => {
  const c = searchInput.value.trim();
  if (c) loadCategory(c);
});

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  const fd = new FormData(addForm);
  const body = Object.fromEntries(fd.entries());
  try {
    const data = await fetchJSON(`${API}/joke/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    formStatus.textContent = `Added! Showing updated '${data.category}' (${data.count}).`;
    loadCategory(data.category);
    addForm.reset();
  } catch (e) {
    formStatus.textContent = e.message;
  }
});

// Initial load
loadRandom();