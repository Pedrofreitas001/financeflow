# 📋 ESTRUTURAS DE DADOS - Novas Páginas

## 1️⃣ CASH FLOW MANAGEMENT

### Excel Esperado: `fluxo_caixa_dashboard.xlsx`

```
Coluna A  | Coluna B   | Coluna C    | Coluna D      | Coluna E          | Coluna F   | Coluna G   | Coluna H
----------|----------|------------|--------------|------------------|---------|---------|----------
Data      | Empresa  | Tipo       | Categoria    | Data_Vencimento  | Valor   | Status  | Responsavel
01/01/25  | Alpha    | Receber    | Vendas       | 15/01/25        | 50000   | Aberto  | Comercial
05/01/25  | Alpha    | Pagar      | Aluguel      | 05/01/25        | 10000   | Pago    | Financeiro
10/01/25  | Beta     | Receber    | Consultoria  | 20/01/25        | 30000   | Aberto  | Projetos
15/01/25  | Alpha    | Pagar      | Folha        | 28/01/25        | 80000   | Aberto  | RH
```

### Métricas Calculadas (Context):
```typescript
interface CashFlowData {
  data: Date;
  empresa: string;
  tipo: 'receber' | 'pagar';
  categoria: string;
  dataVencimento: Date;
  valor: number;
  status: 'aberto' | 'pago' | 'vencido';
  responsavel: string;
}

interface CashFlowMetrics {
  saldoAtual: number;
  diasCaixaDisponivel: number;
  contasAbertasReceber: number;
  contasAbertasPagar: number;
  contasVencidas: number;
  fluxo30Dias: number;
  fluxo60Dias: number;
  fluxo90Dias: number;
}
```

### Gráficos:
1. **Cascata de Caixa** (Waterfall)
   - Saldo Inicial → Entradas → Saídas → Saldo Final

2. **Evolução Saldo** (Line Chart)
   - Eixo X: Mês
   - Eixo Y: Saldo (R$)

3. **Contas Receber vs Pagar** (Grouped Bar)
   - Eixo X: Mês
   - Eixo Y: Valor
   - Series: Receber (azul), Pagar (vermelho)

4. **Timeline de Vencimentos** (Horizontal Bar)
   - Próximos 60 dias
   - Classificação por categoria

### KPIs (5 cards):
```
┌─────────────────┬──────────────────┬──────────────┬──────────────┬──────────────┐
│ Saldo Atual     │ Dias de Caixa    │ Vencidas     │ Receber 30d  │ Pagar 30d    │
│ R$ 150.000      │ 45 dias          │ R$ 25.000    │ R$ 120.000   │ R$ 180.000   │
│ ↑ +R$ 20.000    │ ↑ +15 dias       │ ↓ R$ 5.000   │ ↑ +30%       │ ↓ -10%       │
└─────────────────┴──────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 2️⃣ INDICADORES FINANCEIROS

### Excel Esperado: `indicadores_dashboard.xlsx`

```
Coluna A  | Coluna B   | Coluna C  | Coluna D | Coluna E | Coluna F   | Coluna G   | Coluna H | Coluna I
----------|-----------|----------|---------|---------|----------|----------|---------|----------
Mês       | Empresa   | ROA      | ROE     | ML      | LC       | LD       | Alav    | Giro_At
Jan/25    | Alpha     | 5.2      | 12.1    | 8.5     | 1.8      | 1.2      | 0.65    | 1.8
Jan/25    | Beta      | 3.8      | 9.5     | 6.2     | 1.5      | 0.9      | 0.75    | 1.5
```

### Fórmulas (Context):
```typescript
interface IndicadoresFinanceiros {
  mes: string;
  empresa: string;
  roa: number;              // Lucro Líquido / Ativo Total
  roe: number;              // Lucro Líquido / Patrimônio Líquido
  margemLiquida: number;    // Lucro Líquido / Receita
  liquidezCorrente: number; // Ativo Circulante / Passivo Circulante
  liquidezSeca: number;     // (AC - Estoques) / PC
  alavancagem: number;      // Passivo Total / Patrimônio Líquido
  giroAtivo: number;        // Receita / Ativo Total
}

// Status: 'Bom' | 'Aviso' | 'Crítico'
// Thresholds dependem do setor
```

### Gráficos:
1. **Gauge/Velocímetro** (4 cards)
   - ROA, ROE, Margem Líquida, Liquidez Corrente
   - Com zona verde/amarela/vermelha

2. **Radar Chart** (Comparação 6 indicadores)
   - ROA, ROE, ML, LC, Alav, Giro
   - Overlay com meta/benchmark

3. **Série Histórica** (Line Chart)
   - 12 meses de indicadores principais

4. **Comparação vs Meta** (Barras)
   - Realizado vs Meta vs Benchmark setor

### KPIs (6 cards com Status):
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ ROE          │ ROA          │ Margem Líq   │ Liquidez     │ Alav         │ Giro         │
│ 12.1%        │ 5.2%         │ 8.5%         │ 1.8          │ 0.65         │ 1.8          │
│ ✅ Bom       │ ✅ Bom       │ ⚠️ Aviso    │ ✅ Bom       │ ✅ Bom       │ ✅ Bom       │
│ vs 10% meta  │ vs 4% meta   │ vs 10% meta  │ vs 2.0 meta  │ vs 0.5 meta  │ vs 2.0 meta  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 3️⃣ ANÁLISE DE RENTABILIDADE POR CLIENTE

### Excel Esperado: `rentabilidade_clientes_dashboard.xlsx`

```
Coluna A  | Coluna B    | Coluna C   | Coluna D | Coluna E  | Coluna F | Coluna G | Coluna H
----------|-----------|-----------|---------|---------|---------|---------|----------
Mês       | Empresa   | Cliente   | Receita | CV      | CFix    | Volume  | Seg
Jan/25    | Alpha     | Empresa X | 100000  | 40000   | 15000   | 50      | A
Jan/25    | Alpha     | Empresa Y | 50000   | 35000   | 8000    | 20      | B
Jan/25    | Alpha     | Empresa Z | 10000   | 15000   | 2000    | 5       | C
```

### Métricas Calculadas:
```typescript
interface ClienteRentabilidade {
  mes: string;
  empresa: string;
  cliente: string;
  receita: number;
  custoVariavel: number;
  custoFixoAlocado: number;
  volume: number;
  segmento: 'A' | 'B' | 'C';  // Calculado: A=top 20%, B=meio 30%, C=restante
  margemBruta: number;         // Receita - CV
  margemLiquida: number;       // Receita - CV - CF
  margemPerc: number;          // (Receita - CV - CF) / Receita
  ticketMedio: number;         // Receita / Volume
}
```

### Gráficos:
1. **Pareto Chart** (Barras + Linha Acumulada)
   - Clientes ordenados por receita
   - Linha mostra % acumulado
   - Marca linha 80% (Pareto)

2. **Scatter Plot** (Bubble Chart)
   - Eixo X: Volume
   - Eixo Y: Margem %
   - Tamanho bubble: Receita
   - Cor: Segmento (A/B/C)

3. **Top 10 Clientes** (Horizontal Bar)
   - Por margem líquida
   - Valores positivos (verde) vs negativos (vermelho)

4. **Distribuição ABC** (Pie)
   - % de clientes em cada segmento
   - % de receita em cada segmento

### KPIs (6 cards):
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Top Cliente  │ Top Rentável │ Clientes (-) │ Ticket Méd   │ Margem Med   │ ABC 80/20    │
│ Emp X        │ Emp Z        │ 3 clientes   │ R$ 8.500     │ 22.5%        │ 20% = 80%    │
│ R$ 100.000   │ R$ 85.000    │ R$ -45.000   │ ↑ +5%        │ ↓ -2%        │ % 18/25      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 4️⃣ BUDGETING vs REALIZADO

### Excel Esperado: `orcamento_dashboard.xlsx`

```
Coluna A  | Coluna B   | Coluna C    | Coluna D   | Coluna E  | Coluna F   | Coluna G
----------|-----------|-----------|-----------|---------|---------|----------
Mês       | Empresa   | Categoria | Orçado    | Real    | Desvio  | Desvio%
Jan/25    | Alpha     | Folha     | 100000    | 102000  | 2000    | 2.0%
Jan/25    | Alpha     | Aluguel   | 10000     | 10000   | 0       | 0.0%
Jan/25    | Alpha     | Marketing | 20000     | 15000   | -5000   | -25.0%
```

### Métricas Calculadas:
```typescript
interface OrcamentoVsReal {
  mes: string;
  empresa: string;
  categoria: string;
  orcado: number;
  realizado: number;
  desvio: number;           // Realizado - Orcado
  desvioPerc: number;       // Desvio / Orcado * 100
  status: 'OK' | 'Aviso' | 'Crítico'; // > 10% = Aviso, > 20% = Crítico
  responsavel: string;
}

interface ResumoOrcamento {
  totalOrcado: number;
  totalRealizado: number;
  desvioTotal: number;
  taxaAderencia: number;    // 100 - |Desvio| %
  categoriasMaiorDesvio: string[];
}
```

### Gráficos:
1. **Barras Lado-a-Lado** (Grouped Bar)
   - Eixo X: Categoria
   - Eixo Y: Valor
   - Series: Orçado (azul), Realizado (verde/vermelho)

2. **Desvio %** (Line)
   - Mês a mês
   - Zona verde (-10% a +10%), amarela, vermelha

3. **Waterfall Explicativo**
   - Orçado Total → Desvios por categoria → Realizado Total

4. **Status por Departamento** (Card Grid com Cores)
   - Verde: Aderência > 90%
   - Amarela: 80-90%
   - Vermelha: < 80%

### KPIs (6 cards):
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Orcado Total │ Real Total   │ Desvio Total │ Desvio%      │ Top Desvio   │ Aderência    │
│ R$ 500.000   │ R$ 520.000   │ R$ 20.000    │ +4%          │ Marketing %  │ 96%          │
│              │              │              │              │ -25%         │ ✅ Bom      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 📊 MATRIZ DE FÁCILIDADE vs VALOR

```
         │ FÁCIL ───────────────→ DIFÍCIL
─────────┼────────────────────────────────────
ALTO    │ Cash Flow       Indicadores    Budget
VALOR   │ ⭐⭐⭐           ⭐⭐           ⭐⭐⭐
VENDA   │
         │
MÉDIO   │              Rentabilidade     Impostos
VALOR   │              ⭐⭐⭐            ⭐⭐⭐⭐
        │
BAIXO   │  Ativos          Vendas         Preditiva
VALOR   │  ⭐             ⭐⭐             ⭐⭐⭐⭐⭐
        │
```

---

## 🎯 ESTRUTURA DE PROJETO RECOMENDADA

Se criar Cash Flow, a estrutura seria:

```
/components
  /Charts
    CashFlowWaterfall.tsx
    EvolutionBalance.tsx
    Receivables.vs.Payables.tsx
    DueDatesTimeline.tsx
  /CashFlow
    CashFlowDashboard.tsx
    KPICashFlow.tsx
    TableDetails.tsx

/context
  CashFlowContext.tsx

/types
  (adicionar em types.ts)
  - CashFlowData
  - CashFlowMetrics
```

---

**Próximo passo:** Qual página você quer criar?
- [ ] Cash Flow Management
- [ ] Indicadores Financeiros
- [ ] Rentabilidade por Cliente
- [ ] Budgeting vs Realizado

Me avise e crio o Excel de exemplo + contexto TypeScript!
