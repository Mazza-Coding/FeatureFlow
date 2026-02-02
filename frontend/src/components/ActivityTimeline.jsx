import React from 'react';

const ActivityTimeline = ({ activities, statusChanges }) => {
  const allItems = [
    ...activities.map((a) => ({ ...a, type: 'activity' })),
    ...statusChanges.map((s) => ({ ...s, type: 'status_change', user: s.changed_by })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (allItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
        No activity recorded yet.
      </div>
    );
  }

  const getActionIcon = (item) => {
    if (item.type === 'status_change') return '→';
    switch (item.action) {
      case 'created':
        return '+';
      case 'commented':
        return '💬';
      case 'updated':
        return '✏️';
      default:
        return '•';
    }
  };

  const getActionColor = (item) => {
    if (item.type === 'status_change') return '#8b5cf6';
    switch (item.action) {
      case 'created':
        return '#10b981';
      case 'commented':
        return '#3b82f6';
      case 'updated':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {allItems.map((item, index) => (
        <div key={`${item.type}-${item.id}`} style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: getActionColor(item),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            {getActionIcon(item)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600' }}>{item.user?.username || 'Unknown'}</span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            {item.type === 'status_change' ? (
              <div>
                <p style={{ color: '#374151' }}>
                  Changed status from{' '}
                  <span className={`badge badge-${item.from_status}`}>{item.from_status.replace('_', ' ')}</span>
                  {' '}to{' '}
                  <span className={`badge badge-${item.to_status}`}>{item.to_status.replace('_', ' ')}</span>
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px', fontStyle: 'italic' }}>
                  "{item.justification}"
                </p>
              </div>
            ) : (
              <p style={{ color: '#374151' }}>{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
