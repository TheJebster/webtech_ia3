import { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { getRentals } from '../../services/api';

const statusColors = { pending: 'warning', approved: 'success', returned: 'info', cancelled: 'danger' };

const RentalHistory = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRentals();
        setRentals(res.data);
      } catch {
        setError('Failed to load rental history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <h2 className="mb-3">My Rentals</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {rentals.length === 0 ? (
        <Alert variant="info">You haven't made any rental requests yet. Browse our equipment catalog to get started!</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Equipment</th>
              <th>Event</th>
              <th>Dates</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => (
              <tr key={r._id}>
                <td>{r.equipment?.name || 'N/A'}</td>
                <td>{r.eventName}</td>
                <td>
                  {new Date(r.startDate).toLocaleDateString()} –{' '}
                  {new Date(r.endDate).toLocaleDateString()}
                </td>
                <td>{r.quantity}</td>
                <td>${r.totalPrice}</td>
                <td><Badge bg={statusColors[r.status]}>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default RentalHistory;
