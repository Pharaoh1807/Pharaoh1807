import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import pagesStyles from "../styles/pagesStyles"

export default function Shop() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Mảng chứa thông tin banner. Bạn có thể thay đổi link hình hoặc link bài viết ở đây
  const banners = [
    {
      imageUrl: "https://asset.imagine.art/processed/c2e03d3c-d5b3-45f2-ac64-1ac05b52eaa9",
      linkUrl: "#" // Thay "#" bằng link đến sự kiện/sản phẩm
    },
    {
      imageUrl: "https://placehold.co/1200x400/4a5568/ffffff?text=Banner+Shop+2",
      linkUrl: "#"
    },
    {
      imageUrl: "https://placehold.co/1200x400/2b6cb0/ffffff?text=Banner+Shop+3",
      linkUrl: "#"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    api.getProducts().then(setProducts)
  }, [])

  const viewProduct = (productId) => {
    nav(`/products/${productId}`);
  };

  // Style for product images to ensure uniform size in the grid
  const productImageStyle = {
    ...(pagesStyles.productImage || {}), // Kế thừa style gốc
    height: '100%', // Sửa thành 100% để container kiểm soát height
    width: '100%',
    objectFit: 'cover', // Đảm bảo ảnh vừa khung mà không bị méo
    marginBottom: 0, // Bỏ margin để container gắn margin
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div style={pagesStyles.container}>

      {/* Banner Section */}
      <div style={{
        width: '100%',
        height: 'clamp(200px, 40vw, 400px)',
        marginBottom: '2rem',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {banners.map((banner, index) => (
          <a
            key={index}
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentBannerIndex === index ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: currentBannerIndex === index ? 1 : 0
            }}
          >
            <img
              src={banner.imageUrl}
              alt={`Banner ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </a>
        ))}
        {/* Banner navigation dots */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: currentBannerIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <h2 style={pagesStyles.header}>Products</h2>

      {/* Bộ lọc tên sản phẩm */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Tìm sản phẩm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #4a5568',
            backgroundColor: '#1a202c',
            color: '#fff',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={pagesStyles.grid}>
        {filteredProducts.map(p => (
          <div
            key={p._id}
            style={{ ...pagesStyles.productCard, cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => viewProduct(p._id)}
            onMouseEnter={() => setHoveredProductId(p._id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            {p.imageUrls && p.imageUrls.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: '220px', marginBottom: '1rem', borderRadius: '6px', overflow: 'hidden' }}>
                <img
                  src={p.imageUrls[0]}
                  alt={p.name}
                  style={{
                    ...productImageStyle,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: hoveredProductId === p._id && p.imageUrls.length > 1 ? 0 : 1,
                    transition: 'all 0.4s ease-in-out',
                    transform: hoveredProductId === p._id && p.imageUrls.length > 1 ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                {p.imageUrls.length > 1 && (
                  <img
                    src={p.imageUrls[1]}
                    alt={`${p.name} hover`}
                    style={{
                      ...productImageStyle,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: hoveredProductId === p._id ? 1 : 0,
                      transition: 'all 0.4s ease-in-out',
                      transform: hoveredProductId === p._id ? 'scale(1)' : 'scale(1.05)'
                    }}
                  />
                )}
              </div>
            ) : null}
            {/* Hiển thị ảnh mặc định nếu không có ảnh */}

            <h3 style={pagesStyles.productName}>{p.name}</h3>
            <p style={pagesStyles.productDescription}>{p.description}</p>
            <strong style={pagesStyles.productPrice}>
              {p.priceCents.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </strong>

            {/* Thêm 2 hình ảnh nhỏ của sản phẩm ngay dưới giá */}
            {p.imageUrls && p.imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                {p.imageUrls.slice(0, 2).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${p.name} thumbnail ${index + 1}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #4a5568'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
};