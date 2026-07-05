import { SocialProvider } from "./enums/SocialProvider";
import Milestone from "./classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";
import { ATTRIBUTION_URL } from "./constants";

/**
 * Generate share URL or text for the specified social provider
 * For Copy provider, returns the share text directly (not a URL)
 * 
 * Platform limitations:
 * - Facebook: Basic sharer only shares URL (custom text requires FB App integration)
 * - LinkedIn: Only shares URL (no custom text in public share API)
 * - Messenger: Link-only sharing via deep link
 * - Twitter, WhatsApp, SMS: Full text support ✓
 */
export function generateShareUrl(
  milestone: Milestone,
  label: string,
  provider: SocialProvider,
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null,
  locale: string
): string {
  // Build share text
  const formattedOriginalDate = originalDate ? originalDate.toLocaleString(locale) : "";

  // Determine the context phrase based on whether originalDate is today
  let contextPhrase = "Today's";
  if (originalDate) {
    const today = Temporal.Now.plainDateISO();
    const dateToCompare = 'toPlainDate' in originalDate 
      ? originalDate.toPlainDate() 
      : originalDate;

    if (Temporal.PlainDate.compare(dateToCompare, today) === 0) {
      // It's today
      contextPhrase = "Today's";
    } else if (Temporal.PlainDate.compare(dateToCompare, today) > 0) {
      // Future date
      contextPhrase = "On that day,";
    } else {
      // Past date
      contextPhrase = "On that day, it was";
    }
  }

  const shareText = `${contextPhrase} ${milestone.label} since ${label.trim()} (${formattedOriginalDate}) - Calculated with Jublio at ${ATTRIBUTION_URL}`;

  // Encode for URL usage
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(ATTRIBUTION_URL);

  // Generate provider-specific URL or return text
  switch (provider) {
    case SocialProvider.Facebook:
      // Facebook sharer.php - only shares URL (quote parameter not supported)
      // To include custom text, would need Facebook App ID and SDK integration
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case SocialProvider.Messenger:
      // Messenger share - link only
      return `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=&redirect_uri=${encodedUrl}`;

    case SocialProvider.WhatsApp:
      // WhatsApp - full text support
      return `https://wa.me/?text=${encodedText}`;

    case SocialProvider.Twitter:
      // Twitter/X - full text support
      return `https://twitter.com/intent/tweet?text=${encodedText}`;

    case SocialProvider.LinkedIn:
      // LinkedIn - URL only (summary not supported in public API)
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case SocialProvider.SMS:
      // SMS - full text support (works on mobile devices)
      return `sms:?&body=${encodedText}`;

    case SocialProvider.Copy:
      // Return the share text directly (no URL)
      return shareText;

    default:
      throw new Error(`Unsupported social provider: ${provider}`);
  }
}
