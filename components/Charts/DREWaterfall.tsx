
import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const DREWaterfall: React.FC = () => {
  const { dadosFiltrados } = useFinance();

  const formatYAxis = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `R$${(value / 1000000).toFixed(1)}mi`;
    } else if (absValue >= 1000) {
      return `R$${(value / 1000).toFixed(0)}k`;
    }
    return `R$${value.toFixed(0)}`;
  };

  const formatLabel = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(1)}mi`;
    } else if (absValue >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toFixed(0);
  };

  const data = React.useMemo(() => {
    const sum = (cat: string) => Math.abs(dadosFiltrados.filter(d => d.categoria.toUpperCase().includes(cat.toUpperCase())).reduce((acc, curr) => acc + curr.valor, 0));
    
    const fatBruto = sum("Faturamento Bruto");
    const imposto = sum("Imposto Variável");
    const custoVar = sum("Custo Variável");
    const margem = fatBruto - imposto - custoVar;
    const custoFixo = sum("Custo Fixo (R$)");
    const resultado = sum("RESULTADO (R$)");

    const steps = [
      { name: 'Fat. Bruto', value: fatBruto, type: 'start' },
      { name: 'Impostos', value: -imposto, type: 'relative' },
      { name: 'Custo Var.', value: -custoVar, type: 'relative' },
      { name: 'Margem Cont.', value: margem, type: 'total' },
      { name: 'Custo Fixo', value: -custoFixo, type: 'relative' },
      { name: 'Resultado', value: resultado, type: 'total' }
    ];

    let current = 0;
    return steps.map(s => {
      const prev = current;
      if (s.type === 'total') {
        current = s.value;
        return { ...s, start: 0, display: Math.abs(s.value), actual: s.value };
      } else {
        current += s.value;
        const start = s.value > 0 ? prev : current;
        return { ...s, start, display: Math.abs(s.value), actual: s.value };
      }
    });
  }, [dadosFiltrados]);

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-6 h-[400px] w-full overflow-hidden flex flex-col">
      <h3 className="text-white font-semibold text-lg mb-6 shrink-0">Composição do Resultado (DRE)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid vertical={false} stroke="#3b5445" strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9db9a8', fontSize: 10 }}
              interval={0}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9db9a8', fontSize: 10 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff0a' }}
              contentStyle={{ backgroundColor: '#1c2720', border: '1px solid #3b5445', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any, name: any, props: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(props.payload.actual), 'Valor']}
            />
            <Bar dataKey="start" stackId="a" fill="transparent" />
            <Bar dataKey="display" stackId="a" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => {
                let color = '#0ebe54';
                if (entry.type === 'total') color = '#3b82f6';
                else if (entry.actual < 0) color = '#ef4444';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList
                dataKey="actual"
                position="center"
                formatter={formatLabel}
                style={{ fill: '#fff', fontSize: '11px', fontWeight: 'bold' }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DREWaterfall;
