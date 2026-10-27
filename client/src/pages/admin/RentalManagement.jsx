import { useState, useEffect } from 'react';
import {
  Container, Table, Alert, Spinner, Badge, Form, Button,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { getRentals, updateRentalStatus, deleteRental } from '../../services/api';

const statusColors = { pending: 'warning', approved: 'success', returned: 'info', cancelled: 'danger' };

const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await getRentals();
      setRentals(res.data);
    } catch {
      setError('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateRentalStatus(id, status);
      fetchData();
    } catch {
      setError('Failed to update rental status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rental?')) return;
    try {
      await deleteRental(id);
      fetchData();
    } catch {
      setError('Failed to delete rental');
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Rental Management</h2>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>User</th><th>Equipment</th><th>Event</th><th>Dates</th><th>Qty</th><th>Total</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((r) => (
            <tr key={r._id}>
              <td>{r.user?.name || 'N/A'}<br /><small className="text-muted">{r.user?.email}</small></td>
              <td>{r.equipment?.name || 'N/A'}</td>
              <td>{r.eventName}</td>
              <td>
                {new Date(r.startDate).toLocaleDateString()} –<br />
                {new Date(r.endDate).toLocaleDateString()}
              </td>
              <td>{r.quantity}</td>
              <td>${r.totalPrice}</td>
              <td><Badge bg={statusColors[r.status]}>{r.status}</Badge></td>
              <td>
                <Form.Select
                  size="sm"
                  value={r.status}
                  onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  className="mb-1"
                  style={{ width: 130 }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="returned">Returned</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
                <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}><FaTrash /></Button>
              </td>
            </tr>
          ))}
          {rentals.length === 0 && <tr><td colSpan={8} className="text-center">No rentals found</td></tr>}
        </tbody>
      </Table>
    </Container>
  );
};

export default RentalManagement;
