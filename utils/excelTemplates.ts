/**
 * Excel Template Generator
 * 
 * This script generates example Excel files that users can download
 * as templates for their data preparation.
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExcelRow {
    [key: string]: string | number | Date;
}

/**
 * Template: Visão Geral (Overview)
 */
export function generateVisaoGeralTemplate(): void {
    const data: ExcelRow[] = [
        { Data: '01/01/2025', Valor: 15000.00, Categoria: 'Vendas', Região: 'Sul' },
        { Data: '05/01/2025', Valor: 8500.50, Categoria: 'Serviços', Região: 'Norte' },
        { Data: '10/01/2025', Valor: 12300.75, Categoria: 'Vendas', Região: 'Centro' },
        { Data: '15/01/2025', Valor: 6700.00, Categoria: 'Consultoria', Região: 'Sul' },
        { Data: '20/01/2025', Valor: 18900.25, Categoria: 'Vendas', Região: 'Norte' },
        { Data: '25/01/2025', Valor: 9200.00, Categoria: 'Serviços', Região: 'Centro' },
        { Data: '01/02/2025', Valor: 16500.00, Categoria: 'Vendas', Região: 'Sul' },
        { Data: '05/02/2025', Valor: 7800.00, Categoria: 'Consultoria', Região: 'Norte' },
        { Data: '10/02/2025', Valor: 14200.50, Categoria: 'Vendas', Região: 'Centro' },
        { Data: '15/02/2025', Valor: 11000.00, Categoria: 'Serviços', Região: 'Sul' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visão Geral');

    // Add comments/instructions
    addCommentToCell(worksheet, 'A1', 'Data da transação (formato DD/MM/YYYY)');
    addCommentToCell(worksheet, 'B1', 'Valor em Reais (apenas números)');
    addCommentToCell(worksheet, 'C1', 'Categoria da receita/despesa (opcional)');
    addCommentToCell(worksheet, 'D1', 'Região geográfica (opcional)');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'modelo_visao_geral.xlsx');
}

/**
 * Template: Por Categoria
 */
export function generatePorCategoriaTemplate(): void {
    const data: ExcelRow[] = [
        { Categoria: 'Vendas de Produtos', Valor: 45000.00, Data: '01/2025', Subcategoria: 'Eletrônicos' },
        { Categoria: 'Serviços', Valor: 28500.00, Data: '01/2025', Subcategoria: 'Consultoria' },
        { Categoria: 'Despesas Operacionais', Valor: -12000.00, Data: '01/2025', Subcategoria: 'Aluguel' },
        { Categoria: 'Marketing', Valor: -8500.00, Data: '01/2025', Subcategoria: 'Publicidade Digital' },
        { Categoria: 'Vendas de Produtos', Valor: 52000.00, Data: '02/2025', Subcategoria: 'Eletrônicos' },
        { Categoria: 'Serviços', Valor: 31000.00, Data: '02/2025', Subcategoria: 'Consultoria' },
        { Categoria: 'Despesas Operacionais', Valor: -12000.00, Data: '02/2025', Subcategoria: 'Aluguel' },
        { Categoria: 'Marketing', Valor: -9200.00, Data: '02/2025', Subcategoria: 'Publicidade Digital' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Por Categoria');

    addCommentToCell(worksheet, 'A1', 'Nome da categoria (texto)');
    addCommentToCell(worksheet, 'B1', 'Valor em Reais (negativo para despesas)');
    addCommentToCell(worksheet, 'C1', 'Período (opcional, formato MM/YYYY)');
    addCommentToCell(worksheet, 'D1', 'Subcategoria para análise detalhada (opcional)');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'modelo_por_categoria.xlsx');
}

/**
 * Template: DRE (Demonstrativo de Resultados)
 */
export function generateDRETemplate(): void {
    const data: ExcelRow[] = [
        { Data: '01/2025', Conta: 'Receita Bruta de Vendas', Valor: 85000.00, 'Centro de Custo': 'Vendas', Natureza: 'Receita' },
        { Data: '01/2025', Conta: '(-) Impostos sobre Vendas', Valor: -15300.00, 'Centro de Custo': 'Vendas', Natureza: 'Dedução' },
        { Data: '01/2025', Conta: 'Receita Líquida', Valor: 69700.00, 'Centro de Custo': 'Vendas', Natureza: 'Receita' },
        { Data: '01/2025', Conta: '(-) Custo dos Produtos Vendidos', Valor: -28000.00, 'Centro de Custo': 'Produção', Natureza: 'Custo' },
        { Data: '01/2025', Conta: 'Lucro Bruto', Valor: 41700.00, 'Centro de Custo': '', Natureza: 'Resultado' },
        { Data: '01/2025', Conta: '(-) Despesas com Vendas', Valor: -8500.00, 'Centro de Custo': 'Comercial', Natureza: 'Despesa' },
        { Data: '01/2025', Conta: '(-) Despesas Administrativas', Valor: -12000.00, 'Centro de Custo': 'Administrativo', Natureza: 'Despesa' },
        { Data: '01/2025', Conta: 'Lucro Operacional', Valor: 21200.00, 'Centro de Custo': '', Natureza: 'Resultado' },
        { Data: '02/2025', Conta: 'Receita Bruta de Vendas', Valor: 92000.00, 'Centro de Custo': 'Vendas', Natureza: 'Receita' },
        { Data: '02/2025', Conta: '(-) Impostos sobre Vendas', Valor: -16560.00, 'Centro de Custo': 'Vendas', Natureza: 'Dedução' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DRE');

    addCommentToCell(worksheet, 'A1', 'Período (formato MM/YYYY)');
    addCommentToCell(worksheet, 'B1', 'Nome da conta contábil');
    addCommentToCell(worksheet, 'C1', 'Valor em Reais (negativo para custos/despesas)');
    addCommentToCell(worksheet, 'D1', 'Centro de custo (opcional)');
    addCommentToCell(worksheet, 'E1', 'Natureza da conta (opcional)');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'modelo_dre.xlsx');
}

/**
 * Template: Fluxo de Caixa
 */
export function generateFluxoCaixaTemplate(): void {
    const data: ExcelRow[] = [
        { Data: '01/01/2025', Tipo: 'Entrada', Valor: 15000.00, Descrição: 'Recebimento de vendas', 'Forma Pagamento': 'Transferência' },
        { Data: '03/01/2025', Tipo: 'Saída', Valor: -5000.00, Descrição: 'Pagamento fornecedores', 'Forma Pagamento': 'Boleto' },
        { Data: '05/01/2025', Tipo: 'Entrada', Valor: 8500.00, Descrição: 'Prestação de serviços', 'Forma Pagamento': 'PIX' },
        { Data: '10/01/2025', Tipo: 'Saída', Valor: -3200.00, Descrição: 'Aluguel', 'Forma Pagamento': 'Transferência' },
        { Data: '12/01/2025', Tipo: 'Entrada', Valor: 12000.00, Descrição: 'Recebimento cliente', 'Forma Pagamento': 'Cartão' },
        { Data: '15/01/2025', Tipo: 'Saída', Valor: -2500.00, Descrição: 'Salários', 'Forma Pagamento': 'Transferência' },
        { Data: '18/01/2025', Tipo: 'Entrada', Valor: 6700.00, Descrição: 'Vendas à vista', 'Forma Pagamento': 'Dinheiro' },
        { Data: '20/01/2025', Tipo: 'Saída', Valor: -1800.00, Descrição: 'Contas de luz e água', 'Forma Pagamento': 'Débito automático' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fluxo de Caixa');

    addCommentToCell(worksheet, 'A1', 'Data da movimentação (DD/MM/YYYY)');
    addCommentToCell(worksheet, 'B1', 'Tipo: Entrada ou Saída');
    addCommentToCell(worksheet, 'C1', 'Valor em Reais');
    addCommentToCell(worksheet, 'D1', 'Descrição da movimentação (opcional)');
    addCommentToCell(worksheet, 'E1', 'Forma de pagamento (opcional)');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'modelo_fluxo_caixa.xlsx');
}

/**
 * Template: Balancete
 */
export function generateBalanceteTemplate(): void {
    const data: ExcelRow[] = [
        { Código: '1.1.01', Conta: 'Caixa', 'Saldo Devedor': 15000.00, 'Saldo Credor': 0, Grupo: 'Ativo Circulante' },
        { Código: '1.1.02', Conta: 'Bancos', 'Saldo Devedor': 85000.00, 'Saldo Credor': 0, Grupo: 'Ativo Circulante' },
        { Código: '1.1.03', Conta: 'Aplicações Financeiras', 'Saldo Devedor': 50000.00, 'Saldo Credor': 0, Grupo: 'Ativo Circulante' },
        { Código: '1.1.04', Conta: 'Contas a Receber', 'Saldo Devedor': 42000.00, 'Saldo Credor': 0, Grupo: 'Ativo Circulante' },
        { Código: '1.2.01', Conta: 'Imobilizado', 'Saldo Devedor': 120000.00, 'Saldo Credor': 0, Grupo: 'Ativo Não Circulante' },
        { Código: '2.1.01', Conta: 'Fornecedores', 'Saldo Devedor': 0, 'Saldo Credor': 28000.00, Grupo: 'Passivo Circulante' },
        { Código: '2.1.02', Conta: 'Salários a Pagar', 'Saldo Devedor': 0, 'Saldo Credor': 15000.00, Grupo: 'Passivo Circulante' },
        { Código: '2.2.01', Conta: 'Empréstimos Bancários', 'Saldo Devedor': 0, 'Saldo Credor': 80000.00, Grupo: 'Passivo Não Circulante' },
        { Código: '3.1.01', Conta: 'Capital Social', 'Saldo Devedor': 0, 'Saldo Credor': 150000.00, Grupo: 'Patrimônio Líquido' },
        { Código: '3.2.01', Conta: 'Lucros Acumulados', 'Saldo Devedor': 0, 'Saldo Credor': 39000.00, Grupo: 'Patrimônio Líquido' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Balancete');

    addCommentToCell(worksheet, 'A1', 'Código da conta (opcional)');
    addCommentToCell(worksheet, 'B1', 'Nome da conta contábil');
    addCommentToCell(worksheet, 'C1', 'Saldo devedor em Reais');
    addCommentToCell(worksheet, 'D1', 'Saldo credor em Reais');
    addCommentToCell(worksheet, 'E1', 'Grupo contábil (opcional)');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'modelo_balancete.xlsx');
}

/**
 * Template: Completo (todas as abas)
 */
export function generateCompletoTemplate(): void {
    const workbook = XLSX.utils.book_new();

    // Visão Geral
    const visaoGeralData: ExcelRow[] = [
        { Data: '01/01/2025', Valor: 15000.00, Categoria: 'Vendas', Região: 'Sul' },
        { Data: '05/01/2025', Valor: 8500.50, Categoria: 'Serviços', Região: 'Norte' },
        { Data: '10/01/2025', Valor: 12300.75, Categoria: 'Vendas', Região: 'Centro' },
    ];
    const wsVisaoGeral = XLSX.utils.json_to_sheet(visaoGeralData);
    XLSX.utils.book_append_sheet(workbook, wsVisaoGeral, 'Visão Geral');

    // Por Categoria
    const categoriaData: ExcelRow[] = [
        { Categoria: 'Vendas de Produtos', Valor: 45000.00 },
        { Categoria: 'Serviços', Valor: 28500.00 },
        { Categoria: 'Despesas Operacionais', Valor: -12000.00 },
    ];
    const wsCategoria = XLSX.utils.json_to_sheet(categoriaData);
    XLSX.utils.book_append_sheet(workbook, wsCategoria, 'Por Categoria');

    // DRE
    const dreData: ExcelRow[] = [
        { Data: '01/2025', Conta: 'Receita Bruta de Vendas', Valor: 85000.00 },
        { Data: '01/2025', Conta: '(-) Impostos sobre Vendas', Valor: -15300.00 },
        { Data: '01/2025', Conta: 'Receita Líquida', Valor: 69700.00 },
    ];
    const wsDRE = XLSX.utils.json_to_sheet(dreData);
    XLSX.utils.book_append_sheet(workbook, wsDRE, 'DRE');

    // Fluxo de Caixa
    const fluxoData: ExcelRow[] = [
        { Data: '01/01/2025', Tipo: 'Entrada', Valor: 15000.00, Descrição: 'Recebimento de vendas' },
        { Data: '03/01/2025', Tipo: 'Saída', Valor: -5000.00, Descrição: 'Pagamento fornecedores' },
    ];
    const wsFluxo = XLSX.utils.json_to_sheet(fluxoData);
    XLSX.utils.book_append_sheet(workbook, wsFluxo, 'Fluxo de Caixa');

    // Balancete
    const balanceteData: ExcelRow[] = [
        { Conta: 'Caixa', 'Saldo Devedor': 15000.00, 'Saldo Credor': 0 },
        { Conta: 'Bancos', 'Saldo Devedor': 85000.00, 'Saldo Credor': 0 },
    ];
    const wsBalancete = XLSX.utils.json_to_sheet(balanceteData);
    XLSX.utils.book_append_sheet(workbook, wsBalancete, 'Balancete');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'modelo_completo.xlsx');
}

/**
 * Helper function to add comments to cells (simulated via cell notes)
 */
function addCommentToCell(worksheet: XLSX.WorkSheet, cell: string, comment: string): void {
    if (!worksheet[cell]) return;

    if (!worksheet[cell].c) {
        worksheet[cell].c = [];
    }

    worksheet[cell].c.push({
        a: 'Sistema',
        t: comment
    });
}

/**
 * Export all template generators
 */
export const excelTemplates = {
    visaoGeral: generateVisaoGeralTemplate,
    porCategoria: generatePorCategoriaTemplate,
    dre: generateDRETemplate,
    fluxoCaixa: generateFluxoCaixaTemplate,
    balancete: generateBalanceteTemplate,
    completo: generateCompletoTemplate
};
