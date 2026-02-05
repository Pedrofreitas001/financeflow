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

// Default: always render example data for all dashboards.
// If a saved backup exists for a given dashboard type, we override only that dashboard's data with the latest backup.
export const useExampleData = () => {
    const { carregarDados } = useFinance();
    const { dadosDespesas, carregarDadosDespesas } = useDespesas();
    const { setDados: setDREDados } = useDRE();
    const { setDados: setCashFlowDados } = useCashFlow();
    const { setDados: setIndicadoresDados } = useIndicadores();
    const { setDados: setOrcamentoDados } = useOrcamento();
    const { setDados: setBalanceteDados } = useBalancete();
    const { user, loading: authLoading } = useAuth();

    const [isLoadingExamples, setIsLoadingExamples] = useState(false);
    const [examplesLoaded, setExamplesLoaded] = useState(false);
    // Context functions can be non-stable (re-created on every render). Keep them in a ref so our effects
    // only depend on user id and don't accidentally loop forever.
    const fnsRef = useRef({
        carregarDados,
        carregarDadosDespesas,
        setDREDados,
        setCashFlowDados,
        setIndicadoresDados,
        setOrcamentoDados,
        setBalanceteDados,
    });
    fnsRef.current = {
        carregarDados,
        carregarDadosDespesas,
        setDREDados,
        setCashFlowDados,
        setIndicadoresDados,
        setOrcamentoDados,
        setBalanceteDados,
    };

    useEffect(() => {
        let cancelled = false;
        const applyExampleData = () => {
            const fns = fnsRef.current;
            let loadedAny = false;

            if (dadosFinanceirosFicticios.length > 0) {
                fns.carregarDados(dadosFinanceirosFicticios);
                loadedAny = true;
            }

            if (dadosDespesasFicticios.length > 0) {
                fns.carregarDadosDespesas(dadosDespesasFicticios as any);
                loadedAny = true;
            }

            if (dadosDREFicticios) {
                fns.setDREDados(dadosDREFicticios as any);
                loadedAny = true;
            }

            if (dadosCashFlowFicticios.length > 0) {
                fns.setCashFlowDados(dadosCashFlowFicticios as any);
                loadedAny = true;
            }

            if (dadosIndicadoresFicticios.length > 0) {
                fns.setIndicadoresDados(dadosIndicadoresFicticios as any);
                loadedAny = true;
            }

            if (dadosOrcamentoFicticios.length > 0) {
                fns.setOrcamentoDados(dadosOrcamentoFicticios as any);
                loadedAny = true;
            }

            if (dadosBalanceteFicticios.length > 0) {
                fns.setBalanceteDados(dadosBalanceteFicticios as any);
                loadedAny = true;
            }

            return loadedAny;
        };

        const run = async () => {
            setIsLoadingExamples(true);
            try {
                // Primeiro, tentar carregar backups se usuário está logado
                if (!authLoading && user?.id) {
                    try {
                        // Ensure Supabase auth/session is really ready before querying tables protected by RLS.
                        // In some boot sequences, React auth state becomes available slightly before the Supabase
                        // client has the session in memory for outgoing requests, which can cause SELECT to return empty.
                        let sessionUserId: string | null = null;
                        for (let attempt = 0; attempt < 5; attempt++) {
                            const { data: sessionData } = await supabase.auth.getSession();
                            sessionUserId = sessionData?.session?.user?.id ?? null;
                            if (sessionUserId) break;
                            await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
                        }

                        const { data } = await supabase.auth.getUser();
                        const effectiveUserId = data?.user?.id ?? sessionUserId ?? user.id;

                        // Tenta carregar backups do usuário
                        const [
                            savedDashboard,
                            savedDespesas,
                            savedDRE,
                            savedCashFlow,
                            savedIndicadores,
                            savedOrcamento,
                            savedBalancete,
                        ] = await Promise.all([
                            loadSavedDashboard(effectiveUserId, 'dashboard'),
                            loadSavedDashboard(effectiveUserId, 'despesas'),
                            loadSavedDashboard(effectiveUserId, 'dre'),
                            loadSavedDashboard(effectiveUserId, 'cashflow'),
                            loadSavedDashboard(effectiveUserId, 'indicadores'),
                            loadSavedDashboard(effectiveUserId, 'orcamento'),
                            loadSavedDashboard(effectiveUserId, 'balancete'),
                        ]);

                        if (cancelled) {
                            setIsLoadingExamples(false);
                            return;
                        }

                        const fns = fnsRef.current;
                        const loadedAnySaved = !!(
                            (Array.isArray(savedDashboard) && savedDashboard.length > 0) ||
                            (Array.isArray(savedDespesas) && savedDespesas.length > 0) ||
                            (Array.isArray(savedDRE) && savedDRE.length > 0) ||
                            (Array.isArray(savedCashFlow) && savedCashFlow.length > 0) ||
                            (Array.isArray(savedIndicadores) && savedIndicadores.length > 0) ||
                            (Array.isArray(savedOrcamento) && savedOrcamento.length > 0) ||
                            (Array.isArray(savedBalancete) && savedBalancete.length > 0)
                        );

                        if (loadedAnySaved) {
                            // Carregar apenas os backups que existem
                            if (Array.isArray(savedDashboard) && savedDashboard.length > 0) {
                                fns.carregarDados(savedDashboard);
                            } else {
                                // Se não tem backup de dashboard, carrega exemplo fictício
                                if (dadosFinanceirosFicticios.length > 0) {
                                    fns.carregarDados(dadosFinanceirosFicticios);
                                }
                            }

                            if (Array.isArray(savedDespesas) && savedDespesas.length > 0) {
                                fns.carregarDadosDespesas(savedDespesas as any);
                            } else {
                                if (dadosDespesasFicticios.length > 0) {
                                    fns.carregarDadosDespesas(dadosDespesasFicticios as any);
                                }
                            }

                            if (Array.isArray(savedDRE) && savedDRE.length > 0) {
                                fns.setDREDados(savedDRE[0] as any);
                            } else {
                                if (dadosDREFicticios) {
                                    fns.setDREDados(dadosDREFicticios as any);
                                }
                            }

                            if (Array.isArray(savedCashFlow) && savedCashFlow.length > 0) {
                                fns.setCashFlowDados(savedCashFlow as any);
                            } else {
                                if (dadosCashFlowFicticios.length > 0) {
                                    fns.setCashFlowDados(dadosCashFlowFicticios as any);
                                }
                            }

                            if (Array.isArray(savedIndicadores) && savedIndicadores.length > 0) {
                                fns.setIndicadoresDados(savedIndicadores as any);
                            } else {
                                if (dadosIndicadoresFicticios.length > 0) {
                                    fns.setIndicadoresDados(dadosIndicadoresFicticios as any);
                                }
                            }

                            if (Array.isArray(savedOrcamento) && savedOrcamento.length > 0) {
                                fns.setOrcamentoDados(savedOrcamento as any);
                            } else {
                                if (dadosOrcamentoFicticios.length > 0) {
                                    fns.setOrcamentoDados(dadosOrcamentoFicticios as any);
                                }
                            }

                            if (Array.isArray(savedBalancete) && savedBalancete.length > 0) {
                                fns.setBalanceteDados(savedBalancete as any);
                            } else {
                                if (dadosBalanceteFicticios.length > 0) {
                                    fns.setBalanceteDados(dadosBalanceteFicticios as any);
                                }
                            }

                            markUserDataLoaded();

                            // Best-effort: if there is an active Sheets connection, show it as the data source.
                            try {
                                const { data: activeConn } = await supabase
                                    .from('google_sheets_connections')
                                    .select('id')
                                    .eq('user_id', effectiveUserId)
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

                            setExamplesLoaded(true);
                            return;
                        }
                    } catch (error) {
                        console.warn('Erro ao carregar dados salvos:', error);
                    }
                }

                // Fallback: carregar dados fictícios se não conseguiu backups
                const loadedAny = applyExampleData();
                setExamplesLoaded(loadedAny);
                markUsingExampleData();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setIsLoadingExamples(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [user?.id, authLoading]);

    return { isLoadingExamples, examplesLoaded };
};
