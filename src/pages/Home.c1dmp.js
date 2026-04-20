// pages/home.js
import { getAllCategories } from 'backend/categories.jsw';
import { getAllProducts, searchProducts } from 'backend/products.jsw';
import wixLocation from 'wix-location';

let allProducts = [];

$w.onReady(async function () {
    console.log('=== Página de Inicio Cargada ===');

    try {
        await loadCategories();
        await loadProducts();
        setupEventListeners();
    } catch (error) {
        console.error("Error al cargar:", error);
    }
});

// =======================
// CATEGORÍAS
// =======================
async function loadCategories() {
    const categories = await getAllCategories();
    console.log('Categorías:', categories.length);

    const repeater = $w('#categoriesRepeater');

    if (repeater) {
        repeater.data = categories;

        repeater.onItemReady(($item, itemData) => {

            // IMPORTANTE: asignar contenido si tienes elementos internos
            if ($item('#txtCategoria')) {
                $item('#txtCategoria').text = itemData.nombre;
            }

            $item('#boxCategoria').onClick(() => {
                wixLocation.to(`/categoria/${itemData._id}`);
            });
        });
    }
}

// =======================
// PRODUCTOS
// =======================
async function loadProducts() {
    allProducts = await getAllProducts();
    console.log('Productos:', allProducts.length);

    renderProducts(allProducts);
}

// =======================
// RENDER PRODUCTOS
// =======================
function renderProducts(productos) {

    const repeater = $w('#productsRepeater');

    if (repeater) {
        repeater.data = productos;

        repeater.onItemReady(($item, itemData) => {

            if ($item('#txtNombre')) {
                $item('#txtNombre').text = itemData.nombre || "";
            }

            if ($item('#txtPrecio')) {
                $item('#txtPrecio').text = `$${itemData.precio || 0}`;
            }

            if ($item('#imgProducto') && itemData.imagen) {
                $item('#imgProducto').src = itemData.imagen;
            }

            // Click en toda la tarjeta (NO en $item directamente)
            if ($item('#boxProducto')) {
                $item('#boxProducto').onClick(() => {
                    wixLocation.to(`/producto/${itemData._id}`);
                });
            }
        });
    }
}

// =======================
// EVENTOS
// =======================
function setupEventListeners() {

    // BUSCADOR
    if ($w('#searchInput')) {
        $w('#searchInput').onKeyPress(async (event) => {

            if (event.key === 'Enter') {
                const term = ($w('#searchInput').value || "").trim();

                if (!term) {
                    renderProducts(allProducts);
                    return;
                }

                const results = await searchProducts(term);
                renderProducts(results);
            }
        });
    }

    // ORDENAR
    if ($w('#orderSelect')) {
        $w('#orderSelect').onChange(() => {

            const order = $w('#orderSelect').value;
            let sorted = [...$w('#productsRepeater').data];

            switch (order) {
                case 'price-asc':
                    sorted.sort((a, b) => (a.precio || 0) - (b.precio || 0));
                    break;

                case 'price-desc':
                    sorted.sort((a, b) => (b.precio || 0) - (a.precio || 0));
                    break;

                default:
                    sorted.sort((a, b) =>
                        (a.nombre || "").localeCompare(b.nombre || "")
                    );
            }

            renderProducts(sorted);
        });
    }

    // LIMPIAR BÚSQUEDA
    if ($w('#clearSearch')) {
        $w('#clearSearch').onClick(() => {
            $w('#searchInput').value = "";
            renderProducts(allProducts);
        });
    }
}