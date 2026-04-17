export function checkOwner(field = "user_id") {
  return (req, res, next) => {
    if (!req.resource || !req.user) {
      return res.status(403).json({ error: "Acceso denegado (ABAC)" });
    }

    if (req.resource[field] !== req.user.id) {
      return res.status(403).json({ error: "Acceso denegado (ABAC)" });
    }

    next();
  };
}