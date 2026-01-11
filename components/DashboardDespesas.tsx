
import React from 'react';
import KPIGridDespesas from './KPIGridDespesas.tsx';
import DespesasPorCategoria from './Charts/DespesasPorCategoria.tsx';
import EvolucaoDespesasMensal from './Charts/EvolucaoDespesasMensal.tsx';
import ComparacaoPeriodos from './Charts/ComparacaoPeriodos.tsx';
import TabelaPlanoConta from './Charts/TabelaPlanoConta.tsx';
import { useDespesas } from '../context/DespesasContext.tsx';

const DashboardDespesas: React.FC = () => {
    const { dadosDespesas } = useDespesas();

    // Se não houver dados, mostrar mensagem
    if (dadosDespesas.length === 0) {
        return (
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark min-h-screen">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="w-24 h-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-primary text-5xl">receipt_long</span>
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-4">Nenhum dado carregado</h2>
                        <p className="text-text-muted mb-8">Use o uploader na barra lateral para carregar dados de despesas</p>

                        {/* Formato Esperado */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6 w-full max-w-2xl">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: despesas_template.xlsx
                            </h3>
                            <div className="bg-background-dark rounded-lg p-4 mb-4 overflow-x-auto">
                                <table className="text-xs w-full">
                                    <thead>
                                        <tr className="text-text-muted border-b border-border-dark">
                                            <th className="text-left py-2">Coluna</th>
                                            <th className="text-left py-2">Tipo</th>
                                            <th className="text-left py-2">Exemplo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">ano</td>
                                            <td>número</td>
                                            <td>2024</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">mes</td>
                                            <td>número</td>
                                            <td>1, 2, 3...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">empresa</td>
                                            <td>texto</td>
                                            <td>Alpha, Beta, Gamma...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">categoria</td>
                                            <td>texto</td>
                                            <td>Folha, Aluguel, Fornecedores...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">subcategoria</td>
                                            <td>texto</td>
                                            <td>Salários, Energia, Insumos...</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-primary">valor</td>
                                            <td>número (R$)</td>
                                            <td>5000, 50000, 150000...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-text-muted">Arquivo: <span className="text-primary font-mono">dados/excel_exemplos/despesas_template.xlsx</span></p>

                            {/* Botões Google Sheets */}
                            <div className="mt-6 flex gap-3">
                                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                    <span className="material-symbols-outlined text-base">open_in_new</span>
                                    Visualizar Modelo
                                </a>
                                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                    <span className="material-symbols-outlined text-base">download</span>
                                    Baixar Arquivo
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main id="dashboard-despesas-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full">
                {/* Cabeçalho da página */}
                <div>
                    <h1 className="text-white text-3xl font-bold mb-2">Análise de Despesas</h1>
                    <p className="text-text-muted">
                        Visualize e compare as despesas da empresa ao longo do tempo
                    </p>
                </div>

                {/* KPIs */}
                <KPIGridDespesas />

                {/* Gráficos principais */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                    <EvolucaoDespesasMensal />
                    <DespesasPorCategoria />
                </div>

                {/* Comparação de períodos - largura total */}
                <div className="w-full">
                    <ComparacaoPeriodos />
                </div>

                {/* Tabela de Plano de Contas - largura total */}
                <div className="w-full">
                    <TabelaPlanoConta />
                </div>

                {/* Espaço para exportação PDF */}
                <div className="pb-12"></div>
            </div>
        </main>
    );
};

export default DashboardDespesas;

