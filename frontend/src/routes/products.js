cat > backend / src / routes / products.js << 'EOF'
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, isAdmin } = require("../middleware/auth");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    const { category, search } = req.query;
    try {
        const products = await prisma.product.findMany({
            where: {
                active: true,
                ...(category && category !== "todos" ? { category } : {}),
                ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(product);
    } catch {
        res.status(500).json({ error: "Error al obtener producto" });
    }
});

router.post("/", verifyToken, isAdmin, async (req, res) => {
    const { name, price, image, category, stock, description } = req.body;
    if (!name || !price || !category)
        return res.status(400).json({ error: "Nombre, precio y categoría son requeridos" });
    try {
        const product = await prisma.product.create({
            data: {
                name,
                price: Number(price),
                image: image || `https://picsum.photos/seed/${Date.now()}/400/280`,
                category,
                stock: Number(stock) || 10,
                description: description || null,
            },
        });
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    const { name, price, image, category, stock, description, active } = req.body;
    try {
        const product = await prisma.product.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(price !== undefined ? { price: Number(price) } : {}),
                ...(image !== undefined ? { image } : {}),
                ...(category !== undefined ? { category } : {}),
                ...(stock !== undefined ? { stock: Number(stock) } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(active !== undefined ? { active } : {}),
            },
        });
        res.json(product);
    } catch {
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        await prisma.product.update({ where: { id: Number(req.params.id) }, data: { active: false } });
        res.json({ message: "Producto desactivado" });
    } catch {
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});

module.exports = router;
EOF