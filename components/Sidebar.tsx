
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useDespesas } from '../context/DespesasContext';
import { useDRE } from '../context/DREContext';
import { useCashFlow } from '../context/CashFlowContext/CashFlowContext';
import { useIndicadores } from '../context/IndicadoresContext/IndicadoresContext';
import { useOrcamento } from '../context/OrcamentoContext/OrcamentoContext';
import { useBalancete } from '../context/BalanceteContext';
import { useTheme } from '../context/ThemeContext';
import * as XLSX from 'xlsx';

interface SidebarProps {
  onExport?: () => void;
  visible?: boolean;
  currentPage?: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';
  onNavigate?: (page: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onExport, visible = true, currentPage = 'dashboard', onNavigate }) => {
  const { empresas, mesesDisponiveis, filtros, setFiltroEmpresa, setFiltroMeses, carregarDados } = useFinance();
  const {
    empresasDespesas,
    mesesDisponiveisDespesas,
    filtrosDespesas,
    setFiltroDespesasEmpresa,
    setFiltroDespesasMeses,
    carregarDadosDespesas
  } = useDespesas();
  const { carregarDREMensal } = useDRE();
  const { setDados: setCashFlowDados } = useCashFlow();
  const { setDados: setIndicadoresDados } = useIndicadores();
  const { setDados: setOrcamentoDados } = useOrcamento();
  const { setDados: setBalanceteDados } = useBalancete();
  const { theme, toggleTheme } = useTheme();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      carregarDados(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUploadDespesas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      carregarDadosDespesas(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleDREUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      carregarDREMensal(file);
    }
  };

  const handleCashFlowUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Converter dados para o formato correto
      const convertedData = data.map((row: any) => ({
        id: String(row.id || row.ID || ''),
        mes: Number(row.mes || row.Mes || row.mes || 0),
        empresa: String(row.empresa || row.Empresa || ''),
        tipo: String(row.tipo || row.Tipo || ''),
        categoria: String(row.categoria || row.Categoria || ''),
        data_vencimento: String(row.data_vencimento || row.data_Vencimento || row.dataVencimento || ''),
        valor: Number(row.valor || row.Valor || 0),
        status: String(row.status || row.Status || 'Aberto'),
        responsavel: String(row.responsavel || row.Responsavel || ''),
        descricao: String(row.descricao || row.Descricao || '')
      }));

      setCashFlowDados(convertedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleIndicadoresUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Converter dados para o formato correto
      const convertedData = data.map((row: any) => ({
        mes: Number(row['Mês'] || row.mes || row.Mes || 0),
        empresa: String(row['Empresa'] || row.empresa || row.Empresa || ''),
        roe: Number(row['ROE %'] || row.roe || row.ROE || row.Roe || 0),
        roa: Number(row['ROA %'] || row.roa || row.ROA || row.Roa || 0),
        margemLiquida: Number(row['Margem Líquida %'] || row.margemLiquida || row.margemLíquida || row.Margem_Liquida || 0),
        margemOperacional: Number(row['Margem Operacional %'] || row.margemOperacional || row.Margem_Operacional || 0),
        liquidezCorrente: Number(row['Liquidez Corrente'] || row.liquidezCorrente || row.Liquidez_Corrente || 0),
        liquidezSeca: Number(row['Liquidez Seca'] || row.liquidezSeca || row.Liquidez_Seca || 0),
        endividamento: Number(row['Endividamento %'] || row.endividamento || row.Endividamento || 0),
        alavancagem: Number(row['Alavancagem'] || row.alavancagem || row.Alavancagem || 0),
        giroAtivo: Number(row['Giro Ativo'] || row.giroAtivo || row.Giro_Ativo || 0),
        prazoRecebimento: Number(row['Prazo Recebimento'] || row.prazoRecebimento || row.Prazo_Recebimento || 0),
        prazoPagamento: Number(row['Prazo Pagamento'] || row.prazoPagamento || row.Prazo_Pagamento || 0)
      }));

      setIndicadoresDados(convertedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleOrcamentoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Converter dados para o formato correto
      const convertedData = data.map((row: any) => ({
        mes: Number(row['Mês'] || row.mes || row.Mes || 0),
        empresa: String(row['Empresa'] || row.empresa || row.Empresa || ''),
        categoria: String(row['Categoria'] || row.categoria || row.Categoria || ''),
        orcado: Number(row['Orçado'] || row.orcado || row.Orcado || 0),
        realizado: Number(row['Realizado'] || row.realizado || row.Realizado || 0),
        responsavel: String(row['Responsável'] || row.responsavel || row.Responsavel || ''),
        observacoes: String(row['Observações'] || row.observacoes || row.Observacoes || '')
      }));

      setOrcamentoDados(convertedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleBalanceteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Converter dados para o formato correto
        const convertedData = data.map((row: any) => {
          // Debug: mostrar primeira linha
          if (data.indexOf(row) === 0) {
            console.log('Primeira linha do Excel:', row);
          }

          return {
            data: String(row['Data'] || row.data || row.Data || '2024-12-31'),
            contaContabil: String(row['Conta Contábil'] || row['Conta_Contábil'] || row['conta_contabil'] || row.contaContabil || ''),
            nomeContaContabil: String(row['Nome Conta'] || row['Nome_Conta'] || row['nome_conta'] || row.nomeContaContabil || ''),
            grupo: String(row['Grupo'] || row.grupo || row.Grupo || '') as 'Ativo' | 'Passivo' | 'PL',
            subgrupo: String(row['Subgrupo'] || row.subgrupo || row.Subgrupo || '') as any,
            tipoContaContabil: String(row['Tipo Conta'] || row['Tipo_Conta'] || row['tipo_conta'] || row.tipoContaContabil || ''),
            totalDebitos: Number(row['Total Débitos'] || row['Total_Débitos'] || row['total_debitos'] || row.totalDebitos || 0),
            totalCreditos: Number(row['Total Créditos'] || row['Total_Créditos'] || row['total_creditos'] || row.totalCreditos || 0),
            saldo: Number(row['Saldo'] || row.saldo || row.Saldo || 0),
            status: String(row['Status'] || row.status || row.Status || 'Normal') as 'Normal' | 'Ajuste',
            fonte: String(row['Fonte'] || row.fonte || row.Fonte || 'Balancete Manual'),
            empresa: String(row['Empresa'] || row.empresa || row.Empresa || 'Alpha')
          };
        });

        console.log('Dados convertidos:', convertedData.length, 'registros');
        setBalanceteDados(convertedData);
      } catch (error) {
        console.error('Erro ao processar arquivo Balancete:', error);
        alert('Erro ao processar arquivo. Verifique o formato do Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleMonth = (month: string) => {
    if (currentPage === 'dashboard') {
      const current = filtros.meses;
      if (current.includes(month)) {
        setFiltroMeses(current.filter(m => m !== month));
      } else {
        setFiltroMeses([...current, month]);
      }
    } else if (currentPage === 'despesas') {
      const current = filtrosDespesas.meses;
      if (current.includes(month)) {
        setFiltroDespesasMeses(current.filter(m => m !== month));
      } else {
        setFiltroDespesasMeses([...current, month]);
      }
    }
  };

  return (
    <aside className={`w-80 flex-shrink-0 flex flex-col border-r border-border-dark bg-background-dark h-screen overflow-hidden transition-all duration-300 ${visible ? 'ml-0' : '-ml-80'}`}>
      <div className="p-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-[#054d22] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">bar_chart</span>
          </div>
          <div>
            <p className="text-white text-lg font-bold leading-tight">FinanceFlow</p>
            <p className="text-text-muted text-xs">V3 WebApp</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-8">
        <nav className="flex flex-col gap-2">
          <p className="px-2 text-xs font-bold text-text-muted uppercase">Navegação Principal</p>
          <button
            onClick={() => onNavigate?.('dashboard')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'dashboard'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'dashboard' ? 'text-primary' : ''}`}>
              dashboard
            </span>
            <p className="text-sm font-medium">Dashboard Financeiro</p>
          </button>
          <button
            onClick={() => onNavigate?.('despesas')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'despesas'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'despesas' ? 'text-primary' : ''}`}>
              account_balance_wallet
            </span>
            <p className="text-sm font-medium">Análise de Despesas</p>
          </button>
          <button
            onClick={() => onNavigate?.('dre')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'dre'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'dre' ? 'text-primary' : ''}`}>
              table_chart
            </span>
            <p className="text-sm font-medium">Tabelas DRE</p>
          </button>
          <button
            onClick={() => onNavigate?.('indicadores')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'indicadores'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'indicadores' ? 'text-primary' : ''}`}>
              analytics
            </span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Indicadores</p>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">BETA</span>
            </div>
          </button>
          <button
            onClick={() => onNavigate?.('orcamento')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'orcamento'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'orcamento' ? 'text-primary' : ''}`}>
              receipt_long
            </span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Orçamento</p>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">BETA</span>
            </div>
          </button>
          <button
            onClick={() => onNavigate?.('balancete')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'balancete'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'balancete' ? 'text-primary' : ''}`}>
              account_balance
            </span>
            <p className="text-sm font-medium">Balancete</p>
          </button>
        </nav>

        {/* Upload sections - positioned above Aparência */}
        {currentPage === 'dashboard' && (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-white mb-2 transition-colors">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel Financeiro</p>
          </div>
        )}

        {currentPage === 'despesas' && (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleFileUploadDespesas} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-white mb-2 transition-colors">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel de Despesas</p>
          </div>
        )}

        {currentPage === 'dre' && (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleDREUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-white mb-2 transition-colors">table_chart</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors leading-tight">Carregar Excel DRE<br />(4 abas completas)</p>
          </div>
        )}

        {currentPage === 'indicadores' && (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleIndicadoresUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-white mb-2 transition-colors">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel Indicadores</p>
          </div>
        )}

        {currentPage === 'orcamento' && (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleOrcamentoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-white mb-2 transition-colors">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel Orçamento</p>
          </div>
        )}

        {currentPage === 'balancete' && (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleBalanceteUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-white mb-2 transition-colors">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel Balancete</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="px-2 text-xs font-bold text-text-muted uppercase">Aparência</p>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between rounded-xl bg-surface-dark border border-border-dark p-3 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
              <p className="text-white text-sm font-medium">{theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}</p>
            </div>
            <span className="material-symbols-outlined text-text-muted text-lg group-hover:text-primary transition-colors">toggle_{theme === 'dark' ? 'off' : 'on'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <p className="px-2 text-xs font-bold text-text-muted uppercase">Filtros Globais</p>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-muted px-2">Empresa</label>
            <select
              value={currentPage === 'dashboard' ? filtros.empresa : filtrosDespesas.empresa}
              onChange={(e) => {
                if (currentPage === 'dashboard') {
                  setFiltroEmpresa(e.target.value);
                } else {
                  setFiltroDespesasEmpresa(e.target.value);
                }
              }}
              className="w-full rounded-xl bg-surface-dark border border-border-dark text-white p-3 text-sm focus:ring-primary"
            >
              {(currentPage === 'dashboard' ? empresas : empresasDespesas).map(emp => <option key={emp} value={emp}>{emp}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-muted px-2">Período</label>
            <div className="flex flex-wrap gap-2">
              {(currentPage === 'dashboard' ? mesesDisponiveis : mesesDisponiveisDespesas).map(month => (
                <button
                  key={month}
                  onClick={() => toggleMonth(month)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${(currentPage === 'dashboard' ? filtros.meses : filtrosDespesas.meses).includes(month)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-dark text-text-muted border-border-dark'
                    }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border-dark">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#0ca348] text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
        >
          <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">picture_as_pdf</span>
          <span>Exportar Relatório</span>
        </button>
      </div>
    </aside >
  );
};

export default Sidebar;
