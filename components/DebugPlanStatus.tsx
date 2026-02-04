import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/hooks/useUserPlan';

export default function DebugPlanStatus() {
    const { userPlan, loading: planLoading } = useUserPlan();
    const [authUser, setAuthUser] = useState<any>(null);
    const [dbSubscription, setDbSubscription] = useState<any>(null);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => {
        console.log('[DEBUG]', msg);
        setDebugLog(prev => [...prev, msg]);
    };

    useEffect(() => {
        async function debug() {
            try {
                addLog('=== INICIANDO DEBUG ===');

                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    addLog('❌ Erro ao pegar usuário: ' + userError.message);
                    return;
                }
                if (!user) {
                    addLog('⏳ Aguardando autenticação do usuário...');
                    return;
                }
                addLog(`✓ Usuário autenticado: ${user.email}`);
                addLog(`  ID: ${user.id.substring(0, 8)}...`);
                setAuthUser(user);

                addLog('\nBuscando subscription no banco de dados...');
                const { data, error, status } = await supabase
                    .from('subscriptions')
                    .select('plan, status, created_at')
                    .eq('user_id', user.id)
                    .maybeSingle();

                addLog(`  Status HTTP: ${status}`);
                if (error) {
                    addLog(`❌ Erro na query: ${error.code || 'UNKNOWN'}`);
                    addLog(`   Mensagem: ${error.message}`);
                    return;
                }

                if (data) {
                    addLog(`✓ Subscription encontrada:`);
                    addLog(`  Plan: ${data.plan}`);
                    addLog(`  Status: ${data.status}`);
                    addLog(`  Created: ${new Date(data.created_at).toLocaleDateString('pt-BR')}`);
                    setDbSubscription(data);
                } else {
                    addLog('⚠ Nenhuma subscription encontrada (free user)');
                }

                addLog('\n=== ESTADO DO HOOK ===');
                addLog(`Plan: ${userPlan.plan}`);
                addLog(`isPremium: ${userPlan.isPremium}`);
                addLog(`isDiamond: ${userPlan.isDiamond}`);
                addLog(`Status: ${userPlan.status}`);
                addLog(`Loading: ${planLoading}`);

                if (data && userPlan.plan !== data.plan) {
                    addLog('\n⚠️ AVISO: Hook plan não corresponde ao DB!');
                }
            } catch (err) {
                addLog('❌ Erro geral: ' + (err instanceof Error ? err.message : String(err)));
            }
        }

        const timer = setTimeout(debug, 1000);
        return () => clearTimeout(timer);
    }, [userPlan, planLoading]);

    return (
        <div className="fixed bottom-0 right-0 w-96 max-h-96 bg-slate-900 border border-slate-700 rounded-tl-lg p-4 overflow-y-auto shadow-lg z-[9999]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">🐛 Debug Plan Status</h3>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
                >
                    Atualizar
                </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono">
                {debugLog.length === 0 ? (
                    <p className="text-slate-400">Carregando...</p>
                ) : (
                    debugLog.map((log, i) => (
                        <div
                            key={i}
                            className={`${log.includes('✓') ? 'text-green-400' :
                                log.includes('❌') ? 'text-red-400' :
                                    log.includes('⏳') ? 'text-yellow-400' :
                                        log.includes('⚠') ? 'text-orange-400' :
                                            log.includes('===') ? 'text-blue-400 font-bold' :
                                                'text-slate-300'
                                }`}
                        >
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
