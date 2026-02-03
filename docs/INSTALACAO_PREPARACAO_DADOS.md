# 📦 Instalação - Sistema de Preparação de Dados

## Dependências Necessárias

Para que o sistema de preparação de dados funcione completamente, você precisa instalar as seguintes dependências:

### 1. Processamento de Arquivos Excel

```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

**O que faz**: Biblioteca para ler e escrever arquivos Excel (.xlsx, .xls)

### 2. Download de Arquivos (File Saver)

```bash
npm install file-saver
npm install --save-dev @types/file-saver
```

**O que faz**: Permite fazer download de arquivos gerados no navegador

### 3. Ícones (Lucide React) - Já instalado

```bash
# Se não estiver instalado:
npm install lucide-react
```

**O que faz**: Biblioteca de ícones moderna para React

## 🚀 Instalação Rápida

Execute todos os comandos de uma vez:

```bash
npm install xlsx file-saver lucide-react @google/generative-ai
npm install --save-dev @types/xlsx @types/file-saver
```

### ✨ Nova Dependência: Gemini AI

```bash
npm install @google/generative-ai
```

**O que faz**: SDK oficial do Google para usar Gemini AI na validação de dados

**Configuração**: Ver [GEMINI_SETUP.md](./GEMINI_SETUP.md)

## 📋 Verificação de Instalação

Após instalar, verifique no `package.json`:

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5",
    "lucide-react": "^0.x.x"
  },
  "devDependencies": {
    "@types/xlsx": "^0.0.36",
    "@types/file-saver": "^2.0.5"
  }
}
```

## 🔧 Configuração TypeScript

Certifique-se de que o `tsconfig.json` está configurado corretamente:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'xlsx'"

**Solução**:
```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

### Erro: "Cannot find module 'file-saver'"

**Solução**:
```bash
npm install file-saver
npm install --save-dev @types/file-saver
```

### Erro de tipos TypeScript

**Solução**:
```bash
npm install --save-dev @types/node
```

### Arquivos não fazem download

**Causa**: Pode ser bloqueio do navegador ou problema com file-saver

**Solução**:
1. Verificar console do navegador
2. Permitir downloads no navegador
3. Testar em modo anônimo

## 🧪 Testar Instalação

Crie um arquivo de teste `test-excel.ts`:

```typescript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Testar criação de Excel
const data = [
  { Nome: 'Teste', Valor: 100 }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Teste');

const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
const blob = new Blob([buffer], { 
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
});

saveAs(blob, 'teste.xlsx');
console.log('✅ Excel gerado com sucesso!');
```

Execute:
```bash
npx ts-node test-excel.ts
```

Se funcionar, as dependências estão corretas!

## 📱 Compatibilidade de Navegadores

O sistema funciona em:
- ✅ Chrome/Edge (últimas versões)
- ✅ Firefox (últimas versões)
- ✅ Safari (últimas versões)
- ⚠️ IE11 (não suportado)

## 🔄 Atualização de Dependências

Para atualizar para as versões mais recentes:

```bash
npm update xlsx file-saver lucide-react
```

## 📚 Documentação das Bibliotecas

- **xlsx**: https://docs.sheetjs.com/
- **file-saver**: https://github.com/eligrey/FileSaver.js
- **lucide-react**: https://lucide.dev/

## ✅ Checklist de Instalação

Marque conforme for instalando:

- [ ] Instalar xlsx
- [ ] Instalar file-saver
- [ ] Instalar lucide-react
- [ ] Instalar tipos TypeScript
- [ ] Verificar package.json
- [ ] Testar download de arquivo
- [ ] Testar validação
- [ ] Verificar erros no console

## 🆘 Suporte

Se encontrar problemas:

1. Limpar cache do npm:
```bash
npm cache clean --force
```

2. Reinstalar node_modules:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Verificar versão do Node:
```bash
node --version  # Recomendado: v18+
npm --version   # Recomendado: v9+
```

---

**Última atualização**: 03/02/2026
