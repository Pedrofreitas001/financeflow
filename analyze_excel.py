import pandas as pd
import json

# Ler o arquivo Excel
df = pd.read_excel('exemplo_aba_despesas.xlsx')

print("=" * 80)
print("ANÁLISE DO ARQUIVO: exemplo_aba_despesas.xlsx")
print("=" * 80)

print("\n📊 COLUNAS ENCONTRADAS:")
print(df.columns.tolist())

print("\n📈 PRIMEIRAS 15 LINHAS:")
print(df.head(15).to_string())

print("\n\n📋 INFORMAÇÕES GERAIS:")
print(df.info())

print("\n\n🔢 RESUMO ESTATÍSTICO (colunas numéricas):")
print(df.describe())

print("\n\n🎯 VALORES ÚNICOS POR COLUNA:")
for col in df.columns:
    unique_count = df[col].nunique()
    print(f"  • {col}: {unique_count} valores únicos")
    if unique_count <= 20:
        print(f"    Valores: {df[col].unique().tolist()}")

print("\n\n💾 SALVANDO AMOSTRA EM JSON...")
sample = df.head(20).to_dict(orient='records')
with open('exemplo_despesas_sample.json', 'w', encoding='utf-8') as f:
    json.dump(sample, f, indent=2, ensure_ascii=False, default=str)
print("✅ Amostra salva em: exemplo_despesas_sample.json")

print("\n" + "=" * 80)
