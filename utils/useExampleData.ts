import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useDespesas } from '../context/DespesasContext';
import { useDRE } from '../context/DREContext';
import { useCashFlow } from '../context/CashFlowContext/CashFlowContext';
import { useIndicadores } from '../context/IndicadoresContext/IndicadoresContext';
import { useOrcamento } from '../context/OrcamentoContext/OrcamentoContext';
import { useBalancete } from '../context/BalanceteContext';
import {
    dadosFinanceirosFicticios,
    dadosDespesasFicticios,
    dadosCashFlowFicticios,
    dadosIndicadoresFicticios,
    dadosOrcamentoFicticios,
    dadosBalanceteFicticios,
    dadosDREFicticios
} from './dadosFicticios.ts';

/**
 * Hook para carregar dados de exemplo automaticamente
 * Verifica se o usuário tem dados carregados, se não tiver, carrega os exemplos
 */
export const useExampleData = () => {
    const { dados: dadosFinance, carregarDados } = useFinance();
    const { dadosDespesas, carregarDadosDespesas } = useDespesas();
    const { dreData, setDados: setDREDados } = useDRE();
    const { dados: dadosCashFlow, setDados: setCashFlowDados } = useCashFlow();
    const { dados: dadosIndicadores, setDados: setIndicadoresDados } = useIndicadores();
    const { dados: dadosOrcamento, setDados: setOrcamentoDados } = useOrcamento();
    const { dados: dadosBalancete, setDados: setBalanceteDados } = useBalancete();
    const [isLoadingExamples, setIsLoadingExamples] = useState(false);
    const [examplesLoaded, setExamplesLoaded] = useState(false);

    useEffect(() => {
        const loadExampleData = () => {
            // Verificar se já carregou exemplos ou se está carregando
            if (examplesLoaded || isLoadingExamples) {
                console.log('⏭️ Exemplos já carregados ou carregando, pulando...');
                return;
            }

            console.log('🔄 Iniciando carregamento de dados fictícios...');
            console.log('📊 Dados atuais - Finance:', dadosFinance.length, 'Despesas:', dadosDespesas.length, 'DRE:', dreData ? 'Sim' : 'Não', 'CashFlow:', dadosCashFlow.length, 'Indicadores:', dadosIndicadores.length, 'Orçamento:', dadosOrcamento.length, 'Balancete:', dadosBalancete.length);

            setIsLoadingExamples(true);

            try {
                // Dashboard Financeiro
                if (dadosFinance.length === 0 && dadosFinanceirosFicticios.length > 0) {
                    console.log('⬆️ Carregando dados financeiros fictícios...');
                    carregarDados(dadosFinanceirosFicticios);
                    console.log('✅ Dados fictícios do Dashboard carregados:', dadosFinanceirosFicticios.length);
                }

                // Despesas
                if (dadosDespesas.length === 0 && dadosDespesasFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de despesas fictícios...');
                    carregarDadosDespesas(dadosDespesasFicticios as any);
                    console.log('✅ Dados fictícios de Despesas carregados:', dadosDespesasFicticios.length);
                }

                // DRE
                if (!dreData && dadosDREFicticios) {
                    console.log('⬆️ Carregando dados DRE fictícios...');
                    setDREDados(dadosDREFicticios as any);
                    console.log('✅ Dados fictícios de DRE carregados');
                }

                // Cash Flow
                if (dadosCashFlow.length === 0 && dadosCashFlowFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de cash flow fictícios...');
                    setCashFlowDados(dadosCashFlowFicticios as any);
                    console.log('✅ Dados fictícios de Cash Flow carregados:', dadosCashFlowFicticios.length);
                }

                // Indicadores
                if (dadosIndicadores.length === 0 && dadosIndicadoresFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de indicadores fictícios...');
                    setIndicadoresDados(dadosIndicadoresFicticios as any);
                    console.log('✅ Dados fictícios de Indicadores carregados:', dadosIndicadoresFicticios.length);
                }

                // Orçamento
                if (dadosOrcamento.length === 0 && dadosOrcamentoFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de orçamento fictícios...');
                    setOrcamentoDados(dadosOrcamentoFicticios as any);
                    console.log('✅ Dados fictícios de Orçamento carregados:', dadosOrcamentoFicticios.length);
                }

                // Balancete
                if (dadosBalancete.length === 0 && dadosBalanceteFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de balancete fictícios...');
                    setBalanceteDados(dadosBalanceteFicticios as any);
                    console.log('✅ Dados fictícios de Balancete carregados:', dadosBalanceteFicticios.length);
                }

                console.log('✅ Processo de carregamento de dados fictícios concluído');
                setExamplesLoaded(true);
            } catch (error) {
                console.error('❌ Erro ao carregar dados fictícios:', error);
            } finally {
                setIsLoadingExamples(false);
            }
        };

        // Executar após um delay para garantir que os contextos estão prontos
        console.log('⏰ Agendando carregamento de dados fictícios...');
        const timer = setTimeout(loadExampleData, 500);
        return () => clearTimeout(timer);
    }, [
        dadosFinance.length,
        dadosDespesas.length,
        dreData,
        dadosCashFlow.length,
        dadosIndicadores.length,
        dadosOrcamento.length,
        dadosBalancete.length,
        carregarDados,
        carregarDadosDespesas,
        setDREDados,
        setCashFlowDados,
        setIndicadoresDados,
        setOrcamentoDados,
        setBalanceteDados,
        examplesLoaded,
        isLoadingExamples
    ]);

    return { isLoadingExamples, examplesLoaded };
};

