//import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js"
import { ethers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectionStat")
const fundButton = document.getElementById("fundBtn")
const amountField = document.getElementById("amount")
const balanceButton = document.getElementById("getBalance")
const withdrawButton = document.getElementById("withdrawBtn")

connectButton.onclick = connect
fundButton.onclick = fund
//amountField.onclick = fund
balanceButton.onclick = getContractBalance
withdrawButton.onclick = withdrawAmount

//variable declaration
// const provider = new ethers.providers.Web3Provider(window.ethereum)
// const signer = provider.getSigner()
// const contract = new ethers.Contract(contractAddress, abi, signer)

//console.log(ethers)
// async function getBalance() {
//     let paramsi = ["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "latest"]
//     const bal = await window.ethereum.request({
//         method: "eth_getBalance",
//         paramsi,
//     })
//     console.log(bal)
// }
updateButton()

async function updateButton() {
    if (window.ethereum.selectedAddress !== undefined) {
        document.getElementById("connectionStat").innerHTML = "Connected"
    }
}

async function fund() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const ethAmount = document.getElementById("amount").value

    if (window.ethereum) {
        //need provider -> connection to the blockchain
        //signer -> the wallet owner
        // contract that we are interacting with
        // ^ ABI & Address
        console.log(contract)
        console.log(`Contract Address: ${contract.address}`)

        //fund
        console.log(
            `Ethers.util.parseEther value:  ${ethers.utils.parseEther(
                ethAmount
            )}`
        )
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            //listen for the transaction to be mined
            await listenForTransactionMine(transactionResponse, provider)
            //const wa = await transactionResponse.wait(1)
            //console.log(`waiting . . .  ${wa.confirmations}`)
            console.log("Done!")
        } catch (error) {
            console.log("there's an error")
            console.log(error)
        }

        //console.log(`Funder: ${await contract.getFunder(0)}`)
    }
}

let currentAddress = 0

async function connect() {
    if (window.ethereum !== undefined) {
        if (window.ethereum.selectedAddress !== undefined) {
            currentAddress = window.ethereum.selectedAddress
            alert(`Already signed in with ${currentAddress} address`)
        } else {
            console.log("You have metamask!")
            await window.ethereum.request({ method: "eth_requestAccounts" })
            document.getElementById("connectionStat").innerHTML = "Connected"
            //document.getElementById("connectionStat").disabled = true
            console.log(`with account: ${window.ethereum.selectedAddress}`)
        }
    } else {
        console.log("I see you have no metamask yet!!!")
        console.log(window.ethereum)
    }

    window.ethereum.on("accountsChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        console.log("changed!")
        if (currentAddress != window.ethereum.selectedAddress) {
            currentAddress = window.ethereum.selectedAddress
            alert("You are now logged into another account! " + currentAddress)
        }
    })
}

function listenForTransactionMine(transResponse, provider) {
    console.log(`Mining at ${transResponse.hash} . . .`)

    //lister for tx to finish

    //another option is to create named function e.g. function listener() and pass it in the parameter
    return new Promise((resolver) => {
        provider.once(transResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolver()
        })
    })
}

//withdraw
async function withdrawAmount() {
    //need provider -> connection to the blockchain
    //signer -> the wallet owner
    // contract that we are interacting with
    // ^ ABI & Address
    //these are declared above

    const withdrawEthAmount = document.getElementById("withdraw").value

    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const withdrawTransaction = await contract.withdraw()
            const withdrawTx = await withdrawTransaction.wait(1)
            console.log(
                `Withdrawing at ${withdrawTx.confirmations} confirmation`
            )

            //await listenForTransactionMine(withdrawTransaction,provider)
        } catch (error) {
            console.log(error)
        }
    }
}

//getBalance
async function getContractBalance() {
    if (window.ethereum !== undefined) {
        //get the balance of contract
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        //refer to https://docs.ethers.io/v5/api/providers/provider/
        const balance = await provider.getBalance(contract.address)
        console.log(`Balance without formatting ${balance}`)
        console.log(
            `Balance with formatting ${ethers.utils.formatEther(balance)}`
        )
        document.getElementById(
            "balanceLabel"
        ).innerHTML = `${ethers.utils.formatEther(balance)}`
    } else {
        console.log("I see you have no metamask yet!!!")
        console.log(window.ethereum)
    }
}
