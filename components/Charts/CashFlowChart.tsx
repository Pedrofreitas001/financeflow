
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const CashFlowChart: React.FC = () => {
  const { agregadoMensal } = useFinance();

  const formatYAxis = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `R$${(value / 1000000).toFixed(1)}mi`;
    } else if (absValue >= 1000) {
      return `R$${(value / 1000).toFixed(0)}k`;
    }
    return `R$${value.toFixed(0)}`;
  };

  return (
    <div className="bg-[#1c2720] border border-[#3b5445] rounded-xl p-6 flex flex-col h-[420px] w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-white font-semibold text-base">Fluxo de Caixa Dinâmico</h3>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={agregadoMensal} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#3b5445" strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9db9a8', fontSize: 9 }} 
              dy={5} 
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9db9a8', fontSize: 9 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff0a' }}
              contentStyle={{ backgroundColor: '#1c2720', border: '1px solid #3b5445', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontSize: '10px', color: '#fff', padding: '2px 0' }}
              labelStyle={{ color: '#fff', fontSize: '11px', marginBottom: '4px' }}
              formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '10px', fontSize: '9px', color: '#9db9a8' }}
            />
            <Bar dataKey="inflow" name="Entradas" fill="#0ebe54" radius={[3, 3, 0, 0]} barSize={12} />
            <Bar dataKey="outflow" name="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
