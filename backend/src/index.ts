import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

const app = express();
app.use(express.json());
app.use(cors());

// your routes here...
// app.post('/auth/login', ...)
// app.post('/sweets', ...)

// ---- AUTO ADMIN CREATION HERE ----
async function createDefaultAdmin() {
  const adminEmail = "admin@test.com";

  const exists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!exists) {
    const hashedPass = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPass,
        role: "ADMIN",
      },
    });

    console.log(`🚀 Admin seeded: ${adminEmail} / admin123`);
  } else {
    console.log("✔ Admin already exists, skipping seed.");
  }
}

// Call once before server starts listening
createDefaultAdmin();

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
