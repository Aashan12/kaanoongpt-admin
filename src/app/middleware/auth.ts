export async function withAuth(handler: Function) {
  return async (req: any, res: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    return handler(req, res);
  };
}