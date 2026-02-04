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

    const lastLoadedKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const userKey = `${user?.id ?? 'anonymous'}|${authLoading ? 'loading' : 'ready'}`;
        if (lastLoadedKeyRef.current === userKey) return;
        lastLoadedKeyRef.current = userKey;

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

        const applySavedDataForUser = async (userId: string) => {
            const [
                savedDashboard,
                savedDespesas,
                savedDRE,
                savedCashFlow,
                savedIndicadores,
                savedOrcamento,
                savedBalancete,
            ] = await Promise.all([
                loadSavedDashboard(userId, 'dashboard'),
                loadSavedDashboard(userId, 'despesas'),
                loadSavedDashboard(userId, 'dre'),
                loadSavedDashboard(userId, 'cashflow'),
                loadSavedDashboard(userId, 'indicadores'),
                loadSavedDashboard(userId, 'orcamento'),
                loadSavedDashboard(userId, 'balancete'),
            ]);

            if (cancelled) return;

            const fns = fnsRef.current;
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
                fns.carregarDados(savedDashboard);
                availability.dashboard = true;
            }

            if (Array.isArray(savedDespesas) && savedDespesas.length > 0) {
                fns.carregarDadosDespesas(savedDespesas as any);
                availability.despesas = true;
            }

            if (Array.isArray(savedDRE) && savedDRE.length > 0) {
                fns.setDREDados(savedDRE[0] as any);
                availability.dre = true;
            }

            if (Array.isArray(savedCashFlow) && savedCashFlow.length > 0) {
                fns.setCashFlowDados(savedCashFlow as any);
                availability.cashflow = true;
            }

            if (Array.isArray(savedIndicadores) && savedIndicadores.length > 0) {
                fns.setIndicadoresDados(savedIndicadores as any);
                availability.indicadores = true;
            }

            if (Array.isArray(savedOrcamento) && savedOrcamento.length > 0) {
                fns.setOrcamentoDados(savedOrcamento as any);
                availability.orcamento = true;
            }

            if (Array.isArray(savedBalancete) && savedBalancete.length > 0) {
                fns.setBalanceteDados(savedBalancete as any);
                availability.balancete = true;
            }

            const loadedAnySaved = Object.values(availability).some(Boolean);
            if (!loadedAnySaved) {
                markUsingExampleData();
                return;
            }

            markUserDataLoaded();

            // Best-effort: if there is an active Sheets connection, show it as the data source.
            try {
                const { data: activeConn } = await supabase
                    .from('google_sheets_connections')
                    .select('id')
                    .eq('user_id', userId)
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
        };

        const run = async () => {
            setIsLoadingExamples(true);
            try {
                const loadedAny = applyExampleData();
                setExamplesLoaded(loadedAny);

                // Only mark examples if we don't end up loading backups for the logged-in user.
                // We'll finalize this after we try to fetch backups below.
                markUsingExampleData();
            } catch (error) {
                console.error('Erro ao carregar dados ficticios:', error);
            } finally {
                setIsLoadingExamples(false);
            }

            if (!authLoading && user?.id) {
                try {
                    // Ensure Supabase auth is ready (in some boot sequences the React auth state can
                    // update slightly before the Supabase client attaches the JWT to requests).
                    const { data } = await supabase.auth.getUser();
                    const effectiveUserId = data?.user?.id ?? user.id;
                    await applySavedDataForUser(effectiveUserId);
                } catch (error) {
                    console.warn('Erro ao carregar dados salvos:', error);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    return { isLoadingExamples, examplesLoaded };
};
