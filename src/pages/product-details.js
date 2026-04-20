// pages/product-details.js
import { getProductById, getProductsByCategory } from 'backend/products.jsw';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';

let currentProduct = null;

$w.onReady(async () => {
    // En páginas dinámicas, el ID viene del dataset
    const productId = $w('#dynamicDataset').getCurrentItem()._id;
    await loadProduct(productId);
    setupWhatsAppButton();
});

async function loadProduct(productId) {
    currentProduct = await getProductById(productId);
    
    $w('#productName').text = currentProduct.nombre;
    $w('#productPrice').text = `$${currentProduct.precio}`;
    $w('#productDescription').text = currentProduct.descripcion;
    
    if (currentProduct.imagenPrincipal) {
        $w('#productImage').src = currentProduct.imagenPrincipal;
    }
    
    // Selector de colores
    if (currentProduct.colores && currentProduct.colores.length > 0) {
        setupColorSelector(currentProduct.colores);
    }
    
    // Productos relacionados
    loadRelatedProducts(currentProduct.categoria);
}

function setupColorSelector(colors) {
    const container = $w('#colorsContainer');
    colors.forEach(color => {
        const colorCircle = container.addElement('Box');
        colorCircle.style = {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: '10px',
            cursor: 'pointer'
        };
        colorCircle.onClick(() => {
            if (currentProduct.imagenesPorColor && currentProduct.imagenesPorColor[color]) {
                $w('#productImage').src = currentProduct.imagenesPorColor[color];
            }
        });
    });
}

async function loadRelatedProducts(categoryId) {
    const products = await getProductsByCategory(categoryId);
    const filtered = products.filter(p => p._id !== currentProduct._id).slice(0, 4);
    $w('#relatedRepeater').data = filtered;
}

function setupWhatsAppButton() {
    $w('#whatsappButton').onClick(() => {
        const message = `Hola, me interesa el producto: *${currentProduct.nombre}*\n💰 Precio: $${currentProduct.precio}`;
        const phone = "573207512431";
        wixWindow.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    });
}