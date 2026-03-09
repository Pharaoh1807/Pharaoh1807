import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import pagesStyles from '../styles/pagesStyles'; // Reusing styles
import toast from 'react-hot-toast';


export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ref for handling image drag/swipe
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
  });

  useEffect(() => {
    // Reset state when ID changes
    setLoading(true);
    setProduct(null);
    setRelatedProducts([]);
    setCurrentIndex(0); // Reset selected image index

    // Fetch the main product
    api.getProductById(id)
      .then(fetchedProduct => {
        setProduct(fetchedProduct);
        if (!fetchedProduct.imageUrls || fetchedProduct.imageUrls.length === 0) {
          // Handle case with no images if necessary
        }
      })
      .catch(err => {
        console.error("Failed to fetch product:", err);
        alert("Product not found or an error occurred.");
        navigate('/');
      })
      .finally(() => setLoading(false));

    // Fetch all products for "related products" section
    api.getProducts()
      .then(allProducts => {
        // Filter out the current product and take a few others
        const related = allProducts
          .filter(p => p._id !== id)
          .slice(0, 4); // Show up to 4 related products
        setRelatedProducts(related);
      })
      .catch(err => console.error("Failed to fetch related products:", err));
  }, [id, navigate]);

  const buy = async (p) => {
    const userToken = localStorage.getItem('user_token'); // Lấy token trực tiếp

    if (!userToken) {
      // Nếu chưa đăng nhập, chuyển hướng đến trang login
      // và lưu lại trang hiện tại để quay về sau khi login thành công
      alert('Vui lòng đăng nhập để mua hàng.');
      navigate('/user/login', { state: { from: location } });
      return;
    }
    const finalQuantity = quantity > 0 ? quantity : 1;

    try {
      setBusy(true);
      const data = await api.generateVietQR(p._id, finalQuantity, userToken); // Sử dụng token và số lượng
      if (data && data.qrDataURL) {
        navigate('/payment', { state: { qrCodeData: data } });
      } else {
        alert('Can not generate QR code. Please try again later.');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const decreaseQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  const increaseQuantity = () => {
    if (quantity >= product.stock) {
      toast.error('Maximum stock limit reached!', {
        id: 'stock-limit-toast' // ID này ngăn các toast giống nhau chồng chất lên nhau
      });
      return;
    }
    setQuantity(q => q + 1);
  };


  // --- Image Gallery Navigation ---
  const showNextImage = () => {
    if (!product || product.imageUrls.length <= 1) return;
    // Prevent moving past the last image
    if (currentIndex < product.imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const showPrevImage = () => {
    if (!product || product.imageUrls.length <= 1) return;
    // Prevent moving before the first image
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Event Handlers for Drag/Swipe
  const handleDragStart = (e) => {
    e.preventDefault(); // Prevent default image drag behavior
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX || e.touches[0].clientX;
  };

  const handleDragEnd = (e) => {
    if (!dragRef.current.isDragging) return;

    // Use changedTouches for touch events, fall back to clientX for mouse
    const endX = e.clientX !== undefined ? e.clientX : e.changedTouches[0].clientX;
    const deltaX = endX - dragRef.current.startX;
    const swipeThreshold = 50; // Minimum pixels to be considered a swipe

    if (deltaX > swipeThreshold) {
      showPrevImage();
    } else if (deltaX < -swipeThreshold) {
      showNextImage();
    }

    // Reset drag state
    dragRef.current.isDragging = false;
    dragRef.current.startX = 0;
  };

  const handleMouseLeave = () => {
    // Cancel drag if mouse leaves the container
    dragRef.current.isDragging = false;
  };

  if (loading) {
    return <div style={pagesStyles.container}>Loading...</div>;
  }

  if (!product) {
    return <div style={pagesStyles.container}>Product not found.</div>;
  }

  // Style cho trang chi tiết
  const detailStyles = {
    container: { ...pagesStyles.container, maxWidth: '960px', margin: '0 auto' },
    backButton: { ...pagesStyles.buyButton, backgroundColor: '#6c757d', marginBottom: '2rem', display: 'inline-block', textDecoration: 'none' },
    content: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
    imageContainer: {
      flex: '1 1 400px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative', // For positioning arrows
      userSelect: 'none', // Prevent text selection during drag
      overflow: 'hidden', // Hide parts of images that are off-screen for slider
    },
    infoContainer: { flex: '1 1 400px' },
    arrow: {
      position: 'absolute',
      top: 'calc(450px / 2)', // Position in the middle of the main image
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(45, 55, 72, 0.7)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      transition: 'background-color 0.2s',
    },
    arrowLeft: {
      left: '15px',
    },
    arrowRight: {
      right: '15px',
    },
  };

  // New styles for the slider and dots
  const sliderStyles = {
    track: {
      display: 'flex',
      height: '450px', // Match the desired image height
      transition: 'transform 0.4s ease-in-out',
    },
    slide: {
      flex: '0 0 100%', // Each slide takes up 100% of the container width
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '8px',
    },
    dotsContainer: {
      position: 'absolute',
      bottom: '15px', // Position dots at the bottom of the image container
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      zIndex: 2,
    },
    dot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    dotActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    }
  };

  // Styles for the image thumbnails
  const thumbnailStyles = {
    container: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    image: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '6px',
      cursor: 'pointer',
      borderWidth: '3px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      transition: 'border-color 0.2s ease-in-out',
    },
    selectedImage: {
      borderColor: '#4299e1', // Highlight color for selected thumbnail
    }
  };

  // Styles for the quantity selector
  const quantitySelectorStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      margin: '1rem 0 1.5rem 0',
    },
    button: {
      backgroundColor: '#4a5568',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabledButton: {
      backgroundColor: '#718096',
      cursor: 'not-allowed',
      opacity: 0.6,
    },
    input: {
      width: '60px',
      textAlign: 'center',
      fontSize: '1.2rem',
      padding: '0.5rem',
      border: '1px solid #4a5568',
      borderRadius: '6px',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      MozAppearance: 'textfield', // For Firefox
      appearance: 'textfield', // For Chrome, Safari, Edge
    }
  };

  // Style for related product images to ensure uniform size
  const relatedProductImageStyle = {
    ...(pagesStyles.productImage || {}), // Kế thừa style gốc
    height: '220px', // Đặt chiều cao cố định
    objectFit: 'cover', // Đảm bảo ảnh vừa khung
  };

  return (
    <div style={detailStyles.container}>
      
      <div style={detailStyles.content}>
        <div
          style={{
            ...detailStyles.imageContainer,
            cursor: product.imageUrls?.length > 1 ? 'grab' : 'default'
          }}
          onMouseDown={product.imageUrls?.length > 1 ? handleDragStart : undefined}
          onTouchStart={product.imageUrls?.length > 1 ? handleDragStart : undefined}
          onMouseUp={product.imageUrls?.length > 1 ? handleDragEnd : undefined}
          onTouchEnd={product.imageUrls?.length > 1 ? handleDragEnd : undefined}
          onMouseLeave={product.imageUrls?.length > 1 ? handleMouseLeave : undefined}
          onTouchCancel={product.imageUrls?.length > 1 ? handleMouseLeave : undefined}
        >
          {product.imageUrls && product.imageUrls.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button style={{...detailStyles.arrow, ...detailStyles.arrowLeft}} onClick={showPrevImage} aria-label="Previous Image">&#10094;</button>
              )}
              {currentIndex < product.imageUrls.length - 1 && (
                <button style={{...detailStyles.arrow, ...detailStyles.arrowRight}} onClick={showNextImage} aria-label="Next Image">&#10095;</button>
              )}
            </>
          )}

          

          {/* Image Slider */}
          <div style={{...sliderStyles.track, transform: `translateX(-${currentIndex * 100}%)`}}>
            {product.imageUrls.map((url, index) => (
              <div key={index} style={sliderStyles.slide}>
                <img src={url} alt={`${product.name} image ${index + 1}`} style={sliderStyles.image} />
              </div>
            ))}
          </div>

           {/* Dot Indicators */}
           {product.imageUrls && product.imageUrls.length > 1 && (
            <div style={sliderStyles.dotsContainer}>
              {product.imageUrls.map((_, index) => (
                <button key={index} style={{...sliderStyles.dot, ...(currentIndex === index ? sliderStyles.dotActive : {})}} onClick={() => setCurrentIndex(index)} aria-label={`Go to image ${index + 1}`} />
              ))}
            </div>
          )}

         

          {/* Thumbnail Gallery */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div style={thumbnailStyles.container}>
              {product.imageUrls.map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  style={{
                    ...thumbnailStyles.image,
                    ...(currentIndex === index ? thumbnailStyles.selectedImage : {})
                  }}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
        <div style={detailStyles.infoContainer}>
          <h2 style={pagesStyles.header}>{product.name}</h2>
          {/* Hiển thị mô tả ngắn */}
          <p style={{...pagesStyles.productDescription, fontSize: '1.1rem', lineHeight: '1.6'}}>
            {product.description}
          </p>

          {product.stock > 0 ? (
            <>
              <div style={{marginTop: '2rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center'}}>Quantity:</label>
                <div style={quantitySelectorStyles.container}>
                  <button onClick={decreaseQuantity} style={quantitySelectorStyles.button}>-</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) {
                        setQuantity(Math.min(val, product.stock));
                      }
                    }}
                    style={quantitySelectorStyles.input}
                  />
                  <button
                    onClick={increaseQuantity}
                    style={{
                      ...quantitySelectorStyles.button,
                      
                      ...(quantity >= product.stock ? quantitySelectorStyles.disabledButton : {}),
                      cursor: "pointer"
                    }}
                    disabled={quantity > product.stock}
                  >
                    +
                  </button>
                </div>
                <p style={{textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem'}}>Available: {product.stock} products</p>
              </div>

              <strong style={{...pagesStyles.productPrice, fontSize: '1.8rem', display: 'block', marginBottom: '1rem', color: '#48bb78', textAlign: 'center'}}>
                Total Amount: {(product.priceCents * (quantity || 1)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </strong>

              <button
                onClick={() => buy(product)}
                disabled={busy}
                style={{
                  ...pagesStyles.buyButton,
                  width: '100%',
                  marginTop: '1rem',
                  ...(busy ? pagesStyles.buyButtonDisabled : {})
                }}
              >
                {busy ? 'Processing...' : 'Buy Now'}
              </button>
            </>
          ) : (
            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
              <p style={{
                fontSize: '1.5rem', color: '#e53e3e', fontWeight: 'bold',
                border: '2px solid #e53e3e', padding: '1rem', borderRadius: '8px',
                backgroundColor: 'rgba(229, 62, 62, 0.1)'
              }}>
                Hết hàng
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Long Description Section */}
      {product.longDescription && (
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #4a5568' }}>
          <h3 style={pagesStyles.header}>Detailed Description</h3>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#cbd5e0' }}>
            {product.longDescription}
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid #4a5568' }}>
          <h3 style={pagesStyles.header}>Related Products</h3>
          <div style={pagesStyles.grid}>
            {relatedProducts.map(p => (
              <div 
                key={p._id} 
                style={{...pagesStyles.productCard, cursor: 'pointer'}} 
                onClick={() => navigate(`/products/${p._id}`)}
              >
                {p.imageUrls && p.imageUrls[0] && <img src={p.imageUrls[0]} alt={p.name} style={relatedProductImageStyle} />}
                <h3 style={pagesStyles.productName}>{p.name}</h3>
                <p style={pagesStyles.productDescription}>{p.description}</p> {/* Luôn hiển thị mô tả ngắn ở đây */}
                <strong style={pagesStyles.productPrice}>{p.priceCents.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{...detailStyles.backButton, marginTop: '5rem'}} >
        &larr; Back
      </button>
    </div>
  );
}
