import {
  useGlobalState,
  setGlobalState,
  setLoadingMsg,
  setAlert,
} from '../store'
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

const UpdateNFT = () => {
  const [modal] = useGlobalState('updateModal')
  const [nft] = useGlobalState('nft')
  const [price, setPrice] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!price || price <= 0) return

    setGlobalState('updateModal', 'scale-0')
    setGlobalState('loading', { show: true, msg: 'Updating price in database...' })

    try {
      setLoadingMsg('Updating NFT price...')

      const res = await fetch(`http://localhost:5000/api/nfts/${nft._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      })

      if (!res.ok) throw new Error('Failed to update NFT price')

      setAlert('NFT price updated successfully!', 'green')
      window.location.reload()
    } catch (error) {
      console.error('Update failed:', error)
      setAlert('Failed to update NFT price.', 'red')
    } finally {
      setGlobalState('loading', { show: false, msg: '' })
    }
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center
      justify-center bg-black bg-opacity-50 transform
      transition-transform duration-300 ${modal}`}
    >
      <div className="bg-[#151c25] shadow-xl shadow-[#e32970] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold text-gray-400">{nft?.title}</p>
            <button
              type="button"
              onClick={() => setGlobalState('updateModal', 'scale-0')}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div className="flex flex-row justify-center items-center rounded-xl mt-5">
            <div className="shrink-0 rounded-xl overflow-hidden h-20 w-20">
              <img
                alt={nft?.title}
                src={nft?.metadataURI || nft?.image}
                className="h-full w-full object-cover cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <input
              className="block w-full text-sm text-slate-500 bg-transparent border-0 focus:outline-none focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="price"
              placeholder="Price (Eth)"
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="flex flex-row justify-center items-center
            w-full text-white text-md bg-[#e32970]
            hover:bg-[#bd255f] py-2 px-5 rounded-full
            drop-shadow-xl border border-transparent
            hover:bg-transparent hover:text-[#e32970]
            hover:border hover:border-[#bd255f]
            focus:outline-none focus:ring mt-5"
          >
            Update Now
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateNFT
