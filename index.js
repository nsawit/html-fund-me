//import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js"
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectionStat")
const fundButton = document.getElementById("fundBtn")
// const amountField = document.getElementById("amount")

connectButton.onclick = connect
fundButton.onclick = fund
// amountField.onchange = fund

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
    const ethAmount = document.getElementById("amount").value
    if (window.ethereum) {
        //need provider -> connection to the blockchain
        //signer -> the wallet owner
        // contract that we are interacting with
        // ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
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
            });

            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (e) {
            console.log(e);
        }
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

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReciept) => {
      console.log(
        `Completed with ${transactionReciept.confirmations} confirmations.`
      );
      resolve();
    });
  });
}