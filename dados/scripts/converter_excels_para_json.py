import pandas as pd
import json
from pathlib import Path

# Diretório base
BASE_DIR = Path(__file__).parent.parent / 'excel_exemplos'
OUTPUT_DIR = Path(__file__).parent.parent / 'excel_exemplos'

def converter_dashboard_financeiro():
    """Converte Dashboard_Financeiro_Exemplo.xlsx para JSON"""
    arquivo = BASE_DIR / 'Dashboard_Financeiro_Exemplo.xlsx'
    if not arquivo.exists():
        print(f"Arquivo não encontrado: {arquivo}")
        return
    
    df = pd.read_excel(arquivo)
    
    # Converter para lista de dicionários
    dados = []
    for _, row in df.iterrows():
        dados.append({
            'mes': int(row.get('Mês', row.get('mes', 0))),
            'empresa': str(row.get('Empresa', row.get('empresa', ''))),
            'receita': float(row.get('Receita', row.get('receita', 0))),
            'custo': float(row.get('Custo', row.get('custo', 0))),
            'despesa': float(row.get('Despesa', row.get('despesa', 0))),
            'lucro': float(row.get('Lucro', row.get('lucro', 0)))
        })
    
    # Salvar JSON
    output_file = OUTPUT_DIR / 'dados_dashboard_financeiro_exemplo.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Dashboard Financeiro convertido: {len(dados)} registros")
    print(f"   Salvo em: {output_file}")

def converter_analise_despesas():
    """Converte analise_despesas_exemplo.xlsx para JSON"""
    arquivo = BASE_DIR / 'analise_despesas_exemplo.xlsx'
    if not arquivo.exists():
        print(f"Arquivo não encontrado: {arquivo}")
        return
    
    df = pd.read_excel(arquivo)
    
    # Converter para lista de dicionários
    dados = []
    for idx, row in df.iterrows():
        dados.append({
            'id': f'desp_{idx + 1}',
            'mes': int(row.get('Mês', row.get('mes', 0))),
            'empresa': str(row.get('Empresa', row.get('empresa', ''))),
            'categoria': str(row.get('Categoria', row.get('categoria', ''))),
            'subcategoria': str(row.get('Subcategoria', row.get('subcategoria', ''))),
            'descricao': str(row.get('Descrição', row.get('descricao', row.get('Descricao', '')))),
            'valor': float(row.get('Valor', row.get('valor', 0))),
            'tipo': str(row.get('Tipo', row.get('tipo', 'Despesa'))),
            'status': str(row.get('Status', row.get('status', 'Pago'))),
            'data': str(row.get('Data', row.get('data', ''))),
            'fornecedor': str(row.get('Fornecedor', row.get('fornecedor', '')))
        })
    
    # Salvar JSON
    output_file = OUTPUT_DIR / 'dados_despesas_exemplo.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Análise de Despesas convertida: {len(dados)} registros")
    print(f"   Salvo em: {output_file}")

def converter_balancete():
    """Converte Balancete_exemplo.xlsx para JSON"""
    arquivo = BASE_DIR / 'Balancete_exemplo.xlsx'
    if not arquivo.exists():
        print(f"Arquivo não encontrado: {arquivo}")
        return
    
    # Tentar ler todas as abas
    try:
        xls = pd.ExcelFile(arquivo)
        print(f"   Abas encontradas: {xls.sheet_names}")
        
        # Ler primeira aba ou aba específica
        df = pd.read_excel(arquivo, sheet_name=0)
        
        # Converter para lista de dicionários
        dados = []
        for idx, row in df.iterrows():
            dados.append({
                'id': f'bal_{idx + 1}',
                'mes': int(row.get('Mês', row.get('mes', row.get('Mes', 0)))),
                'empresa': str(row.get('Empresa', row.get('empresa', ''))),
                'conta': str(row.get('Conta', row.get('conta', ''))),
                'categoria': str(row.get('Categoria', row.get('categoria', ''))),
                'subcategoria': str(row.get('Subcategoria', row.get('subcategoria', ''))),
                'valor': float(row.get('Valor', row.get('valor', row.get('Saldo', 0)))),
                'tipo': str(row.get('Tipo', row.get('tipo', 'Ativo'))),
                'nivel': int(row.get('Nível', row.get('nivel', row.get('Nivel', 1))))
            })
        
        # Salvar JSON
        output_file = OUTPUT_DIR / 'dados_balancete_exemplo.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Balancete convertido: {len(dados)} registros")
        print(f"   Salvo em: {output_file}")
        
    except Exception as e:
        print(f"❌ Erro ao converter Balancete: {e}")

def main():
    print("=" * 60)
    print("CONVERTENDO ARQUIVOS EXCEL PARA JSON")
    print("=" * 60)
    print()
    
    converter_dashboard_financeiro()
    print()
    converter_analise_despesas()
    print()
    converter_balancete()
    
    print()
    print("=" * 60)
    print("CONVERSÃO CONCLUÍDA!")
    print("=" * 60)

if __name__ == '__main__':
    main()
