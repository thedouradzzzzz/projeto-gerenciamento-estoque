
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../common/Modal';
import type { Asset } from '../../types';

interface ViewQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

const ViewQRModal: React.FC<ViewQRModalProps> = ({ isOpen, onClose, asset }) => {
  if (!asset) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QR Code: ${asset.assetType} - ${asset.serialNumber}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="p-2 bg-white inline-block border rounded-md">
           <QRCodeSVG 
            value={asset.qrCodeValue || asset.id} // Fallback to asset.id if qrCodeValue is empty
            size={160} 
            level="H" // High error correction
            includeMargin={true}
          />
        </div>
        <div className="text-center text-sm text-gray-700 w-full">
          <p><strong>Tipo:</strong> {asset.assetType}</p>
          <p><strong>Marca:</strong> {asset.brand}</p>
          <p><strong>Modelo:</strong> {asset.model}</p>
          <p><strong>Nº Série:</strong> {asset.serialNumber}</p>
          <p className="mt-2 text-xs text-gray-500 break-all"><strong>Valor QR:</strong> {asset.qrCodeValue || asset.id}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ViewQRModal;
