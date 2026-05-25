cat > backend / src / routes / orders.js << 'EOF'
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, isAdmin } = require("../middleware/auth");

const prisma = new PrismaClient();

router.post("/", verifyToken, async (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0)
        return res.status(400).json({ error: "El carrito está vacío" });
    try {
        let total = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
            if (product.stock < item.qty) return res.status(400).json({ error: `Sin stock suficiente para: ${product.name}` });
            total += product.price * item.qty;
            orderItems.push({ productId: product.id, qty: item.qty, price: product.price });
        }
        const order = await prisma.order.create({
            data: { userId: req.user.id, total, status: "pendiente", items: { create: orderItems } },
            include: { items: { include: { product: true } } },
        });
        for (const item of items) {
            await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } });
        }
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
            include: { items: { include: { product: { select: { name: true, image: true } } } } },
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
                items: { include: { product: { select: { name: true } } } },
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
EOF