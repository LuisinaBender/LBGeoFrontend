import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';
import { clientesApi, repuestosApi, proveedoresApi, registrosVentaApi } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    clientes: 0,
    repuestos: 0,
    proveedores: 0,
    ventas: 0,
    ventasTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientesRes, repuestosRes, proveedoresRes, ventasRes] = await Promise.all([
          clientesApi.getAll(),
          repuestosApi.getAll(),
          proveedoresApi.getAll(),
          registrosVentaApi.getAll(),
        ]);

        const ventasTotal = ventasRes.data.reduce((sum, venta) => sum + venta.precio_total, 0);

        setStats({
          clientes: clientesRes.data.length,
          repuestos: repuestosRes.data.length,
          proveedores: proveedoresRes.data.length,
          ventas: ventasRes.data.length,
          ventasTotal,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats.clientes,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Repuestos',
      value: stats.repuestos,
      icon: Package,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Proveedores',
      value: stats.proveedores,
      icon: Truck,
      color: 'bg-purple-500',
      change: '+3%',
    },
    {
      title: 'Ventas del Mes',
      value: stats.ventas,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      change: '+15%',
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.ventasTotal.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+22%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenido a LBGeo</h1>
            <p className="text-blue-100 text-lg">Sistema de Gestión de Repuestos Automotrices</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                <span className="text-slate-500 text-sm ml-2">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-slate-900">Agregar Cliente</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-slate-900">Nuevo Repuesto</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <span className="font-medium text-slate-900">Registrar Venta</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen Mensual</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Ventas Completadas</span>
              <span className="font-semibold text-slate-900">{stats.ventas}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Promedio por Venta</span>
              <span className="font-semibold text-slate-900">
                ${stats.ventas > 0 ? Math.round(stats.ventasTotal / stats.ventas).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-medium">Total Ingresos</span>
              <span className="font-bold text-blue-900">${stats.ventasTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;