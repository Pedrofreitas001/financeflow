import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ContaBalancete {
    data: string;
    contaContabil: string;
    nomeContaContabil: string;
    grupo: 'Ativo' | 'Passivo' | 'PL';
    subgrupo: 'Circulante' | 'Não Circulante' | 'Capital' | 'Reservas' | 'Resultados';
    tipoContaContabil: string;
    totalDebitos: number;
    totalCreditos: number;
    saldo: number;
    status: 'Normal' | 'Ajuste';
    fonte: string;
    empresa: string;
}

export interface BalanceteContextType {
    dados: ContaBalancete[];
    empresas: string[];
    setDados: (dados: ContaBalancete[]) => void;
    obterTotalAtivo: () => number;
    obterTotalPassivo: () => number;
    obterTotalPL: () => number;
    obterBalanceteOk: () => boolean;
    obterAtivoCirculante: () => number;
    obterAtivoNaoCirculante: () => number;
    obterPassivoCirculante: () => number;
    obterPassivoNaoCirculante: () => number;
}

const BalanceteContext = createContext<BalanceteContextType | undefined>(undefined);

export const BalanceteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dados, setDados] = useState<ContaBalancete[]>([]);
    const [empresas, setEmpresas] = useState<string[]>([]);

    // Atualizar empresas quando dados mudarem
    useEffect(() => {
        const empresasUnicas = Array.from(new Set(dados.map(d => d.empresa)));
        setEmpresas(empresasUnicas);
        console.log('BalanceteContext atualizado com', dados.length, 'registros e', empresasUnicas.length, 'empresas');
    }, [dados]);

    const obterTotalAtivo = (): number => {
        return dados
            .filter(c => c.grupo === 'Ativo')
            .reduce((acc, c) => acc + c.saldo, 0);
    };

    const obterTotalPassivo = (): number => {
        return Math.abs(
            dados
                .filter(c => c.grupo === 'Passivo')
                .reduce((acc, c) => acc + c.saldo, 0)
        );
    };

    const obterTotalPL = (): number => {
        return Math.abs(
            dados
                .filter(c => c.grupo === 'PL')
                .reduce((acc, c) => acc + c.saldo, 0)
        );
    };

    const obterAtivoCirculante = (): number => {
        return dados
            .filter(c => c.grupo === 'Ativo' && c.subgrupo === 'Circulante')
            .reduce((acc, c) => acc + c.saldo, 0);
    };

    const obterAtivoNaoCirculante = (): number => {
        return dados
            .filter(c => c.grupo === 'Ativo' && c.subgrupo === 'Não Circulante')
            .reduce((acc, c) => acc + c.saldo, 0);
    };

    const obterPassivoCirculante = (): number => {
        return Math.abs(
            dados
                .filter(c => c.grupo === 'Passivo' && c.subgrupo === 'Circulante')
                .reduce((acc, c) => acc + c.saldo, 0)
        );
    };

    const obterPassivoNaoCirculante = (): number => {
        return Math.abs(
            dados
                .filter(c => c.grupo === 'Passivo' && c.subgrupo === 'Não Circulante')
                .reduce((acc, c) => acc + c.saldo, 0)
        );
    };

    const obterBalanceteOk = (): boolean => {
        const totalAtivo = obterTotalAtivo();
        const totalPassivo = obterTotalPassivo();
        const totalPL = obterTotalPL();

        // Verifica se Ativo = Passivo + PL (com margem de erro para flutuações)
        return Math.abs(totalAtivo - (totalPassivo + totalPL)) < 1;
    };

    const value: BalanceteContextType = {
        dados,
        empresas,
        setDados,
        obterTotalAtivo,
        obterTotalPassivo,
        obterTotalPL,
        obterBalanceteOk,
        obterAtivoCirculante,
        obterAtivoNaoCirculante,
        obterPassivoCirculante,
        obterPassivoNaoCirculante,
    };

    return (
        <BalanceteContext.Provider value={value}>
            {children}
        </BalanceteContext.Provider>
    );
};

export const useBalancete = (): BalanceteContextType => {
    const context = useContext(BalanceteContext);
    if (context === undefined) {
        throw new Error('useBalancete deve ser usado dentro de BalanceteProvider');
    }
    return context;
};
