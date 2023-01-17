import React, { useState, useEffect } from 'react'

import { useStateContext } from '../context'
import { DisplayCampaigns } from '../components'

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [campaigns, setCampaings] = useState([])

  const { address, contract, getUserCampaigns } = useStateContext()

  const fetchCampaings = async () => {
    setIsLoading(true)
    const data = await getUserCampaigns()
    setCampaings(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (contract) fetchCampaings()
  }, [address, contract])

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  )
}

export default Profile
