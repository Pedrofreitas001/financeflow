# 📋 ESTRUTURA DE TABELAS

## 1. CASH FLOW - Tabela de Fluxo de Caixa

```
ID | Mês | Empresa | Tipo      | Categoria        | Data Vencimento | Valor    | Status   | Responsável
---|-----|---------|-----------|------------------|-----------------|----------|----------|-------------
CF001 | 1  | Alpha   | Receber   | Vendas           | 15/01/2025     | 50000.00 | Pago     | Vendas
CF002 | 1  | Alpha   | Pagar     | Folha            | 30/01/2025     | 80000.00 | Aberto   | RH
CF003 | 1  | Alpha   | Pagar     | Aluguel          | 05/01/2025     | 10000.00 | Pago     | Admin
```

### Colunas:
- **ID:** Identificador único
- **Mês:** 1-12 (janeiro a dezembro)
- **Empresa:** Nome da empresa
- **Tipo:** "Receber" ou "Pagar"
- **Categoria:** Classificação (Vendas, Folha, Aluguel, etc)
- **Data Vencimento:** DD/MM/YYYY
- **Valor:** Número em reais (R$)
- **Status:** Aberto, Pago, Atrasado, Parcial
- **Responsável:** Quem controla

### Dados de Exemplo:
- Empresas: Alpha, Beta, Gamma
- Período: 12 meses
- Total: ~425 registros

---

## 2. INDICADORES - Tabela de Indicadores Financeiros

```
Mês | Empresa | ROE % | ROA % | Margem % | Liquidez | Endividamento % | Alavancagem | Giro Ativo
----|---------|-------|-------|----------|----------|-----------------|-------------|----------
1   | Alpha   | 15.3  | 8.2   | 12.5     | 1.8      | 35.0            | 2.1         | 2.3
1   | Beta    | 18.2  | 9.1   | 14.2     | 1.5      | 40.5            | 2.5         | 2.8
```

### Colunas:
- **Mês:** 1-12
- **Empresa:** Nome da empresa
- **ROE %:** Return on Equity (retorno sobre patrimônio)
- **ROA %:** Return on Assets (retorno sobre ativos)
- **Margem Líquida %:** Lucro / Receita
- **Liquidez Corrente:** Ativo Corrente / Passivo Corrente
- **Endividamento %:** Dívida / Patrimônio
- **Alavancagem:** Ativo Total / Patrimônio
- **Giro Ativo:** Receita / Ativo Total
- **Prazo Recebimento:** Dias médios para receber
- **Prazo Pagamento:** Dias médios para pagar

### Benchmarks de Setor:
- ROE: 15.5%
- ROA: 8.2%
- Margem Líquida: 12.0%
- Liquidez Corrente: 1.5x
- Endividamento: 40%

---

## 3. ORÇAMENTO - Tabela de Budgeting vs Realizado

```
Mês | Empresa | Categoria            | Orçado   | Realizado | Variância  | Variância % | Responsável
----|---------|----------------------|----------|-----------|------------|-------------|------------------
1   | Alpha   | Folha de Pagamento   | 80000.00 | 82000.00  | 2000.00    | 2.50%       | Gerente Financeiro
1   | Alpha   | Aluguel              | 10000.00 | 10000.00  | 0.00       | 0.00%       | Administrativo
1   | Alpha   | Fornecedores         | 120000.00| 118000.00 | -2000.00   | -1.67%      | Compras
```

### Colunas:
- **Mês:** 1-12
- **Empresa:** Nome da empresa
- **Categoria:** Departamento/Tipo de gasto
- **Orçado:** Valor planejado
- **Realizado:** Valor efetivamente gasto
- **Variância:** Realizado - Orçado
  - Positivo = gastou mais
  - Negativo = gastou menos
- **Variância %:** Percentual de desvio
- **Responsável:** Quem é responsável

### Categorias Padrão:
- Folha de Pagamento
- Aluguel
- Fornecedores
- Marketing
- Tecnologia
- Utilities
- Transporte
- Consultorias

### Status de Desvio:
- **OK:** -5% a +5%
- **Ótimo:** < -5%
- **Crítico:** > +5%

---

## Observações Importantes

1. **Data Format:** DD/MM/YYYY para datas
2. **Currency:** Valores em reais, sem símbolo R$ (apenas número)
3. **Decimals:** Use ponto como separador (50000.00, não 50.000,00)
4. **Períodos:** Sempre mês 1-12, nunca texto (não "Janeiro", apenas "1")
5. **Valores Vazios:** Deixar célula vazia ou 0 (conforme necessário)

---

**Versão:** 1.0  
**Data:** Janeiro 2026
