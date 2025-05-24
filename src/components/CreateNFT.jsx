import {
  useGlobalState,
  setGlobalState,
  setLoadingMsg,
  setAlert,
} from '../store'
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { mintNFT } from '../Blockchain.services'

const CreateNFT = () => {
  const [modal] = useGlobalState('modal')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState(null)
  const [imgBase64, setImgBase64] = useState(null)

  const pinataApiKey = '7d9a04afe545fd7a1138'
  const pinataSecretApiKey = 'ba99f263e9a2d77766a4f82d25ae966652727a782217b0e9a71ca601f214973d'

  const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
    const data = new FormData()
    data.append('file', file)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
      body: data,
    })

    if (!res.ok) throw new Error('Failed to upload file to Pinata')

    const result = await res.json()
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  }

  const uploadJSONToIPFS = async (jsonData, imageFileName) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`

    const baseName = imageFileName ? imageFileName.split('.')[0] : 'NFT'
    const metadataName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Metadata`

    const payload = {
      pinataMetadata: {
        name: metadataName,
      },
      pinataContent: jsonData,
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Failed to upload metadata to Pinata')

    const result = await res.json()
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !price || !description || !imgBase64 || !fileUrl) {
      setAlert('Please fill all fields including image', 'red')
      return
    }

    setGlobalState('modal', 'scale-0')
    setGlobalState('loading', { show: true, msg: 'Uploading NFT...' })

    try {
      // 1. Upload image/media file
      const fileIPFSUrl = await uploadFileToIPFS(fileUrl)

      // 2. Prepare and upload metadata
      const metadata = {
        title,
        description,
        price,
        image: fileIPFSUrl,
      }

      const metadataURI = await uploadJSONToIPFS(metadata, fileUrl.name)

      // 3. Mint NFT on Blockchain
      setLoadingMsg('Minting NFT on blockchain...')
      await mintNFT({ title, price, description, metadataURI })

      // 4. Save to MongoDB
      const wallet = window.ethereum.selectedAddress || 'unknown'

      const res = await fetch('http://localhost:5000/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price,
          description,
          owner: wallet,
          image: imgBase64,
          metadataURI,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'MongoDB save failed')

      resetForm()
      setAlert('NFT minted and saved successfully!', 'green')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      setAlert('Something went wrong during minting or saving', 'red')
    }
  }

  const changeImage = (e) => {
    const file = e.target.files[0]
    setFileUrl(file)

    const reader = new FileReader()
    reader.onloadend = () => setImgBase64(reader.result)
    reader.readAsDataURL(file)
  }

  const closeModal = () => {
    resetForm()
    setGlobalState('modal', 'scale-0')
  }

  const resetForm = () => {
    setTitle('')
    setPrice('')
    setDescription('')
    setFileUrl(null)
    setImgBase64(null)
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
            <p className="font-semibold text-gray-400">Add NFT</p>
            <button
              type="button"
              onClick={closeModal}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div className="flex flex-row justify-center items-center rounded-xl mt-5">
            <div className="shrink-0 rounded-xl overflow-hidden h-20 w-20">
              <img
                src={ imgBase64 ||
                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1361&q=80'}
                alt="NFT"
                className="h-full w-full object-cover cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <label className="block text-gray-400 p-2">Upload File</label>
            <input
              type="file"
              accept="image/*,video/*,audio/*,webp"
              onChange={changeImage}
              className="text-white p-2 w-full"
            />
          </div>

          <input
            type="text"
            className="bg-gray-800 text-white border-0 rounded-xl p-2 my-2"
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />

          <input
            type="number"
            step="0.01"
            className="bg-gray-800 text-white border-0 rounded-xl p-2 my-2"
            placeholder="Price (ETH)"
            onChange={(e) => setPrice(e.target.value)}
            value={price}
          />

          <textarea
            className="bg-gray-800 text-white border-0 rounded-xl p-2 my-2"
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />

          <button
            type="submit"
            className="bg-[#e32970] hover:bg-[#bd255f] text-white px-6 py-2 mt-4 rounded-full shadow-lg"
          >
            Mint Now
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateNFT
