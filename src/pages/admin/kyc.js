import Kyc from '@/components/admin/Kyc'
import AdminSidebar from '@/components/admin/AdminSidebar'
import React from 'react'
import withAdminAuth from "@/components/withAdminAuth";


const kyc = () => {
  return (
<>

<AdminSidebar/>
<Kyc/>
</>
  )
}

export default withAdminAuth(kyc)