const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, isAdmin } = require("../middleware/auth");

const prisma = new PrismaClient();

// Validate coupon (public - for checkout)
router.post("/validate", verifyToken, async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: "Código requerido" });
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) return res.status(404).json({ error: "Cupón inválido o inactivo" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: "Cupón expirado" });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: "Cupón agotado" });
    if (coupon.minAmount && subtotal < coupon.minAmount)
      return res.status(400).json({ error: `El cupón requiere un mínimo de $${coupon.minAmount.toLocaleString()}` });

    let discountAmount = 0;
    if (coupon.type === "percentage") discountAmount = subtotal * (coupon.discount / 100);
    else discountAmount = Math.min(coupon.discount, subtotal);

    res.json({ valid: true, coupon, discountAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al validar cupón" });
  }
});

// Get all coupons (admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  } catch {
    res.status(500).json({ error: "Error al obtener cupones" });
  }
});

// Create coupon (admin)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { code, discount, type, minAmount, maxUses, expiresAt } = req.body;
  if (!code || !discount) return res.status(400).json({ error: "Código y descuento son requeridos" });
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: Number(discount),
        type: type || "percentage",
        minAmount: minAmount ? Number(minAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ error: "Ya existe un cupón con ese código" });
    res.status(500).json({ error: "Error al crear cupón" });
  }
});

// Toggle coupon active (admin)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { active } = req.body;
  try {
    const coupon = await prisma.coupon.update({
      where: { id: Number(req.params.id) },
      data: { active },
    });
    res.json(coupon);
  } catch {
    res.status(500).json({ error: "Error al actualizar cupón" });
  }
});

// Delete coupon (admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Cupón eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar cupón" });
  }
});

module.exports = router;
