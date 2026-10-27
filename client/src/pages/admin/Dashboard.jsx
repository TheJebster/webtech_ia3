import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaBoxes, FaUsers, FaClipboardList, FaClock, FaSyncAlt } from 'react-icons/fa';
import { getEquipment, getUsers, getRentals } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ equipment: 0, users: 0, rentals: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const [eqRes, userRes, rentalRes] = await Promise.all([
        getEquipment(),
        getUsers(),
        getRentals(),
      ]);
      setStats({
        equipment: eqRes.data.length,
        users: userRes.data.length,
        rentals: rentalRes.data.length,
        pending: rentalRes.data.filter((r) => r.status === 'pending').length,
      });
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach the API. Is the backend running on port 5000?'
          : 'Failed to load dashboard data')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  const cards = [
    { title: 'Total Equipment', value: stats.equipment, icon: <FaBoxes size={36} />, bg: 'primary' },
    { title: 'Total Users', value: stats.users, icon: <FaUsers size={36} />, bg: 'success' },
    { title: 'Total Rentals', value: stats.rentals, icon: <FaClipboardList size={36} />, bg: 'info' },
    { title: 'Pending Rentals', value: stats.pending, icon: <FaClock size={36} />, bg: 'warning' },
  ];

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Admin Dashboard</h2>
        <Button variant="outline-primary" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <FaSyncAlt className={`me-1 ${refreshing ? 'spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="g-4">
        {cards.map((card) => (
          <Col xs={12} sm={6} lg={3} key={card.title}>
            <Card className={`text-white bg-${card.bg} shadow`}>
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-uppercase mb-1">{card.title}</h6>
                  <h2 className="mb-0">{card.value}</h2>
                </div>
                <div className="opacity-50">{card.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
