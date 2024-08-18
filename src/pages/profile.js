import Profile from '@/components/Profile'
import Sidebar from '@/components/Sidebar'
import React from 'react'
import withAuth from "@/components/withAuth";


const profile = () => {
  return (
<>
<Sidebar/>
<Profile/>
</>  )
}

export default withAuth(profile);