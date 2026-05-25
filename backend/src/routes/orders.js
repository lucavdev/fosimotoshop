const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, isAdmin } = require("../middleware/auth");

const prisma = new PrismaClient();

router.post("/", verifyToken, async (req, res) => {
  const { items, shippingType, province, city, address, postalCode, couponCode } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ error: "El carrito está vacío" });

  try {
    const productIds = items.map((item) => Number(item.productId)).filter((id) => !isNaN(id));
    if (productIds.length !== items.length)
      return res.status(400).json({ error: "IDs de producto inválidos" });

    const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      if (!product) return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      const qty = Number(item.qty);
      if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: "Cantidad inválida" });
      if (product.stock < qty) return res.status(400).json({ error: `Sin stock suficiente para: ${product.name}` });
      // Apply product discount if any
      const effectivePrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
      subtotal += effectivePrice * qty;
      orderItems.push({ productId: product.id, qty, price: effectivePrice, size: item.size || null, color: item.color || null });
    }

    // Validate coupon
    let couponDiscount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon || !coupon.active) return res.status(400).json({ error: "Cupón inválido o inactivo" });
      if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: "Cupón expirado" });
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: "Cupón agotado" });
      if (coupon.minAmount && subtotal < coupon.minAmount) return res.status(400).json({ error: `El cupón requiere un mínimo de $${coupon.minAmount.toLocaleString()}` });

      if (coupon.type === "percentage") couponDiscount = subtotal * (coupon.discount / 100);
      else couponDiscount = Math.min(coupon.discount, subtotal);
      appliedCoupon = coupon;
    }

    const shippingCost = shippingType === "correo" ? 15000 : 0;
    const total = Math.max(0, subtotal - couponDiscount) + shippingCost;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          status: "pendiente",
          shippingType: shippingType || "retiro",
          shippingCost,
          province: province || null,
          city: city || null,
          address: address || null,
          postalCode: postalCode || null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          couponDiscount: couponDiscount || null,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: Number(item.productId) },
          data: { stock: { decrement: Number(item.qty) } },
        });
      }

      if (appliedCoupon) {
        await tx.coupon.update({ where: { id: appliedCoupon.id }, data: { usedCount: { increment: 1 } } });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la orden" });
  }
});

router.get("/my", verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { select: { name: true, image: true, images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
});

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { name: true, image: true, category: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
});

router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  const valid = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Estado inválido" });
  try {
    const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

module.exports = router;
