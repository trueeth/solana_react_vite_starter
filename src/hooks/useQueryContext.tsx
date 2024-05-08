import { useParams } from 'react-router-dom'
import { EndpointTypes } from '../models/types'

export default function useQueryContext() {
  const params = useParams()
  const { cluster } = params

  const endpoint = cluster ? (cluster as EndpointTypes) : 'mainnet'
  const hasClusterOption = endpoint !== 'mainnet'
  const fmtUrlWithCluster = (url: any) => {
    if (hasClusterOption) {
      const mark = url.includes('?') ? '&' : '?'
      return decodeURIComponent(`${url}${mark}cluster=${endpoint}`)
    }
    return url
  }

  return {
    fmtUrlWithCluster,
  }
}
