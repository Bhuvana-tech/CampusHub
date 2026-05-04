'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Mail, Upload, X, ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';

interface LostItem {
  id: number;
  name: string;
  location: string;
  date: string;
  contact: string;
  description: string;
  image?: string;
}

const initialLostItem: LostItem = { 
  id: 1, 
  name: 'Boat Airdopes', 
  location: 'Library', 
  date: '1 day ago', 
  contact: 'contact@example.com',
  description: 'Boat Airdopes last seen in library. Black color with charging case.'
};

export default function LostFoundPage() {
  const [lostItems, setLostItems] = useState<LostItem[]>([initialLostItem]);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', location: '', description: '', contact: '' });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (newItem.name && newItem.description) {
      const item: LostItem = {
        id: Date.now(),
        name: newItem.name,
        location: newItem.location || 'Unknown',
        date: 'Just now',
        contact: newItem.contact || 'contact@example.com',
        description: newItem.description,
        image: uploadedImage || undefined,
      };
      setLostItems(prev => [item, ...prev]);
      setNewItem({ name: '', location: '', description: '', contact: '' });
      setUploadedImage(null);
      setShowUploadModal(false);
    }
  };

  return (
    <>
      <Sidebar />
      <PageLayout title="Lost & Found" subtitle="Report lost items or help others find theirs">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Upload size={18} />
            Report Lost Item
          </Button>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-foreground mb-4">Posted Lost Items</h3>
          <div className="space-y-4">
            {lostItems.map(item => (
              <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {item.image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>Last seen: {item.location}</p>
                          <p>Posted: {item.date}</p>
                          <p className="mt-2 text-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Button
                        className="gap-2"
                        onClick={() => setSelectedItem(item)}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm p-6">
              <h2 className="text-xl font-bold mb-4">Contact About</h2>
              <p className="text-foreground font-semibold mb-4">{selectedItem.name}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary" />
                  <span className="text-sm">{selectedItem.contact}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </Card>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Report Lost Item</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Item Name</label>
                  <Input
                    placeholder="e.g., Blue Backpack"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Last Seen Location</label>
                  <Input
                    placeholder="e.g., Library, Cafeteria"
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input
                    placeholder="Describe the item..."
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Contact Email</label>
                  <Input
                    placeholder="your.email@example.com"
                    value={newItem.contact}
                    onChange={(e) => setNewItem(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImage ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                      <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setUploadedImage(null)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={24} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload image</span>
                    </Button>
                  )}
                </div>

                <Button className="w-full" onClick={handleSubmit}>
                  Submit Report
                </Button>
              </div>
            </Card>
          </div>
        )}
      </PageLayout>
    </>
  );
}
