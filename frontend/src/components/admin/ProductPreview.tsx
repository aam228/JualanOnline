// ProductPreview: Real-time preview of product as it will appear on store
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const ProductPreview: React.FC = () => {
  const { control } = useFormContext();
  const name = useWatch({ control, name: 'name' });
  const brand = useWatch({ control, name: 'brand' });
  const category = useWatch({ control, name: 'category' });
  const price = useWatch({ control, name: 'price' });
  const images = useWatch({ control, name: 'images' });

  return (
    <div className="bg-white rounded-lg shadow p-4 min-h-[400px]">
      <div className="flex flex-col items-center">
        {/* Images preview */}
        <div className="flex gap-2 mb-4">
          {Array.isArray(images) && images.length > 0 ? (
            images.slice(0, 4).map((img: any, i: number) => (
              <img
                key={i}
                src={typeof img === 'string' ? img : img.preview || img.url}
                alt={`Product ${i+1}`}
                className="w-16 h-16 object-cover rounded border"
              />
            ))
          ) : (
            <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center text-gray-300">No Image</div>
          )}
        </div>
        {/* Basic info preview */}
        <div className="text-lg font-bold">{name || 'Product Name'}</div>
        <div className="text-sm text-gray-500 mb-1">{brand || 'Brand'} &bull; {category || 'Category'}</div>
        <div className="text-xl text-primary font-semibold">{price ? `Rp${price.toLocaleString('id-ID')}` : 'Rp0'}</div>
      </div>
      {/* TODO: Add more preview fields (condition, size, color, etc.) */}
    </div>
  );
};

export default ProductPreview;
