import { useContext } from 'react'
import { AppContext } from './AppContext'

export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp doit être utilisé à l’intérieur de <AppProvider>.')
  }

  return context
}
