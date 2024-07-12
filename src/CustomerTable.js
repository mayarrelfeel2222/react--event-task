import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Registering the required Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterAmount, setFilterAmount] = useState('');

  useEffect(() => {
    // Fetch data from the db.json file located in the public directory
    const fetchData = async () => {
      try {
        const response = await fetch('/db.json');  // Fetch the JSON file from the public directory
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCustomers(data.customers);
        setTransactions(data.transactions);
        setFilteredCustomers(data.customers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCustomerChange = (event) => {
    const customerId = Number(event.target.value);
    setSelectedCustomer(customerId);
    setFilterName('');  // Clear name filter when customer changes
    setFilterAmount('');  // Clear amount filter when customer changes
  };

  const handleFilterNameChange = (event) => {
    const name = event.target.value;
    setFilterName(name);
    filterCustomers(name);
  };

  const handleFilterAmountChange = (event) => {
    const amount = event.target.value;
    setFilterAmount(amount);
  };

  const filterCustomers = (name) => {
    const filtered = customers.filter(customer => {
      return customer.name.toLowerCase().includes(name.toLowerCase());
    });
    setFilteredCustomers(filtered);
    // Auto-select the first customer in the filtered list if there is only one result
    if (filtered.length === 1) {
      setSelectedCustomer(filtered[0].id);
    } else {
      setSelectedCustomer(null);
    }
  };

  // Filter transactions based on selectedCustomer, filterName, and filterAmount
  const filteredTransactions = transactions
    .filter(transaction => selectedCustomer === null || transaction.customer_id === selectedCustomer)
    .filter(transaction => {
      const customer = customers.find(c => c.id === transaction.customer_id);
      const matchName = filterName ? customer?.name.toLowerCase().includes(filterName.toLowerCase()) : true;
      const matchAmount = filterAmount ? transaction.amount === Number(filterAmount) : true;  // Exact match for amount
      return matchName && matchAmount;
    });

  // Group transactions by date and calculate the total amount for each date
  const groupedByDate = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += transaction.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(groupedByDate),
    datasets: [{
      label: 'Total Transaction Amount per Day',
      data: Object.values(groupedByDate),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }]
  };

  return (
    <div className="App">
      
      <div>
        <label htmlFor="customer">Select Customer: </label>
        <select id="customer" onChange={handleCustomerChange} value={selectedCustomer || ''}>
          <option value="">--Select a Customer--</option>
          {filteredCustomers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filterName">Filter by Name: </label>
        <input
          type="text"
          id="filterName"
          value={filterName}
          onChange={handleFilterNameChange}
        />
      </div>
      <div>
        <label htmlFor="filterAmount">Filter by Amount: </label>
        <input
          type="number"
          id="filterAmount"
          value={filterAmount}
          onChange={handleFilterAmountChange}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Transaction Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            return (
              <tr key={transaction.id}>
                <td>{customer?.name}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedCustomer && (
        <div>
          <h2>Transaction Data for {customers.find(c => c.id === selectedCustomer)?.name}</h2>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default App;