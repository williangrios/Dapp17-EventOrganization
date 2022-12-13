//import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';

import LSMContract from './artifacts/contracts/EventContract.sol/EventContract.json';

function App() {

  const [userAccount, setUserAccount] = useState('');
  const [nextEventId, setNextEventId] = useState('');

  const [inputName, setInputName] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  const [inputAmountTickets, setInputAmountTickets] = useState('');

  const [inputTransferEventId, setInputTransferEventId] = useState('');
  const [inputTransferEventAmount, setInputTransferEventAmount] = useState('');
  const [inputTransferEventTo, setInputTransferEventTo] = useState('');

  const [amountBuy, setAmountBuy] = useState([]);
  
  const [events, setEvents]= useState([]);

  const addressContract = '0x4427CDD4aa43C983282FE8Eac77cF6102E720fE7';
  
  let contractDeployed = null;
  let contractDeployedSigner = null;
  
  async function getProvider(connect = false){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (contractDeployed == null){
      contractDeployed = new ethers.Contract(addressContract, LSMContract.abi, provider)
    }
    if (contractDeployedSigner == null){
      if (connect){
        let userAcc = await provider.send('eth_requestAccounts', []);
        setUserAccount(userAcc[0]);
      }
      contractDeployedSigner = new ethers.Contract(addressContract, LSMContract.abi, provider.getSigner());
    }
  }

  useEffect(() => {
    getData()
  }, [])

  function toastMessage(text) {
    toast.info(text)  ;
  }

  function toTimestamp(strDate){
    let dateFormatted = Date.parse(strDate);
    return dateFormatted;
  }

  function formatDate(dateTimestamp){
    let date = new Date(parseInt(dateTimestamp));
    let dateFormatted = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() ;
    return dateFormatted;
  }

  async function getData(connect = false) {
    await getProvider(connect);
    const nextEve = (await contractDeployed.nextEventId()).toString()
    setNextEventId(nextEve)
    let arrayEvents = [];
    for (let i = 0 ; i <= nextEve -1; i ++){
      
      let newEvent = await contractDeployed.getEvent(i);
      arrayEvents.push(newEvent);
    }
    setEvents(arrayEvents);
  }

  async function handleCreateEvent(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.createEvent(inputName , toTimestamp( inputDate), inputPrice, inputAmountTickets);  
      toastMessage("Event created.")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleTransferTicket(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.transferTicket(inputTransferEventId ,inputTransferEventAmount, inputTransferEventTo);  
      toastMessage("Tickets transferred.")
    } catch (error) {
      toastMessage(error.reason);
    }
  }
  
  async function handleByuTicket(eventId, amountTickets, unitValue){
    await getProvider(true);
    try {
      console.log(eventId);
      console.log(amountBuy[eventId]);
      const resp  = await contractDeployedSigner.buyTicket(eventId, amountTickets, {value: amountTickets * unitValue});  
      toastMessage("Tickets bought.")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function disconnect(){
    try {
      setUserAccount('');
    } catch (error) {
      
    }
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="EVENT ORGANIZATION" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>
        
        {
          userAccount =='' ?<>
            <h2>Connect your wallet</h2>
            <button onClick={() => getData(true)}>Connect</button>
          </>
          :(<>
            <h2>User data</h2>
            <p>User account: {userAccount}</p>
            <button onClick={disconnect}>Disconnect</button></>)
        }
        
        <hr/>
        <h2>Contract data</h2>
        <p>Events created: {nextEventId}</p>
        <hr/>

        <h2>Create event</h2>
        <input type="text" placeholder="Event name" onChange={(e) => setInputName(e.target.value)} value={inputName}/>
        <input type="text" placeholder="Event date" onChange={(e) => setInputDate(e.target.value)} value={inputDate}/>
        <input type="text" placeholder="Event price" onChange={(e) => setInputPrice(e.target.value)} value={inputPrice}/>
        <input type="text" placeholder="Event amount tickets" onChange={(e) => setInputAmountTickets(e.target.value)} value={inputAmountTickets}/>
        <button onClick={handleCreateEvent}>Click to create the event</button>
        <hr/>

        <h2>Events</h2>
        
        { events.length > 0 ?
          <table>
            <thead>
              <tr>
                <td style={{width: 100}}>Id</td>
                {/* <td style={{width: 100}}>Admin</td> */}
                <td style={{width: 100}}>Name</td>
                <td style={{width: 100}}>Event Date</td>
                <td style={{width: 100}}>Price</td>
                <td style={{width: 100}}>Amount</td>
                <td style={{width: 100}}>Remaining</td>
                <td style={{width: 100}}>Amount to buy</td>
                <td style={{width: 100}}>Action</td>
              </tr>
            </thead>
            <tbody>
              {
              events.map((item, ind) =>  
                <tr key={ind}>
                  <td>{ind}</td>
                  {/* <td>{(item.admin).toString()}</td> */}
                  <td>{item.name}</td>
                  <td>{ formatDate( (item.date).toString())}</td>
                  <td>{(item.price).toString()}</td>
                  <td>{(item.ticketCount).toString()}</td>
                  <td>{(item.ticketRemaining).toString()}</td>
                  <td><input type="text" style={{maxWidth: 40}} onChange={(e) => (amountBuy[ind] = e.target.value)} value={amountBuy[ind]} /></td>
                  <td><button onClick={() => handleByuTicket(ind, amountBuy[ind], item.price )}>Buy</button></td>
                </tr>
              )}                
            </tbody>
          </table>:<p>No events created</p>
        }

        <hr/>

        <h2>Transfer Tickets</h2>
        <input type="text" placeholder="Event id" onChange={(e) => setInputTransferEventId(e.target.value)} value={inputTransferEventId}/>
        <input type="text" placeholder="Amount to transfer" onChange={(e) => setInputTransferEventAmount(e.target.value)} value={inputTransferEventAmount}/>
        <input type="text" placeholder="Address to" onChange={(e) => setInputTransferEventTo(e.target.value)} value={inputTransferEventTo}/>
        <button onClick={handleTransferTicket}>Click to transfer the tickets</button>
        <hr/>
        
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter /> 
    </div>
  );
}

export default App;
