import { useEffect, useState } from 'react'
import { BiTransfer } from 'react-icons/bi'
import { MdOpenInNew } from 'react-icons/md'

const truncate = (str, startLen = 4, endLen = 4, maxLen = 11) => {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return `${str.slice(0, startLen)}...${str.slice(-endLen)}`
}

const Transaction = () => {
  const [transactions, setTransactions] = useState([])
  const [end, setEnd] = useState(3)
  const [count] = useState(3)
  const [collection, setCollection] = useState([])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions')
        if (!res.ok) throw new Error('Failed to fetch transactions')
        const data = await res.json()
        setTransactions(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    setCollection(transactions.slice(0, end))
  }, [transactions, end])

  return (
    <div className="bg-[#151c25]">
      <div className="w-4/5 py-10 mx-auto">
        <h4 className="text-white text-3xl font-bold uppercase text-gradient">
          {collection.length > 0 ? 'Latest Transactions' : 'No Transaction Yet'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4 lg:gap-2 py-2.5">
          {collection.map((tx, index) => (
            <div
              key={tx._id}
              className="flex justify-between items-center border border-pink-500 text-gray-400 w-full shadow-xl shadow-black rounded-md overflow-hidden bg-gray-800 my-2 p-3"
            >
              <div className="rounded-md shadow-sm shadow-pink-500 p-2">
                <BiTransfer />
              </div>

              <div className="flex-1 mx-2">
                <h4 className="text-sm">{tx.nftTitle} Transferred</h4>
                <small className="flex flex-row justify-start items-center">
                  <span className="mr-1">To</span>
                  <a
                    href={`https://etherscan.io/address/${tx.newOwner}`}
                    className="text-pink-500 mr-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {truncate(tx.newOwner, 4, 4, 11)}
                  </a>
                  <a
                    href={`https://etherscan.io/address/${tx.newOwner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MdOpenInNew />
                  </a>
                </small>
              </div>

              <p className="text-sm font-medium">{tx.price} ETH</p>
            </div>
          ))}
        </div>

        {collection.length > 0 && transactions.length > collection.length && (
          <div className="text-center my-5">
            <button
              className="shadow-xl shadow-black text-white bg-[#e32970] hover:bg-[#bd255f] rounded-full cursor-pointer p-2"
              onClick={() => setEnd(end + count)}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transaction
