cat > backend / src / middleware / auth.js << 'EOF'
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token requerido" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ error: "Acceso solo para administradores" });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
EOF