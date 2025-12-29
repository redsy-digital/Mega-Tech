// script.js

// CONFIGURAÇÃO SUPABASE - Substitua pelos seus dados reais
const SUPABASE_URL = 'https://qshrpnhdqoouxdbpayhd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaHJwbmhkcW9vdXhkYnBheWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgwODAsImV4cCI6MjA4MjA2NDA4MH0.N0OTLnlJvSqDj4jKR7NsMEsD5Ee-CJgDTr6ZR2pJLyA';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function chama() {
    const menu = document.getElementById("menu");
    if (menu.style.display == "block" ) {
        menu.style.display = "none";
    } else {
        menu.style.display= "block";
    }
}

// Variável global para o WhatsApp da loja
const WHATSAPP_NUMBER = "244924811382";
const STORE_NAME = "Mega Tech";

// --- Credenciais e Autenticação (Mantido em LocalStorage por agora) ---
const DEFAULT_USERNAME = "adminmegatech";
const DEFAULT_PASSWORD = "123";

function loadCredentials() {
    const storedUsername = localStorage.getItem('megaTechAdminUsername');
    const storedPassword = localStorage.getItem('megaTechAdminPassword');
    
    // Se não houver credenciais armazenadas, inicializa com as credenciais padrão
    if (!storedUsername || !storedPassword) {
        saveCredentials(DEFAULT_USERNAME, DEFAULT_PASSWORD);
        return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
    }
    
    // Retorna as credenciais armazenadas
    return { username: storedUsername, password: storedPassword };
}

function saveCredentials(username, password) {
    localStorage.setItem('megaTechAdminUsername', username);
    localStorage.setItem('megaTechAdminPassword', password);
}

function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('usernameLogin').value;
    const passwordInput = document.getElementById('passwordLogin').value;
    const loginMessage = document.getElementById('loginMessage');
    // Remove espaços em branco acidentais que podem ter sido adicionados
    const trimmedUsernameInput = usernameInput.trim();
    const trimmedPasswordInput = passwordInput.trim();
    
    const { username: correctUsername, password: correctPassword } = loadCredentials();

    if (trimmedUsernameInput === correctUsername && trimmedPasswordInput === correctPassword) {
        localStorage.setItem('megaTechIsLoggedIn', 'true');
        loginMessage.textContent = 'Login bem-sucedido!';
        loginMessage.style.color = 'green';
        setTimeout(initAdminPageContent, 500);
    } else {
        loginMessage.textContent = 'Nome de Utilizador ou Palavra-passe incorretos.';
        loginMessage.style.color = 'red';
    }
}

function logoutAdmin() {
    if (confirm("Tem certeza que deseja terminar a sessão?")) {
        localStorage.removeItem('megaTechIsLoggedIn');
        window.location.reload();
    }
}

// --- Funções de Ajuda ---
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) return "AOA 0";
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value);
}

// --- Lógica de Persistência SQL (Supabase) ---

async function loadProducts() {
    const { data, error } = await _supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
    return data;
}

async function loadCategories() {
    const { data, error } = await _supabase
        .from('products')
        .select('category');

    if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
    
    // Extrair categorias únicas e remover duplicados
    const categories = [...new Set(data.map(item => item.category))].sort();
    return categories;
}

function renderFilterButtons(categories, currentCategory) {
    const filtersSection = document.querySelector('.filters');
    if (!filtersSection) return;

    let buttonsHTML = '<h2>Nossos Produtos</h2>';
    
    // Botão "Todos"
    buttonsHTML += `<button class="filter-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all">Todos</button>`;

    // Botões de categorias dinâmicas
    categories.forEach(category => {
        buttonsHTML += `<button class="filter-btn ${currentCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>`;
    });

    filtersSection.innerHTML = buttonsHTML;
}

// --- Lógica do Catálogo (index.html) ---

function createProductCard(product) {
    const { id, name, price, description, category, discount, image } = product;
    const hasDiscount = discount > 0;
    const originalPrice = price;
    const currentPrice = hasDiscount ? price * (1 - discount / 100) : price;

    const specsRegex = /(RAM\/ROM:.*?)(,|$)|(Rede:.*?)(,|$)|(Versão:.*?)(,|$)/gi;
    const specsMatches = description.match(specsRegex) || [];
    const specsList = specsMatches.map(spec => spec.replace(/,$/, '').trim()).filter(s => s.length > 0);

    const whatsappMessage = encodeURIComponent(`Olá ${STORE_NAME}, vi o ${name} no vosso site e fiquei interessado. (ID: ${id})`);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return `
        <div class="product-card" data-category="${category}" data-id="${id}" onclick="window.location.href='product.html?id=${id}'" style="cursor: pointer;">
            <div class="product-image-container">
                ${hasDiscount ? `<span class="promo-badge">${discount}% OFF</span>` : ''}
                <img src="${image || 'placeholder.jpg'}" alt="${name}">
            </div>
            <div class="product-details">
                <h3>${name}</h3>
                <p>${description}</p>
                <div class="price-section">
                    <span class="current-price">${formatCurrency(currentPrice)}</span>
                    ${hasDiscount ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : ''}
                </div>
                <div class="specs">
                    ${specsList.map(spec => `<p><strong>${spec.split(':')[0]}:</strong> ${spec.split(':')[1]}</p>`).join('')}
                    ${specsList.length === 0 ? '<p>Ver descrição para especificações detalhadas.</p>' : ''}
                </div>
                <a href="${whatsappURL}" class="whatsapp-btn" target="_blank" onclick="event.stopPropagation();">
                    <i class="fab fa-whatsapp"></i> Tenho Interesse!
                </a>
            </div>
        </div>
    `;
}

async function renderCatalog(category = 'all', searchTerm = '') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    const products = await loadProducts();
    productGrid.innerHTML = ''; 
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        let filteredProducts = products;

    if (category !== 'all') {
        // O valor do botão de filtro (category) agora corresponde ao valor da categoria no DB (p.category).
        // A comparação é feita diretamente.
        filteredProducts = products.filter(p => p.category === category);
    }

    if (normalizedSearchTerm) {
        filteredProducts = filteredProducts.filter(product => {
            const productText = (product.name + product.description + product.category).toLowerCase();
            return productText.includes(normalizedSearchTerm);
        });
    }

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 50px;">Nenhum produto encontrado.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        productGrid.innerHTML += createProductCard(product);
    });
}

async function initIndexPage() {
    let currentCategory = 'all';
    
    // 1. Carregar e renderizar botões de filtro
    const categories = await loadCategories();
    renderFilterButtons(categories, currentCategory);
    
    // 2. Renderizar catálogo inicial
    await renderCatalog('all');

    // 3. Adicionar event listeners aos botões de filtro (agora dinâmicos)
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', async function() {
            // Atualizar estado ativo dos botões
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.getAttribute('data-category');
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput ? searchInput.value : ''; 
            
            await renderCatalog(currentCategory, searchTerm);
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async function() {
            await renderCatalog(currentCategory, this.value);
        });
    }
}

// --- Lógica do Painel de Admin (admin.html) ---

function resetAdminForm() {
    const form = document.getElementById('productForm');
    const imagePreview = document.getElementById('imagePreviewAdmin');
    const submitButton = document.getElementById('submitButton');
    form.reset();
    document.getElementById('productId').value = '';
    imagePreview.style.display = 'none';
    submitButton.innerHTML = '<i class="fas fa-save"></i> Adicionar Produto';
    submitButton.style.backgroundColor = 'var(--primary-color)';
}

async function editProduct(id) {
    const products = await loadProducts();
    const productToEdit = products.find(p => p.id === id);
    if (!productToEdit) return;

    document.getElementById('productId').value = productToEdit.id;
    document.getElementById('productName').value = productToEdit.name;
    document.getElementById('productPrice').value = productToEdit.price;
    document.getElementById('productDescription').value = productToEdit.description;
    document.getElementById('productCategory').value = productToEdit.category;
    document.getElementById('productDiscount').value = productToEdit.discount || 0;
    
    const isURL = productToEdit.image && productToEdit.image.startsWith('http');
    document.getElementById('imageURL').value = isURL ? productToEdit.image : '';
    const imagePreview = document.getElementById('imagePreviewAdmin');
    imagePreview.src = productToEdit.image || '';
    imagePreview.style.display = productToEdit.image ? 'block' : 'none';

    const submitButton = document.getElementById('submitButton');
    submitButton.innerHTML = '<i class="fas fa-edit"></i> Salvar Edição';
    submitButton.style.backgroundColor = '#ffc107'; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(id) {
    if (confirm("Tem certeza que deseja remover este produto?")) {
        const { error } = await _supabase.from('products').delete().eq('id', id);
        if (error) {
            alert("Erro ao remover: " + error.message);
        } else {
            alert("Produto removido!");
            await renderAdminList();
        }
    }
}

async function renderAdminList() {
    const productListAdmin = document.getElementById('productListAdmin');
    if (!productListAdmin) return;

    const products = await loadProducts();
    productListAdmin.innerHTML = ''; 

    if (products.length === 0) {
        productListAdmin.innerHTML = '<li>Nenhum produto publicado.</li>';
        return;
    }

    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="product-info-admin">
                <strong>${product.name}</strong> (${product.category}) - ${formatCurrency(product.price)}
            </div>
            <div class="product-actions-admin">
                <button onclick="editProduct('${product.id}')"><i class="fas fa-pen"></i> Editar</button>
                <button onclick="deleteProduct('${product.id}')" style="background-color: #dc3545;"><i class="fas fa-trash"></i> Remover</button>
            </div>
        `;
        productListAdmin.appendChild(listItem);
    });
}

async function handleProductSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const category = document.getElementById('productCategory').value;
    const discount = parseInt(document.getElementById('productDiscount').value) || 0;
    const imageURL = document.getElementById('imageURL').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    
    let imageUrlToUse = imageURL;

    if (imageFile) {
        imageUrlToUse = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    } else if (!imageUrlToUse && id) {
        const products = await loadProducts();
        const existingProduct = products.find(p => p.id === id);
        imageUrlToUse = existingProduct ? existingProduct.image : '';
    }

    const productData = { name, price, description, category, discount, image: imageUrlToUse };
    if (id) productData.id = id;

    const { error } = await _supabase.from('products').upsert([productData]);

    if (error) {
        alert("Erro: " + error.message);
    } else {
        alert("Sucesso!");
        resetAdminForm();
        await renderAdminList();
    }
}

function previewImage(event) {
    const imagePreview = document.getElementById('imagePreviewAdmin');
    imagePreview.style.display = 'block';
    if (event.target.id === 'imageUpload' && event.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => imagePreview.src = e.target.result;
        reader.readAsDataURL(event.target.files[0]);
    } else if (event.target.id === 'imageURL' && event.target.value) {
        imagePreview.src = event.target.value;
    }
}

function initAdminPageContent() {
    const isLoggedIn = localStorage.getItem('megaTechIsLoggedIn') === 'true';
    const loginSection = document.getElementById('login-section');
    const adminContent = document.getElementById('admin-content');

    if (isLoggedIn) {
        loginSection.style.display = 'none';
        adminContent.style.display = 'flex';
        renderAdminList();
    } else {
        loginSection.style.display = 'block';
        adminContent.style.display = 'none';
    }
}

function handleChangeCredentials(event) {
    event.preventDefault();
    const currentPasswordInput = document.getElementById('currentPassword').value;
    const newUsernameInput = document.getElementById('newUsername').value;
    const newPasswordInput = document.getElementById('newPassword').value;
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword').value;
    const changeMessage = document.getElementById('changeMessage');

    const { username: currentUsername, password: correctPassword } = loadCredentials();

    if (currentPasswordInput !== correctPassword) {
        changeMessage.textContent = 'Palavra-passe atual incorreta.';
        changeMessage.style.color = 'red';
        return;
    }

    if (newPasswordInput && newPasswordInput !== confirmNewPasswordInput) {
        changeMessage.textContent = 'A nova palavra-passe e a confirmação não coincidem.';
        changeMessage.style.color = 'red';
        return;
    }
    
    const finalUsername = newUsernameInput.trim() || currentUsername;
    const finalPassword = newPasswordInput.trim() || correctPassword;

    if (finalUsername === '' || finalPassword === '') {
        changeMessage.textContent = 'Nome de utilizador e palavra-passe não podem ficar vazios.';
        changeMessage.style.color = 'red';
        return;
    }

    saveCredentials(finalUsername, finalPassword);
    changeMessage.textContent = 'Credenciais alteradas com sucesso! Redirecionando...';
    changeMessage.style.color = 'green';
    
    // Força o logout para que o utilizador tenha que fazer login com as novas credenciais
    localStorage.removeItem('megaTechIsLoggedIn');
    
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1500);
}

function initAdminPage() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    const prodForm = document.getElementById('productForm');
    if (prodForm) {
        prodForm.addEventListener('submit', handleProductSubmit);
        document.getElementById('imageUpload').addEventListener('change', previewImage);
        document.getElementById('imageURL').addEventListener('input', previewImage);
    }
    initAdminPageContent();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCredentials(); 
    if (document.getElementById('product-grid')) {
        initIndexPage();
    } else if (document.getElementById('productListAdmin')) {
        initAdminPage();
    } else if (document.getElementById('changeCredentialsForm')) {
        // Verifica se o utilizador está logado antes de permitir a alteração de credenciais
        const isLoggedIn = localStorage.getItem('megaTechIsLoggedIn') === 'true';
        if (!isLoggedIn) {
            window.location.href = 'admin.html'; // Redireciona para login se não estiver logado
            return;
        }
        document.getElementById('changeCredentialsForm').addEventListener('submit', handleChangeCredentials);
    } else if (document.getElementById('product-details-section')) {
        initProductPage();
    }
});

async function loadProductDetails(id) {
    const { data, error } = await _supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        return null;
    }
    return data;
}

function renderProductDetails(product) {
    const productContent = document.getElementById('product-content');
    if (!product) {
        productContent.innerHTML = '<h2 style="text-align: center; padding: 50px;">Produto não encontrado.</h2>';
        return;
    }

    const { id, name, price, description, category, discount, image } = product;
    const hasDiscount = discount > 0;
    const originalPrice = price;
    const currentPrice = hasDiscount ? price * (1 - discount / 100) : price;

    // Atualiza o título da página
    document.getElementById('product-title').textContent = name + ' - Mega Tech';

    const whatsappMessage = encodeURIComponent(`Olá ${STORE_NAME}, vi o ${name} no vosso site e estou interessado. (ID: ${id})`);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    productContent.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-image">
                ${hasDiscount ? `<span class="promo-badge">${discount}% OFF</span>` : ''}
                <img src="${image || 'placeholder.jpg'}" alt="${name}">
            </div>
            <div class="product-detail-info">
                <h2>${name}</h2>
                <p class="product-category">Categoria: <strong>${category}</strong></p>
                
                <div class="price-section">
                    <span class="current-price-detail">${formatCurrency(currentPrice)}</span>
                    ${hasDiscount ? `<span class="original-price-detail">${formatCurrency(originalPrice)}</span>` : ''}
                </div>

                <h3>Descrição Completa</h3>
                <p>${description.replace(/\n/g, '<br>')}</p>

                <a href="${whatsappURL}" class="whatsapp-btn-detail" target="_blank">
                    <i class="fab fa-whatsapp"></i> Tenho Interesse!
                </a>
                
                <a href="index.html" class="back-to-shop-btn">
                    <i class="fas fa-arrow-left"></i> Voltar à Loja
                </a>
            </div>
        </div>
    `;
}

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        const product = await loadProductDetails(productId);
        renderProductDetails(product);
    } else {
        document.getElementById('product-content').innerHTML = '<h2 style="text-align: center; padding: 50px;">ID do produto não especificado.</h2>';
    }
}