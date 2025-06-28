import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialChartProps {
  data: any[];
}

export const FinancialChart = ({ data }: FinancialChartProps) => {
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => 
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [formatTooltipValue(value), '']}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#22c55e" 
          strokeWidth={2}
          name="Receitas"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Despesas"
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Saldo"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}; 