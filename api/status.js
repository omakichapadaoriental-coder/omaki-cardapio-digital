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
  const repoUrl = 'https://api.github.com/repos/omakichapadaoriental-coder/omaki-cardapio-digital/contents/data/status.json';

  if (req.method === 'GET') {
    try {
      const headers = { 'User-Agent': 'Omaki-Admin' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const getRes = await fetch(repoUrl, { headers });
      if (!getRes.ok) {
        return res.status(200).json({
          deliveryActive: true,
          manualDeliveryOverride: null,
          deliveryClosedReason: '',
          soldOutIds: [],
          lastUpdated: new Date().toISOString()
        });
      }
      const fileData = await getRes.json();
      const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
      return res.status(200).json(content);
    } catch (err) {
      return res.status(200).json({
        deliveryActive: true,
        manualDeliveryOverride: null,
        deliveryClosedReason: '',
        soldOutIds: [],
        lastUpdated: new Date().toISOString(),
        error: err.message
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { pin, deliveryActive, manualDeliveryOverride, deliveryClosedReason, soldOutIds } = body || {};

      if (pin !== '1234' && pin !== 'omaki2026') {
        return res.status(401).json({ error: 'PIN de segurança incorreto. Tente novamente.' });
      }

      if (!token) {
        return res.status(500).json({ error: 'GITHUB_PAT não configurado no ambiente Vercel.' });
      }

      // 1. Fetch current file to get SHA
      const getRes = await fetch(repoUrl, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Omaki-Admin'
        }
      });
      if (!getRes.ok) {
        throw new Error('Falha ao obter status atual do repositório.');
      }
      const fileData = await getRes.json();
      const currentSha = fileData.sha;

      // 2. Prepare new status
      const newStatus = {
        deliveryActive: typeof deliveryActive === 'boolean' ? deliveryActive : true,
        manualDeliveryOverride: manualDeliveryOverride !== undefined ? manualDeliveryOverride : null,
        deliveryClosedReason: deliveryClosedReason || '',
        soldOutIds: Array.isArray(soldOutIds) ? soldOutIds : [],
        lastUpdated: new Date().toISOString()
      };

      const newContentBase64 = Buffer.from(JSON.stringify(newStatus, null, 2)).toString('base64');

      // 3. Commit new status to GitHub
      const putRes = await fetch(repoUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Omaki-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'chore(admin): atualizar status operacional [skip ci]',
          content: newContentBase64,
          sha: currentSha
        })
      });

      if (!putRes.ok) {
        const errorData = await putRes.text();
        return res.status(500).json({ error: 'Erro ao atualizar GitHub', details: errorData });
      }

      return res.status(200).json({ success: true, state: newStatus });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
