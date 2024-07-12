// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomerTable from './CustomerTable';
import CustomerChart from './CustomerChart';
import './App.css';
import './CustomerStyless.css'; // Import the new CSS file

function App() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const customersResponse = await axios.get('http://localhost:5000/customers');
      const transactionsResponse = await axios.get('http://localhost:5000/transactions');
      setCustomers(customersResponse.data);
      setTransactions(transactionsResponse.data);
    }

    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Customer Name',
        accessor: 'name',
        Filter: DefaultColumnFilter,
        filter: 'fuzzyText',
      },
      {
        Header: 'Total Transactions',
        accessor: 'total',
        disableFilters: true,
      },
    ],
    []
  );

  const data = useMemo(
    () =>
      customers.map(customer => ({
        ...customer,
        total: transactions
          .filter(transaction => transaction.customer_id === customer.id)
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      })),
    [customers, transactions]
  );

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const selectedCustomerTransactions = transactions.filter(
    transaction => transaction.customer_id === (selectedCustomer ? selectedCustomer.id : null)
  );

  return (
    <div className="App">
      <h1>Customer Transactions</h1>
      <CustomerTable columns={columns} data={data} onRowClick={handleRowClick} />
      {selectedCustomer && (
        <>
          <h2>Transactions for {selectedCustomer.name}</h2>
          <CustomerChart data={selectedCustomerTransactions} />
        </>
      )}
    </div>
  );
}

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

export default App;
