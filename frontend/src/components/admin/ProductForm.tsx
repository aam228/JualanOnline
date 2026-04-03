// ProductForm: Multi-section form for product creation (see requirements)
import React from 'react';
import ImageUploader from './ImageUploader';
// import MeasurementGuideModal from './MeasurementGuideModal';
// import FlawPhotoUploader from './FlawPhotoUploader';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import Button from './Button';
import Input from './Input';

// Zod schema for validation (simplified, expand as needed)
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(1, 'Price is required'),
  condition: z.number().min(1).max(10),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  authenticity: z.string().min(1, 'Authenticity is required'),
  chest: z.number().min(1, 'Chest width is required'),
  length: z.number().min(1, 'Length is required'),
  images: z.array(z.any()).min(4, 'At least 4 images required'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  shippingWeight: z.number().min(1, 'Weight is required'),
  sku: z.string().optional(),
  stock: z.number().optional(),
  flaws: z.array(z.any()).optional(),
  seoSlug: z.string().optional(),
});

type ProductFormType = z.infer<typeof productSchema>;

const AUTOSAVE_KEY = 'product-draft';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const SECTIONS = [
  { key: 'images', label: 'Images', required: true },
  { key: 'basic', label: 'Basic Info', required: true },
  { key: 'details', label: 'Product Details', required: true },
  { key: 'condition', label: 'Condition Report', required: true },
  { key: 'measurements', label: 'Measurements', required: true },
  { key: 'shipping', label: 'Shipping', required: true },
  { key: 'inventory', label: 'Inventory', required: true },
  { key: 'seo', label: 'SEO', required: false },
];

const ProductForm: React.FC = () => {
  const methods = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      images: [],
    },
  });

  // Auto-save draft every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const data = methods.getValues();
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    }, 30000);
    return () => clearInterval(interval);
  }, [methods]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(AUTOSAVE_KEY);
    if (draft) {
      try {
        methods.reset(JSON.parse(draft));
      } catch {}
    }
  }, []);

  const [slug, setSlug] = useState('');

  // Auto-generate slug from name/brand/category
  useEffect(() => {
    const sub = methods.watch((values: any) => {
      if (values.name && values.brand && values.category) {
        setSlug(slugify(`${values.brand} ${values.name} ${values.category}`));
        methods.setValue('seoSlug', slugify(`${values.brand} ${values.name} ${values.category}`));
      }
    });
    return () => sub.unsubscribe();
  }, [methods]);

  const [openSection, setOpenSection] = useState('images');

  // Progress calculation: count required sections with no errors
  const errors = methods.formState.errors;
  const values = methods.watch();
  // Add index signature for sectionValid
  const sectionValid: { [key: string]: boolean } = {
    images: Array.isArray(values.images) && values.images.length >= 4,
    basic: !!(values.name && values.brand && values.category && values.price),
    details: !!(values.condition && values.size && values.color && values.authenticity),
    condition: !!(values.condition && Array.isArray(values.flaws)),
    measurements: !!(values.chest && values.length),
    shipping: !!(values.shippingMethod && values.shippingWeight),
    inventory: !!(values.sku && values.stock),
    seo: true,
  };
  const completed = SECTIONS.filter(s => s.required && sectionValid[s.key]).length;
  const total = SECTIONS.filter(s => s.required).length;

  // On submit: client validation, then server validation
  const onSubmit = async (data: ProductFormType) => {
    // Client-side validation already handled by Zod
    try {
      // Server-side validation: POST to /api/products/validate (to be implemented)
      const res = await fetch('/api/products/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Server validation failed');
      // If valid, proceed to save/publish
      // ...submit logic here...
      alert('Product validated and ready to save!');
    } catch (err: any) {
      alert('Validation error: ' + err.message);
    }
  };

  // Accordion section component
  function AccordionSection({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    return (
      <section className="border rounded mb-2">
        <button
          type="button"
          className="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 focus:outline-none"
          onClick={() => setOpenSection(id)}
        >
          {label}
          {openSection === id ? ' ▲' : ' ▼'}
        </button>
        {openSection === id && <div className="p-4">{children}</div>}
      </section>
    );
  }

  // Sticky action bar for mobile
  const ActionBar = () => (
    <div className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-white border-t flex justify-between px-4 py-2 shadow">
      <Button type="button" variant="outline" onClick={() => methods.reset()}>Reset</Button>
      <Button type="submit" onClick={methods.handleSubmit(onSubmit)}>Save</Button>
    </div>
  );

  return (
    <FormProvider {...methods}>
      <div className="mb-4">
        <div className="text-sm font-medium mb-1">Progress: {completed} of {total} sections complete</div>
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-primary h-2 rounded"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      </div>
      <form className="space-y-2 pb-20" onSubmit={methods.handleSubmit(onSubmit)}>
        <AccordionSection id="images" label="Images">
          {/* Image Upload Section */}
          <ImageUploader />
        </AccordionSection>
        <AccordionSection id="basic" label="Basic Info">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              {...methods.register('name')}
              error={errors.name?.message as string}
            />
            <Input
              label="Brand"
              {...methods.register('brand')}
              error={errors.brand?.message as string}
            />
            <Input
              label="Category"
              {...methods.register('category')}
              error={errors.category?.message as string}
            />
            <Input
              label="Price (Rp)"
              type="number"
              {...methods.register('price', { valueAsNumber: true })}
              error={errors.price?.message as string}
            />
          </div>
        </AccordionSection>
        {/* TODO: Add more AccordionSection for details, condition, measurements, shipping, inventory, SEO */}
        <AccordionSection id="seo" label="SEO (optional)">
          <label className="block text-sm font-medium">SEO Slug</label>
          <input {...methods.register('seoSlug')} value={slug} readOnly className="input input-bordered w-full" />
        </AccordionSection>
        <div className="hidden md:block">
          <Button type="submit" className="mt-2">Validate & Save</Button>
        </div>
      </form>
      <ActionBar />
    </FormProvider>
  );
};

export default ProductForm;
