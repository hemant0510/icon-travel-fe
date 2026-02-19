import amadeusClient from '@/lib/amadeus/httpClient';
import type { TransferOffersResponse } from '@/models/responses/TransferSearchResponse';

class TransferService {
  private static instance: TransferService;

  private constructor() {}

  public static getInstance(): TransferService {
    if (!TransferService.instance) {
      TransferService.instance = new TransferService();
    }
    return TransferService.instance;
  }

  public async searchTransfers(params: {
    startLocationCode: string;
    endAddressLine: string;
    endCityName: string;
    endZipCode: string;
    endCountryCode: string;
    endName: string;
    endGeoCode: string;
    transferType: string;
    startDateTime: string;
    passengers: number;
  }): Promise<TransferOffersResponse> {
    try {
      return await amadeusClient.post<TransferOffersResponse>(
        '/v1/shopping/transfer-offers',
        {
          startLocationCode: params.startLocationCode,
          endAddressLine: params.endAddressLine,
          endCityName: params.endCityName,
          endZipCode: params.endZipCode,
          endCountryCode: params.endCountryCode,
          endName: params.endName,
          endGeoCode: params.endGeoCode,
          transferType: params.transferType,
          startDateTime: params.startDateTime,
          passengers: params.passengers,
        }
      );
    } catch (error) {
      console.error('TransferService:', error);
      throw error;
    }
  }
}

export default TransferService.getInstance();
