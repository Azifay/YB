const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");
const initialUsers = require("./initialUsers");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5432;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_jwt_swagger_2026";
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://<db_username>:e4C0vkFGgWjj57nz@cluster0.aoid2ba.mongodb.net/log_database?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ======================================
// SCHEMAS & MODELS
// ======================================

const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    firstName: String,
    lastName: String,
    middleName: String,
    birthDate: String,
    gender: String,
    country: String,
    region: String,
    district: String,
    address: String,
    phone: String,
    email: String,
    passport: {
        series: String,
        number: String,
        issuedBy: String,
        issuedDate: String
    },
    age: Number,
    registeredAt: String,
    password: { type: String, required: true }
});

const loginLogSchema = new mongoose.Schema({
    userId: Number,
    username: { type: String, required: true },
    fullName: String,
    status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    formattedTime: String
});

const User = mongoose.model("User", userSchema);
const LoginLog = mongoose.model("LoginLog", loginLogSchema);

// In-memory fallback (MongoDB ulanmaguncha ham tizim to'xtovsiz ishlashi uchun)
let memoryUsers = JSON.parse(JSON.stringify(initialUsers));
let memoryLogs = [];
let isMongoConnected = false;

// ======================================
// MONGODB ULANISH VA SEED
// ======================================

async function seedDatabase() {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            console.log("Foydalanuvchilar bazasi bo'sh. 11 ta boshlang'ich user yuklanmoqda...");
            await User.insertMany(initialUsers);
            console.log("11 ta foydalanuvchi MongoDB'ga muvaffaqiyatli saqlandi! ✅");
        } else {
            console.log(`MongoDB'da allaqachon ${count} ta foydalanuvchi mavjud ✅`);
        }
    } catch (err) {
        console.error("MongoDB seed xatosi:", err.message);
    }
}

if (MONGO_URI.includes("<db_username>")) {
    console.log("---------------------------------------------------------------------------------");
    console.log("⚠️ DIQQAT: .env faylida <db_username> joyi almashtirilmagan!");
    console.log("Iltimos, .env faylidagi MONGO_URI ichidagi <db_username> o'rniga MongoDB Atlas");
    console.log("Database user nomingizni yozing!");
    console.log("Hozircha tizim xotiradagi (in-memory) 11 ta user bazasi bilan ishlamoqda.");
    console.log("---------------------------------------------------------------------------------");
} else {
    mongoose
        .connect(MONGO_URI)
        .then(async () => {
            isMongoConnected = true;
            console.log("MongoDB ulandi ✅ (MongoDB Compass orqali ko'rishingiz mumkin)");
            await seedDatabase();
        })
        .catch((error) => {
            isMongoConnected = false;
            console.log("MongoDB ulanishda xato ❌:", error.message);
            console.log("Tizim lokal xotira bilan ishlashda davom etadi.");
        });
}

// ======================================
// SWAGGER DOCS
// ======================================

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ======================================
// AUTH MIDDLEWARE
// ======================================

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization token mavjud emas" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token noto‘g‘ri formatda" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token noto‘g‘ri yoki muddati tugagan" });
    }
}

// ======================================
// ENDPOINTS
// ======================================

// 1. Tizim holati (MongoDB ulanish statusi)
app.get(["/status", "/api/status"], async (req, res) => {
    let dbUsersCount = memoryUsers.length;
    let dbLogsCount = memoryLogs.length;

    if (isMongoConnected && mongoose.connection.readyState === 1) {
        try {
            dbUsersCount = await User.countDocuments();
            dbLogsCount = await LoginLog.countDocuments();
        } catch (e) {}
    }

    res.json({
        status: "ONLINE",
        mongoConnected: isMongoConnected && mongoose.connection.readyState === 1,
        mongoUriConfigured: !MONGO_URI.includes("<db_username>"),
        usersCount: dbUsersCount,
        loginsCount: dbLogsCount,
        port: PORT
    });
});

// 2. Login endpoint (MongoDB Compass'da ko'rinadigan login qaydlarini saqlaydi)
app.post(["/login", "/api/login", "/api/auth/login"], async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username yoki passwordni kiriting" });
        }

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "Browser";
        const formattedTime = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

        let user = null;

        if (isMongoConnected && mongoose.connection.readyState === 1) {
            user = await User.findOne({ username });
        } else {
            user = memoryUsers.find((u) => u.username === username);
        }

        if (!user || user.password !== password) {
            // Muvaffaqiyatsiz loginni ham MongoDB Compass ko'rishi uchun saqlaymiz
            const failedLog = {
                userId: user ? user.id : null,
                username: username,
                fullName: user ? user.fullName : "Noma'lum",
                status: "FAILED",
                ipAddress: ip,
                userAgent: userAgent,
                formattedTime: formattedTime,
                timestamp: new Date()
            };

            if (isMongoConnected && mongoose.connection.readyState === 1) {
                try { await LoginLog.create(failedLog); } catch (e) {}
            } else {
                memoryLogs.unshift({ ...failedLog, _id: "log_" + Date.now() });
            }

            return res.status(401).json({ message: "Username yoki password noto‘g‘ri" });
        }

        // Muvaffaqiyatli loginni MongoDB Compass'ga saqlash
        const successLog = {
            userId: user.id,
            username: user.username,
            fullName: user.fullName,
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: userAgent,
            formattedTime: formattedTime,
            timestamp: new Date()
        };

        if (isMongoConnected && mongoose.connection.readyState === 1) {
            try {
                const savedLog = await LoginLog.create(successLog);
                console.log(`[MongoDB Compass] Yangi login yozildi: ${user.username} (${savedLog._id})`);
            } catch (err) {
                console.error("LoginLog saqlashda xato:", err.message);
            }
        } else {
            memoryLogs.unshift({ ...successLog, _id: "log_" + Date.now() });
            console.log(`[In-Memory Log] Yangi login qayd etildi: ${user.username}`);
        }

        // JWT Token
        const accessToken = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Parolsiz user nusxasini jo'natish
        const userClean = { ... (user.toObject ? user.toObject() : user) };
        delete userClean.password;

        res.status(200).json({
            message: "Login muvaffaqiyatli ✅",
            accessToken,
            user: userClean
        });

    } catch (error) {
        res.status(500).json({
            message: "Login xatosi",
            error: error.message
        });
    }
});

// 3. Register endpoint
// 3. Register / Create User endpoint (Yangi user qo'shish va MongoDB Atlas'ga saqlash)
app.post(["/register", "/api/register", "/api/auth/register", "/api/users"], async (req, res) => {
    try {
        const body = req.body;
        if (!body.username || !body.password) {
            return res.status(400).json({ message: "Username va password kiritilishi shart" });
        }

        let existingUser = null;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            existingUser = await User.findOne({ username: body.username });
        } else {
            existingUser = memoryUsers.find(u => u.username.toLowerCase() === body.username.toLowerCase());
        }

        if (existingUser) {
            return res.status(409).json({ message: "Ushbu username band. Iltimos, boshqa username tanlang." });
        }

        // Yangi ID generatsiya qilish
        let newId = 1;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            const lastUser = await User.findOne().sort({ id: -1 });
            newId = (lastUser && typeof lastUser.id === "number") ? lastUser.id + 1 : 1;
        } else {
            newId = memoryUsers.length > 0 ? Math.max(...memoryUsers.map(u => u.id || 0)) + 1 : 1;
        }

        const fullName = body.fullName || `${body.firstName || ""} ${body.lastName || ""}`.trim() || body.username;
        const passportData = body.passport || {
            series: body.passportSeries || "AA",
            number: body.passportNumber || "0000000",
            issuedBy: body.passportIssuedBy || "O‘zbekiston Respublikasi IIB",
            issuedDate: body.passportIssuedDate || new Date().toISOString().split("T")[0]
        };

        const newUserObj = {
            id: newId,
            username: body.username.trim(),
            fullName: fullName,
            firstName: body.firstName || fullName.split(" ")[0] || "",
            lastName: body.lastName || fullName.split(" ").slice(1).join(" ") || "",
            middleName: body.middleName || "",
            birthDate: body.birthDate || "",
            gender: body.gender || "Erkak",
            country: body.country || "O‘zbekiston",
            region: body.region || "Toshkent shahri",
            district: body.district || "",
            address: body.address || "",
            phone: body.phone || "+998 90 000 00 00",
            email: body.email || `${body.username.trim()}@example.com`,
            passport: passportData,
            age: body.age ? Number(body.age) : 22,
            registeredAt: body.registeredAt || new Date().toISOString().split("T")[0],
            password: body.password
        };

        let savedUser;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            savedUser = await User.create(newUserObj);
            console.log(`[MongoDB Compass] Yangi user qo'shildi: ${savedUser.username} (ID: #${savedUser.id}) ✅`);
        } else {
            memoryUsers.push(newUserObj);
            savedUser = newUserObj;
            console.log(`[In-Memory] Yangi user saqlandi: ${savedUser.username}`);
        }

        const resUser = { ... (savedUser.toObject ? savedUser.toObject() : savedUser) };
        delete resUser.password;

        // JWT token
        const accessToken = jwt.sign(
            { id: resUser.id, username: resUser.username },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Yangi qo'shilgan userni login logiga ham yozamiz (MongoDB Compass'da ko'rinishi uchun)
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "Browser";
        const formattedTime = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
        const regLog = {
            userId: resUser.id,
            username: resUser.username,
            fullName: resUser.fullName,
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: userAgent + " (Ro'yxatdan o'tish)",
            formattedTime: formattedTime,
            timestamp: new Date()
        };

        if (isMongoConnected && mongoose.connection.readyState === 1) {
            try { await LoginLog.create(regLog); } catch (e) {}
        } else {
            memoryLogs.unshift({ ...regLog, _id: "log_" + Date.now() });
        }

        res.status(201).json({
            message: "Foydalanuvchi muvaffaqiyatli saqlandi va MongoDB Atlas'ga qo‘shildi! ✅",
            accessToken,
            user: resUser
        });

    } catch (error) {
        console.error("User yaratish xatosi:", error);
        res.status(500).json({
            message: "User yaratishda xato yuz berdi",
            error: error.message
        });
    }
});

// 4. Joriy profil (GET /me)
app.get(["/me", "/api/me", "/api/auth/me"], authMiddleware, async (req, res) => {
    try {
        let user = null;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            user = await User.findOne({ id: req.user.id }).select("-password");
        } else {
            const found = memoryUsers.find(u => u.id === req.user.id);
            if (found) {
                user = { ...found };
                delete user.password;
            }
        }

        if (!user) {
            return res.status(404).json({ message: "User topilmadi" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error: error.message });
    }
});

// 5. Barcha foydalanuvchilar (GET /users)
app.get(["/users", "/api/users"], async (req, res) => {
    try {
        let users = [];
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            users = await User.find().sort({ id: 1 }).select("-password");
        } else {
            users = memoryUsers
                .sort((a, b) => (a.id || 0) - (b.id || 0))
                .map(u => {
                    const copy = { ...u };
                    delete copy.password;
                    return copy;
                });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Userlarni olishda xato", error: error.message });
    }
});

// 6. Bitta foydalanuvchi ma'lumotlari (GET /users/:id)
app.get(["/users/:id", "/api/users/:id"], async (req, res) => {
    try {
        const idParam = req.params.id;
        const query = isNaN(idParam) ? { _id: idParam } : { id: Number(idParam) };
        let user = null;

        if (isMongoConnected && mongoose.connection.readyState === 1) {
            user = await User.findOne(query).select("-password");
        } else {
            const found = memoryUsers.find(u => u.id === Number(idParam) || u._id === idParam);
            if (found) {
                user = { ...found };
                delete user.password;
            }
        }

        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error: error.message });
    }
});

// 7. Foydalanuvchini o'zgartirish (PUT /users/:id, PUT /api/users/:id) — JWT token talab qilinadi
app.put(["/users/:id", "/api/users/:id", "/api/auth/users/:id"], authMiddleware, async (req, res) => {
    try {
        const idParam = req.params.id;
        const query = isNaN(idParam) ? { _id: idParam } : { id: Number(idParam) };
        const body = req.body;

        let user = null;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            user = await User.findOne(query);
        } else {
            user = memoryUsers.find(u => u.id === Number(idParam) || u._id === idParam);
        }

        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        // Username bandligini tekshirish
        if (body.username && body.username.trim() !== user.username) {
            let conflictUser = null;
            if (isMongoConnected && mongoose.connection.readyState === 1) {
                conflictUser = await User.findOne({ username: body.username.trim() });
            } else {
                conflictUser = memoryUsers.find(u => u.username.toLowerCase() === body.username.trim().toLowerCase() && u.id !== user.id);
            }
            if (conflictUser) {
                return res.status(409).json({ message: "Bu username allaqachon band. Boshqa username tanlang." });
            }
        }

        const updateFields = {};
        if (body.username !== undefined) updateFields.username = body.username.trim();
        if (body.fullName !== undefined) updateFields.fullName = body.fullName.trim();
        if (body.firstName !== undefined) updateFields.firstName = body.firstName.trim();
        if (body.lastName !== undefined) updateFields.lastName = body.lastName.trim();
        if (body.middleName !== undefined) updateFields.middleName = body.middleName.trim();
        if (body.phone !== undefined) updateFields.phone = body.phone.trim();
        if (body.email !== undefined) updateFields.email = body.email.trim();
        if (body.age !== undefined && body.age !== "") updateFields.age = Number(body.age);
        if (body.gender !== undefined) updateFields.gender = body.gender;
        if (body.birthDate !== undefined) updateFields.birthDate = body.birthDate;
        if (body.country !== undefined) updateFields.country = body.country;
        if (body.region !== undefined) updateFields.region = body.region;
        if (body.district !== undefined) updateFields.district = body.district;
        if (body.address !== undefined) updateFields.address = body.address;
        if (body.password && body.password.trim() !== "") updateFields.password = body.password.trim();

        // Pasport ma'lumotlarini yangilash
        if (body.passport || body.passportSeries || body.passportNumber || body.passportIssuedBy || body.passportIssuedDate) {
            const curP = user.passport || {};
            updateFields.passport = {
                series: body.passportSeries || (body.passport && body.passport.series) || curP.series || "AA",
                number: body.passportNumber || (body.passport && body.passport.number) || curP.number || "0000000",
                issuedBy: body.passportIssuedBy || (body.passport && body.passport.issuedBy) || curP.issuedBy || "",
                issuedDate: body.passportIssuedDate || (body.passport && body.passport.issuedDate) || curP.issuedDate || ""
            };
        }

        // To'liq ism yangilanishi
        if (!updateFields.fullName && (updateFields.firstName || updateFields.lastName)) {
            const fn = updateFields.firstName || user.firstName || "";
            const ln = updateFields.lastName || user.lastName || "";
            updateFields.fullName = `${fn} ${ln}`.trim();
        }

        let updatedUser = null;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            updatedUser = await User.findOneAndUpdate(query, { $set: updateFields }, { new: true }).select("-password");
            console.log(`[MongoDB Compass] Foydalanuvchi ma'lumotlari yangilandi: ${user.username} (ID: #${user.id}) ✅`);
        } else {
            const idx = memoryUsers.findIndex(u => u.id === Number(idParam) || u._id === idParam);
            if (idx !== -1) {
                memoryUsers[idx] = { ...memoryUsers[idx], ...updateFields };
                updatedUser = { ...memoryUsers[idx] };
                delete updatedUser.password;
            }
        }

        res.status(200).json({
            message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi va MongoDB Atlas'da saqlandi! ✅",
            user: updatedUser
        });

    } catch (error) {
        console.error("User yangilash xatosi:", error);
        res.status(500).json({
            message: "Foydalanuvchini yangilashda xato yuz berdi",
            error: error.message
        });
    }
});

// 8. Foydalanuvchini o'chirish (DELETE /users/:id, DELETE /api/users/:id) — JWT token talab qilinadi
app.delete(["/users/:id", "/api/users/:id", "/api/auth/users/:id"], authMiddleware, async (req, res) => {
    try {
        const idParam = req.params.id;
        const query = isNaN(idParam) ? { _id: idParam } : { id: Number(idParam) };

        let userToDelete = null;
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            userToDelete = await User.findOne(query);
        } else {
            userToDelete = memoryUsers.find(u => u.id === Number(idParam) || u._id === idParam);
        }

        if (!userToDelete) {
            return res.status(404).json({ message: "O'chirilishi kerak bo'lgan foydalanuvchi topilmadi" });
        }

        if (isMongoConnected && mongoose.connection.readyState === 1) {
            await User.findOneAndDelete(query);
            console.log(`[MongoDB Compass] Foydalanuvchi o'chirildi: ${userToDelete.username} (ID: #${userToDelete.id}) 🗑️`);
        } else {
            // In-memory rejimda ham xotiradan o'chirish
            const memIdx = memoryUsers.findIndex(u => u.id === Number(idParam) || u._id === idParam);
            if (memIdx !== -1) {
                memoryUsers.splice(memIdx, 1);
                console.log(`[In-Memory] Foydalanuvchi o'chirildi: ${userToDelete.username} 🗑️`);
            }
        }

        res.status(200).json({
            message: `Foydalanuvchi '@${userToDelete.username}' muvaffaqiyatli o'chirildi! MongoDB Atlas bazasidan ham olib tashlandi ✅`,
            deletedId: userToDelete.id,
            username: userToDelete.username
        });

    } catch (error) {
        console.error("User o'chirish xatosi:", error);
        res.status(500).json({
            message: "Foydalanuvchini o'chirishda xatolik yuz berdi",
            error: error.message
        });
    }
});

// 9. Loginlar tarixi (MongoDB Compass'da saqlanayotgan loginlar ro'yxati)
app.get(["/logins", "/api/logins"], async (req, res) => {
    try {
        let logs = [];
        if (isMongoConnected && mongoose.connection.readyState === 1) {
            logs = await LoginLog.find().sort({ timestamp: -1 }).limit(50);
        } else {
            logs = memoryLogs.slice(0, 50);
        }
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Loginlarni olishda xato", error: error.message });
    }
});

// ======================================
// SERVER ISHGA TUSHIRISH
// ======================================

app.listen(PORT, () => {
    console.log("==================================================");
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
    console.log(`💻 Frontend interfeysi: http://localhost:${PORT}`);
    console.log(`📑 Swagger hujjatlari:  http://localhost:${PORT}/api-docs`);
    console.log("==================================================");
});

module.exports = app;