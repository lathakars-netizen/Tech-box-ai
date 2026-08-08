/**
 * TECH BOX AI - Centralized Phone Database
 * Data source for Trending Mobiles component and smartphone catalog
 */

const phonesData = [
    {
        id: "s25-ultra",
        name: "Galaxy S25 Ultra",
        brand: "Samsung",
        brandIcon: "fa-solid fa-mobile-retro",
        brandClass: "brand-samsung",
        price: "$1,299",
        rating: 4.9,
        ratingCount: "(1.4k)",
        image: "assets/s25_ultra.jpg",
        fallbackName: "S25 ULTRA",
        highlightTag: { text: "200MP OPTIC", icon: "fa-solid fa-wand-magic-sparkles", colorClass: "cyan" },
        glowClass: "",
        category: "flagship camera",
        specs: [
            { icon: "fa-solid fa-microchip", text: "Snap 8 Gen 4" },
            { icon: "fa-solid fa-camera", text: "200MP AI" },
            { icon: "fa-solid fa-battery-full", text: "5000 mAh" }
        ]
    },
    {
        id: "iphone-16-pro-max",
        name: "iPhone 16 Pro Max",
        brand: "Apple",
        brandIcon: "fa-brands fa-apple",
        brandClass: "brand-apple",
        price: "$1,199",
        rating: 4.9,
        ratingCount: "(1.8k)",
        image: "assets/iphone16_pro.jpg",
        fallbackName: "iPHONE 16 PRO",
        highlightTag: { text: "A18 PRO AI", icon: "fa-solid fa-brain", colorClass: "purple" },
        glowClass: "purple",
        category: "flagship",
        specs: [
            { icon: "fa-solid fa-microchip", text: "A18 Pro" },
            { icon: "fa-solid fa-camera", text: "48MP Fusion" },
            { icon: "fa-solid fa-wand-magic-sparkles", text: "Apple AI" }
        ]
    },
    {
        id: "pixel-9-pro-xl",
        name: "Pixel 9 Pro XL",
        brand: "Google",
        brandIcon: "fa-brands fa-google",
        brandClass: "brand-google",
        price: "$1,099",
        rating: 4.8,
        ratingCount: "(950)",
        image: "assets/pixel9_pro.jpg",
        fallbackName: "PIXEL 9 PRO",
        highlightTag: { text: "GEMINI NANO", icon: "fa-solid fa-wand-magic-sparkles", colorClass: "cyan" },
        glowClass: "",
        category: "flagship camera",
        specs: [
            { icon: "fa-solid fa-microchip", text: "Tensor G4" },
            { icon: "fa-solid fa-camera", text: "50MP Triple" },
            { icon: "fa-solid fa-brain", text: "Gemini Pro" }
        ]
    },
    {
        id: "oneplus-13-pro",
        name: "OnePlus 13 Pro 5G",
        brand: "OnePlus",
        brandIcon: "fa-solid fa-mobile",
        brandClass: "brand-oneplus",
        price: "$899",
        rating: 4.7,
        ratingCount: "(780)",
        image: "assets/s25_ultra.jpg",
        fallbackName: "ONEPLUS 13",
        highlightTag: { text: "100W CHARGE", icon: "fa-solid fa-bolt", colorClass: "pink" },
        glowClass: "pink",
        category: "value flagship",
        specs: [
            { icon: "fa-solid fa-microchip", text: "Snap 8 Gen 4" },
            { icon: "fa-solid fa-camera", text: "Hasselblad" },
            { icon: "fa-solid fa-bolt", text: "100W Fast" }
        ]
    },
    {
        id: "nothing-phone-3-pro",
        name: "Nothing Phone (3) Pro",
        brand: "Nothing",
        brandIcon: "fa-solid fa-atom",
        brandClass: "brand-nothing",
        price: "$799",
        rating: 4.6,
        ratingCount: "(520)",
        image: "assets/nothing3_pro.jpg",
        fallbackName: "NOTHING (3)",
        highlightTag: { text: "GLYPH 2.0", icon: "fa-solid fa-lightbulb", colorClass: "cyan" },
        glowClass: "",
        category: "value",
        specs: [
            { icon: "fa-solid fa-microchip", text: "Snap 8s Gen 3" },
            { icon: "fa-solid fa-layer-group", text: "Glyph LED" },
            { icon: "fa-solid fa-tv", text: "120Hz OLED" }
        ]
    },
    {
        id: "xiaomi-15-ultra",
        name: "Xiaomi 15 Ultra",
        brand: "Xiaomi",
        brandIcon: "fa-solid fa-mobile",
        brandClass: "brand-xiaomi",
        price: "$999",
        rating: 4.8,
        ratingCount: "(640)",
        image: "assets/iphone16_pro.jpg",
        fallbackName: "XIAOMI 15",
        highlightTag: { text: "LEICA 1-INCH", icon: "fa-solid fa-camera", colorClass: "purple" },
        glowClass: "purple",
        category: "camera flagship",
        specs: [
            { icon: "fa-solid fa-eye", text: "Leica Optic" },
            { icon: "fa-solid fa-camera", text: "50MP Quad" },
            { icon: "fa-solid fa-battery-full", text: "5500 mAh" }
        ]
    },
    {
        id: "rog-phone-9-ultimate",
        name: "ROG Phone 9 Ultimate",
        brand: "ASUS ROG",
        brandIcon: "fa-solid fa-gamepad",
        brandClass: "brand-asus",
        price: "$1,399",
        rating: 4.9,
        ratingCount: "(410)",
        image: "assets/pixel9_pro.jpg",
        fallbackName: "ROG PHONE 9",
        highlightTag: { text: "185Hz GAMING", icon: "fa-solid fa-fire", colorClass: "cyan" },
        glowClass: "",
        category: "gaming flagship",
        specs: [
            { icon: "fa-solid fa-gauge-high", text: "185Hz Screen" },
            { icon: "fa-solid fa-microchip", text: "16GB RAM" },
            { icon: "fa-solid fa-snowflake", text: "AeroCooler" }
        ]
    },
    {
        id: "vivo-x100-ultra",
        name: "Vivo X100 Ultra AI",
        brand: "Vivo",
        brandIcon: "fa-solid fa-mobile",
        brandClass: "brand-vivo",
        price: "$1,049",
        rating: 4.8,
        ratingCount: "(390)",
        image: "assets/nothing3_pro.jpg",
        fallbackName: "VIVO X100",
        highlightTag: { text: "ZEISS 200MP", icon: "fa-solid fa-crosshairs", colorClass: "pink" },
        glowClass: "pink",
        category: "camera flagship",
        specs: [
            { icon: "fa-solid fa-camera-retro", text: "ZEISS APO" },
            { icon: "fa-solid fa-bullseye", text: "200MP Tele" },
            { icon: "fa-solid fa-microchip", text: "V3+ Chip" }
        ]
    }
];

// Attach to window object for global availability
if (typeof window !== 'undefined') {
    window.phonesData = phonesData;
}
