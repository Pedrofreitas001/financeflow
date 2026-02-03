// Gerar dados fictícios estruturados para todos os dashboards
// Empresas e meses base
const empresas = ['Alpha', 'Beta', 'Gamma'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ==================== DASHBOARD FINANCEIRO ====================
export const dadosFinanceirosFicticios: any[] = [];

empresas.forEach(empresa => {
    meses.forEach((mesNome, index) => {
        const mes = index + 1;
        const baseReceita = empresa === 'Alpha' ? 500000 : empresa === 'Beta' ? 420000 : 580000;
        const variacao = (Math.random() * 0.2 - 0.1); // ±10%
        const receitaBruta = baseReceita * (1 + variacao);
        const impostoVariavel = receitaBruta * 0.12;
        const receitaLiquida = receitaBruta - impostoVariavel;
        const custoVariavel = receitaBruta * 0.35;
        const custoFixo = receitaBruta * 0.15;
        const marketing = receitaBruta * 0.08;
        const pessoal = receitaBruta * 0.25;
        const resultado = receitaLiquida - custoVariavel - custoFixo - marketing - pessoal;

        // Faturamento Bruto
        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Faturamento Bruto',
            Empresa: empresa,
            Valor: receitaBruta
        });

        // Faturamento Líquido (após impostos)
        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Faturamento Líquido',
            Empresa: empresa,
            Valor: receitaLiquida
        });

        // Custos e despesas
        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Custo Variável',
            Empresa: empresa,
            Valor: -custoVariavel
        });

        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Custo Fixo (R$)',
            Empresa: empresa,
            Valor: -custoFixo
        });

        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Marketing',
            Empresa: empresa,
            Valor: -marketing
        });

        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Pessoal',
            Empresa: empresa,
            Valor: -pessoal
        });

        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'Imposto Variável',
            Empresa: empresa,
            Valor: -impostoVariavel
        });

        // RESULTADO (R$) - lucro/prejuízo final
        dadosFinanceirosFicticios.push({
            Ano: 2024,
            Mes: mesNome,
            Categoria: 'RESULTADO (R$)',
            Empresa: empresa,
            Valor: resultado
        });
    });
});

// ==================== DESPESAS ====================
export const dadosDespesasFicticios: any[] = [];
const categoriasDespesas = ['FOLHA DE PAGAMENTO', 'MARKETING', 'TI', 'OPERACIONAL', 'ADMINISTRATIVO'];
const subcategorias: Record<string, string[]> = {
    'FOLHA DE PAGAMENTO': ['Salários', 'Benefícios', 'Encargos'],
    'MARKETING': ['Publicidade Online', 'Eventos', 'Material Promocional'],
    'TI': ['Software', 'Hardware', 'Cloud'],
    'OPERACIONAL': ['Aluguel', 'Energia', 'Manutenção'],
    'ADMINISTRATIVO': ['Material Escritório', 'Contabilidade', 'Limpeza']
};
const fornecedores = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'RH Interno', 'Google Ads', 'AWS', 'Microsoft'];

let despesaId = 1;
empresas.forEach(empresa => {
    for (let mes = 1; mes <= 12; mes++) {
        categoriasDespesas.forEach(categoria => {
            const subs = subcategorias[categoria];
            const numDespesas = Math.floor(Math.random() * 3) + 2; // 2-4 despesas por categoria/mês

            for (let i = 0; i < numDespesas; i++) {
                const subcategoria = subs[Math.floor(Math.random() * subs.length)];
                const valor = Math.floor(Math.random() * 50000) + 5000;
                const dia = Math.floor(Math.random() * 28) + 1;

                dadosDespesasFicticios.push({
                    Ano: 2024,
                    Mes: meses[mes - 1],
                    Mes_Num: mes,
                    Empresa: empresa,
                    Categoria: categoria,
                    Subcategoria: subcategoria,
                    Valor: valor,
                    Status: Math.random() > 0.3 ? 'Pago' : 'Pendente',
                    Data: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
                    Fornecedor: fornecedores[Math.floor(Math.random() * fornecedores.length)],
                    Descricao: `${subcategoria} - ${meses[mes - 1]}`
                });
                despesaId++;
            }
        });
    }
});

// ==================== CASH FLOW ====================
export const dadosCashFlowFicticios: any[] = [];
const tiposCashFlow = ['Receber', 'Pagar'];
const categoriasCashFlow = ['Vendas de Produtos', 'Vendas de Serviços', 'Fornecedores', 'Salários', 'Impostos'];

let cfId = 1;
empresas.forEach(empresa => {
    for (let mes = 1; mes <= 12; mes++) {
        // Contas a receber (10-15 por mês)
        const numReceber = Math.floor(Math.random() * 6) + 10;
        for (let i = 0; i < numReceber; i++) {
            const dia = Math.floor(Math.random() * 28) + 1;
            dadosCashFlowFicticios.push({
                id: `cf_${empresa}_${mes}_${cfId++}`,
                mes: mes,
                empresa: empresa,
                tipo: 'Receber',
                categoria: categoriasCashFlow[Math.floor(Math.random() * 2)],
                data_vencimento: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
                valor: Math.floor(Math.random() * 80000) + 20000,
                status: Math.random() > 0.2 ? 'Pago' : 'Aberto',
                responsavel: 'Financeiro',
                descricao: ''
            });
        }

        // Contas a pagar (8-12 por mês)
        const numPagar = Math.floor(Math.random() * 5) + 8;
        for (let i = 0; i < numPagar; i++) {
            const dia = Math.floor(Math.random() * 28) + 1;
            dadosCashFlowFicticios.push({
                id: `cf_${empresa}_${mes}_${cfId++}`,
                mes: mes,
                empresa: empresa,
                tipo: 'Pagar',
                categoria: categoriasCashFlow[Math.floor(Math.random() * 3) + 2],
                data_vencimento: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
                valor: Math.floor(Math.random() * 60000) + 10000,
                status: Math.random() > 0.3 ? 'Pago' : 'Aberto',
                responsavel: 'Financeiro',
                descricao: ''
            });
        }
    }
});

// ==================== INDICADORES ====================
export const dadosIndicadoresFicticios: any[] = [];

empresas.forEach(empresa => {
    for (let mes = 1; mes <= 12; mes++) {
        dadosIndicadoresFicticios.push({
            mes: mes,
            empresa: empresa,
            roe: parseFloat((15 + Math.random() * 10).toFixed(2)),
            roa: parseFloat((8 + Math.random() * 6).toFixed(2)),
            margemLiquida: parseFloat((25 + Math.random() * 15).toFixed(2)),
            margemOperacional: parseFloat((30 + Math.random() * 15).toFixed(2)),
            liquidezCorrente: parseFloat((1.2 + Math.random() * 0.8).toFixed(2)),
            liquidezSeca: parseFloat((0.7 + Math.random() * 0.5).toFixed(2)),
            endividamento: parseFloat((25 + Math.random() * 20).toFixed(2)),
            alavancagem: parseFloat((1.5 + Math.random() * 1.5).toFixed(2)),
            giroAtivo: parseFloat((1.5 + Math.random() * 1).toFixed(2)),
            prazoRecebimento: Math.floor(25 + Math.random() * 15),
            prazoPagamento: Math.floor(30 + Math.random() * 15)
        });
    }
});

// ==================== ORÇAMENTO ====================
export const dadosOrcamentoFicticios: any[] = [];
const categoriasOrcamento = ['Folha de Pagamento', 'Marketing', 'TI', 'Aluguel', 'Energia', 'Manutenção'];

empresas.forEach(empresa => {
    for (let mes = 1; mes <= 12; mes++) {
        categoriasOrcamento.forEach(categoria => {
            const orcado = Math.floor(Math.random() * 100000) + 50000;
            const variacao = (Math.random() * 0.3 - 0.1); // -10% a +20%
            const realizado = Math.floor(orcado * (1 + variacao));

            dadosOrcamentoFicticios.push({
                mes: mes,
                empresa: empresa,
                categoria: categoria,
                orcado: orcado,
                realizado: realizado,
                responsavel: 'Controller',
                observacoes: Math.abs(realizado - orcado) / orcado > 0.1 ? 'Atenção' : 'Normal'
            });
        });
    }
});

// ==================== BALANCETE ====================
export const dadosBalanceteFicticios: any[] = [];
const contasBalancete = [
    { conta: '1.1.1.01', nome: 'Caixa', grupo: 'Ativo', subgrupo: 'Circulante', tipo: 'Caixa', baseValor: 150000 },
    { conta: '1.1.2.01', nome: 'Banco Conta Corrente', grupo: 'Ativo', subgrupo: 'Circulante', tipo: 'Banco', baseValor: 450000 },
    { conta: '1.1.3.01', nome: 'Clientes', grupo: 'Ativo', subgrupo: 'Circulante', tipo: 'Contas a Receber', baseValor: 320000 },
    { conta: '1.1.4.01', nome: 'Estoque', grupo: 'Ativo', subgrupo: 'Circulante', tipo: 'Estoque', baseValor: 280000 },
    { conta: '1.2.1.01', nome: 'Imóveis', grupo: 'Ativo', subgrupo: 'Não Circulante', tipo: 'Imobilizado', baseValor: 850000 },
    { conta: '1.2.2.01', nome: 'Veículos', grupo: 'Ativo', subgrupo: 'Não Circulante', tipo: 'Imobilizado', baseValor: 220000 },
    { conta: '2.1.1.01', nome: 'Fornecedores', grupo: 'Passivo', subgrupo: 'Circulante', tipo: 'Contas a Pagar', baseValor: 180000 },
    { conta: '2.1.2.01', nome: 'Salários a Pagar', grupo: 'Passivo', subgrupo: 'Circulante', tipo: 'Salários', baseValor: 95000 },
    { conta: '2.1.3.01', nome: 'Impostos a Recolher', grupo: 'Passivo', subgrupo: 'Circulante', tipo: 'Impostos', baseValor: 65000 },
    { conta: '2.2.1.01', nome: 'Financiamentos', grupo: 'Passivo', subgrupo: 'Não Circulante', tipo: 'Empréstimos', baseValor: 420000 },
    { conta: '3.1.1.01', nome: 'Capital Social', grupo: 'PL', subgrupo: 'Patrimônio Líquido', tipo: 'Capital', baseValor: 500000 },
    { conta: '3.2.1.01', nome: 'Lucros Acumulados', grupo: 'PL', subgrupo: 'Patrimônio Líquido', tipo: 'Lucros', baseValor: 380000 }
];

empresas.forEach(empresa => {
    contasBalancete.forEach(conta => {
        const variacao = (Math.random() * 0.4 - 0.2); // ±20%
        const valor = Math.floor(conta.baseValor * (1 + variacao));

        dadosBalanceteFicticios.push({
            data: '2024-12-31',
            contaContabil: conta.conta,
            nomeContaContabil: conta.nome,
            grupo: conta.grupo,
            subgrupo: conta.subgrupo,
            tipoContaContabil: conta.tipo,
            totalDebitos: conta.grupo === 'Ativo' ? valor : 0,
            totalCreditos: conta.grupo !== 'Ativo' ? valor : 0,
            saldo: valor,
            status: 'Normal',
            fonte: 'Balancete Manual',
            empresa: empresa
        });
    });
});

// ==================== DRE ====================
const linhasDRE = [
    { descricao: 'Receita Bruta', isResultado: false, isDespesa: false, isPercentual: false, isFinal: false },
    { descricao: '(-) Deduções', isDespesa: true, isResultado: false, isPercentual: false, isFinal: false },
    { descricao: '(=) Receita Líquida', isResultado: true, isDespesa: false, isPercentual: false, isFinal: false },
    { descricao: '(-) CMV/CPV', isDespesa: true, isResultado: false, isPercentual: false, isFinal: false },
    { descricao: '(=) Lucro Bruto', isResultado: true, isDespesa: false, isPercentual: false, isFinal: false },
    { descricao: 'Margem Bruta %', isResultado: false, isDespesa: false, isPercentual: true, isFinal: false },
    { descricao: '(-) Despesas Operacionais', isDespesa: true, isResultado: false, isPercentual: false, isFinal: false },
    { descricao: '(=) EBITDA', isResultado: true, isDespesa: false, isPercentual: false, isFinal: true },
    { descricao: '(-) Depreciação', isDespesa: true, isResultado: false, isPercentual: false, isFinal: false },
    { descricao: '(=) EBIT', isResultado: true, isDespesa: false, isPercentual: false, isFinal: false },
    { descricao: '(-) Despesas Financeiras', isDespesa: true, isResultado: false, isPercentual: false, isFinal: false },
    { descricao: '(=) Lucro ou Prejuízo Líquido', isResultado: true, isDespesa: false, isPercentual: false, isFinal: true }
];

export const dadosDREFicticios = {
    regimeCaixa: {
        mensal: linhasDRE.map(linha => {
            let real = 0;
            if (linha.descricao.includes('Receita Bruta')) real = 500000;
            else if (linha.descricao.includes('Deduções')) real = -50000;
            else if (linha.descricao.includes('Receita Líquida')) real = 450000;
            else if (linha.descricao.includes('CMV')) real = -200000;
            else if (linha.descricao.includes('Lucro Bruto')) real = 250000;
            else if (linha.descricao.includes('Margem Bruta')) real = 55.5;
            else if (linha.descricao.includes('Despesas Operacionais')) real = -120000;
            else if (linha.descricao.includes('EBITDA')) real = 130000;
            else if (linha.descricao.includes('Depreciação')) real = -15000;
            else if (linha.descricao.includes('EBIT')) real = 115000;
            else if (linha.descricao.includes('Despesas Financeiras')) real = -10000;
            else if (linha.descricao.includes('Lucro ou Prejuízo')) real = 105000;

            const projetado = real * 0.95;
            const variacao = ((real - projetado) / projetado * 100).toFixed(1) + '%';
            const analiseVertical = linha.isPercentual ? '' : ((Math.abs(real) / 450000) * 100).toFixed(1) + '%';

            return {
                linha,
                projetado,
                real,
                variacao,
                analiseVertical
            };
        }),
        acumulado: linhasDRE.map(linha => {
            const valorBase = linha.descricao.includes('Receita Bruta') ? 500000 :
                linha.descricao.includes('Deduções') ? -50000 :
                    linha.descricao.includes('Receita Líquida') ? 450000 :
                        linha.descricao.includes('CMV') ? -200000 :
                            linha.descricao.includes('Lucro Bruto') ? 250000 :
                                linha.descricao.includes('Margem Bruta') ? 55.5 :
                                    linha.descricao.includes('Despesas Operacionais') ? -120000 :
                                        linha.descricao.includes('EBITDA') ? 130000 :
                                            linha.descricao.includes('Depreciação') ? -15000 :
                                                linha.descricao.includes('EBIT') ? 115000 :
                                                    linha.descricao.includes('Despesas Financeiras') ? -10000 :
                                                        105000;

            const valores = {
                jan: valorBase * (0.9 + Math.random() * 0.2),
                fev: valorBase * (0.9 + Math.random() * 0.2),
                mar: valorBase * (0.9 + Math.random() * 0.2),
                abr: valorBase * (0.9 + Math.random() * 0.2),
                mai: valorBase * (0.9 + Math.random() * 0.2),
                jun: valorBase * (0.9 + Math.random() * 0.2),
                jul: valorBase * (0.9 + Math.random() * 0.2),
                ago: valorBase * (0.9 + Math.random() * 0.2),
                set: valorBase * (0.9 + Math.random() * 0.2),
                out: valorBase * (0.9 + Math.random() * 0.2),
                nov: valorBase * (0.9 + Math.random() * 0.2),
                dez: valorBase * (0.9 + Math.random() * 0.2),
                total: 0
            };
            valores.total = valores.jan + valores.fev + valores.mar + valores.abr + valores.mai + valores.jun +
                valores.jul + valores.ago + valores.set + valores.out + valores.nov + (valores.dez || 0);

            return {
                linha,
                valores,
                analiseVertical: linha.isPercentual ? '' : '0%'
            };
        })
    },
    regimeCompetencia: {
        mensal: linhasDRE.map(linha => {
            let real = 0;
            if (linha.descricao.includes('Receita Bruta')) real = 520000;
            else if (linha.descricao.includes('Deduções')) real = -52000;
            else if (linha.descricao.includes('Receita Líquida')) real = 468000;
            else if (linha.descricao.includes('CMV')) real = -210000;
            else if (linha.descricao.includes('Lucro Bruto')) real = 258000;
            else if (linha.descricao.includes('Margem Bruta')) real = 55.1;
            else if (linha.descricao.includes('Despesas Operacionais')) real = -125000;
            else if (linha.descricao.includes('EBITDA')) real = 133000;
            else if (linha.descricao.includes('Depreciação')) real = -15000;
            else if (linha.descricao.includes('EBIT')) real = 118000;
            else if (linha.descricao.includes('Despesas Financeiras')) real = -10000;
            else if (linha.descricao.includes('Lucro ou Prejuízo')) real = 108000;

            const projetado = real * 0.95;
            const variacao = ((real - projetado) / projetado * 100).toFixed(1) + '%';
            const analiseVertical = linha.isPercentual ? '' : ((Math.abs(real) / 468000) * 100).toFixed(1) + '%';

            return {
                linha,
                projetado,
                real,
                variacao,
                analiseVertical
            };
        }),
        acumulado: linhasDRE.map(linha => {
            const valorBase = linha.descricao.includes('Receita Bruta') ? 520000 :
                linha.descricao.includes('Deduções') ? -52000 :
                    linha.descricao.includes('Receita Líquida') ? 468000 :
                        linha.descricao.includes('CMV') ? -210000 :
                            linha.descricao.includes('Lucro Bruto') ? 258000 :
                                linha.descricao.includes('Margem Bruta') ? 55.1 :
                                    linha.descricao.includes('Despesas Operacionais') ? -125000 :
                                        linha.descricao.includes('EBITDA') ? 133000 :
                                            linha.descricao.includes('Depreciação') ? -15000 :
                                                linha.descricao.includes('EBIT') ? 118000 :
                                                    linha.descricao.includes('Despesas Financeiras') ? -10000 :
                                                        108000;

            const valores = {
                jan: valorBase * (0.9 + Math.random() * 0.2),
                fev: valorBase * (0.9 + Math.random() * 0.2),
                mar: valorBase * (0.9 + Math.random() * 0.2),
                abr: valorBase * (0.9 + Math.random() * 0.2),
                mai: valorBase * (0.9 + Math.random() * 0.2),
                jun: valorBase * (0.9 + Math.random() * 0.2),
                jul: valorBase * (0.9 + Math.random() * 0.2),
                ago: valorBase * (0.9 + Math.random() * 0.2),
                set: valorBase * (0.9 + Math.random() * 0.2),
                out: valorBase * (0.9 + Math.random() * 0.2),
                nov: valorBase * (0.9 + Math.random() * 0.2),
                dez: valorBase * (0.9 + Math.random() * 0.2),
                total: 0
            };
            valores.total = valores.jan + valores.fev + valores.mar + valores.abr + valores.mai + valores.jun +
                valores.jul + valores.ago + valores.set + valores.out + valores.nov + (valores.dez || 0);

            return {
                linha,
                valores,
                analiseVertical: linha.isPercentual ? '' : '0%'
            };
        })
    },
    ano: 2024,
    empresa: 'Alpha'
};

console.log(`✅ Dados fictícios gerados:
- Financeiro: ${dadosFinanceirosFicticios.length} registros
- Despesas: ${dadosDespesasFicticios.length} registros  
- Cash Flow: ${dadosCashFlowFicticios.length} registros
- Indicadores: ${dadosIndicadoresFicticios.length} registros
- Orçamento: ${dadosOrcamentoFicticios.length} registros
- Balancete: ${dadosBalanceteFicticios.length} registros
- DRE: Completo (mensal + acumulado para ambos os regimes)`);
