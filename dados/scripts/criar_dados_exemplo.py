import json
import random
from datetime import datetime, timedelta

# Seed para reproducibilidade
random.seed(42)

# ============= DEFINIÇÕES BÁSICAS =============
empresas = ['Alpha', 'Beta', 'Gamma']
meses = list(range(1, 13))
base_date = datetime(2024, 1, 1)

# Faturamento anual base (em reais)
faturamento_anual = {
    'Alpha': 4200000,   # 350k/mês média
    'Beta': 5400000,    # 450k/mês média
    'Gamma': 3360000    # 280k/mês média
}

# Custos mensais (em % do faturamento)
custo_percentual = {
    'Alpha': 0.70,
    'Beta': 0.67,
    'Gamma': 0.65
}

# Calcular custos mensais
custos_mensais = {
    empresa: (faturamento_anual[empresa] * custo_percentual[empresa]) / 12
    for empresa in empresas
}

# ============= CATEGORIAS =============
categorias_receita = ['Vendas de Produtos', 'Vendas de Serviços', 'Aluguel Recebido', 'Juros Recebidos']
categorias_despesa = ['Fornecedores', 'Salários', 'Aluguel', 'Serviços', 'Transportes', 'Energia', 'Comunicação', 'IPTU', 'ISS']

# ============= CASH FLOW DATA =============
cash_flow_data = []

for empresa in empresas:
    for mes in range(1, 13):
        receita_mes = (faturamento_anual[empresa] / 12) * random.uniform(0.85, 1.15)
        despesa_mes = custos_mensais[empresa] * random.uniform(0.9, 1.1)
        
        # Receitas - distribuir ao longo do mês
        num_receitas = random.randint(8, 15)
        receita_unitaria = receita_mes / num_receitas
        for i in range(num_receitas):
            data_vencimento = base_date + timedelta(days=random.randint(0, 30))
            cash_flow_data.append({
                'id': f"cf_{empresa}_{mes}_{len(cash_flow_data)}",
                'mes': mes,
                'empresa': empresa,
                'tipo': 'Receber',
                'categoria': random.choice(categorias_receita),
                'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                'valor': int(receita_unitaria * random.uniform(0.8, 1.2)),
                'status': random.choice(['Pago'] * 70 + ['Aberto'] * 20 + ['Parcial'] * 7 + ['Atrasado'] * 3),
                'responsavel': random.choice(['Vendas', 'Gerente', 'Financeiro'])
            })

        # Despesas - distribuir ao longo do mês
        num_despesas = random.randint(12, 25)
        despesa_unitaria = despesa_mes / num_despesas
        for i in range(num_despesas):
            data_vencimento = base_date + timedelta(days=random.randint(0, 30))
            cash_flow_data.append({
                'id': f"cf_{empresa}_{mes}_{len(cash_flow_data)}",
                'mes': mes,
                'empresa': empresa,
                'tipo': 'Pagar',
                'categoria': random.choice(categorias_despesa),
                'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                'valor': int(despesa_unitaria * random.uniform(0.7, 1.3)),
                'status': random.choice(['Pago'] * 60 + ['Aberto'] * 30 + ['Atrasado'] * 10),
                'responsavel': random.choice(['Financeiro', 'RH', 'Administrativo', 'Compras', 'Operações'])
            })

# ============= INDICADORES DATA =============
# Valores base por empresa
metricas_base = {
    'Alpha': {
        'roe': 18.5, 'roa': 10.2, 'margem': 16.5, 'liquidez': 1.8, 
        'endividamento': 35, 'alavancagem': 2.2, 'giro': 2.0, 'receita_base': 350000
    },
    'Beta': {
        'roe': 22.0, 'roa': 12.5, 'margem': 18.5, 'liquidez': 2.0, 
        'endividamento': 30, 'alavancagem': 2.5, 'giro': 2.3, 'receita_base': 450000
    },
    'Gamma': {
        'roe': 15.5, 'roa': 8.5, 'margem': 12.5, 'liquidez': 1.6, 
        'endividamento': 40, 'alavancagem': 2.0, 'giro': 1.8, 'receita_base': 280000
    }
}

indicadores_data = []

for empresa in empresas:
    base = metricas_base[empresa]
    for mes in range(1, 13):
        # Adicionar variação mensal realista
        variacao_mes = (mes - 6.5) * 0.5  # Tendência ao longo do ano
        sazonalidade = 0.05 * (3 if mes in [11, 12] else (0.8 if mes in [1, 2] else 1))
        
        receita_mes = base['receita_base'] * (1 + sazonalidade)
        custos_mes = custos_mensais[empresa]
        lucro_mes = receita_mes - custos_mes
        patrimonio = (faturamento_anual[empresa] * 0.3)  # Patrimônio estimado
        ativo = receita_mes * 3  # Ativo estimado
        
        indicadores_data.append({
            'mes': mes,
            'empresa': empresa,
            'roe': max(5, round(base['roe'] + variacao_mes + random.uniform(-3, 3), 2)),
            'roa': max(2, round(base['roa'] + variacao_mes/2 + random.uniform(-2, 2), 2)),
            'margemLiquida': max(5, round((lucro_mes / receita_mes * 100) + random.uniform(-2, 2), 2)),
            'margemOperacional': max(8, round((lucro_mes / receita_mes * 100) + 5 + random.uniform(-2, 2), 2)),
            'liquidezCorrente': max(0.8, round(base['liquidez'] + random.uniform(-0.3, 0.5), 2)),
            'liquidezSeca': max(0.5, round(base['liquidez'] - 0.8 + random.uniform(-0.2, 0.4), 2)),
            'endividamento': round(base['endividamento'] + random.uniform(-5, 5), 2),
            'alavancagem': max(1, round(base['alavancagem'] + random.uniform(-0.3, 0.3), 2)),
            'giroAtivo': max(1, round(base['giro'] + random.uniform(-0.3, 0.5), 2)),
            'prazoRecebimento': max(15, int(30 + variacao_mes + random.randint(-5, 5))),
            'prazoPagamento': max(20, int(35 + variacao_mes + random.randint(-5, 5)))
        })

# ============= ORÇAMENTO DATA =============
categorias_orcamento = [
    'Folha de Pagamento', 'Aluguel', 'Fornecedores', 'Marketing', 'Tecnologia', 
    'Utilities', 'Transporte', 'Manutenção', 'Consultoria', 'Seguros'
]

# Orçamento base anual por categoria (em %)
orcamento_anual_pct = {
    'Folha de Pagamento': 0.45,
    'Aluguel': 0.08,
    'Fornecedores': 0.20,
    'Marketing': 0.05,
    'Tecnologia': 0.04,
    'Utilities': 0.03,
    'Transporte': 0.03,
    'Manutenção': 0.02,
    'Consultoria': 0.02,
    'Seguros': 0.03
}

orcamento_data = []

for empresa in empresas:
    custo_total_anual = faturamento_anual[empresa] * custo_percentual[empresa]
    
    for mes in range(1, 13):
        for categoria in categorias_orcamento:
            # Orçado = base anual * % da categoria / 12
            orcado = int((custo_total_anual * orcamento_anual_pct[categoria]) / 12)
            
            # Realizado com variação realista
            variacao = random.uniform(0.85, 1.15)
            realizado = int(orcado * variacao)
            
            desvio = ((realizado - orcado) / orcado) * 100
            
            # Classificar observação
            if -5 <= desvio <= 5:
                obs = 'Normal'
            elif desvio > 5:
                obs = 'Acima'
            else:
                obs = 'Abaixo'
            
            orcamento_data.append({
                'mes': mes,
                'empresa': empresa,
                'categoria': categoria,
                'orcado': orcado,
                'realizado': realizado,
                'responsavel': random.choice(['Gerente Financeiro', 'Diretor', 'Controller', 'Gerente de Área']),
                'observacoes': obs
            })

# ============= DESPESAS DATA =============
categorias_despesa_detail = {
    'FOLHA DE PAGAMENTO': [
        'Salários', 'Adiantamento', 'Férias', '13º Salário', 'Pro-Labore', 
        'Estagiários', 'PLR', 'Sindicato'
    ],
    'ENCARGOS': [
        'INSS', 'FGTS', 'Seguro Desemprego', 'Contribuição Sindical'
    ],
    'ADMINISTRATIVO': [
        'Aluguel', 'Luz', 'Água', 'Telefone', 'Internet', 'Limpeza', 'Segurança'
    ],
    'OPERACIONAL': [
        'Fornecedores', 'Fretes', 'Combustível', 'Manutenção Equipamentos', 'Peças'
    ],
    'MARKETING': [
        'Publicidade', 'Redes Sociais', 'Eventos', 'Impressos', 'Patrocínios'
    ],
    'TECNOLOGIA': [
        'Software', 'Hardware', 'Licenças', 'Suporte TI', 'Infraestrutura'
    ],
    'FINANCEIRO': [
        'Juros', 'Taxas Bancárias', 'Seguros', 'Impostos'
    ]
}

despesas_data = []

for empresa in empresas:
    for mes in range(1, 13):
        for categoria_principal, subcategorias in categorias_despesa_detail.items():
            # Calcular despesa para categoria
            pct_categoria = orcamento_anual_pct.get(categoria_principal, 0.05)
            despesa_categoria = int((custos_mensais[empresa] * pct_categoria) / len(subcategorias))
            
            for subcategoria in subcategorias:
                num_items = random.randint(1, 3)
                item_value = despesa_categoria // num_items
                
                for _ in range(num_items):
                    data_lancamento = base_date + timedelta(days=random.randint(0, 30))
                    data_vencimento = data_lancamento + timedelta(days=random.randint(0, 60))
                    
                    despesas_data.append({
                        'id': f"desp_{empresa}_{mes}_{len(despesas_data)}",
                        'mes': mes,
                        'empresa': empresa,
                        'categoria': categoria_principal,
                        'subcategoria': subcategoria,
                        'data_lancamento': data_lancamento.strftime('%d/%m/%Y'),
                        'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                        'valor': int(item_value * random.uniform(0.8, 1.2)),
                        'status': random.choice(['Pago'] * 70 + ['Aberto'] * 20 + ['Atrasado'] * 10),
                        'responsavel': random.choice(['Financeiro', 'RH', 'Admin', 'Operacional']),
                        'fornecedor': f"Fornecedor {random.randint(1, 10)}"
                    })

# ============= EXPORTAR DADOS =============
print("✅ Gerando JSON de exemplos...")

# Salvar cash flow
with open('../cash_flow.json', 'w', encoding='utf-8') as f:
    json.dump(cash_flow_data, f, ensure_ascii=False, indent=2)

# Salvar indicadores
with open('../indicadores.json', 'w', encoding='utf-8') as f:
    json.dump(indicadores_data, f, ensure_ascii=False, indent=2)

# Salvar orçamento
with open('../orcamento.json', 'w', encoding='utf-8') as f:
    json.dump(orcamento_data, f, ensure_ascii=False, indent=2)

# Salvar despesas
with open('../despesas.json', 'w', encoding='utf-8') as f:
    json.dump(despesas_data, f, ensure_ascii=False, indent=2)

print(f"✅ Arquivos JSON gerados com sucesso!")
print(f"   - Cash Flow: {len(cash_flow_data)} registros")
print(f"   - Indicadores: {len(indicadores_data)} registros")
print(f"   - Orçamento: {len(orcamento_data)} registros")
print(f"   - Despesas: {len(despesas_data)} registros")
