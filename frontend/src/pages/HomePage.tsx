import ProductList from '../components/ProductList';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1 className="section-title bg-red-50">ADAM SYIBAL SHOP</h1>
      <ProductList />
    </div>
  );
};

export default HomePage;
