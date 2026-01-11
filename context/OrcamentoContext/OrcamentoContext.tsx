import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrcamentoItem {
    mes: number;
    categoria: string;
    orcado: number;
    realizado: number;
    responsavel?: string;
    observacoes?: string;
}

interface OrcamentoContextType {
    dados: OrcamentoItem[];
    totalOrcado: number;
    totalRealizado: number;
    varianciaTotal: number;
    varianciaPercentual: number;
    empresas: string[];
    categorias: string[];
    loading: boolean;
    error: string | null;
    setDados: (dados: OrcamentoItem[]) => void;
    calcularVariancia: (orcado: number, realizado: number) => { valor: number; percentual: number };
    obterDesviosPorCategoria: () => Array<{ categoria: string; variancia: number; percentual: number }>;
}

const OrcamentoContext = createContext<OrcamentoContextType | undefined>(undefined);

export const OrcamentoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dados, setDados] = useState<OrcamentoItem[]>([
        { mes: 1, empresa: 'Alpha', categoria: 'Folha de Pagamento', orcado: 80000, realizado: 82000, responsavel: 'RH', observacoes: 'Acima' },
        { mes: 1, empresa: 'Alpha', categoria: 'Aluguel', orcado: 10000, realizado: 10000, responsavel: 'Admin', observacoes: 'Normal' },
        { mes: 1, empresa: 'Alpha', categoria: 'Fornecedores', orcado: 120000, realizado: 118000, responsavel: 'Compras', observacoes: 'Abaixo' },
        { mes: 1, empresa: 'Alpha', categoria: 'Marketing', orcado: 15000, realizado: 17500, responsavel: 'Marketing', observacoes: 'Acima' },
        { mes: 1, empresa: 'Beta', categoria: 'Folha de Pagamento', orcado: 95000, realizado: 93000, responsavel: 'RH', observacoes: 'Abaixo' },
        { mes: 1, empresa: 'Beta', categoria: 'Aluguel', orcado: 12000, realizado: 12000, responsavel: 'Admin', observacoes: 'Normal' },
        { mes: 2, empresa: 'Alpha', categoria: 'Folha de Pagamento', orcado: 80000, realizado: 84000, responsavel: 'RH', observacoes: 'Acima' },
        { mes: 2, empresa: 'Alpha', categoria: 'Fornecedores', orcado: 125000, realizado: 122000, responsavel: 'Compras', observacoes: 'Abaixo' },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalOrcado = dados.reduce((acc, item) => acc + item.orcado, 0);
    const totalRealizado = dados.reduce((acc, item) => acc + item.realizado, 0);
    const varianciaTotal = totalRealizado - totalOrcado;
    const varianciaPercentual = totalOrcado > 0 ? (varianciaTotal / totalOrcado) * 100 : 0;

    const empresas = Array.from(new Set(dados.map(item => item.empresa)));
    const categorias = Array.from(new Set(dados.map(item => item.categoria)));

    const calcularVariancia = (orcado: number, realizado: number) => ({
        valor: realizado - orcado,
        percentual: orcado > 0 ? ((realizado - orcado) / orcado) * 100 : 0,
    });

    const obterDesviosPorCategoria = () => {
        const desvios = new Map<string, { orcado: number; realizado: number }>();
        dados.forEach(item => {
            if (!desvios.has(item.categoria)) {
                desvios.set(item.categoria, { orcado: 0, realizado: 0 });
            }
            const current = desvios.get(item.categoria)!;
            current.orcado += item.orcado;
            current.realizado += item.realizado;
        });

        return Array.from(desvios.entries()).map(([categoria, { orcado, realizado }]) => ({
            categoria,
            variancia: realizado - orcado,
            percentual: orcado > 0 ? ((realizado - orcado) / orcado) * 100 : 0,
        }));
    };

    return (
        <OrcamentoContext.Provider
            value={{
                dados,
                totalOrcado,
                totalRealizado,
                varianciaTotal,
                varianciaPercentual,
                empresas,
                categorias,
                loading,
                error,
                setDados,
                calcularVariancia,
                obterDesviosPorCategoria,
            }}
        >
            {children}
        </OrcamentoContext.Provider>
    );
};

export const useOrcamento = () => {
    const context = useContext(OrcamentoContext);
    if (!context) {
        throw new Error('useOrcamento must be used within OrcamentoProvider');
    }
    return context;
};
