export function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Centralized error handler. Maps Prisma errors where helpful.
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
}
