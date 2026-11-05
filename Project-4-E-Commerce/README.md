# LUXE Storefront | Modern E-Commerce Product Catalog & Interactive Shopping Cart

A modern, high-performance, responsive e-commerce web application built with **Vanilla JavaScript (ES6+)**, **CSS Grid & Flexbox**, **FakeStoreAPI**, and a **centralized state management architecture** with **LocalStorage persistence**.

---

## 🌟 Features Overview

### 1. Real-time Product API Integration & Extended Curated Catalog
- Fetches real product data from [FakeStoreAPI](https://fakestoreapi.com/products).
- Fetches category metadata from [FakeStoreAPI Categories](https://fakestoreapi.com/products/categories).
- **Enriched 84-Product Selection**: Combines live FakeStoreAPI items with 64 curated, high-resolution catalog products (20–22 items per category: Electronics, Jewelry, Men's Clothing, Women's Clothing) so the store offers an extensive, realistic shopping experience.
- **Category Counts**: Displays live product count badges directly on category tabs (`All (84)`, `Electronics (22)`, `Jewelry (20)`, `Men's Clothing (20)`, `Women's Clothing (22)`).
- **Progressive Pagination / Load More**: Loads 16 products initially with a dynamic progress bar and a "Load More Products" / "View All Products" control.
- Each product card displays:
  - High-resolution product image (rendered cleanly with `object-fit: contain`)
  - Product title with graceful two-line clamping
  - Price formatted in Indian Rupees (`₹XX,XXX.XX`)
  - Product category badge
  - Visual star rating (`★` / `☆`) + numeric score (`4.1`)
  - Total customer review count (e.g. `(259)`)
  - Interactive **Add to Cart** button with active item count state
- Resilient network error handling:
  - Shimmering skeleton loader cards and animated spinner during network requests
  - Graceful fallback to built-in replica catalog if offline or if FakeStoreAPI encounters rate limiting
  - One-click "Retry Connection" button

### 2. Category Filtering & Active State
- Filter pills:
  - **All Products (84)**
  - **Electronics (22)**
  - **Jewelry (20)**
  - **Men's Clothing (20)**
  - **Women's Clothing (22)**
- Selected category highlighted with active pill styling and smooth transitions.
- Interactive filter tags bar displaying current active filters with a one-click "Reset All" action.

### 3. Multi-Term Search Engine & Cross-Category Intelligence
- **Prominent Catalog Search Bar**: Integrated directly into the catalog filter toolbar in addition to the header navbar and mobile menu.
- **Three-Way Synchronization**: Typing in the catalog search bar, navbar, or mobile drawer updates all search boxes simultaneously.
- **Multi-Keyword Matching**: Matches multiple words across product `title`, `description`, and `category` (e.g. searching *"mens jacket"*, *"gold ring"*, *"wireless headphone"*, *"cotton shirt"*, *"laptop bag"*).
- **Plural & Synonym Forgiveness**: Handles plurals and common keyword variations (`jacket`/`jackets`, `watch`/`watches`, `men`/`mens`/`men's`, `women`/`womens`, `shirt`/`shirts`, `jewelry`/`jewelery`).
- **Cross-Category Fallback**: If a query yields 0 results inside an active category filter but exists in other categories, the search engine automatically surfaces matching items with a clear visual notice and a one-click "View All" button.
- **Smooth Auto-Scroll**: Searching from the top navbar automatically smooth-scrolls to the catalog grid so results appear immediately.
- **Instant Clear (`×`)**: Clears search and restores full catalog.
- **Sorting Options**:
  - **Featured / Default**
  - **Price: Low to High**
  - **Price: High to Low**
  - **Highest Rated**
  - **Alphabetical: A - Z**
- Friendly empty state with illustration and reset button when search or filters return zero matches.

### 4. Interactive Slide-out Shopping Cart Drawer
- Smooth slide-out cart drawer from the right edge with a dimmed backdrop overlay (`backdrop-filter: blur(4px)`).
- Cart counter badge on the navbar cart trigger, updating dynamically with pulse animation.
- Dynamic cart calculations:
  - **Subtotal**: Dynamic sum of items (`price * quantity`).
  - **Shipping**: Free shipping on orders over **₹2,999.00**; otherwise flat **₹199.00** fee.
  - **Free Shipping Progress Meter**: Real-time progress bar showing how much more to add to unlock free shipping in INR.
  - **Sales Tax**: Dynamically calculated at **8%**.
  - **Grand Total**: `Subtotal + Shipping + Tax`.
- Cart item actions:
  - Increment quantity (`+`)
  - Decrement quantity (`-`)
  - Automatically removes item when quantity reaches zero
  - Delete / Remove button (trash icon)
  - Clear entire cart button
- **Persistent State**: Cart items, quantities, and totals persist in browser `LocalStorage` across page refreshes.

### 5. Simulated Checkout Modal & Order Confirmation
- Multi-step checkout modal with order summary preview.
- Form fields:
  - Full Name (validated for min 2 characters)
  - Email Address (validated with standard email regex)
  - Phone Number (validated for valid digit length)
  - Delivery Street Address, City, and Postal/ZIP code
- Form validation with clear inline error indicators and error prevention.
- Empty cart protection (disables checkout if cart is empty).
- **Order Confirmation Modal**:
  - Displays unique generated Order Reference ID (e.g., `ORD-2026-84920`)
  - Estimated delivery date calculation (3-5 business days)
  - Summary of customer contact and shipping details
  - Total amount paid
  - Clears cart and resets form automatically

### 6. Product Quick-View Modal
- Clicking any product image or title opens a modal with high-res preview, full product description, ratings, price, and direct "Add to Cart" action.

### 7. Floating Toast Notification System
- Responsive notifications in the bottom-right corner when items are added, updated, removed, or orders placed.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 (Semantic elements: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`) |
| **Styling** | CSS3 (CSS Grid, Flexbox, CSS Custom Properties, Keyframe animations, Backdrop blur) |
| **Scripting** | Vanilla JavaScript (ES6+ Classes, Async/Await, Fetch API, DOM API) |
| **State Management** | Centralized `AppState` store with reactive UI synchronization |
| **Persistence** | Browser `LocalStorage` API |
| **API** | [FakeStoreAPI](https://fakestoreapi.com) |

---

## 📁 Project Structure

```
task-4-Ecommerce/
│
├── index.html        # Main HTML layout, navigation, hero, modals & drawers
├── style.css         # Complete stylesheet with CSS Grid, animations & responsive breakpoints
├── script.js         # State store, API fetch, cart calculations, checkout & event handlers
└── README.md         # Documentation and setup instructions
```

---

## 🚀 How to Run Locally

You can run this project locally without any complex build tools or dependencies.

### Option 1: Direct Browser Launch (Simplest)
1. Navigate to the project folder (`task-4-Ecommerce`).
2. Double-click `index.html` to open it directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).

### Option 2: Using VS Code Live Server
1. Open the `task-4-Ecommerce` directory in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and click **"Open with Live Server"**.
4. The site will launch automatically at `http://127.0.0.1:5500/index.html`.

### Option 3: Using Python HTTP Server
If Python is installed on your computer:
```bash
# In the task-4-Ecommerce directory:
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 4: Using Node.js (npx serve)
If Node.js is installed:
```bash
# In the task-4-Ecommerce directory:
npx serve .
```

---

## 🧪 Testing Verification Checklist

- [x] **Product API Fetching**: Connects to `https://fakestoreapi.com/products` and `https://fakestoreapi.com/products/categories` with automatic fallback to built-in replica catalog if offline.
- [x] **Category Filters**: Clicking "Electronics", "Jewelry", "Men's Clothing", "Women's Clothing", or "All Products" immediately filters products with active styling on the selected tab.
- [x] **Product Search**: Real-time debounced title search with clear button (`×`).
- [x] **Sorting**: Sorts accurately by Price (Low to High / High to Low), Rating (Highest first), and Alphabetical (A to Z).
- [x] **Cart Drawer**: Smooth slide-out animation, items list, and close on overlay click or Esc key.
- [x] **Cart Actions**: Increment (`+`), decrement (`-`), and auto-removal at zero quantity.
- [x] **Calculations**: Accurate subtotal, shipping fee calculation (free shipping on orders >= ₹2,999), 8% tax calculation, and grand total.
- [x] **LocalStorage Persistence**: Add items to cart, refresh page → items, quantities, and totals remain intact.
- [x] **Checkout Validation**: Validates name, email, phone, street address, city, and zip code before accepting order.
- [x] **Order Confirmation**: Displays randomized Order ID, delivery timeline, recipient details, and clears cart upon success.
- [x] **Responsive Layout**: Fluid experience across mobile phones (375px+), tablets (768px+), and large desktop screens (1200px+).

---

## 📋 Core JavaScript API Reference

The following functions are exposed in `script.js` and attached to `window`:

- `addToCart(productId)`: Adds the specified product to the cart or increments its quantity.
- `removeFromCart(productId)`: Completely removes the specified product from the cart.
- `updateQuantity(productId, newQty)`: Updates the quantity of a product. If `newQty <= 0`, removes the item.
- `calculateTotal()`: Computes `{ subtotal, shipping, tax, grandTotal, totalQuantity }`.
- `openCart()`: Opens the slide-out shopping cart drawer and darkens the overlay.
- `closeCart()`: Closes the cart drawer and restores page scrolling.
- `openCheckout()`: Opens the checkout panel/modal with order item breakdown.
- `closeCheckout()`: Closes the checkout modal.
- `setCategory(category)`: Filters the product catalog by category slug.
- `clearSearch()`: Resets the search input and reapplies filters.
- `openQuickView(productId)`: Displays detailed modal preview for a given product.

---

## 📄 License
This project is open-source under the MIT License.

