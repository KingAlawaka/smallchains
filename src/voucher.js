AppVoucher = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await AppVoucher.loadWeb3()
      await AppVoucher.loadAccount()
      await AppVoucher.loadContract()
      await AppVoucher.render()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        AppVoucher.web3Provider = web3.currentProvider
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
        AppVoucher.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      AppVoucher.account = web3.eth.accounts[0]
      console.log(AppVoucher.account)
    },
  
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const voucher = await $.getJSON('Vouchers.json')
      AppVoucher.contracts.Vouchers = TruffleContract(voucher)
      AppVoucher.contracts.Vouchers.setProvider(AppVoucher.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      AppVoucher.Vouchers = await AppVoucher.contracts.Vouchers.deployed()


      //load wallet smart contract
      const wallet = await $.getJSON('Wallets.json')
      AppVoucher.contracts.Wallets = TruffleContract(wallet)
      AppVoucher.contracts.Wallets.setProvider(AppVoucher.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      AppVoucher.Wallets = await AppVoucher.contracts.Wallets.deployed()
    },
  
    render: async () => {
  
      // Prevent double render
      if (AppVoucher.loading) {
        return
      }

      // Update loading state
      AppVoucher.setLoading(false)

      // Render Account
      $('#account').html(AppVoucher.account)

      // Render Tasks
      await AppVoucher.renderTasks()

      // Update loading state
      AppVoucher.setLoading(false)
    },
  
    renderTasks: async () => {
      // Load the total task count from the blockchain
      const voucherCount = await AppVoucher.Vouchers.voucherCount()
      const $voucherTemplate = $('.voucherTemplate')
      
      // Render out each task with a new task template
      for (var i = 1; i <= voucherCount; i++) 
      {
        // Fetch the task data from the blockchain
        const voucher = await AppVoucher.Vouchers.voucherList(i)

        const voucherAvailableCount = voucher[3].toNumber()

        if (voucherAvailableCount > 0)
        {
            const voucherId = voucher[0].toNumber()
            const voucherHeading = voucher[1]
            const voucherContent = voucher[2]
            const voucherCost = voucher[4].toNumber()
            const voucherDisable = voucher[6]

            var path = voucher[5]
            var filename = path.replace(/^.*\\/, "")
            const vocherImg = filename
    
            // Create the html for the task
            const $newVoucherTemplate = $voucherTemplate.clone()
            $newVoucherTemplate.find('.voucherHeader').html(voucherHeading)
            $newVoucherTemplate.find('.voucherContent').html(voucherContent)
            $newVoucherTemplate.find('.voucherRemCount').html("Hurry up... Only "+voucherAvailableCount +" Vouchers left...")
            $newVoucherTemplate.find('.voucherCost')
                                .html(voucherCost +" Coins")
                                .prop('name',voucherId)
                                .on('click',AppVoucher.purchaseVoucher)
            $newVoucherTemplate.find(".voucherImgDisplay").html('<img class="" src="./img/'+vocherImg+'"alt=""></img>')

            // Put the task in the correct list
            if (voucherDisable == false) {
            $('#voucherList').append($newVoucherTemplate)
            } else {
            //$('#taskList').append($newTaskTemplate)
            }
    
            // Show the task
            $newVoucherTemplate.show()
        }

      }

      /*purchased Voucher section*/

      // Load the total task count from the blockchain
      const purchasedVoucherCount = await AppVoucher.Vouchers.purchasedVoucherCount()
      const $purchasedVoucherTemplate = $('.purchasedVoucherTemplate')
      // Render out each task with a new task template
      for (var i = 1; i <= purchasedVoucherCount; i++) 
      {
        // Fetch the task data from the blockchain
        const purchasedVoucher = await AppVoucher.Vouchers.purchasedVoucherList(i)

        const purchasedVoucherDisable = purchasedVoucher[6]

        
        if (purchasedVoucherDisable == false)
        {
            const purchasedVoucherId = purchasedVoucher[0].toNumber()
            const purchasedVoucherHeading = purchasedVoucher[1]
            const purchasedVoucherContent = purchasedVoucher[2]
            const purchasedVoucherAvailableCount = purchasedVoucher[3].toNumber()
            const purchasedVoucherCost = purchasedVoucher[4].toNumber()
            

            var path = purchasedVoucher[5]
            var filename = path.replace(/^.*\\/, "")
            const purchasedVocherImg = filename
    
            // Create the html for the task
            const $newpurchasedVoucherTemplate = $purchasedVoucherTemplate.clone()
            $newpurchasedVoucherTemplate.find('.purchasedVoucherHeader').html(purchasedVoucherHeading)
            $newpurchasedVoucherTemplate.find('.purchasedVoucherContent').html(purchasedVoucherContent)
            
            $newpurchasedVoucherTemplate.find('.purchasedVoucherButton')
                                .html("Activate")
                                .prop('name',purchasedVoucherId)
                                .on('click',AppVoucher.activateVouchers)
            $newpurchasedVoucherTemplate.find(".purchasedVoucherImgDisplay").html('<img class="card-img-top" src="./img/'+purchasedVocherImg+'"alt="Card image cap"></img>')
            
            // Put the task in the correct list
            if (purchasedVoucherDisable == false) {
            $('#purchasedVoucherList').append($newpurchasedVoucherTemplate)
            } else {
            //$('#taskList').append($newTaskTemplate)
            }
    
            // Show the task
            $newpurchasedVoucherTemplate.show()
        }
      }


      /* Activated Voucher List */
      /*                        */

      // Load the total task count from the blockchain
      const activatedVoucherCount = await AppVoucher.Vouchers.activatedVoucherCount()
      const $activatedVoucherTemplate = $('.activatedVoucherTemplate')
        //alert("tedt")
      // Render out each task with a new task template
      for (var i = 1; i <= activatedVoucherCount; i++) 
      {
        // Fetch the task data from the blockchain
        const activatedVoucher = await AppVoucher.Vouchers.activatedVoucherList(i)

        const activatedVoucherDisable = activatedVoucher[6]

        //alert(purchasedVoucherDisable)


            const activatedVoucherId = activatedVoucher[0].toNumber()
            const activatedVoucherHeading = activatedVoucher[1]
            const activatedVoucherContent = activatedVoucher[2]
            const activatedVoucherAvailableCount = activatedVoucher[3].toNumber()
            const activatedVoucherCost = activatedVoucher[4].toNumber()
            

            var path = activatedVoucher[5]
            //alert(activatedVoucherId)
            var filename = path.replace(/^.*\\/, "")
            const activatedVocherImg = filename
    
            // Create the html for the task
            const $newactivatedVoucherTemplate = $activatedVoucherTemplate.clone()
            $newactivatedVoucherTemplate.find('.activatedVoucherHeader').html(activatedVoucherHeading)
            $newactivatedVoucherTemplate.find('.activatedVoucherContent').html(activatedVoucherContent)
            
            $newactivatedVoucherTemplate.find('.activatedVoucherButton')
                                .html("Used")
                                .prop('name',activatedVoucherId)
                                .on('click',AppVoucher.markActivatedVouchers)
            $newactivatedVoucherTemplate.find(".activatedVoucherImgDisplay").html('<img class="card-img-top" src="./img/'+activatedVocherImg+'"alt="Card image cap"></img>')
            
            // Put the task in the correct list
            if (activatedVoucherDisable == false) {
            $('#activatedVoucherList').append($newactivatedVoucherTemplate)
            } else {
            //$('#taskList').append($newTaskTemplate)
            }
    
            // Show the task
            $newactivatedVoucherTemplate.show()
      }

    },

    createVoucher: async () => {
        AppVoucher.setLoading(true)

        const heading = $('#newVoucherHeading').val()
        const content = $('#newVoucherContent').val()
        const count = $('#newVoucherCount').val()
        const cost = $('#newVoucherCost').val()
        
        var path = $('#voucherImg').val()
        var filename = path.replace(/^.*\\/, "")
        const img = filename

        await AppVoucher.Vouchers.createVoucher(heading,content,count,cost,img)
        window.location.reload()
    },

    purchaseVoucher: async (e) => {
      AppVoucher.setLoading(true)
      const voucherID = e.target.name
      var amountStr = e.target.text.split(" ")
      var amount = parseInt(amountStr[0],10)
      await AppVoucher.Vouchers.voucherPurchase(voucherID)
      await AppVoucher.Wallets.deductCoinsFromWallet(amount)
      window.location.reload()
    },

    activateVouchers: async (e) => {
        AppVoucher.setLoading(true)
        const voucherID = e.target.name
        await AppVoucher.Vouchers.activateVoucher(voucherID)
        window.location.reload()
    },

    markActivatedVouchers: async (e) => {
        AppVoucher.setLoading(true)
        const voucherID = e.target.name
        await AppVoucher.Vouchers.markActivatedVoucher(voucherID)
        window.location.reload()
    },
  
    setLoading: (boolean) => {
      AppVoucher.loading = boolean
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
        AppVoucher.load()
    })
})