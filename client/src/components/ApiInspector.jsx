import { useEffect, useState } from 'react';
import { Badge, Button, Offcanvas, Form } from 'react-bootstrap';
import { FaCode, FaTrash } from 'react-icons/fa';
import { subscribe, clearLogs } from '../services/apiLog';

const methodColor = {
  GET: 'primary',
  POST: 'success',
  PUT: 'warning',
  DELETE: 'danger',
};

const statusColor = (status) => {
  if (status === 'ERR') return 'danger';
  if (status >= 500) return 'danger';
  if (status >= 400) return 'warning';
  return 'success';
};

const pretty = (value) => {
  if (value === undefined) return '';
  try {
    const text = JSON.stringify(value, null, 2);
    return text.length > 800 ? text.slice(0, 800) + '\n…' : text;
  } catch {
    return String(value);
  }
};

const ApiInspector = () => {
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [mutationsOnly, setMutationsOnly] = useState(false);

  useEffect(() => subscribe(setEntries), []);

  const visible = mutationsOnly
    ? entries.filter((e) => e.method !== 'GET')
    : entries;

  return (
    <>
      <Button
        variant="dark"
        size="sm"
        className="api-inspector-toggle"
        onClick={() => setOpen(true)}
        title="Show live API traffic"
      >
        <FaCode className="me-1" />
        API
        {entries.length > 0 && (
          <Badge bg="info" pill className="ms-2">{entries.length}</Badge>
        )}
      </Button>

      <Offcanvas
        show={open}
        onHide={() => setOpen(false)}
        placement="end"
        style={{ width: 460 }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <FaCode className="me-2" />
            Live API Traffic
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <Form.Check
              type="switch"
              id="mutations-only"
              label={<small>Writes only</small>}
              checked={mutationsOnly}
              onChange={(e) => setMutationsOnly(e.target.checked)}
            />
            <Button variant="outline-secondary" size="sm" onClick={clearLogs}>
              <FaTrash className="me-1" /> Clear
            </Button>
          </div>

          {visible.length === 0 ? (
            <p className="text-muted text-center mt-4 px-3">
              No requests yet. Interact with the app and they will appear here.
            </p>
          ) : (
            <div className="api-log">
              {visible.map((entry) => (
                <div
                  key={entry.id}
                  className={`api-log-entry ${entry.failed ? 'is-failed' : ''}`}
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Badge bg={methodColor[entry.method] || 'secondary'}>
                      {entry.method}
                    </Badge>
                    <Badge bg={statusColor(entry.status)}>{entry.status}</Badge>
                    <span className="api-log-url text-truncate">{entry.url}</span>
                    <span className="ms-auto text-muted small">{entry.duration}ms</span>
                  </div>

                  {expanded === entry.id && (
                    <div className="mt-2">
                      {entry.request !== undefined && (
                        <>
                          <div className="api-log-label">Request</div>
                          <pre className="api-log-json">{pretty(entry.request)}</pre>
                        </>
                      )}
                      <div className="api-log-label">Response</div>
                      <pre className="api-log-json">{pretty(entry.response)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ApiInspector;
