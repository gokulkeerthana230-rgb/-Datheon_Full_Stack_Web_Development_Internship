/**
 * LUXE E-Commerce Storefront - Application Logic
 * Stack: Vanilla JavaScript (ES6+), FakeStoreAPI, CSS Grid, State Management, LocalStorage
 */

// =============================================================================
// 1. STATE MANAGEMENT
// =============================================================================

const AppState = {
  products: [],           // Master list fetched from API enriched with extended catalog (84 items)
  filteredProducts: [],   // Products currently matching search & category
  categories: [],         // Categories list
  selectedCategory: 'all',// Current category filter ('all' or specific slug)
  searchQuery: '',        // Current search text query
  sortBy: 'default',      // Sorting mode: 'default', 'price-asc', 'price-desc', 'rating-desc', 'name-asc'
  cart: [],               // [{ id, title, price, image, category, quantity }]
  displayLimit: 16,       // Number of products currently displayed
  isCrossCategoryActive: false, // Flag when search yields cross-category results
  isLoading: false,       // Loading spinner flag
  error: null,            // API fetch error message
  isCartOpen: false,      // Drawer visibility
  isCheckoutOpen: false,  // Checkout modal visibility
  isQuickViewOpen: false, // Quick view modal visibility
  quickViewItem: null     // Selected product for quick view
};

// Storage Keys & Constants
const STORAGE_KEY_CART = 'luxe_store_cart_v1';
const API_BASE_URL = 'https://fakestoreapi.com';
const FREE_SHIPPING_THRESHOLD = 50.0;
const FLAT_SHIPPING_FEE = 5.0;
const TAX_RATE = 0.08; // 8% sales tax

// Fallback catalog in case FakeStoreAPI is unreachable or offline
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    price: 109.95,
    description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    rating: { rate: 3.9, count: 120 }
  },
  {
    id: 2,
    title: "Mens Casual Premium Slim Fit T-Shirts",
    price: 22.3,
    description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    rating: { rate: 4.1, count: 259 }
  },
  {
    id: 3,
    title: "Mens Cotton Jacket",
    price: 55.99,
    description: "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    rating: { rate: 4.7, count: 500 }
  },
  {
    id: 4,
    title: "Mens Casual Slim Fit",
    price: 15.99,
    description: "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    rating: { rate: 2.1, count: 430 }
  },
  {
    id: 5,
    title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    price: 695.0,
    description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 4.6, count: 400 }
  },
  {
    id: 6,
    title: "Solid Gold Petite Micropave",
    price: 168.0,
    description: "Satisfaction Guaranteed. Return or exchange any order within 30 days. Designed and sold by Hafeez Center in the United States. Satisfaction Guaranteed. Return or exchange any order within 30 days.",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 3.9, count: 70 }
  },
  {
    id: 7,
    title: "White Gold Plated Princess",
    price: 9.99,
    description: "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to spoil your love more for Engagement, Wedding, Anniversary, Valentine's Day...",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 3.0, count: 400 }
  },
  {
    id: 8,
    title: "Pierced Owl Rose Gold Plated Stainless Steel Double",
    price: 10.99,
    description: "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 1.9, count: 100 }
  },
  {
    id: 9,
    title: "WD 2TB Elements Portable External Hard Drive - USB 3.0",
    price: 64.0,
    description: "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7",
    category: "electronics",
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    rating: { rate: 3.3, count: 203 }
  },
  {
    id: 10,
    title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    price: 109.0,
    description: "Easy upgrade for faster boot up, shutdown, application load and response (As compared to 5400 RPM SATA 2.5” hard drive; Based on published specifications and internal benchmarking tests using PCMark vantage scores)",
    category: "electronics",
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    rating: { rate: 2.9, count: 470 }
  },
  {
    id: 11,
    title: "Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5",
    price: 109.0,
    description: "3D NAND flash are applied to deliver high transfer speeds Remarkable transfer speeds that enable faster bootup and improved overall system performance.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",
    rating: { rate: 4.8, count: 319 }
  },
  {
    id: 12,
    title: "WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive",
    price: 114.0,
    description: "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer's limited warranty",
    category: "electronics",
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    rating: { rate: 4.8, count: 400 }
  },
  {
    id: 13,
    title: "Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin",
    price: 599.0,
    description: "21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology. No compatibility for VESA Mount Refresh Rate: 75Hz - Using HDMI port",
    category: "electronics",
    image: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",
    rating: { rate: 2.9, count: 250 }
  },
  {
    id: 14,
    title: "Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor (LC49HG90DMNXZA) – Super Ultrawide Screen QLED",
    price: 999.99,
    description: "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by side QUANTUM DOT (QLED) TECHNOLOGY, HDR support and factory calibration provides stunningly realistic and accurate color and contrast",
    category: "electronics",
    image: "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",
    rating: { rate: 2.2, count: 140 }
  },
  {
    id: 15,
    title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    price: 56.99,
    description: "Note:The Jackets is US standard size, Please choose size as your usual wear Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece. Detachable Functional Liner: Skin Friendly, Lightweigt and Warm.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
    rating: { rate: 2.6, count: 235 }
  },
  {
    id: 16,
    title: "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
    price: 29.95,
    description: "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (SWEATER), Faux leather material for style and comfort / 2 pockets of front, 2-For-One Hooded denim style faux leather jacket",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
    rating: { rate: 2.9, count: 340 }
  },
  {
    id: 17,
    title: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    price: 39.99,
    description: "Lightweight perfect for trip or casual wear---Long sleeve with hooded, adjustable drawstring waist design. Button and zipper front closure raincoat, fully stripes Lined and The Raincoat has 2 side pockets are a good size to hold all kinds of things",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg",
    rating: { rate: 3.8, count: 679 }
  },
  {
    id: 18,
    title: "MBJ Women's Solid Short Sleeve Boat Neck V",
    price: 9.85,
    description: "95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline / Double stitching on bottom hem",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/71z3kpMAYUL._AC_UY879_.jpg",
    rating: { rate: 4.7, count: 130 }
  },
  {
    id: 19,
    title: "Opna Women's Short Sleeve Moisture",
    price: 7.95,
    description: "100% Polyester, Machine wash, 100% cationic polyester interlock, Machine Wash & Pre Shrunk for a Great Fit, Lightweight, roomy and highly breathable with moisture wicking fabric which helps to keep moisture away",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
    rating: { rate: 4.5, count: 146 }
  },
  {
    id: 20,
    title: "DANVOUY Womens T Shirt Casual Cotton Short",
    price: 12.99,
    description: "95%Cotton,5%Spandex, Features: Casual, Short Sleeve, Letter Print,V-Neck,Fashion Tees, The fabric is soft and has some stretch., Occasion: Casual/Office/Beach/School/Home/Street. Season: Spring,Summer,Autumn,Winter.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
    rating: { rate: 3.6, count: 145 }
  }
];

// Rich Extended Catalog (32 premium items expanding the store to 52 varied products)
const EXTENDED_CATALOG_PRODUCTS = [
  // --- Electronics (8 items) ---
  {
    id: 21,
    title: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    price: 349.99,
    description: "Industry-leading active noise canceling with two processors and 8 microphones. Crystal clear hands-free calling, spatial audio, and up to 30-hour battery life with fast USB-C charging.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 620 }
  },
  {
    id: 22,
    title: "Apple Watch Series 9 GPS 45mm Smartwatch",
    price: 399.00,
    description: "Advanced health sensors with ECG, blood oxygen, temperature sensing, always-on Retina display, water resistant 50m, crash detection, and fast wireless charging.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 480 }
  },
  {
    id: 23,
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    price: 99.99,
    description: "Quiet clicks with 8000 DPI any-surface tracking including glass. MagSpeed electromagnetic scrolling, ergonomic thumb rest, Bluetooth and USB receiver connectivity.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 390 }
  },
  {
    id: 24,
    title: "Keychron K2 Mechanical Wireless Gaming Keyboard",
    price: 89.99,
    description: "Compact 75% layout with RGB backlighting, hot-swappable Gateron mechanical switches, aluminum frame, Bluetooth 5.1 multi-device pairing, Mac and Windows keys.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 310 }
  },
  {
    id: 25,
    title: "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
    price: 129.95,
    description: "Powerful 2-way speaker system delivers loud, crystal clear audio with deep booming bass. IP67 waterproof and dustproof design with 12 hours playtime on single charge.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 540 }
  },
  {
    id: 26,
    title: "Anker 737 GaNPrime 120W Ultra-Fast USB-C Charger",
    price: 79.99,
    description: "Simultaneously charge 3 devices with dual USB-C and USB-A ports. Powered by GaN technology with dynamic PowerIQ 4.0 and ActiveShield 2.0 temperature protection.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 270 }
  },
  {
    id: 27,
    title: "Elgato Facecam 1080p60 Full HD HDR Streaming Webcam",
    price: 149.99,
    description: "Studio-grade all-glass prime lens with Sony STARVIS CMOS sensor. Uncompressed 1080p video at 60 fps with low-light optimization and custom onboard settings memory.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.4, count: 195 }
  },
  {
    id: 28,
    title: "Bose QuietComfort Ultra Wireless Earbuds",
    price: 299.00,
    description: "Breakthrough spatial audio and world-class active noise cancellation. CustomTune audio technology tailors sound to your ears for all-day comfort with 6 hours playtime.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 410 }
  },

  // --- Jewelry (8 items) ---
  {
    id: 29,
    title: "18K Solid Yellow Gold Herringbone Flat Chain Necklace",
    price: 385.00,
    description: "Italian crafted 18k solid yellow gold flat herringbone silky necklace. High-polish liquid gold mirror finish, hypoallergenic, tarnish-resistant with secure lobster clasp.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 215 }
  },
  {
    id: 30,
    title: "Sparkling Sterling Silver Cubic Zirconia Tennis Bracelet",
    price: 145.00,
    description: "Classic 4mm round brilliant cut AAA cubic zirconia stones hand-set in 925 sterling silver with double safety latch closure. Timeless luxury bracelet for everyday or gala.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1611591475870-07e3a9928509?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 320 }
  },
  {
    id: 31,
    title: "Natural Freshwater Cultured Pearl Drop Earrings",
    price: 89.00,
    description: "Hand-selected AAA grade teardrop freshwater pearls suspended from 14K gold-filled French ear hooks. Radiant natural luster for weddings, formal wear, and gifts.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 180 }
  },
  {
    id: 32,
    title: "Minimalist Brushed Titanium Wedding Band Ring",
    price: 75.00,
    description: "Aerospace-grade pure titanium band with matte brushed satin center and mirror-polished beveled comfort-fit edges. Scratch-resistant and featherlight ring.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 260 }
  },
  {
    id: 33,
    title: "Vintage Emerald Cut Sapphire Halo Pendant Necklace",
    price: 260.00,
    description: "Deep royal blue sapphire gemstone haloed by micro-pave simulated diamonds on an adjustable 16-18 inch delicate sterling silver chain with rhodium plating.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 140 }
  },
  {
    id: 34,
    title: "Rose Gold Crystal Twist Cable Cuff Bangle",
    price: 95.00,
    description: "Elegant open cuff cable twist bangle plated in 18K rose gold with pave Austrian crystal end caps. Flexible tension fit comfortably accommodates all wrist sizes.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.3, count: 190 }
  },
  {
    id: 35,
    title: "Celestial Moon & Star Diamond Huggie Hoop Earrings",
    price: 110.00,
    description: "Dainty huggie hoops crafted in 14K gold vermeil over sterling silver featuring dangling pave-set crystal moon and star charm pendants with snap lock.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 310 }
  },
  {
    id: 36,
    title: "Chunky 8mm Miami Cuban Link Chain Gold Bracelet",
    price: 180.00,
    description: "Bold 8mm diamond-cut Miami Cuban curb chain bracelet with thick 14K real gold vacuum plating and box lock clasp with dual safety wings.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.4, count: 165 }
  },

  // --- Men's Clothing (8 items) ---
  {
    id: 37,
    title: "Classic Oxford Cotton Button-Down Dress Shirt",
    price: 48.00,
    description: "100% breathable combed long-staple Oxford cotton shirt with button-down collar, chest pocket, and tailored regular fit ideal for office or weekend smart casual.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 420 }
  },
  {
    id: 38,
    title: "Slim-Fit Stretch Chino Pants in Khaki",
    price: 52.50,
    description: "Premium cotton twill woven with 2% elastane for unrestricted stretch. Wrinkle-resistant finish with modern tapered leg, welt rear pockets, and zip fly.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 380 }
  },
  {
    id: 39,
    title: "Heavyweight Vintage Fleece Pullover Hoodie",
    price: 59.99,
    description: "450 GSM ultra-soft brushed organic cotton fleece hoodie with roomy kangaroo pocket, double-lined drawstring hood, and reinforced ribbed side gussets.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 510 }
  },
  {
    id: 40,
    title: "Merino Wool Lightweight Crewneck Sweater",
    price: 85.00,
    description: "100% extrafine Australian Merino wool sweater. Natural thermoregulating, odor resistant, and exceptionally soft against skin without itching. Hand washable.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 290 }
  },
  {
    id: 41,
    title: "Waterproof Hooded Windbreaker Trail Jacket",
    price: 79.95,
    description: "Technical ripstop nylon shell with 10K waterproof laminate, sealed seams, adjustable visor hood, underarm ventilation zips, and packable pocket.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 340 }
  },
  {
    id: 42,
    title: "Tailored Linen Summer Blazer in Navy",
    price: 139.00,
    description: "Pure European flax linen jacket with half-lining for airy summer comfort. Features notch lapels, dual side vents, and patch pockets for effortless Mediterranean elegance.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.4, count: 175 }
  },
  {
    id: 43,
    title: "Everyday Crewneck Pima Cotton T-Shirt 3-Pack",
    price: 39.50,
    description: "Peruvian Pima long-staple cotton tees offering silky hand feel, zero pilling, and durable colorfast dye. Tailored fit through shoulders with tagless collar.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 680 }
  },
  {
    id: 44,
    title: "Rugged Denim Trucker Jacket in Vintage Indigo",
    price: 88.00,
    description: "13.5 oz durable 100% cotton denim jacket with authentic faded wash, antique bronze shank buttons, buttoned flap chest pockets, and waist adjusters.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 430 }
  },

  // --- Women's Clothing (8 items) ---
  {
    id: 45,
    title: "Floral Chiffon Tiered Wrap Midi Dress",
    price: 68.00,
    description: "Breezy floral printed chiffon midi dress with flutter sleeves, feminine V-neckline, adjustable self-tie wrap waist, and cascading tiered ruffled skirt.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 520 }
  },
  {
    id: 46,
    title: "High-Waisted Seamless Butter-Soft Workout Leggings",
    price: 42.00,
    description: "Four-way stretch squat-proof athletic leggings with tummy-control compression waistband, moisture-wicking fabric, and discreet hidden key pocket.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 870 }
  },
  {
    id: 47,
    title: "Oversized Chunky Knit Wool Cardigan Sweater",
    price: 74.50,
    description: "Cozy slouchy boyfriend knit cardigan sweater featuring tortoiseshell horn buttons, dropped shoulder seams, and deep patch pockets for stylish autumn layering.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 390 }
  },
  {
    id: 48,
    title: "Classic Double-Breasted Trench Coat with Belt",
    price: 129.00,
    description: "Water-resistant cotton twill trench coat with notch collar, storm flap, buckled cuff straps, horn buttons, and matching removable waist tie belt.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 280 }
  },
  {
    id: 49,
    title: "Ribbed Square-Neck Sleeveless Bodysuit",
    price: 28.00,
    description: "Seamless sculpting ribbed knit bodysuit with modern square neckline, bra-friendly wide straps, and convenient snap closure at bottom gusset.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 430 }
  },
  {
    id: 50,
    title: "Pleated High-Waist A-Line Satin Midi Skirt",
    price: 49.99,
    description: "Flowing accordion pleated midi skirt in radiant champagne satin with comfortable elasticated waistband. Elegant silhouette for day-to-night styling.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 340 }
  },
  {
    id: 51,
    title: "Quilted Lightweight Puffer Vest in Champagne",
    price: 55.00,
    description: "Windproof and water-repellent shell with vegan cruelty-free down alternative insulation. Features cozy stand collar, zip pockets, and packable pouch.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 210 }
  },
  {
    id: 52,
    title: "Relaxed Fit Pure Linen Button-Up Cover Shirt",
    price: 44.00,
    description: "100% natural garment-washed lightweight linen shirt with curved high-low hem and shell buttons. Wear buttoned or unbuttoned over swimwear or denim.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 310 }
  },
  // --- New Electronics (IDs 53-60) ---
  {
    id: 53,
    title: "Apple iPad Air 11-inch M2 Chip 128GB Wi-Fi",
    price: 599.00,
    description: "Liquid Retina display with P3 wide color and anti-reflective coating. Powered by the lightning-fast Apple M2 chip, supporting Apple Pencil Pro and Magic Keyboard.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 530 }
  },
  {
    id: 54,
    title: "Shure MV7+ USB/XLR Dynamic Podcast Microphone",
    price: 279.00,
    description: "Professional hybrid USB and XLR broadcast microphone with voice isolation technology, digital pop filter, onboard DSP reverb, and customizable LED touch panel.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 340 }
  },
  {
    id: 55,
    title: "Anker Prime 20,000mAh Power Bank (200W Output)",
    price: 119.99,
    description: "Ultra-compact power bank with 200W total output and dual 100W USB-C ports. Smart digital display shows real-time power, voltage, and remaining recharge time.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 410 }
  },
  {
    id: 56,
    title: "BenQ ScreenBar Halo LED Monitor Light Bar & Wireless Dial",
    price: 179.00,
    description: "Zero screen glare eye-care desk lamp with automatic ambient light sensor, backlighting ambient light mode, and wireless circular desktop controller dial.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 290 }
  },
  {
    id: 57,
    title: "GoPro HERO12 Black 5.3K Waterproof Action Camera",
    price: 349.99,
    description: "Incredible 5.3K60 and 4K120 video with HyperSmooth 6.0 stabilization, HDR photo and video, dual LCD screens, and rugged waterproof construction down to 33 feet.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 480 }
  },
  {
    id: 58,
    title: "XGIMI MoGo 2 Pro 1080p Portable Smart Mini Projector",
    price: 399.00,
    description: "Compact cinematic DLP projector with 400 ISO lumens, automated intelligent obstacle avoidance, autofocus, dual 8W Dolby Audio speakers, and Android TV built in.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 220 }
  },
  {
    id: 59,
    title: "Kindle Paperwhite 16GB 6.8-inch Glare-Free E-Reader",
    price: 149.99,
    description: "300 ppi glare-free display with adjustable warm light, waterproof IPX8 rating, up to 10 weeks of battery life, and 20% faster page turns for book lovers.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 910 }
  },
  {
    id: 60,
    title: "Garmin Forerunner 265 Running GPS Smartwatch",
    price: 449.99,
    description: "Brilliant colorful AMOLED touchscreen, training readiness metrics, heart rate variability status, multi-band GNSS GPS, and up to 13 days of battery life in smartwatch mode.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 360 }
  },

  // --- New Jewelry (IDs 61-68) ---
  {
    id: 61,
    title: "Vintage Emerald Cut Created Colombian Emerald Ring",
    price: 195.00,
    description: "Vivid green 2.5ct emerald-cut laboratory created Colombian emerald set in 925 sterling silver with 18K yellow gold prongs and tapered baguette side stones.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 230 }
  },
  {
    id: 62,
    title: "Italian 925 Sterling Silver Rounded Box Chain Necklace",
    price: 65.00,
    description: "3mm solid sterling silver Italian rounded box chain with rhodium anti-tarnish protective plating and durable lobster claw clasp. Sleek everyday unisex chain.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 410 }
  },
  {
    id: 63,
    title: "14K White Gold Round Brilliant Cut Moissanite Stud Earrings",
    price: 210.00,
    description: "Pair of 1.0 carat total weight VVS1 D-color colorless moissanite gemstones with 4-prong basket setting in 14K solid white gold with secure screw backs.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 380 }
  },
  {
    id: 64,
    title: "Australian Natural Fire Opal Teardrop Pendant Necklace",
    price: 175.00,
    description: "Genuine iridescent fire opal gemstone showing multi-colored rainbow flashes, prong set in 18K yellow gold vermeil with a diamond halo on an 18-inch cable chain.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 190 }
  },
  {
    id: 65,
    title: "Interlocking Infinity Knot Diamond Accent Cuff Bracelet",
    price: 125.00,
    description: "Symbol of eternal love and unity. Crafted in polished 925 sterling silver with genuine pave diamond accents and flexible comfort hinged closure.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1611591475870-07e3a9928509?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 275 }
  },
  {
    id: 66,
    title: "Vintage Engraved Floral Heart Photo Locket in Rose Gold",
    price: 85.00,
    description: "Hand-engraved Victorian heart locket holding two keepsake photographs, crafted in 14K rose gold plating with a sparkling bezel-set central crystal.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 310 }
  },
  {
    id: 67,
    title: "Men's Classic Oval Black Onyx Signet Ring",
    price: 115.00,
    description: "Natural jet-black onyx flat stone set into a heavyweight solid 316L stainless steel band with rich 18K gold ionic plating and mirror-finished shoulders.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 240 }
  },
  {
    id: 68,
    title: "Southwestern Bohemian Raw Turquoise Stone Open Cuff",
    price: 135.00,
    description: "Handcrafted antiqued tribal filigree cuff bracelet featuring three vibrant natural turquoise nuggets with organic matrix patterns in oxidized sterling silver.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 165 }
  },

  // --- New Men's Clothing (IDs 69-76) ---
  {
    id: 69,
    title: "Polar Fleece Quarter-Zip Outdoor Pullover",
    price: 49.99,
    description: "300g thermal anti-pill polar fleece with stand collar, elastic bound cuffs, zippered chest pocket, and warm kangaroo hand pockets for chilly mornings.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 390 }
  },
  {
    id: 70,
    title: "Tailored Pleated Wool-Blend Dress Trousers in Charcoal",
    price: 78.00,
    description: "Premium Australian wool blend trousers with single front pleats, hidden expandable waistband, and tailored drape suitable for formal and business occasions.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 280 }
  },
  {
    id: 71,
    title: "Classic MA-1 Reversible Flight Bomber Jacket",
    price: 89.95,
    description: "Water-resistant nylon flight jacket with signature emergency orange lining, rib-knit collar, cuffs, and utility sleeve pocket with red remove-before-flight tag.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 540 }
  },
  {
    id: 72,
    title: "7-inch 2-in-1 Athletic Running Shorts with Compression Liner",
    price: 36.00,
    description: "Ultralight 4-way stretch quick-dry outer shell with built-in anti-chafing compression boxer liner, zipper back pocket, and phone storage sleeve.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 620 }
  },
  {
    id: 73,
    title: "Heavyweight Buffalo Plaid Cotton Flannel Shirt",
    price: 54.00,
    description: "Brushed 100% yarn-dyed double-sided cotton flannel in classic red and black check. Double-button flap chest pockets and relaxed durable workwear fit.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 470 }
  },
  {
    id: 74,
    title: "Full-Grain Italian Leather Reversible Dress Belt",
    price: 42.00,
    description: "Crafted from 100% genuine full-grain vegetable-tanned Italian leather. Reversible twist buckle transitions seamlessly between black and cognac brown.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 380 }
  },
  {
    id: 75,
    title: "Arctic Explorer Waterproof Goose Down Winter Parka",
    price: 220.00,
    description: "Heavyweight storm-proof winter coat with 700-fill power certified down insulation, fleece-lined handwarmer pockets, and detachable faux-fur storm hood.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 310 }
  },
  {
    id: 76,
    title: "Seamless Moisture-Wicking Athletic Gym Tank Top",
    price: 24.50,
    description: "Breathable micro-mesh poly-spandex blend with body-mapped ventilation zones and reflective logos for night running and high-intensity gym sessions.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.4, count: 290 }
  },

  // --- New Women's Clothing (IDs 77-84) ---
  {
    id: 77,
    title: "100% Pure Mulberry Silk Pajama 2-Piece Lounge Set",
    price: 145.00,
    description: "22 Momme grade 6A pure mulberry silk long-sleeve notch-collar pajama shirt with contrasting white piping and matching elastic drawstring lounge pants.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 420 }
  },
  {
    id: 78,
    title: "Cocoon Wrap Wool-Blend Oversized Winter Coat in Camel",
    price: 165.00,
    description: "Luxurious heavy wool-blend coat with dramatic shawl collar, self-tie belt, deep welt pockets, and fully lined satin interior in timeless camel.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 350 }
  },
  {
    id: 79,
    title: "Bohemian Tiered Ruffle Eyelet Cotton Maxi Skirt",
    price: 58.00,
    description: "100% airy embroidered eyelet cotton with stretchy smocked waistband, tiered ruffled hemline, and breathable inner cotton lining in crisp ivory.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 280 }
  },
  {
    id: 80,
    title: "Medium-Impact Longline Racerback Padded Sports Bra",
    price: 32.00,
    description: "Butter-soft brushed athletic fabric with longline under-bust band, removable bra pads, and ventilated mesh racerback for yoga, pilates, and fitness.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.7, count: 640 }
  },
  {
    id: 81,
    title: "Mongolian Cashmere-Blend Ribbed Turtleneck Sweater",
    price: 95.00,
    description: "Heavenly soft cashmere and Merino wool blend sweater featuring folded rib turtleneck, side slits, and slightly dropped shoulders for effortless chic styling.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.9, count: 390 }
  },
  {
    id: 82,
    title: "High-Rise Wide-Leg Relaxed Linen-Blend Trousers",
    price: 56.00,
    description: "Breathable linen-viscose blend trousers with front pleats, side slash pockets, elastic back waistband, and relaxed wide-leg drape in warm oatmeal.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.6, count: 410 }
  },
  {
    id: 83,
    title: "Vintage Adjustable Denim Overalls with Utility Pockets",
    price: 72.00,
    description: "Medium-wash authentic 100% cotton denim dungarees with classic bib pocket, adjustable metal strap buckles, side button closures, and straight-leg cuff.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.5, count: 230 }
  },
  {
    id: 84,
    title: "Plush Shaggy Fleece Hooded Robe with Sherpa Trim",
    price: 62.00,
    description: "Ultra-thick warm cloud fleece loungewear robe with sherpa fleece hood and cuff trims, tie belt, and deep dual patch pockets for chilly winter nights.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
    rating: { rate: 4.8, count: 370 }
  }
];

// =============================================================================
// 2. DOM ELEMENTS CACHE
// =============================================================================

const DOM = {
  // Navigation
  navbar: document.getElementById('navbar'),
  navbarSearchInput: document.getElementById('navbarSearchInput'),
  catalogSearchInput: document.getElementById('catalogSearchInput'),
  mobileSearchInput: document.getElementById('mobileSearchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  clearCatalogSearchBtn: document.getElementById('clearCatalogSearchBtn'),
  navCartCount: document.getElementById('navCartCount'),
  cartTriggerBtn: document.getElementById('cartTriggerBtn'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mobileNav: document.getElementById('mobileNav'),
  heroCartBtn: document.getElementById('heroCartBtn'),
  heroCartCount: document.getElementById('heroCartCount'),
  
  // Catalog controls
  categoryFilters: document.getElementById('categoryFilters'),
  sortSelect: document.getElementById('sortSelect'),
  productCountBadge: document.getElementById('productCountBadge'),
  activeFilterIndicator: document.getElementById('activeFilterIndicator'),
  activeFilterTags: document.getElementById('activeFilterTags'),
  resetAllFiltersBtn: document.getElementById('resetAllFiltersBtn'),

  // Category counts
  countCatAll: document.getElementById('countCatAll'),
  countCatElectronics: document.getElementById('countCatElectronics'),
  countCatJewelery: document.getElementById('countCatJewelery'),
  countCatMens: document.getElementById('countCatMens'),
  countCatWomens: document.getElementById('countCatWomens'),

  // Load More / Pagination
  loadMoreContainer: document.getElementById('loadMoreContainer'),
  loadMoreInfo: document.getElementById('loadMoreInfo'),
  loadMoreBarFill: document.getElementById('loadMoreBarFill'),
  loadMoreBtn: document.getElementById('loadMoreBtn'),
  showAllProductsBtn: document.getElementById('showAllProductsBtn'),
  
  // Views
  productGrid: document.getElementById('productGrid'),
  loadingContainer: document.getElementById('loadingContainer'),
  skeletonGrid: document.getElementById('skeletonGrid'),
  errorContainer: document.getElementById('errorContainer'),
  errorMessage: document.getElementById('errorMessage'),
  retryFetchBtn: document.getElementById('retryFetchBtn'),
  loadFallbackBtn: document.getElementById('loadFallbackBtn'),
  emptyResults: document.getElementById('emptyResults'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  
  // Drawer & Overlays
  drawerOverlay: document.getElementById('drawerOverlay'),
  cartDrawer: document.getElementById('cartDrawer'),
  closeCartBtn: document.getElementById('closeCartBtn'),
  cartHeaderCount: document.getElementById('cartHeaderCount'),
  cartBody: document.getElementById('cartBody'),
  cartFooter: document.getElementById('cartFooter'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartShipping: document.getElementById('cartShipping'),
  cartTax: document.getElementById('cartTax'),
  cartTotal: document.getElementById('cartTotal'),
  shippingProgressBox: document.getElementById('shippingProgressBox'),
  shippingProgressText: document.getElementById('shippingProgressText'),
  shippingProgressBar: document.getElementById('shippingProgressBar'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  clearCartBtn: document.getElementById('clearCartBtn'),
  
  // Checkout Modal
  checkoutModal: document.getElementById('checkoutModal'),
  closeCheckoutBtn: document.getElementById('closeCheckoutBtn'),
  backToCartBtn: document.getElementById('backToCartBtn'),
  checkoutForm: document.getElementById('checkoutForm'),
  checkoutItemsList: document.getElementById('checkoutItemsList'),
  checkoutItemsCount: document.getElementById('checkoutItemsCount'),
  checkoutSubtotal: document.getElementById('checkoutSubtotal'),
  checkoutShipping: document.getElementById('checkoutShipping'),
  checkoutTax: document.getElementById('checkoutTax'),
  checkoutGrandTotal: document.getElementById('checkoutGrandTotal'),
  checkoutSubmitTotal: document.getElementById('checkoutSubmitTotal'),
  
  // Confirmation Modal
  confirmationModal: document.getElementById('confirmationModal'),
  continueShoppingBtn: document.getElementById('continueShoppingBtn'),
  confOrderId: document.getElementById('confOrderId'),
  confCustName: document.getElementById('confCustName'),
  confCustEmail: document.getElementById('confCustEmail'),
  confAddress: document.getElementById('confAddress'),
  confDeliveryDate: document.getElementById('confDeliveryDate'),
  confGrandTotal: document.getElementById('confGrandTotal'),
  
  // Quick View Modal
  quickViewModal: document.getElementById('quickViewModal'),
  closeQuickViewBtn: document.getElementById('closeQuickViewBtn'),
  quickViewContent: document.getElementById('quickViewContent'),
  
  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// =============================================================================
// 3. INITIALIZATION & LIFECYCLE
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // 1. Restore persistent cart from LocalStorage
  loadCartFromStorage();
  
  // 2. Setup all UI Event Listeners
  setupEventListeners();
  
  // 3. Fetch categories & products from FakeStoreAPI
  fetchCategories();
  await fetchProducts();
}

/**
 * Fetch categories dynamically from FakeStoreAPI
 */
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        AppState.categories = data;
      }
    }
  } catch (err) {
    console.warn("Categories fetch fallback:", err.message);
    AppState.categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];
  }
}

// =============================================================================
// 4. API INTEGRATION & DATA FETCHING
// =============================================================================

/**
 * Fetch product list from FakeStoreAPI with timeout and fallback
 * Combines live FakeStoreAPI with extended catalog so customers enjoy 50+ rich choices
 */
async function fetchProducts() {
  setLoadingState(true);
  clearErrorState();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Received empty or invalid product list from server.");
    }

    // Set master products: Live FakeStoreAPI (20 items) + Curated Extended Catalog (32 items)
    AppState.products = [...data, ...EXTENDED_CATALOG_PRODUCTS];
    updateCategoryBadges();
    showToast(`Loaded ${AppState.products.length} products (FakeStoreAPI + Extended Catalog)`, 'success');
  } catch (err) {
    console.warn("FakeStoreAPI live fetch failed or network unavailable:", err.message);
    
    // Auto fallback to high-fidelity built-in catalog + extended catalog (52 items)
    AppState.products = [...FALLBACK_PRODUCTS, ...EXTENDED_CATALOG_PRODUCTS];
    updateCategoryBadges();
    showToast(`Loaded ${AppState.products.length} products in offline catalog mode`, 'info');
  } finally {
    setLoadingState(false);
    filterAndSortProducts();
  }
}

/**
 * Dynamically updates count badges in the category filter pills
 */
function updateCategoryBadges() {
  const allCount = AppState.products.length;
  const elecCount = AppState.products.filter(p => normalizeCategory(p.category) === 'electronics').length;
  const jewCount = AppState.products.filter(p => normalizeCategory(p.category) === 'jewelery').length;
  const menCount = AppState.products.filter(p => normalizeCategory(p.category) === "men's clothing").length;
  const womenCount = AppState.products.filter(p => normalizeCategory(p.category) === "women's clothing").length;

  if (DOM.countCatAll) DOM.countCatAll.textContent = allCount;
  if (DOM.countCatElectronics) DOM.countCatElectronics.textContent = elecCount;
  if (DOM.countCatJewelery) DOM.countCatJewelery.textContent = jewCount;
  if (DOM.countCatMens) DOM.countCatMens.textContent = menCount;
  if (DOM.countCatWomens) DOM.countCatWomens.textContent = womenCount;
}

function setLoadingState(isLoading) {
  AppState.isLoading = isLoading;
  if (isLoading) {
    if (DOM.loadingContainer) DOM.loadingContainer.classList.remove('hidden');
    DOM.productGrid.classList.add('hidden');
    DOM.emptyResults.classList.add('hidden');
    DOM.errorContainer.classList.add('hidden');
  } else {
    if (DOM.loadingContainer) DOM.loadingContainer.classList.add('hidden');
    DOM.productGrid.classList.remove('hidden');
  }
}

function setErrorState(message) {
  AppState.error = message;
  if (DOM.loadingContainer) DOM.loadingContainer.classList.add('hidden');
  DOM.productGrid.classList.add('hidden');
  DOM.emptyResults.classList.add('hidden');
  DOM.errorContainer.classList.remove('hidden');
  DOM.errorMessage.textContent = message;
}

function clearErrorState() {
  AppState.error = null;
  DOM.errorContainer.classList.add('hidden');
}

// =============================================================================
// 5. PRODUCT FILTERING, SEARCHING & SORTING
// =============================================================================

/**
 * Advanced Multi-Term & Keyword Search Matcher
 * Matches all search tokens against title, category, and description.
 * Supports plurals, singulars, and common synonyms.
 */
function searchMatchesProduct(product, query) {
  if (!query || query.trim() === '') return true;

  const cleanQuery = query.toLowerCase().trim();
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const title = (product.title || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const corpus = `${title} ${category} ${desc}`;

  return tokens.every(token => {
    // 1. Direct substring match
    if (corpus.includes(token)) return true;

    // 2. Singular / Plural variation
    if (token.endsWith('s') && corpus.includes(token.slice(0, -1))) return true;
    if (!token.endsWith('s') && corpus.includes(token + 's')) return true;

    // 3. Gender / Clothing synonyms
    if ((token === 'men' || token === 'mens') && (corpus.includes("men's") || corpus.includes('mens') || corpus.includes('men'))) return true;
    if ((token === 'women' || token === 'womens') && (corpus.includes("women's") || corpus.includes('womens') || corpus.includes('women'))) return true;

    // 4. Jewelry / Jewelery synonym
    if ((token === 'jewelry' || token === 'jewelery') && (corpus.includes('jewelery') || corpus.includes('jewelry') || corpus.includes('gold') || corpus.includes('ring') || corpus.includes('bracelet') || corpus.includes('necklace') || corpus.includes('diamond'))) return true;

    // 5. Watch / Watches
    if ((token === 'watch' || token === 'watches') && (corpus.includes('watch') || corpus.includes('smartwatch'))) return true;

    // 6. Headphone / Headphones / Audio
    if ((token === 'headphone' || token === 'headphones') && (corpus.includes('headphone') || corpus.includes('earbud') || corpus.includes('earbuds') || corpus.includes('audio'))) return true;

    // 7. Shirt / Shirts / Tee / T-Shirt
    if ((token === 'shirt' || token === 'shirts') && (corpus.includes('shirt') || corpus.includes('tee') || corpus.includes('t-shirt'))) return true;

    // 8. Jacket / Coat / Outerwear
    if ((token === 'jacket' || token === 'coat') && (corpus.includes('jacket') || corpus.includes('coat') || corpus.includes('windbreaker') || corpus.includes('blazer') || corpus.includes('parka') || corpus.includes('bomber'))) return true;

    // 9. Pants / Trousers / Chinos
    if ((token === 'pants' || token === 'trousers' || token === 'pant') && (corpus.includes('pants') || corpus.includes('trousers') || corpus.includes('chino') || corpus.includes('overalls') || corpus.includes('leggings'))) return true;

    // 10. Sweater / Hoodie / Pullover
    if ((token === 'sweater' || token === 'hoodie' || token === 'pullover') && (corpus.includes('sweater') || corpus.includes('hoodie') || corpus.includes('pullover') || corpus.includes('cardigan') || corpus.includes('turtleneck') || corpus.includes('fleece'))) return true;

    // 11. Tablet / iPad
    if ((token === 'tablet' || token === 'ipad') && (corpus.includes('ipad') || corpus.includes('tablet') || corpus.includes('e-reader') || corpus.includes('kindle'))) return true;

    // 12. Microphone / Mic
    if ((token === 'mic' || token === 'microphone') && (corpus.includes('microphone') || corpus.includes('audio') || corpus.includes('podcast'))) return true;

    // 13. Ring / Rings
    if ((token === 'ring' || token === 'rings') && (corpus.includes('ring') || corpus.includes('band') || corpus.includes('signet'))) return true;

    // 14. Earrings / Earring
    if ((token === 'earring' || token === 'earrings') && (corpus.includes('earring') || corpus.includes('stud') || corpus.includes('hoop') || corpus.includes('huggie'))) return true;

    return false;
  });
}

/**
 * Filters and sorts master products according to selectedCategory, searchQuery, and sortBy
 */
function filterAndSortProducts() {
  let result = [...AppState.products];

  // 1. Search Query Filter across entire catalog
  const query = AppState.searchQuery.trim();
  let matchingProducts = result;
  
  if (query !== '') {
    matchingProducts = result.filter(item => searchMatchesProduct(item, query));
  }

  // 2. Category Filter with Cross-Category Intelligence
  let crossCategoryFallback = false;
  if (AppState.selectedCategory && AppState.selectedCategory !== 'all') {
    const targetCat = normalizeCategory(AppState.selectedCategory);
    const inCat = matchingProducts.filter(item => normalizeCategory(item.category) === targetCat);

    if (inCat.length > 0 || query === '') {
      result = inCat;
    } else {
      // If no matches in active category, but matches exist in other categories:
      if (matchingProducts.length > 0) {
        result = matchingProducts;
        crossCategoryFallback = true;
      } else {
        result = [];
      }
    }
  } else {
    result = matchingProducts;
  }

  // 3. Sorting Options
  switch (AppState.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      break;
    case 'name-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'default':
    default:
      // Preserves original order / ID
      result.sort((a, b) => a.id - b.id);
      break;
  }

  AppState.filteredProducts = result;
  AppState.isCrossCategoryActive = crossCategoryFallback;
  renderProductGrid();
  renderFilterIndicator();
}

/**
 * Updates UI active filter tags indicator
 */
function renderFilterIndicator() {
  const hasCategory = AppState.selectedCategory !== 'all';
  const hasSearch = AppState.searchQuery.trim().length > 0;
  const isCrossCat = AppState.isCrossCategoryActive;

  if (hasCategory || hasSearch || isCrossCat) {
    DOM.activeFilterIndicator.classList.remove('hidden');
    let tagsHTML = '';

    if (hasCategory && !isCrossCat) {
      tagsHTML += `
        <span class="filter-tag-pill">
          Category: <strong>${formatCategory(AppState.selectedCategory)}</strong>
          <button onclick="setCategory('all')" title="Clear category filter">&times;</button>
        </span>
      `;
    }

    if (hasSearch) {
      tagsHTML += `
        <span class="filter-tag-pill">
          Search: <strong>"${escapeHTML(AppState.searchQuery)}"</strong>
          <button onclick="clearSearch()" title="Clear search query">&times;</button>
        </span>
      `;
    }

    if (isCrossCat) {
      tagsHTML += `
        <span class="filter-tag-pill" style="background:#fef3c7; border-color:#fde68a; color:#92400e;">
          💡 Found ${AppState.filteredProducts.length} results in other categories (None in ${formatCategory(AppState.selectedCategory)})
          <button onclick="setCategory('all')" title="Switch to All Products" style="color:#b45309; text-decoration:underline; font-weight:700; margin-left:0.25rem;">View All</button>
        </span>
      `;
    }

    DOM.activeFilterTags.innerHTML = tagsHTML;
  } else {
    DOM.activeFilterIndicator.classList.add('hidden');
    DOM.activeFilterTags.innerHTML = '';
  }
}

// =============================================================================
// 6. DYNAMIC UI RENDERING
// =============================================================================

/**
 * Render the product catalog cards into the CSS Grid container
 */
function renderProductGrid() {
  const totalMatches = AppState.filteredProducts.length;

  // Handle empty state
  if (totalMatches === 0) {
    DOM.productCountBadge.innerHTML = `Showing <span>0</span> products`;
    DOM.productGrid.innerHTML = '';
    DOM.emptyResults.classList.remove('hidden');
    if (DOM.loadMoreContainer) DOM.loadMoreContainer.classList.add('hidden');
    return;
  }

  DOM.emptyResults.classList.add('hidden');

  // Slice products according to displayLimit
  const displayedProducts = AppState.filteredProducts.slice(0, AppState.displayLimit);

  // Update product count label
  DOM.productCountBadge.innerHTML = `Showing <span>${displayedProducts.length}</span> of <span>${totalMatches}</span> ${totalMatches === 1 ? 'product' : 'products'}`;

  // Build grid HTML
  DOM.productGrid.innerHTML = displayedProducts.map(product => {
    const ratingRate = product.rating ? product.rating.rate : 0;
    const ratingCount = product.rating ? product.rating.count : 0;
    const starsHTML = generateStarsHTML(ratingRate);
    const inCartQty = getCartItemQuantity(product.id);

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-img-wrap" onclick="openQuickView(${product.id})">
          <span class="card-category-tag">${formatCategory(product.category)}</span>
          <img 
            src="${product.image}" 
            alt="${escapeHTML(product.title)}" 
            class="product-img" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';"
          />
          <button class="quickview-badge-btn" type="button" aria-label="Quick preview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Quick View
          </button>
        </div>

        <div class="card-body">
          <div class="card-rating-row">
            <div class="stars-outer" title="${ratingRate} out of 5 stars">${starsHTML}</div>
            <span class="rating-number">${ratingRate.toFixed(1)}</span>
            <span class="rating-reviews">(${ratingCount})</span>
          </div>

          <h3 class="card-title" title="${escapeHTML(product.title)}" onclick="openQuickView(${product.id})">
            ${escapeHTML(product.title)}
          </h3>

          <div class="card-footer-row">
            <div class="card-price">$${product.price.toFixed(2)}</div>
            <button 
              class="card-add-btn ${inCartQty > 0 ? 'added' : ''}" 
              id="add-btn-${product.id}"
              onclick="addToCart(${product.id})"
              aria-label="Add ${escapeHTML(product.title)} to cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>${inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Update Load More / Pagination Controls
  if (DOM.loadMoreContainer) {
    if (totalMatches > AppState.displayLimit) {
      DOM.loadMoreContainer.classList.remove('hidden');
      DOM.loadMoreInfo.textContent = `Showing ${displayedProducts.length} of ${totalMatches} products`;
      const progressPercent = Math.round((displayedProducts.length / totalMatches) * 100);
      DOM.loadMoreBarFill.style.width = `${progressPercent}%`;
      const remaining = totalMatches - displayedProducts.length;
      DOM.loadMoreBtn.querySelector('span').textContent = `Load More Products (${remaining} remaining)`;
    } else {
      DOM.loadMoreContainer.classList.add('hidden');
    }
  }
}

/**
 * Generate star rating HTML
 */
function generateStarsHTML(rate) {
  let stars = '';
  const rounded = Math.round(rate);
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars += '★';
    } else {
      stars += '☆';
    }
  }
  return stars;
}

// =============================================================================
// 7. SHOPPING CART ENGINE & CALCULATIONS
// =============================================================================

/**
 * Add product to cart or increase quantity if already present
 * Required signature: addToCart(productId)
 */
function addToCart(productId) {
  if (productId === undefined || productId === null) {
    if (AppState.products.length > 0) {
      productId = AppState.products[0].id;
    } else {
      console.warn("addToCart called with no products available.");
      return;
    }
  }

  const id = typeof productId === 'object' && productId.id !== undefined ? Number(productId.id) : Number(productId);
  const product = AppState.products.find(p => p.id === id);
  if (!product) {
    console.error(`Product with ID ${id} not found.`);
    return;
  }

  const existingItem = AppState.cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + 1, 99);
    showToast(`Updated quantity for "${truncate(product.title, 25)}" (${existingItem.quantity})`, 'info');
  } else {
    AppState.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
    showToast(`Added "${truncate(product.title, 25)}" to cart!`, 'success');
  }

  // Update button state temporarily for snappy visual feedback
  const btn = document.getElementById(`add-btn-${product.id}`);
  if (btn) {
    const currentQty = getCartItemQuantity(product.id);
    btn.classList.add('added');
    const span = btn.querySelector('span');
    if (span) span.textContent = `In Cart (${currentQty})`;
  }

  // Sync state & render
  syncCart();
}

/**
 * Remove an item completely from the cart
 * Required signature: removeFromCart(productId)
 */
function removeFromCart(productId) {
  const id = typeof productId === 'object' && productId.id !== undefined ? Number(productId.id) : Number(productId);
  const itemIndex = AppState.cart.findIndex(item => item.id === id);

  if (itemIndex > -1) {
    const removedItem = AppState.cart[itemIndex];
    AppState.cart.splice(itemIndex, 1);
    showToast(`Removed "${truncate(removedItem.title, 25)}" from cart`, 'info');
    syncCart();
    renderProductGrid(); // update card button badge
  }
}

/**
 * Update quantity of a cart item with boundary check
 * Required signature: updateQuantity(productId, newQty)
 */
function updateQuantity(productId, newQty) {
  const id = typeof productId === 'object' && productId.id !== undefined ? Number(productId.id) : Number(productId);
  const qty = parseInt(newQty, 10);
  const item = AppState.cart.find(item => item.id === id);

  if (!item) return;

  if (isNaN(qty) || qty <= 0) {
    // Automatically remove item when quantity hits zero or invalid
    removeFromCart(id);
    return;
  }

  // Maximum cap of 99 items per line item
  item.quantity = Math.min(qty, 99);
  syncCart();
  renderProductGrid();
}

/**
 * Dynamically calculate Subtotal, Shipping, Tax, and Grand Total
 * Required signature: calculateTotal()
 */
function calculateTotal() {
  const subtotal = Math.round(AppState.cart.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity));
  }, 0) * 100) / 100;

  // Free shipping over $50 threshold, otherwise flat $5.00 (or $0 if cart empty)
  let shipping = 0;
  if (subtotal > 0) {
    shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  }

  // 8% dynamic tax calculation
  const tax = subtotal > 0 ? (Math.round(subtotal * TAX_RATE * 100) / 100) : 0;
  const grandTotal = Math.round((subtotal + shipping + tax) * 100) / 100;

  const totalQuantity = AppState.cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  return {
    subtotal,
    shipping,
    tax,
    grandTotal,
    totalQuantity
  };
}

/**
 * Synchronize cart state with LocalStorage, DOM labels and badge counters
 */
function syncCart() {
  saveCartToStorage();
  renderCartDrawer();
  updateCartCounters();
}

/**
 * Update badge counters in the navbar and hero
 */
function updateCartCounters() {
  const totals = calculateTotal();
  DOM.navCartCount.textContent = totals.totalQuantity;
  DOM.heroCartCount.textContent = totals.totalQuantity;
  DOM.cartHeaderCount.textContent = `${totals.totalQuantity} ${totals.totalQuantity === 1 ? 'item' : 'items'}`;

  // Pulse animation on badge
  DOM.navCartCount.style.transform = 'scale(1.3)';
  setTimeout(() => {
    DOM.navCartCount.style.transform = 'scale(1)';
  }, 200);
}

/**
 * Render items inside the slide-out cart drawer
 */
function renderCartDrawer() {
  const totals = calculateTotal();

  // If cart is empty
  if (AppState.cart.length === 0) {
    DOM.cartBody.innerHTML = `
      <div class="cart-empty-view">
        <div class="cart-empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h3 class="cart-empty-title">Your Cart is Empty</h3>
        <p class="cart-empty-desc">Looks like you haven't added anything to your cart yet. Explore our collection!</p>
        <button class="btn btn-primary" onclick="closeCart(); location.href='#products-section';">Start Shopping</button>
      </div>
    `;

    // Disable checkout button when empty
    DOM.cartFooter.style.display = 'none';
    DOM.shippingProgressBox.style.display = 'none';
    return;
  }

  // Cart has items: show footer & shipping tracker
  DOM.cartFooter.style.display = 'block';
  DOM.shippingProgressBox.style.display = 'block';

  // Shipping progress indicator
  if (totals.subtotal >= FREE_SHIPPING_THRESHOLD) {
    DOM.shippingProgressText.innerHTML = `🎉 You qualify for <strong>FREE Express Shipping!</strong>`;
    DOM.shippingProgressBar.style.width = '100%';
  } else {
    const diff = (FREE_SHIPPING_THRESHOLD - totals.subtotal).toFixed(2);
    const progressPercent = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    DOM.shippingProgressText.innerHTML = `Add <strong>$${diff}</strong> more to unlock <strong>FREE Shipping!</strong>`;
    DOM.shippingProgressBar.style.width = `${progressPercent}%`;
  }

  // Render items list
  DOM.cartBody.innerHTML = AppState.cart.map(item => {
    const lineTotal = (item.price * item.quantity).toFixed(2);

    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img-box">
          <img src="${item.image}" alt="${escapeHTML(item.title)}" class="cart-item-img" />
        </div>

        <div class="cart-item-info">
          <span class="cart-item-category">${formatCategory(item.category)}</span>
          <h4 class="cart-item-title" title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</h4>
          <span class="cart-item-unit-price">$${item.price.toFixed(2)} each</span>

          <div class="cart-qty-controls">
            <button 
              class="qty-btn" 
              onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
              aria-label="Decrease quantity"
            >&minus;</button>
            <span class="qty-value">${item.quantity}</span>
            <button 
              class="qty-btn" 
              onclick="updateQuantity(${item.id}, ${item.quantity + 1})"
              aria-label="Increase quantity"
            >&plus;</button>
          </div>
        </div>

        <div class="cart-item-right">
          <span class="cart-item-total">$${lineTotal}</span>
          <button 
            class="cart-remove-btn" 
            onclick="removeFromCart(${item.id})"
            aria-label="Remove ${escapeHTML(item.title)}"
            title="Remove item"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Update summary breakdown
  DOM.cartSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
  DOM.cartShipping.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
  DOM.cartTax.textContent = `$${totals.tax.toFixed(2)}`;
  DOM.cartTotal.textContent = `$${totals.grandTotal.toFixed(2)}`;
}

/**
 * Slide out the cart drawer
 * Required signature: openCart()
 */
function openCart() {
  AppState.isCartOpen = true;
  DOM.cartDrawer.classList.add('open');
  DOM.drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent scrolling background
}

/**
 * Close the cart drawer
 * Required signature: closeCart()
 */
function closeCart() {
  AppState.isCartOpen = false;
  DOM.cartDrawer.classList.remove('open');
  if (!AppState.isCheckoutOpen && !AppState.isQuickViewOpen) {
    DOM.drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Empty the entire cart
 */
function clearCart() {
  if (AppState.cart.length === 0) return;
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    AppState.cart = [];
    syncCart();
    renderProductGrid();
    showToast('Cart cleared', 'info');
  }
}

/**
 * Get item quantity in cart
 */
function getCartItemQuantity(productId) {
  const item = AppState.cart.find(i => i.id === Number(productId));
  return item ? item.quantity : 0;
}

// =============================================================================
// 8. LOCALSTORAGE PERSISTENCE
// =============================================================================

function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(AppState.cart));
  } catch (err) {
    console.warn("Could not save cart to LocalStorage:", err);
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CART);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        AppState.cart = parsed.filter(item => 
          item && 
          item.id !== undefined && 
          typeof item.price === 'number' && 
          !isNaN(item.price) &&
          item.quantity > 0
        ).map(item => ({
          id: Number(item.id),
          title: String(item.title || 'Product'),
          price: Number(item.price),
          image: String(item.image || ''),
          category: String(item.category || ''),
          quantity: Math.min(Math.max(1, parseInt(item.quantity, 10) || 1), 99)
        }));
      }
    }
  } catch (err) {
    console.warn("Could not load cart from LocalStorage:", err);
    AppState.cart = [];
  }
  updateCartCounters();
}

// =============================================================================
// 9. CHECKOUT PROCESS & VALIDATION
// =============================================================================

/**
 * Open the checkout modal with dynamic order summary
 */
function openCheckout() {
  if (AppState.cart.length === 0) {
    showToast('Your cart is empty! Add products first.', 'danger');
    return;
  }

  // Smooth transition from drawer to modal
  AppState.isCartOpen = false;
  DOM.cartDrawer.classList.remove('open');

  AppState.isCheckoutOpen = true;
  DOM.checkoutModal.classList.remove('hidden');
  DOM.drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  renderCheckoutSummary();
}

/**
 * Close checkout modal
 */
function closeCheckout() {
  AppState.isCheckoutOpen = false;
  DOM.checkoutModal.classList.add('hidden');
  DOM.drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Render items & pricing inside the checkout modal
 */
function renderCheckoutSummary() {
  const totals = calculateTotal();

  DOM.checkoutItemsCount.textContent = `${totals.totalQuantity} items`;
  DOM.checkoutSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
  DOM.checkoutShipping.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
  DOM.checkoutTax.textContent = `$${totals.tax.toFixed(2)}`;
  DOM.checkoutGrandTotal.textContent = `$${totals.grandTotal.toFixed(2)}`;
  DOM.checkoutSubmitTotal.textContent = `$${totals.grandTotal.toFixed(2)}`;

  DOM.checkoutItemsList.innerHTML = AppState.cart.map(item => `
    <div class="checkout-item-row">
      <img src="${item.image}" alt="${escapeHTML(item.title)}" class="checkout-item-thumb" />
      <div style="min-width: 0;">
        <h5 class="checkout-item-title">${escapeHTML(item.title)}</h5>
        <div class="checkout-item-meta">Qty: ${item.quantity} &times; $${item.price.toFixed(2)}</div>
      </div>
      <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');
}

/**
 * Handle checkout form submission with field validation
 */
function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (AppState.cart.length === 0) {
    showToast('Cannot complete checkout with an empty cart.', 'danger');
    closeCheckout();
    return;
  }

  const nameInput = document.getElementById('custName');
  const emailInput = document.getElementById('custEmail');
  const phoneInput = document.getElementById('custPhone');
  const addressInput = document.getElementById('custAddress');
  const cityInput = document.getElementById('custCity');
  const zipInput = document.getElementById('custZip');

  let isValid = true;

  // Validate Name (at least 2 non-whitespace characters)
  if (!nameInput.value || nameInput.value.trim().length < 2) {
    setFieldError(nameInput, true);
    isValid = false;
  } else {
    setFieldError(nameInput, false);
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value || !emailRegex.test(emailInput.value.trim())) {
    setFieldError(emailInput, true);
    isValid = false;
  } else {
    setFieldError(emailInput, false);
  }

  // Validate Phone (at least 7 digits)
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  if (!phoneInput.value || phoneDigits.length < 7) {
    setFieldError(phoneInput, true);
    isValid = false;
  } else {
    setFieldError(phoneInput, false);
  }

  // Validate Address
  if (!addressInput.value || addressInput.value.trim().length < 5) {
    setFieldError(addressInput, true);
    isValid = false;
  } else {
    setFieldError(addressInput, false);
  }

  // Validate City
  if (!cityInput.value || cityInput.value.trim().length < 2) {
    setFieldError(cityInput, true);
    isValid = false;
  } else {
    setFieldError(cityInput, false);
  }

  // Validate ZIP
  if (!zipInput.value || zipInput.value.trim().length < 3) {
    setFieldError(zipInput, true);
    isValid = false;
  } else {
    setFieldError(zipInput, false);
  }

  if (!isValid) {
    showToast('Please fix the highlighted form errors.', 'danger');
    return;
  }

  // Successful checkout!
  const totals = calculateTotal();
  const customerName = nameInput.value.trim();
  const customerEmail = emailInput.value.trim();
  const deliveryAddress = `${addressInput.value.trim()}, ${cityInput.value.trim()} ${zipInput.value.trim()}`;

  // Generate random order ID (e.g. ORD-2026-98124)
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const randomOrderRef = `ORD-2026-${randomSuffix}`;

  // Calculate estimated delivery: 3 to 5 business days
  const deliveryEst = getEstimatedDeliveryDate(4);

  // Close checkout modal
  closeCheckout();

  // Populate confirmation modal
  DOM.confOrderId.textContent = randomOrderRef;
  DOM.confCustName.textContent = customerName;
  DOM.confCustEmail.textContent = customerEmail;
  DOM.confAddress.textContent = deliveryAddress;
  DOM.confDeliveryDate.textContent = deliveryEst;
  DOM.confGrandTotal.textContent = `$${totals.grandTotal.toFixed(2)}`;

  // Clear cart and local storage
  AppState.cart = [];
  syncCart();
  renderProductGrid();

  // Reset form
  DOM.checkoutForm.reset();
  clearAllFieldErrors();

  // Open confirmation modal
  openConfirmation();
}

function setFieldError(inputEl, isError) {
  const group = inputEl.closest('.form-group');
  if (group) {
    if (isError) {
      group.classList.add('has-error');
    } else {
      group.classList.remove('has-error');
    }
  }
}

function clearAllFieldErrors() {
  document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
}

function openConfirmation() {
  DOM.confirmationModal.classList.remove('hidden');
  DOM.drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeConfirmation() {
  DOM.confirmationModal.classList.add('hidden');
  DOM.drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function getEstimatedDeliveryDate(daysToAdd) {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// =============================================================================
// 10. PRODUCT QUICK VIEW MODAL
// =============================================================================

function openQuickView(productId) {
  const product = AppState.products.find(p => p.id === Number(productId));
  if (!product) return;

  AppState.isQuickViewOpen = true;
  AppState.quickViewItem = product;

  const ratingRate = product.rating ? product.rating.rate : 0;
  const ratingCount = product.rating ? product.rating.count : 0;
  const starsHTML = generateStarsHTML(ratingRate);
  const currentInCart = getCartItemQuantity(product.id);

  DOM.quickViewContent.innerHTML = `
    <div class="quickview-img-box">
      <img src="${product.image}" alt="${escapeHTML(product.title)}" />
    </div>
    <div class="quickview-details">
      <span class="quickview-category">${formatCategory(product.category)}</span>
      <h2 class="quickview-title">${escapeHTML(product.title)}</h2>
      <div class="card-rating-row">
        <div class="stars-outer">${starsHTML}</div>
        <span class="rating-number">${ratingRate.toFixed(1)}</span>
        <span class="rating-reviews">(${ratingCount} customer reviews)</span>
      </div>
      <div class="quickview-price">$${product.price.toFixed(2)}</div>
      <p class="quickview-desc">${escapeHTML(product.description || 'Premium quality verified item.')}</p>

      <div class="quickview-actions">
        <button class="btn btn-primary btn-lg" onclick="addToCart(${product.id}); closeQuickView(); openCart();">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Add to Cart &bull; $${product.price.toFixed(2)}</span>
        </button>
      </div>
      ${currentInCart > 0 ? `<div style="font-size: 0.8125rem; color: var(--primary); font-weight: 600;">Currently in your cart: ${currentInCart}</div>` : ''}
    </div>
  `;

  DOM.quickViewModal.classList.remove('hidden');
  DOM.drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  AppState.isQuickViewOpen = false;
  AppState.quickViewItem = null;
  DOM.quickViewModal.classList.add('hidden');
  if (!AppState.isCartOpen && !AppState.isCheckoutOpen) {
    DOM.drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// =============================================================================
// 11. EVENT LISTENERS SETUP
// =============================================================================

function setupEventListeners() {
  // 1. Cart triggers
  DOM.cartTriggerBtn.addEventListener('click', openCart);
  DOM.closeCartBtn.addEventListener('click', closeCart);
  DOM.heroCartBtn.addEventListener('click', openCart);
  DOM.clearCartBtn.addEventListener('click', clearCart);

  // 2. Checkout triggers
  DOM.checkoutBtn.addEventListener('click', openCheckout);
  DOM.closeCheckoutBtn.addEventListener('click', closeCheckout);
  DOM.backToCartBtn.addEventListener('click', () => {
    closeCheckout();
    openCart();
  });
  DOM.checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  // 3. Confirmation modal
  DOM.continueShoppingBtn.addEventListener('click', closeConfirmation);

  // 4. Quick View triggers
  DOM.closeQuickViewBtn.addEventListener('click', closeQuickView);

  // 5. Drawer overlay click to dismiss
  DOM.drawerOverlay.addEventListener('click', () => {
    if (AppState.isCartOpen) closeCart();
    if (AppState.isCheckoutOpen) closeCheckout();
    if (AppState.isQuickViewOpen) closeQuickView();
    closeConfirmation();
  });

  // 6. Keyboard accessibility (Escape key closes modals)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (AppState.isQuickViewOpen) closeQuickView();
      else if (AppState.isCheckoutOpen) closeCheckout();
      else if (AppState.isCartOpen) closeCart();
      else closeConfirmation();
    }
  });

  // 7. Category Filter Buttons
  DOM.categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      setCategory(category);
    });
  });

  // Footer category links
  document.querySelectorAll('.footer-cat-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-cat');
      setCategory(cat);
      document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // 8. Search Input (Real-time with debounce & multi-bar synchronization)
  let searchDebounceTimer;
  const handleSearchInput = (value, source = 'navbar') => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      AppState.searchQuery = value;
      AppState.displayLimit = 16; // Reset pagination for fresh search

      // Sync all 3 search inputs (navbar, catalog toolbar, mobile)
      if (DOM.navbarSearchInput && DOM.navbarSearchInput.value !== value) DOM.navbarSearchInput.value = value;
      if (DOM.catalogSearchInput && DOM.catalogSearchInput.value !== value) DOM.catalogSearchInput.value = value;
      if (DOM.mobileSearchInput && DOM.mobileSearchInput.value !== value) DOM.mobileSearchInput.value = value;

      const hasValue = value.trim().length > 0;
      if (DOM.clearSearchBtn) DOM.clearSearchBtn.classList.toggle('hidden', !hasValue);
      if (DOM.clearCatalogSearchBtn) DOM.clearCatalogSearchBtn.classList.toggle('hidden', !hasValue);

      filterAndSortProducts();

      // If typed from navbar while at top of page, scroll down smoothly to show results immediately!
      if (source === 'navbar' && hasValue) {
        const prodSec = document.getElementById('products-section');
        if (prodSec) {
          const rect = prodSec.getBoundingClientRect();
          if (rect.top > 250 || rect.bottom < 100) {
            prodSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }, 150);
  };

  if (DOM.navbarSearchInput) {
    DOM.navbarSearchInput.addEventListener('input', (e) => handleSearchInput(e.target.value, 'navbar'));
  }
  if (DOM.catalogSearchInput) {
    DOM.catalogSearchInput.addEventListener('input', (e) => handleSearchInput(e.target.value, 'catalog'));
  }
  if (DOM.mobileSearchInput) {
    DOM.mobileSearchInput.addEventListener('input', (e) => handleSearchInput(e.target.value, 'mobile'));
  }

  // Handle Enter key on any search input for instant navigation
  [DOM.navbarSearchInput, DOM.catalogSearchInput, DOM.mobileSearchInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          clearTimeout(searchDebounceTimer);
          AppState.searchQuery = inp.value;
          AppState.displayLimit = 16;
          filterAndSortProducts();
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });

  if (DOM.clearSearchBtn) {
    DOM.clearSearchBtn.addEventListener('click', clearSearch);
  }
  if (DOM.clearCatalogSearchBtn) {
    DOM.clearCatalogSearchBtn.addEventListener('click', clearSearch);
  }

  // Load More & Show All Buttons
  if (DOM.loadMoreBtn) {
    DOM.loadMoreBtn.addEventListener('click', () => {
      AppState.displayLimit += 16;
      renderProductGrid();
    });
  }

  if (DOM.showAllProductsBtn) {
    DOM.showAllProductsBtn.addEventListener('click', () => {
      AppState.displayLimit = 9999;
      renderProductGrid();
    });
  }

  // 9. Sorting select dropdown
  DOM.sortSelect.addEventListener('change', (e) => {
    AppState.sortBy = e.target.value;
    filterAndSortProducts();
  });

  // 10. Reset filters buttons
  DOM.clearFiltersBtn.addEventListener('click', resetAllFilters);
  DOM.resetAllFiltersBtn.addEventListener('click', resetAllFilters);

  // 11. Retry API fetch
  DOM.retryFetchBtn.addEventListener('click', () => {
    fetchProducts();
  });

  DOM.loadFallbackBtn.addEventListener('click', () => {
    AppState.products = [...FALLBACK_PRODUCTS, ...EXTENDED_CATALOG_PRODUCTS];
    clearErrorState();
    updateCategoryBadges();
    filterAndSortProducts();
    showToast(`Loaded built-in catalog (${AppState.products.length} products)`, 'info');
  });

  // 12. Mobile hamburger menu
  DOM.mobileMenuBtn.addEventListener('click', () => {
    DOM.mobileMenuBtn.classList.toggle('active');
    DOM.mobileNav.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      DOM.mobileMenuBtn.classList.remove('active');
      DOM.mobileNav.classList.remove('open');
    });
  });

  // 13. FAQ accordion toggle
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('active');
    });
  });
}

// Expose core methods to window for inline onclick handlers and testing
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.calculateTotal = calculateTotal;
window.openCart = openCart;
window.closeCart = closeCart;
window.clearCart = clearCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.setCategory = setCategory;
window.clearSearch = clearSearch;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.fetchProducts = fetchProducts;
window.AppState = AppState;


function setCategory(category) {
  AppState.selectedCategory = category;
  AppState.displayLimit = 16;
  AppState.isCrossCategoryActive = false;

  // Update active pill button style
  DOM.categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
    const btnCat = btn.getAttribute('data-category');
    if (normalizeCategory(btnCat) === normalizeCategory(category)) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  filterAndSortProducts();
}

function normalizeCategory(cat) {
  if (!cat) return '';
  const c = String(cat).toLowerCase().trim();
  if (c === 'jewelry' || c === 'jewelery') return 'jewelery';
  return c;
}

function clearSearch() {
  AppState.searchQuery = '';
  AppState.displayLimit = 16;
  if (DOM.navbarSearchInput) DOM.navbarSearchInput.value = '';
  if (DOM.catalogSearchInput) DOM.catalogSearchInput.value = '';
  if (DOM.mobileSearchInput) DOM.mobileSearchInput.value = '';
  if (DOM.clearSearchBtn) DOM.clearSearchBtn.classList.add('hidden');
  if (DOM.clearCatalogSearchBtn) DOM.clearCatalogSearchBtn.classList.add('hidden');
  filterAndSortProducts();
}

function resetAllFilters() {
  AppState.selectedCategory = 'all';
  AppState.searchQuery = '';
  AppState.sortBy = 'default';
  AppState.displayLimit = 16;
  if (DOM.sortSelect) DOM.sortSelect.value = 'default';
  if (DOM.navbarSearchInput) DOM.navbarSearchInput.value = '';
  if (DOM.catalogSearchInput) DOM.catalogSearchInput.value = '';
  if (DOM.mobileSearchInput) DOM.mobileSearchInput.value = '';
  if (DOM.clearSearchBtn) DOM.clearSearchBtn.classList.add('hidden');
  if (DOM.clearCatalogSearchBtn) DOM.clearCatalogSearchBtn.classList.add('hidden');

  DOM.categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === 'all') {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  filterAndSortProducts();
}

function formatCategory(cat) {
  if (!cat) return '';
  switch (cat.toLowerCase()) {
    case 'electronics': return 'Electronics';
    case 'jewelery': return 'Jewelry';
    case "men's clothing": return "Men's Clothing";
    case "women's clothing": return "Women's Clothing";
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSVG = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  if (type === 'success') {
    iconSVG = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  } else if (type === 'danger') {
    iconSVG = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSVG}</span>
    <span class="toast-msg">${escapeHTML(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}
