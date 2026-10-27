import { Container, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { getRentals } from '../../services/api';
import useLiveQuery from '../../hooks/useLiveQuery';

const statusColors = { pending: 'warning', approved: 'success', returned: 'info', cancelled: 'danger' };

const RentalHistory = () => {
  const { data, error, loading, lastUpdated } = useLiveQuery(
    async () => {
      const res = await getRentals();
      return res.data;
    },
    { interval: 5000 }
  );

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  const rentals = data || [];

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="mb-0">My Rentals</h2>
        <small className="text-muted">
          <span className="live-dot me-2" />
          Live · updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </small>
      </div>

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
