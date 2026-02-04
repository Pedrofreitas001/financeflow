import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useDespesas } from '../context/DespesasContext';
import { useDRE } from '../context/DREContext';
import { useCashFlow } from '../context/CashFlowContext/CashFlowContext';
import { useIndicadores } from '../context/IndicadoresContext/IndicadoresContext';
import { useOrcamento } from '../context/OrcamentoContext/OrcamentoContext';
import { useBalancete } from '../context/BalanceteContext';
import { useAuth } from '../context/AuthContext';
import { loadSavedDashboard } from './savedDashboardManager';
import { markUserDataLoaded, markUsingExampleData } from './userDataState';
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
    const { user } = useAuth();
    const [isLoadingExamples, setIsLoadingExamples] = useState(false);
    const [examplesLoaded, setExamplesLoaded] = useState(false);
    const [savedLoaded, setSavedLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadSavedData = async () => {
            if (savedLoaded) return;

            if (!user?.id) {
                if (isMounted) setSavedLoaded(true);
                return;
            }

            try {
                const [
                    savedDashboard,
                    savedDespesas,
                    savedDRE,
                    savedCashFlow,
                    savedIndicadores,
                    savedOrcamento,
                    savedBalancete,
                ] = await Promise.all([
                    loadSavedDashboard(user.id, 'dashboard'),
                    loadSavedDashboard(user.id, 'despesas'),
                    loadSavedDashboard(user.id, 'dre'),
                    loadSavedDashboard(user.id, 'cashflow'),
                    loadSavedDashboard(user.id, 'indicadores'),
                    loadSavedDashboard(user.id, 'orcamento'),
                    loadSavedDashboard(user.id, 'balancete'),
                ]);

                if (!isMounted) return;

                let loadedAnySaved = false;

                if (Array.isArray(savedDashboard) && savedDashboard.length > 0) {
                    carregarDados(savedDashboard);
                    loadedAnySaved = true;
                }

                if (Array.isArray(savedDespesas) && savedDespesas.length > 0) {
                    carregarDadosDespesas(savedDespesas as any);
                    loadedAnySaved = true;
                }

                if (Array.isArray(savedDRE) && savedDRE.length > 0) {
                    // DRE é salvo como array com 1 objeto
                    setDREDados(savedDRE[0] as any);
                    loadedAnySaved = true;
                }

                if (Array.isArray(savedCashFlow) && savedCashFlow.length > 0) {
                    setCashFlowDados(savedCashFlow as any);
                    loadedAnySaved = true;
                }

                if (Array.isArray(savedIndicadores) && savedIndicadores.length > 0) {
                    setIndicadoresDados(savedIndicadores as any);
                    loadedAnySaved = true;
                }

                if (Array.isArray(savedOrcamento) && savedOrcamento.length > 0) {
                    setOrcamentoDados(savedOrcamento as any);
                    loadedAnySaved = true;
                }

                if (Array.isArray(savedBalancete) && savedBalancete.length > 0) {
                    setBalanceteDados(savedBalancete as any);
                    loadedAnySaved = true;
                }

                if (loadedAnySaved) {
                    markUserDataLoaded();
                }
            } catch (error) {
                console.warn('Erro ao carregar dados salvos:', error);
            } finally {
                if (isMounted) setSavedLoaded(true);
            }
        };

        loadSavedData();

        return () => {
            isMounted = false;
        };
    }, [
        user?.id,
        savedLoaded,
        carregarDados,
        carregarDadosDespesas,
        setDREDados,
        setCashFlowDados,
        setIndicadoresDados,
        setOrcamentoDados,
        setBalanceteDados,
    ]);

    useEffect(() => {
        const loadExampleData = () => {
            if (!savedLoaded) {
                console.log('⏳ Aguardando carregamento de dados salvos...');
                return;
            }

            // Verificar se já carregou exemplos ou se está carregando
            if (examplesLoaded || isLoadingExamples) {
                console.log('⏭️ Exemplos já carregados ou carregando, pulando...');
                return;
            }

            console.log('🔄 Iniciando carregamento de dados fictícios...');
            console.log('📊 Dados atuais - Finance:', dadosFinance.length, 'Despesas:', dadosDespesas.length, 'DRE:', dreData ? 'Sim' : 'Não', 'CashFlow:', dadosCashFlow.length, 'Indicadores:', dadosIndicadores.length, 'Orçamento:', dadosOrcamento.length, 'Balancete:', dadosBalancete.length);

            setIsLoadingExamples(true);
            let loadedAny = false;

            try {
                // Dashboard Financeiro
                if (dadosFinance.length === 0 && dadosFinanceirosFicticios.length > 0) {
                    console.log('⬆️ Carregando dados financeiros fictícios...');
                    carregarDados(dadosFinanceirosFicticios);
                    console.log('✅ Dados fictícios do Dashboard carregados:', dadosFinanceirosFicticios.length);
                    loadedAny = true;
                }

                // Despesas
                if (dadosDespesas.length === 0 && dadosDespesasFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de despesas fictícios...');
                    carregarDadosDespesas(dadosDespesasFicticios as any);
                    console.log('✅ Dados fictícios de Despesas carregados:', dadosDespesasFicticios.length);
                    loadedAny = true;
                }

                // DRE
                if (!dreData && dadosDREFicticios) {
                    console.log('⬆️ Carregando dados DRE fictícios...');
                    setDREDados(dadosDREFicticios as any);
                    console.log('✅ Dados fictícios de DRE carregados');
                    loadedAny = true;
                }

                // Cash Flow
                if (dadosCashFlow.length === 0 && dadosCashFlowFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de cash flow fictícios...');
                    setCashFlowDados(dadosCashFlowFicticios as any);
                    console.log('✅ Dados fictícios de Cash Flow carregados:', dadosCashFlowFicticios.length);
                    loadedAny = true;
                }

                // Indicadores
                if (dadosIndicadores.length === 0 && dadosIndicadoresFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de indicadores fictícios...');
                    setIndicadoresDados(dadosIndicadoresFicticios as any);
                    console.log('✅ Dados fictícios de Indicadores carregados:', dadosIndicadoresFicticios.length);
                    loadedAny = true;
                }

                // Orçamento
                if (dadosOrcamento.length === 0 && dadosOrcamentoFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de orçamento fictícios...');
                    setOrcamentoDados(dadosOrcamentoFicticios as any);
                    console.log('✅ Dados fictícios de Orçamento carregados:', dadosOrcamentoFicticios.length);
                    loadedAny = true;
                }

                // Balancete
                if (dadosBalancete.length === 0 && dadosBalanceteFicticios.length > 0) {
                    console.log('⬆️ Carregando dados de balancete fictícios...');
                    setBalanceteDados(dadosBalanceteFicticios as any);
                    console.log('✅ Dados fictícios de Balancete carregados:', dadosBalanceteFicticios.length);
                    loadedAny = true;
                }

                console.log('✅ Processo de carregamento de dados fictícios concluído');
                setExamplesLoaded(loadedAny);
                if (loadedAny) {
                    markUsingExampleData();
                }
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
        savedLoaded,
        examplesLoaded,
        isLoadingExamples
    ]);

    return { isLoadingExamples, examplesLoaded };
};

