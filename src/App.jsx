import { motion } from "motion/react"

function App() {

  return (
    <>
      <motion.h1
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-4xl font-bold text-blue-600">Colegio Los Pinos - Online</motion.h1>
    </>
  )
}

export default App
