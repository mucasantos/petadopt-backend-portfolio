# 🐾 PetAdopt Backend API

A robust, enterprise-grade RESTful API designed to power a modern pet adoption platform. Built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and integrated with **Cloudinary** for cloud-based media storage. 

This project is fully refactored to conform to high-quality software engineering standards (production-ready / European standard), featuring automated integration tests, dynamic API documentation, global exception handling, and strict security practices.

---

## 🔗 Live Deployment
* **API URL**: [https://petadopt.onrender.com/](https://petadopt.onrender.com/)
* **Interactive API Documentation (Swagger)**: [https://petadopt.onrender.com/docs](https://petadopt.onrender.com/docs)

---

## ⚡ NestJS Version (Active Development)
To showcase proficiency with modern TypeScript and corporate enterprise architecture, a complete rewrite of this API is under active development using **NestJS** and **TypeScript**.
* This version is hosted in a separate branch: **`nestjs-migration`** (or switch to the branch you are using).
* To explore the NestJS codebase, simply checkout the branch:
  ```bash
  git checkout nestjs-migration
  ```


---

## 🚀 Key Features

* **🔐 Authentication & Authorization**: Secure user registration and authentication powered by **JWT (JSON Web Tokens)** and password hashing with **bcrypt**.
* **🐾 Pet Management**: Full CRUD operations for pet listings including name, breed, age, color, weight, story, category mapping, and verification status.
* **☁️ Cloud Image Upload**: High-performance image upload for user profiles and pet cards directly to **Cloudinary** using memory buffers.
* **📅 Adoption Flow**: Simplified workflow allowing users to schedule visits for pets and conclude adoptions.
* **👨‍💼 Administrative Panel**: Secure backend-rendered admin dashboard using EJS, protected by HTTP-Only secure cookies, for managing pets, verifying listings, and moderating users.
* **📝 Dynamic API Documentation**: Real-time OpenAPI documentation served via Swagger UI at `/docs`.

---

## 🏛️ Architecture & Clean Code

The codebase follows the **MVC (Model-View-Controller)** pattern adapted for RESTful services, keeping a clean separation of concerns:

* **Separation of Infrastructure**: Routes are isolated from business rules. Infrastructure frameworks (like Express and Mongoose ODM) occupy the outermost circle.
* **Dependency Inversion (DIP)**: Third-party services (such as Cloudinary) are encapsulated inside dedicated gateways (`helpers/cloudinary.js`). Controllers consume these abstractions without direct dependency on the SDK setup, making the code testable and modular.
* **Global Exception Filter**: Unhandled errors, syntax errors, and database connection issues are captured by a centralized Express error middleware, preventing system crashes and ensuring standard JSON error responses.

---

## 🛡️ Security & Privacy (GDPR Ready)

* **Environment Secrets**: Zero hardcoded secrets. All sensitive credentials (database links, JWT signatures, Cloudinary keys) are loaded dynamically from environment variables.
* **Secure Cookies**: The administrative panel cookies are configured with `httpOnly: true`, `secure: true` (in production), and `sameSite: 'lax'` to prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
* **Safe Upload Buffer**: Multer is configured to use memory storage (`multer.memoryStorage()`) instead of local disk storage, eliminating temporary file leaks on the hosting server. It includes strict file validation limits (max 5MB, images only).
* **Proxy Safety**: Express is configured to trust reverse proxies (`app.set('trust proxy', true)`), allowing proper protocol detection (`https`) under hosting environments like Render or AWS.

---

## 🧪 Automated Testing Suite

The project features automated integration tests using **Jest** and **Supertest** to validate all authentication, registration, validation rules, and edit profiles workflows.

* **Offline Test Isolation**: External dependencies (like Cloudinary) are automatically mocked using Jest mock factories to ensure tests execute extremely fast, offline, and without consuming API quotas.
* **Isolated Testing Database**: The database connection wrapper automatically routes queries to a dedicated test database (`pet-adopt-test`) when executing under `test` environment to prevent mutating developer data.

To run the test suite:
```bash
npm test
```

---

## 🛠️ Tech Stack

* **Runtime**: Node.js (>=18.17.0)
* **Framework**: Express (v4.x)
* **Database ODM**: Mongoose / MongoDB (v8.x)
* **Security & Tokens**: jsonwebtoken, bcrypt, helmet, cookie-parser
* **Media Upload**: Multer, Cloudinary SDK
* **Testing**: Jest, Supertest
* **Documentation**: swagger-ui-express, swagger-autogen

---

## 🏁 Getting Started

### Prerequisites
* Node.js installed locally.
* A running MongoDB instance (local or MongoDB Atlas).
* A Cloudinary account (for image uploads).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mucasantos/petadopt-backend.git
   cd petadopt-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file at the root of the project using the structure in `envexample`:
   ```env
   DBLINK=mongodb://localhost:27017/pet-adopt
   PORT=3030
   SECRET=your_jwt_signing_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Generate Swagger files**:
   Generate the Swagger JSON mappings based on the routes structure:
   ```bash
   npm run swagger-autogen
   ```

5. **Start the server**:
   For development with hot reload:
   ```bash
   npm start
   ```

   The server will start running on `http://localhost:3030`. You can access the dynamic API documentation page at `http://localhost:3030/docs`.
# petadopt-backend-portfolio
