/**
 * NFC Scanner Component
 * 
 * Interface for scanning NFC tags and adding members
 * Brand: Flat, intentional, calm
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { nfcReader, NFCScanResult, mockNFCScan, MOCK_NFC_PAYLOADS } from '@/lib/engines/nfc-reader';
import { supabase } from '@/lib/supabase';
import type { NFCPayload } from '@/lib/types/council';

interface NFCScannerProps {
  onScanComplete: (result: NFCScanResult) => void;
  isDevelopment?: boolean;
}

interface StoredNFCTag {
  nfc_tag_id: string;
  statue_name: string;
  raw_payload: NFCPayload;
}

export function NFCScanner({ onScanComplete, isDevelopment = true }: NFCScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<NFCScanResult | null>(null);
  const [selectedMockId, setSelectedMockId] = useState<string>('');
  const [storedTags, setStoredTags] = useState<StoredNFCTag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Fetch stored NFC tags from database
  const fetchStoredTags = async () => {
    setIsLoadingTags(true);
    try {
      const { data, error } = await supabase
        .from('nfc_payloads')
        .select('nfc_tag_id, statue_name, raw_payload')
        .order('last_scanned_at', { ascending: false });

      if (error) {
        // Table doesn't exist yet - this is expected before migration
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('ℹ️  NFC payloads table not yet created. Run database migration first.');
          console.log('   See DATABASE_SETUP.md for instructions.');
        } else {
          console.error('Error fetching stored tags:', error);
        }
      } else if (data) {
        setStoredTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Load stored tags on mount
  useEffect(() => {
    fetchStoredTags();
  }, []);

  // Listen for real-time NFC taps (both new scans AND re-scans)
  useEffect(() => {
    console.log('🎧 NFC listener ready');
    
    const channel = supabase
      .channel('nfc_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for ALL events (INSERT and UPDATE)
          schema: 'public',
          table: 'nfc_payloads'
        },
        (payload) => {
          console.log('⚡ NFC TAP!', payload);
          
          const newTag = payload.new as any;
          if (newTag && newTag.raw_payload) {
            const result: NFCScanResult = {
              success: true,
              nfcTagId: newTag.nfc_tag_id,
              statueName: newTag.statue_name, // ✨ Pass the name!
              payload: newTag.raw_payload,
              timestamp: new Date(newTag.last_scanned_at || Date.now())
            };
            
            console.log('🏛️ Adding to council:', newTag.statue_name);
            setScanResult(result);
            onScanComplete(result);
            fetchStoredTags();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onScanComplete]);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    if (isDevelopment && selectedMockId) {
      await mockNFCScan(selectedMockId, (result) => {
        setScanResult(result);
        setIsScanning(false);
        onScanComplete(result);
        // Refresh stored tags after successful scan
        if (result.success) {
          fetchStoredTags();
        }
      });
    } else {
      await nfcReader.startScanning((result) => {
        setScanResult(result);
        setIsScanning(false);
        onScanComplete(result);
        // Refresh stored tags after successful scan
        if (result.success) {
          fetchStoredTags();
        }
      });
    }
  };

  const handleStopScan = () => {
    nfcReader.stopScanning();
    setIsScanning(false);
  };

  return (
    <div className="bg-council-warmstone border border-council-softash/30 rounded-council p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-council-charcoal">
          Add Council Member
        </h2>
        <button
          onClick={fetchStoredTags}
          disabled={isLoadingTags}
          className="p-2 hover:bg-council-wood/10 rounded-council transition-all duration-council"
          title="Refresh scanned tags"
        >
          <RefreshCw className={`w-4 h-4 text-council-gold ${isLoadingTags ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Show physically scanned tags first */}
      {storedTags.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm text-council-idle mb-2 font-medium">
            Scanned tags (from NFC reader):
          </label>
          <select
            className="w-full bg-council-gold/10 border-2 border-council-gold rounded-council px-4 py-2.5 text-council-charcoal focus:outline-none focus:border-council-gold transition-all duration-council font-medium"
            value={selectedMockId}
            onChange={(e) => setSelectedMockId(e.target.value)}
            disabled={isScanning}
          >
            <option value="">Choose a physically scanned member...</option>
            {storedTags.map((tag) => (
              <option key={tag.nfc_tag_id} value={tag.raw_payload.id}>
                🏷️ {tag.statue_name || tag.raw_payload.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      )}

      {isDevelopment && (
        <div className="mb-4">
          <label className="block text-sm text-council-idle mb-2 font-medium">
            {storedTags.length > 0 ? 'Or select mock statue:' : 'Select mock statue (for testing):'}
          </label>
          <select
            className="w-full bg-white border border-council-softash/40 rounded-council px-4 py-2.5 text-council-charcoal focus:outline-none focus:border-council-gold transition-all duration-council"
            value={selectedMockId}
            onChange={(e) => setSelectedMockId(e.target.value)}
            disabled={isScanning}
          >
            <option value="">Choose a thinker...</option>
            {Object.keys(MOCK_NFC_PAYLOADS).map((id) => (
              <option key={id} value={id}>
                {id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {!isScanning ? (
          <button
            onClick={handleStartScan}
            disabled={isDevelopment && !selectedMockId}
            className="w-full bg-council-gold text-council-charcoal font-semibold py-3 rounded-council hover:bg-council-gold/90 transition-all duration-council disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDevelopment ? 'Add to Council' : 'Scan NFC Tag'}
          </button>
        ) : (
          <button
            onClick={handleStopScan}
            className="w-full bg-council-thinking text-white font-semibold py-3 rounded-council hover:bg-council-thinking/80 transition-all duration-council"
          >
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </div>
          </button>
        )}

        {/* Scan result */}
        {scanResult && (
          <div
            className={`
              flex items-start gap-3 p-4 rounded-council border
              ${scanResult.success 
                ? 'bg-council-gold/10 border-council-gold' 
                : 'bg-council-tension/10 border-council-tension'
              }
            `}
          >
            {scanResult.success ? (
              <>
                <CheckCircle className="w-5 h-5 text-council-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-council-charcoal font-semibold">Member Added</p>
                  <p className="text-council-idle text-sm mt-1">
                    {scanResult.payload?.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-council-tension flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-council-charcoal font-semibold">Failed</p>
                  <p className="text-council-idle text-sm mt-1">
                    {scanResult.error}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

