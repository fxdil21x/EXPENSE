import { useState } from 'react';
import type { Category } from '../types';
import { paletteFor } from '../lib/palette';

export function CategoryManager({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categories: Category[];
  onAdd: (name: string, icon: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await onAdd(name, icon || '🏷️');
      setName('');
      setIcon('🏷️');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this category.');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const commitEdit = async (id: string) => {
    if (editName.trim()) {
      await onUpdate(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <article className="panel-card">
      <button type="button" className="panel-header panel-header-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <div>
          <p className="eyebrow">Categories</p>
          <h2>Manage heads {!expanded && <span className="panel-header-count">({categories.length})</span>}</h2>
        </div>
        <svg
          className={`chevron ${expanded ? 'chevron-open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <>
          <form className="category-form" onSubmit={handleAdd}>
            <input
              className="form-input icon-input"
              type="text"
              maxLength={2}
              placeholder="🏷️"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              aria-label="Category icon (emoji)"
            />
            <input
              className="form-input"
              type="text"
              placeholder="New category, e.g. Travel"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Category name"
            />
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Add
            </button>
          </form>

          {error && <p className="auth-error" style={{ marginTop: -12, marginBottom: 16 }}>{error}</p>}

          <div className="category-list">
            {categories.length === 0 && <p className="empty-description">No categories yet — add your first one above.</p>}
            {categories.map((category) => {
              const colors = paletteFor(category.colorIndex);
              return (
                <div key={category.id} className="category-item">
                  <div className="category-info">
                    <div className="category-icon" style={{ background: colors.bg }}>
                      {category.icon}
                    </div>
                    {editingId === category.id ? (
                      <input
                        className="form-input inline-edit-input"
                        value={editName}
                        autoFocus
                        onChange={(event) => setEditName(event.target.value)}
                        onBlur={() => commitEdit(category.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') commitEdit(category.id);
                          if (event.key === 'Escape') setEditingId(null);
                        }}
                      />
                    ) : (
                      <span className="category-name">{category.name}</span>
                    )}
                  </div>
                  <div className="expense-actions">
                    <button type="button" className="btn-icon" onClick={() => startEdit(category)} aria-label={`Rename ${category.name}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => {
                        if (confirm(`Delete category "${category.name}"? Existing expenses keep their history.`)) {
                          onDelete(category.id);
                        }
                      }}
                      aria-label={`Delete ${category.name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </article>
  );
}
