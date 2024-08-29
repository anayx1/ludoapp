import BattlesComponent from '@/components/admin/Battles'
import AdminSidebar from '@/components/admin/AdminSidebar'
import React from 'react'
import withAdminAuth from "@/components/withAdminAuth";


const battles = () => {
  return (
<>
<AdminSidebar/>
<BattlesComponent/>
</>  )
}

export default withAdminAuth(battles);