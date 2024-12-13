'use client'
import React, { useState, useEffect  } from 'react';
import Snowfall from 'react-snowfall'; // Import Snowfall effect
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

    interface Seller {
      Username: string;
      Name: string | null;
      IsFrozen: number;
      ItemID: number;
    }
    
    interface ItemDetail {
      accountName: string;
      item: string;
      status: string;
      id: number;
    }

const AdminPage : React.FC = () => {
  const [userType] = useState('admin');
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  const [itemList, setItemList] = useState<{ accountName: string; item: string; status: string; id:number }[]>([]);
  
  

  useEffect(() => {
    const storedUserInfo = sessionStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo); 
    //console.log('Loaded userInfo:', parsedUserInfo);
    if (Array.isArray(parsedUserInfo.sellers)) {
      const itemDetailList: ItemDetail[] = parsedUserInfo.sellers.map((seller: Seller) => ({
        accountName: seller.Username,
        item: seller.Name || "Unnamed Item",
        status: seller.IsFrozen ? "Frozen" : "Unfrozen",
        id: seller.ItemID
      }));
      
      // // Corrected forEach with explicit typing of 't' as ItemDetail
      // itemDetailList.forEach((t: ItemDetail) => {
      //   console.log('id:', t.id);
      // });

     // console.log('itemDetailList:', itemDetailList);  
      setItemList(itemDetailList);
      
      
    }
    }
  }, []);



  // Handle Freeze action
  const handleFreezeUnfreeze = (id: number, freeze: boolean) => {
    setItemList((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, status: freeze ? 'Frozen' : 'Unfrozen' } : item
      )
    );
    
 
    const method = '/' + userType + '/freeze_unfreeze';
    const request = {
      admin_credential: {
          username: "Admin",  
          password: "Admin123"   
      },
      freeze: freeze,          
      itemID: id
  };
    
    instance.post(method, request).then((response) => {
        console.log(response);
        
    }).catch((error) => {
        console.log(error);
    });
   // setErrorMessage('');
  };


  
  const handleAuctionReport = () => {
    console.log("ggg");
    instance.post('/admin/getauctionreport')
    .then((response) => {
      console.log('Response:', response);
      
    })
    .catch((error) => {
      console.log(error);
      
    })
  }

  const handleForensicReport = () => {
    instance.post('/admin/getforensicsreport')
    .then((response) => {
      console.log('Response:', response);
      
    })
    .catch((error) => {
      console.log(error);
      
    })
  }
  

  return (

    <div style={{ position: 'relative', height: '100vh', backgroundColor: '#dc2626' }}>
    {/* Snowfall Effect */}
    <Snowfall color="white" snowflakeCount={150} />
        <div >
        <h1 className="text-xl  font-semibold text-white">GROOVY ACTION HOUSE</h1>
      <div className="button-container">
        <div><button onClick={() => handleAuctionReport()}>Generate Auction Report</button></div>
        <div><button onClick={() => handleForensicReport()}>Generate Forensic Report</button></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Item</th>
            <th>Status</th>
            <th>Freeze</th>
            <th>Unfreeze</th>
          </tr>
        </thead>
        <tbody>
          {itemList.map((item) => (
            <tr key={item.id}>
              <td>{item.accountName}</td>
              <td>{item.item}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => handleFreezeUnfreeze(item.id,true)} disabled={item.status === 'Frozen'}>Freeze</button>
              </td>
              <td>
                <button onClick={() => handleFreezeUnfreeze(item.id,false)} disabled={item.status === 'Unfrozen'}>Unfreeze</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        
    </div>
    </div>
  )}
      
       

      
 


export default AdminPage;
