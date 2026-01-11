import pandas as pd
import numpy as np
from datetime import datetime

# Lê o arquivo Excel original
df_original = pd.read_excel('exemplo_aba_despesas.xlsx')

print("📊 Criando Excel Modelo Estruturado para Despesas...")

# Estrutura dos dados fictícios
meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

# Categorias principais de despesas
categorias = {
    'INSUMOS': [
        'Alimentar',
        'Higiene e Limpeza',
        'Descartável',
        'Embalagem',
        'Material de Escritório'
    ],
    'FOLHA DE PAGAMENTO': [
        'Salários',
        'Adiantamento',
        'Férias',
        '13º Salário',
        'Pro-Labore',
        'Estagiários',
        'PLR',
        'Sindicato'
    ],
    'ENCARGOS': [
        'INSS',
        'FGTS',
        'PIS',
        'Vale Transporte',
        'Vale Refeição',
        'Plano de Saúde',
        'Seguro de Vida'
    ],
    'COMERCIAL': [
        'Comissões',
        'Marketing',
        'Publicidade',
        'Despesas Comerciais'
    ],
    'INFRAESTRUTURA': [
        'Aluguel',
        'Energia Elétrica',
        'Água',
        'Internet',
        'Telefonia',
        'Limpeza e Conservação',
        'Segurança'
    ],
    'ADMINISTRATIVO': [
        'Contador',
        'Advogado',
        'Consultorias',
        'Softwares e Licenças',
        'Material de Escritório'
    ],
    'LOGÍSTICA': [
        'Frete',
        'Combustível',
        'Manutenção de Veículos',
        'IPVA e Licenciamento'
    ],
    'IMPOSTOS': [
        'ICMS',
        'ISS',
        'Simples Nacional',
        'COFINS',
        'CSLL'
    ]
}

# Empresas fictícias
empresas = ['Empresa Alpha LTDA', 'Empresa Beta S.A.', 'Empresa Gamma EIRELI']

# Gerar dados estruturados
dados_estruturados = []

for empresa in empresas:
    for mes_num, mes_nome in enumerate(meses, start=1):
        for categoria_tipo, subcategorias in categorias.items():
            for subcategoria in subcategorias:
                # Gerar valores fictícios com variação realista
                # Valores base por categoria
                valores_base = {
                    'INSUMOS': np.random.uniform(5000, 50000),
                    'FOLHA DE PAGAMENTO': np.random.uniform(3000, 80000),
                    'ENCARGOS': np.random.uniform(1000, 15000),
                    'COMERCIAL': np.random.uniform(2000, 40000),
                    'INFRAESTRUTURA': np.random.uniform(1000, 20000),
                    'ADMINISTRATIVO': np.random.uniform(500, 10000),
                    'LOGÍSTICA': np.random.uniform(1000, 25000),
                    'IMPOSTOS': np.random.uniform(5000, 60000)
                }
                
                valor_emissao = valores_base[categoria_tipo] * np.random.uniform(0.7, 1.3)
                valor_quitacao = valor_emissao * np.random.uniform(0.85, 1.0)
                
                # Adicionar variação sazonal
                if mes_num in [11, 12]:  # Novembro e Dezembro geralmente têm mais despesas
                    valor_emissao *= 1.2
                    valor_quitacao *= 1.2
                
                dados_estruturados.append({
                    'Ano': 2024,
                    'Mes': mes_nome,
                    'Mes_Num': mes_num,
                    'Empresa': empresa,
                    'Categoria': categoria_tipo,
                    'Subcategoria': subcategoria,
                    'Valor_Emissao': round(valor_emissao, 2),
                    'Valor_Quitacao': round(valor_quitacao, 2),
                    'Status': np.random.choice(['Pago', 'Pendente', 'Atrasado'], p=[0.7, 0.2, 0.1]),
                    'Data_Emissao': f'2024-{mes_num:02d}-{np.random.randint(1, 28):02d}',
                    'Data_Vencimento': f'2024-{mes_num:02d}-{np.random.randint(1, 28):02d}',
                    'Centro_Custo': np.random.choice(['Produção', 'Administrativo', 'Comercial', 'Logística']),
                    'Observacoes': ''
                })

# Criar DataFrame
df_modelo = pd.DataFrame(dados_estruturados)

# Calcular campos adicionais
df_modelo['Diferenca'] = df_modelo['Valor_Emissao'] - df_modelo['Valor_Quitacao']
df_modelo['Perc_Quitacao'] = round((df_modelo['Valor_Quitacao'] / df_modelo['Valor_Emissao']) * 100, 2)

# Criar também uma aba de Faturamento para cruzamento
faturamento_dados = []

for empresa in empresas:
    for mes_num, mes_nome in enumerate(meses, start=1):
        faturamento_bruto = np.random.uniform(500000, 2000000)
        
        # Variação sazonal
        if mes_num in [11, 12]:
            faturamento_bruto *= 1.3
        elif mes_num in [1, 2]:
            faturamento_bruto *= 0.9
            
        faturamento_dados.append({
            'Ano': 2024,
            'Mes': mes_nome,
            'Mes_Num': mes_num,
            'Empresa': empresa,
            'Faturamento_Bruto': round(faturamento_bruto, 2),
            'Deducoes': round(faturamento_bruto * 0.15, 2),
            'Faturamento_Liquido': round(faturamento_bruto * 0.85, 2)
        })

df_faturamento = pd.DataFrame(faturamento_dados)

# Criar Excel com múltiplas abas
with pd.ExcelWriter('despesas_modelo_estruturado.xlsx', engine='openpyxl') as writer:
    # Aba 1: Despesas Detalhadas
    df_modelo.to_excel(writer, sheet_name='Despesas_Detalhadas', index=False)
    
    # Aba 2: Faturamento
    df_faturamento.to_excel(writer, sheet_name='Faturamento', index=False)
    
    # Aba 3: Resumo por Categoria
    resumo_categoria = df_modelo.groupby(['Empresa', 'Mes', 'Categoria']).agg({
        'Valor_Emissao': 'sum',
        'Valor_Quitacao': 'sum'
    }).reset_index()
    resumo_categoria.to_excel(writer, sheet_name='Resumo_Categoria', index=False)
    
    # Aba 4: Resumo Mensal
    resumo_mensal = df_modelo.groupby(['Empresa', 'Mes', 'Mes_Num']).agg({
        'Valor_Emissao': 'sum',
        'Valor_Quitacao': 'sum'
    }).reset_index()
    resumo_mensal = resumo_mensal.sort_values(['Empresa', 'Mes_Num'])
    resumo_mensal.to_excel(writer, sheet_name='Resumo_Mensal', index=False)
    
    # Aba 5: Documentação
    documentacao = pd.DataFrame({
        'Campo': [
            'Ano', 'Mes', 'Mes_Num', 'Empresa', 'Categoria', 'Subcategoria',
            'Valor_Emissao', 'Valor_Quitacao', 'Status', 'Data_Emissao',
            'Data_Vencimento', 'Centro_Custo', 'Diferenca', 'Perc_Quitacao'
        ],
        'Descrição': [
            'Ano de referência',
            'Nome do mês',
            'Número do mês (1-12)',
            'Nome da empresa',
            'Categoria principal da despesa',
            'Subcategoria detalhada',
            'Valor emitido da despesa',
            'Valor efetivamente pago',
            'Status do pagamento (Pago/Pendente/Atrasado)',
            'Data de emissão da despesa',
            'Data de vencimento',
            'Centro de custo responsável',
            'Diferença entre emissão e quitação',
            'Percentual quitado'
        ],
        'Tipo': [
            'number', 'text', 'number', 'text', 'text', 'text',
            'currency', 'currency', 'text', 'date',
            'date', 'text', 'currency', 'percentage'
        ]
    })
    documentacao.to_excel(writer, sheet_name='Documentacao', index=False)

print("✅ Excel criado com sucesso: despesas_modelo_estruturado.xlsx")
print(f"📊 Total de registros de despesas: {len(df_modelo)}")
print(f"📊 Total de registros de faturamento: {len(df_faturamento)}")
print(f"🏢 Empresas: {empresas}")
print(f"📅 Período: {meses[0]} a {meses[-1]} de 2024")
print(f"\n📑 Abas criadas:")
print("  1. Despesas_Detalhadas - Todos os detalhes das despesas")
print("  2. Faturamento - Dados de faturamento para cruzamento")
print("  3. Resumo_Categoria - Agregação por categoria")
print("  4. Resumo_Mensal - Agregação mensal")
print("  5. Documentacao - Explicação dos campos")

# Exibir resumo estatístico
print(f"\n💰 Resumo Financeiro:")
print(f"  Total Despesas Emitidas: R$ {df_modelo['Valor_Emissao'].sum():,.2f}")
print(f"  Total Despesas Quitadas: R$ {df_modelo['Valor_Quitacao'].sum():,.2f}")
print(f"  Total Faturamento Bruto: R$ {df_faturamento['Faturamento_Bruto'].sum():,.2f}")

# Criar também uma versão simplificada para upload direto
df_simples = df_modelo[['Ano', 'Mes', 'Empresa', 'Categoria', 'Subcategoria', 'Valor_Quitacao']].copy()
df_simples.rename(columns={'Valor_Quitacao': 'Valor'}, inplace=True)
df_simples['Valor'] = -df_simples['Valor']  # Negativo para despesas

# Adicionar faturamento
df_fat_simples = df_faturamento[['Ano', 'Mes', 'Empresa', 'Faturamento_Bruto']].copy()
df_fat_simples['Categoria'] = 'Faturamento Bruto'
df_fat_simples['Subcategoria'] = 'Receita'
df_fat_simples.rename(columns={'Faturamento_Bruto': 'Valor'}, inplace=True)

# Combinar
df_upload = pd.concat([df_simples, df_fat_simples], ignore_index=True)

with pd.ExcelWriter('despesas_upload_dashboard.xlsx', engine='openpyxl') as writer:
    df_upload.to_excel(writer, sheet_name='Dados', index=False)

print(f"\n✅ Excel para upload criado: despesas_upload_dashboard.xlsx")
print(f"   Este arquivo está pronto para ser usado no dashboard atual!")
