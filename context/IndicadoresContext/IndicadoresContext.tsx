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
    const [dados, setDados] = useState<FinancialIndicators[]>([]);
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
