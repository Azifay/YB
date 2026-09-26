const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Modern API Documentation & Playground",
    version: "1.0.0",
    description:
      "Ushbu API Documentation Express + JWT backend tizimi uchun yaratilgan. Barcha endpointlar real va ularni 'Try it out' tugmasi orqali sinab ko‘rishingiz mumkin. Himoyalangan endpointlar uchun yuqoridagi 'Authorize' tugmasidan foydalanib JWT tokenni kiriting.",
    contact: {
      name: "API Support",
      email: "support@example.com"
    }
  },
  servers: [
    {
      url: "/",
      description: "Joriy Server (Avtomatik Port)"
    },
    {
      url: "http://localhost:4040",
      description: "Local Server (4040)"
    }
  ],
  tags: [
    {
      name: "Authentication",
      description: "Foydalanuvchini autentifikatsiya qilish, ro‘yxatdan o‘tish va JWT token boshqaruvi"
    },
    {
      name: "Users",
      description: "Foydalanuvchilar ma‘lumotlarini olish va CRUD amallari"
    },
    {
      name: "Products",
      description: "Mahsulotlar katalogi, qidiruv va himoyalangan boshqaruv amallari"
    },
    {
      name: "Other APIs",
      description: "Server holati, uptime va statistik ma‘lumotlar"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT tokenni quyidagi formatda kiriting: Bearer <token>"
      }
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            example: "ali_uz"
          },
          password: {
            type: "string",
            example: "test1234"
          }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            example: "jasur_dev"
          },
          password: {
            type: "string",
            example: "pass1234"
          },
          fullName: {
            type: "string",
            example: "Jasur Rashidov"
          },
          email: {
            type: "string",
            example: "jasur@example.com"
          },
          phone: {
            type: "string",
            example: "+998 90 999 88 77"
          },
          age: {
            type: "integer",
            example: 24
          }
        }
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          username: { type: "string", example: "ali_uz" },
          fullName: { type: "string", example: "Ali Valiyev" },
          firstName: { type: "string", example: "Ali" },
          lastName: { type: "string", example: "Valiyev" },
          middleName: { type: "string", example: "Anvar o‘g‘li" },
          email: { type: "string", example: "ali.valiyev@example.com" },
          phone: { type: "string", example: "+998 90 123 45 67" },
          age: { type: "integer", example: 20 },
          registeredAt: { type: "string", example: "2026-09-10" }
        }
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "MacBook Pro 16 M3 Max" },
          category: { type: "string", example: "Elektronika" },
          price: { type: "number", example: 3499 },
          stock: { type: "integer", example: 12 },
          description: { type: "string", example: "Apple M3 Max chip, 36GB RAM" },
          rating: { type: "number", example: 4.9 },
          createdAt: { type: "string", example: "2026-09-01T10:00:00.000Z" }
        }
      },
      ProductInput: {
        type: "object",
        required: ["title", "price"],
        properties: {
          title: { type: "string", example: "Samsung Galaxy S25 Ultra" },
          category: { type: "string", example: "Elektronika" },
          price: { type: "number", example: 1299 },
          stock: { type: "integer", example: 20 },
          description: { type: "string", example: "Snapdragon 8 Elite, 512GB, Titanium" },
          rating: { type: "number", example: 4.9 }
        }
      }
    }
  },
  paths: {
    "/login": {
      post: {
        tags: ["Authentication"],
        summary: "Foydalanuvchi tizimga kirishi (Mavjud asosiy endpoint)",
        description: "Mavjud server.js dagi asosiy login endpointi. Foydalanuvchi nomi va parol bilan kirib, JWT token oladi.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Login muvaffaqiyatli",
            content: {
              "application/json": {
                example: {
                  message: "Login muvaffaqiyatli",
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
              }
            }
          },
          400: { description: "Username yoki password kiritilmagan" },
          401: { description: "Username yoki password noto‘g‘ri" }
        }
      }
    },
    "/me": {
      get: {
        tags: ["Authentication"],
        summary: "Joriy foydalanuvchi profili (Mavjud asosiy endpoint)",
        description: "Mavjud server.js dagi asosiy profil endpointi. JWT token orqali kirgan foydalanuvchining to‘liq ma‘lumotlarini qaytaradi.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Foydalanuvchi profili",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" }
              }
            }
          },
          401: { description: "Token mavjud emas yoki noto‘g‘ri" },
          404: { description: "User topilmadi" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "API Auth Login",
        description: "Standart /api/auth/login formati orqali kirish.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Muvaffaqiyatli login va token qaytadi",
            content: {
              "application/json": {
                example: {
                  message: "Login muvaffaqiyatli",
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: { id: 1, username: "ali_uz", fullName: "Ali Valiyev" }
                }
              }
            }
          },
          401: { description: "Noto‘g‘ri ma‘lumotlar" }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Yangi foydalanuvchi ro‘yxatdan o‘tishi",
        description: "Yangi akkaunt yaratadi va darhol JWT token taqdim etadi.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Muvaffaqiyatli ro‘yxatdan o‘tildi",
            content: {
              "application/json": {
                example: {
                  message: "Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi",
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: { id: 2, username: "jasur_dev", fullName: "Jasur Rashidov" }
                }
              }
            }
          },
          400: { description: "Talab qilingan maydonlar to‘liq emas" },
          409: { description: "Username allaqachon mavjud" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Joriy foydalanuvchi ma‘lumotlari (/api marshruti)",
        description: "Authorization header orqali yuborilgan JWT tokenni tekshiradi va foydalanuvchi ma‘lumotlarini qaytaradi.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Profil ma‘lumotlari" },
          401: { description: "Avtorizatsiya talab qilinadi" }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Barcha foydalanuvchilar ro‘yxatini olish",
        description: "Tizimdagi barcha ro‘yxatdan o‘tgan foydalanuvchilarni xavfsiz (parollarsiz) formatda qaytaradi. To‘g‘ridan-to‘g‘ri massiv (array) qaytaradi.",
        responses: {
          200: {
            description: "Foydalanuvchilar ro‘yxati (array)",
            content: {
              "application/json": {
                example: [
                  {
                    id: 1,
                    username: "ali_uz",
                    fullName: "Ali Valiyev",
                    firstName: "Ali",
                    lastName: "Valiyev",
                    email: "ali.valiyev@example.com",
                    phone: "+998 90 123 45 67",
                    age: 20,
                    passport: { series: "AA", number: "1029384", issuedBy: "Toshkent shahar IIB", issuedDate: "2022-05-20" }
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Yangi foydalanuvchi qo‘shish (MongoDB Atlas‘ga yoziladi)",
        description: "Yangi foydalanuvchi yaratadi, MongoDB‘dagi users kolleksiyasiga saqlaydi va darhol JWT token taqdim etadi. Pasport maydonlari (passportSeries, passportNumber) ham qabul qilinadi.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                username: "jasur_dev",
                password: "pass1234",
                firstName: "Jasur",
                lastName: "Rashidov",
                phone: "+998 90 999 88 77",
                email: "jasur@example.com",
                age: 24,
                gender: "Erkak",
                region: "Toshkent shahri",
                passportSeries: "AA",
                passportNumber: "1234567"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Foydalanuvchi yaratildi va MongoDB Atlas‘ga saqlandi",
            content: {
              "application/json": {
                example: {
                  message: "Foydalanuvchi muvaffaqiyatli saqlandi va MongoDB Atlas‘ga qo‘shildi! ✅",
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: { id: 12, username: "jasur_dev", fullName: "Jasur Rashidov" }
                }
              }
            }
          },
          400: { description: "Username yoki password kiritilmagan" },
          409: { description: "Username allaqachon band" }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "ID bo‘yicha foydalanuvchini olish",
        description: "Berilgan ID ga tegishli foydalanuvchining to‘liq ma‘lumotlarini olish.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Foydalanuvchi ID raqami",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: { description: "Foydalanuvchi topildi" },
          404: { description: "Foydalanuvchi topilmadi" }
        }
      },
      put: {
        tags: ["Users"],
        summary: "Foydalanuvchini yangilash (JWT talab qilinadi)",
        description: "Foydalanuvchi profil ma‘lumotlarini o‘zgartirish. JWT token bo‘lmasa 401 qaytaradi. Barcha maydonlar ixtiyoriy — faqat yuborilganlar yangilanadi.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Foydalanuvchi ID raqami",
            schema: { type: "integer", example: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                firstName: "Ali",
                lastName: "Valiyev (Yangilandi)",
                phone: "+998 90 777 66 55",
                address: "Chilonzor 9-mavze, 12-uy",
                passportSeries: "AB",
                passportNumber: "7654321"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Ma‘lumotlar yangilandi va MongoDB Atlas‘da saqlandi",
            content: {
              "application/json": {
                example: {
                  message: "Foydalanuvchi ma‘lumotlari muvaffaqiyatli yangilandi va MongoDB Atlas‘da saqlandi! ✅",
                  user: { id: 1, username: "ali_uz", fullName: "Ali Valiyev (Yangilandi)" }
                }
              }
            }
          },
          401: { description: "JWT token mavjud emas yoki yaroqsiz" },
          404: { description: "Foydalanuvchi topilmadi" },
          409: { description: "Yangi username allaqachon band" }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Foydalanuvchini o‘chirish (JWT talab qilinadi)",
        description: "Foydalanuvchini MongoDB bazasidan butunlay o‘chirib tashlash. JWT token bo‘lmasa 401 qaytaradi.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Foydalanuvchi ID raqami",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: {
            description: "Foydalanuvchi muvaffaqiyatli o‘chirildi",
            content: {
              "application/json": {
                example: {
                  message: "Foydalanuvchi ‘@ali_uz‘ muvaffaqiyatli o‘chirildi! MongoDB Atlas bazasidan ham olib tashlandi ✅",
                  deletedId: 1,
                  username: "ali_uz"
                }
              }
            }
          },
          401: { description: "JWT token mavjud emas yoki yaroqsiz" },
          404: { description: "Foydalanuvchi topilmadi" }
        }
      }
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Mahsulotlar ro‘yxatini olish",
        description: "Barcha mahsulotlar ro‘yxatini qaytaradi. Search va category bo‘yicha filterlash mumkin.",
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            description: "Nom yoki tavsif bo‘yicha qidiruv so‘zi",
            schema: { type: "string", example: "MacBook" }
          },
          {
            name: "category",
            in: "query",
            required: false,
            description: "Kategoriya bo‘yicha filter",
            schema: { type: "string", example: "Elektronika" }
          },
          {
            name: "minPrice",
            in: "query",
            required: false,
            description: "Minimal narx",
            schema: { type: "number", example: 100 }
          }
        ],
        responses: {
          200: {
            description: "Mahsulotlar ro‘yxati",
            content: {
              "application/json": {
                example: {
                  total: 4,
                  products: [
                    {
                      id: 1,
                      title: "MacBook Pro 16 M3 Max",
                      category: "Elektronika",
                      price: 3499,
                      stock: 12,
                      description: "Apple M3 Max chip, 36GB RAM",
                      rating: 4.9
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Products"],
        summary: "Yangi mahsulot qo‘shish",
        description: "Yangi mahsulot qo‘shish uchun endpoint. Faqat avtorizatsiyadan o‘tgan foydalanuvchilar (JWT) uchun ruxsat etilgan.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Mahsulot yaratildi",
            content: {
              "application/json": {
                example: {
                  message: "Yangi mahsulot muvaffaqiyatli yaratildi",
                  product: {
                    id: 5,
                    title: "Samsung Galaxy S25 Ultra",
                    category: "Elektronika",
                    price: 1299,
                    stock: 20
                  }
                }
              }
            }
          },
          400: { description: "Title yoki price kiritilmagan" },
          401: { description: "JWT Token talab qilinadi" }
        }
      }
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "ID bo‘yicha mahsulotni olish",
        description: "Bitta mahsulotning to‘liq ma‘lumotlarini olish.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Mahsulot ID raqami",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: { description: "Mahsulot topildi" },
          404: { description: "Mahsulot topilmadi" }
        }
      },
      put: {
        tags: ["Products"],
        summary: "Mahsulotni yangilash",
        description: "Mahsulot narxi, zaxirasi yoki ma‘lumotlarini yangilash (JWT talab qilinadi).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Mahsulot ID raqami",
            schema: { type: "integer", example: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                price: 3299,
                stock: 15,
                description: "Yangi chegirma narxi"
              }
            }
          }
        },
        responses: {
          200: { description: "Mahsulot yangilandi" },
          401: { description: "JWT Token talab qilinadi" },
          404: { description: "Mahsulot topilmadi" }
        }
      },
      delete: {
        tags: ["Products"],
        summary: "Mahsulotni o‘chirish",
        description: "Mahsulotni katalogdan o‘chirish (JWT talab qilinadi).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Mahsulot ID raqami",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: { description: "Mahsulot o‘chirildi" },
          401: { description: "JWT Token talab qilinadi" },
          404: { description: "Mahsulot topilmadi" }
        }
      }
    },
    "/api/health": {
      get: {
        tags: ["Other APIs"],
        summary: "Server holati (Health Check)",
        description: "Serverning ishlayotganligi, uptime va vaqtini tekshirish uchun ochiq endpoint.",
        responses: {
          200: {
            description: "Server holati UP",
            content: {
              "application/json": {
                example: {
                  status: "UP",
                  uptimeSeconds: 120,
                  timestamp: "2026-09-15T10:00:00.000Z",
                  service: "JWT & Swagger Documentation API Server",
                  version: "1.0.0"
                }
              }
            }
          }
        }
      }
    },
    "/api/stats": {
      get: {
        tags: ["Other APIs"],
        summary: "Tizim statistikasi",
        description: "Foydalanuvchilar, mahsulotlar soni va Node.js tizim xotirasi haqida statistika.",
        responses: {
          200: {
            description: "Statistika muvaffaqiyatli olindi",
            content: {
              "application/json": {
                example: {
                  totalUsers: 1,
                  totalProducts: 4,
                  system: {
                    nodeVersion: "v24.12.0",
                    platform: "win32",
                    memoryUsageMB: 28.5
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
