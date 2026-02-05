// URLs dos modelos Excel para download por tipo de dashboard (mesmo do CTA).

export type DashboardType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';

export const DASHBOARD_TEMPLATE_URLS: Record<DashboardType, string> = {
    dashboard: 'https://docs.google.com/spreadsheets/d/1QSr5027uyoLnYE-u9zzSIvJA01kTv9ciC9Ae1O5HywQ/export?format=xlsx',
    despesas: 'https://docs.google.com/spreadsheets/d/10mrkv9tlvAXRoooNEu5NSMG5sai7gcOXFpIEh9VyR1M/export?format=xlsx',
    dre: 'https://docs.google.com/spreadsheets/d/1najlHXbyJLlXJSB12xPWHXi4rRS0kWDtMew301HjitQ/export?format=xlsx',
    cashflow: 'https://docs.google.com/spreadsheets/d/1AZEKUMdnSJXZPX6_nHbwrrcvfNl7bX7V95X3Yf9Kq9g/export?format=xlsx',
    indicadores: 'https://docs.google.com/spreadsheets/d/127Nqx8umUkgpoT1UxIoZlXpfr-KUYP6dJcz5uTfOSok/export?format=xlsx',
    orcamento: 'https://docs.google.com/spreadsheets/d/1pjEyn5Jy43kC3og11hjU1Co7peBn11EH8EwfuEHxk_M/export?format=xlsx',
    balancete: 'https://docs.google.com/spreadsheets/d/1WI-CCHrZF0jHoT6wbnj5jvOQ1wqr1zIU57X_5_v2dKI/export?format=xlsx',
};
