const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz (Health check)
app.get('/', (req, res) => {
  res.json({
    status: "online",
    service: "CyberRange & SOC Incident Response Activity Provider",
    invenira_registration: `${req.protocol}://${req.get('host')}/api/register`
  });
});

// 1. JSON de Registo do Activity Provider
app.get('/api/register', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.json({
    name: "CyberRange & SOC Incident Response",
    config_url: `${host}/config.html`,
    json_params_url: `${host}/api/json_params`,
    user_url: `${host}/api/deploy`,
    analytics_url: `${host}/api/analytics`,
    analytics_list_url: `${host}/api/analytics_list`
  });
});

// 2. Parâmetros de Configuração (json_params_url)
app.get('/api/json_params', (req, res) => {
  res.json([
    { name: "resumo_incidente", type: "text/plain" },
    { name: "tipo_ameaca", type: "text/plain" },
    { name: "pcap_download_url", type: "URL" },
    { name: "tempo_limite_minutos", type: "integer" }
  ]);
});

// 3. Contrato de Analíticas (analytics_list_url)
app.get('/api/analytics_list', (req, res) => {
  res.json({
    qualAnalytics: [
      { name: "Relatorio_Post_Mortem_URL", type: "URL" }
    ],
    quantAnalytics: [
      { name: "Acesso a atividade", type: "boolean" },
      { name: "IoCs identificados (%)", type: "percentage" },
      { name: "Tempo de mitigacao (min)", type: "integer" },
      { name: "Dicas solicitadas", type: "integer" },
      { name: "Incidente mitigado com sucesso", type: "boolean" },
      { name: "Progresso na atividade (%)", type: "percentage" }
    ]
  });
});

// 4. Instanciação e Deploy (user_url)
app.post('/api/deploy', (req, res) => {
  const { activityID, InvenIRAstdID, inveniraStdID } = req.body;
  const stdID = InvenIRAstdID || inveniraStdID || "1001";
  const actID = activityID || "SOC-01";
  const host = `${req.protocol}://${req.get('host')}`;

  res.json({
    deployURL: `${host}/activity.html?activityID=${encodeURIComponent(actID)}&inveniraStdID=${encodeURIComponent(stdID)}`
  });
});

// 5. Analíticas Registadas (analytics_url)
app.post('/api/analytics', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.json([
    {
      inveniraStdID: "1001",
      quantAnalytics: [
        { name: "Acesso a atividade", type: "boolean", value: true },
        { name: "IoCs identificados (%)", type: "percentage", value: "75.00" },
        { name: "Tempo de mitigacao (min)", type: "integer", value: 25 },
        { name: "Dicas solicitadas", type: "integer", value: 1 },
        { name: "Incidente mitigado com sucesso", type: "boolean", value: true },
        { name: "Progresso na atividade (%)", type: "percentage", value: "85.00" }
      ],
      qualAnalyticsURL: `${host}/report.html?activityID=SOC-01&inveniraStdID=1001`
    }
  ]);
});

// Páginas de Interface
app.get('/config.html', (req, res) => {
  res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Configuração SOC</title></head><body style="font-family:sans-serif;padding:20px;"><h2>CyberRange: Configuração de Cenário de Incidente</h2><p>Parâmetros validados para integração com Inven!RA.</p></body></html>');
});
app.get('/activity.html', (req, res) => {
  res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Consola SOC</title></head><body style="font-family:sans-serif;padding:20px;"><h2>Consola de Investigação SOC</h2><p>Aluno ativo no laboratório prático.</p></body></html>');
});
app.get('/report.html', (req, res) => {
  res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório</title></head><body style="font-family:sans-serif;padding:20px;"><h2>Relatório Técnico Post-Mortem</h2><p>Avaliação qualitativa do incidente.</p></body></html>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
