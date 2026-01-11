
import React from 'react';
import { useDespesas } from '../../context/DespesasContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

interface PlanoContasData {
    categoria: string;
    meses: { [mes: string]: number };
    total: number;
}

const TabelaPlanoConta: React.FC = () => {
    const { dadosDespesasFiltrados, agregadoDespesasCategoria } = useDespesas();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Preparar dados da tabela
    const tabelaData = React.useMemo(() => {
        const meses = Array.from(new Set(dadosDespesasFiltrados.map(d => d.mes)))
            .sort((a, b) => {
                const mapa: { [key: string]: number } = {
                    'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
                    'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
                    'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
                };
                return (mapa[a] || 0) - (mapa[b] || 0);
            });

        const categorias = Array.from(new Set(dadosDespesasFiltrados.map(d => d.categoria)));

        const dados: PlanoContasData[] = categorias.map(cat => {
            const mesData: { [mes: string]: number } = {};
            let totalCat = 0;

            meses.forEach(mes => {
                const valor = dadosDespesasFiltrados
                    .filter(d => d.categoria === cat && d.mes === mes)
                    .reduce((acc, curr) => acc + curr.valor, 0);
                mesData[mes] = valor;
                totalCat += valor;
            });

            return {
                categoria: cat,
                meses: mesData,
                total: totalCat
            };
        }).filter(d => d.total > 0)
            .sort((a, b) => b.total - a.total);

        return { dados, meses };
    }, [dadosDespesasFiltrados]);

    if (tabelaData.dados.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold">Plano de Contas - Despesas</h3>
                    <p className="text-text-muted text-sm mt-1">Resumo detalhado de despesas por categoria e mês</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">table_chart</span>
                </div>
            </div>

            {/* Tabela responsiva */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-dark">
                            <th className="text-left py-3 px-4 text-text-muted font-bold uppercase text-xs sticky left-0 bg-surface-dark">
                                Categoria
                            </th>
                            {tabelaData.meses.map(mes => (
                                <th key={mes} className="text-right py-3 px-3 text-text-muted font-bold uppercase text-xs whitespace-nowrap">
                                    {mes.substring(0, 3)}
                                </th>
                            ))}
                            <th className="text-right py-3 px-4 text-text-muted font-bold uppercase text-xs whitespace-nowrap bg-background-dark/50">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tabelaData.dados.map((item, idx) => {
                            const cor = agregadoDespesasCategoria.find(c => c.name === item.categoria)?.color || '#6b7280';

                            return (
                                <tr key={item.categoria} className="border-b border-border-dark hover:bg-background-dark transition-colors">
                                    <td className="py-3 px-4 sticky left-0 bg-surface-dark">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: cor }}
                                            ></div>
                                            <span className="text-white font-medium">{item.categoria}</span>
                                        </div>
                                    </td>
                                    {tabelaData.meses.map(mes => (
                                        <td key={mes} className="text-right py-3 px-3 whitespace-nowrap">
                                            {item.meses[mes] > 0 ? (
                                                <span className="text-white">{formatCurrency(item.meses[mes])}</span>
                                            ) : (
                                                <span className="text-text-muted">-</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="text-right py-3 px-4 text-white font-bold bg-background-dark/50 whitespace-nowrap">
                                        {formatCurrency(item.total)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-primary bg-background-dark">
                            <td className="py-4 px-4 sticky left-0 bg-background-dark">
                                <span className="text-white font-bold">TOTAL GERAL</span>
                            </td>
                            {tabelaData.meses.map(mes => (
                                <td key={mes} className="text-right py-4 px-3 whitespace-nowrap">
                                    <span className="text-primary font-bold">
                                        {formatCurrency(
                                            tabelaData.dados.reduce((acc, cat) => acc + (cat.meses[mes] || 0), 0)
                                        )}
                                    </span>
                                </td>
                            ))}
                            <td className="text-right py-4 px-4 bg-primary/10 whitespace-nowrap">
                                <span className="text-primary font-bold">
                                    {formatCurrency(
                                        tabelaData.dados.reduce((acc, cat) => acc + cat.total, 0)
                                    )}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Legenda */}
            <div className="mt-6 pt-4 border-t border-border-dark">
                <p className="text-text-muted text-xs mb-3">📊 Tabela com todos os meses selecionados</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {tabelaData.dados.slice(0, 4).map(cat => (
                        <div key={cat.categoria} className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: agregadoDespesasCategoria.find(c => c.name === cat.categoria)?.color }}
                            ></div>
                            <span className="text-text-muted truncate">{cat.categoria}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TabelaPlanoConta;

