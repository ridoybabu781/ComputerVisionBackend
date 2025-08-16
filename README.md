# Laptop Vision Backend

A backend service for Laptop Vision tasks, providing APIs for user management, product catalog, orders, reviews, and payment integrations (COD & SSLCommerz). Built with Node.js, Express, and MongoDB.

---

## Features

- **User Management**

  - Register, login, logout
  - Profile fetch & update
  - Password reset and verification code system
  - Profile picture upload
  - Admin-only operations: block/unblock users, delete profile, create admins

- **Products**

  - Add, update, delete products (Admin only)
  - Upload multiple product images with Cloudinary integration
  - Product specifications stored as structured JSON

- **Orders**

  - Place orders for one or more products
  - Payment options: COD, SSLCommerz
  - Cancel orders with reason (limits applied for shipped/delivered orders)
  - Order tracking (Pending, Processing, Shipped, Delivered, Cancelled)

- **Reviews**

  - Add, edit, delete reviews with images
  - Fetch product-specific or user-specific reviews

- **Security**

  - JWT authentication
  - Helmet for HTTP headers security
  - Input validation using Joi
  - Password hashing using bcrypt

- **Modular & Scalable**

  - Separate routes and controllers for users, products, orders, reviews, and payments
  - Centralized error handling

---

## Installation

```bash
git clone https://github.com/ridoybabu781/ComputerVisionBackend.git
cd ComputerVisionBackend
npm install
```

### Environment Variables

Create a `.env` file with the following variables:

```env
PORT = 5050
DB_URL = <Mongo db url here>
JWT_SECRET = <JWT SECRET HERE>


CNAME=<Cloudinary name>
CAPI_KEY =<cloudinary api key>
CAPI_SECRET =<cloudinary api secret>

GMAIL_USER= <user gmail , from where you'll send email>
GMAIL_PASS = <app pass for the gmail>

SSLC_STORE_ID=<ssl commerz store id>
SSLC_STORE_PASS=<ssl commerz store password>

CORS_ORIGIN = http://localhost:5173
```

---

## Running the Server

```bash
npm run dev
```

The backend will run on `http://localhost:5050`.

---

## API Routes

### User Routes

| Method | Endpoint                         | Description                     | Body / Params                                                   |
| ------ | -------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| POST   | `/api/auth/sendCode`             | Send verification code to email | `email` (body)                                                  |
| POST   | `/api/auth/register`             | Create user after verification  | `name`, `email`, `password`, `verificationCode` (body)          |
| POST   | `/api/auth/login`                | Login user                      | `email`, `password` (body)                                      |
| GET    | `/api/auth/profile`              | Get user profile                | Authenticated (`token`)                                         |
| PUT    | `/api/auth/updateProfile`        | Update user profile             | `name`, `birthDate`, `age`, `gender`, `address`, `phone` (body) |
| PUT    | `/api/auth/updateProfilePicture` | Update profile picture          | `profilePic` (form-data)                                        |
| PUT    | `/api/auth/updatePassword`       | Update password                 | `oldPass`, `newPass` (body)                                     |
| POST   | `/api/auth/sendForgetPassCode`   | Send code for password reset    | `email` (body)                                                  |
| POST   | `/api/auth/forgetPassword`       | Reset password using code       | `email`, `verificationCode`, `newPassword` (body)               |
| POST   | `/api/auth/logout`               | Logout user                     | Authenticated (`token`)                                         |
| POST   | `/api/auth/refreshAccessToken`   | Refresh Access Token            |                                                                 |

### Admin Rotues

| Method | Endpoint                                  | Description           | Body / Params                                              |
| ------ | ----------------------------------------- | --------------------- | ---------------------------------------------------------- |
| POST   | `/api/auth/admin/rr/rsc-create-bro-admin` | Create admin          | `name`, `email`, `password` (body)                         |
| POST   | `/api/auth/deleteProfile`                 | Delete user           | Authenticated (`token`), `profileId` (body/param optional) |
| POST   | `/api/auth/blockProfile/:id`              | Block user            | `id` (param), Authenticated admin                          |
| POST   | `/api/auth/unblockProfile/:id`            | Unblock user          | `id` (param), Authenticated admin                          |
| GET    | `/api/auth/getBlockedUser`                | Get all blocked users | Authenticated admin                                        |

---

### Product Routes

| Method | Endpoint                                                                                | Description        | Body / Params                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/product/addProduct`                                                               | Add new product    | `title` {required}, `category` {required}, `brand` {required}, `model`, `description` {required}, `price` {required}, `discountPrice`, `specs`, `images`, `stock` (body + form-data images), `category` {required} |
| GET    | `/api/product/getProduct/:id`                                                           | Get single product | `id` (param)                                                                                                                                                                                                       |
| GET    | `/api/product/getProducts` { page,limit,sortField,sortOrder,search,category} from query | Get all products   | Query params optional (filtering/pagination)                                                                                                                                                                       |
| PUT    | `/api/product/updateProduct/:id`                                                        | Update product     | `id` (param), updated fields (body + form-data images)                                                                                                                                                             |
| DELETE | `/api/product/deleteProduct/:id`                                                        | Delete product     | `id` (param)                                                                                                                                                                                                       |

---

### Order Routes

| Method | Endpoint                     | Description                      | Body / Params                                                                                        |
| ------ | ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| POST   | `/api/order/createOrder`     | Create order                     | `orderItems`, `shippingAddress`, `paymentMethod`, `itemsPrice`, `shippingPrice`, `totalPrice` (body) |
| PUT    | `/api/order/updateOrder/:id` | Update order status (Admin only) | `id` (param), `status` (body)                                                                        |
| POST   | `/api/order/cancelOrder/:id` | Cancel order                     | `id` (param), `cancelReason` (body), must be order owner                                             |

---

### Payment Routes

| Method     | Endpoint                           | Description                | Body / Params                    |
| ---------- | ---------------------------------- | -------------------------- | -------------------------------- |
| POST       | `/api/payment/cod/:orderId`        | Process Cash on Delivery   | `orderId` (param), Authenticated |
| POST       | `/api/payment/sslcommerz/:orderId` | Process SSLCommerz payment | `orderId` (param), Authenticated |
| GET / POST | `/api/payment/success/:orderId`    | Payment success callback   | `orderId` (param)                |
| GET / POST | `/api/payment/fail/:orderId`       | Payment failed callback    | `orderId` (param)                |
| GET / POST | `/api/payment/cancel/:orderId`     | Payment cancelled callback | `orderId` (param)                |

---

### Review Routes

| Method | Endpoint                     | Description             | Body / Params                                                           |
| ------ | ---------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/review/addReview/:id`  | Add review to product   | `id` (productId param), `rating`, `review`, `images` (body + form-data) |
| POST   | `/api/review/removeReview`   | Remove review           | `reviewId` (body)                                                       |
| POST   | `/api/review/editReview`     | Edit review             | `reviewId` (body), `rating`, `review`, `images` (body + form-data)      |
| POST   | `/api/review/myReviews`      | Get my reviews          | Authenticated user                                                      |
| POST   | `/api/review/productReviews` | Get reviews for product | `productId` (body)                                                      |

---

## Models

### **User**

Represents a user or admin in the system.

| Field        | Type   | Required | Description                                          |
| ------------ | ------ | -------- | ---------------------------------------------------- |
| `name`       | String | Yes      | Full name of the user                                |
| `email`      | String | Yes      | Unique email for login                               |
| `password`   | String | Yes      | Hashed password                                      |
| `role`       | String | Yes      | User role: `"user"` or `"admin"` (default: `"user"`) |
| `profilePic` | String | No       | URL of profile picture                               |
| `address`    | String | No       | User address                                         |
| `age`        | Number | No       | User age                                             |
| `birthDate`  | Date   | No       | Date of birth                                        |
| `gender`     | String | No       | `"male"`, `"female"`, or `"other"`                   |
| `phone`      | Number | No       | Phone number                                         |

---

### **Product**

Represents products that users can buy.

| Field           | Type   | Required | Description                                                                                          |
| --------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `title`         | String | Yes      | Product name                                                                                         |
| `category`      | String | No       | Product category (default: `"Other"`)                                                                |
| `brand`         | String | Yes      | Product brand                                                                                        |
| `model`         | String | No       | Model name or number                                                                                 |
| `description`   | String | No       | Product description                                                                                  |
| `price`         | Number | Yes      | Selling price                                                                                        |
| `discountPrice` | Number | No       | Discounted price                                                                                     |
| `specs`         | Object | No       | Product specifications including cpu, ram, storage, gpu, display, battery, os, ports (array), others |
| `images`        | Object | No       | `productImages: [String]` (URLs), `imagePublicIds: [String]` (Cloudinary IDs)                        |
| `stock`         | Number | No       | Number of items in stock                                                                             |

---

### **Order**

Represents an order placed by a user.

| Field             | Type             | Required | Description                                                                                   |
| ----------------- | ---------------- | -------- | --------------------------------------------------------------------------------------------- |
| `userId`          | ObjectId (User)  | Yes      | Reference to the user who placed the order                                                    |
| `orderItems`      | Array of Objects | Yes      | Each item includes `product` (ObjectId), `qty` (Number), `price` (Number)                     |
| `shippingAddress` | Object           | Yes      | Contains `fullName`, `phone`, `address`, `city`, `postalCode`, `country`                      |
| `paymentMethod`   | String           | Yes      | `"COD"`, `"Bkash"`, `"Nagad"`, `"SSLCommerz"`, `"Stripe"`, `"PayPal"`                         |
| `status`          | String           | Yes      | `"Pending"`, `"Processing"`, `"Shipped"`, `"Delivered"`, `"Cancelled"` (default: `"Pending"`) |
| `itemsPrice`      | Number           | Yes      | Total price of items (without shipping)                                                       |
| `shippingPrice`   | Number           | Yes      | Shipping cost                                                                                 |
| `totalPrice`      | Number           | Yes      | Total price including shipping                                                                |
| `isPaid`          | Boolean          | No       | Whether the order is paid                                                                     |
| `paidAt`          | Date             | No       | Payment timestamp                                                                             |
| `isDelivered`     | Boolean          | No       | Whether the order is delivered                                                                |
| `deliveredAt`     | Date             | No       | Delivery timestamp                                                                            |
| `cancelReason`    | String           | No       | Reason for cancellation                                                                       |
| `returned`        | Boolean          | No       | Whether the order is returned                                                                 |
| `returnedReason`  | String           | No       | Reason for return                                                                             |

---

### **Review**

Represents a review submitted by a user for a product.

| Field       | Type               | Required | Description                                                       |
| ----------- | ------------------ | -------- | ----------------------------------------------------------------- |
| `userId`    | ObjectId (User)    | Yes      | Reference to the user                                             |
| `productId` | ObjectId (Product) | Yes      | Reference to the product                                          |
| `rating`    | Number             | Yes      | Rating given (default: 1)                                         |
| `review`    | String             | Yes      | Text review                                                       |
| `images`    | Object             | No       | `imageLinks: [String]`, `publicIds: [String]` for uploaded images |

---

### **VerificationCode**

Stores verification codes for user registration or password reset.

| Field              | Type   | Required | Description          |
| ------------------ | ------ | -------- | -------------------- |
| `email`            | String | Yes      | User email           |
| `verificationCode` | String | Yes      | Code sent to user    |
| `expiresIn`        | Date   | Yes      | Expiration timestamp |

---

## Notes

- All authenticated routes require a valid JWT token in the request headers.
- Image uploads are handled via **Cloudinary**.
- Payments can be extended to include Bkash, Nagad, Stripe, and PayPal.
- Error handling is centralized using `errorHandler` middleware.
