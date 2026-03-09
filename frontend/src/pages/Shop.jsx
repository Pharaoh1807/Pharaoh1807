import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import pagesStyles from "../styles/pagesStyles"

export default function Shop() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProducts().then(setProducts)
  }, [])

  const viewProduct = (productId) => {
    nav(`/products/${productId}`);
  };

  // Style for product images to ensure uniform size in the grid
  const productImageStyle = {
    ...(pagesStyles.productImage || {}), // Kế thừa style gốc
    height: '220px', // Đặt chiều cao cố định
    objectFit: 'cover', // Đảm bảo ảnh vừa khung mà không bị méo
  };

  return (
    <div style={pagesStyles.container}>
      <h2 style={pagesStyles.header}>Products</h2>
      <div style={pagesStyles.grid}>
        {Array.isArray(products) && products.map(p => (
          <div 
            key={p._id} 
            style={{...pagesStyles.productCard, cursor: 'pointer'}} 
            onClick={() => viewProduct(p._id)}
          >
            {p.imageUrls && p.imageUrls.length > 0 ? <img src={p.imageUrls[0]} alt={p.name} style={productImageStyle} /> : null}
            {/* Hiển thị ảnh mặc định nếu không có ảnh */}
            
            <h3 style={pagesStyles.productName}>{p.name}</h3>
            <p style={pagesStyles.productDescription}>{p.description}</p>
            <strong style={pagesStyles.productPrice}>
              {p.priceCents.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </strong>
          </div>
        ))}
      </div>

    </div>
  )
};