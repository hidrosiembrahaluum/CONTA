import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Download, RefreshCw, TrendingUp, Zap } from 'lucide-react';

const HaLuumApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [claudeAnalysis, setClaudeAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');
  const [lastSync, setLastSync] = useState(new Date());
  const [newIngreso, setNewIngreso] = useState({ fecha: '', cliente: '', tipo: 'Casa', monto: '', estado: 'Pendiente', notas: '' });
  const [newGasto, setNewGasto] = useState({ fecha: '', categoria: 'Insumos', monto: '', quien: 'Guillermo', descripcion: '' });
  const localCacheRef = useRef({ ingresos: [], gastos: [], lastUpdate: null });

  const SHEET_ID = '1q46w9hn7M6aAOZCCmuTtdLXPMhTfeh1Z7VdPhWHT2lE';
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDummyKey';
  const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || 'sk-ant-dummykey';

  // Sincronización con cache local
  const syncWithSheets = async () => {
    setSyncStatus('Sincronizando...');
    try {
      // En producción, aquí va el fetch real a Google Sheets API
      // Por ahora simularemos con datos de ejemplo
      const mockIngresos = [
        { fecha: '2025-01-15', cliente: 'Casa García', tipo: 'Casa', monto: 8000, estado: 'Pagado', notas: 'Primera obra' },
        { fecha: '2025-01-22', cliente: 'Proyecto Residencial', tipo: 'Proyecto Mediano', monto: 25000, estado: 'Pagado', notas: 'Terrazo común' },
      ];
      const mockGastos = [
        { fecha: '2025-01-10', categoria: 'Insumos', monto: 3000, quien: 'Guillermo', descripcion: 'Fibra de coco' },
        { fecha: '2025-01-12', categoria: 'Gasolina', monto: 500, quien: 'Bruno', descripcion: 'Gasolina obra García' },
        { fecha: '2025-01-20', categoria: 'Publicidad', monto: 2000, quien: 'Guillermo', descripcion: 'Anuncios Facebook' },
      ];

      localCacheRef.current = {
        ingresos: mockIngresos,
        gastos: mockGastos,
        lastUpdate: Date.now()
      };

      setIngresos(mockIngresos);
      setGastos(mockGastos);
      calcularResumen(mockIngresos, mockGastos);
      setSyncStatus(`Sincronizado hace ${new Date().toLocaleTimeString()}`);
      setLastSync(new Date());
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
    }
  };

  // Cálculo de resumen financiero
  const calcularResumen = (ingresosData, gastosData) => {
    const ingresoTotal = ingresosData
      .filter(i => i.estado === 'Pagado')
      .reduce((sum, i) => sum + parseFloat(i.monto || 0), 0);
    
    const gastoTotal = gastosData.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
    
    const ivaAcumulado = ingresoTotal * 0.16;
    const gananciaAntesImpuestos = ingresoTotal - gastoTotal;
    const gananciaNetaReal = gananciaAntesImpuestos - ivaAcumulado;
    
    // Repartición: 20% (10% fondo, 10% inversión) + 50/50 resto
    const fondoReserva = gananciaNetaReal * 0.10;
    const inversion = gananciaNetaReal * 0.10;
    const gananciaDistribuible = gananciaNetaReal * 0.80;
    
    const guillermo = gananciaDistribuible * 0.5;
    const bruno = gananciaDistribuible * 0.5;

    const gastosPorCategoria = {};
    gastosData.forEach(g => {
      gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + parseFloat(g.monto || 0);
    });

    const gastosPorPersona = {};
    gastosData.forEach(g => {
      gastosPorPersona[g.quien] = (gastosPorPersona[g.quien] || 0) + parseFloat(g.monto || 0);
    });

    setResumen({
      ingresoTotal,
      gastoTotal,
      gananciaAntesImpuestos,
      ivaAcumulado,
      gananciaNetaReal,
      fondoReserva,
      inversion,
      guillermo,
      bruno,
      gastosPorCategoria,
      gastosPorPersona,
      proyectosCount: ingresosData.length,
      tasaPago: ingresosData.filter(i => i.estado === 'Pagado').length / ingresosData.length
    });
  };

  // Análisis con Claude
  const obtenerAnalisisClause = async () => {
    if (!resumen) return;
    setLoading(true);
    try {
      const prompt = `Analiza estos datos financieros de Ha'Lu'Um (empresa de hydroseeding en Cancún):
      
Período: Este mes
Ingresos totales: $${resumen.ingresoTotal.toFixed(2)} MXN
Gastos totales: $${resumen.gastoTotal.toFixed(2)} MXN
Ganancia neta: $${resumen.gananciaNetaReal.toFixed(2)} MXN
IVA acumulado: $${resumen.ivaAcumulado.toFixed(2)} MXN
Objetivo mensual: $50,000 MXN
Proyectos completados: ${resumen.proyectosCount}
Tasa de pago: ${(resumen.tasaPago * 100).toFixed(0)}%

Gastos por categoría:
${Object.entries(resumen.gastosPorCategoria).map(([cat, monto]) => `- ${cat}: $${monto.toFixed(2)}`).join('\n')}

Gastos por persona:
${Object.entries(resumen.gastosPorPersona).map(([person, monto]) => `- ${person}: $${monto.toFixed(2)}`).join('\n')}

Proporciona:
1. Análisis breve de tendencias (1 párrafo)
2. 2-3 acciones inmediatas para alcanzar $50k/mes
3. 1 alerta o riesgo detectado
4. Proyección: si mantienen este ritmo, ¿cuándo llegan a $50k/mes?`;

      // Simulación: En producción, aquí va llamada real a Claude API
      const mockAnalysis = `📊 ANÁLISIS AUTOMÁTICO - Ha'Lu'Um

Tendencia: Excelente inicio. Con $${resumen.ingresoTotal.toFixed(0)} en ingresos y márgenes saludables, el negocio escala bien. Gastos controlados (${((resumen.gastoTotal / resumen.ingresoTotal) * 100).toFixed(0)}% de ingresos).

🎯 Acciones inmediatas:
1. Acelerar cierre de 2-3 proyectos medianos más este mes (cada uno suma ~$20-25k)
2. Reducir ciclo de pago de clientes (${(resumen.tasaPago * 100).toFixed(0)}% pagan, optimizar cobranza)
3. Revisar gastos de publicidad: $${resumen.gastosPorCategoria['Publicidad'] || 0} invertidos, medir ROI

⚠️ Alerta: IVA acumulado es $${resumen.ivaAcumulado.toFixed(0)}. Reservar efectivo para SAT en fin de mes.

📈 Proyección: A este ritmo, llegarán a $50k/mes en ~3-4 meses si consiguen 1.5 proyectos medianos más por mes.`;

      setClaudeAnalysis(mockAnalysis);
    } catch (error) {
      setClaudeAnalysis(`Error al obtener análisis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Agregar ingreso
  const agregarIngreso = () => {
    if (!newIngreso.fecha || !newIngreso.cliente || !newIngreso.monto) {
      alert('Completa todos los campos');
      return;
    }
    const actualizado = [...ingresos, { ...newIngreso, monto: parseFloat(newIngreso.monto) }];
    setIngresos(actualizado);
    calcularResumen(actualizado, gastos);
    setNewIngreso({ fecha: '', cliente: '', tipo: 'Casa', monto: '', estado: 'Pendiente', notas: '' });
    setSyncStatus('Cambios sin sincronizar');
  };

  // Agregar gasto
  const agregarGasto = () => {
    if (!newGasto.fecha || !newGasto.monto) {
      alert('Completa todos los campos');
      return;
    }
    const actualizado = [...gastos, { ...newGasto, monto: parseFloat(newGasto.monto) }];
    setGastos(actualizado);
    calcularResumen(ingresos, actualizado);
    setNewGasto({ fecha: '', categoria: 'Insumos', monto: '', quien: 'Guillermo', descripcion: '' });
    setSyncStatus('Cambios sin sincronizar');
  };

  // Descargar PDF
  const descargarPDF = () => {
    if (!resumen) return;
    const contenido = `
HA'LU'UM - REPORTE FINANCIERO
==============================
Fecha: ${new Date().toLocaleDateString('es-MX')}

INGRESOS
Total: $${resumen.ingresoTotal.toFixed(2)} MXN
Proyectos: ${resumen.proyectosCount}

GASTOS
${Object.entries(resumen.gastosPorCategoria).map(([cat, monto]) => `${cat}: $${monto.toFixed(2)}`).join('\n')}
Total: $${resumen.gastoTotal.toFixed(2)} MXN

GANANCIA
IVA (16%): $${resumen.ivaAcumulado.toFixed(2)} MXN
Ganancia Neta: $${resumen.gananciaNetaReal.toFixed(2)} MXN

REPARTICIÓN
Fondo Reserva (10%): $${resumen.fondoReserva.toFixed(2)} MXN
Inversiones (10%): $${resumen.inversion.toFixed(2)} MXN
Guillermo (40%): $${resumen.guillermo.toFixed(2)} MXN
Bruno (40%): $${resumen.bruno.toFixed(2)} MXN
    `.trim();
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ha-Luum-Reporte-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  useEffect(() => {
    syncWithSheets();
    const interval = setInterval(syncWithSheets, 30000); // Cada 30 seg
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#008B8B', '#32CD32', '#FF6B6B', '#4ECDC4', '#FFE66D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-lg border border-teal-500/30">
          <div>
            <h1 className="text-3xl font-bold text-teal-400">Ha'Lu'Um Contabilidad</h1>
            <p className="text-slate-400 text-sm">Hydroseeding & Revegetación, Cancún</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">{syncStatus}</p>
            <p className="text-xs text-slate-500">Última sync: {lastSync.toLocaleTimeString('es-MX')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['dashboard', 'ingresos', 'gastos', 'analisis', 'reportes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-medium transition ${
                activeTab === tab
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && resumen && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-teal-500/30">
                <p className="text-slate-400 text-sm">Ingresos</p>
                <p className="text-2xl font-bold text-teal-400">${resumen.ingresoTotal.toFixed(0)}</p>
                <p className="text-xs text-slate-500">{resumen.proyectosCount} proyectos</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg border border-lime-500/30">
                <p className="text-slate-400 text-sm">Ganancia Neta</p>
                <p className="text-2xl font-bold text-lime-400">${resumen.gananciaNetaReal.toFixed(0)}</p>
                <p className="text-xs text-slate-500">Después de IVA</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg border border-orange-500/30">
                <p className="text-slate-400 text-sm">IVA Acumulado</p>
                <p className="text-2xl font-bold text-orange-400">${resumen.ivaAcumulado.toFixed(0)}</p>
                <p className="text-xs text-slate-500">Para SAT</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg border border-blue-500/30">
                <p className="text-slate-400 text-sm">Gastos</p>
                <p className="text-2xl font-bold text-blue-400">${resumen.gastoTotal.toFixed(0)}</p>
                <p className="text-xs text-slate-500">{((resumen.gastoTotal / resumen.ingresoTotal) * 100).toFixed(0)}% de ingresos</p>
              </div>
            </div>

            {/* Repartición */}
            <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap size={20} className="text-lime-400" />
                Repartición de Ganancias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-600/50 p-3 rounded">
                  <p className="text-xs text-slate-400">Fondo Reserva</p>
                  <p className="text-lg font-bold text-blue-400">${resumen.fondoReserva.toFixed(0)}</p>
                </div>
                <div className="bg-slate-600/50 p-3 rounded">
                  <p className="text-xs text-slate-400">Inversiones</p>
                  <p className="text-lg font-bold text-purple-400">${resumen.inversion.toFixed(0)}</p>
                </div>
                <div className="bg-slate-600/50 p-3 rounded border-l-4 border-teal-500">
                  <p className="text-xs text-slate-400">Guillermo (50%)</p>
                  <p className="text-lg font-bold text-teal-400">${resumen.guillermo.toFixed(0)}</p>
                </div>
                <div className="bg-slate-600/50 p-3 rounded border-l-4 border-lime-500">
                  <p className="text-xs text-slate-400">Bruno (50%)</p>
                  <p className="text-lg font-bold text-lime-400">${resumen.bruno.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30">
                <h3 className="text-lg font-bold mb-4">Gastos por Categoría</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(resumen.gastosPorCategoria).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(resumen.gastosPorCategoria).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30">
                <h3 className="text-lg font-bold mb-4">Gastos por Persona</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(resumen.gastosPorPersona).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0d9488' }} />
                    <Bar dataKey="value" fill="#32CD32" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Ingresos Tab */}
        {activeTab === 'ingresos' && (
          <div className="space-y-6">
            <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30">
              <h2 className="text-xl font-bold mb-4">Agregar Ingreso</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="date"
                  value={newIngreso.fecha}
                  onChange={e => setNewIngreso({ ...newIngreso, fecha: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
                <input
                  placeholder="Cliente"
                  value={newIngreso.cliente}
                  onChange={e => setNewIngreso({ ...newIngreso, cliente: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
                <select
                  value={newIngreso.tipo}
                  onChange={e => setNewIngreso({ ...newIngreso, tipo: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option>Casa</option>
                  <option>Proyecto Mediano</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="number"
                  placeholder="Monto"
                  value={newIngreso.monto}
                  onChange={e => setNewIngreso({ ...newIngreso, monto: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
                <select
                  value={newIngreso.estado}
                  onChange={e => setNewIngreso({ ...newIngreso, estado: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option>Pagado</option>
                  <option>Pendiente</option>
                </select>
                <input
                  placeholder="Notas"
                  value={newIngreso.notas}
                  onChange={e => setNewIngreso({ ...newIngreso, notas: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
              </div>
              <button
                onClick={agregarIngreso}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded transition"
              >
                Agregar Ingreso
              </button>
            </div>

            <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30 overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">Historial de Ingresos</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-right py-2">Monto</th>
                    <th className="text-left py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.map((ing, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-600/30">
                      <td className="py-2">{ing.fecha}</td>
                      <td className="py-2">{ing.cliente}</td>
                      <td className="py-2">{ing.tipo}</td>
                      <td className="text-right py-2 text-teal-400 font-bold">${ing.monto.toFixed(0)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${ing.estado === 'Pagado' ? 'bg-green-500/30 text-green-300' : 'bg-orange-500/30 text-orange-300'}`}>
                          {ing.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gastos Tab */}
        {activeTab === 'gastos' && (
          <div className="space-y-6">
            <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30">
              <h2 className="text-xl font-bold mb-4">Agregar Gasto</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="date"
                  value={newGasto.fecha}
                  onChange={e => setNewGasto({ ...newGasto, fecha: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
                <select
                  value={newGasto.categoria}
                  onChange={e => setNewGasto({ ...newGasto, categoria: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option>Publicidad</option>
                  <option>Insumos</option>
                  <option>Gasolina</option>
                </select>
                <input
                  type="number"
                  placeholder="Monto"
                  value={newGasto.monto}
                  onChange={e => setNewGasto({ ...newGasto, monto: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <select
                  value={newGasto.quien}
                  onChange={e => setNewGasto({ ...newGasto, quien: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option>Guillermo</option>
                  <option>Bruno</option>
                </select>
                <input
                  placeholder="Descripción"
                  value={newGasto.descripcion}
                  onChange={e => setNewGasto({ ...newGasto, descripcion: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
              </div>
              <button
                onClick={agregarGasto}
                className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 rounded transition"
              >
                Agregar Gasto
              </button>
            </div>

            <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30 overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">Historial de Gastos</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Categoría</th>
                    <th className="text-right py-2">Monto</th>
                    <th className="text-left py-2">Quién</th>
                    <th className="text-left py-2">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-600/30">
                      <td className="py-2">{gasto.fecha}</td>
                      <td className="py-2">{gasto.categoria}</td>
                      <td className="text-right py-2 text-red-400 font-bold">${gasto.monto.toFixed(0)}</td>
                      <td className="py-2">{gasto.quien}</td>
                      <td className="py-2 text-slate-400">{gasto.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Análisis Tab */}
        {activeTab === 'analisis' && (
          <div className="space-y-6">
            <button
              onClick={obtenerAnalisisClause}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              {loading ? 'Analizando...' : 'Obtener Análisis con Claude'}
            </button>
            {claudeAnalysis && (
              <div className="bg-slate-700/50 p-6 rounded-lg border border-purple-500/30 whitespace-pre-wrap text-sm leading-relaxed">
                {claudeAnalysis}
              </div>
            )}
          </div>
        )}

        {/* Reportes Tab */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            <button
              onClick={descargarPDF}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Descargar Reporte Mensual
            </button>
            {resumen && (
              <div className="bg-slate-700/50 p-6 rounded-lg border border-teal-500/30">
                <h2 className="text-xl font-bold mb-4">Resumen Fiscal</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Ingresos Totales:</span> <span className="text-teal-400 font-bold">${resumen.ingresoTotal.toFixed(2)}</span></p>
                  <p><span className="text-slate-400">Gastos Totales:</span> <span className="text-red-400 font-bold">${resumen.gastoTotal.toFixed(2)}</span></p>
                  <p><span className="text-slate-400">IVA (16%):</span> <span className="text-orange-400 font-bold">${resumen.ivaAcumulado.toFixed(2)}</span></p>
                  <p className="border-t border-slate-600 pt-2"><span className="text-slate-400">Ganancia Neta:</span> <span className="text-lime-400 font-bold">${resumen.gananciaNetaReal.toFixed(2)}</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HaLuumApp;
