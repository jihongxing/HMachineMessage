'use client';

import { useState, useEffect } from 'react';

interface QRCodeShareProps {
  equipmentId: string;
}

export default function QRCodeShare({ equipmentId }: QRCodeShareProps) {
  const [qrcodeUrl, setQrcodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/qrcode/equipment/${equipmentId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        setQrcodeUrl(data.data.qrcodeUrl);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {qrcodeUrl ? (
        <div>
          <img src={qrcodeUrl} alt="设备二维码" className="mx-auto w-48 h-48" />
          <p className="text-sm text-gray-600 mt-2">扫码查看设备详情</p>
        </div>
      ) : (
        <button
          onClick={generateQRCode}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '生成中...' : '生成二维码'}
        </button>
      )}
    </div>
  );
}
