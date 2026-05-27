const db = require('../config/db');

const createOrder = async (req, res) => {
  const { customerDetails, cartItems, total, paymentMethod, latitude, longitude } = req.body;
  const userId = req.user.id; // From authMiddleware
  
  if (!userId) {
    return res.status(401).json({ error: 'User must be logged in to place an order.' });
  }

  const client = await db.pool.connect();
  
  try {
    console.log(`\n📦 Initializing Order for User ID: ${userId}`);
    await client.query('BEGIN');

    // 1. Upsert Customer Info (Update if exists, otherwise Insert)
    console.log('--- Step 1: Saving/Updating Customer Info');
    await client.query(
      `INSERT INTO customers (user_id, name, phone, address, city, pincode) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         city = EXCLUDED.city,
         pincode = EXCLUDED.pincode`,
      [userId, customerDetails.name, customerDetails.phone, customerDetails.address, customerDetails.city, customerDetails.pincode]
    );

    // 2. Create the Order (Including Tracking Coordinates)
    console.log('--- Step 2: Creating Order Record with Tracking Info');
    const orderInsert = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, latitude, longitude, address_snapshot, pincode_snapshot) 
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7) RETURNING id`,
      [userId, total, paymentMethod, latitude, longitude, customerDetails.address, customerDetails.pincode]
    );
    const orderId = orderInsert.rows[0].id;

    // 3. Insert Order Items
    console.log(`--- Step 3: Inserting ${cartItems.length} items`);
    console.log("DEBUG: Full cartItems payload:", JSON.stringify(cartItems, null, 2));

    for (const item of cartItems) {
      console.log(`DEBUG: Validating Product ID: ${item.product_id} for Order: ${orderId}`);
      
      // Validate product existence to prevent Foreign Key Violation
      const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [item.product_id]);
      if (productCheck.rows.length === 0) {
        throw new Error(`Invalid product: The product with ID ${item.product_id} does not exist in our catalog.`);
      }

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity || 1, item.price]
      );
    }

    // 4. Clear the Cart
    console.log(`--- Step 4: Clearing cart for User ID: ${userId}`);
    await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    console.log(`✅ Order ${orderId} placed successfully!\n`);
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Order Transaction Error:', error.message);
    console.error('Full Error Detail:', error);
    res.status(500).json({ 
      error: 'Failed to place order', 
      details: error.message,
      dbDetail: error.detail 
    });
  } finally {
    client.release();
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Fetch orders with their items joined
    const query = `
      SELECT 
        o.id as order_id, 
        o.total, 
        o.status, 
        o.payment_method, 
        o.created_at,
        o.latitude,
        o.longitude,
        o.agent_lat,
        o.agent_lng,
        o.pincode_snapshot,
        oi.quantity, 
        oi.price as item_price,
        p.name as product_name,
        p.image as product_image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    // Group items by order_id
    const orders = result.rows.reduce((acc, row) => {
      const { order_id, total, status, payment_method, created_at, latitude, longitude, pincode_snapshot, ...item } = row;
      if (!acc[order_id]) {
        acc[order_id] = { 
          id: order_id, 
          total, 
          status, 
          payment_method, 
          created_at, 
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          agentLocation: row.agent_lat ? { lat: parseFloat(row.agent_lat), lng: parseFloat(row.agent_lng) } : null,
          pincode_snapshot,
          items: [] 
        };
      }
      acc[order_id].items.push(item);
      return acc;
    }, {});

    res.json(Object.values(orders));
  } catch (error) {
    console.error('❌ Get User Orders Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id as order_id, 
        o.total, 
        o.status, 
        o.payment_method, 
        o.created_at,
        u.name as user_account_name,
        c.name as customer_name,
        c.phone,
        c.address,
        c.city,
        c.pincode,
        o.user_id,
        o.latitude,
        o.longitude,
        o.agent_lat,
        o.agent_lng,
        oi.quantity, 
        oi.price as item_price,
        p.name as product_name,
        p.image as product_image
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN customers c ON o.user_id = c.user_id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC
    `;
    
    const result = await db.query(query);
    
    // Group items by order_id
    const orders = result.rows.reduce((acc, row) => {
      const { 
        order_id, total, status, payment_method, created_at, 
        user_id, latitude, longitude,
        user_account_name, customer_name, phone, address, city, pincode,
        ...item 
      } = row;
      
      if (!acc[order_id]) {
        acc[order_id] = { 
          id: order_id, 
          userId: user_id,
          coords: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
          agentLocation: row.agent_lat ? { lat: parseFloat(row.agent_lat), lng: parseFloat(row.agent_lng) } : null,
          total, 
          status, 
          payment_method, 
          created_at,
          customer: {
            account_name: user_account_name,
            name: customer_name || user_account_name,
            phone: phone || 'N/A',
            address: address || 'N/A',
            city: city || 'N/A',
            pincode: pincode || 'N/A'
          },
          items: [] 
        };
      }
      acc[order_id].items.push(item);
      return acc;
    }, {});

    res.json(Object.values(orders));
  } catch (error) {
    console.error('❌ Get All Orders Admin Error:', error);
    res.status(500).json({ message: 'Failed to fetch orders for admin', error: 'Failed to fetch orders for admin' });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found', error: 'Order not found' });
    }

    const updatedOrder = result.rows[0];

    // Get Socket.IO instance and emit status update to user's room
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${updatedOrder.user_id}`).emit('orderStatusUpdate', {
        orderId: updatedOrder.id,
        status: updatedOrder.status
      });
      console.log(`📡 Emitted status update for Order #${updatedOrder.id} to User ${updatedOrder.user_id}`);
    }

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: 'Failed to update order status' });
  }
};

const updateOrderLocation = async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  try {
    const result = await db.query(
      'UPDATE orders SET agent_lat = $1, agent_lng = $2 WHERE id = $3 RETURNING id, user_id',
      [lat, lng, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];

    // Broadcast update via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${order.user_id}`).emit('deliveryLocationUpdate', {
        orderId: order.id,
        lat,
        lng
      });
    }

    res.json({ message: 'Location updated', orderId: order.id });
  } catch (error) {
    console.error('❌ Update Order Location Error:', error);
    res.status(500).json({ message: 'Failed to update location', error: error.message });
  }
};

module.exports = { createOrder, getUserOrders, getAllOrdersForAdmin, updateOrderStatus, updateOrderLocation };
