# Finance App - Controle Financeiro

Um aplicativo completo de controle financeiro desenvolvido em React com TypeScript, oferecendo funcionalidades para gerenciar entradas, saídas e prazos de pagamento.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral das finanças com cards de resumo
- Gráfico de evolução mensal
- Alertas para prazos vencidos
- Resumo rápido de receitas e despesas

### 💰 Transações
- Adicionar, editar e excluir transações
- Categorização de receitas e despesas
- Filtros por tipo (receita/despesa)
- Formatação de valores em Real (BRL)

### ⏰ Prazos
- Controle de prazos de pagamento
- Status: Pendente, Pago, Vencido
- Alertas visuais para prazos vencidos
- Marcação rápida como pago

### 📈 Relatórios
- Gráficos de evolução mensal
- Distribuição por categorias (gráficos de pizza)
- Estatísticas detalhadas
- Análise de receitas vs despesas

### ⚙️ Configurações
- Gerenciamento de categorias
- Personalização de cores
- Categorias padrão pré-configuradas

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **React Router** - Navegação
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **localStorage** - Persistência de dados

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd finance-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse o aplicativo**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com navegação
│   ├── Dashboard.tsx   # Página do dashboard
│   ├── FinancialChart.tsx # Componente de gráficos
│   ├── TransactionForm.tsx # Formulário de transações
│   └── DeadlineForm.tsx   # Formulário de prazos
├── pages/              # Páginas do aplicativo
│   ├── TransactionsPage.tsx
│   ├── DeadlinesPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── hooks/              # Hooks customizados
│   └── useFinance.ts   # Hook principal do app
├── utils/              # Utilitários
│   ├── storage.ts      # Gerenciamento do localStorage
│   └── helpers.ts      # Funções auxiliares
├── types/              # Definições de tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 📱 Como Usar

### 1. Dashboard
- Visualize o resumo financeiro
- Acompanhe receitas, despesas e saldo
- Veja alertas de prazos vencidos

### 2. Transações
- Clique em "Nova Transação"
- Preencha descrição, valor, categoria e data
- Use os filtros para visualizar por tipo

### 3. Prazos
- Adicione prazos de pagamento
- Configure data de vencimento e valor
- Marque como pago quando necessário

### 4. Relatórios
- Analise gráficos de evolução
- Veja distribuição por categorias
- Acompanhe estatísticas gerais

### 5. Configurações
- Gerencie categorias personalizadas
- Escolha cores para cada categoria
- Organize receitas e despesas

## 🎨 Personalização

### Cores
O aplicativo usa um sistema de cores personalizado:
- **Primary**: Azul (#3b82f6)
- **Success**: Verde (#22c55e)
- **Danger**: Vermelho (#ef4444)
- **Warning**: Amarelo (#f59e0b)

### Categorias Padrão
O app vem com categorias pré-configuradas:

**Receitas:**
- Salário
- Freelance
- Investimentos
- Outros

**Despesas:**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Contas
- Outros

## 💾 Persistência de Dados

Todos os dados são salvos no `localStorage` do navegador:
- Transações
- Prazos
- Categorias personalizadas

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza o build de produção
npm run lint     # Executa o linter
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, por favor abra uma issue no repositório.

---

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal. 