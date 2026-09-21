import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import Navbar from "../components/Navbar";
import TrackOrder from "./TrackOrder";
import "./Home.css";

function Home() {
  const { addToCart } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMenu()
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Menu loading error:", error);
        setError(error.message || "Failed to load menu.");
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
    ];

    return ["All", ...uniqueCategories];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-eyebrow">WELCOME TO DAN RESTAURANT</p>

            <h1>
              Good Food.
              <br />
              <span>Good Moments.</span>
            </h1>

            <p className="hero-description">
              Delicious meals prepared with quality ingredients,
              served fresh and made for memorable moments.
            </p>

            <a href="#menu" className="hero-button">
              Explore Our Menu
            </a>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section className="menu-section" id="menu">
        <div className="menu-header">
          <p className="menu-eyebrow">OUR MENU</p>

          <h2>Discover Something Delicious</h2>

          <p className="menu-subtitle">
            Explore our selection of freshly prepared dishes.
          </p>
        </div>

        <div className="menu-controls">
          <div className="menu-search">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search for a meal..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                type="button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="menu-message">
            <p>Loading our delicious menu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="menu-message menu-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="menu-message">
            <div className="empty-menu-icon">⌕</div>

            <h3>No meals found</h3>

            <p>
              We couldn't find anything matching your search.
              Try another meal or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              View All Meals
            </button>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article className="menu-card" key={item._id}>
                <div className="menu-card-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="menu-card-image"
                  />

                  {!item.isAvailable && (
                    <span className="unavailable-badge">
                      Currently Unavailable
                    </span>
                  )}

                  {item.category && (
                    <span className="menu-card-category">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="menu-card-content">
                  <div className="menu-card-top">
                    <h3>{item.name}</h3>

                    <span className="menu-card-price">
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="menu-card-description">
                    {item.description}
                  </p>

                  <button
                    type="button"
                    className="add-to-cart-button"
                    disabled={!item.isAvailable}
                    onClick={() => handleAddToCart(item)}
                  >
                    {item.isAvailable
                      ? "+ Add to Cart"
                      : "Unavailable"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* TRACK ORDER */}
      <section
        id="track-order"
        className="track-order-section"
      >
        <TrackOrder />
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-content">
            <p className="about-eyebrow">
              ABOUT THE DEVELOPER
            </p>

            <h2>
              Built With Passion.
              <br />
              <span>Created By Daniel.</span>
            </h2>

            <p className="about-intro">
              Hi, I'm <strong>Ogunbiyi Daniel</strong>, a MERN Stack
              Developer passionate about building modern,
              functional, and user-friendly web applications.
            </p>

            <p>
              I'm currently a{" "}
              <strong>
                300-level student at Babcock University
              </strong>{" "}
              and a soon-to-be graduate of a tech academy. Dan
              Restaurant is one of my wonderful projects, built to
              demonstrate my skills in full-stack development,
              modern UI design, authentication, payments,
              real-time updates, and database management.
            </p>

            <div className="about-highlights">
              <div className="about-highlight">
                <span>01</span>

                <div>
                  <h3>MERN Stack</h3>

                  <p>
                    Building full-stack applications with modern
                    technologies.
                  </p>
                </div>
              </div>

              <div className="about-highlight">
                <span>02</span>

                <div>
                  <h3>Creative Development</h3>

                  <p>
                    Turning ideas into polished and useful digital
                    experiences.
                  </p>
                </div>
              </div>

              <div className="about-highlight">
                <span>03</span>

                <div>
                  <h3>Always Learning</h3>

                  <p>
                    Growing my skills through real-world projects
                    and technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;