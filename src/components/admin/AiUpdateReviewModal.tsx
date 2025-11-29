import React from 'react';
import { AiUpdate } from '../../types';
import Modal from '../ui/Modal';

interface AiUpdateReviewModalProps<T> {
    updates: AiUpdate<T>[];
    onClose: () => void;
    onApply: () => void;
}

const AiUpdateReviewModal = <T extends {}>({ updates, onClose, onApply }: AiUpdateReviewModalProps<T>) => {
    
    const renderUpdateItem = (item: AiUpdate<T>, index: number) => {
        switch (item.action) {
            case 'add':
                return (
                    <div key={index} className="p-3 bg-green-900/30 rounded-lg border-l-4 border-green-400">
                        <p className="font-bold text-green-300">إضافة:</p>
                        <pre className="text-xs text-white/90 bg-black/30 p-2 rounded mt-2 whitespace-pre-wrap">
                            {JSON.stringify(item.newItem, null, 2)}
                        </pre>
                        <p className="text-xs text-white/80 mt-2"><strong>السبب:</strong> {item.reason}</p>
                    </div>
                );
            case 'update':
                 return (
                    <div key={index} className="p-3 bg-yellow-900/30 rounded-lg border-l-4 border-yellow-400">
                        <p className="font-bold text-yellow-300">تحديث:</p>
                        {/* More detailed view could be added here to show old vs new */}
                        <pre className="text-xs text-white/90 bg-black/30 p-2 rounded mt-2 whitespace-pre-wrap">
                            {JSON.stringify(item.newItem, null, 2)}
                        </pre>
                        <p className="text-xs text-white/80 mt-2"><strong>السبب:</strong> {item.reason}</p>
                    </div>
                );
            case 'remove':
                 return (
                    <div key={index} className="p-3 bg-red-900/30 rounded-lg border-l-4 border-red-400">
                        <p className="font-bold text-red-300">حذف:</p>
                         <pre className="text-xs text-white/90 bg-black/30 p-2 rounded mt-2 whitespace-pre-wrap">
                            {JSON.stringify(item.item, null, 2)}
                        </pre>
                        <p className="text-xs text-white/80 mt-2"><strong>السبب:</strong> {item.reason}</p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <Modal title="مراجعة اقتراحات الذكاء الاصطناعي" onClose={onClose}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {updates.map((update, index) => renderUpdateItem(update, index))}
            </div>
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/20">
                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg">
                    إلغاء
                </button>
                <button onClick={onApply} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
                    تطبيق {updates.length} تحديث(ات)
                </button>
            </div>
        </Modal>
    );
};

export default AiUpdateReviewModal;
