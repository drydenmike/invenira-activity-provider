export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.origin;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    function jsonResponse(data) {
      return new Response(JSON.stringify(data), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json;charset=UTF-8"
        }
      });
    }

    function htmlResponse(html) {
      return new Response(html, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/html;charset=UTF-8"
        }
      });
    }

    // 1. Rota Raiz (Health Check)
    if (url.pathname === "/" || url.pathname === "") {
      return jsonResponse({
        status: "online",
        platform: "Cloudflare Workers",
        service: "CyberRange & SOC Incident Response Activity Provider",
        invenira_registration: host + "/api/register"
      });
    }

    // 2. Registo do Activity Provider
    if (url.pathname === "/api/register") {
      return jsonResponse({
        name: "CyberRange & SOC Incident Response",
        config_url: host + "/config.html",
        json_params_url: host + "/api/json_params",
        user_url: host + "/api/deploy",
        analytics_url: host + "/api/analytics",
        analytics_list_url: host + "/api/analytics_list"
      });
    }

    // 3. Parâmetros de Configuração (json_params_url)
    if (url.pathname === "/api/json_params") {
      return jsonResponse([
        { name: "resumo_incidente", type: "text/plain" },
        { name: "tipo_ameaca", type: "text/plain" },
        { name: "pcap_download_url", type: "URL" },
        { name: "tempo_limite_minutos", type: "integer" }
      ]);
    }

    // 4. Contrato de Analíticas (analytics_list_url)
    if (url.pathname === "/api/analytics_list") {
      return jsonResponse({
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
    }

    // 5. Instanciação e Deploy (user_url - POST)
    if (url.pathname === "/api/deploy" && request.method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch (e) {}

      const stdID = body.InvenIRAstdID || body.inveniraStdID || "1001";
      const actID = body.activityID || "SOC-01";

      return jsonResponse({
        deployURL: host + "/activity.html?activityID=" + encodeURIComponent(actID) + "&inveniraStdID=" + encodeURIComponent(stdID)
      });
    }

    // 6. Analíticas Registadas (analytics_url - POST)
    if (url.pathname === "/api/analytics" && request.method === "POST") {
      return jsonResponse([
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
          qualAnalyticsURL: host + "/report.html?activityID=SOC-01&inveniraStdID=1001"
        }
      ]);
    }

    // 7. Páginas HTML de Demonstração
    if (url.pathname === "/config.html") {
      return htmlResponse("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Configuração SOC</title></head><body style=\"font-family:sans-serif;padding:24px;line-height:1.5;\"><h2>CyberRange: Configuração de Cenário de Incidente</h2><p>Interface embutida por iframe na Inven!RA para o docente parametrizar o desafio técnico.</p></body></html>");
    }

    if (url.pathname === "/activity.html") {
      const actID = url.searchParams.get("activityID") || "SOC-01";
      const stdID = url.searchParams.get("inveniraStdID") || "1001";
      return htmlResponse("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Consola SOC</title></head><body style=\"font-family:sans-serif;padding:24px;line-height:1.5;\"><h2>Consola de Investigação SOC - CyberRange</h2><p>Sessão ativa para o estudante <strong>" + stdID + "</strong> (Atividade: " + actID + ").</p></body></html>");
    }

    if (url.pathname === "/report.html") {
      return htmlResponse("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Relatório Post-Mortem</title></head><body style=\"font-family:sans-serif;padding:24px;line-height:1.5;\"><h2>Relatório Técnico Post-Mortem (Qualitativo)</h2><p>Evidências e IoCs reportados durante a mitigação do incidente.</p></body></html>");
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
