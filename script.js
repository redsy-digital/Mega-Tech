// script.js - Versão atualizada para usar API RESTful (Node.js/Knex)

// Variável global para o WhatsApp da loja
const WHATSAPP_NUMBER = "244924811382";
const STORE_NAME = "Mega Tech";
const API_BASE_URL = 

// --- Credenciais e Autenticação ---

/**
 * Carrega as credenciais atuais do servidor.
 * @returns {object} {username, password}
 */
async function fetchCredentials() {
    try {
        const response = await fetch(`${API_BASE_URL}/credentials`);
        if (!response.ok) {
            throw new Error(
        }
        return await response.json();
    } catch (error) {
        console.error(
        // Retorna credenciais padrão em caso de falha de comunicação
        return { username: "adminmegatech", password: "123" };
    }
}

/**
 * Salva as novas credenciais no servidor.
 * @param {string} username
 * @param {string} password
 */
async function updateCredentials(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/credentials`, {
            method: 
            headers: {
                
            },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            throw new Error(
        }
        return true;
    } catch (error) {
        console.error(
        return false;
    }
}

// Lógica de Login/Logout
async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById(
    const passwordInput = document.getElementById(
    const loginMessage = document.getElementById(
    
    // 1. Busca as credenciais corretas no servidor
    const { username: correctUsername, password: correctPassword } = await fetchCredentials();

    if (usernameInput === correctUsername && passwordInput === correctPassword) {
        // 2. Armazena o estado de login na sessionStorage (não persiste após fechar o browser)
        sessionStorage.setItem(
        loginMessage.textContent = 
        loginMessage.style.color = 
        setTimeout(initAdminPageContent, 500);
    } else {
        loginMessage.textContent = 
        loginMessage.style.color = 
    }
}

function logoutAdmin() {
    if (confirm(
        sessionStorage.removeItem(
        window.location.reload(); 
    }
}


// Lógica de Alteração de Credenciais (usadas em change_credentials.html)

async function handleChangePassword(event) {
    event.preventDefault();
    const currentPass = document.getElementById(
    const newPass = document.getElementById(
    const confirmNewPass = document.getElementById(
    const passwordMessage = document.getElementById(
    
    const { username, password: actualPassword } = await fetchCredentials();
    
    passwordMessage.style.color = 
    passwordMessage.textContent = 
    
    if (currentPass !== actualPassword) {
        passwordMessage.textContent = 
    } else if (newPass !== confirmNewPass) {
        passwordMessage.textContent = 
    } else if (newPass.length < 5) {
        passwordMessage.textContent = 
    } else {
        const success = await updateCredentials(username, newPass);
        if (success) {
            passwordMessage.textContent = 
            passwordMessage.style.color = 
            document.getElementById(
            sessionStorage.removeItem(
            setTimeout(() => window.location.href = 
        } else {
            passwordMessage.textContent = 
        }
    }
}

async function handleChangeUsername(event) {
    event.preventDefault();
    const currentUsername = document.getElementById(
    const newUsername = document.getElementById(
    const usernameMessage = document.getElementById(
    
    const { username: actualUsername, password } = await fetchCredentials();

    usernameMessage.style.color = 
    usernameMessage.textContent = 

    if (currentUsername !== actualUsername) {
        usernameMessage.textContent = 
    } else if (newUsername.length < 3) {
        usernameMessage.textContent = 
    } else {
        const success = await updateCredentials(newUsername, password);
        if (success) {
            usernameMessage.textContent = 
            usernameMessage.style.color = 
            document.getElementById(
            sessionStorage.removeItem(
            setTimeout(() => window.location.href = 
        } else {
            usernameMessage.textContent = 
        }
    }
}


// --- Funções de Ajuda ---

function formatCurrency(value) {
    if (typeof value !== 
        return "AOA 0";
    }
    return new Intl.NumberFormat(
}

// --- Lógica de Persistência (API) ---

/**
 * Carrega a lista de produtos do servidor.
 * @returns {Array<object>} Lista de produtos.
 */
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error(
        }
        return await response.json();
    } catch (error) {
        console.error(
        return [];
    }
}

// A função saveProducts não é mais necessária, pois as operações são feitas via API.

// --- Lógica do Catálogo (index.html) ---

/**
 * Gera o HTML para um único cartão de produto. (Mantido)
 * @param {object} product - O objeto produto.
 * @returns {string} O HTML do cartão.
 */
function createProductCard(product) {
    const { id, name, price, description, category, discount, image } = product;

    const hasDiscount = discount > 0;
    const originalPrice = parseFloat(price);
    const currentPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice;

    // Extrai as especificações da descrição 
    const specsRegex = /(RAM\/ROM:.*?)(,|$)|(Rede:.*?)(,|$)|(Versão:.*?)(,|$)/gi;
    const specsMatches = description.match(specsRegex) || [];
    
    const specsList = specsMatches.map(spec => {
        return spec.replace(/,$/, 
    }).filter(s => s.length > 0);

    const whatsappMessage = encodeURIComponent(`Olá ${STORE_NAME}, vi o ${name} no vosso site e fiquei interessado. (ID: ${id})`);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return `
        <div class="product-card" data-category="${category}" data-id="${id}">
            <div class="product-image-container">
                ${hasDiscount ? `<span class="promo-badge">${discount}% OFF</span>` : 
                <img src="${image || 
            </div>
            <div class="product-details">
                <h3>${name}</h3>
                <p style="white-space: pre-wrap; word-wrap: break-word;">${description}</p> <div class="price-section">
                    <span class="current-price">${formatCurrency(currentPrice)}</span>
                    ${hasDiscount ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : 
                </div>
                <div class="specs">
                    ${specsList.map(spec => `<p><strong>${spec.split(
                    ${specsList.length === 0 ? 
                </div>
                <a href="${whatsappURL}" class="whatsapp-btn" target="_blank">
                    <i class="fab fa-whatsapp"></i> Tenho Interesse!
                </a>
            </div>
        </div>
    `;
}

async function renderCatalog(category = 
    const productGrid = document.getElementById(
    if (!productGrid) return;

    const products = await fetchProducts(); // Alterado para fetchProducts
    productGrid.innerHTML = 

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    let filteredProducts = category === 
        ? products
        : products.filter(p => p.category === category);

    if (normalizedSearchTerm) {
        filteredProducts = filteredProducts.filter(product => {
            const productText = (
                product.name +
                product.description +
                product.category
            ).toLowerCase();
            
            return productText.includes(normalizedSearchTerm);
        });
    }

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = 
        return;
    }

    filteredProducts.forEach(product => {
        productGrid.innerHTML += createProductCard(product);
    });
}

function initIndexPage() {
    let currentCategory = 
    renderCatalog(

    const filterButtons = document.querySelectorAll(
    filterButtons.forEach(button => {
        button.addEventListener(
            filterButtons.forEach(btn => btn.classList.remove(
            this.classList.add(
            
            currentCategory = this.getAttribute(
            const searchTerm = document.getElementById(
            renderCatalog(currentCategory, searchTerm);
        });
    });

    const searchInput = document.getElementById(
    if (searchInput) {
        searchInput.addEventListener(
            renderCatalog(currentCategory, this.value);
        });
    }
}


// --- Lógica do Painel de Admin (admin.html) ---

function resetAdminForm() {
    const form = document.getElementById(
    const imagePreview = document.getElementById(
    const submitButton = document.getElementById(

    form.reset();
    document.getElementById(
    imagePreview.style.display = 
    imagePreview.src = 
    submitButton.innerHTML = 
    submitButton.style.backgroundColor = 
}

async function editProduct(id) {
    const products = await fetchProducts(); // Alterado para fetchProducts
    const productToEdit = products.find(p => p.id === id);
    if (!productToEdit) return;

    document.getElementById(
    document.getElementById(
    document.getElementById(
    document.getElementById(
    document.getElementById(
    document.getElementById(
    
    const isURL = productToEdit.image && productToEdit.image.startsWith(
    document.getElementById(
    document.getElementById(

    const imagePreview = document.getElementById(
    imagePreview.src = productToEdit.image || 
    imagePreview.style.display = productToEdit.image ? 

    const submitButton = document.getElementById(
    submitButton.innerHTML = 
    submitButton.style.backgroundColor = 
    
    window.scrollTo({ top: 0, behavior: 
}

async function deleteProduct(id) {
    if (confirm(
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 
            });

            if (!response.ok) {
                throw new Error(
            }

            await renderAdminList(); 
            alert(
        } catch (error) {
            console.error(
            alert(
        }
    }
}


async function renderAdminList() {
    const productListAdmin = document.getElementById(
    if (!productListAdmin) return;

    const products = await fetchProducts(); // Alterado para fetchProducts
    productListAdmin.innerHTML = 

    if (products.length === 0) {
        productListAdmin.innerHTML = 
        return;
    }

    products.forEach(product => {
        const listItem = document.createElement(
        listItem.innerHTML = `
            <div class="product-info-admin">
                <strong>${product.name}</strong> (${product.category}) - ${formatCurrency(parseFloat(product.price))}
                ${product.discount > 0 ? `<span style="color: red; margin-left: 10px;">(${product.discount}% OFF)</span>` : 
            </div>
            <div class="product-actions-admin">
                <button onclick="editProduct(
                <button onclick="deleteProduct(
            </div>
        `;
        productListAdmin.appendChild(listItem);
    });
}

async function handleProductSubmit(event) {
    event.preventDefault();

    const id = document.getElementById(
    const name = document.getElementById(
    const price = parseFloat(document.getElementById(
    const description = document.getElementById(
    const category = document.getElementById(
    const discount = parseInt(document.getElementById(
    const imageURL = document.getElementById(
    const imageFile = document.getElementById(
    
    let imageUrlToUse = imageURL;

    if (imageFile) {
        // Leitura do arquivo para Base64 (mantido, pois o backend aceita)
        imageUrlToUse = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    } else if (!imageUrlToUse && id) {
        // Se for edição e não alterou a imagem, mantém a existente
        const products = await fetchProducts();
        const existingProduct = products.find(p => p.id === id);
        imageUrlToUse = existingProduct ? existingProduct.image : 
    } else if (!imageUrlToUse) {
        alert(
        return;
    }

    const productData = {
        id: id || Date.now().toString(),
        name,
        price,
        description,
        category,
        discount,
        image: imageUrlToUse,
    };

    try {
        const method = id ? 
        const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;

        const response = await fetch(url, {
            method: method,
            headers: {
                
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error(
        }

        const message = id ? "Produto atualizado com sucesso!" : "Novo produto adicionado com sucesso!";
        alert(message);

        resetAdminForm();
        await renderAdminList();
    } catch (error) {
        console.error(
        alert(
    }
}

function previewImage(event) {
    const imagePreview = document.getElementById(
    imagePreview.style.display = 
    
    if (event.target.id === 
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
        document.getElementById(
    } 
    else if (event.target.id === 
        imagePreview.src = event.target.value;
        document.getElementById(
        
        imagePreview.onerror = function() {
            imagePreview.src = 
            imagePreview.style.display = 
            alert(
        };
    } else {
         imagePreview.style.display = 
    }
}

/**
 * Inicializa o conteúdo do painel (visível após o login).
 */
function initAdminPageContent() {
    // 1. Verifica o estado de login na sessionStorage
    const isLoggedIn = sessionStorage.getItem(
    const loginSection = document.getElementById(
    const adminContent = document.getElementById(

    if (isLoggedIn) {
        loginSection.style.display = 
        adminContent.style.display = 
        
        const form = document.getElementById(
        if (form) {
            form.addEventListener(
            document.getElementById(
            document.getElementById(
        }
        renderAdminList();
    } else {
        loginSection.style.display = 
        adminContent.style.display = 
    }
}

/**
 * Inicializa a lógica da página de admin (admin.html).
 */
function initAdminPage() {
    // Apenas liga o formulário de login no admin.html
    const loginForm = document.getElementById(
    if (loginForm) {
        loginForm.addEventListener(
    }
    
    // Verifica o estado do login
    initAdminPageContent();
}

/**
 * Inicializa a lógica da página de alteração de credenciais (change_credentials.html).
 */
function initChangeCredentialsPage() {
    const passwordForm = document.getElementById(
    const usernameForm = document.getElementById(

    if (passwordForm) {
        passwordForm.addEventListener(
    }
    if (usernameForm) {
        usernameForm.addEventListener(
    }
}


// --- Inicialização Principal ---

document.addEventListener(
    // Não é mais necessário chamar loadCredentials aqui, pois é chamado dentro das funções
    
    const pathname = window.location.pathname;

    if (document.getElementById(
        initIndexPage();
    } else if (pathname.includes(
        initChangeCredentialsPage();
    } else if (document.getElementById(
        initAdminPage();
    }
});
