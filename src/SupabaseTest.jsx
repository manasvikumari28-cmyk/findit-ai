import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function SupabaseTest() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('Loading items...');

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('items')
        .select('*');

      if (error) {
        console.error(error);
        setMessage('Database connection failed: ' + error.message);
        return;
      }

      setItems(data);
      setMessage('Database connected successfully!');
    }

    fetchItems();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>FindIt AI - Database Test</h2>
      <p>{message}</p>

      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p>Type: {item.item_type}</p>
          <p>Category: {item.category}</p>
        </div>
      ))}
    </div>
  );
}

export default SupabaseTest;