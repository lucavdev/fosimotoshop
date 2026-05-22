const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { verifyToken } = require("../middleware/auth");

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name)
    return res.status(400).json({ error: "Todos los campos son requeridos" });

  if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string")
    return res.status(400).json({ error: "Formato de datos inválido" });

  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail))
    return res.status(400).json({ error: "Formato de correo electrónico inválido" });

  if (password.length < 6)
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  if (password.length > 72)
    return res.status(400).json({ error: "La contraseña es demasiado larga" });

  try {
    const exists = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (exists) return res.status(400).json({ error: "El email ya está registrado" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: trimmedEmail, password: hashed, name: name.trim(), role: "CLIENTE" },
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña requeridos" });

  if (typeof email !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Formato de datos inválido" });

  const trimmedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciales incorrectas" });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

module.exports = router;
