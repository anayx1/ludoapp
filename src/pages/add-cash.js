import React from 'react'
import Sidebar from '@/components/Sidebar'
import AddCash from '@/components/AddCash'
import withAuth from "@/components/withAuth";



const addCash = () => {
  return (
<>
<Sidebar/>
<AddCash/>
</>  )
}

export default withAuth(addCash);