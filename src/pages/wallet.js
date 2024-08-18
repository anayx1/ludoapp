import Wallet from '@/components/Wallet'
import Sidebar from '@/components/Sidebar'
import React from 'react'
import withAuth from "@/components/withAuth";


const wallet = () => {
  return (
<>
<Sidebar/>
<Wallet/>
</>  )
}

export default withAuth(wallet);