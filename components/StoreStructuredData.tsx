import StructuredData from "@/components/StructuredData";
import { getUpcomingSpecialDays } from "@/lib/business-calendar-server";

// 店舗（ClothingStore）の構造化データ。臨時休業・営業時間の変更を specialOpeningHoursSpecification で伝える
// （休業日は opens / closes を 00:00 にする）
export default async function StoreStructuredData() {
  const days = await getUpcomingSpecialDays();

  return (
    <StructuredData
      type="LocalBusiness"
      data={days.length > 0 ? {
        specialOpeningHoursSpecification: days.map((day) => ({
          "@type": "OpeningHoursSpecification",
          validFrom: day.date,
          validThrough: day.date,
          opens: day.closed ? "00:00" : day.opens,
          closes: day.closed ? "00:00" : day.closes,
        })),
      } : undefined}
    />
  );
}
