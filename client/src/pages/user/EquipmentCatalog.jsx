import { useState } from 'react';
import {
  Container, Row, Col, Card, Badge, Spinner, Alert, InputGroup, FormControl, Form,
} from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEquipment } from '../../services/api';
import useLiveQuery from '../../hooks/useLiveQuery';

const CATEGORIES = ['Audio', 'Lighting', 'Furniture', 'Structures', 'Visual', 'Decor'];
const categoryEmojis = { Audio: '🔊', Lighting: '💡', Furniture: '🪑', Structures: '⛺', Visual: '📽', Decor: '🎉' };

const EquipmentCatalog = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const navigate = useNavigate();

  const { data, error, loading, lastUpdated } = useLiveQuery(
    async () => {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      const res = await getEquipment(params);
      return res.data;
    },
    { interval: 5000, deps: [search, catFilter] }
  );

  const equipment = data || [];

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="mb-0">Equipment Catalog</h2>
        <small className="text-muted">
          <span className="live-dot me-2" />
          Live · updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </small>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <InputGroup style={{ maxWidth: 300 }}>
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <FormControl
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Form.Select style={{ maxWidth: 180 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryEmojis[c]} {c}</option>
          ))}
        </Form.Select>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : equipment.length === 0 ? (
        <Alert variant="info">No equipment found matching your criteria.</Alert>
      ) : (
        <Row className="g-4">
          {equipment.map((item) => (
            <Col xs={12} sm={6} lg={4} key={item._id}>
              <Card
                className="h-100 shadow-sm hover-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/equipment/${item._id}`)}
              >
                {item.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{item.name}</Card.Title>
                    <Badge bg="secondary">{categoryEmojis[item.category]} {item.category}</Badge>
                  </div>
                  <Card.Text className="text-muted">
                    {item.description.length > 100
                      ? item.description.substring(0, 100) + '...'
                      : item.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-bold text-primary fs-5">${item.pricePerDay}/day</span>
                    <span className={item.available && item.quantity > 0 ? 'text-muted' : 'text-danger'}>
                      {item.available && item.quantity > 0
                        ? `${item.quantity} available`
                        : 'Unavailable'}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default EquipmentCatalog;
