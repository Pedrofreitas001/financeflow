import json
import random
from datetime import datetime, timedelta

# ============= CASH FLOW DATA =============
cash_flow_data = []
empresas = ['Alpha', 'Beta', 'Gamma']
categorias_receita = ['Vendas', 'Serviços', 'Outras Receitas']
categorias_despesa = ['Folha', 'Aluguel', 'Fornecedores', 'Utilities', 'Marketing', 'Tecnologia']

base_date = datetime(2025, 1, 1)
for empresa in empresas:
    for mes in range(1, 13):
        # Receitas
        for _ in range(random.randint(3, 6)):
            data_vencimento = base_date + timedelta(days=random.randint(0, 30))
            cash_flow_data.append({
                'id': f"cf_{empresa}_{mes}_{len(cash_flow_data)}",
                'mes': mes,
                'empresa': empresa,
                'tipo': 'Receber',
                'categoria': random.choice(categorias_receita),
                'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                'valor': random.randint(50000, 500000),
                'status': random.choice(['Pago', 'Aberto', 'Parcial']),
                'responsavel': 'Vendas'
            })

        # Despesas
        for _ in range(random.randint(5, 10)):
            data_vencimento = base_date + timedelta(days=random.randint(0, 30))
            cash_flow_data.append({
                'id': f"cf_{empresa}_{mes}_{len(cash_flow_data)}",
                'mes': mes,
                'empresa': empresa,
                'tipo': 'Pagar',
                'categoria': random.choice(categorias_despesa),
                'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                'valor': random.randint(10000, 300000),
                'status': random.choice(['Pago', 'Aberto', 'Atrasado', 'Parcial']),
                'responsavel': random.choice(['Financeiro', 'RH', 'Administrativo'])
            })

# ============= INDICADORES DATA =============
indicadores_data = []
for empresa in empresas:
    for mes in range(1, 13):
        roe_base = random.randint(8, 25)
        roa_base = random.randint(4, 15)
        
        indicadores_data.append({
            'mes': mes,
            'empresa': empresa,
            'roe': roe_base + random.uniform(-2, 2),
            'roa': roa_base + random.uniform(-1, 1),
            'margemLiquida': random.uniform(5, 20),
            'margemOperacional': random.uniform(10, 25),
            'liquidezCorrente': random.uniform(1.2, 2.5),
            'liquidezSeca': random.uniform(0.8, 1.8),
            'endividamento': random.uniform(20, 60),
            'alavancagem': random.uniform(1.5, 3.5),
            'giroAtivo': random.uniform(1.2, 3.0),
            'prazoRecebimento': random.randint(20, 45),
            'prazoPagamento': random.randint(25, 50)
        })

# ============= ORCAMENTO DATA =============
orcamento_data = []
categorias_orcamento = ['Folha de Pagamento', 'Aluguel', 'Fornecedores', 'Marketing', 'Tecnologia', 'Utilities']

for empresa in empresas:
    for mes in range(1, 13):
        for categoria in categorias_orcamento:
            orcado = random.randint(50000, 500000)
            variacao = random.uniform(0.8, 1.2)  # 80% a 120% do orçado
            realizado = int(orcado * variacao)
            
            orcamento_data.append({
                'mes': mes,
                'empresa': empresa,
                'categoria': categoria,
                'orcado': orcado,
                'realizado': realizado,
                'responsavel': random.choice(['Gerente Financeiro', 'Diretor', 'Controller']),
                'observacoes': 'Normal' if 0.9 < (realizado/orcado) < 1.1 else ('Acima' if realizado > orcado else 'Abaixo')
            })

# Salvar JSONs
with open('dados_cash_flow_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(cash_flow_data, f, ensure_ascii=False, indent=2)

with open('dados_indicadores_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(indicadores_data, f, ensure_ascii=False, indent=2)

with open('dados_orcamento_exemplo.json', 'w', encoding='utf-8') as f:
    json.dump(orcamento_data, f, ensure_ascii=False, indent=2)

print("✅ Arquivos JSON gerados com sucesso!")
print(f"  - Cash Flow: {len(cash_flow_data)} registros")
print(f"  - Indicadores: {len(indicadores_data)} registros")
print(f"  - Orçamento: {len(orcamento_data)} registros")
