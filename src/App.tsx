import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { DeadlinesPage } from './pages/DeadlinesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFinance } from './hooks/useFinance';
import { getMonthlyData } from './utils/helpers';

function App() {
  const finance = useFinance();
  const monthlyData = getMonthlyData(finance.transactions);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                summary={finance.summary} 
                monthlyData={monthlyData} 
              />
            } 
          />
          <Route 
            path="/transactions" 
            element={<TransactionsPage finance={finance} />} 
          />
          <Route 
            path="/deadlines" 
            element={<DeadlinesPage finance={finance} />} 
          />
          <Route 
            path="/reports" 
            element={<ReportsPage finance={finance} />} 
          />
          <Route 
            path="/settings" 
            element={<SettingsPage finance={finance} />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 