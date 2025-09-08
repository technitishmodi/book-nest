# 📘 Assignment: Multi-Seller Bookstore App

## 🎯 Objective
The goal of this assignment is to evaluate your ability to build a **multi-seller mobile app** with a **React Native frontend**, **Node.js/Express.js backend**, and **SQL database integration**.  

You will create two main parts:  
- **Storefront (Buyer side)**  
- **Seller Panel (Seller side)**  

---

## 🛠 Tech Stack (Mandatory)
1. **Frontend**: React Native  
2. **Backend**: Node.js with Express.js  
3. **Database**: Any SQL database (MySQL, PostgreSQL, or SQLite)  

---

## 🛒 Buyer Side (Storefront)

1. **Storefront Page (Instagram-like feed)**  
   - Display all products (books) in a scrollable feed layout.  
   - Each product card should include:  
     - Book cover image  
     - Title  
     - Price  
     - Seller name  

2. **Product Page**  
   - Displays:  
     - Book image  
     - Title & description  
     - Price  
     - "Add to Cart" button  

3. **Cart Page**  
   - Displays all products added to the cart with:  
     - Product name  
     - Price  
     - Quantity  
     - Total price  

---

## 🏪 Seller Side (Seller Panel)

1. **Book Listing Page**  
   - Sellers can add new books with:  
     - Title  
     - Description  
     - Price  
     - Stock  
     - Image  
   - Show a list of all books added by the seller.  

2. **Sales Dashboard**  
   - Display list of orders placed by buyers with order details:  
     - Product  
     - Buyer name  
     - Order status  

3. **Order Management**  
   - Seller can update order status:  
     - **Pending → Shipped**  

---

## ⚙️ Backend Requirements

1. **APIs (Node.js + Express.js)** to handle:  
   - Product Management  
   - Cart Management  
   - Order Management  
   - Seller Management  

2. **SQL Database Schema (Suggested Tables)**  
   - **users**: (id, name, role)  
   - **books**: (id, seller_id, title, description, price, stock, image_url)  
   - **cart**: (id, buyer_id, book_id, quantity)  
   - **orders**: (id, buyer_id, seller_id, book_id, status)  

---

## 📦 Deliverables
1. **Frontend (React Native app)**: Storefront pages, Seller panel.  
2. **Backend (Node.js + Express.js)**: REST APIs and SQL schema.  
3. **Instructions to Run**: Setup database, run backend & frontend.  

---

## ⏳ Time Allocation
- Suggested time: **5–7 days**  
- Focus on **clean code, basic UI, and functionality**  

---

## ✅ Evaluation Criteria
1. **Frontend**: React Native navigation, state management, API integration.  
2. **Backend**: CRUD APIs, SQL schema design.  
3. **System Design**: Buyer & Seller role separation.  
4. **Documentation**: Clear instructions to run the project.  
