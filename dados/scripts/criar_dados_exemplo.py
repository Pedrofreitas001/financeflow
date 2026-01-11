import json
import random
from datetime import datetime, timedelta

# Seed para reproducibilidade
random.seed(42)

# ============= CASH FLOW DATA =============
cash_flow_data = []
empresas = ['Alpha', 'Beta', 'Gamma']
categorias_receita = ['Vendas', 'Serviços', 'Outras Receitas', 'Juros', 'Aluguel de Imóvel']
categorias_despesa = ['Folha', 'Aluguel', 'Fornecedores', 'Utilities', 'Marketing', 'Tecnologia', 'Transporte', 'Impostos']

base_date = datetime(2025, 1, 1)

# Valores base por empresa (mais realistas)
faturamento_anual = {
    'Alpha': 4200000,   # 350k/mês
    'Beta': 5400000,    # 450k/mês
    'Gamma': 3360000    # 280k/mês
}

custos_mensais = {
    'Alpha': 2800000,   # 70% do faturamento
    'Beta': 3600000,    # 67% do faturamento
    'Gamma': 2200000    # 65% do faturamento
}

for empresa in empresas:
    for mes in range(1, 13):
        receita_mes = (faturamento_anual[empresa] / 12) * random.uniform(0.85, 1.15)
        despesa_mes = (custos_mensais[empresa] / 12) * random.uniform(0.9, 1.1)
        
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
indicadores_data = []
for empresa in empresas:
    # Valores base por empresa (para manter consistência)
    roe_base = {'Alpha': 18, 'Beta': 22, 'Gamma': 15}[empresa]
    roa_base = {'Alpha': 10, 'Beta': 12, 'Gamma': 8}[empresa]
    margem_base = {'Alpha': 16, 'Beta': 18, 'Gamma': 12}[empresa]
    
    for mes in range(1, 13):
        indicadores_data.append({
            'mes': mes,
            'empresa': empresa,
            'roe': round(roe_base + random.uniform(-4, 4), 2),
            'roa': round(roa_base + random.uniform(-2, 2), 2),
            'margemLiquida': round(margem_base + random.uniform(-3, 3), 2),
            'margemOperacional': round(margem_base + 5 + random.uniform(-3, 3), 2),
            'liquidezCorrente': round(random.uniform(1.5, 2.8), 2),
            'liquidezSeca': round(random.uniform(1.0, 2.2), 2),
            'endividamento': round(random.uniform(25, 55), 2),
            'alavancagem': round(random.uniform(1.8, 3.5), 2),
            'giroAtivo': round(random.uniform(1.5, 3.5), 2),
            'prazoRecebimento': random.randint(18, 45),
            'prazoPagamento': random.randint(25, 60)
        })

# ============= ORÇAMENTO DATA =============
orcamento_data = []
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

for empresa in empresas:
    custo_total_anual = custos_mensais[empresa]
    
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
despesas_data = []
categorias_despesa_detail = {
    'FOLHA DE PAGAMENTO': [
        'Salários', 'Adiantamento', 'Férias', '13º Salário', 'Pro-Labore', 
        'Estagiários', 'PLR', 'Sindicato'
    ],
    'ENCARGOS': [
        'INSS', 'FGTS', 'PIS', 'Vale Transporte', 'Vale Refeição', 
        'Plano de Saúde', 'Seguro de Vida'
    ],
    'INFRAESTRUTURA': [
        'Aluguel', 'Energia Elétrica', 'Água', 'Internet', 'Telefonia', 
        'Limpeza e Conservação', 'Segurança', 'Manutenção Predial'
    ],
    'FORNECEDORES': [
        'Matérias Primas', 'Embalagem', 'Insumos', 'Componentes', 'Produtos Acabados'
    ],
    'COMERCIAL': [
        'Comissões', 'Marketing', 'Publicidade', 'Despesas Comerciais', 'Brindes e Promoções'
    ],
    'ADMINISTRATIVO': [
        'Contador', 'Advogado', 'Consultorias', 'Softwares e Licenças', 
        'Material de Escritório', 'Assinaturas'
    ],
    'LOGÍSTICA': [
        'Frete', 'Combustível', 'Manutenção de Veículos', 'IPVA e Licenciamento'
    ],
    'IMPOSTOS': [
        'ICMS', 'ISS', 'Simples Nacional', 'COFINS', 'CSLL', 'IRPJ', 'INSS Patronal'
    ]
}

# Valores base por categoria (em % do custo mensal)
valores_categoria = {
    'FOLHA DE PAGAMENTO': 0.45,
    'ENCARGOS': 0.12,
    'INFRAESTRUTURA': 0.10,
    'FORNECEDORES': 0.20,
    'COMERCIAL': 0.04,
    'ADMINISTRATIVO': 0.05,
    'LOGÍSTICA': 0.02,
    'IMPOSTOS': 0.02
}

for empresa in empresas:
    custo_mes_base = custos_mensais[empresa] / 12
    
    for ano in [2024, 2025]:
        for mes in range(1, 13):
            for categoria_tipo, subcategorias in categorias_despesa_detail.items():
                valor_categoria = custo_mes_base * valores_categoria[categoria_tipo]
                num_lancamentos = len(subcategorias)
                valor_unitario = valor_categoria / num_lancamentos
                
                for subcategoria in subcategorias:
                    valor = int(valor_unitario * random.uniform(0.8, 1.2))
                    
                    despesas_data.append({
                        'ano': ano,
                        'mes': mes,
                        'empresa': empresa,
                        'categoria': categoria_tipo,
                        'subcategoria': subcategoria,
                        'valor': valor
                    })

# Salvar JSONs
with open('dados_cash_flow_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(cash_flow_data, f, ensure_ascii=False, indent=2)

with open('dados_indicadores_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(indicadores_data, f, ensure_ascii=False, indent=2)

with open('dados_orcamento_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(orcamento_data, f, ensure_ascii=False, indent=2)

with open('dados_despesas_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(despesas_data, f, ensure_ascii=False, indent=2)

print("✅ Arquivos JSON gerados com sucesso!")
print(f"  - Cash Flow: {len(cash_flow_data)} registros")
print(f"  - Indicadores: {len(indicadores_data)} registros")
print(f"  - Orçamento: {len(orcamento_data)} registros")
print(f"  - Despesas: {len(despesas_data)} registros")

# ============= INDICADORES DATA =============
indicadores_data = []
for empresa in empresas:
    # Valores base por empresa (para manter consistência)
    roe_base = {'Alpha': 18, 'Beta': 22, 'Gamma': 15}[empresa]
    roa_base = {'Alpha': 10, 'Beta': 12, 'Gamma': 8}[empresa]
    margem_base = {'Alpha': 16, 'Beta': 18, 'Gamma': 12}[empresa]
    
    for mes in range(1, 13):
        indicadores_data.append({
            'mes': mes,
            'empresa': empresa,
            'roe': round(roe_base + random.uniform(-4, 4), 2),
            'roa': round(roa_base + random.uniform(-2, 2), 2),
            'margemLiquida': round(margem_base + random.uniform(-3, 3), 2),
            'margemOperacional': round(margem_base + 5 + random.uniform(-3, 3), 2),
            'liquidezCorrente': round(random.uniform(1.5, 2.8), 2),
            'liquidezSeca': round(random.uniform(1.0, 2.2), 2),
            'endividamento': round(random.uniform(25, 55), 2),
            'alavancagem': round(random.uniform(1.8, 3.5), 2),
            'giroAtivo': round(random.uniform(1.5, 3.5), 2),
            'prazoRecebimento': random.randint(18, 45),
            'prazoPagamento': random.randint(25, 60)
        })

# ============= ORÇAMENTO DATA =============
orcamento_data = []
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

for empresa in empresas:
    custo_total_anual = custos_mensais[empresa]
    
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
despesas_data = []
categorias_despesa_detail = {
    'FOLHA DE PAGAMENTO': [
        'Salários', 'Adiantamento', 'Férias', '13º Salário', 'Pro-Labore', 
        'Estagiários', 'PLR', 'Sindicato'
    ],
    'ENCARGOS': [
        'INSS', 'FGTS', 'PIS', 'Vale Transporte', 'Vale Refeição', 
        'Plano de Saúde', 'Seguro de Vida'
    ],
    'INFRAESTRUTURA': [
        'Aluguel', 'Energia Elétrica', 'Água', 'Internet', 'Telefonia', 
        'Limpeza e Conservação', 'Segurança', 'Manutenção Predial'
    ],
    'FORNECEDORES': [
        'Matérias Primas', 'Embalagem', 'Insumos', 'Componentes', 'Produtos Acabados'
    ],
    'COMERCIAL': [
        'Comissões', 'Marketing', 'Publicidade', 'Despesas Comerciais', 'Brindes e Promoções'
    ],
    'ADMINISTRATIVO': [
        'Contador', 'Advogado', 'Consultorias', 'Softwares e Licenças', 
        'Material de Escritório', 'Assinaturas'
    ],
    'LOGÍSTICA': [
        'Frete', 'Combustível', 'Manutenção de Veículos', 'IPVA e Licenciamento'
    ],
    'IMPOSTOS': [
        'ICMS', 'ISS', 'Simples Nacional', 'COFINS', 'CSLL', 'IRPJ', 'INSS Patronal'
    ]
}

# Valores base por categoria (em % do custo mensal)
valores_categoria = {
    'FOLHA DE PAGAMENTO': 0.45,
    'ENCARGOS': 0.12,
    'INFRAESTRUTURA': 0.10,
    'FORNECEDORES': 0.20,
    'COMERCIAL': 0.04,
    'ADMINISTRATIVO': 0.05,
    'LOGÍSTICA': 0.02,
    'IMPOSTOS': 0.02
}

for empresa in empresas:
    custo_mes_base = custos_mensais[empresa] / 12
    
    for ano in [2024, 2025]:
        for mes in range(1, 13):
            for categoria_tipo, subcategorias in categorias_despesa_detail.items():
                valor_categoria = custo_mes_base * valores_categoria[categoria_tipo]
                num_lancamentos = len(subcategorias)
                valor_unitario = valor_categoria / num_lancamentos
                
                for subcategoria in subcategorias:
                    valor = int(valor_unitario * random.uniform(0.8, 1.2))
                    
                    despesas_data.append({
                        'ano': ano,
                        'mes': mes,
                        'empresa': empresa,
                        'categoria': categoria_tipo,
                        'subcategoria': subcategoria,
                        'valor': valor
                    })

# Salvar JSONs
with open('dados_cash_flow_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(cash_flow_data, f, ensure_ascii=False, indent=2)

with open('dados_indicadores_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(indicadores_data, f, ensure_ascii=False, indent=2)

with open('dados_orcamento_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(orcamento_data, f, ensure_ascii=False, indent=2)

with open('dados_despesas_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(despesas_data, f, ensure_ascii=False, indent=2)

print("✅ Arquivos JSON gerados com sucesso!")
print(f"  - Cash Flow: {len(cash_flow_data)} registros")
print(f"  - Indicadores: {len(indicadores_data)} registros")
print(f"  - Orçamento: {len(orcamento_data)} registros")
print(f"  - Despesas: {len(despesas_data)} registros")
print(f"  - Orçamento: {len(orcamento_data)} registros")
