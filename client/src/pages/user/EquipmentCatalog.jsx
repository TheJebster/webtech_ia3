import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Spinner, Alert, InputGroup, FormControl, Form,
} from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEquipment } from '../../services/api';

const CATEGORIES = ['Audio', 'Lighting', 'Furniture', 'Structures', 'Visual', 'Decor'];
const categoryEmojis = { Audio: '🔊', Lighting: '💡', Furniture: '🪑', Structures: '⛺', Visual: '📽', Decor: '🎉' };

const EquipmentCatalog = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (catFilter) params.category = catFilter;
        const res = await getEquipment(params);
        setEquipment(res.data);
      } catch {
        setError('Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, catFilter]);

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Equipment Catalog</h2>

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
                <Card.Body>
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
                    <span className="text-muted">{item.quantity} available</span>
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
