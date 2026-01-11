
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
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
                <div className="max-w-[1400px] mx-auto flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-primary text-5xl">upload_file</span>
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-2">Nenhum dado de despesas carregado</h2>
                        <p className="text-text-muted mb-6">
                            Faça o upload de um arquivo Excel com dados de despesas para começar a visualizar os relatórios.
                        </p>
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6 max-w-md mx-auto text-left">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">info</span>
                                Formato esperado
                            </h3>
                            <ul className="text-text-muted text-sm space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Colunas: Ano, Mes, Empresa, Categoria, Subcategoria, Valor</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Use o arquivo <code className="text-primary bg-background-dark px-2 py-1 rounded">despesas_upload_dashboard.xlsx</code> como modelo</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Faça o upload na sidebar à esquerda</span>
                                </li>
                            </ul>
                        </div>
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

