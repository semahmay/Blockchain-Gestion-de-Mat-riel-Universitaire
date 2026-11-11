import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppProvider'
import { WalletProvider } from './context/WalletProvider'
import { AppLayout } from './components/layout/AppLayout'
import { AdminLoansPage } from './pages/AdminLoansPage'
import { BlockchainPage } from './pages/BlockchainPage'
import { DashboardPage } from './pages/DashboardPage'
import { EquipmentPage } from './pages/EquipmentPage'
import { MyLoansPage } from './pages/MyLoansPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <WalletProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="my-loans" element={<MyLoansPage />} />
              <Route path="admin/loans" element={<AdminLoansPage />} />
              <Route path="blockchain" element={<BlockchainPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </WalletProvider>
  )
}

export default App
