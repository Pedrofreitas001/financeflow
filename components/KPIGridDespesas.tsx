
import React from 'react';
import { useDespesas } from '../context/DespesasContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

const KPIGridDespesas: React.FC = () => {
    const { kpisDespesas } = useDespesas();
    const { theme } = useTheme();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const kpis = [
        {
            label: 'Total de Despesas',
            value: formatCurrency(kpisDespesas.totalDespesas),
            icon: 'payments',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-500/10'
        },
        {
            label: 'Despesas Fixas',
            value: formatCurrency(kpisDespesas.totalDespesasFixas),
            icon: 'receipt_long',
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            label: 'Despesas Variáveis',
            value: formatCurrency(kpisDespesas.totalDespesasVariaveis),
            icon: 'trending_up',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10'
        },
        {
            label: 'Ticket Médio Mensal',
            value: formatCurrency(kpisDespesas.ticketMedio),
            icon: 'calculate',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: '% do Faturamento',
            value: `${kpisDespesas.percentualFaturamento.toFixed(1)}%`,
            icon: 'percent',
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <div id="pdf-section-kpis-despesas" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
            {kpis.map((kpi, index) => (
                <div
                    key={index}
                    className="bg-surface-dark border border-border-dark rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:border-primary/50 group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <span className={`material-symbols-outlined ${kpi.iconColor} text-2xl`}>
                                {kpi.icon}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-text-muted text-xs font-medium mb-1 uppercase tracking-wide">
                            {kpi.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-white text-2xl font-bold tracking-tight">
                                {kpi.value}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIGridDespesas;

