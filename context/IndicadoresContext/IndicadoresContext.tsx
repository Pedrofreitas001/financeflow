import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FinancialIndicators {
    mes: number;
    empresa: string;
    roe: number; // Return on Equity
    roa: number; // Return on Assets
    margemLiquida: number;
    margemOperacional: number;
    liquidezCorrente: number;
    liquidezSeca: number;
    endividamento: number;
    alavancagem: number;
    giroAtivo: number;
    prazoRecebimento: number;
    prazoPagamento: number;
}

interface IndicadoresContextType {
    dados: FinancialIndicators[];
    indicadores: {
        roe: number;
        roa: number;
        margemLiquida: number;
        liquidezCorrente: number;
        endividamento: number;
    };
    empresas: string[];
    loading: boolean;
    error: string | null;
    setDados: (dados: FinancialIndicators[]) => void;
    obterIndicadoresEmpresa: (empresa: string) => FinancialIndicators[];
    obterComparativoSetor: (indicador: string) => { benchmarkSetor: number; empresas: string[] };
}

const IndicadoresContext = createContext<IndicadoresContextType | undefined>(undefined);

export const IndicadoresProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dados, setDados] = useState<FinancialIndicators[]>([
        { mes: 1, empresa: 'Alpha', roe: 15.3, roa: 8.2, margemLiquida: 12.5, margemOperacional: 18.2, liquidezCorrente: 1.8, liquidezSeca: 1.2, endividamento: 35.0, alavancagem: 2.1, giroAtivo: 2.3, prazoRecebimento: 30, prazoPagamento: 35 },
        { mes: 1, empresa: 'Beta', roe: 18.2, roa: 9.1, margemLiquida: 14.2, margemOperacional: 20.1, liquidezCorrente: 1.5, liquidezSeca: 1.0, endividamento: 40.5, alavancagem: 2.5, giroAtivo: 2.8, prazoRecebimento: 25, prazoPagamento: 40 },
        { mes: 1, empresa: 'Gamma', roe: 12.5, roa: 7.1, margemLiquida: 10.2, margemOperacional: 15.5, liquidezCorrente: 2.1, liquidezSeca: 1.5, endividamento: 30.0, alavancagem: 1.8, giroAtivo: 2.0, prazoRecebimento: 35, prazoPagamento: 45 },
        { mes: 2, empresa: 'Alpha', roe: 16.1, roa: 8.8, margemLiquida: 13.2, margemOperacional: 19.0, liquidezCorrente: 1.9, liquidezSeca: 1.3, endividamento: 34.5, alavancagem: 2.2, giroAtivo: 2.4, prazoRecebimento: 28, prazoPagamento: 36 },
        { mes: 2, empresa: 'Beta', roe: 17.5, roa: 8.9, margemLiquida: 13.8, margemOperacional: 19.5, liquidezCorrente: 1.6, liquidezSeca: 1.1, endividamento: 41.0, alavancagem: 2.4, giroAtivo: 2.7, prazoRecebimento: 26, prazoPagamento: 41 },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const empresas = Array.from(new Set(dados.map(item => item.empresa)));

    // Cálculos de indicadores agregados (última linha)
    const ultimosDados = dados.filter(d => d.mes === Math.max(...dados.map(d => d.mes), 0));
    const mediaIndicadores = (campo: keyof FinancialIndicators) => {
        const valores = ultimosDados.map(d => d[campo] as number).filter(v => !isNaN(v));
        return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
    };

    const indicadores = {
        roe: mediaIndicadores('roe'),
        roa: mediaIndicadores('roa'),
        margemLiquida: mediaIndicadores('margemLiquida'),
        liquidezCorrente: mediaIndicadores('liquidezCorrente'),
        endividamento: mediaIndicadores('endividamento'),
    };

    const obterIndicadoresEmpresa = (empresa: string) => dados.filter(d => d.empresa === empresa);

    const obterComparativoSetor = (indicador: string) => {
        const benchmarkSetor = {
            roe: 15.5,
            roa: 8.2,
            margemLiquida: 12.0,
            liquidezCorrente: 1.5,
            endividamento: 40.0,
        } as Record<string, number>;

        return {
            benchmarkSetor: benchmarkSetor[indicador] || 0,
            empresas,
        };
    };

    return (
        <IndicadoresContext.Provider
            value={{
                dados,
                indicadores,
                empresas,
                loading,
                error,
                setDados,
                obterIndicadoresEmpresa,
                obterComparativoSetor,
            }}
        >
            {children}
        </IndicadoresContext.Provider>
    );
};

export const useIndicadores = () => {
    const context = useContext(IndicadoresContext);
    if (!context) {
        throw new Error('useIndicadores must be used within IndicadoresProvider');
    }
    return context;
};
