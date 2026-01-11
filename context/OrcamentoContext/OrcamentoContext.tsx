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
    const [dados, setDados] = useState<OrcamentoItem[]>([]);
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
