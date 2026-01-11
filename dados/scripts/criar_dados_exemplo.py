import json
import random
from datetime import datetime, timedelta

# ============= CASH FLOW DATA =============
cash_flow_data = []
empresas = ['Alpha', 'Beta', 'Gamma']
categorias_receita = ['Vendas', 'Serviços', 'Outras Receitas', 'Juros', 'Aluguel de Imóvel']
categorias_despesa = ['Folha', 'Aluguel', 'Fornecedores', 'Utilities', 'Marketing', 'Tecnologia', 'Transporte', 'Impostos']
status_list = ['Pago', 'Aberto', 'Parcial', 'Atrasado']

base_date = datetime(2025, 1, 1)
for empresa in empresas:
    for mes in range(1, 13):
        # Receitas - aumentar quantidade de dados
        for i in range(random.randint(8, 15)):
            data_vencimento = base_date + timedelta(days=random.randint(0, 30))
            cash_flow_data.append({
                'id': f"cf_{empresa}_{mes}_{len(cash_flow_data)}",
                'mes': mes,
                'empresa': empresa,
                'tipo': 'Receber',
                'categoria': random.choice(categorias_receita),
                'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                'valor': random.randint(50000, 500000),
                'status': random.choice(status_list),
                'responsavel': random.choice(['Vendas', 'Gerente', 'Financeiro'])
            })

        # Despesas - aumentar quantidade e diversidade
        for i in range(random.randint(12, 25)):
            data_vencimento = base_date + timedelta(days=random.randint(0, 30))
            cash_flow_data.append({
                'id': f"cf_{empresa}_{mes}_{len(cash_flow_data)}",
                'mes': mes,
                'empresa': empresa,
                'tipo': 'Pagar',
                'categoria': random.choice(categorias_despesa),
                'data_vencimento': data_vencimento.strftime('%d/%m/%Y'),
                'valor': random.randint(10000, 300000),
                'status': random.choice(status_list),
                'responsavel': random.choice(['Financeiro', 'RH', 'Administrativo', 'Compras', 'Operações'])
            })

# ============= INDICADORES DATA =============
indicadores_data = []
for empresa in empresas:
    for mes in range(1, 13):
        # Garantir dados mais realistas e variados
        roe_base = random.randint(8, 35)
        roa_base = random.randint(4, 20)
        margem_liquida = random.uniform(5, 25)
        margem_operacional = random.uniform(10, 35)
        
        indicadores_data.append({
            'mes': mes,
            'empresa': empresa,
            'roe': round(roe_base + random.uniform(-3, 3), 2),
            'roa': round(roa_base + random.uniform(-2, 2), 2),
            'margemLiquida': round(margem_liquida, 2),
            'margemOperacional': round(margem_operacional, 2),
            'liquidezCorrente': round(random.uniform(1.2, 3.5), 2),
            'liquidezSeca': round(random.uniform(0.8, 2.5), 2),
            'endividamento': round(random.uniform(15, 70), 2),
            'alavancagem': round(random.uniform(1.2, 4.5), 2),
            'giroAtivo': round(random.uniform(0.8, 4.0), 2),
            'prazoRecebimento': random.randint(15, 60),
            'prazoPagamento': random.randint(20, 75)
        })

# ============= ORÇAMENTO DATA =============
orcamento_data = []
categorias_orcamento = [
    'Folha de Pagamento', 'Aluguel', 'Fornecedores', 'Marketing', 'Tecnologia', 
    'Utilities', 'Transporte', 'Manutenção', 'Consultoria', 'Seguros'
]

for empresa in empresas:
    for mes in range(1, 13):
        for categoria in categorias_orcamento:
            orcado = random.randint(50000, 500000)
            variacao = random.uniform(0.75, 1.35)  # 75% a 135% do orçado
            realizado = int(orcado * variacao)
            
            desvio_percentual = ((realizado - orcado) / orcado) * 100
            
            # Classificar observação baseado no desvio
            if -5 <= desvio_percentual <= 5:
                obs = 'Normal'
            elif desvio_percentual > 5:
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

for empresa in empresas:
    for ano in [2024, 2025]:
        for mes in range(1, 13):
            for categoria_tipo, subcategorias in categorias_despesa_detail.items():
                # Gerar 2-4 lançamentos por subcategoria por mês
                for _ in range(random.randint(2, 4)):
                    subcategoria = random.choice(subcategorias)
                    valor = random.randint(1000, 150000)
                    
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
