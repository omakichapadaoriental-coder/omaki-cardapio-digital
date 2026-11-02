export default async function handler(req, res) {
  // CORS & No-Cache
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.GITHUB_PAT || '';
  const repoUrl = 'https://api.github.com/repos/omakichapadaoriental-coder/omaki-cardapio-digital/contents/data/orders.json';

  // GET: Return orders & abandoned carts
  if (req.method === 'GET') {
    try {
      const headers = { 'User-Agent': 'Omaki-Admin' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const getRes = await fetch(repoUrl, { headers });
      if (!getRes.ok) {
        return res.status(200).json({
          orders: [],
          abandonedCarts: [],
          lastUpdated: new Date().toISOString()
        });
      }
      const fileData = await getRes.json();
      const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
      return res.status(200).json(content);
    } catch (err) {
      return res.status(200).json({
        orders: [],
        abandonedCarts: [],
        lastUpdated: new Date().toISOString(),
        error: err.message
      });
    }
  }

  // POST: Record an order or an abandoned cart
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { action, order, abandonedCart, pin } = body || {};

      if (!token) {
        return res.status(200).json({ success: false, warning: 'GITHUB_PAT não configurado no ambiente Vercel.' });
      }

      // 1. Fetch current file
      const headers = {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Omaki-Admin'
      };
      const getRes = await fetch(repoUrl, { headers });
      let currentSha = '';
      let currentData = { orders: [], abandonedCarts: [] };

      if (getRes.ok) {
        const fileData = await getRes.json();
        currentSha = fileData.sha;
        try {
          currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
        } catch (e) {}
      }

      if (!Array.isArray(currentData.orders)) currentData.orders = [];
      if (!Array.isArray(currentData.abandonedCarts)) currentData.abandonedCarts = [];

      // 2. Handle actions
      if (action === 'new_order' && order) {
        // Add order at top
        const newEntry = {
          id: 'OMK-' + Math.floor(1000 + Math.random() * 9000),
          createdAt: new Date().toISOString(),
          customerName: order.customerName || 'Cliente',
          customerPhone: order.customerPhone || '',
          deliveryType: order.deliveryType || 'takeaway',
          address: order.address || '',
          neighborhood: order.neighborhood || '',
          paymentMethod: order.paymentMethod || 'PIX',
          changeFor: order.changeFor || '',
          subtotal: order.subtotal || 0,
          total: order.total || 0,
          notes: order.notes || '',
          items: Array.isArray(order.items) ? order.items : []
        };
        currentData.orders.unshift(newEntry);
        // Keep at most 120 orders
        currentData.orders = currentData.orders.slice(0, 120);

        // Remove from abandonedCarts if matching phone/name
        if (order.customerPhone) {
          currentData.abandonedCarts = currentData.abandonedCarts.filter(
            c => c.customerPhone !== order.customerPhone
          );
        }
      } else if (action === 'abandoned_cart' && abandonedCart) {
        // Prevent duplicate abandoned carts from same session in a 10 min window
        const now = Date.now();
        const existingIdx = currentData.abandonedCarts.findIndex(
          c => (c.sessionId && c.sessionId === abandonedCart.sessionId) || 
               (c.customerPhone && c.customerPhone === abandonedCart.customerPhone)
        );

        const entry = {
          id: 'ABN-' + Math.floor(1000 + Math.random() * 9000),
          createdAt: new Date().toISOString(),
          sessionId: abandonedCart.sessionId || '',
          customerName: abandonedCart.customerName || 'Não identificado',
          customerPhone: abandonedCart.customerPhone || '',
          subtotal: abandonedCart.subtotal || 0,
          itemsCount: abandonedCart.itemsCount || 0,
          itemsSummary: abandonedCart.itemsSummary || '',
          stepReached: abandonedCart.stepReached || 'checkout'
        };

        if (existingIdx >= 0) {
          currentData.abandonedCarts[existingIdx] = entry;
        } else {
          currentData.abandonedCarts.unshift(entry);
        }
        // Keep at most 60 abandoned carts
        currentData.abandonedCarts = currentData.abandonedCarts.slice(0, 60);
      } else if (action === 'clear' && (pin === '1234' || pin === 'omaki2026')) {
        currentData.orders = [];
        currentData.abandonedCarts = [];
      }

      currentData.lastUpdated = new Date().toISOString();

      // 3. Commit back to GitHub
      const newContentBase64 = Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64');
      const putRes = await fetch(repoUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Omaki-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'chore(orders): registrar evento no cardapio [skip ci]',
          content: newContentBase64,
          ...(currentSha ? { sha: currentSha } : {})
        })
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        return res.status(500).json({ error: 'Erro ao salvar no GitHub: ' + errText });
      }

      return res.status(200).json({ success: true, count: currentData.orders.length });
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
