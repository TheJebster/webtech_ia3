import { useState, useEffect } from 'react';
import {
  Container, Table, Button, Modal, Form, Alert, Spinner, Badge,
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const data = { name: form.name, email: form.email, role: form.role };
        if (form.password) data.password = form.password;
        await updateUser(editing, data);
      } else {
        await createUser(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser._id) {
      setError('Cannot delete your own account');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>User Management</h2>
        <Button variant="primary" onClick={openAdd}><FaPlus className="me-1" /> Add User</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>{u.role}</Badge></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <Button size="sm" variant="warning" className="me-1" onClick={() => openEdit(u)}><FaEdit /></Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(u._id)} disabled={u._id === currentUser._id}><FaTrash /></Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={5} className="text-center">No users found</td></tr>}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{editing ? 'Password (leave blank to keep current)' : 'Password'}</Form.Label>
              <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} minLength={6} placeholder={editing ? 'Leave blank to keep current' : 'At least 6 characters'} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
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

export default UserManagement;
