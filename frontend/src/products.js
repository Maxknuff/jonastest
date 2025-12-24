// Diese Datei dient nur als Fallback, falls der Server nicht erreichbar ist.
// KEINE Imports von Mongoose oder Backend-Code hier!

export const products = [
  { 
    id: "VAPE12K", 
    name: "RANDM TORNADO 12000", 
    price: 59.90, 
    image: "/products/VAPE12K.png",
    description: "Der Bestseller mit 12.000 Zügen. Intensiver Geschmack und lange Akkulaufzeit."
  },
  { 
    id: "VAPE15K", 
    name: "RANDM TORNADO 15000", 
    price: 29.90, 
    image: "/products/VAPE15K.png",
    description: "Das Upgrade für Profis. 15.000 Züge und einstellbarer Airflow für maximalen Dampf."
  },
  { 
    id: "prod_hardware_wallet", 
    name: "Cold Storage Stick", 
    price: 149.00, 
    image: "/products/stick.png",
    description: "Maximale Sicherheit für deine Coins. Offline-Speicherung und verschlüsseltes Backup."
  }
];