import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getSocket } from '../api';

export default function AdminDash() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  const fetchDash = useCallback(async () => {
    try {
      const { data: res } = await api.get('/admin/dashboard');
      setData(res);
    } catch (err) {
      if (err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDash();
  }, [fetchDash]);

  // Real-time updates via socket
  useEffect(() => {
    if (!user?.officeId) return;
    const socket = getSocket();
    socket.emit('join_admin', user.officeId);
    socket.on('dashboard_update', fetchDash);
    socket.on('queue_update', fetchDash);
    return () => {
      socket.off('dashboard_update', fetchDash);
      socket.off('queue_update', fetchDash);
    };
  }, [user?.officeId, fetchDash]);

  const callNext = async () => {
    setCalling(true);
    try {
      await api.post('/admin/call-next');
      await fetchDash();
    } catch (err) {
      alert(err.response?.data?.message || 'Error calling next');
    } finally {
      setCalling(false);
    }
  };

  const markNoShow = async (tokenId) => {
    try {
      await api.patch(`/admin/token/${tokenId}/no-show`);
      await fetchDash();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const toggleOffice = async () => {
    try {
      await api.patch('/admin/office/toggle');
      await fetchDash();
    } catch (err) {
      alert('Error toggling office status');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data)   return <div className="loading">No data</div>;

  const { office, stats, queue } = data;
  const servingToken = queue.find((t) => t.status === 'serving');
  const waitingQueue = queue.filter((t) => t.status === 'waiting');

  return (
    <div className="app-shell">
      <div className="screen">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2>Admin Panel</h2>
            <p style={{ color: '#5A8A93', fontSize: 11, marginTop: 3 }}>{office.name}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: office.isOpen ? '#02C39A' : '#F0544F' }} className={office.isOpen ? 'pulse' : ''} />
              <span style={{ color: office.isOpen ? '#02C39A' : '#F0544F', fontSize: 11 }}>
                {office.isOpen ? 'Office Open' : 'Office Closed'}
              </span>
              <button
                onClick={toggleOffice}
                style={{ background: 'none', border: '1px solid #5A8A93', color: '#5A8A93', fontSize: 10, padding: '2px 8px', borderRadius: 6, cursor: 'pointer', marginLeft: 6 }}
              >
                Toggle
              </button>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#5A8A93', fontSize: 12, cursor: 'pointer' }}>Logout</button>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#02C39A', fontSize: 26, fontWeight: 700 }}>{office.currentToken}</p>
            <p style={{ color: '#5A8A93', fontSize: 10, marginTop: 2 }}>Now serving</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>{stats.waiting}</p>
            <p style={{ color: '#5A8A93', fontSize: 10, marginTop: 2 }}>In queue</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>{stats.done}</p>
            <p style={{ color: '#5A8A93', fontSize: 10, marginTop: 2 }}>Served today</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#F0544F', fontSize: 26, fontWeight: 700 }}>{stats.noShow}</p>
            <p style={{ color: '#5A8A93', fontSize: 10, marginTop: 2 }}>No-shows</p>
          </div>
        </div>

        {/* Currently serving */}
        {servingToken && (
          <div style={{ background: '#0f4a3c', border: '1.5px solid #02C39A', borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <p style={{ color: '#5A8A93', fontSize: 10, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Currently serving</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#02C39A', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>
                  #{String(servingToken.tokenNumber).padStart(3, '0')}
                </p>
                <p style={{ color: '#fff', fontSize: 13, marginTop: 2 }}>{servingToken.user?.name}</p>
                <p style={{ color: '#5A8A93', fontSize: 11 }}>{servingToken.service}</p>
              </div>
              <button
                onClick={() => markNoShow(servingToken._id)}
                style={{ background: 'none', border: '1px solid #F0544F', color: '#F0544F', fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}
              >
                No-show
              </button>
            </div>
          </div>
        )}

        {/* Call next button */}
        <button className="btn-primary" onClick={callNext} disabled={calling || stats.waiting === 0} style={{ marginBottom: 16, fontSize: 15 }}>
          {calling ? 'Calling...' : `Call Next Token →`}
        </button>

        {/* Queue list */}
        <p className="section-label">Queue ({stats.waiting} waiting)</p>
        {waitingQueue.length === 0 && (
          <p style={{ color: '#5A8A93', fontSize: 13, textAlign: 'center', marginTop: 12 }}>Queue is empty</p>
        )}
        {waitingQueue.slice(0, 10).map((t, idx) => (
          <div key={t._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ color: idx === 0 ? '#02C39A' : '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'monospace', minWidth: 40 }}>
                #{String(t.tokenNumber).padStart(3, '0')}
              </p>
              <div>
                <p style={{ color: '#fff', fontSize: 12 }}>{t.user?.name || 'Citizen'}</p>
                <p style={{ color: '#5A8A93', fontSize: 10, marginTop: 2 }}>{t.service}</p>
              </div>
            </div>
            <span className="badge badge-waiting">{idx === 0 ? 'Next' : `#${idx + 1}`}</span>
          </div>
        ))}

        {stats.avgServiceMin > 0 && (
          <p style={{ color: '#5A8A93', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
            Avg service time today: {stats.avgServiceMin} min/person
          </p>
        )}
      </div>
    </div>
  );
}
