const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const products = [
  { name: "Casco Fox V1 Nitro", price: 350, image: "https://picsum.photos/seed/foxv1/400/280", category: "cascos", stock: 8, description: "Casco motocross certificado con ventilación optimizada." },
  { name: "Casco Bell Moto-9", price: 420, image: "https://picsum.photos/seed/bellmoto/400/280", category: "cascos", stock: 5, description: "Casco liviano con sistema EPS de seguridad." },
  { name: "Casco Alpinestars Supertech M10", price: 650, image: "https://picsum.photos/seed/alpisuper/400/280", category: "cascos", stock: 4, description: "Casco premium de fibra de carbono." },
  { name: "Casco Troy Lee Designs SE4", price: 580, image: "https://picsum.photos/seed/troylee/400/280", category: "cascos", stock: 6, description: "Diseño exclusivo con protección MIPS." },
  { name: "Casco Leatt Moto 7.5", price: 490, image: "https://picsum.photos/seed/leattcasco/400/280", category: "cascos", stock: 7, description: "Casco integral con deflector de pescozo." },
  { name: "Escape Yoshimura CRF250", price: 1200, image: "https://picsum.photos/seed/yoshicrf/400/280", category: "escapes", stock: 3, description: "Sistema de escape completo en acero inoxidable." },
  { name: "Escape FMF Gnarly 2T", price: 850, image: "https://picsum.photos/seed/fmfgnarly/400/280", category: "escapes", stock: 4, description: "Expansión para motos 2 tiempos, ganancia en torque bajo." },
  { name: "Escape Pro Circuit Ti-6 KX450", price: 1100, image: "https://picsum.photos/seed/procircuit/400/280", category: "escapes", stock: 2, description: "Silenciador de titanio de alta performance." },
  { name: "Escape HGS Full System CRF450", price: 1400, image: "https://picsum.photos/seed/hgsfull/400/280", category: "escapes", stock: 2, description: "Sistema completo de escape de competición." },
  { name: "Silenciador FMF PowerCore 4", price: 450, image: "https://picsum.photos/seed/fmfcore/400/280", category: "escapes", stock: 6, description: "Silenciador slip-on para motos 4T." },
  { name: "Pantalón Fox 360 Dvide", price: 185, image: "https://picsum.photos/seed/fox360pant/400/280", category: "indumentaria", stock: 10, description: "Pantalón MX con protecciones en rodillas." },
  { name: "Pantalón Troy Lee Designs GP", price: 200, image: "https://picsum.photos/seed/tldgp/400/280", category: "indumentaria", stock: 8, description: "Pantalón ligero con tejido elástico." },
  { name: "Jersey Fox 360 Streak", price: 90, image: "https://picsum.photos/seed/fox360jersey/400/280", category: "indumentaria", stock: 15, description: "Jersey transpirable para verano." },
  { name: "Jersey Alpinestars Racer", price: 95, image: "https://picsum.photos/seed/alpijersey/400/280", category: "indumentaria", stock: 12, description: "Jersey oficial team con fit ajustado." },
  { name: "Combo Jersey + Pantalón Fly", price: 240, image: "https://picsum.photos/seed/flycombo/400/280", category: "indumentaria", stock: 7, description: "Conjunto completo racing Fly 2024." },
  { name: "Guantes Fox Dirtpaw", price: 80, image: "https://picsum.photos/seed/foxdirtpaw/400/280", category: "indumentaria", stock: 20, description: "Guantes MX con palma reforzada." },
  { name: "Guantes Alpinestars Radar", price: 75, image: "https://picsum.photos/seed/alpiradar/400/280", category: "indumentaria", stock: 18, description: "Guantes training con grip premium." },
  { name: "Botas Fox Comp X", price: 280, image: "https://picsum.photos/seed/foxcompx/400/280", category: "botas", stock: 9, description: "Botas de entrada MX con suela Vibram." },
  { name: "Botas Alpinestars Tech 3", price: 450, image: "https://picsum.photos/seed/alpitech3/400/280", category: "botas", stock: 6, description: "Botas MX media caña con protección lateral." },
  { name: "Botas Sidi Crossfire 3", price: 520, image: "https://picsum.photos/seed/sidicross/400/280", category: "botas", stock: 4, description: "Botas de competición con sistemas de cierre rápido." },
  { name: "Botas Gaerne SG-12", price: 480, image: "https://picsum.photos/seed/gaernesg/400/280", category: "botas", stock: 5, description: "Botas de cuero italianas con forro interno." },
  { name: "Botas O'Neal Rider", price: 195, image: "https://picsum.photos/seed/onealrider/400/280", category: "botas", stock: 11, description: "Botas económicas ideales para trail y enduro." },
  { name: "Peto Thor Sentinel", price: 220, image: "https://picsum.photos/seed/thorsentinel/400/280", category: "protecciones", stock: 9, description: "Peto de protección con espaldar incluido." },
  { name: "Rodilleras Fox Launch Pro", price: 120, image: "https://picsum.photos/seed/foxlaunch/400/280", category: "protecciones", stock: 14, description: "Rodilleras con articulación libre de movimiento." },
  { name: "Rodilleras Leatt 3DF 6.0", price: 155, image: "https://picsum.photos/seed/leatt3df/400/280", category: "protecciones", stock: 10, description: "Rodilleras certificadas con espuma 3DF." },
  { name: "Neck Brace Leatt GPX 6.5", price: 390, image: "https://picsum.photos/seed/leattgpx/400/280", category: "protecciones", stock: 5, description: "Collarín de seguridad para competición." },
  { name: "Coderas Thor Force XP", price: 85, image: "https://picsum.photos/seed/thorforce/400/280", category: "protecciones", stock: 16, description: "Coderas con copa dura y interior suave." },
  { name: "Cinturón Lumbar Fox Enduro", price: 65, image: "https://picsum.photos/seed/foxenduro/400/280", category: "protecciones", stock: 13, description: "Faja lumbar para largas jornadas de enduro." },
  { name: "Gafas Fox Main II", price: 120, image: "https://picsum.photos/seed/foxmain2/400/280", category: "accesorios", stock: 18, description: "Gafas MX con lente doble anti-niebla." },
  { name: "Gafas 100% Racecraft Plus", price: 185, image: "https://picsum.photos/seed/racecraft/400/280", category: "accesorios", stock: 10, description: "Gafas con tear-off system y lente Hiper." },
  { name: "Grip ODI Lock-On MX", price: 45, image: "https://picsum.photos/seed/odilock/400/280", category: "accesorios", stock: 30, description: "Grips de doble bloqueo anti-giro." },
  { name: "Manubrio Pro Taper Evo", price: 92, image: "https://picsum.photos/seed/protaper/400/280", category: "accesorios", stock: 15, description: "Manubrio de aluminio 7075 ultra liviano." },
  { name: "Palancas ASV F3 Series", price: 78, image: "https://picsum.photos/seed/asvf3/400/280", category: "accesorios", stock: 20, description: "Palancas plegables CNC antirrotura." },
  { name: "Cadena RK 520 XSO", price: 95, image: "https://picsum.photos/seed/rk520/400/280", category: "accesorios", stock: 12, description: "Cadena de oro 520 con sello X ring." },
  { name: "Filtro de Aire Twin Air KX250", price: 55, image: "https://picsum.photos/seed/twinair/400/280", category: "accesorios", stock: 25, description: "Filtro de espuma de alto flujo pre-oilado." },
  { name: "Kit de Plásticos UFO CRF450", price: 285, image: "https://picsum.photos/seed/ufoplast/400/280", category: "accesorios", stock: 6, description: "Kit completo de carenado replica team." },
];

async function main() {
  console.log("Iniciando seed...");
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@motoshop.com" },
    update: {},
    create: { email: "admin@motoshop.com", password: hashedAdmin, name: "Administrador", role: "ADMIN" },
  });
  const hashedCliente = await bcrypt.hash("cliente123", 10);
  await prisma.user.upsert({
    where: { email: "cliente@motoshop.com" },
    update: {},
    create: { email: "cliente@motoshop.com", password: hashedCliente, name: "Cliente Prueba", role: "CLIENTE" },
  });
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("36 productos insertados");
  console.log("Usuarios creados:");
  console.log("admin@motoshop.com / admin123");
  console.log("cliente@motoshop.com / cliente123");
}

main().catch(console.error).finally(() => prisma.$disconnect());

