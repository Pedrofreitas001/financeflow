# 🧪 Guia de Testes - Análise de Despesas

## ✅ Checklist de Testes

### 1. Navegação
- [ ] Botão "Dashboard Financeiro" leva ao dashboard original
- [ ] Botão "Análise de Despesas" leva à nova página
- [ ] Sidebar permanece visível em ambas as páginas
- [ ] Tema escuro/claro muda corretamente em ambas as páginas

### 2. Upload de Dados

#### Dashboard Financeiro
- [ ] Campo de upload muda para "Carregar Excel Financeiro"
- [ ] Upload do `dro_empresas_ficticias.xlsx` funciona
- [ ] Filtros de empresa aparecem corretamente
- [ ] Filtros de período aparecem corretamente

#### Análise de Despesas
- [ ] Campo de upload muda para "Carregar Excel de Despesas"
- [ ] Upload do `despesas_upload_dashboard.xlsx` funciona
- [ ] KPIs aparecem com valores corretos
- [ ] Gráficos carregam sem erros

### 3. Filtros de Despesas
- [ ] Filtro de empresa funciona (Todas, Alpha, Beta, Gamma)
- [ ] Filtros de período são checkboxes (múltipla seleção)
- [ ] Gráficos atualizam ao alterar filtros
- [ ] KPIs recalculam com novos filtros

### 4. Visualizações de Despesas

#### KPI Grid
- [ ] 5 cards de KPI aparecem
- [ ] Valores estão em formato moeda brasileira (R$)
- [ ] Ícones aparecem com cores corretas
- [ ] Cards têm efeito hover

#### Evolução Mensal
- [ ] Gráfico de linha carrega
- [ ] Tooltip aparece ao passar o mouse
- [ ] Linha é verde e suave
- [ ] Mostra 3 cards com Total, Média e Variação
- [ ] Variação MoM mostra seta correta (↑ ou ↓)

#### Despesas por Categoria
- [ ] Gráfico de barras carrega
- [ ] Cada barra tem cor diferente
- [ ] Legenda abaixo mostra categorias com percentuais
- [ ] Valores são formatados em moeda

#### Comparação de Períodos
- [ ] Se < 6 meses: mensagem "Selecione pelo menos 6 meses"
- [ ] Se ≥ 6 meses: gráfico de comparação aparece
- [ ] Duas linhas (azul e roxo) aparecem
- [ ] Dropdown de categoria funciona
- [ ] Variação entre períodos mostra corretamente

### 5. Responsividade
- [ ] Layout funciona em desktop (1920px)
- [ ] Layout funciona em tablet (768px)
- [ ] Layout funciona em mobile (375px)
- [ ] Gráficos se ajustam ao tamanho

### 6. Performance
- [ ] Página carrega rápido (<2s)
- [ ] Gráficos não travam ao mudar filtros
- [ ] Sem erros no console

### 7. Dados Fictícios

#### Verificar estrutura
- [ ] 1620 registros de despesas
- [ ] 3 empresas com dados
- [ ] 12 meses de dados
- [ ] 8 categorias de despesas
- [ ] 36 registros de faturamento

#### Verificar cálculos
- [ ] Total de despesas > 0
- [ ] Despesas fixas > 0
- [ ] Despesas variáveis > 0
- [ ] Ticket médio calculado corretamente
- [ ] % Faturamento é valor entre 0-100

## 🔧 Testes de Integração

### Com Dashboard Financeiro
- [ ] Upload em Dashboard não afeta Despesas
- [ ] Filtros não se compartilham entre páginas
- [ ] Ambas as páginas mantêm seus dados
- [ ] Switch de página é instantâneo

### Com Tema
- [ ] Dashboard mantém tema ao trocar página
- [ ] Cores dos gráficos mudam se trocar tema
- [ ] Fundo é correto em cada tema

## 🐛 Verificação de Erros

### Console
- [ ] Sem erros vermelhos
- [ ] Sem avisos críticos
- [ ] Sem console.log de debug

### Performance
- [ ] Memória não cresce indefinidamente
- [ ] Gráficos renderizam suavemente
- [ ] Nenhum lag ao filtrar

## 📊 Verificação de Dados

### Após upload do `despesas_upload_dashboard.xlsx`

1. **Total Período**
   - Esperado: R$ em milhões
   - [ ] Valor é > 0
   - [ ] Valor é < R$ 100 milhões

2. **Média Mensal**
   - Esperado: Total / 12
   - [ ] Cálculo correto

3. **Variação MoM**
   - Esperado: -50% a +50%
   - [ ] Percentual aparece
   - [ ] Seta para cima se positivo
   - [ ] Seta para baixo se negativo

4. **Distribuição por Categoria**
   - [ ] Todas as categorias aparecem
   - [ ] Soma dos % = 100%
   - [ ] Cores diferentes para cada

5. **Comparação**
   - [ ] 1º Período = 6 primeiros meses
   - [ ] 2º Período = 6 últimos meses
   - [ ] Variação = (2º - 1º) / 1º * 100

## 🎯 Testes de Usabilidade

- [ ] Hover nos botões funciona
- [ ] Tooltips aparecem corretamente
- [ ] Nada fica cortado na tela
- [ ] Fontes legíveis em todos os tamanhos
- [ ] Cores têm bom contraste

## 📝 Testes de Funcionalidade

### Filtros
- [ ] Seleção múltipla de meses funciona
- [ ] Clique no mesmo mês novamente o deseleciona
- [ ] Mudar empresa recarrega dados
- [ ] Sem mês selecionado = todos os meses

### Gráficos
- [ ] Clique em legenda não quebra gráfico
- [ ] Zoom não afeta layout
- [ ] Exportar PDF (quando disponível) funciona

## ✨ Testes de Qualidade Visual

- [ ] Sem flickering ao carregar
- [ ] Transições são suaves
- [ ] Cores estão corretas (sem distorções)
- [ ] Ícones aparecem nitidamente
- [ ] Fontes renderizam bem

## 🚀 Resultado Esperado

Após todos os testes com sucesso, a página de Análise de Despesas deve:

1. ✅ Carregar os dados de despesas corretamente
2. ✅ Mostrar 5 KPIs principais calculados
3. ✅ Renderizar 3 gráficos interativos
4. ✅ Permitir filtrar por empresa e período
5. ✅ Ter layout responsivo e fluido
6. ✅ Se integrar perfeitamente com o dashboard existente
7. ✅ Manter consistência de design e UX

---

**Data de criação**: Janeiro 2026
**Versão**: 1.0
**Status**: Pronto para QA
