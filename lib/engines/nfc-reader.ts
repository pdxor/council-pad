/**
 * NFC Reading and Management System
 * 
 * Handles Web NFC API for reading NFC tags from physical statues
 * Note: Web NFC API is currently only supported on Android Chrome
 */

import type { NFCPayload } from '../types/council';
import { parseNFCPayload, storeNFCPayload } from '../engines/prompt-assembler';

export interface NFCScanResult {
  success: boolean;
  nfcTagId?: string;
  statueName?: string;
  payload?: NFCPayload;
  error?: string;
  timestamp?: Date;
}

// ============================================================
// WEB NFC API WRAPPER
// ============================================================

export class NFCReader {
  private reader: any = null;
  private abortController: AbortController | null = null;

  /**
   * Check if Web NFC is supported
   */
  static isSupported(): boolean {
    return 'NDEFReader' in window;
  }

  /**
   * Request NFC permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!NFCReader.isSupported()) {
        console.error('Web NFC is not supported on this device');
        return false;
      }

      // The NDEFReader constructor will throw if permissions are denied
      this.reader = new (window as any).NDEFReader();
      return true;
    } catch (error) {
      console.error('NFC permission denied:', error);
      return false;
    }
  }

  /**
   * Start scanning for NFC tags
   */
  async startScanning(
    onTagRead: (result: NFCScanResult) => void
  ): Promise<void> {
    if (!this.reader) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        onTagRead({
          success: false,
          error: 'NFC permission denied or not supported',
        });
        return;
      }
    }

    try {
      this.abortController = new AbortController();
      
      await this.reader.scan({ signal: this.abortController.signal });

      this.reader.addEventListener('reading', async ({ serialNumber, message }: any) => {
        console.log('NFC tag detected:', serialNumber);

        try {
          // Read NDEF message
          const textRecord = message.records.find(
            (record: any) => record.recordType === 'text'
          );

          if (textRecord) {
            const textDecoder = new TextDecoder(textRecord.encoding || 'utf-8');
            const rawData = textDecoder.decode(textRecord.data);
            
            console.log('Raw NFC data:', rawData);

            // Parse payload
            const payload = parseNFCPayload(rawData);

            if (payload) {
              // Store in Supabase
              await storeNFCPayload(serialNumber, payload);

              onTagRead({
                success: true,
                nfcTagId: serialNumber,
                payload,
              });
            } else {
              onTagRead({
                success: false,
                error: 'Invalid NFC payload format',
              });
            }
          } else {
            onTagRead({
              success: false,
              error: 'No text record found on NFC tag',
            });
          }
        } catch (error) {
          console.error('Error processing NFC tag:', error);
          onTagRead({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      this.reader.addEventListener('readingerror', () => {
        onTagRead({
          success: false,
          error: 'Cannot read NFC tag. Try again.',
        });
      });

    } catch (error) {
      console.error('Error starting NFC scan:', error);
      onTagRead({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start NFC scanning',
      });
    }
  }

  /**
   * Stop scanning for NFC tags
   */
  stopScanning(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// ============================================================
// MOCK NFC FOR DEVELOPMENT/TESTING
// ============================================================

export const MOCK_NFC_PAYLOADS: Record<string, NFCPayload> = {
  'buckminster_fuller': {
    id: 'buckminster_fuller',
    role: 'systems_designer',
    tone: ['optimistic', 'precise', 'global'],
    axioms: ['whole_systems', 'ephemeralization', 'design_science'],
    priority: 1.2,
  },
  'carl_jung': {
    id: 'carl_jung',
    role: 'depth_psychologist',
    tone: ['humble', 'poetic'],
    axioms: ['archetypal_psychology', 'shadow_integration', 'ego_self_axis'],
    priority: 1.1,
  },
  'donella_meadows': {
    id: 'donella_meadows',
    role: 'systems_designer',
    tone: ['precise', 'unsentimental'],
    axioms: ['whole_systems', 'limits_to_growth'],
    priority: 1.3,
  },
  'robin_wall_kimmerer': {
    id: 'robin_wall_kimmerer',
    role: 'ecological_thinker',
    tone: ['poetic', 'humble'],
    axioms: ['indigenous_worldview', 'deep_ecology', 'seven_generations'],
    priority: 1.4,
  },
  'james_baldwin': {
    id: 'james_baldwin',
    role: 'philosopher',
    tone: ['unsentimental', 'poetic'],
    axioms: ['power_analysis', 'structural_violence', 'situated_knowledge'],
    priority: 1.3,
  },
};

/**
 * Mock NFC scan for development/testing
 */
export async function mockNFCScan(
  mockId: string,
  onTagRead: (result: NFCScanResult) => void
): Promise<void> {
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const payload = MOCK_NFC_PAYLOADS[mockId];

  if (payload) {
    // Store in Supabase
    await storeNFCPayload(mockId, payload, mockId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

    onTagRead({
      success: true,
      nfcTagId: mockId,
      payload,
    });
  } else {
    onTagRead({
      success: false,
      error: 'Unknown mock NFC ID',
    });
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const nfcReader = new NFCReader();

