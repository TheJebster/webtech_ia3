import { useState } from 'react';
import {
  Container, Table, Button, Modal, Form, Alert, Spinner, Badge, InputGroup, FormControl,
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import {
  getEquipment, createEquipment, updateEquipment, deleteEquipment,
} from '../../services/api';
import useLiveQuery from '../../hooks/useLiveQuery';

const CATEGORIES = ['Audio', 'Lighting', 'Furniture', 'Structures', 'Visual', 'Decor'];
const emptyForm = { name: '', category: 'Audio', description: '', quantity: 1, pricePerDay: 0, imageUrl: '', available: true };

const EquipmentManagement = () => {
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const { data, loading, lastUpdated, refresh } = useLiveQuery(
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

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item._id);
    setForm({
      name: item.name, category: item.category, description: item.description,
      quantity: item.quantity, pricePerDay: item.pricePerDay,
      imageUrl: item.imageUrl || '', available: item.available,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateEquipment(editing, form);
      } else {
        await createEquipment(form);
      }
      setShowModal(false);
      refresh({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await deleteEquipment(id);
      refresh({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete equipment');
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0">Equipment Management</h2>
          <small className="text-muted">
            <span className="live-dot me-2" />
            Live · updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </small>
        </div>
        <Button variant="primary" onClick={openAdd}><FaPlus className="me-1" /> Add Equipment</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="d-flex gap-2 mb-3">
        <InputGroup style={{ maxWidth: 300 }}>
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <FormControl placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
        <Form.Select style={{ maxWidth: 180 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Form.Select>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Image</th><th>Name</th><th>Category</th><th>Price/Day</th><th>Qty</th><th>Available</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item._id}>
              <td>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <span className="text-muted small">—</span>
                )}
              </td>
              <td>{item.name}</td>
              <td><Badge bg="secondary">{item.category}</Badge></td>
              <td>${item.pricePerDay}</td>
              <td>{item.quantity}</td>
              <td><Badge bg={item.available ? 'success' : 'danger'}>{item.available ? 'Yes' : 'No'}</Badge></td>
              <td>
                <Button size="sm" variant="warning" className="me-1" onClick={() => openEdit(item)}><FaEdit /></Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(item._id)}><FaTrash /></Button>
              </td>
            </tr>
          ))}
          {equipment.length === 0 && <tr><td colSpan={7} className="text-center">No equipment found</td></tr>}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Equipment' : 'Add Equipment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price Per Day ($)</Form.Label>
              <Form.Control type="number" min={0} value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Optional" />
            </Form.Group>
            <Form.Check type="checkbox" label="Available" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EquipmentManagement;
