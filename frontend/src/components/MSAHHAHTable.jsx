import React from 'react';
import './MSAHHAHTable.css';

const MSAHHAHTable = ({ records }) => {
  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="msa-hhah-table-container">
      <h3 className="msa-hhah-table-title">HHAH Records for Selected MSA</h3>
      <div className="msa-hhah-table-wrapper">
        <table className="msa-hhah-table">
          <thead>
            <tr>
              <th>Agency Name</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Zipcode</th>
              <th>Telephone</th>
              <th>Email</th>
              <th>Agency Type</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td>{record["Agency Name"]}</td>
                <td>{record.Address}</td>
                <td>{record.City}</td>
                <td>{record.State}</td>
                <td>{record.Zipcode}</td>
                <td>{record.Telephone}</td>
                <td>{record.Email}</td>
                <td>{record["Agency Type"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MSAHHAHTable; 