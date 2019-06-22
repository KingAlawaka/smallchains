AppWallet = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await AppWallet.loadWeb3()
      await AppWallet.loadAccount()
      await AppWallet.loadContract()
      await AppWallet.render()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        AppWallet.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        AppWallet.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {ccount
      AppWallet.account = web3.eth.      console.log(AppWallet.account)
    },
  
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const wallet = await $.getJSON('Wallets.json')
      AppWallet.contracts.Wallets = TruffleContract(wallet)
      AppWallet.contracts.Wallets.setProvider(AppWallet.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      AppWallet.Wallets = await AppWallet.contracts.Wallets.deployed()
    },
  
    render: async () => {
      // Prevent double render
      if (AppWallet.loading) {
        return
      }
  
      // Update app loading state
      AppWallet.setLoading(true)
  
      // Render Account
      $('#account').html(AppWallet.account)
  
      // Render Tasks
      await AppWallet.renderTasks()
  
      // Update loading state
      AppWallet.setLoading(false)
    },
  
    renderTasks: async () => {
      // Load the total task count from the blockchain
      const walletCount = await AppWallet.Wallets.walletCount()
      if (walletCount == 1)
      {
        const wallet = await AppWallet.Wallets.walletsList(1)
        const $walletBalance = $('.remainWalletBalance').html(wallet[1].toNumber())
        const $walletBalanceHidden = $('#clientWalletBalanceValue').html(wallet[1].toNumber())
        console.log(wallet[1].toNumber())
        $walletBalance.show()
      }
    },

    createWallet: async () => {
      AppWallet.setLoading(true)
      const name = $('#walletCustomerName').val()
      const password = $('#coinPurchaseCustomerPassword').val()
      await AppWallet.Wallets.createWallet()
      window.location.reload()
    },

    purchaseCoins: async () => {
      AppWallet.setLoading(true)
      const amount = $('#coinAmount').val()
      const password = $('#walletCustomerPassword').val()
      await AppWallet.Wallets.addCoinsToWallet(amount)
      window.location.reload()
    },

    purchaseItems: async () => {
      AppWallet.setLoading(true)
      const  customerID = $('#purchaseItemCustID').val()
      const amount = $('#purchaseItemAmount').val()
      alert("Congrats "+ Math.floor(amount/10) +" Points added to your account....")
      await AppWallet.Wallets.addCoinsToWallet(Math.floor(amount/10))
      window.location.reload()
    },

     setLoading: (boolean) => {
        AppWallet.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
}

$(() => {
    $(window).load(()=>{
        AppWallet.load()
    })
})