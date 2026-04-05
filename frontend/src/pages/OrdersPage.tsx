import './OrdersPage.css';

const OrdersPage = () => {
  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>Order History</h1>
        
        <div className="orders-empty">
          <p>You don't have any orders yet.</p>
          <p className="orders-subtext">Start shopping to place your first order!</p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
