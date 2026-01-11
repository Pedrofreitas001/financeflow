# 📊 GUIA DE IMPORT - Como Importar Dados

## 1. PREPARAÇÃO DOS DADOS

### Passo 1: Obtenha seu arquivo Excel
Arquivos de exemplo disponíveis em `dados/excel_exemplos/`:
- `CashFlow_Exemplo.xlsx`
- `Indicadores_Exemplo.xlsx`
- `Orcamento_Exemplo.xlsx`

### Passo 2: Adapte o arquivo
1. Abra o arquivo Excel
2. Substitua os dados de exemplo por seus dados reais
3. **Mantenha o MESMO formato de colunas**
4. Salve como `.xlsx`

---

## 2. VALIDAÇÕES IMPORTANTES

### Cash Flow
```
✅ CORRETO:
- Mes: 1 (não "Janeiro")
- Tipo: "Receber" ou "Pagar" (exatamente assim)
- Data: DD/MM/YYYY
- Status: "Aberto", "Pago", "Atrasado", "Parcial"

❌ INCORRETO:
- Mes: "January" ou "01"
- Tipo: "receber" ou "RECEBER"
- Data: 2025-01-15
- Status: "pendente" ou "concluido"
```

### Indicadores
```
✅ CORRETO:
- Todas as colunas de percentual com número
- Valores podem ser negativos (ex: -2.5)
- Rounding: 2 casas decimais

❌ INCORRETO:
- Texto em coluna numérica
- Percentual com símbolo (15% em vez de 15)
- Mais de 2 casas decimais
```

### Orçamento
```
✅ CORRETO:
- Orcado e Realizado: números (ex: 50000.00)
- Variância é calculada automaticamente
- Valores podem ser muito grandes (milhões)

❌ INCORRETO:
- Valores com ponto de milhar: 50.000,00
- Preenchimento manual de Variância
- Valores fora de range (negativo onde não faz sentido)
```

---

## 3. PASSOS PARA CARREGAR NO DASHBOARD

### Opção A: Upload Manual (Recomendado para começar)
1. Abra o Dashboard
2. Vá para Settings/Importação
3. Clique "Upload Excel"
4. Selecione seu arquivo
5. Confirme o mapeamento de colunas
6. Dados carregados ✅

### Opção B: API (Para integração contínua)
```
POST /api/import/cashflow
Content-Type: application/json

{
  "data": [
    {
      "mes": 1,
      "empresa": "Alpha",
      "tipo": "Receber",
      "categoria": "Vendas",
      "data_vencimento": "15/01/2025",
      "valor": 50000,
      "status": "Pago",
      "responsavel": "Vendas"
    }
  ]
}
```

---

## 4. TROUBLESHOOTING

### Dados não aparecem
- ❌ Verifique se as colunas estão no mesmo ordem
- ❌ Verifique se os valores estão corretos (sem caracteres especiais)
- ❌ Tente salvar como UTF-8

### Valores aparecem com erro
- ❌ Confira o formato dos números (ponto decimal, não vírgula)
- ❌ Confira datas (DD/MM/YYYY)
- ❌ Tente remover formatação do Excel (copiar/colar especial como valor)

### Falta uma coluna
- ❌ Todas as colunas são obrigatórias
- ❌ Se não tem dado, deixe em branco (não delete a coluna)
- ❌ Se é texto opcional, deixe vazio ou "-"

---

## 5. FREQUÊNCIA DE ATUALIZAÇÃO

**Recomendado:**
- **Cash Flow:** Diário ou a cada 2 dias
- **Indicadores:** Mensal (após fechar o mês)
- **Orçamento:** Mensal (comparar mês vs mês)

---

**Versão:** 1.0  
**Data:** Janeiro 2026
