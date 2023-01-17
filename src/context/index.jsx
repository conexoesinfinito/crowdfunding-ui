import React, { useContext, createContext } from 'react'
import {
  useAddress,
  useContract,
  useContractWrite,
  useMetamask
} from '@thirdweb-dev/react'
import { ethers } from 'ethers'

const StateContext = createContext()

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0x5d71306C85Ba209225502660e8a0F0B2503F8b04')
  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    'createCampaign'
  )

  const address = useAddress()
  const connect = useMetamask()

  const publishCampaign = async form => {
    try {
      const data = await createCampaign([
        address,
        form.title,
        form.description,
        form.target,
        new Date(form.deadline).getTime(),
        form.image
      ])
      console.log('contract call success', data)
    } catch (error) {
      console.log('contract call failure', error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns')

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pID: i
    }))

    return parsedCampaings
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns()

    const filteredCampaigns = allCampaigns.filter(
      campaign => campaign.owner === address
    )

    return filteredCampaigns
  }

  const donate = async (pID, amount) => {
    const data = contract.call('donateToCampaign', pID, {
      value: ethers.utils.parseEther(amount)
    })

    return data
  }

  const getDonations = async pID => {
    const donations = await contract.call('getDonators', pID)
    const numberOfDonations = donations[0].length

    const parsedDonatiopns = []

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonatiopns.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString)
      })
    }
    return parsedDonatiopns
  }

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext)
