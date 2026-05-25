const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, isAdmin } = require("../middleware/auth");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { category, search, brand, minPrice, maxPrice, size, sort } = req.query;
  try {
    const where = { active: true };

    if (category && category !== "todos") where.category = category;
    if (brand) where.brand = brand;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (size) where.sizes = { has: size };

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    const products = await prisma.product.findMany({ where, orderBy });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.get("/brands", async (req, res) => {
  try {
    const brands = await prisma.product.findMany({
      where: { active: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    });
    res.json(brands.map((b) => b.brand).filter(Boolean));
  } catch {
    res.status(500).json({ error: "Error al obtener marcas" });
  }
});

router.get("/:id", async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: "ID de producto inválido" });
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { name, price, image, images, category, brand, stock, description, sizes, colors, discount } = req.body;
  if (!name || !price || !category)
    return res.status(400).json({ error: "Nombre, precio y categoría son requeridos" });
  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        image: image || `https://picsum.photos/seed/${Date.now()}/400/280`,
        images: images || [],
        category,
        brand: brand || null,
        stock: Number(stock) || 10,
        description: description || null,
        sizes: sizes || [],
        colors: colors || [],
        discount: discount ? Number(discount) : null,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: "ID de producto inválido" });
  const { name, price, image, images, category, brand, stock, description, sizes, colors, discount, active } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name        !== undefined ? { name }                        : {}),
        ...(price       !== undefined ? { price: Number(price) }        : {}),
        ...(image       !== undefined ? { image }                       : {}),
        ...(images      !== undefined ? { images }                      : {}),
        ...(category    !== undefined ? { category }                    : {}),
        ...(brand       !== undefined ? { brand }                       : {}),
        ...(stock       !== undefined ? { stock: Number(stock) }        : {}),
        ...(description !== undefined ? { description }                 : {}),
        ...(sizes       !== undefined ? { sizes }                       : {}),
        ...(colors      !== undefined ? { colors }                      : {}),
        ...(discount    !== undefined ? { discount: discount ? Number(discount) : null } : {}),
        ...(active      !== undefined ? { active }                      : {}),
      },
    });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: "ID de producto inválido" });
  try {
    await prisma.product.update({ where: { id: productId }, data: { active: false } });
    res.json({ message: "Producto desactivado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

module.exports = router;
