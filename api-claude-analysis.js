// api/claude-analysis.js - Análisis automático de datos con Claude
// Desplegar en Vercel Serverless Functions

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  const { resumen } = req.body;

  if (!resumen) {
    return res.status(400).json({ error: 'Resumen financiero requerido' });
  }

  try {
    const prompt = `Eres un analista financiero experto en negocios de servicios en México.

Analiza estos datos de Ha'Lu'Um (empresa de hydroseeding en Cancún, Quintana Roo):

DATOS FINANCIEROS:
- Ingresos totales: $${resumen.ingresoTotal.toFixed(2)} MXN
- Gastos totales: $${resumen.gastoTotal.toFixed(2)} MXN
- Ganancia neta: $${resumen.gananciaNetaReal.toFixed(2)} MXN
- IVA acumulado: $${resumen.ivaAcumulado.toFixed(2)} MXN
- Objetivo mensual: $50,000 MXN
- Proyectos completados: ${resumen.proyectosCount}
- Tasa de pago: ${(resumen.tasaPago * 100).toFixed(0)}%

GASTOS POR CATEGORÍA:
${Object.entries(resumen.gastosPorCategoria)
  .map(([cat, monto]) => `- ${cat}: $${monto.toFixed(2)} MXN`)
  .join('\n')}

GASTOS POR PERSONA:
${Object.entries(resumen.gastosPorPersona)
  .map(([person, monto]) => `- ${person}: $${monto.toFixed(2)} MXN`)
  .join('\n')}

REPARTICIÓN:
- Fondo de Reserva (10%): $${resumen.fondoReserva.toFixed(2)} MXN
- Inversiones (10%): $${resumen.inversion.toFixed(2)} MXN
- Guillermo (40%): $${resumen.guillermo.toFixed(2)} MXN
- Bruno (40%): $${resumen.bruno.toFixed(2)} MXN

Por favor proporciona:

1. ANÁLISIS DE TENDENCIAS (1 párrafo): ¿Cómo va el negocio? ¿Márgenes saludables? ¿Control de gastos?

2. 3 ACCIONES INMEDIATAS para alcanzar $50k/mes:
   - Acción 1
   - Acción 2
   - Acción 3

3. ⚠️ ALERTA CRÍTICA: ¿Qué riesgo o problema ves?

4. 📈 PROYECCIÓN: Si mantienen este ritmo, ¿cuándo llegan a $50k/mes? ¿Qué falta?

5. 💡 RECOMENDACIÓN FISCAL: Con estos números, ¿qué deben preparar para el SAT?

Sé directo, práctico y enfocado en resultados. Usa lenguaje empresarial pero accesible.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250805',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    return res.status(200).json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Claude API Error:', error);
    return res.status(500).json({
      error: error.message,
      details: error.error || 'Error desconocido de Claude API',
    });
  }
}
