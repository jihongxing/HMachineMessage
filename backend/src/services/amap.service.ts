import axios from 'axios';
import { logger } from '../utils/logger';

interface AmapGeoResult {
  status: string;
  geocodes?: Array<{
    location: string;
    formatted_address: string;
  }>;
  regeocode?: {
    formatted_address: string;
  };
}

export class AmapService {
  private apiKey: string;
  private baseUrl = 'https://restapi.amap.com/v3';

  constructor() {
    this.apiKey = process.env.AMAP_KEY || '';
  }

  /**
   * IP定位
   */
  async getLocationByIp(ip: string): Promise<{ province: string; city: string; ip: string } | null> {
    if (!this.apiKey) {
      logger.warn('AMAP_KEY not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/ip`, {
        params: {
          key: this.apiKey,
          ip,
        },
      });

      if (response.data.status === '1' && response.data.province) {
        return {
          province: response.data.province,
          city: response.data.city || response.data.province,
          ip,
        };
      }

      return null;
    } catch (error) {
      logger.error('Amap IP location error:', error);
      return null;
    }
  }

  /**
   * 地理编码：地址转坐标
   */
  async geocode(address: string, city?: string): Promise<{ latitude: number; longitude: number } | null> {
    if (!this.apiKey) {
      logger.warn('AMAP_KEY not configured');
      return null;
    }

    try {
      const response = await axios.get<AmapGeoResult>(`${this.baseUrl}/geocode/geo`, {
        params: {
          key: this.apiKey,
          address,
          city,
        },
      });

      if (response.data.status === '1' && response.data.geocodes && response.data.geocodes.length > 0) {
        const [lng, lat] = response.data.geocodes[0].location.split(',').map(Number);
        return { latitude: lat, longitude: lng };
      }

      return null;
    } catch (error) {
      logger.error('Amap geocode error:', error);
      return null;
    }
  }

  /**
   * 逆地理编码：坐标转地址
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!this.apiKey) {
      logger.warn('AMAP_KEY not configured');
      return null;
    }

    try {
      const response = await axios.get<AmapGeoResult>(`${this.baseUrl}/geocode/regeo`, {
        params: {
          key: this.apiKey,
          location: `${longitude},${latitude}`,
        },
      });

      if (response.data.status === '1' && response.data.regeocode) {
        return response.data.regeocode.formatted_address;
      }

      return null;
    } catch (error) {
      logger.error('Amap reverse geocode error:', error);
      return null;
    }
  }
}

export const amapService = new AmapService();
