const fs = require('fs');
const path = require('path');

const action = process.argv[2] || 'pause';

function getSecretToken() {
  if (process.env.GITHUB_PAT) return process.env.GITHUB_PAT;
  try {
    const p = path.join(__dirname, 'admin_secret.json');
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (data && data.token) return data.token;
    }
  } catch (e) {}
  return '';
}

async function main() {
  console.log(`\n========================================`);
  console.log(`   OMAKI SUSHI — CONTROLE DE ENTREGAS   `);
  console.log(`========================================\n`);

  let manualOverride = null;
  let active = true;
  let reason = '';

  if (action === 'pause' || action === 'encerrar' || action === 'fechar') {
    manualOverride = false;
    active = false;
    reason = 'Encerrado pela gerência via painel rápido';
    console.log('>>> AÇÃO: ENCERRAR / PAUSAR ENTREGAS (Apenas Retirada ativa)');
  } else if (action === 'open' || action === 'abrir' || action === 'reativar') {
    manualOverride = true;
    active = true;
    reason = '';
    console.log('>>> AÇÃO: REATIVAR ENTREGAS (Delivery liberado)');
  } else {
    manualOverride = null;
    active = true;
    reason = '';
    console.log('>>> AÇÃO: RESTAURAR HORÁRIO AUTOMÁTICO (18:20 às 22:30)');
  }

  try {
    const token = getSecretToken();
    if (!token) {
      console.error('[ERRO] Token de acesso não configurado em admin_secret.json');
      return;
    }

    const repoUrl = 'https://api.github.com/repos/omakichapadaoriental-coder/omaki-cardapio-digital/contents/data/status.json';

    const getRes = await fetch(repoUrl, {
      headers: { 'Authorization': 'Bearer ' + token, 'User-Agent': 'Omaki-Admin' }
    });
    const fileData = await getRes.json();
    const currentSha = fileData.sha;
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

    currentContent.deliveryActive = active;
    currentContent.manualDeliveryOverride = manualOverride;
    currentContent.deliveryClosedReason = reason;
    currentContent.lastUpdated = new Date().toISOString();

    const newBase64 = Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64');

    const putRes = await fetch(repoUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Omaki-Admin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `chore(admin): ${action} entregas via script rápido [skip ci]`,
        content: newBase64,
        sha: currentSha
      })
    });

    if (putRes.ok) {
      console.log('\n[SUCESSO] Status atualizado no servidor com sucesso!');
      if (manualOverride === false) {
        console.log('STATUS ATUAL: [ 🔴 ENTREGAS ENCERRADAS ]');
        console.log('Clientes que acessarem o cardápio verão aviso e apenas Retirada no Balcão.\n');
      } else if (manualOverride === true) {
        console.log('STATUS ATUAL: [ 🟢 ENTREGAS ABERTAS ]');
        console.log('Clientes já podem pedir via Delivery normalmente.\n');
      } else {
        console.log('STATUS ATUAL: [ ⏱️ HORÁRIO PADRÃO (18:20 às 22:30) ]\n');
      }
    } else {
      console.error('\n[ERRO] Falha ao enviar atualização:', await putRes.text());
    }
  } catch (err) {
    console.error('\n[ERRO]', err.message);
  }
}

main();
