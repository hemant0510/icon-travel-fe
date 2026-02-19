import type { TransferOfferData } from '@/models/responses/TransferSearchResponse';
import type { Vehicle, VehicleCode, VehicleCategory, TransferType, CancellationRule } from '@/types/cab';

const categoryLabels: Record<string, string> = {
  ST: 'Standard',
  BU: 'Business',
  FC: 'First Class',
};

function parseDurationMinutes(isoDuration?: string): number | undefined {
  if (!isoDuration) return undefined;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

export function mapTransferOffersResponse(offers: TransferOfferData[]): Vehicle[] {
  if (!offers) return [];

  return offers.map((offer, index) => {
    const seatCount = offer.vehicle.seats?.[0]?.count ?? 0;
    const bagCount = offer.vehicle.baggages?.[0]?.count ?? 0;
    const price = parseFloat(offer.quotation.monetaryAmount);

    const cancellationRules: CancellationRule[] = (offer.cancellationRules ?? []).map(rule => ({
      ruleDescription: rule.ruleDescription,
      feeType: rule.feeType,
      feeValue: rule.feeValue,
      currencyCode: rule.currencyCode,
    }));

    return {
      id: offer.id || `transfer-${index}`,
      name: offer.vehicle.description,
      vehicleCode: offer.vehicle.code as VehicleCode,
      category: (offer.vehicle.category || 'ST') as VehicleCategory,
      categoryLabel: categoryLabels[offer.vehicle.category] ?? offer.vehicle.category,
      seats: seatCount,
      bags: bagCount,
      imageUrl: offer.vehicle.imageURL,
      price,
      currency: offer.quotation.currencyCode,
      provider: {
        name: offer.serviceProvider.name,
        logoUrl: offer.serviceProvider.logoUrl,
      },
      transferType: offer.transferType as TransferType,
      duration: offer.duration,
      durationMinutes: parseDurationMinutes(offer.duration),
      distance: offer.distance,
      cancellationRules,
    };
  });
}
