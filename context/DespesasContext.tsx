
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { DadosDespesas, KPIDespesas, ExpenseCategory, ExpenseEvolution } from '../types.ts';
import { limparValor, getMesNumero } from '../utils/financeUtils.ts';
import { loadSavedDashboard } from '@/utils/savedDashboardManager';
import { supabase } from '@/lib/supabase';

interface DespesasContextType {
    dadosDespesas: DadosDespesas[];
    empresasDespesas: string[];
    mesesDisponiveisDespesas: string[];
    filtrosDespesas: {
        empresa: string;
        meses: string[];
        categorias: string[];
    };
    setFiltroDespesasEmpresa: (empresa: string) => void;
    setFiltroDespesasMeses: (meses: string[]) => void;
    setFiltroDespesasCategorias: (categorias: string[]) => void;
    carregarDadosDespesas: (json: any[]) => void;
    dadosDespesasFiltrados: DadosDespesas[];
    kpisDespesas: KPIDespesas;
    agregadoDespesasMensal: any[];
    agregadoDespesasCategoria: ExpenseCategory[];
    categoriasDisponiveis: string[];
    subcategoriasDisponiveis: string[];
    evolucaoDespesas: ExpenseEvolution[];
    uploadDateDespesas: string | null;
}

const DespesasContext = createContext<DespesasContextType | undefined>(undefined);

export const DespesasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dadosDespesas, setDadosDespesas] = useState<DadosDespesas[]>([]);
    const [filtrosDespesas, setFiltrosDespesas] = useState({
        empresa: 'Todas',
        meses: [] as string[],
        categorias: [] as string[]
    });
    const [uploadDateDespesas, setUploadDateDespesas] = useState<string | null>(null);

    const carregarDadosDespesas = (json: any[]) => {
        try {
            if (!Array.isArray(json)) {
                console.error('[DespesasContext] Dados não é um array');
                setDadosDespesas([]);
                return;
            }

            // Filtrar dados inválidos e com campos faltantes
            const dadosValidos = json.filter(row => {
                try {
                    const ano = row?.Ano ?? row?.ano;
                    const mes = row?.Mes ?? row?.mes;
                    const categoria = row?.Categoria ?? row?.categoria;
                    const empresa = row?.Empresa ?? row?.empresa;
                    const valor = row?.Valor ?? row?.valor;
                    return row && ano && mes && categoria && empresa && valor !== undefined;
                } catch {
                    return false;
                }
            });

            if (dadosValidos.length === 0) {
                console.warn('[DespesasContext] Nenhum dado válido encontrado');
                setDadosDespesas([]);
                setFiltrosDespesas({ empresa: 'Todas', meses: [], categorias: [] });
                return;
            }

            const processados: DadosDespesas[] = dadosValidos.map(row => {
                try {
                    const mesValue = row?.Mes ?? row?.mes;
                    const mesStr = String(mesValue || "").trim();
                    const mesNum = row.Mes_Num || getMesNumero(mesStr);
                    const categoriaRaw = row?.Categoria ?? row?.categoria;
                    const categoria = String(categoriaRaw ?? "");

                    const anoRaw = row?.Ano ?? row?.ano;
                    const anoParsed = parseInt(String(anoRaw));
                    const anoFinal = Number.isNaN(anoParsed) ? 2024 : anoParsed;

                    return {
                        ano: anoFinal,
                        mes: mesStr,
                        mesNum: mesNum,
                        empresa: String((row?.Empresa ?? row?.empresa) ?? ""),
                        categoria: categoria,
                        subcategoria: String((row?.Subcategoria ?? row?.subcategoria) ?? ""),
                        valor: Math.abs(limparValor(row?.Valor ?? row?.valor)),
                        data: new Date(anoFinal, mesNum - 1, 1),
                        tipo: categoria?.toUpperCase().includes('FATURAMENTO') ? 'receita' : 'despesa'
                    };
                } catch (err) {
                    console.error('[DespesasContext] Erro ao processar linha:', row, err);
                    return null;
                }
            }).filter((d): d is DadosDespesas => d !== null && d.categoria && d.mes);

            if (processados.length === 0) {
                console.warn('[DespesasContext] Nenhum dado pôde ser processado');
                setDadosDespesas([]);
                setFiltrosDespesas({ empresa: 'Todas', meses: [], categorias: [] });
                return;
            }

            setDadosDespesas(processados);

            const uniqueMeses = Array.from(new Set(processados.map(d => d.mes)))
                .sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));

            setFiltrosDespesas({
                empresa: 'Todas',
                meses: uniqueMeses,
                categorias: []
            });

            const now = new Date();
            const formattedDate = now.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            setUploadDateDespesas(formattedDate);
        } catch (error) {
            console.error('[DespesasContext] Erro ao carregar dados:', error);
            setDadosDespesas([]);
            setFiltrosDespesas({ empresa: 'Todas', meses: [], categorias: [] });
        }
    };

    const empresasDespesas = useMemo(() =>
        ['Todas', ...Array.from(new Set(dadosDespesas.map(d => d.empresa)))],
        [dadosDespesas]
    );

    const mesesDisponiveisDespesas = useMemo(() => {
        return Array.from(new Set(dadosDespesas.map(d => d.mes)))
            .sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));
    }, [dadosDespesas]);

    const categoriasDisponiveis = useMemo(() =>
        Array.from(new Set(dadosDespesas.map(d => d.categoria))).sort(),
        [dadosDespesas]
    );

    const subcategoriasDisponiveis = useMemo(() =>
        Array.from(new Set(dadosDespesas.map(d => d.subcategoria))).sort(),
        [dadosDespesas]
    );

    const dadosDespesasFiltrados = useMemo(() => {
        return dadosDespesas.filter(d =>
            (filtrosDespesas.empresa === 'Todas' || d.empresa === filtrosDespesas.empresa) &&
            (filtrosDespesas.meses.length === 0 || filtrosDespesas.meses.includes(d.mes)) &&
            (filtrosDespesas.categorias.length === 0 || filtrosDespesas.categorias.includes(d.categoria)) &&
            d.tipo === 'despesa'
        );
    }, [dadosDespesas, filtrosDespesas]);

    // Agregação Mensal
    const agregadoDespesasMensal = useMemo(() => {
        const meses = Array.from(new Set(dadosDespesasFiltrados.map(d => d.mes)))
            .sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));

        return meses.map(m => {
            const mesDados = dadosDespesasFiltrados.filter(d => d.mes === m);
            const total = mesDados.reduce((acc, curr) => acc + curr.valor, 0);

            return {
                month: m,
                total,
                mesNum: getMesNumero(m)
            };
        });
    }, [dadosDespesasFiltrados]);

    // Agregação por Categoria
    const agregadoDespesasCategoria = useMemo(() => {
        const categorias = Array.from(new Set(dadosDespesasFiltrados.map(d => d.categoria)));
        const cores = [
            "#ef4444", "#f97316", "#ec4899", "#3b82f6", "#0ebe54",
            "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#6366f1"
        ];

        const result = categorias.map((cat, i) => {
            const valor = dadosDespesasFiltrados
                .filter(d => d.categoria === cat)
                .reduce((acc, curr) => acc + curr.valor, 0);

            return {
                name: cat,
                value: valor,
                color: cores[i % cores.length]
            };
        }).filter(c => c.value > 0)
            .sort((a, b) => b.value - a.value);

        const total = result.reduce((acc, curr) => acc + curr.value, 0);

        return result.map(c => ({
            ...c,
            percentage: total > 0 ? Math.round((c.value / total) * 100) : 0
        }));
    }, [dadosDespesasFiltrados]);

    // Evolução das Despesas
    const evolucaoDespesas = useMemo(() => {
        const resultado: ExpenseEvolution[] = [];
        const meses = Array.from(new Set(dadosDespesasFiltrados.map(d => d.mes)))
            .sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));

        const topCategorias = agregadoDespesasCategoria.slice(0, 5).map(c => c.name);

        meses.forEach(mes => {
            topCategorias.forEach(categoria => {
                const valor = dadosDespesasFiltrados
                    .filter(d => d.mes === mes && d.categoria === categoria)
                    .reduce((acc, curr) => acc + curr.valor, 0);

                resultado.push({ month: mes, categoria, valor });
            });
        });

        return resultado;
    }, [dadosDespesasFiltrados, agregadoDespesasCategoria]);

    // KPIs de Despesas
    const kpisDespesas = useMemo((): KPIDespesas => {
        const totalDespesas = dadosDespesasFiltrados.reduce((acc, curr) => acc + curr.valor, 0);

        // Categorias fixas vs variáveis (exemplo de lógica)
        const categoriasFixas = ['INFRAESTRUTURA', 'ADMINISTRATIVO', 'FOLHA DE PAGAMENTO'];
        const totalDespesasFixas = dadosDespesasFiltrados
            .filter(d => categoriasFixas.includes(d.categoria))
            .reduce((acc, curr) => acc + curr.valor, 0);

        const totalDespesasVariaveis = totalDespesas - totalDespesasFixas;

        // Ticket médio por mês
        const mesesUnicos = new Set(dadosDespesasFiltrados.map(d => d.mes)).size;
        const ticketMedio = mesesUnicos > 0 ? totalDespesas / mesesUnicos : 0;

        // Calcular percentual em relação ao faturamento (precisa do contexto financeiro)
        // Por enquanto, vamos deixar como 0 ou calcular se tivermos dados de receita
        const dadosReceita = dadosDespesas.filter(d =>
            d.tipo === 'receita' &&
            (filtrosDespesas.empresa === 'Todas' || d.empresa === filtrosDespesas.empresa) &&
            (filtrosDespesas.meses.length === 0 || filtrosDespesas.meses.includes(d.mes))
        );
        const totalReceita = dadosReceita.reduce((acc, curr) => acc + curr.valor, 0);
        const percentualFaturamento = totalReceita > 0 ? (totalDespesas / totalReceita) * 100 : 0;

        return {
            totalDespesas,
            totalDespesasFixas,
            totalDespesasVariaveis,
            ticketMedio,
            despesasPendentes: 0, // Pode ser calculado se tivermos dados de status
            percentualFaturamento
        };
    }, [dadosDespesasFiltrados, dadosDespesas, filtrosDespesas]);

    return (
        <DespesasContext.Provider value={{
            dadosDespesas,
            empresasDespesas,
            mesesDisponiveisDespesas,
            filtrosDespesas,
            setFiltroDespesasEmpresa: (e) => setFiltrosDespesas(f => ({ ...f, empresa: e })),
            setFiltroDespesasMeses: (m) => setFiltrosDespesas(f => ({ ...f, meses: m })),
            setFiltroDespesasCategorias: (c) => setFiltrosDespesas(f => ({ ...f, categorias: c })),
            carregarDadosDespesas,
            dadosDespesasFiltrados,
            kpisDespesas,
            agregadoDespesasMensal,
            agregadoDespesasCategoria,
            categoriasDisponiveis,
            subcategoriasDisponiveis,
            evolucaoDespesas,
            uploadDateDespesas
        }}>
            {children}
        </DespesasContext.Provider>
    );
};

export const useDespesas = () => {
    const context = useContext(DespesasContext);
    if (!context) throw new Error('useDespesas must be used within DespesasProvider');
    return context;
};

