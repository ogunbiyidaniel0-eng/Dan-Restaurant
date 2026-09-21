import { useEffect, useState } from "react";
import "./MenuManagement.css";
import { api } from "../../services/api";

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("main");
  const [isAvailable, setIsAvailable] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [loading, setLoading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoadingMenu(true);

        const data = await api.getMenu();

        setMenuItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingMenu(false);
      }
    };

    loadMenuItems();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage("");
    setCategory("main");
    setIsAvailable(true);
    setEditingItem(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem._id, {
          name,
          description,
          price: Number(price),
          image,
          category,
          isAvailable,
        });
      } else {
        await api.createMenuItem({
          name,
          description,
          price: Number(price),
          image,
          category,
          isAvailable,
        });
      }

      const updatedMenu = await api.getMenu();

      setMenuItems(updatedMenu);

      resetForm();
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);

    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setImage(item.image || "");
    setCategory(item.category);
    setIsAvailable(item.isAvailable);

    setError("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.deleteMenuItem(id);

      const updatedMenu = await api.getMenu();

      setMenuItems(updatedMenu);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      setError("");

      await api.toggleMenuAvailability(id);

      const updatedMenu = await api.getMenu();

      setMenuItems(updatedMenu);
    } catch (error) {
      setError(error.message);
    }
  };

  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter(
          (item) => item.category === selectedCategory
        );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">DAN RESTAURANT</p>

          <h1>Menu Management</h1>

          <p className="admin-page-subtitle">
            Manage your restaurant meals and availability.
          </p>
        </div>

        <button
          type="button"
          className="add-menu-button"
          onClick={() => {
            resetForm();
            setError("");
            setShowForm(true);
          }}
        >
          + Add Menu Item
        </button>
      </header>

      {showForm && (
        <section className="menu-form-card">
          <div className="menu-form-header">
            <div>
              <p className="admin-eyebrow">MENU</p>

              <h2>
                {editingItem
                  ? "Edit Menu Item"
                  : "Add Menu Item"}
              </h2>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              ×
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleSubmit} className="menu-form">
            <div className="form-group">
              <label htmlFor="name">Item Name</label>

              <input
                type="text"
                id="name"
                placeholder="e.g. Jollof Rice & Chicken"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                placeholder="Describe the meal..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                required
              />
            </div>

            <div className="menu-form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₦)</label>

                <input
                  type="number"
                  id="price"
                  placeholder="5000"
                  min="0"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  <option value="starters">Starters</option>
                  <option value="main">Main Course</option>
                  <option value="desserts">Desserts</option>
                  <option value="drinks">Drinks</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL</label>

              <input
                type="url"
                id="image"
                placeholder="https://example.com/food.jpg"
                value={image}
                onChange={(event) => setImage(event.target.value)}
              />
            </div>

            <label className="availability-checkbox">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(event) =>
                  setIsAvailable(event.target.checked)
                }
              />

              <span>Available for customers</span>
            </label>

            <div className="menu-form-actions">
              <button
                type="button"
                className="cancel-menu-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-menu-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingItem
                  ? "Update Menu Item"
                  : "Save Menu Item"}
              </button>
            </div>
          </form>
        </section>
      )}

      {!showForm && (
        <>
          <section className="menu-toolbar">
            <div className="menu-search">
              <input
                type="text"
                placeholder="Search menu items..."
              />
            </div>

            <select
              className="menu-filter"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              <option value="all">All Categories</option>
              <option value="starters">Starters</option>
              <option value="main">Main Course</option>
              <option value="desserts">Desserts</option>
              <option value="drinks">Drinks</option>
            </select>
          </section>

          <section className="menu-items-grid">
            {loadingMenu ? (
              <div className="menu-empty-state">
                <h2>Loading menu...</h2>
              </div>
            ) : error ? (
              <div className="menu-empty-state">
                <h2>Unable to load menu</h2>
                <p>{error}</p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="menu-empty-state">
                <div className="menu-empty-icon">🍽️</div>

                <h2>No menu items in this category</h2>

                <p>
                  There are currently no menu items in this category.
                </p>
              </div>
            ) : (
              filteredMenuItems.map((item) => (
                <article
                  className="menu-item-card"
                  key={item._id}
                >
                  <div className="menu-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>

                  <div className="menu-item-info">
                    <div className="menu-item-top">
                      <span className="menu-item-category">
                        {item.category}
                      </span>

                      <span
                        className={
                          item.isAvailable
                            ? "menu-status available"
                            : "menu-status unavailable"
                        }
                      >
                        {item.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <h3>{item.name}</h3>

                    <p>{item.description}</p>

                    <strong className="menu-item-price">
                      ₦{Number(item.price).toLocaleString()}
                    </strong>

                    <div className="menu-item-actions">
                      <button
                        type="button"
                        className="edit-menu-button"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-menu-button"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>

                    <button
                      type="button"
                      className={
                        item.isAvailable
                          ? "availability-toggle available-toggle"
                          : "availability-toggle unavailable-toggle"
                      }
                      onClick={() =>
                        handleToggleAvailability(item._id)
                      }
                    >
                      {item.isAvailable
                        ? "Mark as Unavailable"
                        : "Mark as Available"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default MenuManagement;