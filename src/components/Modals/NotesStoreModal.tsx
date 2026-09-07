import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Star,
  Truck,
  CheckCircle2,
  Package,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { StoreItem, AcademicYear } from "../../types";

interface NotesStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StoreItem[];
  currentYear: AcademicYear;
}

export const NotesStoreModal: React.FC<NotesStoreModalProps> = ({
  isOpen,
  onClose,
  items,
  currentYear,
}) => {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [studentName, setStudentName] = useState("");
  const [campusHostel, setCampusHostel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!isOpen) return null;

  const handlePreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !campusHostel) return;
    setOrderConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="notes-store-modal-content"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                StudyHub Notes Store & Pre-Order Desk
              </h2>
              <p className="text-xs text-slate-500">
                Premium spiral-bound printed booklets, cheat sheets & campus delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
          {orderConfirmed ? (
            /* Order Success View */
            <div className="max-w-md mx-auto py-8 text-center space-y-4 bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Pre-Order Placed Successfully! 🎉
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your printed order for <strong>{selectedItem?.title}</strong> is being prepared.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-xs text-left space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-800">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Point:</span>
                  <span className="font-bold text-slate-800">{campusHostel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Payable at Pickup:</span>
                  <span className="font-bold text-emerald-700">₹{selectedItem?.price} (Cash/UPI)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setOrderConfirmed(false);
                    setSelectedItem(null);
                  }}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Browse Other Notes
                </button>
              </div>
            </div>
          ) : selectedItem ? (
            /* Pre-Order Checkout Form */
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  ← Back to Store Items
                </button>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                  Campus Pre-Order
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedItem.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Format: {selectedItem.format} • {selectedItem.pages} Pages • 80 GSM High Brightness Paper
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-slate-900">
                    ₹{selectedItem.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{selectedItem.originalPrice}
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                    Save {Math.round(((selectedItem.originalPrice - selectedItem.price) / selectedItem.originalPrice) * 100)}%
                  </span>
                </div>
              </div>

              <form onSubmit={handlePreOrder} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Aarav Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hostel / Campus Department / Room No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commerce Wing, Room 302 or Main Library Desk"
                    value={campusHostel}
                    onChange={(e) => setCampusHostel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-blue-600" />
                    Delivery Timeline: {selectedItem.deliveryDays}
                  </p>
                  <p>Pay upon collection at college desk. No advance payment required.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 transition"
                  >
                    Confirm Pre-Order (₹{selectedItem.price})
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-rose-300 hover:shadow-sm transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        {item.format}
                      </span>
                      {item.featured && (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-600" />
                          Bestseller
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-0.5 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {item.rating} ({item.reviewsCount})
                      </span>
                      <span>•</span>
                      <span>{item.pages} pages</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-slate-600">
                        <Truck className="h-3.5 w-3.5" />
                        {item.deliveryDays}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{item.price}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Free Campus Delivery
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-2xs"
                    >
                      <span>Pre-Order Book</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            100% Quality Printed Notes Guaranteed
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close Store
          </button>
        </div>
      </div>
    </div>
  );
};
