'use client'

import { Shield } from 'lucide-react'
import { useAdminStore } from '@/stores/admin-store'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminTrigger() {
  const { togglePanel, isPanelOpen } = useAdminStore()

  return (
    <motion.button
      onClick={togglePanel}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
      style={{
        backgroundColor: isPanelOpen ? '#5E2129' : '#2C241780',
        backdropFilter: 'blur(8px)',
        border: '1px solid #C5A05930',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      title="Admin Panel (Ctrl+Shift+A)"
      aria-label="Toggle Admin Panel"
    >
      <Shield className="w-4 h-4" style={{ color: '#C5A059' }} />
    </motion.button>
  )
}
