import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import ContractStore from 'store/ContractStore'

import NetworkStore from 'store/NetworkStore'
import SendStore from 'store/SendStore'

import { BlockChainType } from 'types/network'
import useWhiteList from './useWhiteList'

const useNetwork = (): {
  getScannerLink: (props: { address: string; type: 'tx' | 'address' }) => string
  fromTokenAddress?: string
  toTokenAddress?: string
} => {
  const FINDER = 'https://finder.terra.money'
  const asset = useRecoilValue(SendStore.asset)
  const fromBlockChain = useRecoilValue(SendStore.fromBlockChain)
  const toBlockChain = useRecoilValue(SendStore.toBlockChain)
  const terraExt = useRecoilValue(NetworkStore.terraExt)
  const etherBaseExt = useRecoilValue(NetworkStore.etherBaseExt)
  const isTestnet = useRecoilValue(NetworkStore.isTestnet)

  const terraWhiteList = useRecoilValue(ContractStore.terraWhiteList)
  const whiteList = useWhiteList()

  // get the explorer link based on the current chain
  const getScannerLink = ({
    address,
    type,
  }: {
    address: string
    type: 'tx' | 'address'
  }): string => {
    if (fromBlockChain === BlockChainType.terra && terraExt) {
      return `${FINDER}/${terraExt.chainID}/${type}/${address}`
    } else if (etherBaseExt) {
      let subdomain = ''

      if (fromBlockChain === BlockChainType.bsc) {
        subdomain = isTestnet ? 'testnet.' : ''
        return `https://${subdomain}bscscan.com/${type}/${address}`
      } else if (fromBlockChain === BlockChainType.hmy) {
        subdomain = isTestnet ? 'testnet.' : ''
        return `https://explorer.${subdomain}harmony.one/#/${type}/${address}`
      } else if (fromBlockChain === BlockChainType.osmo) {
        return type === 'tx'
          ? `https://www.mintscan.io/osmosis/txs/${address}`
          : `https://www.mintscan.io/osmosis/account/${address}`
      } else if (fromBlockChain === BlockChainType.scrt) {
        return type === 'tx'
          ? `https://www.mintscan.io/secret/txs/${address}`
          : `https://www.mintscan.io/secret/account/${address}`
      } else if (fromBlockChain === BlockChainType.inj) {
        return type === 'tx'
          ? `https://www.mintscan.io/injective/txs/${address}`
          : `https://www.mintscan.io/injective/account/${address}`
      } else if (fromBlockChain === BlockChainType.cosmos) {
        return type === 'tx'
          ? `https://www.mintscan.io/cosmos/txs/${address}`
          : `https://www.mintscan.io/cosmos/account/${address}`
      }
      subdomain = isTestnet ? `${etherBaseExt.name}.` : ''
      return `https://${subdomain}etherscan.io/${type}/${address}`
    }
    return ''
  }

  const getTokenAddress = (
    blockChain: BlockChainType,
    tokenAddress: string
  ): string => {
    switch (blockChain) {
      case BlockChainType.terra:
        return terraWhiteList[tokenAddress]
      default:
        return whiteList[tokenAddress]
    }
  }

  const fromTokenAddress = useMemo(
    () => asset && getTokenAddress(fromBlockChain, asset.terraToken),
    [asset]
  )
  const toTokenAddress = useMemo(
    () => asset && getTokenAddress(toBlockChain, asset.terraToken),
    [asset]
  )

  return {
    getScannerLink,
    fromTokenAddress,
    toTokenAddress,
  }
}

export default useNetwork
