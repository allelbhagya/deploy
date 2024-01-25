
import React, { useEffect, useState } from 'react';
import Log from './Log';
import { useNavigate } from 'react-router-dom';

export default function IndexPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const downloadCSV = () => {
    const headers = [
      'Report time',
      'Cobble time',
      'Reported by',
      'Duration',
      'Region',
      'Sensor ID',
      'Profile',
      'Stoppage',
      'Measure',
      'Comment',
    ];
  
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => headers.map(header => {
        switch (header) {
          case 'Report time':
            return new Date(log['time']).toLocaleString();
          case 'Cobble time':
            return new Date(log['createdAt']).toLocaleString();
          case 'Reported by':
            return log['author']['username'];
            case 'Sensor ID':
              return Array.isArray(log['sensorID']) ? log['sensorID'].join(', ') : log['sensorID'];
          case 'Profile':
            return log['profile'];
          default:
            return log[header.toLowerCase()];
        }
      }).join(',')),
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'log_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  useEffect(() => {
    fetch('http://localhost:4000/log', {
      credentials: 'include', // Add this line
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching logs');
        }
        return response.json();
      })
      .then(logs => {
        setLogs(logs);
      })
      .catch(error => {
        console.error('Error fetching logs:', error.message);
        // Handle the error, e.g., show an error message to the user or redirect to an error page
      });
  }, []);
  
  
  const handleDelete = async (logId) => {
    const confirmed = window.confirm('Are you sure you want to delete this log?');
  
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:4000/log/${logId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Add this line
        });
  
        if (response.ok) {
          setLogs(prevLogs => prevLogs.filter(log => log._id !== logId));
        } else {
          console.error('Error deleting log:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };
  

const handleEdit = (logId) => {
  navigate(`/edit/${logId}`);
};

  const filteredLogs = logs.filter(log =>
    Object.values(log || {}).some(value =>
      value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
    )
  );

  return (
    <div className="log">
      <div>
        <div className="search-box">
          <h1>Search for a log</h1>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <button className='save-btn' style={{ paddingTop: '10px', paddingBottom: '10px' }} onClick={downloadCSV}>
        Save data
      </button>


      <table>
        <thead>
          <tr>
            <th>Report time</th>
            <th>Cobble time</th>
            <th>Reported by</th>
            <th>Duration</th>
            <th className="region-head">Region</th>
            <th>Sensor ID</th>
            <th>Profile</th>
            <th>Stoppage</th>
            <th>Measure</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <Log
                key={log?._id}
                {...log}
                onDelete={() => handleDelete(log._id)} 
                onEdit={handleEdit}

              />
            ))
          ) : (
            <tr>
              <td colSpan="8">No matching logs found.</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
