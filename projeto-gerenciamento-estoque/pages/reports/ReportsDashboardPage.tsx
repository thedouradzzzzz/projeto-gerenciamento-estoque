

import React, { useMemo } from 'react';
import type { Product, Asset, Company } from '../../types';
import { AssetStatus, Company as CompanyEnum } from '../../types'; // Import CompanyEnum
import { ArchiveBoxIcon, WrenchScrewdriverIcon, TagIcon, ChartPieIcon, ExclamationTriangleIcon } from '../../components/icons/Icons';
import { COMPANY_OPTIONS } from '../../constants';


interface ReportsDashboardPageProps {
  products: Product[];
  assets: Asset[];
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  colorClass?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, description, colorClass = 'bg-blue-600' }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-start space-x-4 hover:shadow-xl transition-shadow">
    <div className={`p-3 rounded-full ${colorClass} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  </div>
);


const ReportsDashboardPage: React.FC<ReportsDashboardPageProps> = ({ products, assets }) => {
  const totalProductStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.quantity, 0);
  }, [products]);

  const uniqueProductTypes = useMemo(() => {
    const types = new Set(products.map(p => p.type));
    return types.size;
  }, [products]);

  const totalAssets = useMemo(() => {
    return assets.length;
  }, [assets]);

  const assetStatusDistribution = useMemo(() => {
    const distribution: Record<AssetStatus, number> = {
      [AssetStatus.IN_USE]: 0,
      [AssetStatus.AVAILABLE]: 0,
      [AssetStatus.MAINTENANCE]: 0,
    };
    assets.forEach(asset => {
      if (distribution[asset.status] !== undefined) {
        distribution[asset.status]++;
      }
    });
    return distribution;
  }, [assets]);

  const lowStockAlerts = useMemo(() => {
    const alertsByCompany: Record<Company, Product[]> = {
      [CompanyEnum.CATARINENSE]: [],
      [CompanyEnum.ABPLAST]: [],
      [CompanyEnum.CATARINENSE_FILIAL]: [], 
    };
    products.forEach(product => {
      if (product.quantity < 5) {
        if (alertsByCompany[product.company]) {
          alertsByCompany[product.company].push(product);
        } else {
          // Fallback if company not in enum, though ideally it should always be.
          console.warn(`Produto ${product.id} com empresa desconhecida ou não mapeada: ${product.company}`);
        }
      }
    });
    return alertsByCompany;
  }, [products]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard de Relatórios</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total de Produtos em Estoque"
          value={totalProductStock}
          icon={<ArchiveBoxIcon className="h-6 w-6" />}
          description="Soma das quantidades de todos os produtos."
          colorClass="bg-green-500"
        />
        <KpiCard 
          title="Tipos de Produtos Únicos"
          value={uniqueProductTypes}
          icon={<TagIcon className="h-6 w-6" />}
          description="Número de categorias de produtos distintas."
           colorClass="bg-indigo-500"
        />
        <KpiCard 
          title="Total de Ativos Cadastrados"
          value={totalAssets}
          icon={<WrenchScrewdriverIcon className="h-6 w-6" />}
          description="Número total de ativos gerenciados."
           colorClass="bg-sky-500"
        />
         <KpiCard 
          title="Ativos em Manutenção"
          value={assetStatusDistribution[AssetStatus.MAINTENANCE]}
          icon={<ChartPieIcon className="h-6 w-6" />}
          description={`Em Uso: ${assetStatusDistribution[AssetStatus.IN_USE]}, Disponível: ${assetStatusDistribution[AssetStatus.AVAILABLE]}`}
          colorClass="bg-amber-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Ativos por Status</h2>
        <div className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {Object.entries(assetStatusDistribution).map(([status, count]) => (
            <div key={status} className="text-center p-4 rounded-lg bg-gray-50 border w-full sm:w-auto flex-1">
              <p className="text-lg font-medium text-gray-600">{status}</p>
              <p className="text-4xl font-bold text-blue-600">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-yellow-500" />
          Alertas de Estoque Baixo (Menos de 5 unidades)
        </h2>
        {COMPANY_OPTIONS.map(companyOpt => {
          const alerts = lowStockAlerts[companyOpt.value as Company];
          if (!alerts || alerts.length === 0) {
            return (
              <div key={companyOpt.value} className="mb-4">
                <h3 className="text-lg font-medium text-gray-600 mb-2">{companyOpt.label}</h3>
                <p className="text-sm text-gray-500">Nenhum produto com estoque baixo.</p>
              </div>
            );
          }
          return (
            <div key={companyOpt.value} className="mb-6">
              <h3 className="text-lg font-medium text-gray-600 mb-2 border-b pb-1">{companyOpt.label}</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {alerts.map(product => (
                  <li key={product.id} className="text-red-600">
                    <span className="font-semibold">{product.brand} {product.model} ({product.type})</span> - Quantidade: {product.quantity}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {(Object.values(lowStockAlerts).every(alerts => alerts.length === 0)) && (
            <p className="text-sm text-gray-500">Nenhum alerta de estoque baixo no momento para nenhuma empresa.</p>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Gerador de Relatórios</h2>
        <p className="text-gray-600">
          Esta seção será dedicada à geração de relatórios personalizados e visualização de dados mais detalhados.
          Funcionalidades como seleção de métricas, períodos, filtros avançados e exportação serão implementadas aqui.
        </p>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;