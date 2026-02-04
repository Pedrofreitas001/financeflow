import { useEffect, useRef, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useDespesas } from '../context/DespesasContext';
import { useDRE } from '../context/DREContext';
import { useCashFlow } from '../context/CashFlowContext/CashFlowContext';
import { useIndicadores } from '../context/IndicadoresContext/IndicadoresContext';
import { useOrcamento } from '../context/OrcamentoContext/OrcamentoContext';
import { useBalancete } from '../context/BalanceteContext';
import { useAuth } from '../context/AuthContext';
import { loadSavedDashboard } from './savedDashboardManager';
import { markDataSource, markUserDataLoaded, markUsingExampleData } from './userDataState';
import { supabase } from '@/lib/supabase';
import {
    dadosFinanceirosFicticios,
    dadosDespesasFicticios,
    dadosCashFlowFicticios,
    dadosIndicadoresFicticios,
    dadosOrcamentoFicticios,
    dadosBalanceteFicticios,
    dadosDREFicticios
} from './dadosFicticios.ts';

// Load example data by default unless a backup exists for that dashboard.
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
    const [syncAttempted, setSyncAttempted] = useState(false);
    const [savedAvailability, setSavedAvailability] = useState({
        dashboard: false,
        despesas: false,
        dre: false,
        cashflow: false,
        indicadores: false,
        orcamento: false,
        balancete: false,
    });
    const exampleOnceRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const loadSavedData = async () => {
            if (savedLoaded) return;

            if (!user?.id) {
                if (isMounted) setSavedLoaded(true);
                return;
            }

            try {
                if (!syncAttempted) {
                    setSyncAttempted(true);
                }

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

                const availability = {
                    dashboard: false,
                    despesas: false,
                    dre: false,
                    cashflow: false,
                    indicadores: false,
                    orcamento: false,
                    balancete: false,
                };

                if (Array.isArray(savedDashboard) && savedDashboard.length > 0) {
                    carregarDados(savedDashboard);
                    availability.dashboard = true;
                }

                if (Array.isArray(savedDespesas) && savedDespesas.length > 0) {
                    carregarDadosDespesas(savedDespesas as any);
                    availability.despesas = true;
                }

                if (Array.isArray(savedDRE) && savedDRE.length > 0) {
                    setDREDados(savedDRE[0] as any);
                    availability.dre = true;
                }

                if (Array.isArray(savedCashFlow) && savedCashFlow.length > 0) {
                    setCashFlowDados(savedCashFlow as any);
                    availability.cashflow = true;
                }

                if (Array.isArray(savedIndicadores) && savedIndicadores.length > 0) {
                    setIndicadoresDados(savedIndicadores as any);
                    availability.indicadores = true;
                }

                if (Array.isArray(savedOrcamento) && savedOrcamento.length > 0) {
                    setOrcamentoDados(savedOrcamento as any);
                    availability.orcamento = true;
                }

                if (Array.isArray(savedBalancete) && savedBalancete.length > 0) {
                    setBalanceteDados(savedBalancete as any);
                    availability.balancete = true;
                }

                setSavedAvailability(availability);

                const loadedAnySaved = Object.values(availability).some(Boolean);
                if (loadedAnySaved) {
                    markUserDataLoaded();
                    try {
                        const { data: activeConn } = await supabase
                            .from('google_sheets_connections')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('is_active', true)
                            .limit(1);

                        if (activeConn && activeConn.length > 0) {
                            markDataSource('google_sheets');
                        } else {
                            markDataSource('backup');
                        }
                    } catch {
                        markDataSource('backup');
                    }
                } else {
                    markUsingExampleData();
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
        syncAttempted,
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
            if (!savedLoaded) return;
            if (exampleOnceRef.current || isLoadingExamples) return;

            exampleOnceRef.current = true;
            setIsLoadingExamples(true);
            let loadedAny = false;

            try {
                if (!savedAvailability.dashboard && dadosFinanceirosFicticios.length > 0) {
                    carregarDados(dadosFinanceirosFicticios);
                    loadedAny = true;
                }

                if (!savedAvailability.despesas && dadosDespesasFicticios.length > 0) {
                    carregarDadosDespesas(dadosDespesasFicticios as any);
                    loadedAny = true;
                }

                if (!savedAvailability.dre && dadosDREFicticios) {
                    setDREDados(dadosDREFicticios as any);
                    loadedAny = true;
                }

                if (!savedAvailability.cashflow && dadosCashFlowFicticios.length > 0) {
                    setCashFlowDados(dadosCashFlowFicticios as any);
                    loadedAny = true;
                }

                if (!savedAvailability.indicadores && dadosIndicadoresFicticios.length > 0) {
                    setIndicadoresDados(dadosIndicadoresFicticios as any);
                    loadedAny = true;
                }

                if (!savedAvailability.orcamento && dadosOrcamentoFicticios.length > 0) {
                    setOrcamentoDados(dadosOrcamentoFicticios as any);
                    loadedAny = true;
                }

                if (!savedAvailability.balancete && dadosBalanceteFicticios.length > 0) {
                    setBalanceteDados(dadosBalanceteFicticios as any);
                    loadedAny = true;
                }

                setExamplesLoaded(loadedAny || examplesLoaded);
                if (loadedAny) {
                    markUsingExampleData();
                }
            } catch (error) {
                console.error('Erro ao carregar dados ficticios:', error);
            } finally {
                setIsLoadingExamples(false);
            }
        };

        const timer = setTimeout(loadExampleData, 200);
        return () => clearTimeout(timer);
    }, [savedLoaded, isLoadingExamples, savedAvailability]);

    return { isLoadingExamples, examplesLoaded };
};
