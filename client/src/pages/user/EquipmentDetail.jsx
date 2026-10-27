import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { getEquipmentById, createRental } from '../../services/api';

const categoryEmojis = { Audio: '🔊', Lighting: '💡', Furniture: '🪑', Structures: '⛺', Visual: '📽', Decor: '🎉' };

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rentalForm, setRentalForm] = useState({ eventName: '', startDate: '', endDate: '', quantity: 1 });
  const [rentalError, setRentalError] = useState('');
  const [rentalSuccess, setRentalSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEquipmentById(id);
        setEquipment(res.data);
      } catch {
        setError('Equipment not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const calcTotal = () => {
    if (!rentalForm.startDate || !rentalForm.endDate || !equipment) return 0;
    const days = Math.ceil(
      (new Date(rentalForm.endDate) - new Date(rentalForm.startDate)) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return 0;
    return rentalForm.quantity * equipment.pricePerDay * days;
  };

  const handleRent = async () => {
    setRentalError('');
    setRentalSuccess('');

    if (!rentalForm.eventName || !rentalForm.startDate || !rentalForm.endDate) {
      setRentalError('Please fill in all fields');
      return;
    }

    if (new Date(rentalForm.endDate) <= new Date(rentalForm.startDate)) {
      setRentalError('End date must be after start date');
      return;
    }

    setSaving(true);
    try {
      await createRental({
        equipment: id,
        eventName: rentalForm.eventName,
        startDate: rentalForm.startDate,
        endDate: rentalForm.endDate,
        quantity: rentalForm.quantity,
      });
      setRentalSuccess('Rental request submitted successfully!');
      setRentalForm({ eventName: '', startDate: '', endDate: '', quantity: 1 });
      // Refresh so the UI reflects the latest stock from the database.
      const refreshed = await getEquipmentById(id);
      setEquipment(refreshed.data);
      setTimeout(() => {
        setShowModal(false);
        setRentalSuccess('');
      }, 1500);
    } catch (err) {
      setRentalError(err.response?.data?.message || 'Failed to submit rental');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!equipment) return null;

  return (
    <Container className="mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-1" /> Back
      </Button>

      <Row className="g-4">
        <Col md={5}>
          {equipment.imageUrl ? (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="img-fluid rounded shadow"
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
            />
          ) : (
            <div className="bg-light rounded d-flex align-items-center justify-content-center shadow" style={{ height: 300 }}>
              <span className="display-1">{categoryEmojis[equipment.category] || '📦'}</span>
            </div>
          )}
        </Col>
        <Col md={7}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h2 className="mb-0">{equipment.name}</h2>
            <Badge bg="secondary">{equipment.category}</Badge>
          </div>
          <p className="text-muted mt-3">{equipment.description}</p>
          <Card className="mt-3">
            <Card.Body>
              <Row>
                <Col xs={4} className="text-center">
                  <div className="text-muted small">Price/Day</div>
                  <div className="fw-bold fs-4 text-primary">${equipment.pricePerDay}</div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="text-muted small">Available Qty</div>
                  <div className="fw-bold fs-4">{equipment.quantity}</div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="text-muted small">Status</div>
                  <Badge bg={equipment.available && equipment.quantity > 0 ? 'success' : 'danger'} className="fs-6">
                    {equipment.available && equipment.quantity > 0 ? 'Available' : 'Unavailable'}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          {equipment.available && equipment.quantity > 0 && (
            <Button variant="primary" size="lg" className="mt-3 w-100" onClick={() => setShowModal(true)}>
              <FaCalendarAlt className="me-2" /> Rent This Equipment
            </Button>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => { setShowModal(false); setRentalError(''); setRentalSuccess(''); }}>
        <Modal.Header closeButton>
          <Modal.Title>Rent: {equipment.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rentalError && <Alert variant="danger">{rentalError}</Alert>}
          {rentalSuccess && <Alert variant="success">{rentalSuccess}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                value={rentalForm.eventName}
                onChange={(e) => setRentalForm({ ...rentalForm, eventName: e.target.value })}
                placeholder="e.g. Annual Company Gala"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={rentalForm.startDate}
                onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={rentalForm.endDate}
                onChange={(e) => setRentalForm({ ...rentalForm, endDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={equipment.quantity}
                value={rentalForm.quantity}
                onChange={(e) => setRentalForm({ ...rentalForm, quantity: Number(e.target.value) })}
              />
            </Form.Group>
            <div className="bg-light rounded p-3 text-center">
              <span className="text-muted">Estimated Total: </span>
              <span className="fw-bold fs-4 text-primary">${calcTotal()}</span>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleRent} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : 'Submit Rental Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EquipmentDetail;
