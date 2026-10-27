import { useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import {
  FaBoxes, FaUsers, FaClipboardList, FaClock, FaSyncAlt, FaDollarSign,
} from 'react-icons/fa';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { getEquipment, getUsers, getRentals, getRentalStats } from '../../services/api';
import useLiveQuery from '../../hooks/useLiveQuery';

const STATUS_COLORS = {
  pending: '#ffc107',
  approved: '#198754',
  returned: '#0dcaf0',
  cancelled: '#dc3545',
};

const Dashboard = () => {
  const fetcher = useCallback(async () => {
    const [eqRes, userRes, rentalRes, statsRes] = await Promise.all([
      getEquipment(),
      getUsers(),
      getRentals(),
      getRentalStats(),
    ]);
    return {
      equipment: eqRes.data.length,
      users: userRes.data.length,
      rentals: rentalRes.data.length,
      pending: rentalRes.data.filter((r) => r.status === 'pending').length,
      stats: statsRes.data,
    };
  }, []);

  const { data, error, loading, lastUpdated, refresh } = useLiveQuery(fetcher, { interval: 5000 });

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  const stats = data?.stats || { totals: {}, byStatus: [], revenueByCategory: [], monthly: [] };
  const revenue = stats.totals?.revenue || 0;

  const statCards = [
    { title: 'Total Equipment', value: data?.equipment ?? 0, icon: <FaBoxes size={32} />, bg: 'primary' },
    { title: 'Total Users', value: data?.users ?? 0, icon: <FaUsers size={32} />, bg: 'success' },
    { title: 'Total Rentals', value: data?.rentals ?? 0, icon: <FaClipboardList size={32} />, bg: 'info' },
    { title: 'Pending Rentals', value: data?.pending ?? 0, icon: <FaClock size={32} />, bg: 'warning' },
  ];

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-0">Admin Dashboard</h2>
          <small className="text-muted">
            <span className="live-dot me-2" />
            Live · updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </small>
        </div>
        <Button variant="outline-primary" size="sm" onClick={() => refresh({ silent: true })}>
          <FaSyncAlt className="me-1" /> Refresh
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-3">
        {statCards.map((card) => (
          <Col xs={12} sm={6} lg={3} key={card.title}>
            <Card className={`text-white bg-${card.bg} shadow-sm`}>
              <Card.Body className="d-flex align-items-center justify-content-between py-3">
                <div>
                  <h6 className="text-uppercase mb-1 small">{card.title}</h6>
                  <h3 className="mb-0">{card.value}</h3>
                </div>
                <div className="opacity-50">{card.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="text-white bg-dark shadow-sm mb-4">
        <Card.Body className="d-flex align-items-center justify-content-between py-3">
          <div>
            <h6 className="text-uppercase mb-1 small">Revenue (approved + returned)</h6>
            <h3 className="mb-0">${revenue.toLocaleString()}</h3>
          </div>
          <div className="opacity-50"><FaDollarSign size={32} /></div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h6 className="mb-3">Revenue by Category</h6>
              {stats.revenueByCategory.length === 0 ? (
                <p className="text-muted">No approved rentals yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.revenueByCategory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h6 className="mb-3">Rentals by Status</h6>
              {stats.byStatus.length === 0 ? (
                <p className="text-muted">No rentals yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.byStatus}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {stats.byStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6c757d'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Bookings Over Time</h6>
              {stats.monthly.length === 0 ? (
                <p className="text-muted">No rental history yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#198754" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
