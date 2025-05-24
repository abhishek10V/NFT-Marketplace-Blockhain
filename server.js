const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))



mongoose
  .connect('mongodb://localhost:27017/NFTdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))

const nftSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: String,
  owner: String,
  image: String, // base64
  createdAt: { type: Date, default: Date.now },
})

const NFT = mongoose.model('NFT', nftSchema)


const Transaction = mongoose.model(
  'Transaction',
  new mongoose.Schema(
    {
      nftTitle: { type: String, required: true },
      previousOwner: { type: String, required: true },
      newOwner: { type: String, required: true },
      price: { type: String, required: true }, // in ETH
    },
    { timestamps: true }
  )
)


app.post('/api/nfts', async (req, res) => {
  try {
    const { title, description, price, owner, image } = req.body

    if (!title || !description || !price || !owner || !image) {
      return res.status(400).json({ message: 'All fields required' })
    }

    const newNFT = new NFT({ title, description, price, owner, image })
    await newNFT.save()
    res.status(201).json({ message: 'NFT stored successfully' })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/nfts', async (req, res) => {
    try {
      const nfts = await NFT.find().sort({ createdAt: -1 })
      res.status(200).json(nfts)
    } catch (error) {
      console.error('Fetch Error:', error)
      res.status(500).json({ message: 'Failed to fetch NFTs' })
    }
  })
  

  app.get('/api/nfts/:id', async (req, res) => {
    try {
      const nft = await NFT.findById(req.params.id)
      if (!nft) return res.status(404).json({ message: 'NFT not found' })
      res.status(200).json(nft)
    } catch (err) {
      console.error('Error fetching NFT by ID:', err)
      res.status(500).json({ message: 'Server error' })
    }
  })

  app.put('/api/nfts/:id', async (req, res) => {
    try {
      const { price } = req.body
      if (!price) return res.status(400).json({ message: 'Price is required' })
  
      const updated = await NFT.findByIdAndUpdate(req.params.id, { price }, { new: true })
  
      if (!updated) return res.status(404).json({ message: 'NFT not found' })
  
      res.status(200).json({ message: 'NFT price updated', nft: updated })
    } catch (err) {
      console.error('Error updating NFT price:', err)
      res.status(500).json({ message: 'Server error' })
    }
  })

  app.put('/api/nfts/:id/transfer', async (req, res) => {
    try {
      const { newOwner, price } = req.body
      if (!newOwner || !price) {
        return res.status(400).json({ message: 'New owner and price are required' })
      }
  
      const nft = await NFT.findById(req.params.id)
      if (!nft) return res.status(404).json({ message: 'NFT not found' })
  
      const previousOwner = nft.owner
  
      // Update NFT ownership
      nft.owner = newOwner
      await nft.save()
  
      // Create transaction
      const transaction = new Transaction({
        nftTitle: nft.title,
        previousOwner,
        newOwner,
        price,
      })
  
      await transaction.save()
  
      res.status(200).json({ message: 'Ownership transferred', nft })
    } catch (err) {
      console.error('Error transferring NFT:', err)
      res.status(500).json({ message: 'Server error' })
    }
  })
  
  
  
  // Get all transactions
  app.get('/api/transactions', async (req, res) => {
    try {
      const txs = await Transaction.find().sort({ createdAt: -1 })
      res.status(200).json(txs)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Error fetching transactions' })
    }
  })
  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
