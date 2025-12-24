
import '../styles.css';
import Header from '../components/Header.jsx';
import CheckoutOverlay from '../components/CheckoutOverlay.jsx';
import SupportOverlay from '../components/SupportOverlay.jsx';
import ProductGrid from '../components/ProductGrid.jsx';

// 1. Fallback importieren
import { products as fallbackProducts } from '../products.js';

let shopProducts = [];
let debugInfo = "";

try {
  // 2. API URL
  const API_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000' 
    : 'https://jonastest.onrender.com';

  console.log("Fetching from:", `${API_URL}/api/products`);

  // 3. Kurzer Timeout (3s)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  const response = await fetch(`${API_URL}/api/products`, { signal: controller.signal });
  clearTimeout(timeoutId);

  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      shopProducts = data;
    } else {
      console.log("DB leer, nutze Fallback.");
      shopProducts = fallbackProducts;
      debugInfo = "Modus: Fallback (DB leer)";
    }
  } else {
    throw new Error("Server Fehler");
  }

} catch (error) {
  console.error("API Fehler:", error);
  shopProducts = fallbackProducts;
  debugInfo = "Modus: Fallback (Server offline)";
}

// Doppelte Sicherheit: Niemals leer übergeben
if (!shopProducts || shopProducts.length === 0) {
  shopProducts = fallbackProducts;
}


<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>SECURE. | Premium Shop</title>
  </head>
  <body class="bg-[#F5F5F7] text-[#1D1D1F]">
    
    <Header client:only="react" />

    <main class="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="bg-black text-white rounded-3xl p-12 mb-16 relative overflow-hidden text-center md:text-left">
        <div class="relative z-10 max-w-2xl">
          <span class="text-[#0071E3] font-bold tracking-wide uppercase text-sm mb-2 block">Neu eingetroffen</span>
          <h1 class="text-5xl md:text-6xl font-bold tracking-tight mb-6">Next Level Flavor.</h1>
          <button class="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
            Jetzt entdecken
          </button>
        </div>
        <div class="absolute -right-20 -top-40 w-[600px] h-[600px] bg-[#0071E3] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold tracking-tight">Shop</h2>
        {debugInfo && <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{debugInfo}</span>}
      </div>
      
      <ProductGrid client:only="react" products={shopProducts} />

    </main>

    <CheckoutOverlay client:only="react" />
    <SupportOverlay client:only="react" />

  </body>
</html>